# Zap Bot Developer Documentation

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│  ┌──────────────┬──────────────┬──────────────────────────┐  │
│  │  Dashboard   │  Calendar    │  Recordings             │  │
│  │  - Quick Join│  - Google    │  - Transcripts          │  │
│  │  - Stats     │    Calendar  │  - Summaries            │  │
│  │  - Upcoming  │  - Events    │  - Video Player         │  │
│  └──────────────┴──────────────┴──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼────────┐ ┌──────▼──────┐ ┌──────▼──────────┐
│  Auth (Clerk)  │ │  Prisma ORM │ │  Google APIs   │
│  Session Mgmt  │ │  PostgreSQL │ │  - Calendar    │
└────────────────┘ └─────────────┘ │  - OAuth2      │
                                   └────────────────┘
        │                 │                 │
┌───────▼─────────────────▼─────────────────▼──────────┐
│             API Routes (Next.js App Router)           │
│  ┌──────────────┬──────────────┬────────────────────┐ │
│  │ /api/meetings│ /api/calendar│ /api/bot/dispatch  │ │
│  │ /api/auth    │ /api/recordings                    │ │
│  └──────────────┴──────────────┴────────────────────┘ │
└─────────────────────────────────────────────────────────┘
        │                 │                 │
┌───────▼─────┐ ┌────────▼───────┐ ┌──────▼───────┐
│  PostgreSQL │ │  AWS Services  │ │  Meeting BaaS│
│  Database   │ │  - S3 Storage  │ │  Service     │
│             │ │  - Lambda      │ │  - API Calls │
└─────────────┘ └────────────────┘ └──────────────┘
```

## Key Components

### 1. Frontend Components

#### `UpcomingRecordingPanel.tsx`
**Location**: `apps/web/app/dashboard/UpcomingRecordingPanel.tsx`

Displays upcoming meetings scheduled for recording.

**Features**:
- Fetches data from `/api/meetings/upcoming-recordings`
- Shows bot status (Ready/Pending)
- Lists participants and meeting details
- Auto-refreshes every 5 minutes

**Props**: None (uses hooks internally)

**State**:
```typescript
recordings: UpcomingRecording[]
loading: boolean
error: string | null
```

**Usage**:
```tsx
import UpcomingRecordingPanel from "@/app/dashboard/UpcomingRecordingPanel";

export default function Dashboard() {
  return <UpcomingRecordingPanel />;
}
```

### 2. API Routes

#### GET `/api/meetings/upcoming-recordings`

**Purpose**: Fetch upcoming meetings scheduled for recording

**Authorization**: Requires Clerk auth

**Request**:
```javascript
fetch("/api/meetings/upcoming-recordings")
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "cuid123",
      "title": "Team Standup",
      "startTime": "2026-03-10T09:00:00Z",
      "endTime": "2026-03-10T09:30:00Z",
      "platform": "google_meet",
      "botScheduled": true,
      "botSent": true,
      "botStatus": "pending",
      "participants": ["alice@example.com"]
    }
  ]
}
```

**Query Parameters**: None

**Status Codes**:
- `200`: Success
- `401`: Not authenticated
- `404`: User not found
- `500`: Server error

**Implementation Details**:
- Queries meetings with `startTime` within next 30 days
- Filters to meetings with no recordings yet
- Orders by `startTime` ascending
- Limits to 10 results
- Includes bot status fields

---

#### GET `/api/calendar/connect`

**Purpose**: Initiate Google OAuth flow

**Authorization**: Requires Clerk auth

**Redirects to**: Google consent screen

**Implementation**:
```typescript
// Constructs OAuth2 state with userId
// Generates auth URL with calendar scopes
// Redirects to Google
```

**Scopes Requested**:
- `calendar.readonly`
- `calendar.events.readonly`

---

#### GET `/api/calendar/callback`

**Purpose**: Handle Google OAuth callback

**Query Parameters**:
- `code`: Authorization code from Google
- `state`: User ID (for verification)
- `error`: Error code (if auth failed)

**Behavior**:
1. Validates code and state
2. Exchanges code for tokens
3. Stores tokens in Prisma
4. Redirects to `/dashboard/calendar?success=true`

**Error Handling**:
- Missing credentials → `missing_credentials`
- Token exchange failed → `token_exchange_failed`
- User not found → `user_not_found`
- Google errors → `google_auth_error&details={error}`

---

#### GET `/api/calendar/events`

**Purpose**: Fetch upcoming meetings from Google Calendar

**Response**:
```json
{
  "success": true,
  "connected": true,
  "data": [
    {
      "id": "event-123",
      "title": "Product Review",
      "start": "2026-03-10T14:00:00Z",
      "end": "2026-03-10T15:00:00Z",
      "meetingUrl": "https://meet.google.com/abc-defg-hij",
      "attendees": ["alice@example.com", "bob@example.com"],
      "organizer": "alice@example.com"
    }
  ]
}
```

**Features**:
- Returns next 7 days of events
- Extracts meeting URLs from descriptions, hangoutLink, conferenceData
- Filters to only events with meeting URLs

---

#### POST `/api/bot/dispatch`

**Purpose**: Dispatch bot to join a meeting

**Body**:
```json
{
  "meetingUrl": "https://meet.google.com/abc-defg-hij",
  "title": "My Meeting",
  "startTime": "2026-03-10T09:00:00Z"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "botDispatched": true,
    "meetingId": "meeting-123"
  }
}
```

**Status Codes**:
- `200`: Bot dispatched successfully
- `502`: Bot dispatch failed

**Features**:
- URL normalization (adds `https://` if missing)
- Platform validation
- Database record creation
- Bot service integration

