# 🚀 Complete Integration Setup Guide

This guide walks you through setting up **all the services** needed for Zap Bot to function fully.

## 🎯 Overview

Zap Bot integrates with multiple services:
- **Database**: PostgreSQL (Neon)
- **Authentication**: Clerk
- **Calendar**: Google Calendar API
- **Cloud Storage**: AWS S3
- **Processing**: AWS Lambda
- **AI Search**: Pinecone Vector Database
- **AI Models**: Groq (ultra-fast LLM)

---

## 1️⃣ Database Setup (PostgreSQL via Neon)

**Required** - This is where all meeting data is stored.

### Steps:
1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project (takes ~30 seconds)
3. Copy the connection string from the dashboard
4. Add to `.env.local`:
```env
DATABASE_URL="postgresql://user:password@ep-xyz.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### Initialize Database:
```bash
cd apps/web
npx prisma generate
npx prisma db push
```

---

## 2️⃣ Authentication Setup (Clerk)

**Required** - Handles user login and management.

### Steps:
1. Go to [dashboard.clerk.com](https://dashboard.clerk.com) and sign up
2. Create a new application
3. Choose authentication methods (Email, Google, etc.)
4. Go to **API Keys** in the sidebar
5. Copy both keys:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

---

## 3️⃣ Google Calendar Integration

**Required for auto-join** - Detects meetings from your calendar.

### Steps:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. **Enable Google Calendar API**:
   - APIs & Services → Library
   - Search "Google Calendar API"
   - Click "Enable"
4. **Create OAuth Credentials**:
   - APIs & Services → Credentials
   - Create Credentials → OAuth client ID
   - Application type: Web application
   - Add redirect URI: `http://localhost:3000/api/calendar/callback`
   - For production, also add: `https://yourdomain.com/api/calendar/callback`
5. Copy Client ID and Client Secret:
```env
GOOGLE_CLIENT_ID="123456789-xyz.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-..."
GOOGLE_REDIRECT_URI="http://localhost:3000/api/calendar/callback"
```

---

## 4️⃣ AWS Setup (S3 + Lambda)

**Required for recordings** - Stores and processes meeting recordings.

### Part A: Create IAM User
1. Go to [AWS Console](https://console.aws.amazon.com)
2. Navigate to IAM → Users
3. Click "Create user"
4. Username: `zap-bot-service`
5. Select "Programmatic access"
6. **Attach policies**:
   - `AmazonS3FullAccess`
   - `AWSLambdaFullAccess`
7. Copy **Access Key ID** and **Secret Access Key**

### Part B: Create S3 Bucket
1. Go to S3 in AWS Console
2. Click "Create bucket"
3. Bucket name: `zap-bot-meetings` (must be globally unique)
4. Region: `us-east-1` (or your preferred region)
5. Keep default settings, click "Create"

### Part C: Add to .env.local
```env
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
AWS_S3_BUCKET="zap-bot-meetings"
AWS_LAMBDA_FUNCTION_NAME="zap-bot-processor"
AWS_LAMBDA_TRANSCRIPT_FUNCTION="zap-bot-transcript-processor"
```

### Part D: Deploy Lambda Functions (Optional for now)
The app will work without Lambda - it uses local processing as fallback.

---

## 5️⃣ Pinecone Setup (Vector Database)

**Required for AI search** - Enables semantic search across meeting transcripts.

### Steps:
1. Go to [pinecone.io](https://www.pinecone.io/) and create free account
2. Create a new project
3. **Create an index**:
   - Click "Create Index"
   - Name: `zap-bot`
   - Dimensions: `1536`
   - Metric: `cosine`
   - Region: Choose closest to you
4. Go to API Keys and copy your key:
```env
PINECONE_API_KEY="pcsk_..."
PINECONE_INDEX="zap-bot"
```

---

## 6️⃣ Groq Setup (AI Models)

**Required for summaries** - Ultra-fast AI for meeting analysis.

### Steps:
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (free tier is generous)
3. Navigate to API Keys
4. Create a new API key
5. Copy the key:
```env
GROQ_API_KEY="gsk_..."
```

### Models Available:
- **mixtral-8x7b-32768**: Best for summaries (recommended)
- **llama2-70b-4096**: Alternative option
- Speed: 100-300 tokens/sec (very fast!)

---

## 7️⃣ App Configuration

Set your app URL:
```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

For production, change to your domain:
```env
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

---

## 📋 Complete .env.local Example

Create `apps/web/.env.local` with all values:

```env
# Database
DATABASE_URL="postgresql://user:password@host.neon.tech/db?sslmode=require"

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Google Calendar
GOOGLE_CLIENT_ID="123456789.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-..."
GOOGLE_REDIRECT_URI="http://localhost:3000/api/calendar/callback"

# AWS
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
AWS_S3_BUCKET="zap-bot-meetings"
AWS_LAMBDA_FUNCTION_NAME="zap-bot-processor"
AWS_LAMBDA_TRANSCRIPT_FUNCTION="zap-bot-transcript-processor"

# AI Services
PINECONE_API_KEY="pcsk_..."
PINECONE_INDEX="zap-bot"
GROQ_API_KEY="gsk_..."
```

---

## 🏃 Running the App

1. **Install dependencies**:
```bash
cd apps/web
pnpm install
```

2. **Generate Prisma Client**:
```bash
npx prisma generate
```

3. **Push database schema**:
```bash
npx prisma db push
```

4. **Start development server**:
```bash
pnpm dev
```

5. **Open browser**:
```
http://localhost:3000
```

---

## ✅ Testing Your Setup

### Test Checklist:
- [ ] Can sign in with Clerk
- [ ] Dashboard loads without errors
- [ ] Can connect Google Calendar
- [ ] Calendar events appear
- [ ] Can paste meeting URL in Quick Join
- [ ] Bot dispatches to meeting
- [ ] Settings page loads
- [ ] Support page loads

---

## 🐛 Common Issues

### Database Connection Error
- Verify `DATABASE_URL` is correct
- Check that special characters in password are URL-encoded
- Restart dev server after changing .env

### Clerk Authentication Fails
- Ensure both `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are from same app
- Check keys don't have extra spaces
- Verify app is in Development mode in Clerk dashboard

### Google Calendar Won't Connect
- Verify redirect URI matches exactly (including protocol)
- Check that Google Calendar API is enabled
- Ensure OAuth consent screen is configured

### AWS Errors
- Verify IAM user has correct permissions
- Check S3 bucket name is correct and exists
- Ensure region matches bucket region

### Pinecone Connection Failed
- Verify API key is copied correctly
- Check index name matches
- Ensure index dimensions are 1536

### Groq API Errors
- Confirm API key is valid
- Check rate limits (free tier is generous)
- Try different model if one fails

---

## 🎉 You're Ready!

Once all services are configured, you can:
- ✅ Auto-join meetings from calendar
- ✅ Record and transcribe meetings
- ✅ Generate AI summaries
- ✅ Search meeting content semantically
- ✅ Export action items
- ✅ View meeting analytics

Need help? Check the [Support page](http://localhost:3000/dashboard/help) in the app!
