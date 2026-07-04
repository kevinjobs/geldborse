"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import type { Account, Asset, DailySnapshot, Record, Balance } from "@/types"

export function useExportData() {
  const { user } = useAuth()
  const [snapshots, setSnapshots] = useState<DailySnapshot[]>([])
  const [accounts, setAccounts] = useState<(Account & { assets: Asset[]; totalAmount: number })[]>([])
  const [records, setRecords] = useState<Record[]>([])
  const [balances, setBalances] = useState<Balance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      const [snapshotsRes, accountsRes, recordsRes, balancesRes] = await Promise.all([
        fetch("/api/daily-snapshots", { credentials: 'include' }),
        fetch("/api/accounts", { credentials: 'include' }),
        fetch("/api/records", { credentials: 'include' }),
        fetch("/api/balances", { credentials: 'include' }),
      ])

      if (!snapshotsRes.ok) throw new Error(`Snapshots API error: ${snapshotsRes.status}`)
      if (!accountsRes.ok) throw new Error(`Accounts API error: ${accountsRes.status}`)
      if (!recordsRes.ok) throw new Error(`Records API error: ${recordsRes.status}`)
      if (!balancesRes.ok) throw new Error(`Balances API error: ${balancesRes.status}`)

      const snapshotsData = await snapshotsRes.json()
      const accountsData = await accountsRes.json()
      const recordsData = await recordsRes.json()
      const balancesData = await balancesRes.json()
      setSnapshots(Array.isArray(snapshotsData) ? snapshotsData : [])
      setAccounts(Array.isArray(accountsData) ? accountsData : [])
      setRecords(Array.isArray(recordsData) ? recordsData : [])
      setBalances(Array.isArray(balancesData) ? balancesData : [])
    } catch (error) {
      console.error("获取数据失败:", error)
    } finally {
      setLoading(false)
    }
  }

  return { snapshots, accounts, records, balances, loading, fetchData }
}
