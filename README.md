# ⚡ Zap-Bot: AI-Powered Meeting Intelligence

Zap-Bot is a premium, production-ready AI meeting assistant that records, transcribes, and analyzes your meetings across Google Meet, Zoom, and Microsoft Teams.

## 🚀 Key Features

- **Real-time Meeting Listening**: Seamlessly join meetings to capture high-fidelity context.
- **PageIndex AI Integration**: Vectorless RAG for instant meeting insights across your entire history.
- **State of the Art Design**: Premium dashboard with glassmorphism and modern dark mode.
- **Automated Workflows**: Automatic Slack/Discord sharing and Project Management (Jira/Asana) synchronization.
- **Calendar Sync**: Background workers to automatically prepare for upcoming meetings.
- **PWA Ready**: Install Zap-Bot on any device for a native-like experience.

## 🛠 Tech Stack

- **Monorepo**: Turborepo
- **Frontend**: Next.js 15, Tailwind CSS, Zustand
- **Backend**: Node.js (Express), Clerk Auth, Prisma (PostgreSQL)
- **AI/RAG**: PageIndex AI API
- **Infrastructure**: AWS (S3, Lambda)
- **Bots**: MeetingBaas Integration

## 📦 Getting Started

### Prerequisites

- Node.js >= 18
- pnpm

### Installation

```sh
pnpm install
```

### Environment Setup

Create `.env` files in `apps/api` and `apps/web` based on the documented deployment guides.

### Development

```sh
pnpm dev
```

## 🧪 Testing

We use **Vitest** for fast unit testing.

Run all tests:
```sh
pnpm test
```

Run specific app tests:
```sh
pnpm --filter api test
pnpm --filter web test
```

## 🚀 Deployment

Zap-Bot is optimized for Vercel (Frontend) and AWS/Render (Backend). Refer to `deployment_guide.md` for full instructions.

---
**Mission Accomplished: Zap-Bot is ready for launch.**
