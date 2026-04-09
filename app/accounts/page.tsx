"use client"

import { useState, useEffect, Fragment } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveTable, ResponsiveTableBody, ResponsiveTableCell, ResponsiveTableHeader, ResponsiveTableRow } from "@/components/responsive-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  getAccountNameColor,
  getAccountTypeConfig,
  getAssetTypeConfig,
  ACCOUNT_TYPE_CONFIG,
  ASSET_TYPE_CONFIG,
  AccountDisplay
} from "@/lib/account-config"

interface Account {
  id: string
  name: string
  type: string
  accountNumber: string | null
  initialBalance: number
  createdAt: string
  updatedAt: string
  _count?: {
    records: number
    assets: number
  }
}

interface Asset {
  id: string
  name: string
  type: string
  amount: number
  accountId: string
  createdAt: string
  updatedAt: string
}

interface Balance {
  id: string
  amount: number
  recordedAt: string
  assetId: string
  asset?: Asset
  createdAt: string
  updatedAt: string
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [assetDialogOpen, setAssetDialogOpen] = useState(false)
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null)
  const [accountName, setAccountName] = useState("")
  const [accountType, setAccountType] = useState("CASH")
  const [accountNumber, setAccountNumber] = useState("")
  const [initialBalance, setInitialBalance] = useState("")
  const [saving, setSaving] = useState(false)

  // 新建账户时的资产信息
  const [newAssetName, setNewAssetName] = useState("")
  const [newAssetType, setNewAssetType] = useState("DEPOSIT")
  const [newAssetAmount, setNewAssetAmount] = useState("")

  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set())
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set())
  const [accountAssets, setAccountAssets] = useState<Record<string, Asset[]>>({})
  const [assetBalances, setAssetBalances] = useState<Record<string, Balance[]>>({})

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [assets, setAssets] = useState<Asset[]>([])
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [assetName, setAssetName] = useState("")
  const [assetType, setAssetType] = useState("DEPOSIT")
  const [assetAmount, setAssetAmount] = useState("")

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [balances, setBalances] = useState<Balance[]>([])
  const [editingBalance, setEditingBalance] = useState<Balance | null>(null)
  const [balanceAmount, setBalanceAmount] = useState("")
  const [balanceDate, setBalanceDate] = useState("")

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      // 获取用户认证信息
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('geldborse_user') : null
      const userData = storedUser ? JSON.parse(storedUser) : null
      const authToken = userData?.id // 使用用户ID作为临时token

      // 构建请求头
      const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : undefined

      const res = await fetch("/api/accounts", headers ? { headers } : {})
      const data = await res.json()
      // 确保data是一个数组
      if (Array.isArray(data)) {
        setAccounts(data)
        
        // 为每个账户获取资产和余额快照
        const newAccountAssets: { [key: string]: Asset[] } = {}
        const newAssetBalances: { [key: string]: Balance[] } = {}
        
        for (const account of data) {
          try {
            // 获取账户的资产列表
            const assetsRes = await fetch(`/api/assets?accountId=${account.id}`, headers ? { headers } : {})
            const assetsData = await assetsRes.json()
            if (Array.isArray(assetsData)) {
              newAccountAssets[account.id] = assetsData
              
              // 为每个资产获取余额快照列表
              for (const asset of assetsData) {
                try {
                  const balancesRes = await fetch(`/api/balances?assetId=${asset.id}`, headers ? { headers } : {})
                  const balancesData = await balancesRes.json()
                  if (Array.isArray(balancesData)) {
                    newAssetBalances[asset.id] = balancesData
                  }
                } catch (error) {
                  console.error(`获取资产 ${asset.id} 的余额快照失败:`, error)
                }
              }
            }
          } catch (error) {
            console.error(`获取账户 ${account.id} 的资产列表失败:`, error)
          }
        }
        
        // 更新状态
        setAccountAssets(newAccountAssets)
        setAssetBalances(newAssetBalances)
      } else {
        console.error("获取账户列表失败: 响应数据不是数组")
        setAccounts([])
      }
    } catch (error) {
      console.error("获取账户列表失败:", error)
      setAccounts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAssets = async (accountId: string) => {
    try {
      // 获取用户认证信息
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('geldborse_user') : null
      const userData = storedUser ? JSON.parse(storedUser) : null
      const authToken = userData?.id // 使用用户ID作为临时token

      // 构建请求头
      const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : undefined

      const res = await fetch(`/api/assets?accountId=${accountId}`, headers ? { headers } : {})
      const data = await res.json()
      // 确保data是一个数组
      if (Array.isArray(data)) {
        setAssets(data)
      } else {
        console.error("获取资产列表失败: 响应数据不是数组")
        setAssets([])
      }
    } catch (error) {
      console.error("获取资产列表失败:", error)
      setAssets([])
    }
  }

  const fetchBalances = async (assetId: string) => {
    try {
      // 获取用户认证信息
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('geldborse_user') : null
      const userData = storedUser ? JSON.parse(storedUser) : null
      const authToken = userData?.id // 使用用户ID作为临时token

      // 构建请求头
      const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : undefined

      const res = await fetch(`/api/balances?assetId=${assetId}`, headers ? { headers } : {})
      const data = await res.json()
      // 确保data是一个数组
      if (Array.isArray(data)) {
        setBalances(data)
      } else {
        console.error("获取余额快照列表失败: 响应数据不是数组")
        setBalances([])
      }
    } catch (error) {
      console.error("获取余额快照列表失败:", error)
      setBalances([])
    }
  }

  const toggleAccountExpand = async (accountId: string) => {
    setExpandedAccounts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(accountId)) {
        newSet.delete(accountId)
      } else {
        newSet.add(accountId)
        if (!accountAssets[accountId]) {
          // 获取用户认证信息
          const storedUser = typeof window !== 'undefined' ? localStorage.getItem('geldborse_user') : null
          const userData = storedUser ? JSON.parse(storedUser) : null
          const authToken = userData?.id // 使用用户ID作为临时token

          // 构建请求头
          const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : undefined

          fetch(`/api/assets?accountId=${accountId}`, headers ? { headers } : {})
            .then((res) => res.json())
            .then((data) => {
              // 确保data是一个数组
              if (Array.isArray(data)) {
                setAccountAssets((prev) => ({ ...prev, [accountId]: data }))
              } else {
                console.error("获取资产列表失败: 响应数据不是数组")
                setAccountAssets((prev) => ({ ...prev, [accountId]: [] }))
              }
            })
            .catch((error) => {
              console.error("获取资产列表失败:", error)
              setAccountAssets((prev) => ({ ...prev, [accountId]: [] }))
            })
        }
      }
      return newSet
    })
  }

  const toggleAssetExpand = async (assetId: string) => {
    setExpandedAssets((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(assetId)) {
        newSet.delete(assetId)
      } else {
        newSet.add(assetId)
        if (!assetBalances[assetId]) {
          // 获取用户认证信息
          const storedUser = typeof window !== 'undefined' ? localStorage.getItem('geldborse_user') : null
          const userData = storedUser ? JSON.parse(storedUser) : null
          const authToken = userData?.id // 使用用户ID作为临时token

          // 构建请求头
          const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : undefined

          fetch(`/api/balances?assetId=${assetId}`, headers ? { headers } : {})
            .then((res) => res.json())
            .then((data) => {
              // 确保data是一个数组
              if (Array.isArray(data)) {
                setAssetBalances((prev) => ({ ...prev, [assetId]: data }))
              } else {
                console.error("获取余额快照列表失败: 响应数据不是数组")
                setAssetBalances((prev) => ({ ...prev, [assetId]: [] }))
              }
            })
            .catch((error) => {
              console.error("获取余额快照列表失败:", error)
              setAssetBalances((prev) => ({ ...prev, [assetId]: [] }))
            })
        }
      }
      return newSet
    })
  }

  const handleAdd = () => {
    setEditingAccount(null)
    setAccountName("")
    setAccountType("CASH")
    setAccountNumber("")
    setInitialBalance("")
    setNewAssetName("")
    setNewAssetType("DEPOSIT")
    setNewAssetAmount("")
    setDialogOpen(true)
  }

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setAccountName(account.name)
    setAccountType(account.type)
    setAccountNumber(account.accountNumber || "")
    setInitialBalance(account.initialBalance.toString())
    setDialogOpen(true)
  }

  const handleDelete = (account: Account) => {
    setDeletingAccount(account)
    setDeleteDialogOpen(true)
  }

  const handleSave = async () => {
    if (!accountName.trim()) {
      alert("请输入账户名称")
      return
    }

    // 新建账户时必须填写资产信息
    if (!editingAccount) {
      if (!newAssetName.trim()) {
        alert("请至少添加一个资产，填写资产名称")
        return
      }
      if (!newAssetAmount || parseFloat(newAssetAmount) === 0) {
        alert("请填写资产金额")
        return
      }
    }

    // 获取用户认证信息
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('geldborse_user') : null
    const userData = storedUser ? JSON.parse(storedUser) : null
    const authToken = userData?.id // 使用用户ID作为临时token

    // 构建请求头
    const headers: HeadersInit = authToken ? {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    } : {
      'Content-Type': 'application/json'
    }

    setSaving(true)
    try {
      if (editingAccount) {
        const res = await fetch(`/api/accounts/${editingAccount.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ name: accountName, type: accountType, accountNumber, initialBalance }),
        })
        if (res.ok) {
          fetchAccounts()
          setDialogOpen(false)
        } else {
          alert("更新失败")
        }
      } else {
        // 创建账户并同时创建资产
        const res = await fetch("/api/accounts", {
          method: "POST",
          headers,
          body: JSON.stringify({
            name: accountName,
            type: accountType,
            accountNumber,
            initialBalance,
            assets: [{
              name: newAssetName,
              type: newAssetType,
              amount: parseFloat(newAssetAmount) || 0
            }]
          }),
        })
        if (res.ok) {
          fetchAccounts()
          setDialogOpen(false)
        } else {
          alert("创建失败")
        }
      }
    } catch (error) {
      console.error("保存失败:", error)
      alert("保存失败")
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingAccount) return

    // 获取用户认证信息
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('geldborse_user') : null
    const userData = storedUser ? JSON.parse(storedUser) : null
    const authToken = userData?.id // 使用用户ID作为临时token

    // 构建请求头
    const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : undefined

    setSaving(true)
    try {
      const res = await fetch(`/api/accounts/${deletingAccount.id}`, {
        method: "DELETE",
        headers
      })
      if (res.ok) {
        fetchAccounts()
        setDeleteDialogOpen(false)
      } else {
        const data = await res.json()
        alert(data.error || "删除失败")
      }
    } catch (error) {
      console.error("删除失败:", error)
      alert("删除失败")
    } finally {
      setSaving(false)
    }
  }

  const handleViewAssets = (account: Account) => {
    setSelectedAccount(account)
    setSelectedAsset(null)
    fetchAssets(account.id)
  }

  const handleAddAsset = () => {
    setEditingAsset(null)
    setAssetName("")
    setAssetType("DEPOSIT")
    setAssetAmount("")
    setAssetDialogOpen(true)
  }

  const handleEditAsset = async (asset: Asset) => {
    setEditingAsset(asset)
    setAssetName(asset.name)
    setAssetType(asset.type)
    setAssetAmount(asset.amount.toString())
    if (!assetBalances[asset.id]) {
      // 获取用户认证信息
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('geldborse_user') : null
      const userData = storedUser ? JSON.parse(storedUser) : null
      const authToken = userData?.id // 使用用户ID作为临时token

      // 构建请求头
      const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : undefined

      const res = await fetch(`/api/balances?assetId=${asset.id}`, headers ? { headers } : {})
      const data = await res.json()
      setAssetBalances((prev) => ({ ...prev, [asset.id]: data }))
    }
    setAssetDialogOpen(true)
  }

  const handleDeleteAsset = async (asset: Asset) => {
    if (!confirm(`确定要删除资产 "${asset.name}" 吗？`)) return

    // 获取用户认证信息
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('geldborse_user') : null
    const userData = storedUser ? JSON.parse(storedUser) : null
    const authToken = userData?.id // 使用用户ID作为临时token

    // 构建请求头
    const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : undefined

    try {
      const res = await fetch(`/api/assets/${asset.id}`, {
        method: "DELETE",
        headers
      })
      if (res.ok) {
        if (selectedAccount) {
          fetchAssets(selectedAccount.id)
        }
        const assetsRes = await fetch(`/api/assets?accountId=${asset.accountId}`, headers ? { headers } : {})
        const assetsData = await assetsRes.json()
        setAccountAssets((prev) => ({ ...prev, [asset.accountId]: assetsData }))
        fetchAccounts()
        if (selectedAsset?.id === asset.id) {
          setSelectedAsset(null)
        }
      } else {
        alert("删除失败")
      }
    } catch (error) {
      console.error("删除失败:", error)
      alert("删除失败")
    }
  }

  const handleSaveAsset = async () => {
    if (!assetName.trim()) {
      alert("请输入资产名称")
      return
    }

    // 获取用户认证信息
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('geldborse_user') : null
    const userData = storedUser ? JSON.parse(storedUser) : null
    const authToken = userData?.id // 使用用户ID作为临时token

    // 构建请求头
    const headers: HeadersInit = authToken ? {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    } : {
      'Content-Type': 'application/json'
    }

    setSaving(true)
    try {
      if (editingAsset) {
        const res = await fetch(`/api/assets/${editingAsset.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ name: assetName, type: assetType, amount: assetAmount }),
        })
        if (res.ok) {
          if (selectedAccount) {
            fetchAssets(selectedAccount.id)
          }
          if (editingAsset.accountId) {
            const assetsRes = await fetch(`/api/assets?accountId=${editingAsset.accountId}`, authToken ? { headers: { 'Authorization': `Bearer ${authToken}` } } : {})
            const assetsData = await assetsRes.json()
            setAccountAssets((prev) => ({ ...prev, [editingAsset.accountId]: assetsData }))
          }
          const balancesRes = await fetch(`/api/balances?assetId=${editingAsset.id}`, authToken ? { headers: { 'Authorization': `Bearer ${authToken}` } } : {})
          const balancesData = await balancesRes.json()
          setAssetBalances((prev) => ({ ...prev, [editingAsset.id]: balancesData }))
          fetchAccounts()
          setAssetDialogOpen(false)
        } else {
          alert("更新失败")
        }
      } else {
        const res = await fetch("/api/assets", {
          method: "POST",
          headers,
          body: JSON.stringify({ name: assetName, type: assetType, amount: assetAmount, accountId: selectedAccount!.id }),
        })
        if (res.ok) {
          fetchAssets(selectedAccount!.id)
          const assetsRes = await fetch(`/api/assets?accountId=${selectedAccount!.id}`, authToken ? { headers: { 'Authorization': `Bearer ${authToken}` } } : {})
          const assetsData = await assetsRes.json()
          setAccountAssets((prev) => ({ ...prev, [selectedAccount!.id]: assetsData }))
          fetchAccounts()
          setAssetDialogOpen(false)
        } else {
          alert("创建失败")
        }
      }
    } catch (error) {
      console.error("保存失败:", error)
      alert("保存失败")
    } finally {
      setSaving(false)
    }
  }

  const handleViewBalances = (asset: Asset) => {
    setSelectedAsset(asset)
    fetchBalances(asset.id)
  }

  const handleAddBalance = () => {
    setEditingBalance(null)
    setBalanceAmount("")
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    setBalanceDate(`${year}-${month}-${day}T${hours}:${minutes}`)
    setBalanceDialogOpen(true)
  }

  const handleEditBalance = (balance: Balance) => {
    setEditingBalance(balance)
    setBalanceAmount(balance.amount.toString())
    const date = new Date(balance.recordedAt)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    setBalanceDate(`${year}-${month}-${day}T${hours}:${minutes}`)
    setBalanceDialogOpen(true)
  }

  const handleDeleteBalance = async (balance: Balance) => {
    if (!confirm("确定要删除此余额快照吗？")) return

    // 获取用户认证信息
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('geldborse_user') : null
    const userData = storedUser ? JSON.parse(storedUser) : null
    const authToken = userData?.id // 使用用户ID作为临时token

    // 构建请求头
    const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : undefined

    try {
      const res = await fetch(`/api/balances/${balance.id}`, {
        method: "DELETE",
        headers
      })
      if (res.ok) {
        if (selectedAsset) {
          fetchBalances(selectedAsset.id)
        }
        const balancesRes = await fetch(`/api/balances?assetId=${balance.assetId}`, headers ? { headers } : {})
        const balancesData = await balancesRes.json()
        setAssetBalances((prev) => ({ ...prev, [balance.assetId]: balancesData }))
      } else {
        alert("删除失败")
      }
    } catch (error) {
      console.error("删除失败:", error)
      alert("删除失败")
    }
  }

  const handleSaveBalance = async () => {
    if (!balanceAmount || !balanceDate) {
      alert("请填写金额和时间")
      return
    }

    // 获取用户认证信息
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('geldborse_user') : null
    const userData = storedUser ? JSON.parse(storedUser) : null
    const authToken = userData?.id // 使用用户ID作为临时token

    // 构建请求头
    const headers: HeadersInit = authToken ? {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    } : {
      'Content-Type': 'application/json'
    }

    setSaving(true)
    try {
      if (editingBalance) {
        const res = await fetch(`/api/balances/${editingBalance.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ amount: balanceAmount, recordedAt: balanceDate }),
        })
        if (res.ok) {
          if (selectedAsset) {
            fetchBalances(selectedAsset.id)
          }
          if (editingBalance.assetId) {
            const balancesRes = await fetch(`/api/balances?assetId=${editingBalance.assetId}`, authToken ? { headers: { 'Authorization': `Bearer ${authToken}` } } : {})
            const balancesData = await balancesRes.json()
            setAssetBalances((prev) => ({ ...prev, [editingBalance.assetId]: balancesData }))
            // 重新获取账户列表，更新账户总额
            fetchAccounts()
          }
          setBalanceDialogOpen(false)
        } else {
          alert("更新失败")
        }
      } else {
        const res = await fetch("/api/balances", {
          method: "POST",
          headers,
          body: JSON.stringify({ amount: balanceAmount, recordedAt: balanceDate, assetId: selectedAsset!.id }),
        })
        if (res.ok) {
          if (selectedAsset) {
            fetchBalances(selectedAsset.id)
            const balancesRes = await fetch(`/api/balances?assetId=${selectedAsset.id}`, authToken ? { headers: { 'Authorization': `Bearer ${authToken}` } } : {})
            const balancesData = await balancesRes.json()
            setAssetBalances((prev) => ({ ...prev, [selectedAsset.id]: balancesData }))
            // 重新获取账户列表，更新账户总额
            fetchAccounts()
          }
          setBalanceDialogOpen(false)
        } else {
          alert("创建失败")
        }
      }
    } catch (error) {
      console.error("保存失败:", error)
      alert("保存失败")
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("zh-CN")
  }

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("zh-CN")
  }

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("zh-CN", {
      style: "currency",
      currency: "CNY",
    })
  }

  const getLatestBalanceAmount = (assetId: string, defaultAmount: number): number => {
    const balanceList = assetBalances[assetId] || []
    if (balanceList.length === 0) {
      return defaultAmount
    }
    const sortedBalances = [...balanceList].sort(
      (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    )
    return sortedBalances[0].amount
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="sidebar" />
      <SidebarInset>
        <SiteHeader />
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <p>加载中...</p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-y-auto" style={{ scrollbarGutter: "stable" }}>
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-4 lg:px-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>账户管理</CardTitle>
                        <CardDescription>管理您的财务账户、资产和余额快照</CardDescription>
                      </div>
                      <Button onClick={handleAdd}>添加账户</Button>
                    </CardHeader>
                    <CardContent className="min-h-[300px]">
                      {/* 桌面端表格视图 */}
                      <div className="hidden md:block">
                        <ResponsiveTable className="select-none">
                          <thead>
                            <ResponsiveTableRow>
                              <ResponsiveTableHeader>名称</ResponsiveTableHeader>
                              <ResponsiveTableHeader>账户号码</ResponsiveTableHeader>
                              <ResponsiveTableHeader className="text-right">总资产</ResponsiveTableHeader>
                              <ResponsiveTableHeader className="text-right">最新快照总额</ResponsiveTableHeader>
                              <ResponsiveTableHeader className="text-right">收支总额</ResponsiveTableHeader>
                              <ResponsiveTableHeader className="text-center">收支数</ResponsiveTableHeader>
                              <ResponsiveTableHeader className="text-center">资产数</ResponsiveTableHeader>
                              <ResponsiveTableHeader className="text-right">操作</ResponsiveTableHeader>
                            </ResponsiveTableRow>
                          </thead>
                          <ResponsiveTableBody>
                            {accounts.length === 0 ? (
                              <ResponsiveTableRow>
                                <ResponsiveTableCell colSpan={8} className="text-center text-muted-foreground">
                                  暂无账户
                                </ResponsiveTableCell>
                              </ResponsiveTableRow>
                            ) : (
                              accounts.map((account) => {
                                const nameColor = getAccountNameColor(account.name)
                                const isExpanded = expandedAccounts.has(account.id)
                                const hasAssets = (account._count?.assets || 0) > 0
                                const accountAssetList = accountAssets[account.id] || []
                                const totalAmount = (account as { totalAmount?: number }).totalAmount || 0
                                const isNegative = totalAmount < 0
                                const recordsAfterBalanceTotal = (account as { recordsAfterBalanceTotal?: number }).recordsAfterBalanceTotal || 0
                                const latestSnapshotTotal = (account as { latestSnapshotTotal?: number }).latestSnapshotTotal || 0
                                // 检测当前是否为深色模式
                                const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
                                // 根据主题选择背景颜色
                                const bgColor = isDarkMode ? nameColor.darkBgColor : nameColor.bgColor
                                return (
                                  <Fragment key={account.id}>
                                    <ResponsiveTableRow
                                      className={`${bgColor} ${hasAssets ? "cursor-pointer hover:brightness-95 transition-all" : ""}`}
                                      onClick={() => hasAssets && toggleAccountExpand(account.id)}
                                    >
                                      <ResponsiveTableCell mobileLabel="名称" className="py-3">
                                        <div className="flex items-center gap-2">
                                          {hasAssets && (
                                            <span className="w-4 h-4 flex items-center justify-center shrink-0">
                                              {isExpanded ? (
                                                <ChevronDown className="h-4 w-4" />
                                              ) : (
                                                <ChevronRight className="h-4 w-4" />
                                              )}
                                            </span>
                                          )}
                                          {!hasAssets && <span className="w-4 shrink-0" />}
                                          <AccountDisplay name={account.name} type={account.type} variant="table" />
                                        </div>
                                      </ResponsiveTableCell>
                                      <ResponsiveTableCell mobileLabel="账户号码">{account.accountNumber || "-"}</ResponsiveTableCell>
                                      <ResponsiveTableCell mobileLabel="总资产" className={`text-right font-medium ${isNegative ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                                        {formatAmount(totalAmount)}
                                      </ResponsiveTableCell>
                                      <ResponsiveTableCell mobileLabel="最新快照总额" className="text-right text-muted-foreground">
                                        {formatAmount(latestSnapshotTotal)}
                                      </ResponsiveTableCell>
                                      <ResponsiveTableCell mobileLabel="收支总额" className={`text-right ${recordsAfterBalanceTotal < 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                                        {formatAmount(recordsAfterBalanceTotal)}
                                      </ResponsiveTableCell>
                                      <ResponsiveTableCell mobileLabel="收支数" className="text-center">{account._count?.records || 0}</ResponsiveTableCell>
                                      <ResponsiveTableCell mobileLabel="资产数" className="text-center">{account._count?.assets || 0}</ResponsiveTableCell>
                                      <ResponsiveTableCell mobileLabel="操作" className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex flex-row flex-wrap gap-1 justify-end">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300"
                                            onClick={() => {
                                              setSelectedAccount(account)
                                              handleAddAsset()
                                            }}
                                          >
                                            <Plus className="h-3.5 w-3.5 mr-1" />
                                            添加资产
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(account)}
                                          >
                                            <Pencil className="h-3.5 w-3.5 mr-1" />
                                            编辑
                                          </Button>
                                          <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(account)}
                                          >
                                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                                            删除
                                          </Button>
                                        </div>
                                      </ResponsiveTableCell>
                                    </ResponsiveTableRow>
                                    {isExpanded && accountAssetList.map((asset, assetIndex) => {
                                      const assetTypeConfig = getAssetTypeConfig(asset.type)
                                      const AssetIcon = assetTypeConfig.icon
                                      const isAssetExpanded = expandedAssets.has(asset.id)
                                      const isLastAsset = assetIndex === accountAssetList.length - 1
                                      const assetBalanceList = assetBalances[asset.id] || []
                                      return (
                                        <Fragment key={asset.id}>
                                          <ResponsiveTableRow
                                            className="bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                                            onClick={() => toggleAssetExpand(asset.id)}
                                          >
                                            <ResponsiveTableCell mobileLabel="名称" className="relative py-3">
                                              {!isLastAsset && (
                                                <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />
                                              )}
                                              {isLastAsset && (
                                                <div className="absolute left-4 top-0 h-1/2 w-px bg-slate-200 dark:bg-slate-700" />
                                              )}
                                              <div className="absolute left-4 top-1/2 w-3 h-px bg-slate-200 dark:bg-slate-700" />
                                              <div className="pl-10 flex items-center gap-2">
                                                <span className="w-4 h-4 flex items-center justify-center shrink-0">
                                                  {isAssetExpanded ? (
                                                    <ChevronDown className="h-3 w-3" />
                                                  ) : (
                                                    <ChevronRight className="h-3 w-3" />
                                                  )}
                                                </span>
                                                <span className="text-sm text-slate-600 dark:text-slate-300">{asset.name}</span>
                                                <Badge className="gap-1 text-xs font-normal">
                                                  <AssetIcon className="h-3 w-3" />
                                                  {assetTypeConfig.label}
                                                </Badge>
                                              </div>
                                            </ResponsiveTableCell>
                                            <ResponsiveTableCell mobileLabel="金额" className="text-right">{formatAmount(getLatestBalanceAmount(asset.id, asset.amount))}</ResponsiveTableCell>
                                            <ResponsiveTableCell />
                                            <ResponsiveTableCell />
                                            <ResponsiveTableCell />
                                            <ResponsiveTableCell mobileLabel="操作" className="text-right" onClick={(e) => e.stopPropagation()}>
                                              <div className="flex flex-row flex-wrap gap-1 justify-end">
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                                  onClick={() => {
                                                    setSelectedAccount(account)
                                                    setSelectedAsset(asset)
                                                    handleAddBalance()
                                                  }}
                                                >
                                                  <Plus className="h-3 w-3 mr-1" />
                                                  快照
                                                </Button>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => handleEditAsset(asset)}
                                                >
                                                  <Pencil className="h-3.5 w-3.5 mr-1" />
                                                  编辑
                                                </Button>
                                                <Button
                                                  variant="destructive"
                                                  size="sm"
                                                  onClick={() => handleDeleteAsset(asset)}
                                                >
                                                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                                                  删除
                                                </Button>
                                              </div>
                                            </ResponsiveTableCell>
                                          </ResponsiveTableRow>
                                          {isAssetExpanded && assetBalanceList.map((balance, balanceIndex) => {
                                            const isLastBalance = balanceIndex === assetBalanceList.length - 1
                                            return (
                                              <ResponsiveTableRow key={balance.id} className="bg-slate-100/50 dark:bg-slate-700/50 hover:bg-slate-200/50 dark:hover:bg-slate-600/50 transition-colors">
                                                <ResponsiveTableCell mobileLabel="时间" className="relative py-2">
                                                  {!isLastAsset && (
                                                    <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />
                                                  )}
                                                  {!isLastBalance && (
                                                    <div className="absolute left-8 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />
                                                  )}
                                                  {isLastBalance && (
                                                    <div className="absolute left-8 top-0 h-1/2 w-px bg-slate-200 dark:bg-slate-700" />
                                                  )}
                                                  <div className="absolute left-8 top-1/2 w-2 h-px bg-slate-200 dark:bg-slate-700" />
                                                  <div className="pl-12 flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground">
                                                      {formatDateTime(balance.recordedAt)}
                                                    </span>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">快照</span>
                                                  </div>
                                                </ResponsiveTableCell>
                                                <ResponsiveTableCell mobileLabel="金额" className="text-right text-sm">{formatAmount(balance.amount)}</ResponsiveTableCell>
                                                <ResponsiveTableCell />
                                                <ResponsiveTableCell />
                                                <ResponsiveTableCell />
                                                <ResponsiveTableCell mobileLabel="操作" className="text-right" onClick={(e) => e.stopPropagation()}>
                                                  <div className="flex flex-row flex-wrap gap-1 justify-end">
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={() => handleEditBalance(balance)}
                                                    >
                                                      <Pencil className="h-3 w-3 mr-1" />
                                                      编辑
                                                    </Button>
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      className="text-destructive hover:text-destructive"
                                                      onClick={() => handleDeleteBalance(balance)}
                                                    >
                                                      <Trash2 className="h-3 w-3 mr-1" />
                                                      删除
                                                    </Button>
                                                  </div>
                                                </ResponsiveTableCell>
                                              </ResponsiveTableRow>
                                            )
                                          })}
                                          {isAssetExpanded && assetBalanceList.length === 0 && (
                                            <ResponsiveTableRow className="bg-slate-100/50 dark:bg-slate-700/50">
                                              <ResponsiveTableCell mobileLabel="提示" className="relative py-2">
                                                {!isLastAsset && (
                                                  <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />
                                                )}
                                                <div className="absolute left-8 top-1/2 w-2 h-px bg-slate-200 dark:bg-slate-700" />
                                                <div className="pl-12 text-xs text-muted-foreground">暂无快照</div>
                                              </ResponsiveTableCell>
                                              <ResponsiveTableCell />
                                              <ResponsiveTableCell />
                                              <ResponsiveTableCell />
                                              <ResponsiveTableCell />
                                              <ResponsiveTableCell mobileLabel="操作" className="text-right" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-7 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                                  onClick={() => {
                                                    setSelectedAccount(account)
                                                    setSelectedAsset(asset)
                                                    handleAddBalance()
                                                  }}
                                                >
                                                  <Plus className="h-3 w-3 mr-1" />
                                                  添加
                                                </Button>
                                              </ResponsiveTableCell>
                                            </ResponsiveTableRow>
                                          )}
                                        </Fragment>
                                      )
                                    })}
                                    {isExpanded && accountAssetList.length === 0 && (
                                      <ResponsiveTableRow className="bg-slate-50/50 dark:bg-slate-800/50">
                                        <ResponsiveTableCell mobileLabel="提示" className="relative py-2">
                                          <div className="absolute left-4 top-0 h-1/2 w-px bg-slate-200 dark:bg-slate-700" />
                                          <div className="absolute left-4 top-1/2 w-3 h-px bg-slate-200 dark:bg-slate-700" />
                                          <div className="pl-10 text-xs text-muted-foreground">暂无资产</div>
                                        </ResponsiveTableCell>
                                        <ResponsiveTableCell />
                                        <ResponsiveTableCell />
                                        <ResponsiveTableCell />
                                        <ResponsiveTableCell />
                                        <ResponsiveTableCell mobileLabel="操作" className="text-right" onClick={(e) => e.stopPropagation()}>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                            onClick={() => {
                                              setSelectedAccount(account)
                                              handleAddAsset()
                                            }}
                                          >
                                            <Plus className="h-3 w-3 mr-1" />
                                            添加
                                          </Button>
                                        </ResponsiveTableCell>
                                      </ResponsiveTableRow>
                                    )}
                                  </Fragment>
                                )
                              })
                            )}
                          </ResponsiveTableBody>
                        </ResponsiveTable>
                      </div>
                      {/* 移动端卡片视图 */}
                      <div className="md:hidden space-y-4">
                        {accounts.length === 0 ? (
                          <div className="text-center text-muted-foreground py-8">
                            暂无账户
                          </div>
                        ) : (
                          accounts.map((account) => {
                            const nameColor = getAccountNameColor(account.name)
                            const isExpanded = expandedAccounts.has(account.id)
                            const hasAssets = (account._count?.assets || 0) > 0
                            const accountAssetList = accountAssets[account.id] || []
                            const totalAmount = (account as { totalAmount?: number }).totalAmount || 0
                            const recordsAfterBalanceTotal = (account as { recordsAfterBalanceTotal?: number }).recordsAfterBalanceTotal || 0
                            const latestSnapshotTotal = (account as { latestSnapshotTotal?: number }).latestSnapshotTotal || 0
                            const isNegative = totalAmount < 0
                            // 检测当前是否为深色模式
                            const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
                            // 根据主题选择背景颜色
                            const bgColor = isDarkMode ? nameColor.darkBgColor : nameColor.bgColor
                            return (
                              <div key={account.id} className={`rounded-lg ${bgColor} border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden`}>
                                {/* 账户卡片 */}
                                <div className={`p-4 ${hasAssets ? "cursor-pointer hover:brightness-95 transition-all" : ""}`} onClick={() => hasAssets && toggleAccountExpand(account.id)}>
                                  <div className="flex justify-between items-start mb-3">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        {hasAssets && (
                                          <span className="w-4 h-4 flex items-center justify-center shrink-0">
                                            {isExpanded ? (
                                              <ChevronDown className="h-4 w-4" />
                                            ) : (
                                              <ChevronRight className="h-4 w-4" />
                                            )}
                                          </span>
                                        )}
                                        <AccountDisplay name={account.name} type={account.type} variant="card" />
                                      </div>
                                      <div className="text-sm text-muted-foreground mt-1">
                                        账户号码: {account.accountNumber || "-"}
                                      </div>
                                    </div>
                                    <div className={`text-lg font-medium ${isNegative ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                                      {formatAmount(totalAmount)}
                                    </div>
                                  </div>
                                  <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>最新快照总额:</span>
                                    <span>{formatAmount(latestSnapshotTotal)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">收支总额:</span>
                                    <span className={`${recordsAfterBalanceTotal < 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                                      {formatAmount(recordsAfterBalanceTotal)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>收支数: {account._count?.records || 0}</span>
                                    <span>资产数: {account._count?.assets || 0}</span>
                                  </div>
                                  <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300"
                                      onClick={() => {
                                        setSelectedAccount(account)
                                        handleAddAsset()
                                      }}
                                    >
                                      <Plus className="h-3.5 w-3.5 mr-1" />
                                      添加资产
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEdit(account)}
                                    >
                                      <Pencil className="h-3.5 w-3.5 mr-1" />
                                      编辑
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleDelete(account)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                                      删除
                                    </Button>
                                  </div>
                                </div>
                                {/* 资产列表 */}
                                {isExpanded && hasAssets && (
                                  <div className="border-t border-slate-200 dark:border-slate-700">
                                    {accountAssetList.map((asset, assetIndex) => {
                                      const assetTypeConfig = getAssetTypeConfig(asset.type)
                                      const AssetIcon = assetTypeConfig.icon
                                      const isAssetExpanded = expandedAssets.has(asset.id)
                                      const assetBalanceList = assetBalances[asset.id] || []
                                      return (
                                        <div key={asset.id} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                                          {/* 资产卡片 */}
                                          <div className="p-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors" onClick={() => toggleAssetExpand(asset.id)}>
                                            <div className="flex justify-between items-start">
                                              <div className="flex items-center gap-2">
                                                <span className="w-4 h-4 flex items-center justify-center shrink-0">
                                                  {isAssetExpanded ? (
                                                    <ChevronDown className="h-3 w-3" />
                                                  ) : (
                                                    <ChevronRight className="h-3 w-3" />
                                                  )}
                                                </span>
                                                <span className="text-sm text-slate-600 dark:text-slate-300">{asset.name}</span>
                                                <Badge className="gap-1 text-xs font-normal">
                                                  <AssetIcon className="h-3 w-3" />
                                                  {assetTypeConfig.label}
                                                </Badge>
                                              </div>
                                              <div className="text-sm font-medium">
                                                {formatAmount(getLatestBalanceAmount(asset.id, asset.amount))}
                                              </div>
                                            </div>
                                            <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                                onClick={() => {
                                                  setSelectedAccount(account)
                                                  setSelectedAsset(asset)
                                                  handleAddBalance()
                                                }}
                                              >
                                                <Plus className="h-3 w-3 mr-1" />
                                                快照
                                              </Button>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditAsset(asset)}
                                              >
                                                <Pencil className="h-3.5 w-3.5 mr-1" />
                                                编辑
                                              </Button>
                                              <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteAsset(asset)}
                                              >
                                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                                删除
                                              </Button>
                                            </div>
                                          </div>
                                          {/* 余额快照列表 */}
                                          {isAssetExpanded && assetBalanceList.length > 0 && (
                                            <div className="bg-slate-50/30 dark:bg-slate-800/30">
                                              {assetBalanceList.map((balance) => (
                                                <div key={balance.id} className="p-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                                  <div className="text-xs text-muted-foreground">
                                                    {formatDateTime(balance.recordedAt)}
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                    <span className="text-sm">{formatAmount(balance.amount)}</span>
                                                    <div className="flex gap-1">
                                                      <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditBalance(balance)}
                                                      >
                                                        <Pencil className="h-3 w-3" />
                                                      </Button>
                                                      <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeleteBalance(balance)}
                                                      >
                                                        <Trash2 className="h-3 w-3" />
                                                      </Button>
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                          {isAssetExpanded && assetBalanceList.length === 0 && (
                                            <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                                              <div className="text-xs text-muted-foreground">
                                                暂无快照
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            )
                          })
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarInset>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xs max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAccount ? "编辑账户" : "添加账户"}</DialogTitle>
            <DialogDescription>
              {editingAccount ? "修改账户信息" : "创建一个新的财务账户，并添加至少一个资产"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountName">账户名称</Label>
              <Input
                id="accountName"
                placeholder="如：支付宝、微信、中信银行"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountType">账户类型</Label>
              <Select value={accountType} onValueChange={setAccountType}>
                <SelectTrigger>
                  <SelectValue placeholder="选择账户类型" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ACCOUNT_TYPE_CONFIG).map(([value, config]) => {
                    const Icon = config.icon
                    return (
                      <SelectItem key={value} value={value}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {config.label}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">账户号码</Label>
              <Input
                id="accountNumber"
                placeholder="可选，如银行卡号"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="initialBalance">初始余额</Label>
              <Input
                id="initialBalance"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
              />
            </div>

            {/* 新建账户时显示资产信息输入 */}
            {!editingAccount && (
              <>
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-3">初始资产（必填）</h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="newAssetName">资产名称</Label>
                      <Input
                        id="newAssetName"
                        placeholder="如：现金、余额宝、定期存款"
                        value={newAssetName}
                        onChange={(e) => setNewAssetName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newAssetType">资产类型</Label>
                      <Select value={newAssetType} onValueChange={setNewAssetType}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择资产类型" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ASSET_TYPE_CONFIG).map(([value, config]) => {
                            const Icon = config.icon
                            return (
                              <SelectItem key={value} value={value}>
                                <span className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  {config.label}
                                </span>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newAssetAmount">资产金额</Label>
                      <Input
                        id="newAssetAmount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={newAssetAmount}
                        onChange={(e) => setNewAssetAmount(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除账户 &quot;{deletingAccount?.name}&quot; 吗？如果该账户有关联收支记录，将无法删除。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={saving}>
              {saving ? "删除中..." : "删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assetDialogOpen} onOpenChange={setAssetDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAsset ? "编辑资产" : "添加资产"}</DialogTitle>
            <DialogDescription>
              {editingAsset ? "修改资产信息" : "为账户添加新资产"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assetName">资产名称</Label>
              <Input
                id="assetName"
                placeholder="如：活期存款、定期存款、基金"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assetType">资产类型</Label>
              <Select value={assetType} onValueChange={setAssetType}>
                <SelectTrigger>
                  <SelectValue placeholder="选择资产类型" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ASSET_TYPE_CONFIG).map(([value, config]) => {
                    const Icon = config.icon
                    return (
                      <SelectItem key={value} value={value}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {config.label}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assetAmount">金额</Label>
              <Input
                id="assetAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={assetAmount}
                onChange={(e) => setAssetAmount(e.target.value)}
              />
            </div>
            {editingAsset && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>余额快照</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    onClick={() => {
                      setSelectedAsset(editingAsset)
                      handleAddBalance()
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    添加快照
                  </Button>
                </div>
                <div className="border rounded-md max-h-40 overflow-y-auto">
                  {assetBalances[editingAsset.id] && assetBalances[editingAsset.id].length > 0 ? (
                    <div className="divide-y">
                      {[...assetBalances[editingAsset.id]]
                        .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
                        .map((balance) => (
                          <div key={balance.id} className="flex items-center justify-between p-2 hover:bg-slate-50">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {formatDateTime(balance.recordedAt)}
                              </span>
                              <span className="text-sm font-medium">{formatAmount(balance.amount)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => {
                                  setSelectedAsset(editingAsset)
                                  handleEditBalance(balance)
                                }}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteBalance(balance)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      暂无快照
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssetDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveAsset} disabled={saving}>
              {saving ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={balanceDialogOpen} onOpenChange={setBalanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBalance ? "编辑余额快照" : "添加余额快照"}</DialogTitle>
            <DialogDescription>
              {editingBalance ? "修改余额快照信息" : "记录当前资产余额"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="balanceAmount">金额</Label>
              <Input
                id="balanceAmount"
                type="number"
                step="0.01"
                placeholder="请输入当前资产余额"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="balanceDate">登记时间</Label>
              <Input
                id="balanceDate"
                type="datetime-local"
                value={balanceDate}
                onChange={(e) => setBalanceDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBalanceDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveBalance} disabled={saving}>
              {saving ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
