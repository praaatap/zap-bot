"use client";

import React from 'react';
import { motion } from 'framer-motion';

const stats = [
    { label: 'Meetings Recorded', value: '1.2M+', color: 'text-cyan-500' },
    { label: 'Platform Uptime', value: '99.99%', color: 'text-white' },
    { label: 'Integration Speed', value: '< 2min', color: 'text-white' },
    { label: 'Hours Saved / Mo', value: '24hrs', color: 'text-purple-500' },
];

export default function StatsSection() {
    return (
        <section className="py-20 bg-white dark:bg-[#030303] border-y border-slate-100 dark:border-white/5">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-12"
                >
                    {stats.map((stat, i) => (
                        <div key={i} className="flex flex-col gap-2 relative group">
                            {/* Subtle accent line */}
                            <div className="absolute -left-6 top-0 bottom-0 w-px bg-slate-200 dark:bg-white/10 hidden lg:block" />
                            
                            <span className={`text-4xl md:text-5xl font-extrabold font-heading tracking-tighter ${stat.color}`}>
                                {stat.value}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}