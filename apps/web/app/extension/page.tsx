import { Metadata } from 'next'
import Link from 'next/link'
import { Chrome, Zap, Shield, Sparkles, ArrowRight, Video, MessageSquare, Download } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Live Copilot Extension | Zap Bot',
    description: 'Your AI Wingman for every meeting. Capture live captions and get real-time AI reply suggestions on Google Meet, Zoom, and Teams.',
}

export default function ExtensionPage() {
    return (
        <div className="min-h-screen bg-[#050510] text-white pt-32 pb-20 overflow-x-hidden font-inter">
            {/* Background Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] animate-glow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-glow" style={{ animationDelay: '2s' }} />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-6xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center mb-24">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-sm font-bold mb-8 animate-in shadow-xl backdrop-blur-md">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Live Copilot v0.1.0 Now Available
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black mb-8 bg-linear-to-r from-white via-white to-gray-500 bg-clip-text text-transparent leading-[1.1] tracking-tight">
                            Your AI Wingman <br />
                            <span className="italic font-serif text-cyan-400">In Every Meeting</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
                            Capture live captions and get instant AI-powered reply suggestions across Google Meet, Zoom, and Teams. Never miss a beat again.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <Link
                                href="#"
                                className="group relative px-10 py-5 bg-cyan-500 hover:bg-cyan-400 text-black rounded-2xl font-bold transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:scale-105 flex items-center"
                            >
                                <Chrome className="w-6 h-6 mr-3" />
                                Add to Chrome — It&apos;s Free
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="#how-it-works"
                                className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all backdrop-blur-md"
                            >
                                See How It Works
                            </Link>
                        </div>
                    </div>

                    {/* Dashboard Preview / Mockup */}
                    <div className="relative mb-32 group">
                        <div className="absolute -inset-1 bg-linear-to-r from-cyan-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="relative rounded-3xl border border-white/10 bg-black/40 overflow-hidden backdrop-blur-3xl aspect-video flex items-center justify-center shadow-2xl">
                            <div className="text-center p-20">
                                <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 animate-pulse">
                                    <Video className="w-12 h-12" />
                                </div>
                                <h3 className="text-3xl font-bold mb-4">Real-time Caption Analysis</h3>
                                <p className="text-gray-400 text-lg font-medium max-w-lg mx-auto">
                                    Our extension overlays directly onto your meeting window, providing live insights and response tips without hiding the conversation.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div id="features" className="grid md:grid-cols-3 gap-8 mb-32">
                        <div className="group p-10 rounded-4xl bg-white/2 border border-white/5 hover:bg-white/5 hover:border-cyan-500/30 transition-all">
                            <div className="w-16 h-16 mb-8 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                                <MessageSquare className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Live Caption Scraper</h3>
                            <p className="text-gray-400 text-lg leading-relaxed font-medium">
                                Automatically captures every word spoken in your meeting. Works natively with major platforms.
                            </p>
                        </div>

                        <div className="group p-10 rounded-4xl bg-white/2 border border-white/5 hover:bg-white/5 hover:border-purple-500/30 transition-all">
                            <div className="w-16 h-16 mb-8 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                <Zap className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Instant Suggestions</h3>
                            <p className="text-gray-400 text-lg leading-relaxed font-medium">
                                Nervous about what to say? Get professional, context-aware reply tips in under 1.5 seconds.
                            </p>
                        </div>

                        <div className="group p-10 rounded-4xl bg-white/2 border border-white/5 hover:bg-white/5 hover:border-blue-500/30 transition-all">
                            <div className="w-16 h-16 mb-8 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                <Download className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Cloud Sync Hub</h3>
                            <p className="text-gray-400 text-lg leading-relaxed font-medium">
                                All captured highlights are synced to your dashboard, making it easy to search post-meeting.
                            </p>
                        </div>
                    </div>

                    {/* Step Section */}
                    <section id="how-it-works" className="mb-32">
                        <h2 className="text-4xl md:text-5xl font-black mb-20 text-center">Get Started in Seconds</h2>
                        <div className="grid md:grid-cols-3 gap-12">
                            {[
                                { step: "01", title: "Install Extension", desc: "Add Live Copilot to your browser from the Chrome Web Store in one click." },
                                { step: "02", title: "Join Meeting", desc: "Open any Google Meet, Zoom, or Teams call. Turn on captions and start." },
                                { step: "03", title: "Be the Expert", desc: "Watch suggestions flow in and use them to deliver high-quality input effortlessly." }
                            ].map((s, i) => (
                                <div key={i} className="relative p-10 rounded-3xl bg-white/2 border border-white/5 overflow-hidden">
                                    <div className="absolute -top-10 -right-10 text-[10rem] font-black text-white/5 pointer-events-none uppercase">
                                        {s.step}
                                    </div>
                                    <h4 className="text-2xl font-bold mb-4 bg-linear-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">{s.title}</h4>
                                    <p className="text-gray-400 text-lg font-medium leading-relaxed relative z-10">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Bottom CTA */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-linear-to-r from-cyan-500 to-purple-600 rounded-4xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
                        <div className="relative p-16 md:p-24 rounded-4xl bg-black border border-white/10 text-center overflow-hidden">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] -mr-48 -mt-48" />
                            <h2 className="text-5xl md:text-6xl font-black mb-8">Ready to dominate every meeting?</h2>
                            <p className="text-2xl text-gray-400 mb-12 max-w-3xl mx-auto font-medium">
                                Join thousands of high-performing individuals using Zap Bot Live Copilot to stay ahead and stay confident.
                            </p>
                            <Link
                                href="#"
                                className="inline-flex items-center px-12 py-6 bg-white text-black rounded-4xl font-black text-xl hover:bg-cyan-500 hover:text-white transition-all shadow-2xl scale-100 hover:scale-110 active:scale-95 duration-300"
                            >
                                <Chrome className="w-8 h-8 mr-4" />
                                Add to Chrome Free
                            </Link>
                        </div>
                    </div>

                    <footer className="mt-24 pt-12 border-t border-white/5 text-center text-gray-500 font-medium">
                        <p>© 2024 Zap Bot AI. Built for the future of work.</p>
                    </footer>
                </div>
            </div>
        </div>
    )
}
