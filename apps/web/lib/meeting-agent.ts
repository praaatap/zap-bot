type MeetingService = "meetingbaas" | "livekit";

export class MeetingAgentError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number = 400) {
        super(message);
        this.name = "MeetingAgentError";
        this.statusCode = statusCode;
    }
}

export type StandardDispatchRequest = {
    meetingUrl: string;
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    botName?: string;
    recordingMode?: "speaker_view" | "gallery_view";
    speechToTextProvider?: string;
    dryRun: boolean;
};

export type LiveKitDispatchRequest = {
    meetingUrl: string;
    roomName: string;
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    botName?: string;
    recordingMode?: "speaker_view" | "gallery_view";
    numBots: number;
    dryRun: boolean;
};

function asRecord(input: unknown): Record<string, unknown> {
    if (input && typeof input === "object") return input as Record<string, unknown>;
    throw new MeetingAgentError("Invalid request payload", 400);
}

function pickString(value: unknown): string | undefined {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

function parseDate(value: unknown): Date | undefined {
    if (typeof value !== "string" || !value.trim()) return undefined;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function normalizeTimeRange(startInput: unknown, endInput: unknown) {
    const now = new Date();
    const startTime = parseDate(startInput) ?? now;
    const defaultEnd = new Date(startTime.getTime() + 60 * 60 * 1000);
    const endTime = parseDate(endInput) ?? defaultEnd;

    if (endTime.getTime() <= startTime.getTime()) {
        throw new MeetingAgentError("End time must be after start time", 400);
    }

    return { startTime, endTime };
}

function normalizeTitle(input: unknown, fallback: string): string {
    const value = pickString(input) ?? fallback;
    return value.slice(0, 120);
}

export function normalizeStandardDispatchRequest(input: unknown): StandardDispatchRequest {
    const body = asRecord(input);
    const rawMeetingUrl = pickString(body.meetingUrl);

    if (!rawMeetingUrl) {
        throw new MeetingAgentError("Meeting URL is required", 400);
    }

    const meetingUrl = /^https?:\/\//i.test(rawMeetingUrl) ? rawMeetingUrl : `https://${rawMeetingUrl}`;
    const { startTime, endTime } = normalizeTimeRange(body.startTime, body.endTime);

    return {
        meetingUrl,
        title: normalizeTitle(body.title, "Quick Join Meeting"),
        description: pickString(body.description),
        startTime,
        endTime,
        botName: pickString(body.botName),
        recordingMode: body.recordingMode === "gallery_view" ? "gallery_view" : "speaker_view",
        speechToTextProvider: pickString(body.speechToTextProvider),
        dryRun: body.dryRun === true,
    };
}

export function normalizeLiveKitDispatchRequest(input: unknown): LiveKitDispatchRequest {
    const body = asRecord(input);
    const rawMeetingUrl = pickString(body.meetingUrl);

    if (!rawMeetingUrl) {
        throw new MeetingAgentError("Meeting URL is required", 400);
    }

    const meetingUrl = rawMeetingUrl;
    const roomName = extractLiveKitRoomName(meetingUrl);
    const { startTime, endTime } = normalizeTimeRange(body.startTime, body.endTime);
    const requestedBots = typeof body.numBots === "number" ? body.numBots : 2;
    const numBots = Math.min(5, Math.max(1, Math.round(requestedBots)));

    return {
        meetingUrl,
        roomName,
        title: normalizeTitle(body.title, "LiveKit Meeting"),
        description: pickString(body.description),
        startTime,
        endTime,
        botName: pickString(body.botName),
        recordingMode: body.recordingMode === "gallery_view" ? "gallery_view" : "speaker_view",
        numBots,
        dryRun: body.dryRun === true,
    };
}

export function extractLiveKitRoomName(meetingUrl: string): string {
    const trimmed = meetingUrl.trim();
    const room = trimmed.startsWith("livekit:") ? trimmed.replace("livekit:", "") : trimmed.split("/").pop() || "";
    if (!/^[a-zA-Z0-9_-]+$/.test(room)) {
        throw new MeetingAgentError("Invalid LiveKit room name", 400);
    }
    return room;
}

export async function findDuplicateMeetingCandidate(params: {
    prismaClient: any;
    userId: string;
    meetingUrl: string;
    startTime: Date;
}) {
    const { prismaClient, userId, meetingUrl, startTime } = params;
    const windowMs = 10 * 60 * 1000;
    const startWindow = new Date(startTime.getTime() - windowMs);
    const endWindow = new Date(startTime.getTime() + windowMs);

    return prismaClient.meeting.findFirst({
        where: {
            userId,
            meetingUrl,
            startTime: {
                gte: startWindow,
                lte: endWindow,
            },
            OR: [{ botScheduled: true }, { botSent: true }],
        },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            title: true,
            startTime: true,
            meetingUrl: true,
            botId: true,
            botSent: true,
            botScheduled: true,
        },
    });
}

export async function retry<T>(fn: () => Promise<T>, attempts: number = 2): Promise<T> {
    let lastError: unknown;
    for (let i = 0; i <= attempts; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (i === attempts) break;
        }
    }
    throw lastError;
}

export function buildDispatchMeta(service: MeetingService, meetingId: string, userId: string) {
    return {
        service,
        meeting_id: meetingId,
        user_id: userId,
    };
}
