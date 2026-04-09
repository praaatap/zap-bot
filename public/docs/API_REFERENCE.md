# API Quick Reference

## Base URL
```
http://localhost:3000/api
https://zapbot.example.com/api (production)
```

## Authentication
All requests require Clerk authentication via session cookie or auth header.

---

## Meetings Endpoints

### Get All Meetings
```
GET /meetings
Authorization: Required
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "meeting-123",
      "title": "Team Sync",
      "startTime": "2026-03-10T09:00:00Z",
      "platform": "google_meet",
      "botStatus": "completed"
    }
  ]
}
```

---

### Get Upcoming Recordings
```
GET /meetings/upcoming-recordings
Authorization: Required
```

**Parameters**: None

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "meeting-123",
      "title": "Product Review",
      "startTime": "2026-03-10T14:00:00Z",
      "botScheduled": true,
      "platform": "zoom"
    }
  ]
}
```

**Notes**:
- Returns meetings for next 30 days
- Excludes meetings with existing recordings
- Max 10 results

---

### Get Meeting Details
```
GET /meetings/{id}
Authorization: Required
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "meeting-123",
    "title": "Standup",
    "startTime": "2026-03-10T09:00:00Z",
    "endTime": "2026-03-10T09:30:00Z",
    "platform": "google_meet",
    "participants": ["alice@example.com"],
    "botStatus": "completed",
    "recording": { "id": "rec-456" }
  }
}
```

---

### Get Meeting Statistics
```
GET /meetings/stats
Authorization: Required
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalMeetings": 42,
    "activeMeetings": 1,
    "weekMeetings": 8,
    "recordingsCount": 38,
    "hoursTranscribed": 125,
    "percentChange": "+15%"
  }
}
```

---

## Calendar Endpoints

### Connect Google Calendar
```
GET /calendar/connect
Authorization: Required
Redirects: Google OAuth consent screen
```

---

### Handle OAuth Callback
```
GET /calendar/callback
Query Parameters:
  - code: Authorization code
  - state: User ID
  - error: Error code (if denied)
```

**Redirects**: `/dashboard/calendar?success=true` or `?error=callback_failed`

---

### Get Calendar Events
```
GET /calendar/events
Authorization: Required
```

**Response**:
```json
{
  "success": true,
  "connected": true,
  "data": [
    {
      "id": "event-789",
      "title": "Client Review",
      "start": "2026-03-10T15:00:00Z",
      "end": "2026-03-10T16:00:00Z",
      "meetingUrl": "https://zoom.us/j/123456789",
      "attendees": ["client@example.com"],
      "organizer": "you@example.com"
    }
  ]
}
```

---

## Bot Endpoints

### Dispatch Bot to Meeting
```
POST /bot/dispatch
Authorization: Required
Content-Type: application/json

Body:
{
  "meetingUrl": "https://meet.google.com/abc-defg",
  "title": "My Meeting",
  "startTime": "2026-03-10T10:00:00Z"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    "botDispatched": true,
    "meetingId": "meeting-123",
    "botId": "bot-456"
  }
}
```

**Response Error (502)**:
```json
{
  "success": false,
  "data": {
    "botDispatched": false
  },
  "error": "Failed to dispatch bot"
}
```

**Validation**:
- URL must be a valid meeting link
- Supports: Google Meet, Zoom, Teams, Webex
- URL normalization (adds https:// if missing)

---

## Recording Endpoints

### Get All Recordings
```
GET /recordings
Authorization: Required
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "rec-123",
      "meetingId": "meeting-456",
      "duration": 3600,
      "status": "completed",
      "videoUrl": "https://s3.amazonaws.com/...",
      "transcriptUrl": "https://s3.amazonaws.com/...",
      "summary": "Meeting covered Q1 planning..."
    }
  ]
}
```

---

### Get Recording Details
```
GET /recordings/{id}
Authorization: Required
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "rec-123",
    "meetingId": "meeting-456",
    "title": "Q1 Planning",
    "duration": 3600,
    "status": "completed",
    "createdAt": "2026-03-10T10:00:00Z",
    "videoUrl": "https://s3.amazonaws.com/...",
    "transcript": {
      "full": "Meeting transcript...",
      "segments": [
        {
          "timestamp": "00:00:00",
          "speaker": "Alice",
          "text": "Let's start with Q1..."
        }
      ]
    },
    "summary": {
      "overview": "Quarterly planning meeting",
      "keyPoints": ["Point 1", "Point 2"],
      "actionItems": [
        {
          "task": "Finalize budget",
          "owner": "Alice",
          "dueDate": "2026-03-15"
        }
      ]
    }
  }
}
```

---

## Error Responses

### Common Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Meeting retrieved |
| 400 | Bad Request | Invalid meeting URL |
| 401 | Unauthorized | Not authenticated |
| 404 | Not Found | Meeting doesn't exist |
| 500 | Server Error | Database error |
| 502 | Bad Gateway | Bot service unavailable |

---

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error context"
}
```

---

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `/meetings/*` | 100 req/min |
| `/calendar/*` | 50 req/min |
| `/bot/dispatch` | 10 req/min |
| `/recordings/*` | 100 req/min |

---

## Webhooks (Coming Soon)

### Meeting Started
```
POST your-webhook-url
{
  "event": "meeting.started",
  "meetingId": "meeting-123",
  "timestamp": "2026-03-10T10:00:00Z"
}
```

### Recording Completed
```
POST your-webhook-url
{
  "event": "recording.completed",
  "recordingId": "rec-123",
  "meetingId": "meeting-123",
  "transcriptReady": true,
  "timestamp": "2026-03-10T11:30:00Z"
}
```

---

## Example Code

### JavaScript/Fetch

```javascript
// Get upcoming recordings
async function getUpcomingRecordings() {
  const response = await fetch("/api/meetings/upcoming-recordings", {
    method: "GET",
    credentials: "include" // Include auth cookie
  });
  
  const data = await response.json();
  return data.data;
}

// Dispatch bot
async function dispatchBot(meetingUrl, title) {
  const response = await fetch("/api/bot/dispatch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      meetingUrl,
      title,
      startTime: new Date().toISOString()
    })
  });
  
  const data = await response.json();
  return data.data;
}
```

### cURL

```bash
# Get upcoming recordings
curl -X GET http://localhost:3000/api/meetings/upcoming-recordings \
  -H "Cookie: __session=..." \
  -H "Accept: application/json"

# Dispatch bot
curl -X POST http://localhost:3000/api/bot/dispatch \
  -H "Cookie: __session=..." \
  -H "Content-Type: application/json" \
  -d '{"meetingUrl":"https://meet.google.com/xxx","title":"Meeting"}'
```

---

**Last Updated**: March 2026
**API Version**: v1
