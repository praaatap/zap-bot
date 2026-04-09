import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";
import { uploadRecordingToS3, resolveRecordingUrl } from "@/lib/aws";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { databases } from "@/lib/appwrite.server";

/**
 * POST /api/upload/bot-avatar
 * Upload bot avatar image
 */
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getOrCreateUser(userId);

        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload avatar to configured object storage provider.
        const storageKey = await uploadRecordingToS3(`avatar-${user.$id}`, buffer, file.type);
        const publicUrl = (await resolveRecordingUrl(storageKey)) || storageKey;

        // Update user profile with new avatar URL
        await databases.updateDocument(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.usersCollectionId,
            user.$id,
            { botImageUrl: publicUrl }
        );

        return NextResponse.json({ success: true, url: publicUrl });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to upload image" },
            { status: 500 }
        );
    }
}
