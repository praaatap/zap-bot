"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const faqs = [
    {
        question: "How does the bot actually join my meetings?",
        answer: "Once connected to your calendar, Zap Bot identifies meeting links in your events. It joins as a silent participant, recording the audio and video high-fidelity for processing. You can always kick it out or pause it manually."
    },
    {
        question: "Is my data used to train public AI models?",
        answer: "Strictly no. Your data is your own. We use private enterprise instances of LLMs, meaning your transcripts and summaries never leave your secure environment and are never used for global model training."
    },
    {
        question: "Does it support multiple languages?",
        answer: "Yes. Zap Bot supports over 50 languages with native-level accuracy, automatically detecting the language being spoken and providing translations if requested."
    },
    {
        question: "Can I customize the summary format?",
        answer: "Absolutely. In your settings, you can define 'Custom Directives'—for example, asking the bot to always highlight budget mentions or technical blockers in a specific bulleted list."
    }
];

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="py-32 px-6 bg-white dark:bg-[#030303] transition-colors duration-500">
            <div className="max-w-4xl mx-auto">
                
                {/* Section Header */}
                <div className="mb-20 space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500">
                        Common Inquiries
                    </span>
                    <h2 className="text-4xl md:text-6xl font-extrabold font-heading tracking-tight leading-none text-slate-900 dark:text-white">
                        Everything you <br />
                        <span className="text-slate-400 dark:text-slate-600 italic font-medium">need to know.</span>
                    </h2>
                </div>

                {/* Accordion List */}
                <div className="border-t border-slate-100 dark:border-white/5">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div 
                                key={index} 
                                className="border-b border-slate-100 dark:border-white/5 group"
                            >
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                    className="w-full py-8 flex items-center justify-between text-left transition-all"
                                >
                                    <h3 className={cn(
                                        "text-xl md:text-2xl font-bold font-heading tracking-tight transition-colors duration-300",
                                        isOpen ? "text-blue-500" : "text-slate-900 dark:text-slate-200 group-hover:text-blue-400"
                                    )}>
                                        {faq.question}
                                    </h3>
                                    
                                    {/* Minimalist Toggle Icon */}
                                    <div className={cn(
                                        "relative flex items-center justify-center w-6 h-6 transition-transform duration-500",
                                        isOpen ? "rotate-45" : "rotate-0"
                                    )}>
                                        <Plus className={cn(
                                            "w-5 h-5 transition-colors",
                                            isOpen ? "text-blue-500" : "text-slate-400"
                                        )} />
                                    </div>
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                        >
                                            <div className="pb-8 pr-12">
                                                <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom Call to Action */}
                <div className="mt-20 p-8 rounded-[2rem] bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <h4 className="text-lg font-bold font-heading">Still have questions?</h4>
                        <p className="text-sm text-slate-500">Our support team is active 24/7 to help you out.</p>
                    </div>
                    <button className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full font-bold text-sm hover:scale-105 transition-all active:scale-95 shadow-xl shadow-blue-500/5">
                        Contact Support
                    </button>
                </div>
            </div>
        </section>
    );
}