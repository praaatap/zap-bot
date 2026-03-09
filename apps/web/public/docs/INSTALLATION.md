# Zap Bot Installation & Setup Guide

## Prerequisites

- **Node.js**: v18.17 or higher
- **pnpm**: v8.0 or higher (package manager)
- **PostgreSQL**: v14 or higher (database)
- **Git**: For cloning the repository

---

## Quick Start (10 minutes)

### 1. Clone and Install

```bash
# Clone repository
git clone https://github.com/yourorg/zap-bot.git
cd zap-bot

# Install dependencies
pnpm install

# Navigate to web app
cd apps/web
```

### 2. Set Up Environment Variables

Create `.env` file with required variables:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Google Calendar Integration
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/callback
NEXT_PUBLIC_APP_URL=http://localhost:3000

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/zapbot
```

### 3. Set Up Database

```bash
# Generate Prisma Client
pnpm prisma generate

# Run migrations
pnpm prisma migrate deploy

# (Optional) Seed sample data
pnpm prisma db seed
```

### 4. Start Development Server

```bash
# From apps/web directory
pnpm dev
```

Visit `http://localhost:3000` and sign up!

---

## Detailed Setup Instructions

### Step 1: Get Clerk Credentials

1. Go to [clerk.com](https://clerk.com)
2. Sign up and create a new application
3. Select "Next.js" as your framework
4. Copy API keys from the dashboard
5. Add to `.env`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

### Step 2: Get Google OAuth Credentials

#### 2.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: **Zap Bot**
3. Enable **Google Calendar API**
   - Search "Google Calendar API"
   - Click "Enable"

#### 2.2 Create OAuth 2.0 Credentials

1. Go to **Credentials** in left sidebar
2. Click **+ Create Credentials** → **OAuth client ID**
3. Choose **Web application**
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/calendar/callback`
5. Copy **Client ID** and **Client Secret**

#### 2.3 Add to Environment

```bash
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/callback
```

### Step 3: Set Up PostgreSQL Database

#### Option A: Docker (Recommended)

```bash
# Start PostgreSQL container
docker run --name zap-bot-db \
  -e POSTGRES_USER=zapbot \
  -e POSTGRES_PASSWORD=localdevpassword \
  -e POSTGRES_DB=zapbot \
  -p 5432:5432 \
  -d postgres:15

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://zapbot:localdevpassword@localhost:5432/zapbot
```

#### Option B: Local PostgreSQL

```bash
# Create database
createdb zapbot

# Create user
createuser zapbot -P  # (enter password when prompted)

# Grant privileges
psql -d zapbot -c "GRANT ALL PRIVILEGES ON DATABASE zapbot TO zapbot;"

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://zapbot:yourpassword@localhost:5432/zapbot
```

### Step 4: Initialize Prisma

```bash
# Generate Prisma Client
pnpm prisma generate

# Create schema in database
pnpm prisma migrate deploy

# (Optional) Open Prisma Studio to view database
pnpm prisma studio
```

### Step 5: Start Development

```bash
# From apps/web directory
pnpm dev

# Server runs at http://localhost:3000
```

---

## Project Structure

```
zap-bot/
├── apps/
│   ├── web/                    # Next.js frontend + API routes
│   │   ├── app/
│   │   │   ├── dashboard/      # Dashboard pages
│   │   │   │   ├── calendar/   # Calendar integration
│   │   │   │   ├── page.tsx    # Main dashboard
│   │   │   │   └── ...
│   │   │   ├── api/            # API routes
│   │   │   │   ├── calendar/   # Google Calendar APIs
│   │   │   │   ├── meetings/   # Meeting APIs
│   │   │   │   ├── bot/        # Bot dispatch
│   │   │   │   └── ...
│   │   │   ├── page.tsx        # Landing page
│   │   │   └── layout.tsx      # Root layout
│   │   ├── components/         # Reusable React components
│   │   ├── lib/                # Utility functions
│   │   │   ├── prisma.ts       # Database client
│   │   │   ├── meeting-baas.ts # Bot service integration
│   │   │   └── ...
│   │   ├── prisma/             # Database schema
│   │   │   └── schema.prisma   # Prisma schema
│   │   ├── public/             # Static assets & docs
│   │   │   ├── docs/           # Documentation
│   │   │   │   ├── USER_GUIDE.md
│   │   │   │   ├── API_REFERENCE.md
│   │   │   │   └── ...
│   │   └── .env               # Environment variables
│   ├── api/                    # (Future) Separate API server
│   └── lambda/                 # (Future) AWS Lambda functions
├── packages/                   # Shared packages
├── pnpm-workspace.yaml         # Monorepo configuration
└── README.md
```

---

## Available Commands

### Development

```bash
# Start dev server
pnpm dev

# Start with turbo (monorepo)
pnpm dev:all
```

### Database

```bash
# Open Prisma Studio
pnpm prisma studio

# Create migration
pnpm prisma migrate dev --name your_migration_name

# View database
pnpm prisma db push

# Seed database
pnpm prisma db seed
```

### Build & Production

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Testing & Linting

```bash
# Run tests
pnpm test

# Run linter
pnpm lint

# Format code
pnpm format
```

---

## Configuration Files

### `.env` - Environment Variables
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=...
DATABASE_URL=...
```

### `tsconfig.json` - TypeScript Configuration
- Strict mode enabled
- Path aliases configured (`@/*` = `src/*`)

### `next.config.ts` - Next.js Configuration
- Custom webpack config
- Image optimization settings
- API routes configuration

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 pnpm dev
```

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**: 
1. Check PostgreSQL is running
2. Verify DATABASE_URL in `.env`
3. Test connection: `psql $DATABASE_URL`

### Prisma Generation Error

```bash
# Regenerate Prisma
pnpm prisma generate --skip-engine-check

# Or update Prisma
pnpm update @prisma/client
```

### Google OAuth Not Working

1. Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
2. Verify redirect URI in Google Cloud Console
3. Ensure Calendar API is enabled
4. Check browser console for errors
5. See [Troubleshooting Guide](./USER_GUIDE.md#troubleshooting-connection-issues)

---

## Security Best Practices

### Environment Variables

- ✅ Use `.env.local` for local development
- ✅ Never commit `.env` or `.env.local`
- ✅ Use `.env.example` for template
- ✅ Rotate secrets regularly (especially `GOOGLE_CLIENT_SECRET`)

### Database

- ✅ Use strong passwords
- ✅ Enable SSL for connections
- ✅ Regular backups
- ✅ Use connection pooling in production

### OAuth Tokens

- ✅ Store securely encrypted
- ✅ Always use HTTPS in production
- ✅ Implement token rotation
- ✅ Clear tokens on logout

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
pnpm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Update NEXT_PUBLIC_APP_URL to your domain
# Update GOOGLE_REDIRECT_URI to: https://yourdomain.com/api/calendar/callback
```

### Docker

```bash
# Build image
docker build -t zap-bot .

# Run container
docker run -e DATABASE_URL=... -p 3000:3000 zap-bot
```

### Self-Hosted

```bash
# Build
pnpm build

# Start
npm start

# Or use PM2
pm2 start npm --name "zap-bot" -- start
```

---

## Support & Resources

- 📖 **User Guide**: See [USER_GUIDE.md](./USER_GUIDE.md)
- 👨‍💻 **Developer Docs**: See [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- 🔗 **API Reference**: See [API_REFERENCE.md](./API_REFERENCE.md)
- 🐛 **Report Issues**: [GitHub Issues](https://github.com/yourorg/zap-bot/issues)
- 💬 **Community Chat**: [Discord](https://discord.gg/zapbot)

---

**Last Updated**: March 2026
**Version**: 1.0.0
