import { ArrowRight, Play, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
    return (
        <section className="relative overflow-hidden min-h-screen flex flex-col pt-32 md:pt-40">
            {/* Background Decorative Glows */}
            <div className="absolute top-0 right-[10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-1/4 left-[10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

            <div className="container mx-auto px-4 relative z-10 flex-1 flex flex-col items-center text-center">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-10"
                >
                    <div className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-full bg-white/3 border border-white/10 text-cyan-300 backdrop-blur-xl shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all hover:bg-white/8 hover:border-white/20">
                        <Sparkles className="h-4 w-4" />
                        AI-Powered Meeting Assistant 2.0
                    </div>
                </motion.div>

                {/* Main Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                    className="mb-8"
                >
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.05]">
                        Your AI Wingman In <br className="hidden md:block" /> Every{" "}
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-blue-500 to-purple-500 inline-block relative">
                            Meeting.
                            <div className="absolute -inset-x-6 -inset-y-2 bg-linear-to-r from-cyan-400 to-purple-500 opacity-20 blur-2xl -z-10 rounded-full"></div>
                        </span>
                    </h1>
                </motion.div>

                {/* Description */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="mx-auto mb-12 max-w-2xl text-lg md:text-xl text-gray-400 font-medium leading-relaxed"
                >
                    Automate notes, extract critical action items, and instantly query past discussions with a futuristic AI intelligence native to your workflow.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto"
                >
                    {/* CTA Buttons */}
                    <Link
                        href="/dashboard"
                        className="group relative flex items-center justify-center bg-cyan-500 hover:bg-cyan-400 text-[#000000] font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_40px_rgba(34,211,238,0.5)] overflow-hidden w-full sm:w-auto"
                    >
                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                        <span className="relative z-10 text-base">Start for Free</span>
                        <ArrowRight className="w-5 h-5 ml-2 relative z-10 group-hover:translate-x-1 group-hover:-rotate-12 transition-all" />
                    </Link>

                    <button className="group flex items-center justify-center bg-[#0a0a0a] border border-white/10 text-white hover:bg-white/5 font-semibold px-8 py-4 rounded-xl transition-all duration-300 w-full sm:w-auto shadow-xl">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-3 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors">
                            <Play className="w-4 h-4 fill-current" />
                        </div>
                        <span className="text-base">Watch Demo</span>
                    </button>
                </motion.div>

                {/* Trust Batch */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="mt-20 flex flex-wrap justify-center gap-x-12 gap-y-6 text-gray-500 font-bold uppercase tracking-widest text-xs"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                        1M+ Meetings
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                        98% Accuracy
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                        GDPR Compliant
                    </div>
                </motion.div>
            </div>

            {/* Bottom Gradient Fade */}
            <div className="absolute bottom-0 inset-x-0 h-40 bg-linear-to-t from-[#030303] via-[#030303]/80 to-transparent z-20 pointer-events-none" />
        </section>
    );
}
