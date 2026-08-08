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

- 📊 **收支总览** - 仪表盘展示资产、负债和净资产状况
- 💳 **多账户管理** - 支持现金、银行卡、信用卡、投资账户等多种类型
- 📝 **收支记录** - 快速记录日常收入和支出，支持分类管理
- 📸 **资产快照** - 定期记录资产状况，追踪财务变化趋势
- 📈 **数据可视化** - 使用图表展示收支趋势和资产分布
- 📤 **数据导出** - 导出 Excel、PDF 财务报表，JSON 全量数据导出
- 📥 **数据导入** - 支持导入历史数据
- 🔐 **用户认证** - 邮箱注册和登录，支持登录历史记录
- 🔑 **API Key** - 可配置作用域和过期时间
- 👥 **多用户协作** - 账户共享，角色权限管理（所有者/编辑者/查看者）
- 🌙 **深色/浅色主题** - 支持主题切换
- 📱 **响应式设计** - 适配桌面和移动设备

## 🚀 快速开始

### 环境要求

- Bun 或 npm
- Node.js 18.0+

### 安装步骤

```bash
# 克隆项目
git clone https://github.com/yourusername/geldborse.git
cd geldborse

# 安装依赖
bun install

# 配置环境变量（复制 .env.example 为 .env 并编辑）
cp .env.example .env

# 配置数据库
bunx prisma generate
bunx prisma migrate dev
bunx prisma db seed   # （可选）填充示例数据

# 启动开发服务器
bun dev
```

打开浏览器访问 [http://localhost:8888](http://localhost:8888)

### 首次使用

1. 访问首页，点击"开始使用"
2. 注册账户（使用邮箱）
3. 登录后进入总览页面
4. 添加第一个账户
5. 开始记录收支

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 前端 | React 19, TypeScript |
| 样式 | Tailwind CSS 4, Shadcn UI |
| 数据库 | Prisma 5 + PostgreSQL |
| 认证 | 自定义 JWT + API Key |
| 图表 | Recharts |
| 测试 | Vitest + React Testing Library |
| 监控 | Sentry |
| 包管理 | Bun |

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

---

<div align="center">

**Made with ❤️ by Geldborse Team**

</div>