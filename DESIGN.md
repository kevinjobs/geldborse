# Geldborse 设计系统

## 1. 项目概述

Geldborse 是一款面向中文用户的个人财务管理应用，帮助用户追踪收支、管理多账户资产、查看资产快照、导出财务数据。应用默认深色主题，整体风格简洁、克制、专业。

---

## 2. 色彩体系

### 深色模式（默认，`:root`）

| 用途 | 色值 | Tailwind 变量 |
|------|------|---------------|
| 页面背景 | `#121212` | `--background` |
| 卡片/弹出层背景 | `#1E1E1E` | `--card` / `--popover` |
| 边框/输入框边框 | `#2C2C2E` | `--border` / `--input` |
| 强调色（主色） | `#00E5FF` | `--primary` |
| 辅助色（成功/收入） | `#32D74B` | `--secondary` |
| 危险/警告色 | `#FF453A` | `--destructive` |
| 成功色 | `#32D74B` | `--success` |
| 警告色 | `#FFD60A` | `--warning` |
| 信息色 | `#00E5FF` | `--info` |
| 文字主色 | `#FFFFFF` | `--foreground` |
| 文字次色 | `#98989D` | `--muted-foreground` |
| 悬停/禁用背景 | `#252525` | `--muted` |
| 焦点环色 | `#00E5FF` | `--ring` |

#### 图表色板（深色模式）

| 序号 | 色值 | 用途 |
|------|------|------|
| chart-1 | `#00E5FF` | 青色（主数据线） |
| chart-2 | `#32D74B` | 绿色（增长/收入） |
| chart-3 | `#FFD60A` | 黄色 |
| chart-4 | `#FF9F0A` | 橙色 |
| chart-5 | `#FF453A` | 红色（下降/支出） |

#### 侧边栏（深色模式）

| 用途 | 色值 |
|------|------|
| 侧边栏背景 | `#1E1E1E` |
| 侧边栏边框 | `#2C2C2E` |
| 侧边栏悬停 | `#252525` |
| 侧边栏强调 | `#00E5FF` |

#### 阴影（深色模式）

| 名称 | 值 |
|------|-----|
| subtle | `0 1px 2px 0 rgb(0 0 0 / 0.3)` |
| medium | `0 4px 12px -2px rgb(0 0 0 / 0.4)` |
| large | `0 12px 32px -4px rgb(0 0 0 / 0.5)` |
| overlay | `0 0 0 9999px rgb(0 0 0 / 0.6)` |
| code | `inset 0 0 0 1px #2C2C2E` |

### 浅色模式（`.light` 类）

| 用途 | 色值 | Tailwind 变量 |
|------|------|---------------|
| 页面背景 | `#F5F5F5` | `--background` |
| 卡片/弹出层背景 | `#FFFFFF` | `--card` / `--popover` |
| 边框/输入框边框 | `#D1D1D6` | `--border` / `--input` |
| 强调色（主色） | `#007AFF` | `--primary` |
| 辅助色（成功/收入） | `#34C759` | `--secondary` |
| 危险色 | `#FF3B30` | `--destructive` |
| 成功色 | `#34C759` | `--success` |
| 警告色 | `#FF9500` | `--warning` |
| 信息色 | `#007AFF` | `--info` |
| 文字主色 | `#1C1C1E` | `--foreground` |
| 文字次色 | `#6C6C70` | `--muted-foreground` |
| 悬停/禁用背景 | `#E8E8ED` | `--muted` / `--accent` |
| 焦点环色 | `#007AFF` | `--ring` |

#### 图表色板（浅色模式）

| 序号 | 色值 |
|------|------|
| chart-1 | `#007AFF` |
| chart-2 | `#34C759` |
| chart-3 | `#FF9500` |
| chart-4 | `#AF52DE` |
| chart-5 | `#FF3B30` |

#### 阴影（浅色模式）

| 名称 | 值 |
|------|-----|
| subtle | `0 1px 2px 0 rgb(0 0 0 / 0.05)` |
| medium | `0 4px 12px -2px rgb(0 0 0 / 0.08)` |
| large | `0 12px 32px -4px rgb(0 0 0 / 0.12)` |
| overlay | `0 0 0 9999px rgb(0 0 0 / 0.3)` |
| code | `inset 0 0 0 1px #D1D1D6` |

---

## 3. 排版

### 字体配置

通过 `next/font/google` 加载，CSS 变量注入到 `globals.css` 的 `@theme` 块：

| 用途 | 字体 | CSS 变量 | Tailwind class |
|------|------|----------|----------------|
| 正文/通用 | Inter Regular | `--font-sans` | `font-sans` |
| 标题 | Inter Semi Bold | `--font-heading` | `font-heading` |
| 数字/金额/代码 | Fira Code | `--font-mono` | `font-mono` |

### 排版规范

- **页面标题**：`font-heading`（Inter Semi Bold），24px
- **卡片标题**：`font-heading`，18px
- **正文**：`font-sans`（Inter Regular），14px
- **数字与金额**：`font-mono`（Fira Code），等宽排列，对齐美观
- **辅助文字**：`--muted-foreground`（`#98989D` / `#6C6C70`），12px

