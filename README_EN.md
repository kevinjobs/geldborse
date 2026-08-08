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

- 📊 **Financial Overview** - Dashboard displaying assets, liabilities, and net worth
- 💳 **Multi-Account Management** - Support for cash, bank cards, credit cards, investment accounts, and more
- 📝 **Income & Expense Tracking** - Quickly record daily income and expenses with category management
- 📸 **Asset Snapshots** - Periodically record asset status to track financial trends
- 📈 **Data Visualization** - Charts displaying income/expense trends and asset distribution
- 📤 **Data Export** - Export Excel, PDF reports, and JSON full data
- 📥 **Data Import** - Import historical data
- 🔐 **User Authentication** - Email registration and login with login history
- 🔑 **API Key** - Configurable scopes and expiration
- 👥 **Multi-user Collaboration** - Account sharing with role-based permissions (Owner/Editor/Viewer)
- 🌙 **Dark/Light Theme** - Theme switching support
- 📱 **Responsive Design** - Adapted for desktop and mobile devices

## 🚀 Quick Start

### Requirements

- Bun or npm
- Node.js 18.0+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/geldborse.git
cd geldborse

# Install dependencies
bun install

# Configure environment variables (copy .env.example to .env and edit)
cp .env.example .env

# Configure database
bunx prisma generate
bunx prisma migrate dev
bunx prisma db seed   # (optional) seed sample data

# Start development server
bun dev
```

Open your browser and visit [http://localhost:8888](http://localhost:8888)

### First Time Use

1. Visit the home page and click "Get Started"
2. Register an account (using email)
3. After login, enter the overview page
4. Add your first account
5. Start recording income and expenses

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Frontend | React 19, TypeScript |
| Styling | Tailwind CSS 4, Shadcn UI |
| Database | Prisma 5 + PostgreSQL |
| Auth | Custom JWT + API Key |
| Charts | Recharts |
| Testing | Vitest + React Testing Library |
| Monitoring | Sentry |
| Package Manager | Bun |

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

---

<div align="center">

**Made with ❤️ by Geldborse Team**

</div>