import { databases, ID, Query } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { NextRequest, NextResponse } from "next/server";
import { WebClient } from '@slack/web-api'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        const state = searchParams.get('state')

        const host = request.headers.get('host')
        const protocol = host?.includes('localhost') ? 'http' : 'https'
        const baseUrl = `${protocol}://${host}`

        if (error) {
            console.error('Slack OAuth error:', error)
            return NextResponse.redirect(`${baseUrl}/?slack=error`)
        }

        if (!code) {
            return NextResponse.json({ error: 'no authorization code' }, { status: 400 })
        }

        const redirectUri = `${baseUrl}/api/slack/oauth`

        const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: process.env.SLACK_CLIENT_ID!,
                client_secret: process.env.SLACK_CLIENT_SECRET!,
                code: code,
                redirect_uri: redirectUri
            })
        })

        const tokenData = await tokenResponse.json()

        if (!tokenData.ok) {
            console.error('failed to exchange Slack oauth code:', tokenData.error)
            return NextResponse.redirect(`${baseUrl}/?slack=error`)
        }

        // Save installation using list then create/update (no direct upsert in Appwrite)
        const existingInstallations = await databases.listDocuments(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.slackInstallationsCollectionId,
            [Query.equal("teamId", tokenData.team.id), Query.limit(1)]
        );

        const installationData = {
            teamId: tokenData.team.id,
            teamName: tokenData.team.name,
            botToken: tokenData.access_token,
            installedBy: tokenData.authed_user.id,
            active: true
        };

        if (existingInstallations.total > 0) {
            await databases.updateDocument(
                APPWRITE_IDS.databaseId,
                APPWRITE_IDS.slackInstallationsCollectionId,
                existingInstallations.documents[0].$id,
                installationData
            );
        } else {
            await databases.createDocument(
                APPWRITE_IDS.databaseId,
                APPWRITE_IDS.slackInstallationsCollectionId,
                ID.unique(),
                installationData
            );
        }

        try {
            const slack = new WebClient(tokenData.access_token)
            const userInfo = await slack.users.info({ user: tokenData.authed_user.id })

            if (userInfo.user?.profile?.email) {
                const affectedUsers = await databases.listDocuments(
                    APPWRITE_IDS.databaseId,
                    APPWRITE_IDS.usersCollectionId,
                    [Query.equal("email", userInfo.user.profile.email)]
                );
                
                for (const userDoc of affectedUsers.documents) {
                    await databases.updateDocument(
                        APPWRITE_IDS.databaseId,
                        APPWRITE_IDS.usersCollectionId,
                        userDoc.$id,
                        {
                            slackUserId: tokenData.authed_user.id,
                            slackTeamId: tokenData.team.id,
                            slackConnected: true
                        }
                    );
                }
            }
        } catch (error) {
            console.error('failed to link user during Slack oauth:', error)
        }

        return NextResponse.redirect(`${baseUrl}/dashboard?slack=installed`)
    } catch (error) {
        console.error('Slack oauth error', error)
        return NextResponse.json({ error: 'internal error' }, { status: 500 })
    }
}
