export type TranscriptWord = {
    word?: string;
};

export type TranscriptEntry = {
    speaker?: string;
    text?: string;
    startTime?: number;
    endTime?: number;
    words?: TranscriptWord[];
};

type TranscriptEnvelope = {
    entries?: TranscriptEntry[];
    data?: TranscriptEntry[];
    text?: string;
};

export function maybeParseJson<T = unknown>(value: unknown): T | unknown {
    if (typeof value !== "string") return value;

    const trimmed = value.trim();
    if (!trimmed) return value;

    try {
        return JSON.parse(trimmed) as T;
    } catch {
        return value;
    }
}

function normalizeEntry(entry: TranscriptEntry | null | undefined): TranscriptEntry | null {
    if (!entry) return null;

    const wordsText = Array.isArray(entry.words)
        ? entry.words
            .map((word) => (typeof word?.word === "string" ? word.word.trim() : ""))
            .filter(Boolean)
            .join(" ")
        : "";

    const text = typeof entry.text === "string" && entry.text.trim()
        ? entry.text.trim()
        : wordsText;

    if (!text) return null;

    const startTime = typeof entry.startTime === "number" ? entry.startTime : 0;
    const endTime = typeof entry.endTime === "number" ? entry.endTime : startTime;

    return {
        speaker: typeof entry.speaker === "string" && entry.speaker.trim() ? entry.speaker.trim() : "Speaker",
        text,
        startTime,
        endTime,
        words: Array.isArray(entry.words) ? entry.words : undefined,
    };
}

export function extractTranscriptEntries(transcript: unknown): TranscriptEntry[] {
    if (!transcript) return [];

    const parsed = maybeParseJson<TranscriptEnvelope | TranscriptEntry[]>(transcript);

    if (Array.isArray(parsed)) {
        return parsed
            .map((entry) => normalizeEntry(entry))
            .filter((entry): entry is TranscriptEntry => Boolean(entry));
    }

    if (parsed && typeof parsed === "object" && Array.isArray((parsed as TranscriptEnvelope).entries)) {
        return (parsed as TranscriptEnvelope).entries!
            .map((entry) => normalizeEntry(entry))
            .filter((entry): entry is TranscriptEntry => Boolean(entry));
    }

    if (parsed && typeof parsed === "object" && Array.isArray((parsed as TranscriptEnvelope).data)) {
        return (parsed as TranscriptEnvelope).data!
            .map((entry) => normalizeEntry(entry))
            .filter((entry): entry is TranscriptEntry => Boolean(entry));
    }

    if (parsed && typeof parsed === "object" && typeof (parsed as TranscriptEnvelope).text === "string") {
        return extractTranscriptEntries((parsed as TranscriptEnvelope).text);
    }

    if (typeof transcript === "string") {
        return transcript
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
                const separator = line.indexOf(":");
                if (separator > 0) {
                    return {
                        speaker: line.slice(0, separator).trim(),
                        text: line.slice(separator + 1).trim(),
                        startTime: 0,
                        endTime: 0,
                    };
                }

                return {
                    speaker: "Speaker",
                    text: line,
                    startTime: 0,
                    endTime: 0,
                };
            });
    }

    return [];
}

export function transcriptToText(transcript: unknown): string {
    const entries = extractTranscriptEntries(transcript);
    if (entries.length > 0) {
        return entries
            .map((entry) => `${entry.speaker || "Speaker"}: ${entry.text || ""}`.trim())
            .filter(Boolean)
            .join("\n");
    }

    if (typeof transcript === "string") {
        return transcript.trim();
    }

    return "";
}

export function collectTranscriptSpeakers(transcript: unknown): string[] {
    return Array.from(
        new Set(
            extractTranscriptEntries(transcript)
                .map((entry) => entry.speaker || "Speaker")
                .filter(Boolean)
        )
    );
}

export function normalizeTranscriptPayload(transcript: unknown) {
    const entries = extractTranscriptEntries(transcript);
    const text = transcriptToText(transcript);
    const serialized = typeof transcript === "string"
        ? transcript
        : JSON.stringify(Array.isArray(transcript) ? transcript : { entries });

    return {
        entries,
        text,
        serialized,
        speakers: collectTranscriptSpeakers(transcript),
    };
}
