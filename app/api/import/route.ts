import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request, { requiredScope: 'import' })
    if (auth instanceof NextResponse) return auth
    const { userId } = auth

    const importData = await request.json()

    if (!importData.data || !Array.isArray(importData.data.accounts)) {
      return NextResponse.json({ error: "无效的文件格式" }, { status: 400 })
    }

    let accountsCount = 0
    let assetsCount = 0
    let recordsCount = 0
    let balancesCount = 0
    let snapshotsCount = 0
    let duplicatesCount = 0
    let invalidCount = 0

    // ── 导入账户和资产 ──
    for (const accountData of importData.data.accounts) {
      try {
        if (!accountData.name || typeof accountData.name !== 'string') {
          invalidCount++
          continue
        }

        const existingAccount = await prisma.account.findFirst({
          where: { userId, name: accountData.name }
        })

        let accountId
        if (existingAccount) {
          await prisma.account.update({
            where: { id: existingAccount.id },
            data: {
              type: accountData.type,
              accountNumber: accountData.accountNumber,
            }
          })
          accountId = existingAccount.id
          duplicatesCount++
        } else {
          const newAccount = await prisma.account.create({
            data: {
              name: accountData.name,
              type: accountData.type,
              accountNumber: accountData.accountNumber,
              userId
            }
          })
          accountId = newAccount.id
          accountsCount++
        }

        if (accountData.assets && Array.isArray(accountData.assets)) {
          for (const assetData of accountData.assets) {
            try {
              if (!assetData.name || typeof assetData.name !== 'string') {
                invalidCount++
                continue
              }

              const existingAsset = await prisma.asset.findFirst({
                where: { accountId, name: assetData.name }
              })

if (existingAsset) {
                  await prisma.asset.update({
                    where: { id: existingAsset.id },
                    data: { type: assetData.type, amount: assetData.amount }
                  })
                  duplicatesCount++

                  const result = await importBalances(prisma, existingAsset.id, assetData.balances)
                  balancesCount += result.created
                  duplicatesCount += result.duplicates
                  invalidCount += result.invalid
                } else {
                  const newAsset = await prisma.asset.create({
                    data: { name: assetData.name, type: assetData.type, amount: assetData.amount, accountId }
                  })
                  assetsCount++

                  // Ensure at least one balance snapshot exists
                  const balanceData = (assetData.balances && assetData.balances.length > 0)
                    ? assetData.balances
                    : [{ amount: assetData.amount || 0, recordedAt: newAsset.createdAt.toISOString() }]
                  const result = await importBalances(prisma, newAsset.id, balanceData)
                  balancesCount += result.created
                  duplicatesCount += result.duplicates
                  invalidCount += result.invalid
                }
            } catch (error) {
              console.error('处理资产失败:', error)
              invalidCount++
            }
          }
        }
      } catch (error) {
        console.error('处理账户失败:', error)
        invalidCount++
      }
    }

    // ── 导入收支记录 ──
    if (importData.data.records && Array.isArray(importData.data.records)) {
      for (const recordData of importData.data.records) {
        try {
          const account = await prisma.account.findFirst({
            where: { userId, name: recordData.account?.name }
          })
          if (!account) { invalidCount++; continue }
          if (!recordData.date || !recordData.amount || !recordData.type) { invalidCount++; continue }

          const existingRecord = await prisma.record.findFirst({
            where: {
              accountId: account.id,
              date: new Date(recordData.date),
              amount: recordData.amount,
              type: recordData.type
            }
          })

          if (existingRecord) {
            duplicatesCount++
          } else {
            let assetId = null
            if (recordData.asset?.name) {
              const asset = await prisma.asset.findFirst({
                where: { accountId: account.id, name: recordData.asset.name }
              })
              if (asset) assetId = asset.id
            }
            await prisma.record.create({
              data: {
                date: new Date(recordData.date),
                accountId: account.id,
                assetId,
                amount: recordData.amount,
                type: recordData.type,
                note: recordData.note || recordData.description || null
              }
            })
            recordsCount++
          }
        } catch (error) {
          console.error('处理记录失败:', error)
          invalidCount++
        }
      }
    }

    // ── 导入快照（批量） ──
    if (importData.data.snapshots && Array.isArray(importData.data.snapshots)) {
      const existingSnapshots = await prisma.dailySnapshot.findMany({
        where: { account: { userId } },
        select: { accountId: true, assetId: true, snapshotAt: true }
      })
      const existingSnapshotKeys = new Set(
        existingSnapshots.map(s => `${s.accountId}|${s.assetId || ''}|${s.snapshotAt.toISOString()}`)
      )

      const newSnapshotRecords: { accountId: string; assetId: string | null; amount: number; snapshotAt: Date }[] = []
      let snapInvalid = 0

      for (const snapshotData of importData.data.snapshots) {
        try {
          const account = await prisma.account.findFirst({
            where: { userId, name: snapshotData.account?.name }
          })
          if (!account) continue

          let assetId: string | null = null
          if (snapshotData.asset?.name) {
            const asset = await prisma.asset.findFirst({
              where: { accountId: account.id, name: snapshotData.asset.name }
            })
            if (asset) assetId = asset.id
          }

          const key = `${account.id}|${assetId || ''}|${new Date(snapshotData.snapshotAt).toISOString()}`
          if (existingSnapshotKeys.has(key)) {
            duplicatesCount++
          } else {
            newSnapshotRecords.push({
              accountId: account.id,
              assetId,
              amount: snapshotData.amount,
              snapshotAt: new Date(snapshotData.snapshotAt)
            })
            existingSnapshotKeys.add(key)
          }
        } catch (error) {
          console.error('处理快照失败:', error)
          snapInvalid++
        }
      }

      invalidCount += snapInvalid

      if (newSnapshotRecords.length > 0) {
        await prisma.dailySnapshot.createMany({ data: newSnapshotRecords })
        snapshotsCount += newSnapshotRecords.length
      }
    }

    return NextResponse.json({
      accounts: accountsCount,
      assets: assetsCount,
      records: recordsCount,
      balances: balancesCount,
      snapshots: snapshotsCount,
      duplicates: duplicatesCount,
      invalid: invalidCount
    })
  } catch (error) {
    console.error('导入数据失败:', error)
    return NextResponse.json({ error: "导入数据失败" }, { status: 500 })
  }
}

// 辅助函数：批量导入余额（1次查重查询 + 1次批量写入）
async function importBalances(
  client: typeof prisma,
  assetId: string,
  balanceDataList: { amount: number; recordedAt: string }[] | undefined
): Promise<{ created: number; duplicates: number; invalid: number }> {
  if (!balanceDataList || !Array.isArray(balanceDataList) || balanceDataList.length === 0) {
    return { created: 0, duplicates: 0, invalid: 0 }
  }

  const valid = balanceDataList.filter(b => b.amount !== undefined && b.recordedAt)
  const invalid = balanceDataList.length - valid.length

  if (valid.length === 0) return { created: 0, duplicates: 0, invalid }

  const existing = await client.balance.findMany({
    where: { assetId },
    select: { recordedAt: true }
  })
  const existingKeys = new Set(existing.map(b => b.recordedAt.toISOString()))

  const newBalances = valid.filter(b => !existingKeys.has(new Date(b.recordedAt).toISOString()))
  const duplicates = valid.length - newBalances.length

  if (newBalances.length > 0) {
    await client.balance.createMany({
      data: newBalances.map(b => ({
        amount: b.amount,
        recordedAt: new Date(b.recordedAt),
        assetId
      }))
    })
  }

  return { created: newBalances.length, duplicates, invalid }
}