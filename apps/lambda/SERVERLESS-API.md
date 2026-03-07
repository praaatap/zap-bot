# Serverless Agent API (AWS Lambda)

This project now includes `apps/lambda/agent-api.mjs` to run core copilot endpoints without the Express backend.

## Endpoints

- `GET /health`
- `POST /meetings/join`
- `POST /chat/suggest`

## Deploy pattern

1. Create Lambda function (Node.js 20.x) with handler:
   - `agent-api.handler`
2. Put this file and dependencies into the Lambda artifact.
3. Connect Lambda to API Gateway HTTP API.
4. Configure routes:
   - `GET /health`
   - `POST /meetings/join`
   - `POST /chat/suggest`
5. Set env vars:
   - `AWS_REGION`
   - `BEDROCK_MODEL_ID`
   - `MEETING_BAAS_API_KEY`
   - `MEETING_BAAS_WEBHOOK_URL`

## Web app integration

Set:

- `NEXT_PUBLIC_API_URL=https://<your-api-gateway-domain>`

Then dashboard/settings/chat flows will call this serverless API.
