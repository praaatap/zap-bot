import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { answerQuestionWithContext as answerMeetingQuestion } from "@/lib/ai/processor";
import { queryRAG as queryMeetingRAG } from "@/lib/ai/rag";
import { databases, Query } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { getOrCreateUser } from "@/lib/user";

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
            const user = await getOrCreateUser(userId);

            const meetingDoc = await databases.listDocuments(
                APPWRITE_IDS.databaseId,
                APPWRITE_IDS.meetingsCollectionId,
                [Query.equal("$id", targetMeetingId), Query.limit(1)]
            );

            if (meetingDoc.total === 0) {
                return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
            }

            dbMeeting = meetingDoc.documents[0];

            if (dbMeeting.userId !== user.$id) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
        }

        // Use the same RAG query stack used during transcript indexing.
        const rag = await queryMeetingRAG({
            userId,
            question,
            meetingId: targetMeetingId
        });
        
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
        const answer = await answerMeetingQuestion({
            question,
            context,
            meetingTitle: titleContext
        });

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
