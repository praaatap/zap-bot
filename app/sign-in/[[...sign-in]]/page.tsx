"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Zap, ArrowLeft, Quote, Activity, CheckCircle2 } from "lucide-react";
import { CustomSignIn } from "@/components/auth/CustomSignIn";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex w-full font-sans overflow-hidden bg-white">
      
      {/* ================= LEFT PANEL (AUTH FORM) ================= */}
      <div className="flex-1 flex flex-col relative z-10 lg:max-w-[55%] xl:max-w-[50%] w-full">
        
        {/* Subtle Background Mesh for Left Side */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 inset-x-0 h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/80 via-white to-transparent" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        {/* Top Navigation */}
        <nav className="p-8 flex justify-between items-center w-full">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="bg-gradient-to-b from-blue-500 to-blue-600 p-1.5 rounded-lg shadow-sm shadow-blue-600/20 border border-blue-400/20 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="text-[18px] font-bold tracking-tight text-slate-900">ZapBot</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm hover:shadow-md">
            <ArrowLeft className="w-3 h-3" /> Back to site
          </Link>
        </nav>

        {/* Center Form Content */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
          <div className="w-full max-w-[400px]">
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-left mb-8"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 mb-6 shadow-sm">
                <Sparkles className="w-6 h-6" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-3">
                Welcome back
              </h1>
              <p className="text-slate-500 text-[15px] font-medium">
                Sign in to continue your high-velocity meeting workflow.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <CustomSignIn />
              
              <div className="mt-8 text-center">
                <p className="text-slate-500 text-[14px]">
                  Don't have an account?{" "}
                  <Link href="/sign-up" className="text-blue-600 hover:text-blue-700 font-bold">
                    Sign up
                  </Link>
                </p>
              </div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-10 flex flex-wrap items-center gap-6 pt-8 border-t border-slate-100"
            >
              <div className="flex items-center gap-2 text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest">SOC2 Certified</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Zap className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest">End-to-End Encryption</span>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* ================= RIGHT PANEL (SHOWCASE) ================= */}
      <div className="hidden lg:flex flex-1 bg-slate-900 relative items-center justify-center p-12 overflow-hidden border-l border-slate-800">
        
        {/* Animated Background Gradients */}
        <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-blue-500/20 via-indigo-500/10 to-transparent opacity-50" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/4 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px]" />
        
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />

        {/* Floating UI Composition */}
        <div className="relative z-10 w-full max-w-lg">
          
          {/* Main Glass Testimonial Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-slate-800/40 backdrop-blur-2xl border border-slate-700/50 p-8 rounded-[2rem] shadow-[0_0_40px_rgba(37,99,235,0.1)] relative"
          >
            {/* Glowing top border accent */}
            <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
            
            <Quote className="w-10 h-10 text-blue-400/30 mb-6" />
            <p className="text-white text-lg font-medium leading-relaxed mb-8">
              "ZapBot entirely eliminated our post-meeting admin. The RAG query speed is genuinely unreal. It changed how our eng team operates."
            </p>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
                <span className="text-white font-bold text-sm">DM</span>
              </div>
              <div>
                <p className="text-[14px] font-bold text-white">David Marcus</p>
                <p className="text-[13px] text-blue-400 font-medium">CTO at Quant</p>
              </div>
            </div>
          </motion.div>

          {/* Floating UI Element (Task Extraction Mockup) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -bottom-16 -right-8 bg-slate-900 border border-slate-700 p-4 rounded-2xl shadow-2xl w-72"
          >
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Action Extracted</span>
              </div>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">Just now</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[13px] font-medium text-slate-200 leading-snug mb-1">Update Q3 Roadmap based on marketing budget</p>
                <p className="text-[11px] text-slate-500 font-mono">Assigned to: @david</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

    </div>
  );
}