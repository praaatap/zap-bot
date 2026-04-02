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

        // If meetingId is "all" or omitted, we do a global search.
        const targetMeetingId = (!meetingId || meetingId === "all") ? undefined : meetingId;

        if (!question) {
            return NextResponse.json(
                { error: "question is required" },
                { status: 400 }
            );
        }

        let dbMeeting: any = null;
        if (targetMeetingId) {
            dbMeeting = await prisma.meeting.findUnique({
                where: { id: targetMeetingId },
                include: { user: true },
            });

            if (!dbMeeting) {
                return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
            }

            if (dbMeeting.user.clerkId !== userId) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
        }

        // Use the same RAG query stack used during transcript indexing.
        const rag = await queryMeetingRAG(userId, question, targetMeetingId);
        
        let context = rag.context;
        if (!context && dbMeeting) {
            context = transcriptToText(dbMeeting.transcript);
        }

        if (!context) {
            return NextResponse.json({
                success: true,
                answer: "I couldn't find relevant information across your meetings yet. Please try asking a different question.",
            });
        }

        // Use Groq to answer the question
        // If it's a global search, we provide a generic title.
        const titleContext = dbMeeting ? dbMeeting.title : "Multiple Meetings";
        const answer = await answerMeetingQuestion(question, context, titleContext);

        return NextResponse.json({
            success: true,
            answer,
            context,
            sources: rag?.sources || [],
            pipeline: dbMeeting ? {
                botDispatched: dbMeeting.botSent,
                meetingCompleted: dbMeeting.meetingEnded,
                transcriptReady: dbMeeting.transcriptReady,
                ragReady: dbMeeting.ragProcessed,
            } : undefined,
        });
    } catch (error) {
        console.error("Error answering question:", error);
        return NextResponse.json(
            { error: "Failed to answer question" },
            { status: 500 }
        );
    }
}
