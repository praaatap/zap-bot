"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Zap, ArrowLeft, Code2, Terminal, CheckCircle2 } from "lucide-react";
import { CustomSignUp } from "@/components/auth/CustomSignUp";
import Link from "next/link";

export default function SignUpPage() {
  return (
    // Changed min-h-screen to h-[100dvh] to strictly lock the height on all devices
    <div className="h-[100dvh] flex w-full font-sans overflow-hidden bg-white">
      
      {/* ================= LEFT PANEL (AUTH FORM) ================= */}
      <div className="flex-1 flex flex-col relative z-10 lg:max-w-[55%] xl:max-w-[50%] w-full h-full">
        
        {/* Subtle Background Mesh for Left Side */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/80 via-white to-transparent" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        {/* Top Navigation - Reduced padding on mobile to save vertical space */}
        <nav className="p-4 md:p-8 flex justify-between items-center w-full shrink-0">
          <Link href="/" className="flex items-center gap-2 md:gap-2.5 group">
            <div className="bg-gradient-to-b from-blue-500 to-blue-600 p-1.5 rounded-lg shadow-sm shadow-blue-600/20 border border-blue-400/20 group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 md:w-5 md:h-5 text-white fill-current" />
            </div>
            <span className="text-[16px] md:text-[18px] font-bold tracking-tight text-slate-900">ZapBot</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-slate-200 shadow-sm hover:shadow-md">
            <ArrowLeft className="w-3 h-3" /> <span className="hidden sm:inline">Back to site</span><span className="sm:hidden">Back</span>
          </Link>
        </nav>

        {/* Center Form Content - Adjusted spacing for mobile fits */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 md:px-6 pb-4 md:pb-8">
          <div className="w-full max-w-[380px] md:max-w-[400px]">
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-left mb-4 md:mb-8"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mb-3 md:mb-6 shadow-sm">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 mb-1 md:mb-3">
                Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Future.</span>
              </h1>
              <p className="text-slate-500 text-[13px] md:text-[15px] font-medium leading-snug">
                Create your account and build meeting intelligence in seconds.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <CustomSignUp />
              
              <div className="mt-8 text-center">
                <p className="text-slate-500 text-[14px]">
                  Already have an account?{" "}
                  <Link href="/sign-in" className="text-indigo-600 hover:text-indigo-700 font-bold">
                    Sign in
                  </Link>
                </p>
              </div>
            </motion.div>

            {/* Trust Badges - Tightened margins for mobile */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-4 md:mt-8 flex flex-wrap items-center gap-4 md:gap-6 pt-4 md:pt-6 border-t border-slate-100"
            >
              <div className="flex items-center gap-1.5 md:gap-2 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-500" />
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">Data Sovereign</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 text-slate-400">
                <Code2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-500" />
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">API Ready</span>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* ================= RIGHT PANEL (SHOWCASE) ================= */}
      {/* This remains exactly the same as it handles desktop beautifully */}
      <div className="hidden lg:flex flex-1 bg-slate-950 relative items-center justify-center p-12 overflow-hidden border-l border-slate-800">
        
        {/* Animated Background Gradients */}
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-indigo-600/20 via-blue-500/10 to-transparent opacity-60" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />

        {/* Floating UI Composition */}
        <div className="relative z-10 w-full max-w-lg">
          
          {/* Main Glass Terminal Window */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-slate-900/60 backdrop-blur-2xl border border-slate-700/50 rounded-2xl shadow-[0_0_50px_rgba(79,70,229,0.15)] overflow-hidden relative"
          >
            {/* Terminal Header */}
            <div className="bg-slate-800/50 border-b border-slate-700/50 px-4 py-3 flex items-center justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-600" />
                <div className="w-3 h-3 rounded-full bg-slate-600" />
                <div className="w-3 h-3 rounded-full bg-slate-600" />
              </div>
              <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px] bg-slate-900/50 px-3 py-1 rounded-md border border-slate-700/50">
                <Terminal className="w-3 h-3" /> webhook-listener.ts
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-6 font-mono text-[13px] leading-relaxed overflow-x-auto">
              <div className="flex gap-4">
                <span className="text-slate-600 select-none">1</span>
                <span><span className="text-blue-400">import</span> <span className="text-slate-300">{'{'} ZapBot {'}'}</span> <span className="text-blue-400">from</span> <span className="text-emerald-400">'@zapbot/node'</span><span className="text-slate-400">;</span></span>
              </div>
              <div className="flex gap-4">
                <span className="text-slate-600 select-none">2</span>
              </div>
              <div className="flex gap-4">
                <span className="text-slate-600 select-none">3</span>
                <span><span className="text-purple-400">const</span> <span className="text-blue-300">client</span> <span className="text-purple-400">=</span> <span className="text-blue-400">new</span> <span className="text-amber-300">ZapBot</span><span className="text-slate-300">(process.env.API_KEY);</span></span>
              </div>
              <div className="flex gap-4">
                <span className="text-slate-600 select-none">4</span>
              </div>
              <div className="flex gap-4">
                <span className="text-slate-600 select-none">5</span>
                <span><span className="text-blue-300">client</span><span className="text-slate-300">.</span><span className="text-amber-300">on</span><span className="text-slate-300">(</span><span className="text-emerald-400">'meeting.ended'</span><span className="text-slate-300">, </span><span className="text-blue-400">async</span> <span className="text-slate-300">(</span><span className="text-orange-300">event</span><span className="text-slate-300">) </span><span className="text-purple-400">={'>'}</span> <span className="text-slate-300">{'{'}</span></span>
              </div>
              <div className="flex gap-4">
                <span className="text-slate-600 select-none">6</span>
                <span><span className="text-slate-300 ml-4">  </span><span className="text-purple-400">const</span> <span className="text-blue-300">summary</span> <span className="text-purple-400">=</span> <span className="text-blue-400">await</span> <span className="text-orange-300">event</span><span className="text-slate-300">.</span><span className="text-amber-300">generateSummary</span><span className="text-slate-300">();</span></span>
              </div>
              <div className="flex gap-4">
                <span className="text-slate-600 select-none">7</span>
                <span><span className="text-slate-300 ml-4">  </span><span className="text-purple-400">const</span> <span className="text-blue-300">tickets</span> <span className="text-purple-400">=</span> <span className="text-blue-400">await</span> <span className="text-orange-300">event</span><span className="text-slate-300">.</span><span className="text-amber-300">extractJiraTickets</span><span className="text-slate-300">();</span></span>
              </div>
              <div className="flex gap-4">
                <span className="text-slate-600 select-none">8</span>
              </div>
              <div className="flex gap-4">
                <span className="text-slate-600 select-none">9</span>
                <span><span className="text-slate-300 ml-4">  </span><span className="text-slate-500">// Auto-push to project management</span></span>
              </div>
              <div className="flex gap-4">
                <span className="text-slate-600 select-none">10</span>
                <span><span className="text-slate-300 ml-4"> </span><span className="text-blue-400">await</span> <span className="text-blue-300">jira</span><span className="text-slate-300">.</span><span className="text-amber-300">bulkCreate</span><span className="text-slate-300">(</span><span className="text-blue-300">tickets</span><span className="text-slate-300">);</span></span>
              </div>
              <div className="flex gap-4">
                <span className="text-slate-600 select-none">11</span>
                <span className="text-slate-300">{'}'});</span>
              </div>
            </div>
          </motion.div>

          {/* Floating Integration Badge 1 */}
          <motion.div 
            initial={{ opacity: 0, x: -20, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-12 -left-8 md:-left-12 bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl shadow-xl flex items-center gap-3 z-20"
          >
             <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
             <span className="text-[11px] font-mono text-slate-300">200 OK</span>
          </motion.div>
          
          {/* Floating Integration Badge 2 */}
          <motion.div 
            initial={{ opacity: 0, x: 20, y: -10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -bottom-6 -right-4 md:-right-8 bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl flex items-center gap-3 z-20"
          >
             <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
                <CheckCircle2 className="w-4 h-4" />
             </div>
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Tickets Created</p>
                <p className="text-[12px] font-medium text-slate-200">14 issues synced</p>
             </div>
          </motion.div>

        </div>
      </div>

    </div>
  );
}