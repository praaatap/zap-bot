# LiveKit Multi-Bot Integration - Setup Guide

## Overview
You now have **LiveKit support** for dispatching **2+ bots** to the same meeting with automatic recording and transcription.

## What Was Created

### 1. **LiveKit Bot Service** (`lib/livekit-bot.ts`)
- ✅ Support for dispatching multiple bots to same LiveKit room
- ✅ Automatic recording (MP4)
- ✅ Automatic transcription with configurable language
- ✅ Support for recording modes: `speaker_view` or `gallery_view`
- ✅ Functions:
  - `dispatchLiveKitBot(config, botIndex)` - Single bot dispatch
  - `dispatchMultipleLiveKitBots(config, numBots)` - Multiple bots (2-5 supported)
  - `getBotRecordingStatus(botId)` - Check bot status
  - `stopLiveKitBot(botId)` - Stop recording bot
  - `getLiveKitRecording(botId)` - Get recording URL
  - `getLiveKitTranscript(botId)` - Get transcript

### 2. **LiveKit Dispatch Endpoint** (`app/api/bot/dispatch-livekit/route.ts`)
- ✅ POST endpoint to dispatch bots with LiveKit
- ✅ Request body:
```json
{
  "roomName": "my-meeting-room",
  "meetingUrl": "livekit:my-meeting-room",
  "title": "Team Meeting",
  "botName": "Zap Bot",
  "numBots": 2,
  "recordingMode": "speaker_view"
}
```

### 3. **Updated Bot-Toggle** (`app/api/meetings/[id]/bot-toggle/route.ts`)
- ✅ Now supports both Meeting BaaS AND LiveKit
- ✅ Can send single or multiple bots
- ✅ Auto-detects which service based on request

### 4. **Database Schema Updates** (pending migration)
- ✅ `botIds` (Json) - Array of bot IDs
- ✅ `botService` (String) - "meetingbaas" or "livekit"
- ✅ `numBotsDispatched` (Int) - Count of bots sent
- ✅ `recordingUrls` (Json) - Array of recording URLs

## Environment Variables Needed

Add these to your `.env.local`:

```env
# LiveKit Configuration
LIVEKIT_API_KEY=<your-livekit-api-key>
LIVEKIT_API_SECRET=<your-livekit-api-secret>
LIVEKIT_SERVER_URL=https://your-livekit-server.example.com
LIVEKIT_WEBHOOK_URL=https://your-app.com/webhooks/livekit

# Optional
LIVEKIT_MOCK=false
```

## Setup Steps

### 1. Run Prisma Migration
The schema changes need to be applied to your database:

```bash
npx prisma migrate dev --name add-livekit-support
```

This will:
- Add `botIds` field
- Add `botService` field
- Add `numBotsDispatched` field
- Add `recordingUrls` field
- Generate new TypeScript types

### 2. Get LiveKit Credentials
1. Sign up at https://livekit.io (free tier available)
2. Create a project/room
3. Get API Key and Secret
4. Copy to `.env.local`

### 3. Test the Integration

#### Option A: Dispatch 2 LiveKit Bots
```bash
curl -X POST http://localhost:3000/api/bot/dispatch-livekit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <clerk-auth-token>" \
  -d '{
    "meetingUrl": "livekit:my-room-name",
    "title": "Team Meeting Test",
    "numBots": 2,
    "botName": "Zap Bot"
  }'
```

#### Option B: Use Existing Calendar Meeting
```bash
# Send bot from calendar
curl -X POST http://localhost:3000/api/meetings/<meetingId>/bot-toggle \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <clerk-auth-token>" \
  -d '{
    "botScheduled": true,
    "numBots": 2
  }'
```

## Usage

### Dispatch 2 Bots to LiveKit Room
```typescript
import { dispatchMultipleLiveKitBots } from "@/lib/livekit-bot";

const result = await dispatchMultipleLiveKitBots(
  {
    roomName: "team-standup",
    meetingUrl: "livekit:team-standup",
    meetingTitle: "Daily Standup",
    botName: "Zap Bot",
    autoTranscribe: true,
  },
  2 // number of bots
);

console.log(result.botIds);        // ["bot-1-xxx", "bot-2-xxx"]
console.log(result.count);         // 2
console.log(result.statuses);      // Array of bot statuses
```

### Get Recording after Meeting
```typescript
import { getLiveKitRecording, getLiveKitTranscript } from "@/lib/livekit-bot";

const recordingUrl = await getLiveKitRecording(botId);
const transcript = await getLiveKitTranscript(botId);
```

## Comparison: Meeting BaaS vs LiveKit

| Feature | Meeting BaaS | LiveKit |
|---------|------------|---------|
| Multiple Bots | ❌ 1 only | ✅ 2-5+ |
| Auto Record | ✅ | ✅ |
| Auto Transcribe | ✅ | ✅ |
| Open Source | ❌ | ✅ |
| Free Tier | Limited | Generous |
| Setup Complexity | Easy | Medium |
| Self-Hosted Option | ❌ | ✅ |

## Benefits of 2 Bots

1. **Multiple Perspectives** - Different recording angles/modes
2. **Redundancy** - If one bot fails, other still records
3. **Different Regions** - Deploy bots in different locations
4. **Backup Recording** - One bot for speaker, one for gallery view
5. **Better Coverage** - Handle simultaneous screen shares & camera

## Troubleshooting

### Bots Not Joining
- Check `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` are correct
- Verify room name is valid (alphanumeric, hyphens, underscores only)
- Check LiveKit server is running and accessible

### Recordings Not Generated
- Ensure `recordFiletype` is supported (mp4, ogg)
- Check room name in request matches meeting recording room
- Verify egress service is enabled in LiveKit

### Transcription Missing
- Set `autoTranscribe: true` in dispatch config
- Check transcription language is supported
- Verify webhook is receiving transcription events

## Next Steps

1. ✅ Run `prisma migrate dev` to apply schema changes
2. ✅ Set up LiveKit account and get API credentials
3. ✅ Add env variables
4. ✅ Test with calendar integration
5. ✅ Set up webhook to receive recordings/transcripts

## API Endpoints

### POST `/api/bot/dispatch-livekit`
Dispatch multiple LiveKit bots to a meeting

**Request:**
```json
{
  "meetingUrl": "livekit:room-name",
  "title": "Meeting Title",
  "numBots": 2,
  "botName": "Zap Bot",
  "recordingMode": "speaker_view"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "botIds": ["bot-1-xxx", "bot-2-xxx"],
    "numBots": 2,
    "roomName": "room-name",
    "botService": "livekit",
    "statuses": [
      { "botId": "bot-1-xxx", "status": "pending" },
      { "botId": "bot-2-xxx", "status": "pending" }
    ]
  }
}
```

### POST `/api/meetings/[id]/bot-toggle` (Updated)
Now supports both Meeting BaaS and LiveKit

**Request (LiveKit with 2 bots):**
```json
{
  "botScheduled": true,
  "numBots": 2,
  "service": "livekit"
}
```

## Features Enabled

✅ 2+ bots per meeting  
✅ Simultaneous recording  
✅ Automatic transcription  
✅ Multiple recording URLs  
✅ Service switching (Meeting BaaS ↔ LiveKit)  
✅ Weekly usage tracking  
✅ Error handling & fallbacks  

---

**Version:** 1.0  
**Last Updated:** March 2026
