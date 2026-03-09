import { Metadata } from 'next'
import Link from 'next/link'
import {
    Search, Book, MessageSquare, Shield, HelpCircle, ArrowRight,
    Zap, Globe, Code, LifeBuoy, ChevronDown, Mail, ExternalLink
} from 'lucide-react'

export const metadata: Metadata = {
    title: 'Help Center | Zap Bot',
    description: 'Find answers to common questions and get support for Zap Bot',
}

export default function HelpPage() {
    const faqs = [
        {
            question: "How do I connect my calendar to Zap Bot?",
            answer: "Go to your Settings page and click 'Connect Calendar'. Choose Google Calendar and follow the authorization prompts. Once connected, Zap Bot will automatically detect your upcoming meetings."
        },
        {
            question: "Can Zap Bot join meetings automatically?",
            answer: "Yes! Once your calendar is connected, Zap Bot can automatically join meetings based on your calendar events. You can also manually deploy a bot by pasting a meeting URL on the Dashboard."
        },
        {
            question: "How accurate are the AI transcripts?",
            answer: "Our AI transcription engine provides industry-leading accuracy, typically 95%+ for clear audio. Accuracy may vary based on audio quality, accents, and background noise."
        },
        {
            question: "What integrations does Zap Bot support?",
            answer: "Zap Bot integrates with Google Meet, Zoom, Microsoft Teams, Webex, Slack, Jira, Trello, and Asana. More integrations are being added regularly."
        },
        {
            question: "Is my meeting data secure?",
            answer: "Absolutely. We use enterprise-grade encryption for all data at rest and in transit. Your meeting recordings and transcripts are stored securely and are only accessible to authorized users."
        },
        {
            question: "How do I deploy a bot to a meeting?",
            answer: "From your Dashboard, paste a meeting URL into the 'Deploy a bot instantly' section and click 'Join Meeting'. The bot will join, record, and transcribe the meeting automatically."
        }
    ]

    const categories = [
        { title: "Getting Started", icon: Zap, count: 12, desc: "Setup, onboarding, and first steps" },
        { title: "Account & Security", icon: Shield, count: 8, desc: "Billing, permissions, and data safety" },
        { title: "Integrations", icon: Globe, count: 15, desc: "Calendar, Slack, Jira, and more" },
        { title: "API & Developers", icon: Code, count: 20, desc: "Webhooks, REST API, and SDKs" },
    ]

    return (
        <div className="min-h-screen bg-transparent text-slate-900 relative overflow-x-hidden">
            {/* Subtle Grid Background */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.25]">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
            </div>

            <div className="relative z-10 max-w-[1100px] mx-auto px-6 pt-20 pb-24">

                {/* Header */}
                <div className="text-center mb-16 space-y-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 shadow-sm text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mb-4">
                        <LifeBuoy size={12} className="text-blue-600" />
                        Help Center
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
                        How can we help?
                    </h1>
                    <p className="text-lg text-slate-500 max-w-xl mx-auto font-medium leading-relaxed">
                        Search our knowledge base or browse popular topics below.
                    </p>
                </div>

                {/* Search */}
                <div className="max-w-2xl mx-auto mb-20 relative z-20">
                    <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-3 border-r border-slate-200">
                            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search for questions, features, or keywords..."
                            className="w-full pl-16 pr-6 py-5 bg-white shadow-sm border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 text-sm font-bold"
                        />
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
                    {categories.map((cat, i) => (
                        <div key={i} className="group p-6 rounded-2xl bg-white shadow-sm border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer">
                            <div className="w-12 h-12 mb-5 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                                <cat.icon size={22} />
                            </div>
                            <h3 className="font-bold text-sm text-slate-900 mb-1">{cat.title}</h3>
                            <p className="text-xs text-slate-500 font-medium mb-3">{cat.desc}</p>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cat.count} Articles</span>
                        </div>
                    ))}
                </div>

                {/* FAQ Section */}
                <section className="mb-20">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h2>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{faqs.length} Questions</span>
                    </div>
                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <details key={i} className="group outline-none">
                                <summary className="flex items-center justify-between p-5 bg-white border border-slate-200 shadow-sm rounded-xl cursor-pointer hover:border-slate-300 transition-all list-none outline-none group-open:rounded-b-none group-open:border-b-transparent">
                                    <h3 className="text-sm font-bold text-slate-700 group-hover:text-slate-900 pr-4 transition-colors">
                                        {faq.question}
                                    </h3>
                                    <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 group-open:rotate-180 transition-transform shrink-0">
                                        <ChevronDown size={14} />
                                    </div>
                                </summary>
                                <div className="px-5 py-5 text-sm text-slate-600 leading-relaxed bg-slate-50 border border-t-0 border-slate-200 rounded-b-xl font-medium">
                                    {faq.answer}
                                </div>
                            </details>
                        ))}
                    </div>
                </section>

                {/* Contact Support */}
                <div className="p-10 lg:p-14 rounded-2xl bg-white shadow-sm border border-slate-200 text-center relative overflow-hidden">
                    <div className="relative z-10 space-y-6">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                            <LifeBuoy size={28} />
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900">Still need help?</h2>
                        <p className="text-sm text-slate-500 max-w-md mx-auto font-medium leading-relaxed">
                            Our support team is standing by to help you with any questions or technical issues.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                            <a
                                href="mailto:support@zapbot.ai"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95"
                            >
                                <Mail size={16} />
                                Contact Support
                            </a>
                            <a
                                href="https://docs.zapbot.ai"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 shadow-sm rounded-xl font-bold text-sm transition-all"
                            >
                                <ExternalLink size={16} />
                                View Documentation
                            </a>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
