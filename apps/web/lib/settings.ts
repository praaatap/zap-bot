export type ZapSettings = {
    botName: string;
    assistantTone: "balanced" | "concise" | "friendly";
    fallbackLanguage: "en" | "es" | "fr" | "de";
    autoJoinMeetings: boolean;
    autoLeaveWhenEmpty: boolean;
    autoRecordMeetings: boolean;
    autoSendFollowup: boolean;
    liveTranscript: boolean;
    aiSummary: boolean;
    actionItems: boolean;
    speakerLabels: boolean;
    smartChaptering: boolean;
    recordingQuality: "standard" | "high";
    storageRegion: "us-east-1" | "eu-west-1" | "ap-southeast-1";
    retentionDays: number;
    emailNotifications: boolean;
    slackNotifications: boolean;
    desktopNotifications: boolean;
    dailyDigestHour: string;
};

export const SETTINGS_STORAGE_KEY = "zapbot.settings.v2";

export const DEFAULT_SETTINGS: ZapSettings = {
    botName: "Zap Bot",
    assistantTone: "balanced",
    fallbackLanguage: "en",
    autoJoinMeetings: true,
    autoLeaveWhenEmpty: true,
    autoRecordMeetings: true,
    autoSendFollowup: false,
    liveTranscript: true,
    aiSummary: true,
    actionItems: true,
    speakerLabels: true,
    smartChaptering: false,
    recordingQuality: "high",
    storageRegion: "us-east-1",
    retentionDays: 90,
    emailNotifications: true,
    slackNotifications: false,
    desktopNotifications: true,
    dailyDigestHour: "17:00",
};

function isObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object";
}

function pickString<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
    return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function pickBoolean(value: unknown, fallback: boolean): boolean {
    return typeof value === "boolean" ? value : fallback;
}

function pickTime(value: unknown, fallback: string): string {
    if (typeof value !== "string") return fallback;
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value) ? value : fallback;
}

export function normalizeZapSettings(input: unknown): ZapSettings {
    if (!isObject(input)) return DEFAULT_SETTINGS;

    const source = input as Partial<ZapSettings>;

    return {
        botName: typeof source.botName === "string" && source.botName.trim() ? source.botName.trim().slice(0, 60) : DEFAULT_SETTINGS.botName,
        assistantTone: pickString(source.assistantTone, ["balanced", "concise", "friendly"] as const, DEFAULT_SETTINGS.assistantTone),
        fallbackLanguage: pickString(source.fallbackLanguage, ["en", "es", "fr", "de"] as const, DEFAULT_SETTINGS.fallbackLanguage),
        autoJoinMeetings: pickBoolean(source.autoJoinMeetings, DEFAULT_SETTINGS.autoJoinMeetings),
        autoLeaveWhenEmpty: pickBoolean(source.autoLeaveWhenEmpty, DEFAULT_SETTINGS.autoLeaveWhenEmpty),
        autoRecordMeetings: pickBoolean(source.autoRecordMeetings, DEFAULT_SETTINGS.autoRecordMeetings),
        autoSendFollowup: pickBoolean(source.autoSendFollowup, DEFAULT_SETTINGS.autoSendFollowup),
        liveTranscript: pickBoolean(source.liveTranscript, DEFAULT_SETTINGS.liveTranscript),
        aiSummary: pickBoolean(source.aiSummary, DEFAULT_SETTINGS.aiSummary),
        actionItems: pickBoolean(source.actionItems, DEFAULT_SETTINGS.actionItems),
        speakerLabels: pickBoolean(source.speakerLabels, DEFAULT_SETTINGS.speakerLabels),
        smartChaptering: pickBoolean(source.smartChaptering, DEFAULT_SETTINGS.smartChaptering),
        recordingQuality: pickString(source.recordingQuality, ["standard", "high"] as const, DEFAULT_SETTINGS.recordingQuality),
        storageRegion: pickString(source.storageRegion, ["us-east-1", "eu-west-1", "ap-southeast-1"] as const, DEFAULT_SETTINGS.storageRegion),
        retentionDays: typeof source.retentionDays === "number" ? Math.min(365, Math.max(7, Math.round(source.retentionDays))) : DEFAULT_SETTINGS.retentionDays,
        emailNotifications: pickBoolean(source.emailNotifications, DEFAULT_SETTINGS.emailNotifications),
        slackNotifications: pickBoolean(source.slackNotifications, DEFAULT_SETTINGS.slackNotifications),
        desktopNotifications: pickBoolean(source.desktopNotifications, DEFAULT_SETTINGS.desktopNotifications),
        dailyDigestHour: pickTime(source.dailyDigestHour, DEFAULT_SETTINGS.dailyDigestHour),
    };
}

export const API_PERSISTED_SETTINGS_KEYS: Array<keyof ZapSettings> = ["botName"];
