import React from 'react'
import { motion } from 'framer-motion'

export default function HowItWorksSection() {
    const steps = [
        {
            number: '01',
            title: 'Connect Calendar',
            description: 'Link your Google or Outlook calendar. We\'ll automatically detect and join your meetings.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            number: '02',
            title: 'AI Bot Joins',
            description: 'Your AI assistant joins automatically, records audio, and transcribes everything in real-time.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            number: '03',
            title: 'Get Insights',
            description: 'Receive summaries, action items, and push them to Slack or Jira instantly.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            )
        }
    ]

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
    }

    return (
        <section id="how-it-works" className="py-24 lg:py-32 bg-[#030303] relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none translate-y-1/2 -translate-x-1/3" />

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-24 max-w-3xl mx-auto"
                >
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">How It Works</h2>
                    <p className="text-gray-400 text-xl font-medium">Get started in 3 simple steps - no technical expertise required.</p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid md:grid-cols-3 gap-16 md:gap-8 lg:gap-12 relative"
                >
                    {/* Connecting Line */}
                    <div className="hidden md:block absolute top-[44px] left-[15%] right-[15%] h-[2px] bg-linear-to-r from-transparent via-cyan-500/30 to-transparent" />

                    {steps.map((step, index) => (
                        <motion.div variants={itemVariants} key={index} className="relative group text-center z-10">
                            <div className="w-24 h-24 mx-auto mb-10 rounded-4xl border border-white/10 bg-[#0a0a0a] text-cyan-400 flex items-center justify-center text-3xl font-black shadow-[0_0_30px_rgba(6,182,212,0.1)] group-hover:shadow-[0_0_40px_rgba(6,182,212,0.3)] group-hover:-translate-y-2 group-hover:bg-[#111111] group-hover:border-cyan-500/30 transition-all duration-500 ease-out">
                                {step.number}
                                {/* Subtle inner glow on hover */}
                                <div className="absolute inset-0 rounded-4xl bg-cyan-400/0 group-hover:bg-cyan-400/5 transition-colors duration-500 pointer-events-none" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4 tracking-tight group-hover:text-cyan-300 transition-colors duration-300">{step.title}</h3>
                            <p className="text-gray-400 text-lg leading-relaxed">{step.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
