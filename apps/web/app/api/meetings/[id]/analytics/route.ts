import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getObjectStorageProvider, isRecordingStoredInR2 } from "@/lib/aws";

type TranscriptEntry = {
    speaker?: string;
    text?: string;
    startTime?: number;
    endTime?: number;
    words?: Array<{ word?: string }>;
};

function extractTranscriptEntries(transcript: unknown): TranscriptEntry[] {
    if (!transcript) return [];

    if (Array.isArray(transcript)) {
        return transcript as TranscriptEntry[];
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
                    };
                }
                return { speaker: "Speaker", text: line };
            });
    }

    const objectTranscript = transcript as { entries?: TranscriptEntry[] };
    if (Array.isArray(objectTranscript.entries)) {
        return objectTranscript.entries;
    }

    return [];
}

function countWords(entry: TranscriptEntry): number {
    if (Array.isArray(entry.words) && entry.words.length > 0) {
        return entry.words.filter((w) => Boolean(w.word)).length;
    }

    const text = entry.text || "";
    return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        const p = await params;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const meeting = await prisma.meeting.findUnique({
            where: { id: p.id },
            include: { user: true },
        });

        if (!meeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        if (meeting.user.clerkId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const entries = extractTranscriptEntries(meeting.transcript);
        const totalTurns = entries.length;
        const totalWords = entries.reduce((sum, entry) => sum + countWords(entry), 0);
        const questions = entries.filter((entry) => (entry.text || "").includes("?")).length;

        const speakerWordCount = new Map<string, number>();
        for (const entry of entries) {
            const speaker = entry.speaker || "Speaker";
            const words = countWords(entry);
            speakerWordCount.set(speaker, (speakerWordCount.get(speaker) || 0) + words);
        }

        const speakers = Array.from(speakerWordCount.entries())
            .map(([speaker, words]) => ({
                speaker,
                words,
                share: totalWords > 0 ? Number(((words / totalWords) * 100).toFixed(1)) : 0,
            }))
            .sort((a, b) => b.words - a.words);

        const durationSeconds = meeting.endTime
            ? Math.max(0, Math.floor((meeting.endTime.getTime() - meeting.startTime.getTime()) / 1000))
            : 0;

        return NextResponse.json({
            success: true,
            data: {
                totals: {
                    turns: totalTurns,
                    words: totalWords,
                    speakers: speakers.length,
                    questions,
                    durationMinutes: Math.round(durationSeconds / 60),
                },
                pipeline: {
                    botDispatched: meeting.botSent,
                    joinedConfirmed: Boolean(meeting.botJoinedAt),
                    meetingCompleted: meeting.meetingEnded,
                    transcriptReady: meeting.transcriptReady,
                    recordingStoredInR2: isRecordingStoredInR2(meeting.recordingUrl),
                    ragReady: meeting.ragProcessed,
                },
                objectStorageProvider: getObjectStorageProvider(),
                speakers,
            },
        });
    } catch (error) {
        console.error("Error fetching meeting analytics:", error);
        return NextResponse.json(
            {
                error: "Failed to fetch meeting analytics",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
