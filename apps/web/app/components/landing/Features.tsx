import { Calendar, MessageSquareText, Sparkles, Zap } from "lucide-react";

export default function Features() {
    const features = [
        {
            title: "Calendar & Integrations",
            description: "Connect Google Calendar and our AI bot automatically joins meetings. Push action items to your favorite project management tools with one click.",
            icon: <Calendar className="w-6 h-6 text-cyan-400" />,
            gradient: "from-blue-500/20 to-purple-500/20",
            delay: "delay-0",
        },
        {
            title: "AI-Powered Summaries",
            description: "Get instant, accurate meeting summaries with key points, decisions, and action items automatically extracted by AI.",
            icon: <Sparkles className="w-6 h-6 text-purple-400" />,
            gradient: "from-purple-500/20 to-pink-500/20",
            delay: "delay-100",
        },
        {
            title: "Chat with Meetings",
            description: "Ask questions about past meetings using natural language and find information instantly across all your transcripts.",
            icon: <MessageSquareText className="w-6 h-6 text-pink-400" />,
            gradient: "from-pink-500/20 to-rose-500/20",
            delay: "delay-200",
        },
        {
            title: "Real-time Transcription",
            description: "Our AI bot records and transcribes meetings in real-time with industry-leading accuracy and speed.",
            icon: <Zap className="w-6 h-6 text-amber-400" />,
            gradient: "from-amber-500/20 to-orange-500/20",
            delay: "delay-300",
        },
    ];

    return (
        <section id="features" className="relative py-24 md:py-32 overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-96 bg-cyan-900/20 blur-[100px] rounded-full -z-10"></div>

            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-16 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">
                        Everything You Need for <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                            Smarter Meetings
                        </span>
                    </h2>
                    <p className="text-lg text-gray-400">
                        Zap Bot brings powerful AI capabilities to your daily workflow, saving you hours of manual note-taking and follow-ups.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className={`group relative p-8 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-cyan-500/50 hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.3)] animate-in fade-in slide-in-from-bottom-8 duration-700 ${feature.delay}`}
                        >
                            {/* Card background effect */}
                            <div className={`absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-gradient-to-bl ${feature.gradient} blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500`}></div>

                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-inner">
                                    {feature.icon}
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-4">
                                    {feature.title}
                                </h3>

                                <p className="text-gray-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
