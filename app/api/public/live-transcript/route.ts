import { NextResponse } from "next/server";

type TranscriptItem = {
    speaker?: string;
    text?: string;
    words?: Array<{ word?: string }>;
    start?: number;
    end?: number;
};

function buildText(item: TranscriptItem): string {
    if (item.text && item.text.trim()) {
        return item.text.trim();
    }

    if (Array.isArray(item.words)) {
        return item.words
            .map((w) => w.word || "")
            .join(" ")
            .trim();
    }

    return "";
}

function isValidBotId(value: string) {
    return /^[a-zA-Z0-9_-]{6,128}$/.test(value);
}

export async function GET(request: Request) {
    try {
        const apiKey = process.env.MEETING_BAAS_API_KEY;
        const defaultBotId = process.env.MEETING_BAAS_DEMO_BOT_ID;
        const { searchParams } = new URL(request.url);
        const requestedBotId = searchParams.get("botId")?.trim();
        const botId = requestedBotId && isValidBotId(requestedBotId) ? requestedBotId : defaultBotId;

        if (!apiKey || !botId) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Live transcript is not configured. Set MEETING_BAAS_API_KEY and MEETING_BAAS_DEMO_BOT_ID, or pass a valid botId.",
                },
                { status: 503 }
            );
        }

        const [botResponse, transcriptResponse] = await Promise.all([
            fetch(`https://api.meetingbaas.com/v2/bots/${botId}`, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
                cache: "no-store",
            }),
            fetch(`https://api.meetingbaas.com/v2/bots/${botId}/transcript`, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
                cache: "no-store",
            }),
        ]);

        if (!botResponse.ok) {
            const err = await botResponse.text();
            throw new Error(`Bot status request failed (${botResponse.status}): ${err}`);
        }

        const bot = await botResponse.json();

        let transcriptItems: TranscriptItem[] = [];
        if (transcriptResponse.ok) {
            const transcriptPayload = await transcriptResponse.json();
            if (Array.isArray(transcriptPayload)) {
                transcriptItems = transcriptPayload as TranscriptItem[];
            } else if (Array.isArray(transcriptPayload?.data)) {
                transcriptItems = transcriptPayload.data as TranscriptItem[];
            }
        }

        const lines = transcriptItems
            .map((item) => ({
                speaker: item.speaker || "Speaker",
                text: buildText(item),
                start: typeof item.start === "number" ? item.start : undefined,
            }))
            .filter((line) => line.text.length > 0)
            .slice(-6)
            .reverse();

        return NextResponse.json({
            success: true,
            source: "meetingbaas",
            botStatus: bot?.status || "unknown",
            lines,
            updatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Failed to fetch live transcript:", error);
        return NextResponse.json(
            {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch live transcript",
            },
            { status: 500 }
        );
    }
}
