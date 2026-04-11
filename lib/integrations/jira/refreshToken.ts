import { databases } from "../../appwrite.server"
import { APPWRITE_IDS } from "../../appwrite-config"

/**
 * Refresh Jira OAuth token using the refresh token stored in Appwrite
 */
export async function refreshJiraToken(integration: any) {
    try {
        if (!integration.refreshToken) {
            throw new Error('Missing refresh token');
        }

        const response = await fetch('https://auth.atlassian.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                grant_type: 'refresh_token',
                client_id: process.env.JIRA_CLIENT_ID!,
                client_secret: process.env.JIRA_CLIENT_SECRET!,
                refresh_token: integration.refreshToken,
            }),
        })

        const data = await response.json()

        if (response.ok) {
            const documentId = integration.$id || integration.id;

            const updatedIntegration = await databases.updateDocument(
                APPWRITE_IDS.databaseId,
                APPWRITE_IDS.integrationsCollectionId,
                documentId,
                {
                    accessToken: data.access_token,
                    refreshToken: data.refresh_token || integration.refreshToken,
                    expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString()
                }
            )

            return updatedIntegration
        } else {
            console.error('failed to refresh jira token:', data)
            throw new Error('token refresh failed')
        }
    } catch (error) {
        console.error('error refreshing jira token', error)
        throw error
    }
}
