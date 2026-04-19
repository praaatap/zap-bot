import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { databases, Query } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { getOrCreateUser } from "@/lib/user";
import { getObjectStorageProvider, isRecordingStoredInR2 } from "@/lib/aws";
import { extractTranscriptEntries, TranscriptEntry } from "@/lib/transcript";

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

        const user = await getOrCreateUser(userId);

        const meetingDoc = await databases.listDocuments(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.meetingsCollectionId,
            [Query.equal("$id", p.id), Query.limit(1)]
        );

        if (meetingDoc.total === 0) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        const meeting = meetingDoc.documents[0] as any;

        if (meeting.userId !== user.$id) {
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
            ? Math.max(0, Math.floor((new Date(meeting.endTime).getTime() - new Date(meeting.startTime).getTime()) / 1000))
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
