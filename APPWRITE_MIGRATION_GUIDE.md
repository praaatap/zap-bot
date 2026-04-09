# Appwrite Migration Guide

This document explains the architecture changes in migrating from Prisma/PostgreSQL to Appwrite Databases.

## Overview: What Changed

| Aspect | Before (Prisma) | After (Appwrite) |
|--------|-----------------|------------------|
| **Database** | PostgreSQL (relational) | Appwrite Databases (JSON documents) |
| **ORM** | Prisma Client | Appwrite SDK (databases, users, storage) |
| **Authentication** | Clerk (third-party) | Appwrite Account (built-in) |
| **User IDs** | UUID (Prisma-generated) | `clerkId` stored in User document; Appwrite $id for other docs |
| **Queries** | `prisma.model.findUnique()` | `databases.listDocuments()` with Query filters |
| **Updates** | `prisma.model.update()` | `databases.updateDocument()` |
| **Creation** | `prisma.model.create()` | `databases.createDocument()` with `ID.unique()` |
| **Auth State** | User session via Clerk | Session cookies (Appwrite Account) |

## Key Concepts

### 1. Documents Instead of Row

**Before (Prisma):**
```typescript
const user = await prisma.user.findUnique({
    where: { id: "clerkId_abc123" }
});
console.log(user.email); // Direct property access
```

**After (Appwrite):**
```typescript
const docs = await databases.listDocuments(
    APPWRITE_IDS.databaseId,
    APPWRITE_IDS.usersCollectionId,
    [Query.equal("clerkId", "clerkId_abc123"), Query.limit(1)]
);
const user = docs.documents[0];
console.log(user.email); // Same property access
```

### 2. Document IDs

