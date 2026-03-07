# Zap Bot Feature Overview

## Core Product Features

1. Meeting Bot Join and Recording
- Joins Google Meet, Zoom, and Teams links.
- Supports calendar-based auto-dispatch and manual URL-based launch.
- Tracks bot lifecycle states (`pending`, `joining`, `in_meeting`, `recording`, `processing`, `completed`, `failed`).

2. Transcript Capture and Storage
- Receives meeting webhook events from Meeting BaaS.
- Stores transcript entries in app store.
- Uploads transcript and recording artifacts to S3.

3. AI Meeting Intelligence
- AI summary generation and action item extraction.
- Live meeting assistant for:
  - Q&A on transcript context.
  - Real-time suggested replies.
- Agent bridge with fallback:
  - Python agent path.
  - Node fallback path when Python is unavailable.

4. RAG Pipeline with Serverless Lambdas
- Embedding pipeline lambda ingests transcript chunks and upserts Pinecone vectors.
- Query lambda performs retrieval + GenAI answer generation.
- Groq embeddings supported in lambdas with automatic Bedrock embedding fallback.

5. Frontend Experience
- Modern dashboard with system status and integration readiness.
- Bot Launchpad for one-click/manual meeting join.
- Meeting detail page with transcript, summary, chat assistant, and actions:
  - Re-process AI
  - Export transcript
  - Copy summary
  - Download/open recording
- Dedicated agent console with backend mode and health awareness.

6. Browser Extension (MVP)
- Captures visible captions in meeting tabs (Meet/Zoom/Teams).
- Sends user prompts + captured context to suggestion endpoint.
- Helps users with in-meeting response support.

## High-Level Architecture

1. Meeting Ingestion
- Calendar sync or manual join triggers bot dispatch.
- Webhook events update meeting status and store transcript/recording metadata.

2. Processing
- `transcription.ready` triggers embedding lambda.
- Lambda chunks transcript, creates embeddings (Groq/Bedrock), and writes vectors to Pinecone.

3. Querying
- User asks question from web chat or extension.
- Node API calls query lambda first.
- Query lambda retrieves relevant chunks and generates answer.
- Node fallback exists for resilience.

## Key API Areas

1. Auth and Calendar
- `/api/auth/*`
- `/api/calendar/*`

2. Meetings
- `/api/meetings`
- `/api/meetings/stats`
- `/api/meetings/:id`
- `/api/meetings/join`
- `/api/meetings/:id/process`

3. Chat and Agent
- `/api/chat`
- `/api/chat/suggest`
- `/api/agent/health`
- `/api/agent/chat`

4. Webhooks and System
- `/api/webhooks/meeting-baas`
- `/api/system/status`
- `/api/health`

## Main App Surfaces

1. Dashboard
- System status checks
- Calendar connect/sync
- Bot launch panel
- Meeting lists (live, upcoming, recent)

2. Meeting Detail
- Metadata, summary, transcript, participants
- Action controls and contextual chat

3. Agent Page
- Unified assistant UI with bridge mode awareness

4. Extension Page
- Installation and usage guide for live copilot extension

## Environment and Deploy Notes

1. API env template:
- `apps/api/.env.example`

2. Lambda env template:
- `apps/lambda/.env.example`

3. Setup docs:
- `ENV-SETUP.md`
- `apps/lambda/SERVERLESS-API.md`
- `apps/lambda/SERVERLESS-PIPELINE.md`

