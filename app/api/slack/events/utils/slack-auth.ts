import { databases, Query } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";

export async function authorizeSlack(source: { teamId?: string }) {
    try {
        const { teamId } = source

        if (!teamId) {
            throw new Error('No team ID provided')
        }
        const installations = await databases.listDocuments(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.slackInstallationsCollectionId,
            [Query.equal("teamId", teamId), Query.limit(1)]
        );
        const installation = installations.total > 0 ? installations.documents[0] : null;

        if (!installation || !installation.active) {
            console.error('installation not found or inactive for the team:', teamId)
            throw new Error(`installation not found for team: ${teamId}`)
        }

        return {
            botToken: installation.botToken,
            teamId: installation.teamId
        }
    } catch (error) {
        console.error('auth error:', error)
        throw error
    }
}
