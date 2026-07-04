<div align="center">

# 💰 Geldborse

An elegant and simple personal finance management tool

[![Next.js](https://img.shields.io/badge/Next.js-16.2.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0+-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0+-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

English | [简体中文](./README.md)

**🤝 This project is a collaboration between [wsl2-z](https://github.com/wsl2-z) and [Trae AI](https://www.trae.ai/)**

</div>

---

## ✨ Features

- 📊 **Financial Overview** - Intuitive dashboard displaying assets, liabilities, and net worth with consistent display across account management
- 💳 **Multi-Account Management** - Support for cash, bank cards, credit cards, investment accounts, and more, with real-time snapshot and transaction totals
- 📝 **Income & Expense Tracking** - Quickly record daily income and expenses with category management
- 📸 **Asset Snapshots** - Periodically record asset status to track financial trends with timezone auto-detection
- 📈 **Data Visualization** - Use charts to display income/expense trends and asset distribution
- 📤 **Data Export** - Export financial reports in Excel and PDF formats
- 📥 **Data Import** - Import historical data
- 🔐 **User Authentication** - Secure email registration and login system with login history tracking
- 🔑 **API Key** - API key authentication with configurable scopes and expiration
- 👥 **Multi-user Collaboration** - Account sharing with role-based permissions (Owner/Editor/Viewer)
- 🌙 **Dark Mode** - Support for light/dark theme switching
- 📱 **Responsive Design** - Adapted for desktop and mobile devices
- 🛡️ **Admin Panel** - User management dashboard

## 🚀 Quick Start

### Requirements

- Bun (recommended) or npm
- Node.js 18.0 or higher

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/geldborse.git
cd geldborse
```

2. **Install dependencies**

```bash
bun install
```

3. **Configure environment variables**

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` file:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/geldborse"

# App configuration
NEXT_PUBLIC_APP_URL=http://localhost:8888
```

4. **Configure database**

```bash
# Generate Prisma client
bunx prisma generate

# Run database migrations
bunx prisma migrate dev

# (Optional) Seed sample data
bunx prisma db seed
```

5. **Start development server**

```bash
bun dev
```

6. **Access the application**

Open your browser and visit [http://localhost:8888](http://localhost:8888)

## 🏗️ Project Structure

```
geldborse/
├── app/                        # Next.js App Router (page routes)
│   ├── api/                    # API routes (28 endpoints)
│   │   ├── auth/               # Auth (login, register, logout, me, login-history)
│   │   ├── accounts/           # Account CRUD + /full, /[id]/assets
│   │   ├── assets/             # Asset CRUD
│   │   ├── balances/           # Balance CRUD
│   │   ├── records/            # Transaction CRUD
│   │   ├── daily-snapshots/    # Daily snapshot CRUD
│   │   ├── api-keys/           # API key management
│   │   ├── admin/users/        # Admin user management
│   │   ├── import/             # Data import
│   │   ├── clear-data/         # Data clearing
│   │   └── docs/               # API documentation page
│   ├── auth/                   # Authentication pages (login/register)
│   ├── overview/               # Overview dashboard
│   ├── accounts/               # Account management
│   ├── record/                 # Income & expense records + add
│   ├── snapshots/              # Asset snapshots
│   ├── export/                 # Data export
│   ├── settings/               # User settings
│   ├── help/                   # Help page
│   └── page.tsx                # Landing page (marketing)
├── components/                 # React components
│   ├── ui/                     # 29 Shadcn UI components
│   ├── accounts/               # Account-related components
│   ├── app-sidebar.tsx         # Sidebar navigation
│   ├── chart-area-interactive.tsx # Interactive chart
│   ├── data-table.tsx          # Data table (TanStack)
│   ├── protected-route.tsx     # Protected route
│   ├── responsive-table.tsx    # Responsive table
│   ├── section-cards.tsx       # KPI cards section
│   ├── site-header.tsx         # Site header
│   ├── theme-provider.tsx      # Theme provider
│   └── theme-toggle.tsx        # Theme toggle
├── lib/                        # Utilities and configurations
│   ├── prisma.ts               # Prisma client singleton
│   ├── auth.ts                 # Server-side auth (Cookie + API Key)
│   ├── auth-context.tsx        # Client auth context
│   ├── jwt.ts                  # JWT token handling
│   ├── api-key.ts              # API key management
│   ├── permissions.ts          # Permission/scope system
│   ├── rate-limit.ts           # Rate limiting
│   ├── account-config.tsx      # Account config (Chinese bank colors)
│   ├── account-logos.tsx       # Bank logo components
│   ├── export-utils.ts         # Excel/PDF export logic
│   ├── format.ts               # Number/date formatting
│   └── utils.ts                # General utilities
├── prisma/                     # Prisma database configuration
│   ├── schema.prisma           # 8 data models
│   └── seed.ts                 # Database seeder
├── hooks/                      # Custom hooks
│   └── use-mobile.ts           # Mobile detection
├── types/                      # TypeScript type definitions
├── test/                       # Test config and mocks
├── scripts/                    # Utility scripts
├── public/                     # Static assets
└── docs/                       # Project documentation
```

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 16.2.1 (App Router)
- **Frontend**: [React](https://react.dev/) 19.2.4, [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) 4.0, [Shadcn UI](https://ui.shadcn.com/)
- **Database**: [Prisma](https://www.prisma.io/) 5 + PostgreSQL
- **Authentication**: Custom JWT + bcrypt, API key authentication
- **Charts**: [Recharts](https://recharts.org/) 2.15, [Chart.js](https://www.chartjs.org/)
- **Icons**: [Phosphor Icons](https://phosphoricons.com/), [Lucide React](https://lucide.dev/)
- **Export**: [SheetJS](https://sheetjs.com/) (Excel), [jsPDF](https://parall.ax/products/jspdf) (PDF)
- **Testing**: [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/)
- **Drag & Drop**: [DnD Kit](https://dndkit.com/)
- **Form Validation**: [Zod](https://zod.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Themes**: [next-themes](https://github.com/pacocoursey/next-themes)
- **Monitoring**: [Sentry](https://sentry.io/)
- **Date Handling**: [date-fns](https://date-fns.org/)
- **Package Manager**: Bun (using `registry.npmmirror.com` mirror)

## 📖 User Guide

### First Time Use

1. Visit the home page and click the "Get Started" button
2. Register a new account (using email)
3. After login, enter the overview page
4. Add your first account
5. Start recording income and expenses

### Core Features

| Feature | Path | Description |
|---------|------|-------------|
| Overview | `/overview` | View assets, liabilities, net worth, and income/expense trends |
| Add Record | `/record/add` | Quickly record income or expenses with timezone auto-detection |
| Records | `/record` | View and manage all income and expense records |
| Accounts | `/accounts` | Manage bank accounts, cash, investments, etc. |
| Snapshots | `/snapshots` | Periodically record asset status and track financial trends |
| Export | `/export` | Export Excel or PDF reports |
| Import | `/api/import` | Import historical data |
| Settings | `/settings` | Modify personal profile |
| Help | `/help` | View usage documentation |

## 🔧 Configuration

### Environment Variables

Configure in `.env` file:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/geldborse"

# App configuration
NEXT_PUBLIC_APP_URL=http://localhost:8888

# Sentry (optional)
SENTRY_DSN=""
SENTRY_AUTH_TOKEN=""
```

### Custom Configuration

- **Port**: Default is 8888, can be modified in `package.json`
- **Database**: PostgreSQL (via Prisma ORM)
- **Theme**: Customize theme colors in `app/globals.css` CSS variables

## 🤝 Contributing

Issues and Pull Requests are welcome!

1. Fork this project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Roadmap

- [x] Data import functionality
- [x] Multi-user collaboration (account sharing)
- [x] API key authentication
- [ ] Multi-currency support
- [ ] Budget management
- [ ] Recurring bill reminders
- [ ] Mobile App
- [ ] Cloud synchronization

## 📄 License

This project is open-sourced under the [MIT](LICENSE) License.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/) - React framework
- [Shadcn UI](https://ui.shadcn.com/) - UI component library
- [Radix UI](https://www.radix-ui.com/) - Low-level UI primitives
- [Phosphor Icons](https://phosphoricons.com/) - Icon library
- [Prisma](https://www.prisma.io/) - Database ORM
- [Sentry](https://sentry.io/) - Error monitoring

---

<div align="center">

**Made with ❤️ by Geldborse Team**

</div>
