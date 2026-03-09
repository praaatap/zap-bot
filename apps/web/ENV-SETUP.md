# 🔧 Environment Setup Guide

This guide explains all the environment variables you need to make the Zap Bot project functional.

## 📋 Required Setup

### 1. **Database (PostgreSQL)**

You need a PostgreSQL database. We recommend using [Neon](https://neon.tech) (free tier available).

1. Create a free account at https://neon.tech
2. Create a new project
3. Copy the connection string
4. Add to your `.env.local`:

```env
DATABASE_URL="postgresql://user:password@host.neon.tech/database?sslmode=require"
```

### 2. **Authentication (Clerk)**

Clerk handles user authentication and management.

1. Sign up at https://dashboard.clerk.com
2. Create a new application
3. Go to **API Keys** section
4. Copy both keys and add to `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

### 3. **Google Calendar Integration**

To enable Google Calendar sync for automatic meeting detection:

1. Go to https://console.cloud.google.com/apis/credentials
2. Create a new project or select existing one
3. Enable **Google Calendar API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URI: `http://localhost:3000/api/calendar/callback`
   - For production: `https://yourdomain.com/api/calendar/callback`
5. Copy the Client ID and Client Secret
6. Add to `.env.local`:

```env
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/calendar/callback"
```

### 4. **App URL**

Set the base URL of your application:

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

For production, change this to your deployed domain.

## 🚀 Getting Started

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in all the required values in `.env.local`

3. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Visit http://localhost:3000

## 📦 Optional Services

### AWS (for meeting recordings and processing)

**What it does:** Stores meeting recordings in S3 and processes them with Lambda functions.

**Setup:**
1. Create an AWS account at https://aws.amazon.com
2. Go to IAM Console: https://console.aws.amazon.com/iam/
3. Create a new user with programmatic access
4. Attach policies:
   - `AmazonS3FullAccess` (for storing recordings)
   - `AWSLambdaFullAccess` (for processing)
5. Copy the Access Key ID and Secret Access Key
6. Create an S3 bucket (e.g., "zap-bot-meetings")
7. Add to `.env.local`:

```env
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="zap-bot-meetings"
AWS_LAMBDA_FUNCTION_NAME="zap-bot-processor"
AWS_LAMBDA_TRANSCRIPT_FUNCTION="zap-bot-transcript-processor"
```

### Pinecone (for AI-powered meeting search)

**What it does:** Vector database for semantic search across meeting transcripts.

**Setup:**
1. Sign up at https://www.pinecone.io/ (free tier available)
2. Create a new project
3. Create an index:
   - Name: `zap-bot`
   - Dimensions: `1536` (for text-embedding-3-small)
   - Metric: `cosine`
4. Copy your API key
5. Add to `.env.local`:

```env
PINECONE_API_KEY="your-pinecone-api-key"
PINECONE_INDEX="zap-bot"
```

### Groq (for fast AI processing)

**What it does:** Ultra-fast LLM inference for meeting summaries and insights.

**Setup:**
1. Sign up at https://console.groq.com/ (free tier with high rate limits)
2. Go to API Keys section
3. Create a new API key
4. Add to `.env.local`:

```env
GROQ_API_KEY="your-groq-api-key"
```

**Models available:**
- `mixtral-8x7b-32768` - Best for summaries and analysis
- `llama2-70b-4096` - Alternative option
- Fast inference speeds (100+ tokens/sec)


## 🔐 Security Notes

- **Never commit `.env.local`** to version control
- Keep your secrets secure
- For production, use environment variables from your hosting provider
- Rotate keys regularly
- Use different credentials for development and production

## 🐛 Troubleshooting

### "DATABASE_URL is not set" error
- Make sure you created `.env.local` (not `.env.local.example`)
- Check that DATABASE_URL is properly set in `.env.local`
- Restart your dev server after changing env variables

### Calendar connection fails
- Verify your Google OAuth credentials are correct
- Make sure the redirect URI is added to Google Console
- Check that Google Calendar API is enabled

### Clerk authentication issues
- Confirm both NEXT_PUBLIC and CLERK_SECRET keys are set
- Verify the keys are from the same Clerk application
- Check that your Clerk application is in "Development" mode for local testing

### AWS/S3 upload errors
- Verify your AWS credentials are correct
- Check that the S3 bucket exists and is in the correct region
- Ensure IAM user has proper permissions

### Pinecone connection issues
- Confirm API key is correct
- Verify index name matches your Pinecone dashboard
- Check that index dimensions match your embedding model (1536 for text-embedding-3-small)

### Groq API errors
- Verify API key is valid
- Check rate limits (free tier is generous but has limits)
- Try a different model if one fails

## 📚 Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Google Calendar API Guide](https://developers.google.com/calendar/api/guides/overview)
- [Prisma Documentation](https://www.prisma.io/docs)
