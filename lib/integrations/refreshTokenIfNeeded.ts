import { refreshAsanaToken } from "./asana/refreshToken";
import { refreshJiraToken } from "./jira/refreshToken";

/**
 * Checks if an integration token needs refreshing and refreshes it if so.
 * Currently supports Jira and Asana.
 */
export async function refreshTokenIfNeeded(integration: any) {
    const now = new Date()
    const expiresAtStr = integration.expiresAt
    
    // If expiresAt is missing or will expire in less than 5 minutes
    const expiresAt = expiresAtStr ? new Date(expiresAtStr) : null;

    if (!expiresAt || now >= new Date(expiresAt.getTime() - 5 * 60 * 1000)) {
        switch (integration.platform) {
            case 'jira':
                return await refreshJiraToken(integration)
            case 'asana':
                return await refreshAsanaToken(integration)
            default:
                return integration
        }
    }

    return integration;
}
