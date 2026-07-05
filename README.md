# TalentArc 🎯

TalentArc is an AI-powered technical interviewing platform that customizes and conducts technical interviews. By analyzing a candidate's GitHub repositories, TalentArc dynamically tailors technical questions to their real-world experience, conducts an interactive voice interview using the OpenAI Realtime API, and evaluates the candidate's performance.

---

## 🚀 Key Features

- **GitHub Scraper Integration**: Automatically fetches a candidate's public repositories, repository descriptions, and star counts to tailor the interview dynamically to their technical background.
- **Real-Time Voice Interviews**: Connects candidates via WebRTC to OpenAI's Realtime API (`gpt-realtime-2`) for seamless, low-latency audio interviews.
- **LLM-Based Evaluation**: Once the interview is complete, the transcript is analyzed by a structured JSON model (`gpt-5-nano`) to generate feedback and a score from 0 to 10.
- **Modern Monorepo Architecture**: Powered by [Turborepo](https://turbo.build/repo) and [Bun](https://bun.sh/) for ultra-fast builds, package management, and developer workflow.

---

## 📂 Project Structure

This monorepo contains the following packages and applications:

```text
├── apps/
│   ├── frontend/       # Bun + React (React Router, Tailwind CSS, Radix UI, lucide-react)
│   └── backend/        # Express.js + Prisma (PostgreSQL) + OpenAI API
├── packages/
│   ├── ui/             # Shared UI React component library (button, card, code, etc.)
│   ├── eslint-config/  # Shared ESLint configuration
│   └── typescript-config/ # Shared TypeScript configuration
```

---

## 🛠️ Tech Stack

- **Runtime & Package Manager**: [Bun](https://bun.sh/)
- **Monorepo Tooling**: [Turborepo](https://turbo.build/)
- **Frontend**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [React Router v7](https://reactrouter.com/), [Sonner](https://sonner.emilkowal.ski/)
- **Backend**: [Express.js](https://expressjs.com/), [Prisma ORM](https://www.prisma.io/), [OpenAI SDK](https://github.com/openai/openai-node)
- **Database**: [PostgreSQL](https://www.postgresql.org/)

---

## 🏁 Getting Started

### 📋 Prerequisites

Before running the project, make sure you have the following installed:

- **Bun** (v1.3.9 or higher)
- **PostgreSQL** database

### 1. Install Dependencies

Install all dependencies for the apps and packages from the root of the workspace:

```bash
bun install
```

### 2. Configure Environment Variables

Create `.env` files in both frontend and backend directories.

#### Backend Configuration (`apps/backend/.env`)

```env
DATABASE_URL="postgresql://username:password@localhost:5432/talentarc"
OPENAI_API_KEY="your-openai-api-key"
DEEPGRAM_API_KEY="your-deepgram-api-key"
GEMINI_API_KEY="your-gemini-api-key"
```

#### Frontend Configuration (`apps/frontend/.env`)

```env
DEEPGRAM_API_KEY="your-deepgram-api-key"
```

### 3. Run Database Migrations

Apply the database migrations to your PostgreSQL database:

```bash
cd apps/backend
bunx prisma db push
```

---

## 💻 Development Workflow

To manage tasks across the monorepo, use the following workspace-wide commands:

### Start Development Servers

To run both the frontend and backend in development mode with hot reloading:

```bash
bun dev
```

### Build for Production

To build all apps and packages for production:

```bash
bun build
```

### Lint the Codebase

To check the code quality across all packages:

```bash
bun lint
```

### Check Types

To run TypeScript verification:

```bash
bun check-types
```

---

## 🔗 Useful Links

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Prisma ORM Documentation](https://www.prisma.io/docs)
- [OpenAI Realtime API Docs](https://platform.openai.com/docs/guides/realtime)
- [Bun Documentation](https://bun.sh/docs)