---

## 4. 间距系统

基于 8px 网格的倍数系统：

| Token | 值 | 常见用途 |
|-------|-----|---------|
| 1 | 4px | 图标与文字间距 |
| 2 | 8px | 紧凑内边距、小间距 |
| 3 | 12px | 列表项间距 |
| 4 | 16px | 卡片内边距（紧凑）、段落间距 |
| 5 | 20px | 卡片标准内边距 |
| 6 | 24px | 页面区域间距 |
| 8 | 32px | 页面边距、大区块分隔 |

---

## 5. 组件规范

### 卡片（Card）

```css
border-radius: 16px;        /* rounded-[16px] */
padding: 20px;              /* p-5 */
border: 1px solid #2C2C2E;  /* border-[#2C2C2E] */
background: #1E1E1E;        /* bg-card */
box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.3);
```

### 表格（Table）

```css
行边框: border-b 1px solid #2C2C2E;
悬停行: bg-[#252525];
表头: muted-foreground 色 (#98989D)，font-heading，12px，大写或加粗
```

### 弹出层（Popover/Modal）

```css
背景: #1E1E1E;
边框: 1px solid #2C2C2E;
阴影: shadow-medium;
遮罩: shadow-overlay;
```

### 输入框（Input）

```css
背景: #1E1E1E (深色) / #FFFFFF (浅色);
边框: 1px solid #2C2C2E (深色) / #D1D1D6 (浅色);
焦点环: ring 2px #00E5FF;
```

### 图标

| 优先级 | 库 | 说明 |
|--------|-----|------|
| 主选 | `@phosphor-icons/react` | 与 Shadcn v4 配置一致 |
| 辅助 | `lucide-react` | 部分 Shadcn 组件内部使用 |

### 图表

- 图表库：**Recharts**（主要），Chart.js（已安装但备用）
- 图表网格线：`#2C2C2E`
- 主数据线：`#00E5FF`
- 区域填充：`#00E5FF` 低透明度
- 趋势展示：优先使用面积图（Area Chart）

### 动画

| 名称 | 效果 | 时长 |
|------|------|------|
| `animate-fade-in` | 淡入 | 0.5s ease-in-out |
| `animate-slide-in` | 从下方滑入 | 0.4s ease-out |
| `animate-scale-in` | 缩放淡入 | 0.3s ease-out |
| `animate-hover-lift` | 悬停上浮 2px | 0.2s |
| `animate-transition-colors` | 颜色渐变 | 0.2s |

---

## 6. 规范与禁忌

### 应该

- **深色模式作为默认**：`:root` 即为深色主题，浅色模式通过 `.light` 类切换
- **数字与金额使用等宽字体**：`font-mono`（Fira Code），确保金额列对齐
- **使用面积图展示趋势**：资产变化、收支趋势优先使用 Recharts AreaChart
- **金额使用 Float 类型：数据库 schema 定义为 Float，前端计算使用 parseFloat
- **使用 8px 倍数间距**：保持界面节奏一致
- **银行品牌色**：参考 `lib/account-config.tsx` 中定义的各银行品牌色
- **移动端适配**：断点 768px，使用 `use-mobile.ts` hook 判断

### 禁忌

- **不使用柔和色/白色背景**：深色主题下避免任何接近白色的背景色
- **不使用花哨动画**：保持专业克制，只在必要时使用 fade-in 或 slide-in
- **不在金额计算中使用 Float**：必须使用 Prisma Decimal / 字符串传递
- **不引入新的 lint 错误**：特别是 `no-explicit-any`
- **不手动安装 Shadcn 组件**：使用 `shadcn add` 命令
- **不使用 npm**：全局使用 bun

---

## 7. 技术栈速查

| 类别 | 技术 |
|------|------|
| 框架 | Next.js (App Router) |
| 样式 | Tailwind CSS v4 (`@tailwindcss/postcss`) |
| 组件库 | Shadcn v4（`radix-mira` 风格） |
| 图标 | Phosphor Icons（主）+ Lucide（辅） |
| 图表 | Recharts（主）+ Chart.js（备） |
| 数据库 | Prisma 5 + PostgreSQL |
| 测试 | Vitest + jsdom |
| 包管理 | Bun |
| 语言 | TypeScript |

---

## 8. 目录结构

```
/app/                    # Next.js App Router 页面
  /overview              # 资产总览
  /accounts              # 账户管理
  /record                # 流水记录
  /record/add            # 添加记录
  /snapshots             # 资产快照
  /export                # 数据导出
  /settings              # 设置
  /auth/login            # 登录
  /auth/register         # 注册
  /api/                  # RESTful API 路由
/components              # 应用级组件
/components/ui/          # Shadcn UI 组件
/lib/                    # 工具库、认证、Prisma 客户端
/prisma/                 # 数据库 Schema 与迁移
```
