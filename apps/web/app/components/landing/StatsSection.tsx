import React from 'react'

export default function StatsSection() {
    const stats = [
        { label: 'Meetings Recorded', value: '1M+', color: 'text-cyan-400' },
        { label: 'Uptime', value: '99.9%', color: 'text-purple-400' },
        { label: 'Setup Time', value: '2min', color: 'text-blue-400' },
        { label: 'Saved Per Week', value: '5+ hrs', color: 'text-emerald-400' },
    ]

    return (
        <section className="py-24 bg-[#050510] relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="group p-8 rounded-3xl bg-white/2 border border-white/5 backdrop-blur-xl hover:bg-white/4 hover:border-white/10 transition-all duration-500 text-center">
                            <div className={`text-4xl md:text-5xl font-extrabold mb-3 tracking-tighter ${stat.color} drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]`}>
                                {stat.value}
                            </div>
                            <div className="text-gray-400 font-medium text-sm md:text-base uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
