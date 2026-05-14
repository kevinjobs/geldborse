import {
  Banknote,
  CreditCard,
  Wallet,
  Coins,
  Bitcoin,
  TrendingUp,
  Landmark,
  PiggyBank,
  Clock,
  Building2,
  BarChart3,
  FileText,
  Smartphone,
  MinusCircle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ACCOUNT_LOGOS } from "./account-logos"

export const ACCOUNT_NAME_COLORS: Record<string, { color: string; bgColor: string; borderColor: string; darkColor: string; darkBgColor: string; darkBorderColor: string }> = {
  "支付宝": {
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-l-blue-400",
    darkColor: "text-blue-300",
    darkBgColor: "bg-blue-900/40",
    darkBorderColor: "border-l-blue-700"
  },
  "微信": {
    color: "text-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-l-green-400",
    darkColor: "text-green-300",
    darkBgColor: "bg-green-900/40",
    darkBorderColor: "border-l-green-700"
  },
  "微信支付": {
    color: "text-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-l-green-400",
    darkColor: "text-green-300",
    darkBgColor: "bg-green-900/40",
    darkBorderColor: "border-l-green-700"
  },
  "中信银行": {
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-l-red-400",
    darkColor: "text-red-300",
    darkBgColor: "bg-red-900/40",
    darkBorderColor: "border-l-red-700"
  },
  "招商银行": {
    color: "text-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-l-red-400",
    darkColor: "text-red-300",
    darkBgColor: "bg-red-900/40",
    darkBorderColor: "border-l-red-700"
  },
  "工商银行": {
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-l-red-400",
    darkColor: "text-red-300",
    darkBgColor: "bg-red-900/40",
    darkBorderColor: "border-l-red-700"
  },
  "建设银行": {
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-l-blue-400",
    darkColor: "text-blue-300",
    darkBgColor: "bg-blue-900/40",
    darkBorderColor: "border-l-blue-700"
  },
  "农业银行": {
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-l-green-400",
    darkColor: "text-green-300",
    darkBgColor: "bg-green-900/40",
    darkBorderColor: "border-l-green-700"
  },
  "中国银行": {
    color: "text-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-l-red-400",
    darkColor: "text-red-300",
    darkBgColor: "bg-red-900/40",
    darkBorderColor: "border-l-red-700"
  },
  "交通银行": {
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-l-blue-400",
    darkColor: "text-blue-300",
    darkBgColor: "bg-blue-900/40",
    darkBorderColor: "border-l-blue-700"
  },
  "浦发银行": {
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-l-blue-400",
    darkColor: "text-blue-300",
    darkBgColor: "bg-blue-900/40",
    darkBorderColor: "border-l-blue-700"
  },
  "民生银行": {
    color: "text-teal-500",
    bgColor: "bg-teal-50",
    borderColor: "border-l-teal-400",
    darkColor: "text-teal-300",
    darkBgColor: "bg-teal-900/40",
    darkBorderColor: "border-l-teal-700"
  },
  "光大银行": {
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    borderColor: "border-l-purple-400",
    darkColor: "text-purple-300",
    darkBgColor: "bg-purple-900/40",
    darkBorderColor: "border-l-purple-700"
  },
  "平安银行": {
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-l-orange-400",
    darkColor: "text-orange-300",
    darkBgColor: "bg-orange-900/40",
    darkBorderColor: "border-l-orange-700"
  },
  "兴业银行": {
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-l-blue-400",
    darkColor: "text-blue-300",
    darkBgColor: "bg-blue-900/40",
    darkBorderColor: "border-l-blue-700"
  },
  "华夏银行": {
    color: "text-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-l-red-400",
    darkColor: "text-red-300",
    darkBgColor: "bg-red-900/40",
    darkBorderColor: "border-l-red-700"
  },
  "广发银行": {
    color: "text-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-l-red-400",
    darkColor: "text-red-300",
    darkBgColor: "bg-red-900/40",
    darkBorderColor: "border-l-red-700"
  },
  "邮储银行": {
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-l-green-400",
    darkColor: "text-green-300",
    darkBgColor: "bg-green-900/40",
    darkBorderColor: "border-l-green-700"
  },
  "京东": {
    color: "text-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-l-red-400",
    darkColor: "text-red-300",
    darkBgColor: "bg-red-900/40",
    darkBorderColor: "border-l-red-700"
  },
  "京东金融": {
    color: "text-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-l-red-400",
    darkColor: "text-red-300",
    darkBgColor: "bg-red-900/40",
    darkBorderColor: "border-l-red-700"
  },
  "云闪付": {
    color: "text-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-l-red-400",
    darkColor: "text-red-300",
    darkBgColor: "bg-red-900/40",
    darkBorderColor: "border-l-red-700"
  },
  "数字人民币": {
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    borderColor: "border-l-amber-400",
    darkColor: "text-amber-300",
    darkBgColor: "bg-amber-900/40",
    darkBorderColor: "border-l-amber-700"
  },
}

