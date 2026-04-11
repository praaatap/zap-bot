import { databases } from "../../appwrite.server"
import { APPWRITE_IDS } from "../../appwrite-config"

/**
 * Refresh Asana OAuth token using the refresh token stored in Appwrite
 */
export async function refreshAsanaToken(integration: any) {
    try {
        if (!integration.refreshToken) {
            throw new Error('Missing refresh token');
        }

        const response = await fetch('https://app.asana.com/-/oauth_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                client_id: process.env.ASANA_CLIENT_ID!,
                client_secret: process.env.ASANA_CLIENT_SECRET!,
                refresh_token: integration.refreshToken,
            }),
        })

        const data = await response.json()
        if (response.ok) {
            // Appwrite document IDs usually come from $id
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
            console.error('failed to refresh asana token:', data)
            throw new Error('token refresh failed')
        }
    } catch (error) {
        console.error('error refreshing asana token', error)
        throw error
    }
}
