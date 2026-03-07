import { Metadata } from 'next'
import Link from 'next/link'
import { Search, Book, MessageSquare, Shield, HelpCircle, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Help Center | Zap Bot',
    description: 'Find answers to common questions and get support for Zap Bot',
}

export default function HelpPage() {
    const faqs = [
        {
            question: "How do I connect my calendar to Zap Bot?",
            answer: "Go to your settings page and click on 'Connect Calendar'. Choose Google Calendar and follow the authorization prompts. Once connected, Zap Bot will automatically detect your upcoming meetings."
        },
        {
            question: "Can Zap Bot join meetings automatically?",
            answer: "Yes! Once your calendar is connected and you've set up your meeting preferences, Zap Bot can automatically join meetings based on your calendar events and bot settings."
        },
        {
            question: "How accurate are the AI transcripts?",
            answer: "Our AI transcription engine provides industry-leading accuracy, typically 95%+ for clear audio. Accuracy may vary based on audio quality, accents, and background noise."
        },
        {
            question: "What integrations does Zap Bot support?",
            answer: "Zap Bot integrates with Google Calendar, Slack, Jira, Trello, and Asana. More integrations are being added regularly based on user feedback."
        },
        {
            question: "Is my meeting data secure?",
            answer: "Absolutely. We use enterprise-grade encryption for all data at rest and in transit. Your meeting recordings and transcripts are stored securely and are only accessible to authorized users in your organization."
        }
    ]

    const categories = [
        { title: "Getting Started", icon: <HelpCircle className="w-6 h-6" />, count: 12 },
        { title: "Account & Billing", icon: <Shield className="w-6 h-6" />, count: 8 },
        { title: "Integrations", icon: <MessageSquare className="w-6 h-6" />, count: 15 },
        { title: "API & Webhooks", icon: <Book className="w-6 h-6" />, count: 20 },
    ]

    return (
        <div className="min-h-screen bg-[#050510] text-gray-100 pt-32 pb-20 overflow-x-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-5xl md:text-7xl font-black mb-6 bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            How can we help?
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Search our knowledge base or browse our popular guides below.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto mb-20">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-linear-to-r from-cyan-500 to-purple-600 rounded-2xl blur-sm opacity-25 group-focus-within:opacity-50 transition-opacity" />
                            <div className="relative flex items-center bg-black/80 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
                                <Search className="w-6 h-6 ml-6 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search for questions, features, or keywords..."
                                    className="w-full px-6 py-5 bg-transparent text-white focus:outline-none text-lg"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
                        {categories.map((cat, i) => (
                            <div key={i} className="group p-8 rounded-3xl bg-white/2 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer text-center">
                                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                                    {cat.icon}
                                </div>
                                <h3 className="font-bold text-lg mb-2">{cat.title}</h3>
                                <p className="text-sm text-gray-500 font-medium">{cat.count} Articles</p>
                            </div>
                        ))}
                    </div>

                    {/* FAQ */}
                    <section className="mb-24">
                        <h2 className="text-3xl font-bold mb-10 text-center">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {faqs.map((faq, i) => (
                                <details key={i} className="group outline-none">
                                    <summary className="flex items-center justify-between p-8 bg-white/2 border border-white/5 rounded-3xl cursor-pointer hover:bg-white/5 transition-all list-none outline-none">
                                        <h3 className="text-xl font-bold text-gray-200 pr-4">
                                            {faq.question}
                                        </h3>
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-open:rotate-180 transition-transform">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </summary>
                                    <div className="px-8 py-6 text-lg text-gray-400 leading-relaxed bg-white/2 border-x border-b border-white/5 rounded-b-3xl -mt-4 pt-10">
                                        {faq.answer}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </section>

                    {/* Support Card */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-linear-to-r from-cyan-500 to-purple-600 rounded-4xl blur opacity-25" />
                        <div className="relative p-12 lg:p-16 rounded-4xl bg-black border border-white/10 text-center overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                            <h2 className="text-4xl font-black mb-6 text-white leading-tight">Can't find what you're looking for?</h2>
                            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto font-medium">
                                Our support team is standing by to help you with any questions or technical issues you might have.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                                <Link
                                    href="/contact"
                                    className="group inline-flex items-center px-10 py-5 bg-cyan-500 hover:bg-cyan-400 text-black rounded-2xl font-bold transition-all shadow-2xl"
                                >
                                    Get In Touch
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <a
                                    href="mailto:support@zapbot.ai"
                                    className="inline-flex items-center px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all backdrop-blur-md"
                                >
                                    Email Support
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