const FALLBACK_COLORS = [
  {
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-l-blue-400",
    darkColor: "text-blue-300",
    darkBgColor: "bg-blue-900/40",
    darkBorderColor: "border-l-blue-700"
  },
  {
    color: "text-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-l-green-400",
    darkColor: "text-green-300",
    darkBgColor: "bg-green-900/40",
    darkBorderColor: "border-l-green-700"
  },
  {
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    borderColor: "border-l-purple-400",
    darkColor: "text-purple-300",
    darkBgColor: "bg-purple-900/40",
    darkBorderColor: "border-l-purple-700"
  },
  {
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-l-orange-400",
    darkColor: "text-orange-300",
    darkBgColor: "bg-orange-900/40",
    darkBorderColor: "border-l-orange-700"
  },
  {
    color: "text-pink-500",
    bgColor: "bg-pink-50",
    borderColor: "border-l-pink-400",
    darkColor: "text-pink-300",
    darkBgColor: "bg-pink-900/40",
    darkBorderColor: "border-l-pink-700"
  },
  {
    color: "text-teal-500",
    bgColor: "bg-teal-50",
    borderColor: "border-l-teal-400",
    darkColor: "text-teal-300",
    darkBgColor: "bg-teal-900/40",
    darkBorderColor: "border-l-teal-700"
  },
  {
    color: "text-indigo-500",
    bgColor: "bg-indigo-50",
    borderColor: "border-l-indigo-400",
    darkColor: "text-indigo-300",
    darkBgColor: "bg-indigo-900/40",
    darkBorderColor: "border-l-indigo-700"
  },
  {
    color: "text-cyan-500",
    bgColor: "bg-cyan-50",
    borderColor: "border-l-cyan-400",
    darkColor: "text-cyan-300",
    darkBgColor: "bg-cyan-900/40",
    darkBorderColor: "border-l-cyan-700"
  },
]

export const getAccountNameColor = (name: string): {
  color: string;
  bgColor: string;
  borderColor: string;
  darkColor: string;
  darkBgColor: string;
  darkBorderColor: string
} => {
  if (ACCOUNT_NAME_COLORS[name]) {
    return ACCOUNT_NAME_COLORS[name]
  }

  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % FALLBACK_COLORS.length
  return FALLBACK_COLORS[index]
}

export const ACCOUNT_TYPE_CONFIG: Record<string, { label: string; icon: typeof Banknote }> = {
  CASH: { label: "现金", icon: Banknote },
  CREDIT_CARD: { label: "信用卡", icon: CreditCard },
  DEBIT_CARD: { label: "储蓄卡", icon: Wallet },
  DIGITAL: { label: "数字人民币", icon: Coins },
  CRYPTO: { label: "虚拟货币", icon: Bitcoin },
  STOCK: { label: "股票证券", icon: TrendingUp },
  ONLINE_PAYMENT: { label: "网络支付", icon: Smartphone },
  DEBT_CLAIM: { label: "债权", icon: FileText },
  OTHER: { label: "其他", icon: Landmark },
}

export const getAccountTypeConfig = (type: string) => {
  return ACCOUNT_TYPE_CONFIG[type] || ACCOUNT_TYPE_CONFIG.OTHER
}

export const ASSET_TYPE_CONFIG: Record<string, { label: string; icon: typeof PiggyBank }> = {
  CASH_BALANCE: { label: "现金/余额", icon: Banknote },
  DEPOSIT: { label: "存款", icon: PiggyBank },
  CURRENT: { label: "活期", icon: Clock },
  FIXED: { label: "定期", icon: Building2 },
  FUND: { label: "基金", icon: BarChart3 },
  STOCK: { label: "股票", icon: TrendingUp },
  BOND: { label: "债券", icon: FileText },
  WEALTH: { label: "理财", icon: Coins },
  DEBT: { label: "负债", icon: MinusCircle },
  DEBT_CLAIM: { label: "债权", icon: FileText },
  OTHER: { label: "其他", icon: Wallet },
}

export const getAssetTypeConfig = (type: string) => {
  return ASSET_TYPE_CONFIG[type] || ASSET_TYPE_CONFIG.OTHER
}

interface AccountDisplayProps {
  name: string
  type: string
  variant?: "card" | "table" | "compact"
  showBadge?: boolean
}

export function AccountDisplay({ name, type, variant = "table", showBadge = true }: AccountDisplayProps) {
  const nameColor = getAccountNameColor(name)
  const typeConfig = getAccountTypeConfig(type)
  const TypeIcon = typeConfig.icon
  const LogoComponent = ACCOUNT_LOGOS[name]

  // 检测当前是否为深色模式
  const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark')

  // 根据主题选择颜色
  const displayColor = isDarkMode ? nameColor.darkColor : nameColor.color

  if (variant === "card") {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {LogoComponent && <LogoComponent size={18} className={displayColor} />}
          <span className={`font-semibold ${displayColor}`}>{name}</span>
          {showBadge && (
            <Badge variant="outline" className="gap-1 text-xs">
              <TypeIcon className="h-3 w-3" />
              {typeConfig.label}
            </Badge>
          )}
        </div>
      </div>
    )
  }

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1.5">
        {LogoComponent && <LogoComponent size={14} className={displayColor} />}
        <span className={`font-medium ${displayColor}`}>{name}</span>
        {showBadge && (
          <Badge variant="outline" className="gap-0.5 text-[10px] px-1.5 py-0 h-4">
            <TypeIcon className="h-2.5 w-2.5" />
            {typeConfig.label}
          </Badge>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {LogoComponent && <LogoComponent size={16} className={displayColor} />}
      <span className={`font-medium ${displayColor}`}>{name}</span>
      {showBadge && (
        <Badge variant="outline" className="gap-1 text-xs">
          <TypeIcon className="h-3 w-3" />
          {typeConfig.label}
        </Badge>
      )}
    </div>
  )
}
