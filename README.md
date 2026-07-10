<div align="center">

# 💰 Geldborse

一款优雅、简洁的个人财务管理工具

[![Next.js](https://img.shields.io/badge/Next.js-16.2.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0+-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0+-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[English](./README_EN.md) | 简体中文

**🤝 本项目由 [wsl2-z](https://github.com/wsl2-z) 与 [Trae AI](https://www.trae.ai/) 协作完成**

</div>

---

## ✨ 功能特性

- 📊 **收支总览** - 直观的仪表盘展示资产、负债和净资产状况，与账户管理页面保持一致的显示
- 💳 **多账户管理** - 支持现金、银行卡、信用卡、投资账户等多种类型，实时显示最新快照总额和收支总额
- 📝 **收支记录** - 快速记录日常收入和支出，支持分类管理
- 📸 **资产快照** - 定期记录资产状况，追踪财务变化趋势，支持时区自动识别
- 📈 **数据可视化** - 使用图表展示收支趋势和资产分布
- 📤 **数据导出** - 支持导出 Excel、PDF 格式的财务报表，以及 JSON 全量数据导出
- 📥 **数据导入** - 支持导入历史数据
- 🔐 **用户认证** - 安全的邮箱注册和登录系统，支持登录历史记录
- 🔑 **API Key** - 支持 API Key 认证，可配置作用域和过期时间
- 👥 **多用户协作** - 支持账户共享，角色权限管理（所有者/编辑者/查看者）
- 🌙 **深色模式** - 支持浅色/深色主题切换
- 📱 **响应式设计** - 适配桌面和移动设备
- 🛡️ **管理后台** - 用户管理面板

## 🚀 快速开始

### 环境要求

- Bun（推荐）或 npm
- Node.js 18.0 或更高版本

### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/yourusername/geldborse.git
cd geldborse
```

2. **安装依赖**

```bash
bun install
```

3. **配置环境变量**

复制 `.env.example` 为 `.env` 并配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 数据库（PostgreSQL）
DATABASE_URL="postgresql://user:password@localhost:5432/geldborse"

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:8888
```

4. **配置数据库**

```bash
# 生成 Prisma 客户端
bunx prisma generate

# 运行数据库迁移
bunx prisma migrate dev

# （可选）填充示例数据
bunx prisma db seed
```

5. **启动开发服务器**

```bash
bun dev
```

6. **访问应用**

打开浏览器访问 [http://localhost:8888](http://localhost:8888)

## 🏗️ 项目结构

```
geldborse/
├── app/                        # Next.js App Router（页面路由）
│   ├── api/                    # API 路由（29个端点）
│   │   ├── auth/               # 认证（login, register, logout, me, login-history）
│   │   ├── accounts/           # 账户 CRUD + /full, /[id]/assets
│   │   ├── assets/             # 资产 CRUD
│   │   ├── balances/           # 余额 CRUD
│   │   ├── records/            # 收支记录 CRUD
│   │   ├── daily-snapshots/    # 每日快照 CRUD
│   │   ├── api-keys/           # API Key 管理
│   │   ├── admin/users/        # 管理员用户管理
│   │   ├── import/             # 数据导入
│   │   ├── export/             # 数据全量导出
│   │   ├── clear-data/         # 数据清除
│   │   └── docs/               # API 文档页面
│   │   ├── accounts/[id]/      # 账户详情/删除、资产 CRUD
│   │   ├── assets/[id]/        # 资产详情/更新/删除
│   │   ├── balances/[id]/      # 余额快照详情/更新/删除
│   │   ├── records/[id]/       # 收支记录详情/更新/删除
│   │   ├── daily-snapshots/[id]/ # 快照详情/删除
│   │   ├── api-keys/[id]/      # API Key 详情/撤销/删除
│   │   └── admin/users/[id]/   # 管理员用户更新/删除
│   ├── auth/                   # 认证页面（登录/注册）
│   ├── overview/               # 总览仪表盘
│   ├── accounts/               # 账户管理
│   ├── record/                 # 收支记录 + 添加记录
│   ├── snapshots/              # 资产快照
│   ├── export/                 # 数据导出
│   ├── settings/               # 用户设置
│   ├── help/                   # 帮助页面
│   └── page.tsx                # 首页（营销页面）
├── components/                 # React 组件
│   ├── ui/                     # 29个 Shadcn UI 组件
│   ├── accounts/               # 账户相关组件
│   ├── app-sidebar.tsx         # 侧边栏导航
│   ├── chart-area-interactive.tsx # 交互式图表
│   ├── data-table.tsx          # 数据表格（TanStack）
│   ├── protected-route.tsx     # 受保护路由
│   ├── responsive-table.tsx    # 响应式表格
│   ├── section-cards.tsx       # KPI 卡片区域
│   ├── site-header.tsx         # 站点头部
│   ├── theme-provider.tsx      # 主题提供者
│   └── theme-toggle.tsx        # 主题切换
├── lib/                        # 工具函数和配置
│   ├── prisma.ts               # Prisma 客户端单例
│   ├── auth.ts                 # 服务端认证（Cookie + API Key）
│   ├── auth-context.tsx        # 客户端认证上下文
│   ├── jwt.ts                  # JWT 令牌处理
│   ├── api-key.ts              # API Key 管理
│   ├── permissions.ts          # 权限/作用域系统
│   ├── rate-limit.ts           # 速率限制
│   ├── account-config.tsx      # 账户配置（中国银行颜色）
│   ├── account-logos.tsx       # 银行 Logo 组件
│   ├── export-utils.ts         # Excel/PDF 导出逻辑
│   ├── format.ts               # 数字/日期格式化
│   └── utils.ts                # 通用工具函数
├── prisma/                     # Prisma 数据库配置
│   ├── schema.prisma           # 9个数据模型
│   └── seed.ts                 # 数据库填充脚本
├── hooks/                      # 自定义 Hook
│   └── use-mobile.ts           # 移动端检测
├── types/                      # TypeScript 类型定义
├── test/                       # 测试配置和 mock
├── scripts/                    # 工具脚本
├── public/                     # 静态资源
└── docs/                       # 项目文档
```

## 🛠️ 技术栈

- **框架**: [Next.js](https://nextjs.org/) 16.2.1 (App Router)
- **前端**: [React](https://react.dev/) 19.2.4, [TypeScript](https://www.typescriptlang.org/)
- **样式**: [Tailwind CSS](https://tailwindcss.com/) 4.0, [Shadcn UI](https://ui.shadcn.com/)
- **数据库**: [Prisma](https://www.prisma.io/) 5 + PostgreSQL
- **认证**: 自定义 JWT + bcrypt，支持 API Key 认证
- **图表**: [Recharts](https://recharts.org/) 2.15, [Chart.js](https://www.chartjs.org/)
- **图标**: [Phosphor Icons](https://phosphoricons.com/), [Lucide React](https://lucide.dev/)
- **导出**: [SheetJS](https://sheetjs.com/) (Excel), [jsPDF](https://parall.ax/products/jspdf) (PDF)
- **测试**: [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/)
- **拖放**: [DnD Kit](https://dndkit.com/)
- **表单验证**: [Zod](https://zod.dev/)
- **通知**: [Sonner](https://sonner.emilkowal.ski/)
- **主题**: [next-themes](https://github.com/pacocoursey/next-themes)
- **监控**: [Sentry](https://sentry.io/)
- **日期处理**: [date-fns](https://date-fns.org/)
- **包管理**: Bun（使用 `registry.npmmirror.com` 镜像）

## 📖 使用指南

### 首次使用

1. 访问首页，点击"开始使用"按钮
2. 注册一个新账户（使用邮箱）
3. 登录后进入总览页面
4. 添加您的第一个账户
5. 开始记录收支

### 核心功能

| 功能 | 路径 | 说明 |
|------|------|------|
| 总览 | `/overview` | 查看资产、负债、净资产和收支趋势 |
| 添加收支 | `/record/add` | 快速记录收入或支出，支持时区自动识别 |
| 收支记录 | `/record` | 查看和管理所有收支记录 |
| 账户管理 | `/accounts` | 管理银行账户、现金、投资等 |
| 资产快照 | `/snapshots` | 定期记录资产状况，追踪财务变化趋势 |
| 数据导出 | `/export` | 导出 Excel、PDF 报表或 JSON 全量数据 |
| 数据导入 | `/api/import` | 导入历史数据 |
| 用户设置 | `/settings` | 修改个人资料 |
| 帮助 | `/help` | 查看使用帮助 |

## 🔧 配置说明

### 环境变量

在 `.env` 文件中配置：

```env
# 数据库（PostgreSQL）
DATABASE_URL="postgresql://user:password@localhost:5432/geldborse"

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:8888

# Sentry（可选）
SENTRY_DSN=""
SENTRY_AUTH_TOKEN=""
```

### 自定义配置

- **端口**: 默认使用 8888 端口，可在 `package.json` 中修改
- **数据库**: PostgreSQL（通过 Prisma ORM）
- **主题**: 在 `app/globals.css` 中修改 CSS 变量自定义主题颜色

## 🧪 测试

```bash
# 运行所有测试
bun test

# 运行测试并监视文件变化
bun test --watch

# 运行单个测试文件
bun test path/to/file.test.ts

# 生成覆盖率报告
bun test --coverage

# 打开测试 UI 界面
bun test:ui
```

更多测试信息请参阅 [TESTING.md](./TESTING.md)。

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📝 开发计划

- [x] 数据导入功能
- [x] 多用户协作（账户共享）
- [x] API Key 认证
- [ ] 多币种支持
- [ ] 预算管理
- [ ] 定期账单提醒
- [ ] 移动端 App
- [ ] 云端同步

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证开源。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [Shadcn UI](https://ui.shadcn.com/) - UI 组件库
- [Radix UI](https://www.radix-ui.com/) - 底层 UI 原语
- [Phosphor Icons](https://phosphoricons.com/) - 图标库
- [Prisma](https://www.prisma.io/) - 数据库 ORM
- [Sentry](https://sentry.io/) - 错误监控

---

<div align="center">

**Made with ❤️ by Geldborse Team**

</div>
