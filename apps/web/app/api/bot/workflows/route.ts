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

        const user: any = await getOrCreateUser(userId);

        return NextResponse.json({
            success: true,
            data: {
                followUpEmail: user.workflowFollowUpEmail,
                slackSummary: user.workflowSlackSummary,
                jiraTasks: user.workflowJiraTasks,
                crmSync: user.workflowCrmSync,
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

        const updatedUser: any = await prisma.user.update({
            where: { id: user.id },
            data: dataToUpdate,
            select: {
                workflowFollowUpEmail: true,
                workflowSlackSummary: true,
                workflowJiraTasks: true,
                workflowCrmSync: true,
            } as any,
        });

        return NextResponse.json({
            success: true,
            data: {
                followUpEmail: updatedUser.workflowFollowUpEmail,
                slackSummary: updatedUser.workflowSlackSummary,
                jiraTasks: updatedUser.workflowJiraTasks,
                crmSync: updatedUser.workflowCrmSync,
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
