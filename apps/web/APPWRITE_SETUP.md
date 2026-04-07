# Appwrite Setup Guide

This guide walks you through setting up your Zap Bot instance with Appwrite as the database backend.

## Prerequisites

- Node.js 18+ installed
- pnpm package manager
- Appwrite Cloud account (free tier available)

## Step 1: Create Appwrite Cloud Account

1. Go to [cloud.appwrite.io](https://cloud.appwrite.io)
2. Sign up for a free account (or log in if you have one)
3. Create a new organization if you don't have one
4. Create a new project:
   - Project name: `Zap Bot`
   - Region: Choose closest to your users (default: US East)

## Step 2: Create API Key

1. In your Appwrite project, go to **Settings** > **API Keys**
2. Click **Create API Key**
   - Name: `Backend Server Key`
   - Scopes: Select all scopes (or at minimum: `databases.read`, `databases.write`, `users.read`, `users.write`, `files.read`, `files.write`)
3. Copy the generated API key and save it safely

## Step 3: Get Project Credentials

1. In **Settings** > **Overview**, copy:
   - **Project ID** - This is your `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
   - **API Endpoint** - Should be `https://cloud.appwrite.io/v1`

## Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and fill in the Appwrite credentials:
   ```env
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=YOUR_PROJECT_ID_HERE
   APPWRITE_API_KEY=YOUR_API_KEY_HERE
   ```

3. The following are pre-configured for the default Appwrite setup (no changes needed):
   ```env
   APPWRITE_DATABASE_ID=zapbot-main
   APPWRITE_USERS_COLLECTION_ID=users
   APPWRITE_MEETINGS_COLLECTION_ID=meetings
   [... other collection IDs ...]
   ```

## Step 5: Install Dependencies

```bash
cd apps/web
pnpm install
```

## Step 6: Bootstrap Appwrite Collections

Run the automated setup script to create all necessary collections, attributes, and indexes in your Appwrite instance:

```bash
pnpm appwrite:setup
```

This script will:
- Create the database `zapbot-main` (if it doesn't exist)
- Create 7 collections with proper schemas:
  - **Users** - Store user accounts and preferences
  - **Meetings** - Store meeting records with bot session data
  - **UserIntegrations** - Store OAuth tokens and integration settings
  - **TranscriptChunks** - Store processed meeting transcripts
  - **ChatMessages** - Store conversation history
  - **SlackInstallations** - Store Slack workspace connections
  - **MeetingEvents** - Store real-time meeting state changes
- Create indexes for efficient queries
- Skip already-created attributes (idempotent - safe to re-run)

**Example output:**
```
✅ Database 'zapbot-main' ready
✅ Collection 'users' prepared
✅ Attribute 'clerkId' (index) created
✅ Collection 'meetings' prepared
... [more collections]
✅ Schema bootstrap complete!
```

If you see warnings like "Attribute already exists", that's normal and means the schema is already set up.

## Step 7: Verify Setup

### Login Test
1. Start the dev server:
   ```bash
   pnpm dev
   ```
2. Navigate to `http://localhost:3000/login`
3. Sign up with an email (e.g., `test@example.com` password: `Test123!`)
4. You should be redirected to the dashboard

### Verify Database Entry
1. Go back to [cloud.appwrite.io](https://cloud.appwrite.io)
2. In your project, go to **Databases** > **zapbot-main** > **users**
3. You should see a new document with your email

### API Test
Once logged in, try these API endpoints in browser DevTools console:
```javascript
// Test /api/meetings endpoint
fetch('/api/meetings?scope=upcoming')
  .then(r => r.json())
  .then(d => console.log(d))
```

Expected response:
```json
{
  "success": true,
  "data": []  // Empty for new user - normal!
}
```

## Step 8: (Optional) Add Other Services

To use all features, configure these additional services in `.env.local`:

### AI & Chat
- **Groq API** (free LLM): Get key from [console.groq.com](https://console.groq.com)
- **OpenAI API**: Get key from [platform.openai.com](https://platform.openai.com)
- **Pinecone Vector DB** (paid, required for vector search): [pinecone.io](https://pinecone.io)

### Meeting Recording
- **MeetingBaas** (free tier available): [meetingbaas.com](https://meetingbaas.com)
- **LiveKit** (for real-time collaboration): [livekit.io](https://livekit.io)

### Analytics & Email
- **Resend** (free email service): [resend.com](https://resend.com)
- **Stripe** (payments, required for premium features): [stripe.com](https://stripe.com)

## Troubleshooting

### "APPWRITE_API_KEY is missing"
- Make sure you set `APPWRITE_API_KEY` in `.env.local`
- Restart dev server after changing env vars

### "Collection not found" error
- Run `pnpm appwrite:setup` again
- Check that the database ID matches in `lib/appwrite-config.ts`

### "Unauthorized" on API calls
- Verify `APPWRITE_API_KEY` is correct and has proper scopes
- Check that your IP is not blocked (unlikely on cloud.appwrite.io)

### Collections created but attributes missing
- This sometimes happens due to race conditions
- Simply run `pnpm appwrite:setup` again - it's idempotent

### Can't log in after setup
1. Check browser console for error messages
2. Verify `NEXT_PUBLIC_APPWRITE_PROJECT_ID` is correct
3. Clear browser cookies and try again
4. Check Appwrite project console to see if user document was created

## Next Steps

- [Configure Google Calendar integration](./lib/calendar-auth.ts)
- [Set up Slack bot integration](./lib/slack-auth.ts)
- [Deploy to Vercel](./DEPLOYMENT.md)
- [Run meeting agent service](../interview-rag/README.md)

## Architecture Overview

```
Your App (Next.js)
├── Browser: Appwrite JS Client
│   └── Session cookies for authentication
├── API Routes: Node.js SDK (Appwrite Admin Client)
│   └── Full CRUD permissions
└── Database: Appwrite Databases API
    └── Collections synchronized with schema
```

**Key files:**
- `lib/appwrite.ts` - Browser client
- `lib/appwrite.server.ts` - Node.js admin client
- `lib/appwrite-config.ts` - Collection ID constants
- `scripts/setup-appwrite-schema.mjs` - Automated schema creation

## Support

For issues with:
- **Appwrite setup**: Check [Appwrite Docs](https://appwrite.io/docs)
- **Zap Bot specific**: Review [APPWRITE_MIGRATION_GUIDE.md](./APPWRITE_MIGRATION_GUIDE.md)