---

### 3. Prisma Database Models

#### User Model
```prisma
model User {
  id       String    @id @default(cuid())
  clerkId  String    @unique
  email    String?
  name     String?
  
  // Google Calendar
  googleAccessToken  String?
  googleRefreshToken String?
  googleTokenExpiry  DateTime?
  calendarConnected  Boolean   @default(false)
  
  // Relations
  meetings Meeting[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### Meeting Model
```prisma
model Meeting {
  id       String    @id @default(cuid())
  userId   String
  
  title           String?
  startTime       DateTime
  endTime         DateTime?
  meetingUrl      String?
  platform        String?
  participants    String[]
  
  // Bot Status
  botScheduled    Boolean   @default(false)
  botSent         Boolean   @default(false)
  botStatus       String    @default("pending")
  botId           String?
  
  // Relations
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  recordings Recording[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## Environment Variables

### Required for Google Calendar Integration

```bash
# Google OAuth Credentials
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Redirect URI - must match Google Cloud Console
GOOGLE_REDIRECT_URI="http://localhost:3000/api/calendar/callback"

# App URL for generating OAuth redirect URIs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Google Cloud Setup Steps

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable **Google Calendar API**
4. Go to **Credentials** → **Create OAuth 2.0 Client ID**
5. Select **Web application**
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/calendar/callback` (dev)
   - `https://yourdomain.com/api/calendar/callback` (prod)
7. Copy Client ID and Secret to `.env`

---

## Common Tasks

### Adding a New Dashboard Metric

1. **Add query to stats API** (`/api/meetings/stats`):
```typescript
const yourMetric = await prisma.meeting.count({
  where: { userId: user.id, /* your filter */ }
});
```

2. **Update response**:
```typescript
return NextResponse.json({
  success: true,
  data: {
    yourMetric,
    // ... other metrics
  }
});
```

3. **Update Sidebar component** to display metric

---

### Integrating a New Meeting Platform

1. Add platform to `isValidMeetingUrl()` in `lib/meeting-baas.ts`
2. Add detection logic to `detectMeetingPlatform()`
3. Test URL validation
4. Add to supported platforms list in docs

---

### Handling OAuth Errors

All OAuth errors redirect with query parameters:
```
?error=error_type&details=error_message
```

Handle on frontend:
```typescript
const errorParam = searchParams.get("error");
const details = searchParams.get("details");

if (errorParam) {
  setError(`Failed: ${errorParam}. ${details || ""}`);
}
```

---

## Testing

### Manual Testing Checklist

- [ ] Connect Google Calendar
- [ ] View upcoming meetings
- [ ] Schedule bot to join meeting
- [ ] Verify bot dispatched status
- [ ] Check database records created
- [ ] Verify OAuth token storage

### Debugging

Enable verbose logging:
```typescript
// In route handlers
console.log("Action:", { userId, meetingId, error });
```

Check browser console for client-side errors.

---

## Deployment

### Environment Variables (Production)

```bash
GOOGLE_REDIRECT_URI="https://yourdomain.com/api/calendar/callback"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### Database Migration

```bash
cd apps/web
pnpm prisma migrate deploy
```

### Verification

1. Test OAuth flow end-to-end
2. Verify database connections
3. Check logs for errors
4. Monitor performance metrics

---

## Performance Optimization

### Calendar Events Query
- Uses `select` to fetch only needed fields
- Limits to 7 days ahead
- Indexes on `userId`, `startTime`

### Upcoming Recordings
- Caches for 5 minutes on frontend
- Auto-refreshes every 5 minutes
- Limits to 10 results

---

## Security Considerations

### OAuth Token Storage
- Tokens stored encrypted in database
- Refresh tokens rotated automatically
- Expiry dates tracked
- Tokens cleared on logout

### API Authentication
- All endpoints require Clerk authentication
- User ID extracted from auth context
- Database queries filtered by userId
- No cross-user data access

---

**Last Updated**: March 2026
**Version**: 1.0.0
