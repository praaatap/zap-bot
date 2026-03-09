import { Calendar, MessageSquareText, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function Features() {
    const features = [
        {
            title: "Calendar & Integrations",
            description: "Connect Google Calendar and our AI bot automatically joins meetings. Push action items to your favorite project management tools with one click.",
            icon: <Calendar className="w-6 h-6 text-cyan-400" />,
            gradient: "from-blue-500/20 to-purple-500/20",
        },
        {
            title: "AI-Powered Summaries",
            description: "Get instant, accurate meeting summaries with key points, decisions, and action items automatically extracted by AI.",
            icon: <Sparkles className="w-6 h-6 text-purple-400" />,
            gradient: "from-purple-500/20 to-pink-500/20",
        },
        {
            title: "Chat with Meetings",
            description: "Ask questions about past meetings using natural language and find information instantly across all your transcripts.",
            icon: <MessageSquareText className="w-6 h-6 text-pink-400" />,
            gradient: "from-pink-500/20 to-rose-500/20",
        },
        {
            title: "Real-time Transcription",
            description: "Our AI bot records and transcribes meetings in real-time with industry-leading accuracy and speed.",
            icon: <Zap className="w-6 h-6 text-amber-400" />,
            gradient: "from-amber-500/20 to-orange-500/20",
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: "easeOut" as const }
        }
    };

    return (
        <section id="features" className="relative py-32 overflow-hidden bg-[#030303]">
            {/* Background decorations */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-96 bg-cyan-900/10 blur-[150px] rounded-full -z-10"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-screen pointer-events-none"></div>

            <div className="container mx-auto px-4 max-w-6xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-20 max-w-3xl mx-auto"
                >
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-white tracking-tight leading-tight">
                        Everything You Need for <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-blue-400 to-purple-500">
                            Smarter Meetings
                        </span>
                    </h2>
                    <p className="text-xl text-gray-400/90 font-medium">
                        Zap Bot brings powerful AI capabilities to your daily workflow, saving you hours of manual note-taking and follow-ups.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid md:grid-cols-2 gap-6 lg:gap-8"
                >
                    {features.map((feature, idx) => (
                        <motion.div
                            variants={itemVariants}
                            key={idx}
                            className="group relative p-8 md:p-10 rounded-4xl border border-white/8 bg-[#0a0a0a]/50 backdrop-blur-xl overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:border-white/15 hover:bg-[#111111]/80 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
                        >
                            {/* Card background effect */}
                            <div className={`absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-linear-to-bl ${feature.gradient} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>

                            {/* Subtle line decoration */}
                            <div className="absolute left-0 top-0 w-1 h-full bg-linear-to-b from-transparent via-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-white/3 border border-white/8 flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500 ease-out">
                                    {feature.icon}
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">
                                    {feature.title}
                                </h3>

                                <p className="text-gray-400 leading-relaxed text-lg">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
