import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request, { requiredScope: 'import' })
    if (auth instanceof NextResponse) return auth
    const { userId } = auth

    const importData = await request.json()

    // 验证数据结构
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

    // 导入账户和资产（分批处理）
    const accountsBatchSize = 20
    for (let i = 0; i < importData.data.accounts.length; i += accountsBatchSize) {
      const batch = importData.data.accounts.slice(i, i + accountsBatchSize)
      try {
        const result = await prisma.$transaction(async (tx) => {
          let a = 0, as = 0, b = 0, d = 0, inv = 0
          for (const accountData of batch) {
            if (!accountData.name || typeof accountData.name !== 'string') {
              inv++
              continue
            }

            const existingAccount = await tx.account.findFirst({
              where: { userId, name: accountData.name }
            })

            let accountId
            if (existingAccount) {
              const updatedAccount = await tx.account.update({
                where: { id: existingAccount.id },
                data: {
                  type: accountData.type,
                  accountNumber: accountData.accountNumber,
                  initialBalance: accountData.initialBalance || 0
                }
              })
              accountId = updatedAccount.id
              d++
            } else {
              const newAccount = await tx.account.create({
                data: {
                  name: accountData.name,
                  type: accountData.type,
                  accountNumber: accountData.accountNumber,
                  initialBalance: accountData.initialBalance || 0,
                  userId
                }
              })
              accountId = newAccount.id
              a++
            }

            if (accountData.assets && Array.isArray(accountData.assets)) {
              for (const assetData of accountData.assets) {
                if (!assetData.name || typeof assetData.name !== 'string') {
                  inv++
                  continue
                }

                const existingAsset = await tx.asset.findFirst({
                  where: { accountId, name: assetData.name }
                })

                if (existingAsset) {
                  await tx.asset.update({
                    where: { id: existingAsset.id },
                    data: { type: assetData.type, amount: assetData.amount }
                  })
                  d++

                  if (assetData.balances && Array.isArray(assetData.balances)) {
                    for (const balanceData of assetData.balances) {
                      if (balanceData.amount === undefined || !balanceData.recordedAt) {
                        inv++
                        continue
                      }

                      const existingBalance = await tx.balance.findFirst({
                        where: {
                          assetId: existingAsset.id,
                          recordedAt: new Date(balanceData.recordedAt)
                        }
                      })

                      if (existingBalance) {
                        d++
                      } else {
                        await tx.balance.create({
                          data: {
                            amount: balanceData.amount,
                            recordedAt: new Date(balanceData.recordedAt),
                            assetId: existingAsset.id
                          }
                        })
                        b++
                      }
                    }
                  }
                } else {
                  const newAsset = await tx.asset.create({
                    data: {
                      name: assetData.name,
                      type: assetData.type,
                      amount: assetData.amount,
                      accountId
                    }
                  })
                  as++

                  if (assetData.balances && Array.isArray(assetData.balances)) {
                    for (const balanceData of assetData.balances) {
                      if (balanceData.amount === undefined || !balanceData.recordedAt) {
                        inv++
                        continue
                      }

                      const existingBalance = await tx.balance.findFirst({
                        where: {
                          assetId: newAsset.id,
                          recordedAt: new Date(balanceData.recordedAt)
                        }
                      })

                      if (existingBalance) {
                        d++
                      } else {
                        await tx.balance.create({
                          data: {
                            amount: balanceData.amount,
                            recordedAt: new Date(balanceData.recordedAt),
                            assetId: newAsset.id
                          }
                        })
                        b++
                      }
                    }
                  }
                }
              }
            }
          }
          return { accounts: a, assets: as, balances: b, duplicates: d, invalid: inv }
        })

        accountsCount += result.accounts
        assetsCount += result.assets
        balancesCount += result.balances
        duplicatesCount += result.duplicates
        invalidCount += result.invalid
      } catch (error) {
        console.error('处理账户批次失败:', error)
      }
    }

    // 导入收支记录
    if (importData.data.records && Array.isArray(importData.data.records)) {
      const batchSize = 50
      for (let i = 0; i < importData.data.records.length; i += batchSize) {
        const batch = importData.data.records.slice(i, i + batchSize)
        try {
          const result = await prisma.$transaction(async (tx) => {
            let r = 0, d = 0, inv = 0
            for (const recordData of batch) {
              const account = await tx.account.findFirst({
                where: { userId, name: recordData.account?.name }
              })

              if (!account) {
                inv++
                continue
              }

              if (!recordData.date || !recordData.amount || !recordData.type) {
                inv++
                continue
              }

              const existingRecord = await tx.record.findFirst({
                where: {
                  accountId: account.id,
                  date: new Date(recordData.date),
                  amount: recordData.amount,
                  type: recordData.type
                }
              })

              if (existingRecord) {
                d++
              } else {
                let assetId = null
                if (recordData.asset?.name) {
                  const asset = await tx.asset.findFirst({
                    where: { accountId: account.id, name: recordData.asset.name }
                  })
                  if (asset) assetId = asset.id
                }

                await tx.record.create({
                  data: {
                    date: new Date(recordData.date),
                    accountId: account.id,
                    assetId,
                    amount: recordData.amount,
                    type: recordData.type,
                    note: recordData.note || recordData.description || null
                  }
                })
                r++
              }
            }
            return { records: r, duplicates: d, invalid: inv }
          })

          recordsCount += result.records
          duplicatesCount += result.duplicates
          invalidCount += result.invalid
        } catch (error) {
          console.error('处理记录批次失败:', error)
        }
      }
    }

    // 导入快照（可选）
    if (importData.data.snapshots && Array.isArray(importData.data.snapshots)) {
      const batchSize = 50
      for (let i = 0; i < importData.data.snapshots.length; i += batchSize) {
        const batch = importData.data.snapshots.slice(i, i + batchSize)
        try {
          const result = await prisma.$transaction(async (tx) => {
            let s = 0
            for (const snapshotData of batch) {
              const account = await tx.account.findFirst({
                where: { userId, name: snapshotData.account?.name }
              })

              if (account) {
                let assetId = null
                if (snapshotData.asset?.name) {
                  const asset = await tx.asset.findFirst({
                    where: { accountId: account.id, name: snapshotData.asset.name }
                  })
                  if (asset) assetId = asset.id
                }

                const existingSnapshot = await tx.dailySnapshot.findFirst({
                  where: {
                    accountId: account.id,
                    assetId,
                    snapshotAt: new Date(snapshotData.snapshotAt)
                  }
                })

                if (!existingSnapshot) {
                  await tx.dailySnapshot.create({
                    data: {
                      accountId: account.id,
                      assetId,
                      amount: snapshotData.amount,
                      snapshotAt: new Date(snapshotData.snapshotAt)
                    }
                  })
                  s++
                }
              }
            }
            return { snapshots: s }
          })

          snapshotsCount += result.snapshots
        } catch (error) {
          console.error('处理快照批次失败:', error)
        }
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