import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Logo } from "@/components/logo"

interface Endpoint {
  method: "GET" | "POST" | "PUT" | "DELETE"
  path: string
  auth: string
  body?: string
  response: string
  errors: string
  description: string
}

function MethodBadge({ method }: { method: Endpoint["method"] }) {
  const colors: Record<string, string> = {
    GET: "bg-success/15 text-success border-success/30",
    POST: "bg-[#00E5FF]/15 text-[#00E5FF] border-[#00E5FF]/30",
    PUT: "bg-warning/15 text-warning border-warning/30",
    DELETE: "bg-destructive/15 text-destructive border-destructive/30",
  }
  return (
    <Badge variant="outline" className={`font-mono text-[11px] px-2 py-0.5 tracking-wide ${colors[method]}`}>
      {method}
    </Badge>
  )
}

function EndpointRow({ endpoint }: { endpoint: Endpoint }) {
  return (
    <div className="border border-border rounded-[12px] p-4 bg-card space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <MethodBadge method={endpoint.method} />
          <code className="font-mono text-sm text-foreground break-all">{endpoint.path}</code>
        </div>
        <Badge variant="outline" className="shrink-0 text-[10px] px-2 py-0.5 text-muted-foreground border-border">
          {endpoint.auth}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">{endpoint.description}</p>
      {endpoint.body && (
        <div>
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">请求体</span>
          <pre className="mt-1 bg-muted border border-border rounded-[8px] p-3 overflow-x-auto">
            <code className="text-xs text-foreground font-mono leading-relaxed">{endpoint.body}</code>
          </pre>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-muted-foreground">响应: </span>
          <code className="font-mono text-muted-foreground">{endpoint.response}</code>
        </div>
        <div>
          <span className="text-muted-foreground">错误: </span>
          <code className="font-mono text-muted-foreground">{endpoint.errors}</code>
        </div>
      </div>
    </div>
  )
}

function EndpointGroup({ title, description, endpoints }: { title: string; description: string; endpoints: Endpoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {endpoints.map((ep) => (
          <EndpointRow key={`${ep.method}-${ep.path}`} endpoint={ep} />
        ))}
      </CardContent>
    </Card>
  )
}

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="size-6" />
            <span className="font-semibold text-sm">Geldborse</span>
          </Link>
          <Link href="/overview" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            返回控制台
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* Title */}
        <div>
          <h1 className="text-2xl font-heading font-semibold">Geldborse API 文档</h1>
          <p className="text-sm text-muted-foreground mt-1">
            REST API v1 — 全量接口参考，适用于自动化集成与 AI 工具调用
          </p>
        </div>

        {/* Table of Contents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">目录</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p><Link href="#auth" className="text-primary hover:underline">1. 认证方式</Link></p>
            <p><Link href="#scopes" className="text-primary hover:underline">2. API Scope 权限表</Link></p>
            <p><Link href="#endpoints" className="text-primary hover:underline">3. 端点参考</Link></p>
            <p className="pl-4"><Link href="#auth-endpoints" className="text-primary hover:underline">3.1 认证 Auth</Link></p>
            <p className="pl-4"><Link href="#accounts" className="text-primary hover:underline">3.2 账户 Accounts</Link></p>
            <p className="pl-4"><Link href="#assets" className="text-primary hover:underline">3.3 资产 Assets</Link></p>
            <p className="pl-4"><Link href="#balances" className="text-primary hover:underline">3.4 余额 Balances</Link></p>
            <p className="pl-4"><Link href="#records" className="text-primary hover:underline">3.5 收支 Records</Link></p>
            <p className="pl-4"><Link href="#snapshots" className="text-primary hover:underline">3.6 快照 Snapshots</Link></p>
            <p className="pl-4"><Link href="#api-keys" className="text-primary hover:underline">3.7 API 密钥</Link></p>
            <p className="pl-4"><Link href="#import" className="text-primary hover:underline">3.8 导入</Link></p>
            <p className="pl-4"><Link href="#system" className="text-primary hover:underline">3.9 系统 System</Link></p>
            <p><Link href="#errors" className="text-primary hover:underline">4. 错误码</Link></p>
            <p><Link href="#examples" className="text-primary hover:underline">5. 调用示例 (curl)</Link></p>
            <p><Link href="#workflows" className="text-primary hover:underline">6. 典型工作流</Link></p>
          </CardContent>
        </Card>

        {/* 1. Auth */}
        <Card id="auth">
          <CardHeader>
            <CardTitle className="text-base">1. 认证方式</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border border-border rounded-[12px] p-4 bg-card">
                <div className="font-medium text-foreground mb-1">Session</div>
                <p className="text-xs">登录后自动设置 httpOnly cookie <code className="font-mono">auth_token</code>，浏览器端自动携带。</p>
              </div>
              <div className="border border-border rounded-[12px] p-4 bg-card">
                <div className="font-medium text-foreground mb-1">API Key</div>
                <p className="text-xs"><code className="font-mono">Authorization: Bearer gb_xxxxx</code> 头传递。在设置页面创建，支持 scope 权限控制。</p>
              </div>
              <div className="border border-border rounded-[12px] p-4 bg-card">
                <div className="font-medium text-foreground mb-1">公共接口</div>
                <p className="text-xs"><code className="font-mono">/api/auth/login</code>、<code className="font-mono">/api/auth/register</code>、<code className="font-mono">/api/auth/logout</code> 无需认证。</p>
              </div>
            </div>
            <p className="text-xs">
              部分敏感操作（API Key 管理、清空数据、修改密码）拒绝 API Key 认证，仅允许 Session 认证。
            </p>
          </CardContent>
        </Card>

        {/* 2. Scopes */}
        <Card id="scopes">
          <CardHeader>
            <CardTitle className="text-base">2. API Scope 权限表</CardTitle>
            <CardDescription>API Key 可分配的权限范围</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-normal text-xs uppercase tracking-wider">Scope</th>
                    <th className="text-left py-2 text-muted-foreground font-normal text-xs uppercase tracking-wider">说明</th>
                    <th className="text-left py-2 text-muted-foreground font-normal text-xs uppercase tracking-wider">分组</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["accounts:read", "查看账户", "账户管理"],
                    ["accounts:write", "管理账户", "账户管理"],
                    ["records:read", "查看收支记录", "收支记录"],
                    ["records:write", "管理收支记录", "收支记录"],
                    ["snapshots:read", "查看快照", "快照与资产"],
                    ["snapshots:write", "管理快照", "快照与资产"],
                    ["assets:read", "查看资产", "快照与资产"],
                    ["assets:write", "管理资产", "快照与资产"],
                    ["export", "导出数据", "系统"],
                    ["settings:read", "查看设置", "系统"],
                    ["settings:write", "修改设置", "系统"],
                    ["import", "导入数据", "系统"],
                    ["read:*", "所有只读权限（匹配所有 :read scope）", "通配"],
                    ["write:*", "所有写入权限（匹配所有 :write scope）", "通配"],
                  ].map(([scope, label, group]) => (
                    <tr key={scope} className="border-b border-border hover:bg-muted transition-colors">
                      <td className="py-2.5"><code className="font-mono text-xs text-primary">{scope}</code></td>
                      <td className="py-2.5 text-muted-foreground">{label}</td>
                      <td className="py-2.5 text-muted-foreground">{group}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 3. Endpoints */}
        <div id="endpoints" className="space-y-6">

          {/* 3.1 Auth */}
          <div id="auth-endpoints">
            <EndpointGroup
              title="3.1 认证 Auth"
              description="用户注册、登录、登出与个人信息"
              endpoints={[
                {
                  method: "POST", path: "/api/auth/register",
                  auth: "无需认证",
                  body: JSON.stringify({ email: "user@example.com", password: "123456", name: "用户名" }, null, 2),
                  response: "201 — { user: { id, email, name, avatar } }",
                  errors: "400 — 参数错误 / 邮箱已存在 / 密码强度不足, 500",
                  description: "注册新用户。密码至少 6 位，邮箱唯一。",
                },
                {
                  method: "POST", path: "/api/auth/login",
                  auth: "无需认证",
                  body: JSON.stringify({ email: "user@example.com", password: "123456" }, null, 2),
                  response: "200 — { user: { id, email, name, avatar } } + auth_token cookie",
                  errors: "400 — 缺少参数, 401 — 邮箱或密码错误, 429 — 频率限制, 500",
                  description: "用户登录。验证凭据后设置 httpOnly Session cookie，记录登录历史。有 IP 级别频率限制。",
                },
                {
                  method: "POST", path: "/api/auth/logout",
                  auth: "无需认证",
                  body: undefined,
                  response: "200 — { message: 'Logout successful' } + 清除 cookie",
                  errors: "500",
                  description: "清除当前 Session cookie。",
                },
                {
                  method: "GET", path: "/api/auth/me",
                  auth: "任意认证",
                  body: undefined,
                  response: "200 — { user: { id, email, name, avatar, isAdmin } }",
                  errors: "401 — 未授权, 404 — 用户不存在",
                  description: "获取当前登录用户信息。",
                },
                {
                  method: "GET", path: "/api/auth/login-history",
                  auth: "任意认证",
                  body: undefined,
                  response: "200 — LoginHistory[] (最近 20 条)",
                  errors: "500",
                  description: "获取当前用户的登录历史记录。",
                },
                {
                  method: "POST", path: "/api/auth/login-history",
                  auth: "任意认证",
                  body: JSON.stringify({ ip: "192.168.1.1", userAgent: "Mozilla/5.0", deviceInfo: "Chrome on Linux" }, null, 2),
                  response: "201 — 创建的 LoginHistory 对象",
                  errors: "500",
                  description: "记录一次登录历史，标记之前的会话为非当前。",
                },
                {
                  method: "DELETE", path: "/api/auth/login-history",
                  auth: "任意认证",
                  body: JSON.stringify({ id: "login_history_id" }, null, 2),
                  response: "200 — { message: '登出成功' }",
                  errors: "404 — 记录不存在, 500",
                  description: "删除指定登录历史记录（用于「退出此设备」功能）。",
                },
              ]}
            />
          </div>

          {/* 3.2 Accounts */}
          <div id="accounts">
            <EndpointGroup
              title="3.2 账户 Accounts"
              description="管理财务账户，支持资产子账户"
              endpoints={[
                {
                  method: "GET", path: "/api/accounts",
                  auth: "accounts:read",
                  body: undefined,
                  response: "200 — Account[]（含计算字段 totalAmount、recordsAfterBalanceTotal、latestSnapshotTotal）",
                  errors: "500",
                  description: "获取当前用户所有账户列表，包含动态计算的总资产、收支汇总、最新快照总额。",
                },
                {
                  method: "POST", path: "/api/accounts",
                  auth: "accounts:write",
                  body: JSON.stringify({ name: "工商银行", type: "BANK", accountNumber: "6222****1234", assets: [{ name: "活期存款", type: "DEPOSIT", amount: 10000 }] }, null, 2),
                  response: "201 — 创建的 Account 对象",
                  errors: "400 — 缺少名称 / 资产名称重复, 500",
                  description: "创建账户并附带初始化资产（事务操作）。",
                },
                {
                  method: "GET", path: "/api/accounts/:id",
                  auth: "accounts:read",
                  body: undefined,
                  response: "200 — Account（含最近 10 条收支记录 + 资产列表）",
                  errors: "404 — 账户不存在",
                  description: "获取单个账户详情，包含最近的收支记录和所有资产。",
                },
                {
                  method: "PUT", path: "/api/accounts/:id",
                  auth: "accounts:write",
                  body: JSON.stringify({ name: "工商银行更新", type: "BANK", accountNumber: "6222****5678" }, null, 2),
                  response: "200 — 更新后的 Account",
                  errors: "400 — 参数错误, 404 — 账户不存在, 500",
                  description: "更新账户基本信息。",
                },
                {
                  method: "DELETE", path: "/api/accounts/:id",
                  auth: "accounts:write",
                  body: undefined,
                  response: "200 — { success: true }",
                  errors: "400 — 账户有关联记录无法删除, 404 — 账户不存在, 500",
                  description: "删除账户及关联资产。如有任何收支记录则拒绝删除。",
                },
                {
                  method: "GET", path: "/api/accounts/:id/assets",
                  auth: "任意认证",
                  body: undefined,
                  response: "200 — Asset[]（按 createdAt 降序）",
                  errors: "401 — 未授权, 404 — 账户不存在",
                  description: "获取指定账户下的所有资产（不含 scope 校验）。",
                },
                {
                  method: "GET", path: "/api/accounts/full",
                  auth: "accounts:read",
                  body: undefined,
                  response: "200 — Account[]（含完整资产、余额、收支记录及计算字段）",
                  errors: "500",
                  description: "完整账户数据导出。各字段包含详细的计算中间结果，适合资产计算与校验。",
                },
              ]}
            />
          </div>

          {/* 3.3 Assets */}
          <div id="assets">
            <EndpointGroup
              title="3.3 资产 Assets"
              description="账户下的子资产管理"
              endpoints={[
                {
                  method: "GET", path: "/api/assets",
                  auth: "assets:read",
                  body: undefined,
                  response: "200 — Asset[]（含关联的账户信息）",
                  errors: "500",
                  description: "获取当前用户所有资产。支持 ?accountId=xxx 过滤。",
                },
                {
                  method: "POST", path: "/api/assets",
                  auth: "assets:write",
                  body: JSON.stringify({ name: "基金账户", type: "INVESTMENT", amount: 50000, accountId: "account_id" }, null, 2),
                  response: "201 — 创建的 Asset（含账户信息）",
                  errors: "400 — 参数错误, 500",
                  description: "在指定账户下创建新资产。",
                },
                {
                  method: "GET", path: "/api/assets/:id",
                  auth: "assets:read",
                  body: undefined,
                  response: "200 — Asset（含账户信息）",
                  errors: "404 — 资产不存在",
                  description: "获取单个资产详情。",
                },
                {
                  method: "PUT", path: "/api/assets/:id",
                  auth: "assets:write",
                  body: JSON.stringify({ name: "基金账户", type: "INVESTMENT", amount: 60000 }, null, 2),
                  response: "200 — 更新后的 Asset（如有余额记录会附带 latestBalance）",
                  errors: "404 — 资产不存在, 500",
                  description: "更新资产信息。如果该资产已有余额记录，修改 amount 时会自动创建一条新余额快照。",
                },
                {
                  method: "DELETE", path: "/api/assets/:id",
                  auth: "assets:write",
                  body: undefined,
                  response: "200 — { success: true }",
                  errors: "404 — 资产不存在, 500",
                  description: "删除资产。",
                },
              ]}
            />
          </div>

          {/* 3.4 Balances */}
          <div id="balances">
            <EndpointGroup
              title="3.4 余额 Balances"
              description="资产余额快照记录"
              endpoints={[
                {
                  method: "GET", path: "/api/balances",
                  auth: "assets:read",
                  body: undefined,
                  response: "200 — Balance[]（含资产和账户信息）",
                  errors: "500",
                  description: "获取余额快照列表。支持 ?assetId=xxx 和 ?accountId=xxx 过滤。",
                },
                {
                  method: "POST", path: "/api/balances",
                  auth: "assets:write",
                  body: JSON.stringify({ amount: 150000, recordedAt: "2026-06-15T10:00:00.000Z", assetId: "asset_id" }, null, 2),
                  response: "201 — 创建的 Balance（含资产信息）",
                  errors: "400 — 参数错误, 500",
                  description: "创建一条余额快照记录。",
                },
                {
                  method: "GET", path: "/api/balances/:id",
                  auth: "assets:read",
                  body: undefined,
                  response: "200 — Balance（含资产和账户信息）",
                  errors: "404 — 余额记录不存在",
                  description: "获取单条余额快照。",
                },
                {
                  method: "PUT", path: "/api/balances/:id",
                  auth: "assets:write",
                  body: JSON.stringify({ amount: 160000, recordedAt: "2026-06-20T10:00:00.000Z" }, null, 2),
                  response: "200 — 更新后的 Balance（含资产信息）",
                  errors: "404 — 余额记录不存在, 500",
                  description: "更新余额快照。",
                },
                {
                  method: "DELETE", path: "/api/balances/:id",
                  auth: "assets:write",
                  body: undefined,
                  response: "200 — { success: true }",
                  errors: "404 — 余额记录不存在, 500",
                  description: "删除余额快照。",
                },
              ]}
            />
          </div>

          {/* 3.5 Records */}
          <div id="records">
            <EndpointGroup
              title="3.5 收支 Records"
              description="收入和支出流水记录"
              endpoints={[
                {
                  method: "GET", path: "/api/records",
                  auth: "records:read",
                  body: undefined,
                  response: "200 — Record[]（含账户信息，按 date 降序）",
                  errors: "500",
                  description: "获取当前用户所有收支记录。",
                },
                {
                  method: "POST", path: "/api/records",
                  auth: "records:write",
                  body: JSON.stringify({ date: "2026-06-15T10:00:00.000Z", accountId: "account_id", assetId: "asset_id", amount: 5000, type: "INCOME", note: "工资" }, null, 2),
                  response: "201 — 创建的 Record（含账户信息）",
                  errors: "400 — 参数错误, 500",
                  description: "创建收支记录。type=EXPENSE 时 amount 自动取负。",
                },
                {
                  method: "GET", path: "/api/records/:id",
                  auth: "records:read",
                  body: undefined,
                  response: "200 — Record（含账户信息）",
                  errors: "404 — 记录不存在",
                  description: "获取单条收支记录。",
                },
                {
                  method: "PUT", path: "/api/records/:id",
                  auth: "records:write",
                  body: JSON.stringify({ date: "2026-06-15T10:00:00.000Z", accountId: "account_id", assetId: "asset_id", amount: 5500, type: "INCOME", note: "工资调整" }, null, 2),
                  response: "200 — 更新后的 Record",
                  errors: "400 — 参数错误, 404 — 记录不存在, 500",
                  description: "更新收支记录。",
                },
                {
                  method: "DELETE", path: "/api/records/:id",
                  auth: "records:write",
                  body: undefined,
                  response: "200 — { success: true }",
                  errors: "404 — 记录不存在, 500",
                  description: "删除收支记录。",
                },
              ]}
            />
          </div>

          {/* 3.6 Snapshots */}
          <div id="snapshots">
            <EndpointGroup
              title="3.6 快照 Snapshots"
              description="每日资产快照"
              endpoints={[
                {
                  method: "GET", path: "/api/daily-snapshots",
                  auth: "snapshots:read",
                  body: undefined,
                  response: "200 — DailySnapshot[]（含账户和资产信息）",
                  errors: "500",
                  description: "获取所有资产快照，按 snapshotAt 降序排列。",
                },
                {
                  method: "POST", path: "/api/daily-snapshots",
                  auth: "snapshots:write",
                  body: JSON.stringify({ snapshotAt: "2026-06-15T12:00:00.000Z" }, null, 2),
                  response: "200 — { success: true, message, snapshotAt }",
                  errors: "400 — 无效时间 / 未来时间, 500",
                  description: "生成全账户快照。snapshotAt 可选，默认当前时间。历史快照会按该时间点计算余额。",
                },
                {
                  method: "DELETE", path: "/api/daily-snapshots?snapshotAt=...",
                  auth: "snapshots:write",
                  body: undefined,
                  response: "200 — { success: true, message: '已删除 N 条快照' }",
                  errors: "400 — 缺少 snapshotAt 参数, 500",
                  description: "删除指定时间戳的所有快照记录。",
                },
                {
                  method: "DELETE", path: "/api/daily-snapshots/:id",
                  auth: "snapshots:write",
                  body: undefined,
                  response: "200 — { success: true }",
                  errors: "404 — 快照不存在, 500",
                  description: "删除单条快照记录。",
                },
              ]}
            />
          </div>

          {/* 3.7 API Keys */}
          <div id="api-keys">
            <EndpointGroup
              title="3.7 API 密钥"
              description="创建和管理 API 访问密钥"
              endpoints={[
                {
                  method: "GET", path: "/api/api-keys",
                  auth: "Session 认证（拒绝 API Key）",
                  body: undefined,
                  response: "200 — { apiKeys: [...] }",
                  errors: "403 — 不支持 API Key 认证, 500",
                  description: "获取当前用户的所有 API 密钥列表。",
                },
                {
                  method: "POST", path: "/api/api-keys",
                  auth: "Session 认证（拒绝 API Key）",
                  body: JSON.stringify({ name: "自动化脚本", scopes: ["records:read", "snapshots:read"], expiresIn: "30d" }, null, 2),
                  response: "200 — { id, name, prefix, scopes, expiresAt, fullKey }（fullKey 仅在此返回）",
                  errors: "400 — 缺少名称 / 无效 scope, 500",
                  description: "创建新 API Key。expiresIn: '24h' | '7d' | '30d' | '90d' | 'never'。fullKey 只在此响应中展示。",
                },
                {
                  method: "PUT", path: "/api/api-keys/:id",
                  auth: "Session 认证（拒绝 API Key）",
                  body: JSON.stringify({ name: "重命名", scopes: ["records:read"], isActive: true }, null, 2),
                  response: "200 — 更新后的密钥信息",
                  errors: "400 — 参数错误, 404 — 密钥不存在",
                  description: "更新 API Key 的名称、权限或启用状态。",
                },
                {
                  method: "DELETE", path: "/api/api-keys/:id",
                  auth: "Session 认证（拒绝 API Key）",
                  body: undefined,
                  response: "200 — { success: true, message: '已撤销' / '已永久删除' }",
                  errors: "404 — 密钥不存在",
                  description: "撤销（软删除）或 ?permanent=true 永久删除 API Key。",
                },
              ]}
            />
          </div>

          {/* 3.8 Import */}
          <div id="import">
            <EndpointGroup
              title="3.8 导入"
              description="批量导入数据"
              endpoints={[
                {
                  method: "POST", path: "/api/import",
                  auth: "import",
                  body: JSON.stringify({ data: { accounts: [{ name: "账户", type: "BANK", assets: [{ name: "现金", type: "CASH", amount: 0 }] }], records: [], snapshots: [] } }, null, 2),
                  response: "200 — { accounts: N, assets: N, records: N, duplicates: N, invalid: N }",
                  errors: "400 — 数据格式错误, 500",
                  description: "批量导入账户、资产、收支记录和快照。重复数据会自动跳过，无效数据计数但不中断。",
                },
              ]}
            />
          </div>

          {/* 3.9 System */}
          <div id="system">
            <EndpointGroup
              title="3.9 系统 System"
              description="用户设置、清空数据、管理员功能"
              endpoints={[
                {
                  method: "POST", path: "/api/clear-data",
                  auth: "Session 认证（拒绝 API Key）",
                  body: JSON.stringify({ password: "当前密码" }, null, 2),
                  response: "200 — { message: '数据已清空' }",
                  errors: "400 — 缺少密码, 401 — 密码错误, 404 — 用户不存在, 500",
                  description: "清空当前用户所有数据（记录、快照、余额、资产、账户、API Key）。需验证当前密码。",
                },
                {
                  method: "POST", path: "/api/user/avatar",
                  auth: "settings:write",
                  body: "FormData — avatar 字段（JPEG/PNG/GIF/WebP，最大 5MB）",
                  response: "200 — { user: { id, email, name, avatar } }",
                  errors: "400 — 文件过大 / 类型不支持, 500",
                  description: "上传头像。上传为 FormData，存储为 base64 数据 URL。",
                },
                {
                  method: "PUT", path: "/api/user/password",
                  auth: "Session 认证（拒绝 API Key）",
                  body: JSON.stringify({ currentPassword: "旧密码", newPassword: "新密码" }, null, 2),
                  response: "200 — { message: 'Password updated successfully' }",
                  errors: "400 — 参数错误, 401 — 当前密码错误, 404 — 用户不存在, 500",
                  description: "修改密码。需验证当前密码。",
                },
                {
                  method: "PUT", path: "/api/user/profile",
                  auth: "settings:write",
                  body: JSON.stringify({ name: "新名称", avatarPresetUrl: "https://api.dicebear.com/xxx" }, null, 2),
                  response: "200 — { user: { id, email, name, avatar } }",
                  errors: "400 — 参数错误, 500",
                  description: "更新用户名称和头像。支持 DiceBear 预设 URL 或直接传入 base64 数据。",
                },
                {
                  method: "GET", path: "/api/admin/users",
                  auth: "管理员（isAdmin=true）",
                  body: undefined,
                  response: "200 — { users: [...], pagination: { page, limit, total, totalPages } }",
                  errors: "401 — 未授权, 403 — 非管理员, 500",
                  description: "管理员：分页查询用户列表。支持 ?search=关键词、?page=1、?limit=20。",
                },
                {
                  method: "POST", path: "/api/admin/users",
                  auth: "管理员（isAdmin=true）",
                  body: JSON.stringify({ email: "new@example.com", password: "123456", name: "新用户", isAdmin: false }, null, 2),
                  response: "201 — { user }（不含密码）",
                  errors: "400 — 参数错误 / 邮箱已存在, 500",
                  description: "管理员：创建新用户。",
                },
                {
                  method: "GET", path: "/api/admin/users/:id",
                  auth: "管理员（isAdmin=true）",
                  body: undefined,
                  response: "200 — { user }（含账户数、API Key 数、文件数统计）",
                  errors: "404 — 用户不存在",
                  description: "管理员：获取用户完整信息。",
                },
                {
                  method: "PUT", path: "/api/admin/users/:id",
                  auth: "管理员（isAdmin=true）",
                  body: JSON.stringify({ name: "更新名称", isAdmin: true }, null, 2),
                  response: "200 — { user }",
                  errors: "400 — 参数错误, 404 — 用户不存在, 500",
                  description: "管理员：更新用户信息（邮箱、名称、管理员状态、密码）。修改密码需同时传 password + newPassword。",
                },
                {
                  method: "DELETE", path: "/api/admin/users/:id",
                  auth: "管理员（isAdmin=true）",
                  body: undefined,
                  response: "200 — { success: true }",
                  errors: "400 — 不能删除自己, 404 — 用户不存在, 500",
                  description: "管理员：删除用户。不能删除自己。",
                },
                {
                  method: "GET", path: "/api/avatars/presets",
                  auth: "无需认证",
                  body: undefined,
                  response: "200 — { presets: [{ seed, style, dataUrl }] }（16 种 DiceBear 风格）",
                  errors: "500",
                  description: "获取 DiceBear 头像预设列表。返回 16 种风格的随机种子 SVG 头像（avataaars、micah、openPeeps、lorelei、adventurer、notionists、miniavs、funEmoji、personas、dylan、bigEars、croodles、toonHead、bottts、pixelArt、bigSmile）。",
                },
              ]}
            />
          </div>
        </div>

        {/* 4. Errors */}
        <Card id="errors">
          <CardHeader>
            <CardTitle className="text-base">4. 错误码</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-normal text-xs uppercase tracking-wider">状态码</th>
                    <th className="text-left py-2 text-muted-foreground font-normal text-xs uppercase tracking-wider">含义</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["400", "请求参数错误：缺少必要字段、格式无效、数据冲突等"],
                    ["401", "未授权：未提供 token、token 无效、API Key 已过期或停用"],
                    ["403", "权限不足：API Key 的 scope 不匹配；或该操作仅支持 Session 认证"],
                    ["404", "资源不存在：指定 ID 的记录未找到"],
                    ["429", "频率限制：登录接口短时间内重复请求"],
                    ["500", "服务端内部错误：数据库异常等"],
                  ].map(([code, desc]) => (
                    <tr key={code} className="border-b border-border hover:bg-muted transition-colors">
                      <td className="py-2.5"><code className="font-mono text-xs text-destructive">{code}</code></td>
                      <td className="py-2.5 text-muted-foreground">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              所有错误响应的 body 格式统一为 <code className="font-mono">{'{ error: "描述信息" }'}</code>。
            </p>
          </CardContent>
        </Card>

        {/* 5. Examples */}
        <Card id="examples">
          <CardHeader>
            <CardTitle className="text-base">5. 调用示例 (curl)</CardTitle>
            <CardDescription>通过 API Key 认证的完整调用流程</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm font-medium text-foreground">注册新用户</span>
              <pre className="mt-1 bg-muted border border-border rounded-[8px] p-3 overflow-x-auto">
                <code className="text-xs text-foreground font-mono leading-relaxed">{`curl -X POST https://example.com/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"email":"user@example.com","password":"123456","name":"用户名"}'`}</code>
              </pre>
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">使用 API Key 获取账户列表</span>
              <pre className="mt-1 bg-muted border border-border rounded-[8px] p-3 overflow-x-auto">
                <code className="text-xs text-foreground font-mono leading-relaxed">{`curl https://example.com/api/accounts \\
  -H "Authorization: Bearer gb_your_api_key_here"`}</code>
              </pre>
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">创建一条收入记录</span>
              <pre className="mt-1 bg-muted border border-border rounded-[8px] p-3 overflow-x-auto">
                <code className="text-xs text-foreground font-mono leading-relaxed">{`curl -X POST https://example.com/api/records \\
  -H "Authorization: Bearer gb_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"date":"2026-06-15T10:00:00.000Z","accountId":"account_id","amount":5000,"type":"INCOME","note":"工资"}'`}</code>
              </pre>
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">生成指定时间点的资产快照</span>
              <pre className="mt-1 bg-muted border border-border rounded-[8px] p-3 overflow-x-auto">
                <code className="text-xs text-foreground font-mono leading-relaxed">{`curl -X POST https://example.com/api/daily-snapshots \\
  -H "Authorization: Bearer gb_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"snapshotAt":"2026-06-15T12:00:00.000Z"}'`}</code>
              </pre>
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">批量导入数据</span>
              <pre className="mt-1 bg-muted border border-border rounded-[8px] p-3 overflow-x-auto">
                <code className="text-xs text-foreground font-mono leading-relaxed">{`curl -X POST https://example.com/api/import \\
  -H "Authorization: Bearer gb_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"data":{"accounts":[{"name":"工行","type":"BANK","assets":[{"name":"活期","type":"DEPOSIT"}]}],"records":[]}}'`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* 6. Workflows */}
        <Card id="workflows">
          <CardHeader>
            <CardTitle className="text-base">6. 典型工作流</CardTitle>
            <CardDescription>常见集成场景的操作顺序</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-sm">
            <div className="border border-border rounded-[12px] p-4 bg-card">
              <div className="font-medium text-foreground mb-2">场景 A：自动化数据采集</div>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>创建 API Key（设置页面勾选 <code className="font-mono text-xs">records:write</code> 和 <code className="font-mono text-xs">snapshots:write</code>）</li>
                <li>定时 <code className="font-mono text-xs">POST /api/records</code> 写入收支流水</li>
                <li>每日 <code className="font-mono text-xs">POST /api/daily-snapshots</code> 生成当日快照</li>
                <li>使用 <code className="font-mono text-xs">GET /api/daily-snapshots</code> 获取趋势数据</li>
              </ol>
            </div>
            <div className="border border-border rounded-[12px] p-4 bg-card">
              <div className="font-medium text-foreground mb-2">场景 B：数据迁移/备份</div>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li><code className="font-mono text-xs">GET /api/accounts/full</code> 导出完整数据</li>
                <li>在新实例上 <code className="font-mono text-xs">POST /api/import</code> 批量导入</li>
                <li>验证导入结果（对比 account 数量和 snapshot 数量）</li>
              </ol>
            </div>
            <div className="border border-border rounded-[12px] p-4 bg-card">
              <div className="font-medium text-foreground mb-2">场景 C：AI 助手查询资产状况</div>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li><code className="font-mono text-xs">GET /api/auth/me</code> 验证身份</li>
                <li><code className="font-mono text-xs">GET /api/accounts</code> 获取所有账户及总资产</li>
                <li><code className="font-mono text-xs">GET /api/daily-snapshots</code> 获取最近快照趋势</li>
                <li><code className="font-mono text-xs">GET /api/records</code> 获取近期流水明细</li>
                <li>汇总以上数据回答用户问题</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Geldborse API v1 · 基于 Next.js App Router · 使用 API Key 认证
          </p>
        </div>
      </main>
    </div>
  )
}