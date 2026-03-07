import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export default function FAQSection() {
    const [openItems, setOpenItems] = useState<number[]>([]);

    const toggleItem = (index: number) => {
        setOpenItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
    };

    const faqs = [
        {
            question: "What is Zap Bot and how does it work?",
            answer:
                "Zap Bot is an AI-powered meeting assistant that automatically joins your meetings, records conversations, generates summaries, and extracts action items. Simply connect your Google Calendar and our bot handles the rest - no manual intervention needed.",
        },
        {
            question: "Which platforms does Zap Bot integrate with?",
            answer:
                "Zap Bot integrates seamlessly with Google Calendar, Slack, Jira, Asana, Trello, and email. We support all major video conferencing platforms including Zoom, Google Meet, and Microsoft Teams.",
        },
        {
            question: "Is my meeting data secure and private?",
            answer:
                "Absolutely. We use enterprise-grade encryption for all data in transit and at rest. Your meeting recordings and transcripts are stored securely and are only accessible to your team. We're GDPR compliant and never share your data with third parties.",
        },
        {
            question: "How accurate are the AI-generated summaries?",
            answer:
                "Our AI achieves 95%+ accuracy on transcriptions and summaries. The system is trained on millions of meeting conversations and continuously improves. Key points, decisions, and action items are extracted with high precision.",
        },
        {
            question: "Can I search through past meeting transcripts?",
            answer:
                "Yes! Our powerful chat feature lets you search across all your meeting transcripts using natural language. Ask questions like 'What did we decide about the product launch?' and get instant answers with relevant excerpts.",
        },
    ];

    return (
        <section id="faq" className="relative py-24 md:py-32 overflow-hidden">
            {/* Background blur effects */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-cyan-900/20 rounded-full blur-[100px] -z-10"></div>
            <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/3 w-96 h-96 bg-purple-900/20 rounded-full blur-[100px] -z-10"></div>

            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-full bg-cyan-900/40 border border-cyan-500/30 text-cyan-400 mb-6 font-medium">
                        ✶ FAQs
                    </div>

                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">
                        Questions? We've got{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-500">
                            answers
                        </span>
                    </h2>
                </div>

                <div className="flex flex-col gap-4">
                    {faqs.map((faq, index) => {
                        const isOpen = openItems.includes(index);
                        return (
                            <div
                                key={index}
                                className={`group border border-white/10 bg-black/40 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? "border-cyan-500/50 shadow-[0_0_30px_-5px_rgba(6,182,212,0.15)]" : "hover:border-white/20 hover:bg-white/5"
                                    } animate-in fade-in slide-in-from-bottom-4 duration-500 delay-${index * 100}`}
                            >
                                <button
                                    onClick={() => toggleItem(index)}
                                    className="w-full px-6 py-6 flex items-center justify-between text-left focus:outline-none"
                                    aria-expanded={isOpen}
                                >
                                    <h3 className={`text-lg font-medium pr-8 transition-colors duration-300 ${isOpen ? "text-cyan-400" : "text-white"}`}>
                                        {faq.question}
                                    </h3>
                                    <div className={`flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}>
                                        {isOpen ? (
                                            <Minus className="w-6 h-6 text-cyan-400" />
                                        ) : (
                                            <Plus className="w-6 h-6 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                                        )}
                                    </div>
                                </button>

                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100 mb-6" : "max-h-0 opacity-0"}`}
                                >
                                    <p className="px-6 text-gray-400 leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
