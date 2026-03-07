import React from 'react'

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

    return (
        <section id="how-it-works" className="py-24 bg-[#050510]">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">How It Works</h2>
                    <p className="text-gray-400 text-lg opacity-80">Get started in 3 simple steps - no technical expertise required</p>
                </div>

                <div className="grid md:grid-cols-3 gap-12 relative">
                    {/* Connection Line */}
                    <div className="hidden md:block absolute top-[100px] left-[10%] right-[10%] h-0.5 bg-linear-to-r from-transparent via-primary/20 to-transparent" />

                    {steps.map((step, index) => (
                        <div key={index} className="relative group text-center">
                            <div className="w-20 h-20 mx-auto mb-8 rounded-full border-2 border-primary/30 bg-black/50 text-primary flex items-center justify-center text-2xl font-bold group-hover:scale-110 group-hover:bg-primary/10 group-hover:border-primary transition-all duration-500 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                                {step.number}
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-primary transition-colors">{step.title}</h3>
                            <p className="text-gray-400 text-lg leading-relaxed opacity-80">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
