import { NextResponse } from 'next/server'

const md = `# Geldborse API 文档

REST API v1 — 全量接口参考，适用于自动化集成与 AI 工具调用。

---

## 目录

- [1. 认证方式](#1-认证方式)
- [2. API Scope 权限表](#2-api-scope-权限表)
- [3. 端点参考](#3-端点参考)
  - [3.1 认证 Auth](#31-认证-auth)
  - [3.2 账户 Accounts](#32-账户-accounts)
  - [3.3 资产 Assets](#33-资产-assets)
  - [3.4 余额 Balances](#34-余额-balances)
  - [3.5 收支 Records](#35-收支-records)
  - [3.6 快照 Snapshots](#36-快照-snapshots)
  - [3.7 API 密钥](#37-api-密钥)
  - [3.8 导入](#38-导入)
  - [3.9 导出](#39-导出)
  - [3.10 系统 System](#310-系统-system)
- [4. 错误码](#4-错误码)
- [5. 调用示例 (curl)](#5-调用示例-curl)
- [6. 典型工作流](#6-典型工作流)

---

## 1. 认证方式

- **Session**: 登录后自动设置 httpOnly cookie \`auth_token\`，浏览器端自动携带。
- **API Key**: \`Authorization: Bearer gb_xxxxx\` 头传递。在设置页面创建，支持 scope 权限控制。
- **公共接口**: \`/api/auth/login\`、\`/api/auth/register\`、\`/api/auth/logout\` 无需认证。

> 部分敏感操作（API Key 管理、清空数据、修改密码）拒绝 API Key 认证，仅允许 Session 认证。

---

## 2. API Scope 权限表

API Key 可分配的权限范围：

| Scope | 说明 | 分组 |
|-------|------|------|
| \`accounts:read\` | 查看账户 | 账户管理 |
| \`accounts:write\` | 管理账户 | 账户管理 |
| \`records:read\` | 查看收支记录 | 收支记录 |
| \`records:write\` | 管理收支记录 | 收支记录 |
| \`snapshots:read\` | 查看快照 | 快照与资产 |
| \`snapshots:write\` | 管理快照 | 快照与资产 |
| \`assets:read\` | 查看资产 | 快照与资产 |
| \`assets:write\` | 管理资产 | 快照与资产 |
| \`export\` | 导出数据 | 系统 |
| \`settings:read\` | 查看设置 | 系统 |
| \`settings:write\` | 修改设置 | 系统 |
| \`import\` | 导入数据 | 系统 |
| \`read:*\` | 所有只读权限（匹配所有 :read scope） | 通配 |
| \`write:*\` | 所有写入权限（匹配所有 :write scope） | 通配 |

---

## 3. 端点参考

### 3.1 认证 Auth

用户注册、登录、登出与个人信息。

#### POST /api/auth/register

- **认证**: 无需认证
- **描述**: 注册新用户。密码至少 6 位，邮箱唯一。
- **请求体**:
  \`\`\`json
  {
    "email": "user@example.com",
    "password": "123456",
    "name": "用户名"
  }
  \`\`\`
- **响应**: \`201 — { user: { id, email, name, avatar } }\`
- **错误**: \`400 — 参数错误 / 邮箱已存在 / 密码强度不足, 500\`

#### POST /api/auth/login

- **认证**: 无需认证
- **描述**: 用户登录。验证凭据后设置 httpOnly Session cookie，记录登录历史。有 IP 级别频率限制。
- **请求体**:
  \`\`\`json
  {
    "email": "user@example.com",
    "password": "123456"
  }
  \`\`\`
- **响应**: \`200 — { user: { id, email, name, avatar } } + auth_token cookie\`
- **错误**: \`400 — 缺少参数, 401 — 邮箱或密码错误, 429 — 频率限制, 500\`

#### POST /api/auth/logout

- **认证**: 无需认证
- **描述**: 清除当前 Session cookie。
- **请求体**: 无
- **响应**: \`200 — { message: 'Logout successful' } + 清除 cookie\`
- **错误**: \`500\`

#### GET /api/auth/me

- **认证**: 任意认证
- **描述**: 获取当前登录用户信息。
- **请求体**: 无
- **响应**: \`200 — { user: { id, email, name, avatar, isAdmin } }\`
- **错误**: \`401 — 未授权, 404 — 用户不存在\`

#### GET /api/auth/login-history

- **认证**: 任意认证
- **描述**: 获取当前用户的登录历史记录。
- **请求体**: 无
- **响应**: \`200 — LoginHistory[] (最近 20 条)\`
- **错误**: \`500\`

#### POST /api/auth/login-history

- **认证**: 任意认证
- **描述**: 记录一次登录历史，标记之前的会话为非当前。
- **请求体**:
  \`\`\`json
  {
    "ip": "192.168.1.1",
    "userAgent": "Mozilla/5.0",
    "deviceInfo": "Chrome on Linux"
  }
  \`\`\`
- **响应**: \`201 — 创建的 LoginHistory 对象\`
- **错误**: \`500\`

#### DELETE /api/auth/login-history

- **认证**: 任意认证
- **描述**: 删除指定登录历史记录（用于「退出此设备」功能）。
- **请求体**:
  \`\`\`json
  {
    "id": "login_history_id"
  }
  \`\`\`
- **响应**: \`200 — { message: '登出成功' }\`
- **错误**: \`404 — 记录不存在, 500\`

---

### 3.2 账户 Accounts

管理财务账户，支持资产子账户。

#### GET /api/accounts

- **认证**: \`accounts:read\`
- **描述**: 获取当前用户所有账户列表，包含动态计算的总资产、收支汇总、最新快照总额。
- **请求体**: 无
- **响应**: \`200 — Account[]（含计算字段 totalAmount、recordsAfterBalanceTotal、latestSnapshotTotal）\`
- **错误**: \`500\`

#### POST /api/accounts

- **认证**: \`accounts:write\`
- **描述**: 创建账户并附带初始化资产（事务操作）。
- **请求体**:
  \`\`\`json
  {
    "name": "工商银行",
    "type": "BANK",
    "accountNumber": "6222****1234",
    "assets": [
      {
        "name": "活期存款",
        "type": "DEPOSIT",
        "amount": 10000
      }
    ]
  }
  \`\`\`
- **响应**: \`201 — 创建的 Account 对象\`
- **错误**: \`400 — 缺少名称 / 资产名称重复, 500\`

#### GET /api/accounts/:id

- **认证**: \`accounts:read\`
- **描述**: 获取单个账户详情，包含最近的收支记录和所有资产。
- **请求体**: 无
- **响应**: \`200 — Account（含最近 10 条收支记录 + 资产列表）\`
- **错误**: \`404 — 账户不存在\`

#### PUT /api/accounts/:id

- **认证**: \`accounts:write\`
- **描述**: 更新账户基本信息。
- **请求体**:
  \`\`\`json
  {
    "name": "工商银行更新",
    "type": "BANK",
    "accountNumber": "6222****5678"
  }
  \`\`\`
- **响应**: \`200 — 更新后的 Account\`
- **错误**: \`400 — 参数错误, 404 — 账户不存在, 500\`

#### DELETE /api/accounts/:id

- **认证**: \`accounts:write\`
- **描述**: 删除账户及关联资产。如有任何收支记录则拒绝删除。
- **请求体**: 无
- **响应**: \`200 — { success: true }\`
- **错误**: \`400 — 账户有关联记录无法删除, 404 — 账户不存在, 500\`

#### GET /api/accounts/:id/assets

- **认证**: 任意认证
- **描述**: 获取指定账户下的所有资产（不含 scope 校验）。
- **请求体**: 无
- **响应**: \`200 — Asset[]（按 createdAt 降序）\`
- **错误**: \`401 — 未授权, 404 — 账户不存在\`

#### GET /api/accounts/full

- **认证**: \`accounts:read\`
- **描述**: 完整账户数据导出。各字段包含详细的计算中间结果，适合资产计算与校验。
- **请求体**: 无
- **响应**: \`200 — Account[]（含完整资产、余额、收支记录及计算字段）\`
- **错误**: \`500\`

---

### 3.3 资产 Assets

账户下的子资产管理。

#### GET /api/assets

- **认证**: \`assets:read\`
- **描述**: 获取当前用户所有资产。支持 ?accountId=xxx 过滤。
- **请求体**: 无
- **响应**: \`200 — Asset[]（含关联的账户信息）\`
- **错误**: \`500\`

#### POST /api/assets

- **认证**: \`assets:write\`
- **描述**: 在指定账户下创建新资产。
- **请求体**:
  \`\`\`json
  {
    "name": "基金账户",
    "type": "INVESTMENT",
    "amount": 50000,
    "accountId": "account_id"
  }
  \`\`\`
- **响应**: \`201 — 创建的 Asset（含账户信息）\`
- **错误**: \`400 — 参数错误, 500\`

#### GET /api/assets/:id

- **认证**: \`assets:read\`
- **描述**: 获取单个资产详情。
- **请求体**: 无
- **响应**: \`200 — Asset（含账户信息）\`
- **错误**: \`404 — 资产不存在\`

#### PUT /api/assets/:id

- **认证**: \`assets:write\`
- **描述**: 更新资产信息。如果该资产已有余额记录，修改 amount 时会自动创建一条新余额快照。
- **请求体**:
  \`\`\`json
  {
    "name": "基金账户",
    "type": "INVESTMENT",
    "amount": 60000
  }
  \`\`\`
- **响应**: \`200 — 更新后的 Asset（如有余额记录会附带 latestBalance）\`
- **错误**: \`404 — 资产不存在, 500\`

#### DELETE /api/assets/:id

- **认证**: \`assets:write\`
- **描述**: 删除资产。
- **请求体**: 无
- **响应**: \`200 — { success: true }\`
- **错误**: \`404 — 资产不存在, 500\`

---

### 3.4 余额 Balances

资产余额快照记录。

#### GET /api/balances

- **认证**: \`assets:read\`
- **描述**: 获取余额快照列表。支持 ?assetId=xxx 和 ?accountId=xxx 过滤。
- **请求体**: 无
- **响应**: \`200 — Balance[]（含资产和账户信息）\`
- **错误**: \`500\`

#### POST /api/balances

- **认证**: \`assets:write\`
- **描述**: 创建一条余额快照记录。
- **请求体**:
   \`\`\`json
   {
     "amount": 150000,
     "recordedAt": "2026-06-15T10:00:00.000Z",
     "assetId": "asset_id",
     "note": "初始余额"
   }
   \`\`\`
- **响应**: \`201 — 创建的 Balance（含资产信息）\`
- **错误**: \`400 — 参数错误, 500\`

#### GET /api/balances/:id

- **认证**: \`assets:read\`
- **描述**: 获取单条余额快照。
- **请求体**: 无
- **响应**: \`200 — Balance（含资产和账户信息）\`
- **错误**: \`404 — 余额记录不存在\`

#### PUT /api/balances/:id

- **认证**: \`assets:write\`
- **描述**: 更新余额快照。
- **请求体**:
  \`\`\`json
  {
    "amount": 160000,
    "recordedAt": "2026-06-20T10:00:00.000Z",
    "note": "期末调整"
  }
  \`\`\`
- **响应**: \`200 — 更新后的 Balance（含资产信息）\`
- **错误**: \`404 — 余额记录不存在, 500\`

#### DELETE /api/balances/:id

- **认证**: \`assets:write\`
- **描述**: 删除余额快照。
- **请求体**: 无
- **响应**: \`200 — { success: true }\`
- **错误**: \`404 — 余额记录不存在, 500\`

---

### 3.5 收支 Records

收入和支出流水记录。

#### GET /api/records

- **认证**: \`records:read\`
- **描述**: 获取当前用户所有收支记录。
- **请求体**: 无
- **响应**: \`200 — Record[]（含账户信息，按 date 降序）\`
- **错误**: \`500\`

#### POST /api/records

- **认证**: \`records:write\`
- **描述**: 创建收支记录。type=EXPENSE 时 amount 自动取负。
- **请求体**:
  \`\`\`json
  {
    "date": "2026-06-15T10:00:00.000Z",
    "accountId": "account_id",
    "assetId": "asset_id",
    "amount": 5000,
    "type": "INCOME",
    "note": "工资"
  }
  \`\`\`
- **响应**: \`201 — 创建的 Record（含账户信息）\`
- **错误**: \`400 — 参数错误, 500\`

#### GET /api/records/:id

- **认证**: \`records:read\`
- **描述**: 获取单条收支记录。
- **请求体**: 无
- **响应**: \`200 — Record（含账户信息）\`
- **错误**: \`404 — 记录不存在\`

#### PUT /api/records/:id

- **认证**: \`records:write\`
- **描述**: 更新收支记录。
- **请求体**:
  \`\`\`json
  {
    "date": "2026-06-15T10:00:00.000Z",
    "accountId": "account_id",
    "assetId": "asset_id",
    "amount": 5500,
    "type": "INCOME",
    "note": "工资调整"
  }
  \`\`\`
- **响应**: \`200 — 更新后的 Record\`
- **错误**: \`400 — 参数错误, 404 — 记录不存在, 500\`

#### DELETE /api/records/:id

- **认证**: \`records:write\`
- **描述**: 删除收支记录。
- **请求体**: 无
- **响应**: \`200 — { success: true }\`
- **错误**: \`404 — 记录不存在, 500\`

---

### 3.6 快照 Snapshots

每日资产快照。

#### GET /api/daily-snapshots

- **认证**: \`snapshots:read\`
- **描述**: 获取所有资产快照，按 snapshotAt 降序排列。
- **请求体**: 无
- **响应**: \`200 — DailySnapshot[]（含账户和资产信息）\`
- **错误**: \`500\`

#### POST /api/daily-snapshots

- **认证**: \`snapshots:write\`
- **描述**: 生成全账户快照。snapshotAt 可选，默认当前时间。历史快照会按该时间点计算余额。
- **请求体**:
  \`\`\`json
  {
    "snapshotAt": "2026-06-15T12:00:00.000Z"
  }
  \`\`\`
- **响应**: \`200 — { success: true, message, snapshotAt }\`
- **错误**: \`400 — 无效时间 / 未来时间, 500\`

#### DELETE /api/daily-snapshots?snapshotAt=...

- **认证**: \`snapshots:write\`
- **描述**: 删除指定时间戳的所有快照记录。
- **请求体**: 无
- **响应**: \`200 — { success: true, message: '已删除 N 条快照' }\`
- **错误**: \`400 — 缺少 snapshotAt 参数, 500\`

#### DELETE /api/daily-snapshots/:id

- **认证**: \`snapshots:write\`
- **描述**: 删除单条快照记录。
- **请求体**: 无
- **响应**: \`200 — { success: true }\`
- **错误**: \`404 — 快照不存在, 500\`

---

### 3.7 API 密钥

创建和管理 API 访问密钥。

#### GET /api/api-keys

- **认证**: Session 认证（拒绝 API Key）
- **描述**: 获取当前用户的所有 API 密钥列表。
- **请求体**: 无
- **响应**: \`200 — { apiKeys: [...] }\`
- **错误**: \`403 — 不支持 API Key 认证, 500\`

#### POST /api/api-keys

- **认证**: Session 认证（拒绝 API Key）
- **描述**: 创建新 API Key。expiresIn: '24h' | '7d' | '30d' | '90d' | 'never'。fullKey 只在此响应中展示。
- **请求体**:
  \`\`\`json
  {
    "name": "自动化脚本",
    "scopes": ["records:read", "snapshots:read"],
    "expiresIn": "30d"
  }
  \`\`\`
- **响应**: \`200 — { id, name, prefix, scopes, expiresAt, fullKey }（fullKey 仅在此返回）\`
- **错误**: \`400 — 缺少名称 / 无效 scope, 500\`

#### PUT /api/api-keys/:id

- **认证**: Session 认证（拒绝 API Key）
- **描述**: 更新 API Key 的名称、权限或启用状态。
- **请求体**:
  \`\`\`json
  {
    "name": "重命名",
    "scopes": ["records:read"],
    "isActive": true
  }
  \`\`\`
- **响应**: \`200 — 更新后的密钥信息\`
- **错误**: \`400 — 参数错误, 404 — 密钥不存在\`

#### DELETE /api/api-keys/:id

- **认证**: Session 认证（拒绝 API Key）
- **描述**: 撤销（软删除）或 ?permanent=true 永久删除 API Key。
- **请求体**: 无
- **响应**: \`200 — { success: true, message: '已撤销' / '已永久删除' }\`
- **错误**: \`404 — 密钥不存在\`

---

### 3.8 导入

批量导入数据。

#### POST /api/import

- **认证**: \`import\`
- **描述**: 批量导入账户、资产、收支记录和快照。重复数据会自动跳过，无效数据计数但不中断。
- **请求体**:
  \`\`\`json
  {
    "data": {
      "accounts": [
        {
          "name": "账户",
          "type": "BANK",
          "assets": [
            {
              "name": "现金",
              "type": "CASH",
              "amount": 0
            }
          ]
        }
      ],
      "records": [],
      "snapshots": []
    }
  }
  \`\`\`
- **响应**: \`200 — { accounts: N, assets: N, records: N, duplicates: N, invalid: N }\`
- **错误**: \`400 — 数据格式错误, 500\`

---

### 3.9 导出

全量数据导出。

#### GET /api/export

- **认证**: \`import\`
- **描述**: 导出当前用户全部数据为 JSON 格式，包含账户、资产、余额历史、收支记录和每日快照。返回格式与 /api/import 兼容，可直接用于导入。
- **请求体**: 无
- **响应**: \`200 — { exportDate, version: '1.1', data: { accounts, snapshots, records } }\`
- **错误**: \`401 — 未授权, 500\`

---

### 3.10 系统 System

用户设置、清空数据、管理员功能。

#### POST /api/clear-data

- **认证**: Session 认证（拒绝 API Key）
- **描述**: 清空当前用户所有数据（记录、快照、余额、资产、账户、API Key）。需验证当前密码。
- **请求体**:
  \`\`\`json
  {
    "password": "当前密码"
  }
  \`\`\`
- **响应**: \`200 — { message: '数据已清空' }\`
- **错误**: \`400 — 缺少密码, 401 — 密码错误, 404 — 用户不存在, 500\`

#### POST /api/user/avatar

- **认证**: \`settings:write\`
- **描述**: 上传头像。上传为 FormData，存储为 base64 数据 URL。
- **请求体**: FormData — avatar 字段（JPEG/PNG/GIF/WebP，最大 5MB）
- **响应**: \`200 — { user: { id, email, name, avatar } }\`
- **错误**: \`400 — 文件过大 / 类型不支持, 500\`

#### PUT /api/user/password

- **认证**: Session 认证（拒绝 API Key）
- **描述**: 修改密码。需验证当前密码。
- **请求体**:
  \`\`\`json
  {
    "currentPassword": "旧密码",
    "newPassword": "新密码"
  }
  \`\`\`
- **响应**: \`200 — { message: 'Password updated successfully' }\`
- **错误**: \`400 — 参数错误, 401 — 当前密码错误, 404 — 用户不存在, 500\`

#### PUT /api/user/profile

- **认证**: \`settings:write\`
- **描述**: 更新用户名称和头像。支持 DiceBear 预设 URL 或直接传入 base64 数据。
- **请求体**:
  \`\`\`json
  {
    "name": "新名称",
    "avatarPresetUrl": "https://api.dicebear.com/xxx"
  }
  \`\`\`
- **响应**: \`200 — { user: { id, email, name, avatar } }\`
- **错误**: \`400 — 参数错误, 500\`

#### GET /api/admin/users

- **认证**: 管理员（isAdmin=true）
- **描述**: 管理员：分页查询用户列表。支持 ?search=关键词、?page=1、?limit=20。
- **请求体**: 无
- **响应**: \`200 — { users: [...], pagination: { page, limit, total, totalPages } }\`
- **错误**: \`401 — 未授权, 403 — 非管理员, 500\`

#### POST /api/admin/users

- **认证**: 管理员（isAdmin=true）
- **描述**: 管理员：创建新用户。
- **请求体**:
  \`\`\`json
  {
    "email": "new@example.com",
    "password": "123456",
    "name": "新用户",
    "isAdmin": false
  }
  \`\`\`
- **响应**: \`201 — { user }（不含密码）\`
- **错误**: \`400 — 参数错误 / 邮箱已存在, 500\`

#### GET /api/admin/users/:id

- **认证**: 管理员（isAdmin=true）
- **描述**: 管理员：获取用户完整信息。
- **请求体**: 无
- **响应**: \`200 — { user }（含账户数、API Key 数、文件数统计）\`
- **错误**: \`404 — 用户不存在\`

#### PUT /api/admin/users/:id

- **认证**: 管理员（isAdmin=true）
- **描述**: 管理员：更新用户信息（邮箱、名称、管理员状态、密码）。修改密码需同时传 password + newPassword。
- **请求体**:
  \`\`\`json
  {
    "name": "更新名称",
    "isAdmin": true
  }
  \`\`\`
- **响应**: \`200 — { user }\`
- **错误**: \`400 — 参数错误, 404 — 用户不存在, 500\`

#### DELETE /api/admin/users/:id

- **认证**: 管理员（isAdmin=true）
- **描述**: 管理员：删除用户。不能删除自己。
- **请求体**: 无
- **响应**: \`200 — { success: true }\`
- **错误**: \`400 — 不能删除自己, 404 — 用户不存在, 500\`

#### GET /api/avatars/presets

- **认证**: 无需认证
- **描述**: 获取 DiceBear 头像预设列表。返回 16 种风格的随机种子 SVG 头像（avataaars、micah、openPeeps、lorelei、adventurer、notionists、miniavs、funEmoji、personas、dylan、bigEars、croodles、toonHead、bottts、pixelArt、bigSmile）。
- **请求体**: 无
- **响应**: \`200 — { presets: [{ seed, style, dataUrl }] }（16 种 DiceBear 风格）\`
- **错误**: \`500\`

---

## 4. 错误码

| 状态码 | 含义 |
|--------|------|
| \`400\` | 请求参数错误：缺少必要字段、格式无效、数据冲突等 |
| \`401\` | 未授权：未提供 token、token 无效、API Key 已过期或停用 |
| \`403\` | 权限不足：API Key 的 scope 不匹配；或该操作仅支持 Session 认证 |
| \`404\` | 资源不存在：指定 ID 的记录未找到 |
| \`429\` | 频率限制：登录接口短时间内重复请求 |
| \`500\` | 服务端内部错误：数据库异常等 |

> 所有错误响应的 body 格式统一为 \`{ error: "描述信息" }\`。

---

## 5. 调用示例 (curl)

通过 API Key 认证的完整调用流程。

### 注册新用户

\`\`\`bash
curl -X POST https://example.com/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"email":"user@example.com","password":"123456","name":"用户名"}'
\`\`\`

### 使用 API Key 获取账户列表

\`\`\`bash
curl https://example.com/api/accounts \\
  -H "Authorization: Bearer gb_your_api_key_here"
\`\`\`

### 创建一条收入记录

\`\`\`bash
curl -X POST https://example.com/api/records \\
  -H "Authorization: Bearer gb_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"date":"2026-06-15T10:00:00.000Z","accountId":"account_id","amount":5000,"type":"INCOME","note":"工资"}'
\`\`\`

### 生成指定时间点的资产快照

\`\`\`bash
curl -X POST https://example.com/api/daily-snapshots \\
  -H "Authorization: Bearer gb_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"snapshotAt":"2026-06-15T12:00:00.000Z"}'
\`\`\`

### 导出全量数据

\`\`\`bash
curl https://example.com/api/export \\
  -H "Authorization: Bearer gb_your_api_key_here"
\`\`\`

### 批量导入数据

\`\`\`bash
curl -X POST https://example.com/api/import \\
  -H "Authorization: Bearer gb_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"data":{"accounts":[{"name":"工行","type":"BANK","assets":[{"name":"活期","type":"DEPOSIT"}]}],"records":[]}}'
\`\`\`

---

## 6. 典型工作流

### 场景 A：自动化数据采集

1. 创建 API Key（设置页面勾选 \`records:write\` 和 \`snapshots:write\`）
2. 定时 \`POST /api/records\` 写入收支流水
3. 每日 \`POST /api/daily-snapshots\` 生成当日快照
4. 使用 \`GET /api/daily-snapshots\` 获取趋势数据

### 场景 B：数据迁移/备份

1. \`GET /api/export\` 导出全量数据（兼容导入格式）
2. 在新实例上 \`POST /api/import\` 批量导入
3. 验证导入结果（对比 account 数量和 snapshot 数量）

### 场景 C：AI 助手查询资产状况

1. \`GET /api/auth/me\` 验证身份
2. \`GET /api/accounts\` 获取所有账户及总资产
3. \`GET /api/daily-snapshots\` 获取最近快照趋势
4. \`GET /api/records\` 获取近期流水明细
5. 汇总以上数据回答用户问题

---

*Geldborse API v1 · 基于 Next.js App Router · 使用 API Key 认证*
`

export async function GET() {
  return new NextResponse(md, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
