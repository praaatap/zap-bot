import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { answerMeetingQuestion } from "@/lib/pinecone";
import { prisma } from "@/lib/prisma";
import { queryMeetingRAG } from "@/lib/rag";

function transcriptToText(transcript: unknown): string {
    if (typeof transcript === "string") {
        return transcript;
    }

    if (Array.isArray(transcript)) {
        return transcript
            .map((item: any) => {
                const speaker = item?.speaker || "Speaker";
                const text = item?.words?.map((w: any) => w?.word).join(" ") || item?.text || "";
                return `${speaker}: ${text}`.trim();
            })
            .filter((line) => line.length > 0)
            .join("\n");
    }

    return "";
}

export async function POST(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { meetingId, question } = body;

        if (!meetingId || !question) {
            return NextResponse.json(
                { error: "meetingId and question are required" },
                { status: 400 }
            );
        }

        // Get meeting to verify ownership
        const meeting = await prisma.meeting.findUnique({
            where: { id: meetingId },
            include: { user: true },
        });

        if (!meeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        if (meeting.user.clerkId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Use the same RAG query stack used during transcript indexing.
        const rag = await queryMeetingRAG(meeting.userId, question, meetingId);
        const context = rag.context || transcriptToText(meeting.transcript);

        if (!context) {
            return NextResponse.json({
                success: true,
                answer: "I couldn't find relevant information in this meeting yet. Please try again in a minute after transcript processing completes.",
            });
        }

        // Use Groq to answer the question
        const answer = await answerMeetingQuestion(question, context, meeting.title);

        return NextResponse.json({
            success: true,
            answer,
            context,
            pipeline: {
                botDispatched: meeting.botSent,
                meetingCompleted: meeting.meetingEnded,
                transcriptReady: meeting.transcriptReady,
                ragReady: meeting.ragProcessed,
            },
        });
    } catch (error) {
        console.error("Error answering question:", error);
        return NextResponse.json(
            { error: "Failed to answer question" },
            { status: 500 }
        );
    }
}
