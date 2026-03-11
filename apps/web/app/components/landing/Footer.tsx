"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Twitter, Github, Linkedin, Globe, ArrowRight, Zap } from 'lucide-react';

type FooterLink = {
    name: string;
    href: string;
    badge?: string;
};

const footerLinks: Record<string, FooterLink[]> = {
    product: [
        { name: "Features", href: "/#features" },
        { name: "Integrations", href: "/integrations" },
        { name: "Pricing", href: "/#pricing" },
        { name: "Changelog", href: "/changelog", badge: "New" },
    ],
    company: [
        { name: "About", href: "/about" },
        { name: "Blog", href: "/blog" },
        { name: "Careers", href: "/careers" },
        { name: "Contact", href: "/contact" },
    ],
    resources: [
        { name: "Documentation", href: "/docs" },
        { name: "Help Center", href: "/help" },
        { name: "Community", href: "/community" },
        { name: "Privacy", href: "/privacy" },
    ]
};

export default function Footer() {
    return (
        <footer className="relative bg-[#000] pt-32 pb-12 overflow-hidden border-t border-white/5">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-linear-to-r from-transparent via-cyan-500/20 to-transparent" />
            <div className="absolute -top-24 left-1/4 w-[400px] h-[400px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute -top-24 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                
                {/* 1. Final CTA Section inside Footer */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-24 p-10 md:p-16 rounded-[3rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative"
                >
                    <div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 via-transparent to-transparent opacity-50" />
                    <div className="relative z-10 max-w-xl text-center md:text-left">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-white mb-4">
                            Ready to automate your <br /> meeting memory?
                        </h2>
                        <p className="text-zinc-400 text-lg">
                            Join 2,000+ high-velocity teams already using Zap Bot.
                        </p>
                    </div>
                    <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <Link href="/signup" className="flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                            Get Started Free <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </motion.div>

                {/* 2. Main Link Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-y-12 gap-x-8 mb-24">
                    
                    {/* Brand Column */}
                    <div className="col-span-2 space-y-8">
                        <Link href="/" className="flex items-center gap-3 group w-fit">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center transition-transform group-hover:rotate-12">
                                <Sparkles className="w-5 h-5 text-black" />
                            </div>
                            <span className="text-2xl font-bold tracking-tighter text-white">Zap Bot</span>
                        </Link>
                        <p className="text-sm text-zinc-500 max-w-xs leading-relaxed font-medium">
                            Meeting Intelligence OS for modern teams. Built with editorial precision for the AI-first workflow.
                        </p>
                        <div className="flex items-center gap-3">
                            {[Twitter, Github, Linkedin].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center text-zinc-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all group">
                                    <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Dynamic Columns */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category} className="col-span-1">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 mb-8">
                                {category}
                            </h4>
                            <ul className="space-y-4">
                                {links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="group text-[13px] font-medium text-zinc-500 hover:text-white transition-colors flex items-center gap-2"
                                        >
                                            {link.name}
                                            {link.badge && (
                                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-bold uppercase tracking-widest border border-cyan-500/20">
                                                    {link.badge}
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Status Indicator */}
                    <div className="col-span-1">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 mb-8">
                            Network
                        </h4>
                        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 backdrop-blur-md">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Global CDN Live</span>
                        </div>
                    </div>
                </div>

                {/* 3. Bottom Legal Bar */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-10">
                        <p className="text-[11px] text-zinc-600 font-bold uppercase tracking-widest">
                            © 2026 Zap Bot Intelligence Inc.
                        </p>
                        <div className="flex gap-8">
                            {['Privacy', 'Terms', 'Compliance'].map(item => (
                                <Link key={item} href={`/${item.toLowerCase()}`} className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                                    {item}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-5 py-2.5 bg-white/[0.03] rounded-full border border-white/5 backdrop-blur-md">
                        <Globe className="w-3.5 h-3.5" />
                        <span>English (US)</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}