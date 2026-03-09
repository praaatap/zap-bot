import { store } from "../../store.js";
import { UserIntegration } from "@repo/shared";

export async function refreshAsanaToken(integration: UserIntegration) {
    try {
        const response = await fetch('https://app.asana.com/-/oauth_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                client_id: process.env.ASANA_CLIENT_ID!,
                client_secret: process.env.ASANA_CLIENT_SECRET!,
                refresh_token: integration.refreshToken!,
            }),
        });

        const data = await response.json();
        if (response.ok) {
            const user = store.getUser(integration.userId);
            if (!user) throw new Error("User not found");

            const updatedIntegrations = user.integrations.map(i =>
                i.id === integration.id
                    ? { ...i, accessToken: data.access_token, refreshToken: data.refresh_token || i.refreshToken, expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString() }
                    : i
            );

            store.upsertUser({
                ...user,
                integrations: updatedIntegrations
            });

            return updatedIntegrations.find(i => i.id === integration.id);
        } else {
            console.error('failed to refresh asana token:', data);
            throw new Error('token refresh failed');
        }
    } catch (error) {
        console.error('error refreshing asana token', error);
        throw error;
    }
}
