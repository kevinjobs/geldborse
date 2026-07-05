export interface Account {
  id: string
  name: string
  type: string
  accountNumber: string | null
  initialBalance: number
  archived?: boolean
  archivedAt?: string | null
  excludeFromTotal?: boolean
  createdAt?: string
  updatedAt?: string
  _count?: {
    records: number
    assets: number
  }
}

export interface Asset {
  id: string
  name: string
  type: string
  amount: number
  accountId: string
  createdAt?: string
  updatedAt?: string
  balances?: Balance[]
}

export interface Balance {
  id: string
  amount: number
  recordedAt: string
  assetId: string
  asset?: Asset
  createdAt?: string
  updatedAt?: string
}
