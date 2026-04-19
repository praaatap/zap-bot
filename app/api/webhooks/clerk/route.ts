import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { databases, Query, ID } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { resolveAgentBotName } from "@/lib/bot-name";

export async function POST(req: Request) {
    const headerPayload = await headers()
    const svix_id = headerPayload.get('svix-id')
    const svix_timestamp = headerPayload.get('svix-timestamp')
    const svix_signature = headerPayload.get('svix-signature')

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error occured -- no svix headers', {
            status: 400
        })
    }

    const payload = await req.text()
    const body = JSON.parse(payload)
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '')

    let evt: WebhookEvent

    try {
        evt = wh.verify(payload, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent
    } catch (err) {
        console.error('Error verifying webhook:', err)
        return new Response('Error occured', {
            status: 400
        })
    }

    const eventType = evt.type

    if (eventType === 'user.created' || eventType === 'user.updated') {
        const { id: clerkId, email_addresses, first_name, last_name } = evt.data as any
        const primaryEmail = email_addresses?.find((email: any) => email.id === (evt.data as any).primary_email_address_id)
        const email = primaryEmail?.email_address || email_addresses?.[0]?.email_address

        try {
            const existingResult = await databases.listDocuments(
                APPWRITE_IDS.databaseId,
                APPWRITE_IDS.usersCollectionId,
                [Query.equal("clerkId", clerkId), Query.limit(1)]
            );

            const userData = {
                clerkId,
                email: email || '',
                name: `${first_name || ''} ${last_name || ''}`.trim() || 'User',
                botName: resolveAgentBotName({
                    name: `${first_name || ''} ${last_name || ''}`.trim() || "User",
                    email: email || "",
                    clerkId,
                }),
            }

            if (existingResult.total > 0) {
                await databases.updateDocument(
                    APPWRITE_IDS.databaseId,
                    APPWRITE_IDS.usersCollectionId,
                    existingResult.documents[0].$id,
                    userData
                )
            } else {
                await databases.createDocument(
                    APPWRITE_IDS.databaseId,
                    APPWRITE_IDS.usersCollectionId,
                    ID.unique(),
                    {
                        ...userData,
                        subscriptionStatus: 'inactive',
                        currentPlan: 'free',
                        meetingsThisMonth: 0,
                        chatMessagesToday: 0,
                        googleAccessToken: null,
                        googleRefreshToken: null,
                        googleTokenExpiry: null,
                    }
                )
            }
        } catch (error) {
            console.error('Error handling user webhook:', error)
            return new Response('Error processing webhook', { status: 500 })
        }
    }

    if (eventType === 'user.deleted') {
        const { id: clerkId } = evt.data as any
        try {
            const existingResult = await databases.listDocuments(
                APPWRITE_IDS.databaseId,
                APPWRITE_IDS.usersCollectionId,
                [Query.equal("clerkId", clerkId), Query.limit(1)]
            );
            
            if (existingResult.total > 0) {
                await databases.deleteDocument(
                    APPWRITE_IDS.databaseId,
                    APPWRITE_IDS.usersCollectionId,
                    existingResult.documents[0].$id
                )
            }
        } catch (error) {
            console.error('Error deleting user:', error)
        }
    }

    return new Response('', { status: 200 })
}
