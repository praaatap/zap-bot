# Meeting -> Embedding -> Query Pipeline

This repo now supports a two-lambda flow:

1. Bot joins and records meeting (Meeting BaaS webhook flow in Node API).
2. On `transcription.ready`, Node uploads transcript to S3 and invokes:
   - `embedding-pipeline.mjs` to generate embeddings and upsert Pinecone.
3. For user Q&A, Node `/api/chat` invokes:
   - `query-agent.mjs` to run RAG query + Bedrock answer.

## Lambda handlers

- Embedding lambda: `embedding-pipeline.handler`
- Query lambda: `query-agent.handler`

## Required env vars

- `AWS_REGION`
- `PINECONE_API_KEY`
- `PINECONE_INDEX`
- `BEDROCK_EMBED_MODEL_ID`
- `BEDROCK_MODEL_ID`
- `S3_BUCKET` (for embedding lambda)

Optional Groq embedding provider:

- `GROQ_API_KEY`
- `GROQ_EMBED_MODEL_ID`
- `GROQ_BASE_URL` (default: `https://api.groq.com/openai/v1`)

When set, embedding lambdas try Groq first and fall back to Bedrock embeddings automatically.

## Node API env

- `AWS_LAMBDA_EMBEDDING_FUNCTION`
- `AWS_LAMBDA_QUERY_FUNCTION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
