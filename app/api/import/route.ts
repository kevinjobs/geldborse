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

    // 导入账户和资产（逐条处理，避免 Neon 事务超时限制）
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
          const updatedAccount = await prisma.account.update({
            where: { id: existingAccount.id },
            data: {
              type: accountData.type,
              accountNumber: accountData.accountNumber,
              initialBalance: accountData.initialBalance || 0
            }
          })
          accountId = updatedAccount.id
          duplicatesCount++
        } else {
          const newAccount = await prisma.account.create({
            data: {
              name: accountData.name,
              type: accountData.type,
              accountNumber: accountData.accountNumber,
              initialBalance: accountData.initialBalance || 0,
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

                if (assetData.balances && Array.isArray(assetData.balances)) {
                  for (const balanceData of assetData.balances) {
                    try {
                      if (balanceData.amount === undefined || !balanceData.recordedAt) {
                        invalidCount++
                        continue
                      }

                      const existingBalance = await prisma.balance.findFirst({
                        where: {
                          assetId: existingAsset.id,
                          recordedAt: new Date(balanceData.recordedAt)
                        }
                      })

                      if (existingBalance) {
                        duplicatesCount++
                      } else {
                        await prisma.balance.create({
                          data: {
                            amount: balanceData.amount,
                            recordedAt: new Date(balanceData.recordedAt),
                            assetId: existingAsset.id
                          }
                        })
                        balancesCount++
                      }
                    } catch (error) {
                      console.error('处理余额失败:', error)
                      invalidCount++
                    }
                  }
                }
              } else {
                const newAsset = await prisma.asset.create({
                  data: {
                    name: assetData.name,
                    type: assetData.type,
                    amount: assetData.amount,
                    accountId
                  }
                })
                assetsCount++

                if (assetData.balances && Array.isArray(assetData.balances)) {
                  for (const balanceData of assetData.balances) {
                    try {
                      if (balanceData.amount === undefined || !balanceData.recordedAt) {
                        invalidCount++
                        continue
                      }

                      const existingBalance = await prisma.balance.findFirst({
                        where: {
                          assetId: newAsset.id,
                          recordedAt: new Date(balanceData.recordedAt)
                        }
                      })

                      if (existingBalance) {
                        duplicatesCount++
                      } else {
                        await prisma.balance.create({
                          data: {
                            amount: balanceData.amount,
                            recordedAt: new Date(balanceData.recordedAt),
                            assetId: newAsset.id
                          }
                        })
                        balancesCount++
                      }
                    } catch (error) {
                      console.error('处理余额失败:', error)
                      invalidCount++
                    }
                  }
                }
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

    // 导入收支记录
    if (importData.data.records && Array.isArray(importData.data.records)) {
      for (const recordData of importData.data.records) {
        try {
          const account = await prisma.account.findFirst({
            where: { userId, name: recordData.account?.name }
          })

          if (!account) {
            invalidCount++
            continue
          }

          if (!recordData.date || !recordData.amount || !recordData.type) {
            invalidCount++
            continue
          }

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

    // 导入快照
    if (importData.data.snapshots && Array.isArray(importData.data.snapshots)) {
      for (const snapshotData of importData.data.snapshots) {
        try {
          const account = await prisma.account.findFirst({
            where: { userId, name: snapshotData.account?.name }
          })

          if (account) {
            let assetId = null
            if (snapshotData.asset?.name) {
              const asset = await prisma.asset.findFirst({
                where: { accountId: account.id, name: snapshotData.asset.name }
              })
              if (asset) assetId = asset.id
            }

            const existingSnapshot = await prisma.dailySnapshot.findFirst({
              where: {
                accountId: account.id,
                assetId,
                snapshotAt: new Date(snapshotData.snapshotAt)
              }
            })

            if (!existingSnapshot) {
              await prisma.dailySnapshot.create({
                data: {
                  accountId: account.id,
                  assetId,
                  amount: snapshotData.amount,
                  snapshotAt: new Date(snapshotData.snapshotAt)
                }
              })
              snapshotsCount++
            }
          }
        } catch (error) {
          console.error('处理快照失败:', error)
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