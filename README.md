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
- 📤 **数据导出** - 支持导出 Excel 和 PDF 格式的财务报表
- 🔐 **用户认证** - 安全的邮箱注册和登录系统，支持登录历史记录
- 🌙 **深色模式** - 支持浅色/深色主题切换
- 📱 **响应式设计** - 适配桌面和移动设备

## 🚀 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- Bun 或 npm/yarn/pnpm

### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/yourusername/geldborse.git
cd geldborse
```

2. **安装依赖**

```bash
bun install
# 或
npm install
```

3. **配置数据库**

```bash
# 生成 Prisma 客户端
bunx prisma generate

# 运行数据库迁移
bunx prisma migrate dev

# （可选）填充示例数据
bunx prisma db seed
```

4. **启动开发服务器**

```bash
bun dev
# 或
npm run dev
```

5. **访问应用**

打开浏览器访问 [http://localhost:8888](http://localhost:8888)

## 🏗️ 项目结构

```
geldborse/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── auth/              # 认证页面（登录/注册）
│   ├── accounts/          # 账户管理
│   ├── dashboard/         # 仪表盘
│   ├── export/            # 数据导出
│   ├── home/              # 首页
│   ├── overview/          # 总览仪表盘
│   ├── record/            # 收支记录
│   ├── settings/          # 用户设置
│   ├── snapshots/         # 资产快照
│   ├── page.tsx           # 首页
│   └── (root)/            # 根路由
├── components/            # React 组件
│   ├── ui/               # UI 组件（Shadcn UI）
│   ├── app-sidebar.tsx   # 侧边栏
│   ├── chart-area-interactive.tsx # 交互式图表
│   ├── data-table.tsx     # 数据表格
│   ├── logo.tsx           # 项目logo
│   ├── nav-documents.tsx  # 文档导航
│   ├── nav-main.tsx       # 主导航
│   ├── nav-secondary.tsx  # 次要导航
│   ├── nav-user.tsx       # 用户导航
│   ├── protected-route.tsx # 受保护路由
│   ├── responsive-table.tsx # 响应式表格
│   ├── section-cards.tsx  # 卡片部分
│   ├── site-header.tsx    # 站点头部
│   ├── theme-provider.tsx # 主题提供者
│   └── theme-toggle.tsx   # 主题切换
├── lib/                   # 工具函数和配置
│   ├── account-config.tsx # 账户配置
│   ├── account-logos.tsx  # 账户图标
│   ├── auth-context.tsx   # 认证上下文
│   ├── auth.ts            # 认证工具
│   ├── prisma.ts          # Prisma 客户端
│   └── utils.ts           # 工具函数
├── prisma/               # Prisma 数据库配置
│   └── schema.prisma     # 数据库模型
├── public/               # 静态资源
└── test/                 # 测试文件
```

## 🛠️ 技术栈

- **框架**: [Next.js](https://nextjs.org/) 16.2.1 (App Router)
- **前端**: [React](https://react.dev/) 19.2.4, [TypeScript](https://www.typescriptlang.org/)
- **样式**: [Tailwind CSS](https://tailwindcss.com/) 4.0, [Shadcn UI](https://ui.shadcn.com/)
- **数据库**: [Prisma](https://www.prisma.io/) + SQLite
- **认证**: bcrypt 密码加密，支持登录历史记录
- **图表**: [Chart.js](https://www.chartjs.org/), [Recharts](https://recharts.org/)
- **图标**: [Phosphor Icons](https://phosphoricons.com/), [Lucide React](https://lucide.dev/)
- **导出**: [SheetJS](https://sheetjs.com/) (Excel), [jsPDF](https://parall.ax/products/jspdf) (PDF)
- **测试**: [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/)
- **拖放**: [DnD Kit](https://dndkit.com/)
- **表单验证**: [Zod](https://zod.dev/)
- **通知**: [Sonner](https://sonner.emilkowal.ski/)
- **主题**: [next-themes](https://github.com/pacocoursey/next-themes)
- **时区处理**: 自动识别和使用本地时区，确保日期时间显示准确

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
| 总览 | `/overview` | 查看资产、负债、净资产和收支趋势，与账户管理页面保持一致的显示 |
| 添加收支 | `/record/add` | 快速记录收入或支出，支持时区自动识别 |
| 收支记录 | `/record` | 查看和管理所有收支记录 |
| 账户管理 | `/accounts` | 管理银行账户、现金、投资等，实时显示最新快照总额和收支总额 |
| 资产快照 | `/snapshots` | 定期记录资产状况，追踪财务变化趋势 |
| 数据导出 | `/export` | 导出 Excel 或 PDF 报表 |
| 用户设置 | `/settings` | 修改个人资料 |
| 登录历史 | `/settings/security` | 查看登录历史记录，增强账户安全性 |

## 🔧 配置说明

### 环境变量

创建 `.env.local` 文件：

```env
# 数据库
DATABASE_URL="file:./dev.db"

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:8888
```

### 自定义配置

- **端口**: 默认使用 8888 端口，可在 `package.json` 中修改
- **数据库**: 默认使用 SQLite，可更换为 PostgreSQL、MySQL 等

## 🧪 测试

```bash
# 运行所有测试
bun test

# 运行测试并监视文件变化
bun test --watch

# 生成覆盖率报告
bun test:coverage

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

- [ ] 多币种支持
- [ ] 预算管理
- [ ] 定期账单提醒
- [ ] 数据导入功能
- [ ] 移动端 App
- [ ] 云端同步
- [ ] 多用户协作

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证开源。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [Shadcn UI](https://ui.shadcn.com/) - UI 组件库
- [Radix UI](https://www.radix-ui.com/) - 底层 UI 原语
- [Phosphor Icons](https://phosphoricons.com/) - 图标库

---

<div align="center">

**Made with ❤️ by Geldborse Team**

</div>
