import { databases, ID, Query } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

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
        apiVersion: '2025-01-27.acacia' as any // Use the latest supported or valid version
    })

    return stripeClient
}

export async function POST(request: NextRequest) {
    try {
        const stripe = getStripeClient()
        const { userId } = await auth()
        const user = await currentUser()

        if (!userId || !user) {
            return NextResponse.json({ error: 'not authenticated' }, { status: 401 })
        }

        const { priceId, planName } = await request.json()

        if (!priceId) {
            return NextResponse.json({ error: 'price Id is required' }, { status: 400 })
        }

        const userResults = await databases.listDocuments(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.usersCollectionId,
            [Query.equal("clerkId", userId), Query.limit(1)]
        );

        let dbUser = userResults.total > 0 ? userResults.documents[0] : null;

        if (!dbUser) {
            dbUser = await databases.createDocument(
                APPWRITE_IDS.databaseId,
                APPWRITE_IDS.usersCollectionId,
                ID.unique(),
                {
                    clerkId: userId,
                    email: user.primaryEmailAddress?.emailAddress,
                    name: user.fullName,
                    botName: "Zap Bot",
                    currentPlan: "free",
                    subscriptionStatus: "inactive"
                }
            );
        }

        let stripeCustomerId = dbUser?.stripeCustomerId

        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.primaryEmailAddress?.emailAddress!,
                name: user.fullName || undefined,
                metadata: {
                    clerkUserId: userId,
                    dbUserId: dbUser.$id
                }
            })

            stripeCustomerId = customer.id

            await databases.updateDocument(
                APPWRITE_IDS.databaseId,
                APPWRITE_IDS.usersCollectionId,
                dbUser.$id,
                {
                    stripeCustomerId
                }
            )
        }

        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1
                }
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
            metadata: {
                clerkUserId: userId,
                dbUserId: dbUser.$id,
                planName
            },
            subscription_data: {
                metadata: {
                    clerkUserId: userId,
                    dbUserId: dbUser.$id,
                    planName
                }
            }
        })
        return NextResponse.json({ url: session.url })
    } catch (error) {
        console.error('stripe checkout error:', error)
        return NextResponse.json({ error: 'failed to create checkout session' }, { status: 500 })
    }
}