Appwrite documents use reserved `$id` field (different from Prisma's `id`):

```typescript
// Creating a document
const doc = await databases.createDocument(
    databaseId,
    collectionId,
    ID.unique(), // Generates unique ID
    { title: "My Meeting" }
);

console.log(doc.$id); // Access as $id, not id!

// Querying by ID
const match = await databases.listDocuments(
    databaseId,
    collectionId,
    [Query.equal("$id", doc.$id)] // Use $id for filtering
);
```

### 3. Query Filters

**Before:**
```typescript
const meetings = await prisma.meeting.findMany({
    where: {
        userId: user.id,
        startTime: { gte: new Date() }
    }
});
```

**After:**
```typescript
const meetings = await databases.listDocuments(
    APPWRITE_IDS.databaseId,
    APPWRITE_IDS.meetingsCollectionId,
    [
        Query.equal("userId", user.$id),
        Query.greaterThanOrEqual("startTime", new Date().toISOString())
    ]
);
```

## Collections Schema

### Users Collection
Stores user account and preferences.

```typescript
{
    $id: "auto-generated",
    clerkId: "user_abc123",          // Indexed for lookups
    email: "user@example.com",
    name: "John Doe",
    botName: "Zap Bot",
    assistantTone: "balanced",
    retentionDays: 90,
    storageRegion: "us-east-1",
    autoJoinMeetings: true,
    autoRecordMeetings: true,
    aiSummary: true,
    actionItems: true,
    currentPlan: "free",
    subscriptionStatus: "active",
    meetingsThisMonth: 0,
    chatMessagesToday: 0,
    slackConnected: false,
    calendarConnected: false
}
```

### Meetings Collection
Stores meeting records and bot session state.

```typescript
{
    $id: "med_xyz789",
    userId: "{user.$id}",              // References Users collection
    title: "Weekly Standup",
    description: "Team sync",
    meetingUrl: "https://meet.google.com/abc-def-ghi",
    startTime: "2024-04-02T10:00:00Z",
    endTime: "2024-04-02T11:00:00Z",
    botScheduled: true,
    botSent: false,
    botId: "bot_12345",                // From MeetingBaas
    botJoinedAt: "2024-04-02T10:05:00Z",
    meetingEnded: false,
    transcript: "Speaker 1: Hello...",
    summary: "Discussed Q2 roadmap",
    transcriptReady: false,
    processed: false,
    ragProcessed: false,
    recordingUrl: "s3://bucket/rec.mp4",
    attendees: ["john@example.com", "jane@example.com"],
    calendarEventId: "cal_event_123"   // For Google Calendar sync
}
```

### UserIntegrations Collection
OAuth tokens and integration settings.

```typescript
{
    $id: "auto-generated",
    userId: "{user.$id}",
    platform: "slack",                 // slack | google | asana | trello
    accessToken: "xoxb-...",
    refreshToken: "xoxp-...",
    expiresAt: "2024-05-02T10:00:00Z",
    metadata: {
        slackTeamId: "T123456",
        slackUserId: "U123456"
    }
}
```

### TranscriptChunks Collection
Processed meeting transcript segments for RAG.

```typescript
{
    $id: "auto-generated",
    meetingId: "{meeting.$id}",
    userId: "{user.$id}",
    chunkIndex: 0,
    speaker: "John Doe",
    text: "Today we'll discuss...",
    startTime: 0,
    endTime: 45,
    embedding: [0.1, 0.2, 0.3, ...] // 1536-dim vector from OpenAI
}
```

### ChatMessages Collection
Conversation history for retrieval.

```typescript
{
    $id: "auto-generated",
    userId: "{user.$id}",
    meetingId: "{meeting.$id}",
    role: "user",                      // user | assistant
    content: "What were the action items?",
    createdAt: "2024-04-02T10:15:00Z"
}
```

### SlackInstallations Collection
Slack app installation state.

```typescript
{
    $id: "auto-generated",
    teamId: "T123456",
    botToken: "xoxb-...",
    appId: "A123456",
    userId: "{user.$id}",              // Null if team-level install
    installedAt: "2024-04-02T10:00:00Z"
}
```

## Migration Patterns

### Pattern 1: Create Operation

**Before:**
```typescript
const meeting = await prisma.meeting.create({
    data: {
        userId: user.id,
        title: "Standup",
        meetingUrl: url
    }
});
```

**After:**
```typescript
const meeting = await databases.createDocument(
    APPWRITE_IDS.databaseId,
    APPWRITE_IDS.meetingsCollectionId,
    ID.unique(),
    {
        userId: user.$id,
        title: "Standup",
        meetingUrl: url,
        botScheduled: false,
        transcriptReady: false,
        // ... other fields with defaults
    }
);
// Access created document: meeting.$id
```

### Pattern 2: Read/Filter Operation

**Before:**
```typescript
const meetings = await prisma.meeting.findMany({
    where: {
        userId: user.id,
        startTime: { gte: now }
    },
    orderBy: { startTime: 'asc' },
    take: 50
});
```

**After:**
```typescript
const results = await databases.listDocuments(
    APPWRITE_IDS.databaseId,
    APPWRITE_IDS.meetingsCollectionId,
    [
        Query.equal("userId", user.$id),
        Query.greaterThanOrEqual("startTime", now.toISOString()),
        Query.orderAsc("startTime"),
        Query.limit(50)
    ]
);
const meetings = results.documents;
```

### Pattern 3: Update Operation

**Before:**
```typescript
const updated = await prisma.meeting.update({
    where: { id: meetingId },
    data: {
        botSent: true,
        botId: result.botId
    }
});
```

**After:**
```typescript
await databases.updateDocument(
    APPWRITE_IDS.databaseId,
    APPWRITE_IDS.meetingsCollectionId,
    meetingId, // Use $id not id
    {
        botSent: true,
        botId: result.botId
    }
);
```

### Pattern 4: Delete Operation

**Before:**
```typescript
await prisma.meeting.delete({
    where: { id: meetingId }
});
```

**After:**
```typescript
await databases.deleteDocument(
    APPWRITE_IDS.databaseId,
    APPWRITE_IDS.meetingsCollectionId,
    meetingId
);
```

### Pattern 5: Increment Counter

**Before:**
```typescript
await prisma.user.update({
    where: { id: user.id },
    data: {
        meetingsThisMonth: { increment: 1 }
    }
});
```

**After:**
```typescript
await databases.updateDocument(
    APPWRITE_IDS.databaseId,
    APPWRITE_IDS.usersCollectionId,
    user.$id,
    {
        meetingsThisMonth: (user.meetingsThisMonth || 0) + 1
    }
);
```

## Authentication Changes

### Before: Clerk
```typescript
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
    const { userId } = await auth();
    // userId is Clerk's user ID
}
```

### After: Appwrite Account + Custom Storage

```typescript
import { auth } from "@clerk/nextjs/server";
// Still using Clerk for auth for now, but reading user data from Appwrite

export async function POST(req: Request) {
    const { userId } = await auth(); // Clerk ID
    const user = await getOrCreateUser(userId); // Get/create in Appwrite
    // user.$id is Appwrite document ID
}
```

**Full migration to Appwrite Account (optional):**
- Replace Clerk auth with `account.createEmailPasswordSession()`
- Store user preferences in Appwrite User document
- Use cookies for session persistence
- See `lib/appwrite.ts` for browser client examples

## Files Changed

**Core Appwrite Setup:**
- `/lib/appwrite.ts` - Browser client (Account, Databases, Storage)
- `/lib/appwrite.server.ts` - Server client with admin permissions
- `/lib/appwrite-config.ts` - Collection ID constants

**User & Usage:**
- `/lib/user.ts` - `getOrCreateUser()` uses Appwrite
- `/lib/usage.ts` - Limit checking and counter updates use Appwrite

**API Routes (Fully Migrated):**
- `/api/meetings/route.ts` - GET list, POST create
- `/api/agent/route.ts` - Fetch meetings for context
- `/api/chat/route.ts` - Query specific meeting
- `/api/bot/dispatch/route.ts` - Create meeting, dispatch bot
- `/api/meetings/[id]/bot-toggle/route.ts` - Update botScheduled flag
- `/api/meetings/[id]/stop-bot/route.ts` - Mark meeting ended

**Still Using Prisma (To Migrate):**
- 34 other API routes (follow patterns above)
- `/prisma/schema.prisma` (for reference - can be deleted after full migration)

## Performance Notes

### Indexing
The setup script creates indexes on frequently-queried fields:
- `Users: clerkId` (text index for lookups)
- `Meetings: userId, startTime` (for filtering dashboard)
- `TranscriptChunks: meetingId` (for RAG retrieval)

### Query Limits
- Max 100 documents per query by default
- Use `Query.offset()` and `Query.limit()` for pagination
- Appwrite handles up to 1MB per document

### Best Practices
1. Always limit result sets: `Query.limit(50)` not unlimited
2. Add indexes for common filters before deploying
3. Denormalize where needed (e.g., store summary with meeting, don't fetch separately)
4. Use `Query.orderDesc("$createdAt")` for reverse chronological sorting

## Breaking Changes

1. **Document IDs**: Use `doc.$id` not `doc.id`
2. **User ID References**: Store `user.$id` not `user.id` in other documents
3. **Date Fields**: Always store as ISO string: `new Date().toISOString()` not raw Date
4. **Async Patterns**: All Appwrite calls are async (use `await`)
5. **Error Handling**: Different error types (AppwriteException instead of Prisma errors)

## Reverting to Prisma (If Needed)

If you need to go back:
1. Restore `lib/prisma.ts` and `schema.prisma`
2. Run `prisma db push` to sync schema
3. Migrate data from Appwrite to PostgreSQL
4. Revert API route imports

This is why all changes were isolated and the pattern was repeated consistently.

## Deployment Notes

### Vercel / Serverless
- Appwrite works great with serverless functions
- No connection pooling needed (unlike PgBouncer for Postgres)
- Cold start latency is minimal (~50ms for listDocuments)
- All costs scale with usage (no fixed server costs)

### Environment Variables
Set in Vercel project settings:
```
NEXT_PUBLIC_APPWRITE_ENDPOINT
NEXT_PUBLIC_APPWRITE_PROJECT_ID
APPWRITE_API_KEY
APPWRITE_DATABASE_ID
[collection IDs...]
```

## Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite SDK (JavaScript)](https://github.com/appwrite/sdk-for-web)
- [Appwrite Query Guide](https://appwrite.io/docs/queries)
- [Database Schema Setup Script](./scripts/setup-appwrite-schema.mjs)
- [Setup Instructions](./APPWRITE_SETUP.md)
