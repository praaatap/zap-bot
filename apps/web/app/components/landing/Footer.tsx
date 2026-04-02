"use client";

import React from 'react';
import Link from 'next/link';
import { Twitter, Github, Linkedin, Zap } from 'lucide-react';

const footerLinks = {
    product: [
        { name: "Features", href: "/#features" },
        { name: "Integrations", href: "/integrations" },
        { name: "Pricing", href: "/#pricing" },
        { name: "Changelog", href: "/changelog", badge: "New" },
    ],
    company: [
        { name: "About", href: "/about" },
        { name: "Blog", href: "/blog" },
        { name: "Contact", href: "/contact" },
    ]
};

export default function Footer() {
    return (
        <footer className="bg-[#000] pt-20 pb-10 border-t border-white/5 font-sans relative overflow-hidden">
            {/* Subtle top edge highlight */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">
                    
                    {/* Brand Section */}
                    <div className="max-w-xs">
                        <Link href="/" className="flex items-center gap-3 group w-fit mb-6">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-[0_0_15px_rgba(34,211,238,0.2)] group-hover:scale-105 transition-transform">
                                PS
                            </div>
                            <span className="text-xl font-bold tracking-tighter text-white">Zap Bot</span>
                        </Link>
                        <p className="text-sm text-zinc-500 leading-relaxed mb-6">
                            Meeting Intelligence OS. <br /> Built for the AI-first workflow.
                        </p>
                        <div className="flex items-center gap-4">
                            {[Twitter, Github, Linkedin].map((Icon, i) => (
                                <a key={i} href="#" className="text-zinc-500 hover:text-white transition-colors group">
                                    <Icon className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Section */}
                    <div className="flex gap-16 md:gap-24">
                        {Object.entries(footerLinks).map(([category, links]) => (
                            <div key={category}>
                                <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-white mb-6">
                                    {category}
                                </h4>
                                <ul className="space-y-3">
                                    {links.map((link :any) => (
                                        <li key={link.name}>
                                            <Link href={link.href} className="text-sm text-zinc-400 hover:text-cyan-400 transition-colors flex items-center gap-2">
                                                {link.name}
                                                {link.badge && (
                                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-bold uppercase tracking-wider">
                                                        {link.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Legal & Status Bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-6">
                        <p className="text-xs text-zinc-600 font-medium">
                            © {new Date().getFullYear()} Zap Bot Inc.
                        </p>
                        <div className="hidden md:flex gap-6">
                            {['Privacy', 'Terms'].map(item => (
                                <Link key={item} href={`/${item.toLowerCase()}`} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
                                    {item}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Minimal System Status */}
                    <a href="#" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] text-zinc-400 font-medium">All systems operational</span>
                    </a>
                </div>
            </div>
        </footer>
    );
}