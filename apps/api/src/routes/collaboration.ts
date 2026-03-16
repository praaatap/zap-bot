import { Router } from "express";
import type {
    ApiResponse,
    AssistantEvent,
    AssistantEventType,
    AssistantExtension,
    MeetingSession,
    Workspace,
    WorkspaceMember,
    WorkspaceRole,
} from "@repo/shared";
import { store } from "../store.js";
import { dispatchAssistantEvent } from "../services/assistant-events.js";

export const collaborationRouter: Router = Router();

const ASSISTANT_EVENT_TYPES = new Set<string>([
    "bot.joining",
    "bot.joined",
    "bot.left",
    "meeting.started",
    "meeting.completed",
    "transcription.ready",
    "recording.ready",
    "bot.transcript",
    "meeting.shared",
    "session.started",
    "session.user_joined",
    "session.user_left",
    "session.ended",
    "chat.message",
]);

function getFallbackUserId(): string | undefined {
    return store.getAllUsers()[0]?.id;
}

function resolveUserId(input?: unknown): string | undefined {
    if (typeof input === "string" && input.trim()) {
        return input.trim();
    }
    return getFallbackUserId();
}

/**
 * POST /api/collaboration/workspaces
 * Create a multi-user workspace
 */
collaborationRouter.post("/workspaces", (req, res) => {
    const { name, createdBy } = req.body ?? {};
    const userId = resolveUserId(createdBy);

    if (!name || typeof name !== "string") {
        res.status(400).json({ success: false, error: "name is required" } satisfies ApiResponse<never>);
        return;
    }

    if (!userId) {
        res.status(400).json({ success: false, error: "createdBy is required" } satisfies ApiResponse<never>);
        return;
    }

    const workspace = store.createWorkspace({
        name: name.trim(),
        createdBy: userId,
    });

    res.status(201).json({ success: true, data: workspace } satisfies ApiResponse<Workspace>);
});

/**
 * GET /api/collaboration/workspaces?userId=
 * List workspaces for a user
 */
collaborationRouter.get("/workspaces", (req, res) => {
    const userId = resolveUserId(req.query.userId);
    if (!userId) {
        res.status(400).json({ success: false, error: "userId is required" } satisfies ApiResponse<never>);
        return;
    }

    const workspaces = store.listWorkspacesByUser(userId);
    res.json({ success: true, data: workspaces } satisfies ApiResponse<Workspace[]>);
});

/**
 * GET /api/collaboration/workspaces/:workspaceId/members
 */
collaborationRouter.get("/workspaces/:workspaceId/members", (req, res) => {
    const workspace = store.getWorkspace(req.params.workspaceId);
    if (!workspace) {
        res.status(404).json({ success: false, error: "Workspace not found" } satisfies ApiResponse<never>);
        return;
    }

    const members = store.listWorkspaceMembers(workspace.id);
    res.json({ success: true, data: members } satisfies ApiResponse<WorkspaceMember[]>);
});

/**
 * POST /api/collaboration/workspaces/:workspaceId/members
 * Add or update a workspace member
 */
collaborationRouter.post("/workspaces/:workspaceId/members", (req, res) => {
    const { userId, role, invitedBy } = req.body ?? {};
    const workspace = store.getWorkspace(req.params.workspaceId);

    if (!workspace) {
        res.status(404).json({ success: false, error: "Workspace not found" } satisfies ApiResponse<never>);
        return;
    }

    if (!userId || typeof userId !== "string") {
        res.status(400).json({ success: false, error: "userId is required" } satisfies ApiResponse<never>);
        return;
    }

    const safeRole: WorkspaceRole = ["owner", "admin", "member", "viewer"].includes(role)
        ? role
        : "member";

    const member = store.addWorkspaceMember({
        workspaceId: workspace.id,
        userId,
        role: safeRole,
        invitedBy: typeof invitedBy === "string" ? invitedBy : undefined,
    });

    res.status(201).json({ success: true, data: member } satisfies ApiResponse<WorkspaceMember>);
});

/**
 * POST /api/collaboration/meetings/:meetingId/sessions
 * Start an AI meeting copilot session for multiple users
 */
