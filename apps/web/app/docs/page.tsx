import { Metadata } from 'next'
import Link from 'next/link'
import { Book, Code, Zap, Shield, Layout, ArrowRight, Search, FileText } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Documentation | Zap Bot',
    description: 'Comprehensive guides and API documentation for Zap Bot',
}

export default function DocsPage() {
    const sections = [
        {
            title: "Getting Started",
            icon: <Zap className="w-6 h-6 text-cyan-400" />,
            description: "New to Zap Bot? Start here to set up your account and record your first meeting.",
            guides: [
                { title: "Quick Start Guide", href: "#" },
                { title: "Setting Up Your Account", href: "#" },
                { title: "First Meeting Recording", href: "#" }
            ]
        },
        {
            title: "Integrations",
            icon: <Layout className="w-6 h-6 text-purple-400" />,
            description: "Connect Zap Bot to your existing workflow with our native integrations.",
            guides: [
                { title: "Google Calendar", href: "#" },
                { title: "Slack & Discord", href: "#" },
                { title: "Jira & Linear", href: "#" },
                { title: "Asana & Trello", href: "#" }
            ]
        },
        {
            title: "Core Features",
            icon: <FileText className="w-6 h-6 text-blue-400" />,
            description: "Master the advanced capabilities of our AI transcription and summarization engine.",
            guides: [
                { title: "AI Transcription", href: "#" },
                { title: "Smart Summaries", href: "#" },
                { title: "Action Item Extraction", href: "#" },
                { title: "Meeting Analytics", href: "#" }
            ]
        },
        {
            title: "API Reference",
            icon: <Code className="w-6 h-6 text-emerald-400" />,
            description: "Build custom workflows and integrate Zap Bot directly into your applications.",
            guides: [
                { title: "REST API Overview", href: "#" },
                { title: "Authentication", href: "#" },
                { title: "Webhooks Guide", href: "#" },
                { title: "Rate Limits", href: "#" }
            ]
        }
    ]

    return (
        <div className="min-h-screen bg-[#050510] text-gray-100 pt-32 pb-20">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
                        <div>
                            <h1 className="text-5xl md:text-6xl font-black mb-4 bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                Documentation
                            </h1>
                            <p className="text-xl text-gray-400 max-w-xl font-medium">
                                Everything you need to build, integrate, and excel with Zap Bot.
                            </p>
                        </div>
                        <div className="w-full md:w-96">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-linear-to-r from-cyan-500 to-purple-600 rounded-2xl blur-sm opacity-25 group-focus-within:opacity-50 transition-opacity" />
                                <div className="relative flex items-center bg-black/60 border border-white/10 rounded-2xl backdrop-blur-xl">
                                    <Search className="w-5 h-5 ml-4 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Search docs..."
                                        className="w-full px-4 py-4 bg-transparent text-white focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Sections */}
                    <div className="grid md:grid-cols-2 gap-8 mb-24">
                        {sections.map((section, i) => (
                            <div key={i} className="group p-10 rounded-3xl bg-white/2 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-2xl font-bold">{section.title}</h2>
                                </div>
                                <p className="text-gray-400 mb-8 leading-relaxed font-medium">
                                    {section.description}
                                </p>
                                <ul className="grid grid-cols-1 gap-4">
                                    {section.guides.map((guide, j) => (
                                        <li key={j}>
                                            <Link href={guide.href} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all group/link">
                                                <span className="font-semibold text-gray-300 group-hover/link:text-white transition-colors">{guide.title}</span>
                                                <ArrowRight className="w-4 h-4 text-gray-500 group-hover/link:translate-x-1 transition-transform" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Popular Articles */}
                    <div className="mb-24">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-3xl font-bold">Popular Articles</h2>
                            <Link href="#" className="text-cyan-400 font-bold flex items-center hover:opacity-80">
                                View all <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {[1, 2, 3].map((item) => (
                                <article key={item} className="p-8 rounded-3xl bg-white/2 border border-white/5 hover:border-white/10 transition-all group">
                                    <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold mb-4 uppercase tracking-wider">
                                        Tutorial
                                    </span>
                                    <h3 className="text-xl font-bold mb-4 group-hover:text-cyan-400 transition-colors">
                                        How to optimize AI accuracy for noisy environments
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-6 font-medium">
                                        Learn the best practices for setting up your environment for the highest quality transcripts.
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-gray-500 font-bold">
                                        <span>7 MIN READ</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-700" />
                                        <span>SEP 12, 2024</span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-linear-to-r from-cyan-500 to-purple-600 rounded-[2.5rem] blur opacity-25" />
                        <div className="relative p-12 lg:p-20 rounded-[2.5rem] bg-black/40 border border-white/10 backdrop-blur-2xl text-center overflow-hidden">
                            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Can't find what you need?</h2>
                            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto font-medium">
                                Our engineers and support specialists are ready to help you with any technical questions.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                                <Link
                                    href="/help"
                                    className="px-10 py-5 bg-white text-black rounded-2xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center shadow-2xl shadow-white/5"
                                >
                                    Visit Help Center
                                </Link>
                                <Link
                                    href="/contact"
                                    className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all backdrop-blur-md flex items-center justify-center"
                                >
                                    Contact Support
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
