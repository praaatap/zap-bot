# Environment Setup

## 1) API env

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

## 2) Web env

Copy:

- `apps/web/.env.local.example` -> `apps/web/.env.local`

Set:

- `NEXT_PUBLIC_API_URL=http://localhost:3001` for local Express API
- `NEXT_PUBLIC_API_URL=https://<api-gateway-domain>` for serverless Lambda API

## 3) Lambda env

Copy:

- `apps/lambda/.env.example` -> use as your Lambda environment variable reference

Use:

- `apps/lambda/index.mjs` for meeting processing lambda
- `apps/lambda/agent-api.mjs` for serverless join/suggest endpoints
