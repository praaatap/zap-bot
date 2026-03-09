import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getOrCreateUser(userId);

        // Fetch meetings for the user
        const meetings = await prisma.meeting.findMany({
            where: { userId: user.id },
            orderBy: { startTime: 'desc' },
            take: 50,
        });

        return NextResponse.json({ success: true, data: meetings });
    } catch (error) {
        console.error("Error fetching meetings:", error);
        return NextResponse.json(
            { error: "Failed to fetch meetings" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getOrCreateUser(userId);

        const body = await request.json();
        const { title, meetingUrl, startTime, endTime, description } = body;

        // Create new meeting
        const meeting = await prisma.meeting.create({
            data: {
                userId: user.id,
                title: title || "Untitled Meeting",
                meetingUrl,
                startTime: new Date(startTime),
                endTime: new Date(endTime || Date.now() + 3600000), // Default 1 hour
                description,
                botScheduled: true,
            },
        });

        return NextResponse.json({ success: true, data: meeting });
    } catch (error) {
        console.error("Error creating meeting:", error);
        return NextResponse.json(
            { error: "Failed to create meeting" },
            { status: 500 }
        );
    }
}
