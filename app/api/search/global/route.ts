import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { databases, Query } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { Calendar, MessageSquare, Search } from "lucide-react";

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q") || "";

        if (!query) return NextResponse.json({ results: [] });

        // Search meetings in Appwrite
        const meetingsRes = await databases.listDocuments(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.meetingsCollectionId,
            [
                Query.equal("userId", userId),
                Query.contains("title", query),
                Query.limit(5),
                Query.orderDesc("$createdAt")
            ]
        );

        const results = meetingsRes.documents.map((m: any) => ({
            id: m.$id,
            type: "meeting",
            title: m.title || "Untitled Meeting",
            subtitle: new Date(m.startTime).toLocaleDateString(),
            href: `/dashboard/meetings/${m.$id}`,
            icon: "Calendar" // We'll map this string back to an icon in clinical component
        }));

        // In a real scenario, we could also search transcript chunks here
        // but for now, we'll keep it fast with metadata search.

        return NextResponse.json({ results });
    } catch (error) {
        console.error("Global search API error:", error);
        return NextResponse.json({ results: [] }, { status: 500 });
    }
}
