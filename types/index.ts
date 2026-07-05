export interface Account {
  id: string
  name: string
  type: string
  accountNumber: string | null
  initialBalance: number
  archived?: boolean
  archivedAt?: string | null
  assets?: Asset[]
  totalAmount?: number
}

export interface Asset {
  id: string
  name: string
  type: string
  accountId: string
  amount: number | null
  balances: { amount: number; recordedAt: string }[]
}

export interface DailySnapshot {
  id: string
  snapshotAt: string
  accountId: string
  assetId: string | null
  amount: number
  account: Account
  asset: Asset | null
  createdAt: string
  updatedAt: string
}

export interface Record {
  id: string
  date: string
  type: string
  amount: number
  note: string | null
  accountId: string
  assetId: string | null
  account: Account
  asset?: { name: string } | null
}

export interface Balance {
  id: string
  amount: number
  recordedAt: string
  assetId: string
  createdAt: string
  updatedAt: string
}