collaborationRouter.post("/meetings/:meetingId/sessions", async (req, res) => {
    const meeting = store.getMeeting(req.params.meetingId);
    const { workspaceId, createdBy, contextPrompt } = req.body ?? {};

    if (!meeting) {
        res.status(404).json({ success: false, error: "Meeting not found" } satisfies ApiResponse<never>);
        return;
    }

    const resolvedWorkspaceId = typeof workspaceId === "string" && workspaceId ? workspaceId : meeting.workspaceId;
    const creatorId = resolveUserId(createdBy);

    if (!resolvedWorkspaceId) {
        res.status(400).json({ success: false, error: "workspaceId is required" } satisfies ApiResponse<never>);
        return;
    }

    if (!creatorId) {
        res.status(400).json({ success: false, error: "createdBy is required" } satisfies ApiResponse<never>);
        return;
    }

    const workspace = store.getWorkspace(resolvedWorkspaceId);
    if (!workspace) {
        res.status(404).json({ success: false, error: "Workspace not found" } satisfies ApiResponse<never>);
        return;
    }

    const session = store.createMeetingSession({
        meetingId: meeting.id,
        workspaceId: workspace.id,
        createdBy: creatorId,
        contextPrompt: typeof contextPrompt === "string" ? contextPrompt : undefined,
    });

    await dispatchAssistantEvent({
        type: "session.started",
        actorUserId: creatorId,
        meetingId: meeting.id,
        workspaceId: workspace.id,
        sessionId: session.id,
        payload: { contextPrompt: session.contextPrompt },
    });

    res.status(201).json({ success: true, data: session } satisfies ApiResponse<MeetingSession>);
});

/**
 * GET /api/collaboration/meetings/:meetingId/sessions
 */
collaborationRouter.get("/meetings/:meetingId/sessions", (req, res) => {
    const meeting = store.getMeeting(req.params.meetingId);
    if (!meeting) {
        res.status(404).json({ success: false, error: "Meeting not found" } satisfies ApiResponse<never>);
        return;
    }

    const sessions = store.listMeetingSessions(meeting.id);
    res.json({ success: true, data: sessions } satisfies ApiResponse<MeetingSession[]>);
});

/**
 * POST /api/collaboration/sessions/:sessionId/join
 */
collaborationRouter.post("/sessions/:sessionId/join", async (req, res) => {
    const userId = resolveUserId(req.body?.userId);
    const session = store.getMeetingSession(req.params.sessionId);

    if (!session) {
        res.status(404).json({ success: false, error: "Session not found" } satisfies ApiResponse<never>);
        return;
    }

    if (!userId) {
        res.status(400).json({ success: false, error: "userId is required" } satisfies ApiResponse<never>);
        return;
    }

    const updated = store.addSessionUser(session.id, userId);
    if (!updated) {
        res.status(500).json({ success: false, error: "Failed to join session" } satisfies ApiResponse<never>);
        return;
    }

    await dispatchAssistantEvent({
        type: "session.user_joined",
        actorUserId: userId,
        meetingId: updated.meetingId,
        workspaceId: updated.workspaceId,
        sessionId: updated.id,
        payload: { activeUsers: updated.activeUsers },
    });

    res.json({ success: true, data: updated } satisfies ApiResponse<MeetingSession>);
});

/**
 * POST /api/collaboration/sessions/:sessionId/leave
 */
collaborationRouter.post("/sessions/:sessionId/leave", async (req, res) => {
    const userId = resolveUserId(req.body?.userId);
    const session = store.getMeetingSession(req.params.sessionId);

    if (!session) {
        res.status(404).json({ success: false, error: "Session not found" } satisfies ApiResponse<never>);
        return;
    }

    if (!userId) {
        res.status(400).json({ success: false, error: "userId is required" } satisfies ApiResponse<never>);
        return;
    }

    const updated = store.removeSessionUser(session.id, userId);
    if (!updated) {
        res.status(500).json({ success: false, error: "Failed to leave session" } satisfies ApiResponse<never>);
        return;
    }

    await dispatchAssistantEvent({
        type: "session.user_left",
        actorUserId: userId,
        meetingId: updated.meetingId,
        workspaceId: updated.workspaceId,
        sessionId: updated.id,
        payload: { activeUsers: updated.activeUsers },
    });

    res.json({ success: true, data: updated } satisfies ApiResponse<MeetingSession>);
});

/**
 * POST /api/collaboration/sessions/:sessionId/end
 */
collaborationRouter.post("/sessions/:sessionId/end", async (req, res) => {
    const session = store.getMeetingSession(req.params.sessionId);
    const actorUserId = resolveUserId(req.body?.actorUserId);

    if (!session) {
        res.status(404).json({ success: false, error: "Session not found" } satisfies ApiResponse<never>);
        return;
    }

    const updated = store.upsertMeetingSession({
        id: session.id,
        status: "ended",
        activeUsers: [],
    });

    if (!updated) {
        res.status(500).json({ success: false, error: "Failed to end session" } satisfies ApiResponse<never>);
        return;
    }

    await dispatchAssistantEvent({
        type: "session.ended",
        actorUserId: actorUserId || session.createdBy,
        meetingId: updated.meetingId,
        workspaceId: updated.workspaceId,
        sessionId: updated.id,
    });

    res.json({ success: true, data: updated } satisfies ApiResponse<MeetingSession>);
});

