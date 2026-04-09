import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { databases, ID, Query } from "@/lib/appwrite.server";

export async function getOrCreateUser(clerkId: string) {
    const existing = await databases.listDocuments(
        APPWRITE_IDS.databaseId,
        APPWRITE_IDS.usersCollectionId,
        [Query.equal("clerkId", clerkId), Query.limit(1)]
    );

    if (existing.total > 0) {
        return existing.documents[0];
    }

    return databases.createDocument(
        APPWRITE_IDS.databaseId,
        APPWRITE_IDS.usersCollectionId,
        ID.unique(),
        {
            clerkId,
            botName: "Zap Bot",
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
        }
    );
}
