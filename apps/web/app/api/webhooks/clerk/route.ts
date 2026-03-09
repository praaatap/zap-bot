import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

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

    const { id } = evt.data
    const eventType = evt.type

    if (eventType === 'user.created' || eventType === 'user.updated') {
        const { id: clerkId, email_addresses, first_name, last_name, image_url } = evt.data
        const primaryEmail = email_addresses?.find(email => email.id === (evt.data as any).primary_email_address_id)
        const email = primaryEmail?.email_address || email_addresses?.[0]?.email_address

        try {
            const existingUser = await prisma.user.findUnique({
                where: { clerkId }
            })

            const userData = {
                clerkId,
                email: email || '',
                name: `${first_name || ''} ${last_name || ''}`.trim() || 'User',
            }

            if (existingUser) {
                await prisma.user.update({
                    where: { clerkId },
                    data: userData
                })
            } else {
                await prisma.user.create({
                    data: {
                        ...userData,
                        subscriptionStatus: 'inactive',
                        currentPlan: 'free',
                        botName: 'Zap Bot'
                    }
                })
            }
        } catch (error) {
            console.error('Error handling user webhook:', error)
            return new Response('Error processing webhook', { status: 500 })
        }
    }

    if (eventType === 'user.deleted') {
        const { id: clerkId } = evt.data
        try {
            await prisma.user.delete({
                where: { clerkId }
            })
        } catch (error) {
            console.error('Error deleting user:', error)
        }
    }

    return new Response('', { status: 200 })
}
