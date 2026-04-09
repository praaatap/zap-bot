# Environment Setup

## 1) Web env (required)

Copy:

- `.env.local.example` -> `.env.local`

Set at minimum:

- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `MEETING_BAAS_API_KEY`
- `MEETING_BAAS_WEBHOOK_URL`

Optional:

- `NEXT_PUBLIC_API_URL` (external API, if used)
- `PINECONE_API_KEY`
- `GROQ_API_KEY`

## 2) API env (optional local service)

Copy:

- `apps/api/.env.example` -> `apps/api/.env`

Fill these first:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `MEETING_BAAS_API_KEY`
- `AWS_REGION`
- `BEDROCK_MODEL_ID`
- `PYTHON_AGENT_URL` (if using Python agent bridge)
- `AWS_LAMBDA_EMBEDDING_FUNCTION`
- `AWS_LAMBDA_QUERY_FUNCTION`

If you use vector search:

- `PINECONE_API_KEY`
- `PINECONE_INDEX`

Agent bridge options:

- `AGENT_BRIDGE_MODE=auto` (recommended)
- `AGENT_BRIDGE_MODE=python` (force Python only)
- `AGENT_BRIDGE_MODE=node` (force Node fallback only)

## 3) Run commands

- Next.js app only: `pnpm dev`
- Full stack in monorepo: `pnpm dev:all`
- API only: `pnpm dev:api`
