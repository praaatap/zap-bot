import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getMeetingContext, answerMeetingQuestion } from "@/lib/pinecone";
import { prisma } from "@/lib/prisma";

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

        // Get relevant context from Pinecone
        const context = await getMeetingContext(meetingId, question);

        if (!context) {
            return NextResponse.json({
                success: true,
                answer: "I couldn't find relevant information in the meeting transcript to answer your question.",
            });
        }

        // Use Groq to answer the question
        const answer = await answerMeetingQuestion(question, context, meeting.title);

        return NextResponse.json({
            success: true,
            answer,
            context,
        });
    } catch (error) {
        console.error("Error answering question:", error);
        return NextResponse.json(
            { error: "Failed to answer question" },
            { status: 500 }
        );
    }
}
