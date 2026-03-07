import { ArrowRight, Play, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Hero() {
    return (
        <section className="relative overflow-hidden min-h-screen flex flex-col pt-32 md:pt-40 bg-[#050510]">
            {/* Background Decorative Glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10 flex-1 flex flex-col items-center text-center">
                {/* Badge */}
                <div className="mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="inline-flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-full bg-white/5 border border-white/10 text-cyan-400 backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                        <Sparkles className="h-4 w-4" />
                        AI-Powered Meeting Assistant
                    </div>
                </div>

                {/* Main Heading */}
                <div className="mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <h1 className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tight text-white max-w-6xl mx-auto leading-[1.05] drop-shadow-2xl">
                        Your AI Wingman In Every{" "}
                        <span className="bg-linear-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent italic">
                            Meeting
                        </span>
                    </h1>
                </div>

                {/* Description */}
                <p className="mx-auto mb-12 max-w-3xl text-xl md:text-2xl text-gray-400 font-medium leading-relaxed opacity-90 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
                    Automate notes, identify action items, and boost team productivity with futuristic AI intelligence. Join 50k+ teams saving 5+ hours every single week.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
                    {/* CTA Buttons */}
                    <Link
                        href="/dashboard"
                        className="group relative flex items-center justify-center bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-10 py-5 rounded-2xl transition-all duration-300 shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:shadow-cyan-400/60 transform hover:-translate-y-1 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <span className="relative z-10 text-lg">Start for Free</span>
                        <ArrowRight className="w-5 h-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <button className="group flex items-center justify-center bg-white/5 border border-white/10 text-white hover:bg-white/10 font-bold px-10 py-5 rounded-2xl transition-all duration-300 backdrop-blur-md transform hover:-translate-y-1">
                        <Play className="w-5 h-5 mr-3 text-cyan-400 group-hover:scale-125 transition-transform" />
                        <span className="text-lg">Watch Demo</span>
                    </button>
                </div>

                {/* Trust Batch */}
                <div className="mt-20 flex flex-wrap justify-center gap-x-12 gap-y-6 text-gray-500 font-bold uppercase tracking-widest text-xs opacity-50 animate-in fade-in duration-1000 delay-1000">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                        1M+ Meetings
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                        98% Accuracy
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                        GDPR Compliant
                    </div>
                </div>
            </div>

            {/* Bottom Gradient Fade */}
            <div className="absolute bottom-0 inset-x-0 h-32 bg-linear-to-t from-[#050510] to-transparent z-20" />
        </section>
    );
}