/**
 * POST /api/collaboration/workspaces/:workspaceId/extensions
 * Register assistant extension hooks
 */
collaborationRouter.post("/workspaces/:workspaceId/extensions", (req, res) => {
    const workspace = store.getWorkspace(req.params.workspaceId);
    const {
        name,
        description,
        target,
        transport,
        status,
        subscribedEvents,
        createdBy,
        secret,
    } = req.body ?? {};

    if (!workspace) {
        res.status(404).json({ success: false, error: "Workspace not found" } satisfies ApiResponse<never>);
        return;
    }

    if (!name || !target || !transport || !Array.isArray(subscribedEvents)) {
        res.status(400).json({ success: false, error: "name, target, transport, and subscribedEvents are required" } satisfies ApiResponse<never>);
        return;
    }

    if (!["webhook", "browser", "internal"].includes(transport)) {
        res.status(400).json({ success: false, error: "Invalid transport" } satisfies ApiResponse<never>);
        return;
    }

    const extension = store.upsertAssistantExtension({
        workspaceId: workspace.id,
        name,
        description,
        target,
        transport,
        status: status === "paused" ? "paused" : "active",
        subscribedEvents,
        createdBy: resolveUserId(createdBy) || workspace.createdBy,
        secret,
    });

    res.status(201).json({ success: true, data: extension } satisfies ApiResponse<AssistantExtension>);
});

/**
 * GET /api/collaboration/workspaces/:workspaceId/extensions
 */
collaborationRouter.get("/workspaces/:workspaceId/extensions", (req, res) => {
    const workspace = store.getWorkspace(req.params.workspaceId);
    if (!workspace) {
        res.status(404).json({ success: false, error: "Workspace not found" } satisfies ApiResponse<never>);
        return;
    }

    const extensions = store.listWorkspaceExtensions(workspace.id);
    res.json({ success: true, data: extensions } satisfies ApiResponse<AssistantExtension[]>);
});

/**
 * PATCH /api/collaboration/extensions/:extensionId/status
 */
collaborationRouter.patch("/extensions/:extensionId/status", (req, res) => {
    const extension = store.getAssistantExtension(req.params.extensionId);
    const { status } = req.body ?? {};

    if (!extension) {
        res.status(404).json({ success: false, error: "Extension not found" } satisfies ApiResponse<never>);
        return;
    }

    if (status !== "active" && status !== "paused") {
        res.status(400).json({ success: false, error: "status must be active or paused" } satisfies ApiResponse<never>);
        return;
    }

    const updated = store.upsertAssistantExtension({
        ...extension,
        status,
    });

    res.json({ success: true, data: updated } satisfies ApiResponse<AssistantExtension>);
});

/**
 * POST /api/collaboration/events/publish
 * Publish event to extension subscribers
 */
collaborationRouter.post("/events/publish", async (req, res) => {
    const { type, actorUserId, meetingId, workspaceId, sessionId, payload } = req.body ?? {};

    if (!type || typeof type !== "string") {
        res.status(400).json({ success: false, error: "type is required" } satisfies ApiResponse<never>);
        return;
    }

    if (!ASSISTANT_EVENT_TYPES.has(type)) {
        res.status(400).json({ success: false, error: "Unsupported event type" } satisfies ApiResponse<never>);
        return;
    }

    const eventType = type as AssistantEventType;

    const result = await dispatchAssistantEvent({
        type: eventType,
        actorUserId,
        meetingId,
        workspaceId,
        sessionId,
        payload: payload && typeof payload === "object" ? payload : undefined,
    });

    res.json({ success: true, data: result });
});

/**
 * GET /api/collaboration/events
 */
collaborationRouter.get("/events", (req, res) => {
    const filters = {
        workspaceId: typeof req.query.workspaceId === "string" ? req.query.workspaceId : undefined,
        meetingId: typeof req.query.meetingId === "string" ? req.query.meetingId : undefined,
        sessionId: typeof req.query.sessionId === "string" ? req.query.sessionId : undefined,
    };
    const events = store.listAssistantEvents(filters);
    res.json({ success: true, data: events } satisfies ApiResponse<AssistantEvent[]>);
});
