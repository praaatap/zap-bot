"use client";

import { useState } from "react";
import { MessageCircle, Book, Video, Mail, Search, ChevronRight, ExternalLink } from "lucide-react";

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const supportChannels = [
        {
            icon: MessageCircle,
            title: "Live Chat",
            description: "Chat with our support team in real-time",
            action: "Start Chat",
            available: true,
        },
        {
            icon: Mail,
            title: "Email Support",
            description: "Get help via email within 24 hours",
            action: "Send Email",
            link: "mailto:support@zapbot.ai",
        },
        {
            icon: Book,
            title: "Documentation",
            description: "Browse our comprehensive guides",
            action: "View Docs",
            link: "/docs",
        },
        {
            icon: Video,
            title: "Video Tutorials",
            description: "Watch step-by-step video guides",
            action: "Watch Videos",
            link: "/docs/videos",
        },
    ];

    const faqs = [
        {
            category: "Getting Started",
            questions: [
                {
                    q: "How do I connect Google Calendar?",
                    a: "Go to Calendar page and click 'Connect Google Calendar'. Follow the OAuth flow to authorize access.",
                },
                {
                    q: "How do I join my first meeting?",
                    a: "On the dashboard, paste your meeting URL in the Quick Join panel and click 'Deploy Bot'.",
                },
                {
                    q: "What meeting platforms are supported?",
                    a: "We support Google Meet, Zoom, Microsoft Teams, and most other video conferencing platforms.",
                },
            ],
        },
        {
            category: "Features",
            questions: [
                {
                    q: "How does automatic transcription work?",
                    a: "Our bot joins your meeting, records audio, and uses AI to generate accurate transcripts in real-time.",
                },
                {
                    q: "Can I get meeting summaries automatically?",
                    a: "Yes! Enable AI summaries in Settings to receive intelligent summaries after each meeting.",
                },
                {
                    q: "Where are recordings stored?",
                    a: "All recordings are securely stored in AWS S3 with encryption at rest and in transit.",
                },
            ],
        },
        {
            category: "Integrations",
            questions: [
                {
                    q: "How do I integrate with Slack?",
                    a: "Go to Settings > Integrations and click 'Connect Slack' to authorize the integration.",
                },
                {
                    q: "Can I export transcripts to other tools?",
                    a: "Yes, we support exports to Notion, Linear, Asana, and other project management tools.",
                },
            ],
        },
        {
            category: "Billing & Plans",
            questions: [
                {
                    q: "What's included in the free plan?",
                    a: "Free plan includes 5 meetings per month, basic transcription, and 2GB storage.",
                },
                {
                    q: "How do I upgrade my plan?",
                    a: "Go to Settings > Billing and choose the plan that fits your needs.",
                },
            ],
        },
    ];

    const filteredFaqs = faqs.map((category) => ({
        ...category,
        questions: category.questions.filter(
            (q) =>
                searchQuery === "" ||
                q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                q.a.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    }));

    return (
        <div className="p-8 min-h-screen bg-slate-50">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-slate-900 mb-3">How can we help?</h1>
                    <p className="text-lg text-slate-600 mb-6">Search our knowledge base or contact support</p>

                    {/* Search */}
                    <div className="max-w-2xl mx-auto relative">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search for answers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-lg"
                        />
                    </div>
                </div>

                {/* Support Channels */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {supportChannels.map((channel) => (
                        <div
                            key={channel.title}
                            className="bg-white rounded-lg border border-slate-200 p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                                <channel.icon size={24} className="text-blue-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">{channel.title}</h3>
                            <p className="text-sm text-slate-600 mb-4">{channel.description}</p>
                            <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 group-hover:gap-2 transition-all">
                                {channel.action}
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* FAQs */}
                <div className="bg-white rounded-lg border border-slate-200 p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>

                    <div className="space-y-8">
                        {filteredFaqs.map((category) =>
                            category.questions.length > 0 ? (
                                <div key={category.category}>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                        {category.category}
                                    </h3>
                                    <div className="space-y-4">
                                        {category.questions.map((item, idx) => (
                                            <details
                                                key={idx}
                                                className="group border-l-2 border-slate-200 pl-4 hover:border-blue-600 transition-colors"
                                            >
                                                <summary className="cursor-pointer font-medium text-slate-900 hover:text-blue-600 transition-colors list-none flex items-center justify-between py-2">
                                                    {item.q}
                                                    <ChevronRight
                                                        size={18}
                                                        className="text-slate-400 group-open:rotate-90 transition-transform"
                                                    />
                                                </summary>
                                                <p className="text-sm text-slate-600 mt-2 pb-3 leading-relaxed">{item.a}</p>
                                            </details>
                                        ))}
                                    </div>
                                </div>
                            ) : null
                        )}
                    </div>
                </div>

                {/* Contact Card */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white text-center">
                    <h2 className="text-2xl font-bold mb-2">Still need help?</h2>
                    <p className="text-blue-100 mb-6">Our support team is available 24/7 to assist you</p>
                    <div className="flex items-center justify-center gap-4">
                        <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-md">
                            Contact Support
                        </button>
                        <button className="px-6 py-3 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900 transition-colors">
                            Schedule a Call
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
