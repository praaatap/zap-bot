// ── Meeting Platforms ──────────────────────────────────────────────
export type MeetingPlatform = "google_meet" | "zoom" | "teams";

export interface MeetingChapter {
    title: string;
    startTime: number; // seconds
}

export interface MeetingHighlight {
    type: "decision" | "blocker" | "question" | "insight";
    text: string;
    timestamp: number; // seconds
}

export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";
export type MeetingVisibility = "private" | "workspace" | "shared";
export type MeetingSessionStatus = "active" | "paused" | "ended";

// ── Bot Statuses ───────────────────────────────────────────────────
export type BotStatus =
    | "pending"
    | "joining"
    | "in_meeting"
    | "recording"
    | "processing"
    | "completed"
    | "failed";

// ── Calendar Event ─────────────────────────────────────────────────
export interface CalendarEvent {
    id: string;
    summary: string;
    description?: string;
    start: string; // ISO datetime
    end: string;
    meetingUrl?: string;
    platform?: MeetingPlatform;
    attendees?: string[];
    organizer?: string;
}

// ── Meeting ────────────────────────────────────────────────────────
export interface Meeting {
    id: string;
    calendarEventId?: string;
    ownerUserId?: string;
    workspaceId?: string;
    visibility?: MeetingVisibility;
    collaboratorIds?: string[];
    activeSessionId?: string;
    title: string;
    platform: MeetingPlatform;
    meetingUrl: string;
    startTime: string;
    endTime?: string;
    duration?: number; // seconds
    botId?: string;
    botStatus: BotStatus;
    recordingUrl?: string;
    transcriptUrl?: string;
    transcriptReady?: boolean;
    s3RecordingKey?: string;
    s3TranscriptKey?: string;
    summary?: string;
    actionItems?: string[];
    followUpDraft?: string;
    sentiment?: string; // e.g., "Positive", "Collaborative"
    healthScore?: number; // 0-10
    chapters?: MeetingChapter[];
    highlights?: MeetingHighlight[];
    participants?: string[];
    createdAt: string;
    updatedAt: string;
}

// ── Transcript ─────────────────────────────────────────────────────
export interface TranscriptEntry {
    speaker: string;
    text: string;
    startTime: number; // seconds from meeting start
    endTime: number;
}

export interface Transcript {
    meetingId: string;
    entries: TranscriptEntry[];
    language: string;
    createdAt: string;
}

// ── Integrations ───────────────────────────────────────────────────
export interface UserIntegration {
    id: string;
    userId: string;
    platform: "trello" | "jira" | "asana";
    accessToken: string;
    refreshToken?: string;
    expiresAt?: string;
    accountId?: string;
    boardName?: string;
    projectName?: string;
    connected: boolean;
    createdAt: string;
    updatedAt: string;
}

// ── User ───────────────────────────────────────────────────────────
export interface User {
    id: string;
    email: string;
    name: string;
    googleAccessToken?: string;
    googleRefreshToken?: string;
    calendarConnected: boolean;
    currentPlan: "free" | "starter" | "pro" | "premium";
    subscriptionStatus: "active" | "expired" | "canceled" | "past_due";
    meetingsThisMonth: number;
    chatMessagesToday: number;
    botName?: string;
    botImageUrl?: string;
    integrations: UserIntegration[];
    createdAt: string;
}

// ── Collaboration ──────────────────────────────────────────────────
export interface Workspace {
    id: string;
    name: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface WorkspaceMember {
    id: string;
    workspaceId: string;
    userId: string;
    role: WorkspaceRole;
    invitedBy?: string;
    joinedAt: string;
}

export interface MeetingSession {
    id: string;
    meetingId: string;
    workspaceId: string;
    createdBy: string;
    status: MeetingSessionStatus;
    contextPrompt?: string;
    activeUsers: string[];
    createdAt: string;
    updatedAt: string;
}

// ── Webhook Events ─────────────────────────────────────────────────
export type WebhookEventType =
    | "bot.joining"
    | "bot.joined"
    | "bot.left"
    | "meeting.started"
    | "meeting.completed"
    | "transcription.ready"
    | "recording.ready"
    | "bot.transcript";

export type AssistantEventType =
    | WebhookEventType
    | "meeting.shared"
    | "session.started"
    | "session.user_joined"
    | "session.user_left"
    | "session.ended"
    | "chat.message";

export interface AssistantEvent {
    id: string;
    type: AssistantEventType;
    timestamp: string;
    actorUserId?: string;
    meetingId?: string;
    workspaceId?: string;
    sessionId?: string;
    payload?: Record<string, unknown>;
}

export type AssistantExtensionTransport = "webhook" | "browser" | "internal";
export type AssistantExtensionStatus = "active" | "paused";

export interface AssistantExtension {
    id: string;
    workspaceId: string;
    name: string;
    description?: string;
    target: string;
    transport: AssistantExtensionTransport;
    status: AssistantExtensionStatus;
    subscribedEvents: AssistantEventType[];
    createdBy: string;
    secret?: string;
    createdAt: string;
    updatedAt: string;
    lastTriggeredAt?: string;
}

export interface WebhookEvent {
    type: WebhookEventType;
    meetingId: string;
    botId?: string;
    timestamp: string;
    data?: Record<string, unknown>;
}

// ── API Responses ──────────────────────────────────────────────────
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// ── Stats ──────────────────────────────────────────────────────────
export interface DashboardStats {
    totalMeetings: number;
    hoursTranscribed: number;
    activeBots: number;
    meetingsThisWeek: number;
}

// ── Constants ──────────────────────────────────────────────────────
export const MEETING_PLATFORMS: Record<MeetingPlatform, string> = {
    google_meet: "Google Meet",
    zoom: "Zoom",
    teams: "Microsoft Teams",
};

export const BOT_STATUS_LABELS: Record<BotStatus, string> = {
    pending: "Pending",
    joining: "Joining...",
    in_meeting: "In Meeting",
    recording: "Recording",
    processing: "Processing",
    completed: "Completed",
    failed: "Failed",
};

export const BOT_STATUS_COLORS: Record<BotStatus, string> = {
    pending: "#6b7280",
    joining: "#f59e0b",
    in_meeting: "#3b82f6",
    recording: "#ef4444",
    processing: "#8b5cf6",
    completed: "#10b981",
    failed: "#ef4444",
};
