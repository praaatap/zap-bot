"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Twitter, Github, Linkedin, Globe, ArrowUpRight } from 'lucide-react';

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
        <footer className="relative bg-white dark:bg-[#030303] pt-24 pb-12 overflow-hidden border-t border-slate-100 dark:border-white/5">
            {/* Ambient Light Bleed - Adds depth to the bottom of the page */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-linear-to-r from-transparent via-blue-500/20 to-transparent dark:via-blue-400/10" />
            <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/5 dark:bg-blue-600/2 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-y-12 gap-x-8 mb-20">

                    {/* Brand Column */}
                    <div className="col-span-2 space-y-6">
                        <Link href="/" className="flex items-center gap-2.5 group w-fit">
                            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center transition-transform group-hover:scale-105 shadow-xl">
                                <Sparkles className="w-5 h-5 text-white dark:text-black" />
                            </div>
                            <span className="text-xl font-bold font-heading tracking-tight">Zap Bot</span>
                        </Link>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                            The high-performance meeting assistant. Record, transcribe, and automate your workflow with editorial precision.
                        </p>
                        <div className="flex items-center gap-4">
                            {[Twitter, Github, Linkedin].map((Icon, i) => (
                                <a key={i} href="#" className="p-2 rounded-full border border-slate-100 dark:border-white/10 text-slate-400 hover:text-blue-500 hover:border-blue-500/20 transition-all">
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link Columns */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category} className="col-span-1">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">
                                {category}
                            </h4>
                            <ul className="space-y-4">
                                {links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="group text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
                                        >
                                            {link.name}
                                            {link.badge && (
                                                <span className="text-[8px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest">
                                                    {link.badge}
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Location/Status Column */}
                    <div className="col-span-1">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">
                            Status
                        </h4>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Systems Online</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                        <p className="text-xs text-slate-400 font-medium tracking-tight">
                            © 2026 Zap Bot Intelligence Inc.
                        </p>
                        <div className="flex gap-6">
                            {['Privacy', 'Terms', 'Cookies'].map(item => (
                                <Link key={item} href={`/${item.toLowerCase()}`} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                    {item}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-full border border-slate-100 dark:border-white/10">
                        <Globe className="w-3 h-3" />
                        <span>EN — Global</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}