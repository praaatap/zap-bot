'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useUser } from '@clerk/nextjs'
import { Check, Loader2, Zap, Star, Shield, ArrowRight } from 'lucide-react'
import React, { useState } from 'react'
import Link from 'next/link'

const plans = [
    {
        id: 'starter',
        name: 'Starter',
        price: 9,
        priceId: 'price_starter_id',
        description: 'Perfect for individuals and small projects.',
        features: [
            '10 meetings per month',
            '30 AI chat messages per day',
            'Meeting transcripts and summaries',
            'Action items extraction',
            'Email Notifications'
        ],
        popular: false,
        color: 'cyan'
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 29,
        priceId: 'price_pro_id',
        description: 'Ideal for power users and growing teams.',
        features: [
            '30 meetings per month',
            '100 AI chat messages per day',
            'Meeting transcripts and summaries',
            'Action items extraction',
            'Email Notifications',
            'Priority Support'
        ],
        popular: true,
        color: 'purple'
    },
    {
        id: 'premium',
        name: 'Premium',
        price: 99,
        priceId: 'price_premium_id',
        description: 'Unlimited power for high-frequency users.',
        features: [
            'Unlimited meetings per month',
            'Unlimited AI chat messages per day',
            'Meeting transcripts and summaries',
            'Action items extraction',
            'Email Notifications',
            'Priority Support'
        ],
        popular: false,
        color: 'blue'
    },
]

export default function PricingPage() {
    const { user } = useUser()
    const [loading, setLoading] = useState<string | null>(null)

    const handleSubscribe = async (priceId: string, planName: string) => {
        if (!user) {
            window.location.href = '/sign-in'
            return
        }

        setLoading(priceId)

        try {
            const response = await fetch('/api/stripe/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId, planName })
            })

            const data = await response.json()
            if (data.url) {
                window.location.href = data.url
            } else {
                throw new Error(data.error || 'Failed to create checkout session')
            }
        } catch (error) {
            console.error('subscription creation error:', error)
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="min-h-screen bg-[#050510] text-white pt-32 pb-20 overflow-x-hidden font-inter">
            {/* Background Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-20 animate-in">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-sm font-bold mb-6 backdrop-blur-md">
                            <Zap className="w-4 h-4 mr-2" />
                            Launch Discount: 20% Off Yearly
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black mb-6 bg-linear-to-r from-white via-white to-gray-500 bg-clip-text text-transparent leading-tight">
                            Simple, Transparent <br />
                            <span className="italic font-serif text-cyan-400">Pricing for Everyone</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
                            Unlock the full potential of AI-powered meetings. Choose the plan that fits your growth and start saving hours every day.
                        </p>
                    </div>

                    {/* Pricing Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch mb-24">
                        {plans.map((plan) => {
                            const isLoading = loading === plan.priceId
                            const isPurple = plan.color === 'purple'
                            const isCyan = plan.color === 'cyan'

                            return (
                                <div
                                    key={plan.id}
                                    className={`relative flex flex-col p-10 rounded-[2.5rem] transition-all duration-500 hover:scale-[1.02] group ${plan.popular
                                            ? 'bg-white/5 border-white/20 shadow-[0_0_50px_rgba(139,92,246,0.1)]'
                                            : 'bg-white/2 border-white/5 hover:bg-white/4 hover:border-white/10'
                                        } border backdrop-blur-xl`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-linear-to-r from-purple-600 to-cyan-500 rounded-full text-white text-sm font-black shadow-xl uppercase tracking-widest flex items-center gap-2">
                                            <Star className="w-4 h-4 fill-white" />
                                            Most Popular
                                        </div>
                                    )}

                                    <div className="mb-8">
                                        <h3 className={`text-2xl font-black mb-2 ${isPurple ? 'text-purple-400' : isCyan ? 'text-cyan-400' : 'text-blue-400'}`}>
                                            {plan.name}
                                        </h3>
                                        <div className="flex items-baseline gap-1 mt-6">
                                            <span className="text-6xl font-black">${plan.price}</span>
                                            <span className="text-xl text-gray-500 font-bold">/mo</span>
                                        </div>
                                        <p className="text-gray-400 mt-6 font-medium leading-relaxed">
                                            {plan.description}
                                        </p>
                                    </div>

                                    <div className="flex-1 space-y-5 mb-10">
                                        <p className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">What&apos;s included</p>
                                        <ul className="space-y-4">
                                            {plan.features.map((feature, index) => (
                                                <li key={index} className="flex gap-4 items-start">
                                                    <div className={`mt-1 p-1 rounded-full ${isPurple ? 'bg-purple-500/20 text-purple-400' : isCyan ? 'bg-cyan-500/20 text-cyan-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                        <Check className="h-4 w-4" />
                                                    </div>
                                                    <span className="text-gray-300 font-medium">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <button
                                        className={`group relative w-full py-5 rounded-2xl font-black text-lg transition-all overflow-hidden ${plan.popular
                                                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-2xl shadow-purple-600/20'
                                                : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                                            }`}
                                        onClick={() => handleSubscribe(plan.priceId, plan.name)}
                                        disabled={isLoading}
                                    >
                                        <div className="relative z-10 flex items-center justify-center gap-2">
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    {plan.popular ? 'Start Your Pro Trial' : `Join ${plan.name}`}
                                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </div>
                                    </button>
                                </div>
                            )
                        })}
                    </div>

                    {/* Trust Banner */}
                    <div className="text-center">
                        <p className="text-gray-500 font-bold mb-10 uppercase tracking-[0.3em] text-sm italic">Trusted by experts at</p>
                        <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale brightness-200">
                            {/* Placeholder icons - ideally use SVGs for brands */}
                            <div className="text-2xl font-black font-serif">GOOGLE</div>
                            <div className="text-2xl font-black font-serif">SLACK</div>
                            <div className="text-2xl font-black font-serif">NOTION</div>
                            <div className="text-2xl font-black font-serif">LINEAR</div>
                            <div className="text-2xl font-black font-serif">TESLA</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
