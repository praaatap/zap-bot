import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { databases, Query } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { getOrCreateUser } from "@/lib/user";

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getOrCreateUser(userId);

        return NextResponse.json({
            success: true,
            data: {
                followUpEmail: (user as any).workflowFollowUpEmail,
                slackSummary: (user as any).workflowSlackSummary,
                jiraTasks: (user as any).workflowJiraTasks,
                crmSync: (user as any).workflowCrmSync,
            },
        });
    } catch (error) {
        console.error("Error fetching workflows:", error);
        return NextResponse.json(
            { error: "Failed to fetch workflows" },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getOrCreateUser(userId);
        const body = await request.json();

        // Ensure we only process booleans safely
        const dataToUpdate: any = {};
        if (typeof body.followUpEmail === "boolean") dataToUpdate.workflowFollowUpEmail = body.followUpEmail;
        if (typeof body.slackSummary === "boolean") dataToUpdate.workflowSlackSummary = body.slackSummary;
        if (typeof body.jiraTasks === "boolean") dataToUpdate.workflowJiraTasks = body.jiraTasks;
        if (typeof body.crmSync === "boolean") dataToUpdate.workflowCrmSync = body.crmSync;

        const updatedUser = await databases.updateDocument(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.usersCollectionId,
            user.$id,
            dataToUpdate,
        );

        return NextResponse.json({
            success: true,
            data: {
                followUpEmail: (updatedUser as any).workflowFollowUpEmail,
                slackSummary: (updatedUser as any).workflowSlackSummary,
                jiraTasks: (updatedUser as any).workflowJiraTasks,
                crmSync: (updatedUser as any).workflowCrmSync,
            },
        });
    } catch (error) {
        console.error("Error saving workflows:", error);
        return NextResponse.json(
            { error: "Failed to save workflows" },
            { status: 500 }
        );
    }
}
