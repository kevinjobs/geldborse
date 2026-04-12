import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request)
    if (!userId) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const importData = await request.json()

    // 验证数据结构
    if (!importData.data || !Array.isArray(importData.data.accounts)) {
      return NextResponse.json({ error: "无效的文件格式" }, { status: 400 })
    }

    let accountsCount = 0
    let assetsCount = 0
    let recordsCount = 0
    let duplicatesCount = 0
    let invalidCount = 0

    // 导入账户和资产（分批处理）
    const accountsBatchSize = 20 // 减少每批处理的账户数量
    for (let i = 0; i < importData.data.accounts.length; i += accountsBatchSize) {
      const batch = importData.data.accounts.slice(i, i + accountsBatchSize)
      // 为每个批次创建独立的事务
      try {
        await prisma.$transaction(async (tx) => {
          for (const accountData of batch) {
            // 跳过无效的账户数据
            if (!accountData.name || typeof accountData.name !== 'string') {
              invalidCount++
              continue
            }

            // 检查账户是否已存在
            const existingAccount = await tx.account.findFirst({
              where: {
                userId,
                name: accountData.name
              }
            })

            let accountId
            if (existingAccount) {
              // 更新现有账户
              const updatedAccount = await tx.account.update({
                where: { id: existingAccount.id },
                data: {
                  type: accountData.type,
                  accountNumber: accountData.accountNumber
                }
              })
              accountId = updatedAccount.id
              duplicatesCount++
            } else {
              // 创建新账户
              const newAccount = await tx.account.create({
                data: {
                  name: accountData.name,
                  type: accountData.type,
                  accountNumber: accountData.accountNumber,
                  initialBalance: 0,
                  userId
                }
              })
              accountId = newAccount.id
              accountsCount++
            }

            // 导入资产
            if (accountData.assets && Array.isArray(accountData.assets)) {
              for (const assetData of accountData.assets) {
                // 跳过无效的资产数据
                if (!assetData.name || typeof assetData.name !== 'string') {
                  invalidCount++
                  continue
                }

                // 检查资产是否已存在
                const existingAsset = await tx.asset.findFirst({
                  where: {
                    accountId,
                    name: assetData.name
                  }
                })

                if (existingAsset) {
                  // 更新现有资产
                  await tx.asset.update({
                    where: { id: existingAsset.id },
                    data: {
                      type: assetData.type,
                      amount: assetData.amount
                    }
                  })
                  duplicatesCount++
                } else {
                  // 创建新资产
                  await tx.asset.create({
                    data: {
                      name: assetData.name,
                      type: assetData.type,
                      amount: assetData.amount,
                      accountId
                    }
                  })
                  assetsCount++
                }
              }
            }
          }
        })
      } catch (error) {
        console.error('处理账户批次失败:', error)
        // 继续处理下一批次
      }
    }

    // 导入收支记录
    if (importData.data.records && Array.isArray(importData.data.records)) {
      // 分批处理记录，每批50条
      const batchSize = 50
      for (let i = 0; i < importData.data.records.length; i += batchSize) {
        const batch = importData.data.records.slice(i, i + batchSize)
        try {
          await prisma.$transaction(async (tx) => {
            for (const recordData of batch) {
              // 查找对应的账户
              const account = await tx.account.findFirst({
                where: {
                  userId,
                  name: recordData.account?.name
                }
              })

              if (!account) {
                invalidCount++
                continue
              }

              if (!recordData.date || !recordData.amount || !recordData.type) {
                invalidCount++
                continue
              }

              // 检查记录是否已存在
              const existingRecord = await tx.record.findFirst({
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
                // 查找对应的资产
                let assetId = null
                if (recordData.asset?.name) {
                  const asset = await tx.asset.findFirst({
                    where: {
                      accountId: account.id,
                      name: recordData.asset.name
                    }
                  })
                  if (asset) {
                    assetId = asset.id
                  }
                }

                // 创建新记录
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
                recordsCount++
              }
            }
          })
        } catch (error) {
          console.error('处理记录批次失败:', error)
          // 继续处理下一批次
        }
      }
    }

    // 导入快照（可选）
    if (importData.data.snapshots && Array.isArray(importData.data.snapshots)) {
      // 分批处理快照，每批50条
      const batchSize = 50
      for (let i = 0; i < importData.data.snapshots.length; i += batchSize) {
        const batch = importData.data.snapshots.slice(i, i + batchSize)
        try {
          await prisma.$transaction(async (tx) => {
            for (const snapshotData of batch) {
              // 查找对应的账户
              const account = await tx.account.findFirst({
                where: {
                  userId,
                  name: snapshotData.account?.name
                }
              })

              if (account) {
                // 查找对应的资产
                let assetId = null
                if (snapshotData.asset?.name) {
                  const asset = await tx.asset.findFirst({
                    where: {
                      accountId: account.id,
                      name: snapshotData.asset.name
                    }
                  })
                  if (asset) {
                    assetId = asset.id
                  }
                }

                // 检查快照是否已存在
                const existingSnapshot = await tx.dailySnapshot.findFirst({
                  where: {
                    accountId: account.id,
                    assetId,
                    snapshotAt: new Date(snapshotData.snapshotAt)
                  }
                })

                if (!existingSnapshot) {
                  // 创建新快照
                  await tx.dailySnapshot.create({
                    data: {
                      accountId: account.id,
                      assetId,
                      amount: snapshotData.amount,
                      snapshotAt: new Date(snapshotData.snapshotAt)
                    }
                  })
                }
              }
            }
          })
        } catch (error) {
          console.error('处理快照批次失败:', error)
          // 继续处理下一批次
        }
      }
    }

    return NextResponse.json({
      accounts: accountsCount,
      assets: assetsCount,
      records: recordsCount,
      duplicates: duplicatesCount,
      invalid: invalidCount
    })
  } catch (error) {
    console.error('导入数据失败:', error)
    return NextResponse.json({ error: "导入数据失败" }, { status: 500 })
  }
}
