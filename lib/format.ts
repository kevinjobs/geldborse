export function formatAmount(amount: number): string {
  return amount.toLocaleString("zh-CN", {
    style: "currency",
    currency: "CNY",
  })
}

export function formatAmountShort(amount: number): string {
  if (Math.abs(amount) >= 10000) {
    return `${(amount / 10000).toFixed(1)}万`
  }
  return amount.toFixed(0)
}
