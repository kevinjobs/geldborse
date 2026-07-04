/**
 * Shared test utility: computes account total from assets + records.
 *
 * Mirrors the core logic in app/accounts/page.tsx and app/overview/page.tsx
 * so both test files exercise the same function instead of duplicated inlines.
 */
export function testGetAccountTotal(assets: any[], records: any[]) {
  let total = 0
  let baseAmount = 0
  let recordsTotal = 0
  let hasBalance = false

  if (assets.length > 0) {
    for (const asset of assets) {
      if (asset.balances && asset.balances.length > 0) {
        const latestBalance = asset.balances[0]
        baseAmount += latestBalance.amount
        hasBalance = true
      } else {
        baseAmount += asset.amount || 0
      }
    }

    let latestBalanceTime: Date | null = null
    for (const asset of assets) {
      if (asset.balances && asset.balances.length > 0) {
        const balanceTime = new Date(asset.balances[0].recordedAt)
        if (!latestBalanceTime || balanceTime > latestBalanceTime) {
          latestBalanceTime = balanceTime
        }
      }
    }

    if (latestBalanceTime) {
      const latestBalanceTimeSec = Math.floor(latestBalanceTime.getTime() / 1000)
      const recordsAfterBalance = records.filter(record => {
        const recordTimeSec = Math.floor(new Date(record.date).getTime() / 1000)
        return recordTimeSec > latestBalanceTimeSec
      })
      recordsTotal = recordsAfterBalance.reduce((sum, r) => sum + r.amount, 0)
    } else {
      recordsTotal = records.reduce((sum, r) => sum + r.amount, 0)
    }
  } else {
    recordsTotal = records.reduce((sum, r) => sum + r.amount, 0)
  }

  total = baseAmount + recordsTotal
  return { total, baseAmount, recordsTotal, hasBalance }
}