import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { databases, ID, Query } from "@/lib/appwrite.server";
import { resolveAgentBotName, resolveUserDisplayName } from "@/lib/bot-name";

type UserProfileSeed = {
    email?: string | null;
    name?: string | null;
};

export async function getOrCreateUser(clerkId: string, profile?: UserProfileSeed) {
    const existing = await databases.listDocuments(
        APPWRITE_IDS.databaseId,
        APPWRITE_IDS.usersCollectionId,
        [Query.equal("clerkId", clerkId), Query.limit(1)]
    );

    if (existing.total > 0) {
        const current = existing.documents[0] as any;
        const nextName = profile?.name?.trim() || current.name || "";
        const nextEmail = profile?.email?.trim() || current.email || "";
        const nextBotName = resolveAgentBotName({
            name: nextName,
            email: nextEmail,
            clerkId,
        });

        const patch: Record<string, unknown> = {};
        if (nextName && nextName !== current.name) patch.name = nextName;
        if (nextEmail && nextEmail !== current.email) patch.email = nextEmail;
        if (nextBotName !== current.botName) patch.botName = nextBotName;

        if (Object.keys(patch).length === 0) {
            return current;
        }

        return databases.updateDocument(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.usersCollectionId,
            current.$id,
            patch
        );
    }

    const name = profile?.name?.trim() || resolveUserDisplayName({ clerkId });
    const email = profile?.email?.trim() || "";
    const botName = resolveAgentBotName({ name, email, clerkId });

    return databases.createDocument(
        APPWRITE_IDS.databaseId,
        APPWRITE_IDS.usersCollectionId,
        ID.unique(),
        {
            clerkId,
            email,
            name,
            botName,
            assistantTone: "balanced",
            retentionDays: 90,
            storageRegion: "us-east-1",
            autoJoinMeetings: true,
            autoRecordMeetings: true,
            aiSummary: true,
            actionItems: true,
            workflowFollowUpEmail: true,
            workflowSlackSummary: false,
            workflowJiraTasks: false,
            workflowCrmSync: false,
            calendarConnected: false,
            slackConnected: false,
            currentPlan: "free",
            subscriptionStatus: "inactive",
            meetingsThisMonth: 0,
            chatMessagesToday: 0,
            googleAccessToken: null,
            googleRefreshToken: null,
            googleTokenExpiry: null,
        }
    );
}
