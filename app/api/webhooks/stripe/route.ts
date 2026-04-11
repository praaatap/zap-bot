import { databases, Query } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

let stripeClient: Stripe | null = null

function getStripeClient() {
    if (stripeClient) {
        return stripeClient
    }

    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
        throw new Error('Missing STRIPE_SECRET_KEY')
    }

    stripeClient = new Stripe(secretKey, {
        apiVersion: '2025-01-27.acacia' as any
    })

    return stripeClient
}

export async function POST(request: NextRequest) {
    try {
        const stripe = getStripeClient()
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
        if (!webhookSecret) {
            throw new Error('Missing STRIPE_WEBHOOK_SECRET')
        }

        const body = await request.text()
        const headersList = await headers()
        const sig = headersList.get('stripe-signature')!

        let event: Stripe.Event

        try {
            event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
        } catch (error) {
            console.error('webhook signature failed:', error)
            return NextResponse.json({ error: 'invalid signature' }, { status: 400 })
        }

        switch (event.type) {
            case 'customer.subscription.created':
                await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
                break
            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
                break
            case 'customer.subscription.deleted':
                await handleSubscriptionCancelled(event.data.object as Stripe.Subscription)
                break
            case 'invoice.payment_succeeded':
                await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
                break

            default:
                console.log(`unhandled event type: ${event.type}`)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('error handling stripe webhook:', error)
        return NextResponse.json({ error: 'webhook failed' }, { status: 500 })
    }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
    try {
        const customerId = subscription.customer as string
        const planName = getPlanFromSubscription(subscription)

        const result = await databases.listDocuments(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.usersCollectionId,
            [Query.equal("stripeCustomerId", customerId), Query.limit(1)]
        );

        if (result.total > 0) {
            const user = result.documents[0];
            await databases.updateDocument(
                APPWRITE_IDS.databaseId,
                APPWRITE_IDS.usersCollectionId,
                user.$id,
                {
                    currentPlan: planName,
                    subscriptionStatus: 'active',
                    stripeSubscriptionId: subscription.id,
                    billingPeriodStart: new Date().toISOString(),
                    meetingsThisMonth: 0,
                    chatMessagesToday: 0
                }
            )
        }
    } catch (error) {
        console.error('error handling subscription create:', error)
    }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    try {
        const result = await databases.listDocuments(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.usersCollectionId,
            [Query.equal("stripeSubscriptionId", subscription.id), Query.limit(1)]
        );

        if (result.total > 0) {
            const user = result.documents[0];
            const planName = getPlanFromSubscription(subscription)

            await databases.updateDocument(
                APPWRITE_IDS.databaseId,
                APPWRITE_IDS.usersCollectionId,
                user.$id,
                {
                    currentPlan: planName,
                    subscriptionStatus: subscription.status === 'active' ? 'active' : 'cancelled'
                }
            )
        }
    } catch (error) {
        console.error('error handling subscription updated:', error)
    }
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
    try {
        const result = await databases.listDocuments(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.usersCollectionId,
            [Query.equal("stripeSubscriptionId", subscription.id), Query.limit(1)]
        );

        if (result.total > 0) {
            const user = result.documents[0];
            await databases.updateDocument(
                APPWRITE_IDS.databaseId,
                APPWRITE_IDS.usersCollectionId,
                user.$id,
                {
                    subscriptionStatus: 'cancelled'
                }
            )
        }
    } catch (error) {
        console.error('error handling subscription cancellation:', error)
    }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
    try {
        const subscriptionId = (invoice as any).subscription as string | null

        if (subscriptionId) {
            const result = await databases.listDocuments(
                APPWRITE_IDS.databaseId,
                APPWRITE_IDS.usersCollectionId,
                [Query.equal("stripeSubscriptionId", subscriptionId), Query.limit(1)]
            );

            if (result.total > 0) {
                const user = result.documents[0];
                await databases.updateDocument(
                    APPWRITE_IDS.databaseId,
                    APPWRITE_IDS.usersCollectionId,
                    user.$id,
                    {
                        subscriptionStatus: 'active',
                        billingPeriodStart: new Date().toISOString(),
                        meetingsThisMonth: 0
                    }
                )
            }
        }
    } catch (error) {
        console.error('error handling payment success:', error)
    }
}

function getPlanFromSubscription(subscription: Stripe.Subscription) {
    const priceId = subscription.items.data[0]?.price.id

    // Map these to your real price IDs in .env or a config file
    const priceToPlan: Record<string, string> = {
        [process.env.STRIPE_STARTER_PRICE_ID!]: 'starter',
        [process.env.STRIPE_PRO_PRICE_ID!]: 'pro',
        [process.env.STRIPE_PREMIUM_PRICE_ID!]: 'premium'
    }

    if (!priceId) return 'free'
    return priceToPlan[priceId] || 'free'
}
