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

- 📊 **Financial Overview** - Intuitive dashboard displaying assets, liabilities, and net worth
- 💳 **Multi-Account Management** - Support for cash, bank cards, credit cards, investment accounts, and more
- 📝 **Income & Expense Tracking** - Quickly record daily income and expenses with category management
- 📸 **Asset Snapshots** - Periodically record asset status to track financial trends
- 📈 **Data Visualization** - Use charts to display income/expense trends and asset distribution
- 📤 **Data Export** - Export financial reports in Excel and PDF formats
- 🔐 **User Authentication** - Secure email registration and login system
- 🌙 **Dark Mode** - Support for light/dark theme switching
- 📱 **Responsive Design** - Adapted for desktop and mobile devices

## 🚀 Quick Start

### Requirements

- Node.js 18.0 or higher
- Bun or npm/yarn/pnpm

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/geldborse.git
cd geldborse
```

2. **Install dependencies**

```bash
bun install
# or
npm install
```

3. **Configure database**

```bash
# Generate Prisma client
bunx prisma generate

# Run database migrations
bunx prisma migrate dev

# (Optional) Seed sample data
bunx prisma db seed
```

4. **Start development server**

```bash
bun dev
# or
npm run dev
```

5. **Access the application**

Open your browser and visit [http://localhost:8888](http://localhost:8888)

## 🏗️ Project Structure

```
geldborse/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages (login/register)
│   ├── accounts/          # Account management
│   ├── overview/          # Overview dashboard
│   ├── record/            # Income & expense records
│   ├── snapshots/         # Asset snapshots
│   ├── export/            # Data export
│   ├── settings/          # User settings
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # UI components (Shadcn UI)
│   ├── app-sidebar.tsx   # Sidebar
│   ├── nav-user.tsx      # User navigation
│   └── ...
├── lib/                   # Utilities and configurations
│   ├── auth-context.tsx  # Authentication context
│   └── utils.ts          # Utility functions
├── prisma/               # Prisma database configuration
│   └── schema.prisma     # Database models
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 16.2.1 (App Router)
- **Frontend**: [React](https://react.dev/) 19.2.4, [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) 4.0, [Shadcn UI](https://ui.shadcn.com/)
- **Database**: [Prisma](https://www.prisma.io/) + SQLite
- **Authentication**: bcrypt password encryption
- **Charts**: [Chart.js](https://www.chartjs.org/), [Recharts](https://recharts.org/)
- **Icons**: [Phosphor Icons](https://phosphoricons.com/)
- **Export**: [SheetJS](https://sheetjs.com/) (Excel), [jsPDF](https://parall.ax/products/jspdf) (PDF)

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
| Add Record | `/record/add` | Quickly record income or expenses |
| Records | `/record` | View and manage all income and expense records |
| Accounts | `/accounts` | Manage bank accounts, cash, investments, etc. |
| Snapshots | `/snapshots` | Periodically record asset status |
| Export | `/export` | Export Excel or PDF reports |
| Settings | `/settings` | Modify personal profile |

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
# Database
DATABASE_URL="file:./dev.db"

# App configuration
NEXT_PUBLIC_APP_URL=http://localhost:8888
```

### Custom Configuration

- **Port**: Default is 8888, can be modified in `package.json`
- **Database**: Default is SQLite, can be switched to PostgreSQL, MySQL, etc.

## 🤝 Contributing

Issues and Pull Requests are welcome!

1. Fork this project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Roadmap

- [ ] Multi-currency support
- [ ] Budget management
- [ ] Recurring bill reminders
- [ ] Data import functionality
- [ ] Mobile App
- [ ] Cloud synchronization
- [ ] Multi-user collaboration

## 📄 License

This project is open-sourced under the [MIT](LICENSE) License.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/) - React framework
- [Shadcn UI](https://ui.shadcn.com/) - UI component library
- [Radix UI](https://www.radix-ui.com/) - Low-level UI primitives
- [Phosphor Icons](https://phosphoricons.com/) - Icon library

---

<div align="center">

**Made with ❤️ by Geldborse Team**

</div>
