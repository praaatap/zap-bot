"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, ShieldCheck, Zap, ArrowLeft, Video, 
  CheckCircle2, Mic, Users, Bot, Clock, Calendar,
  MessageSquare, BarChart3, Lock, Headphones
} from "lucide-react";
import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

// Animated audio waveform component for the mockup
const AudioWaveform = () => (
  <div className="flex items-center gap-[2px] h-4">
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        className="w-1 bg-blue-400 rounded-full"
        animate={{
          height: [4, 16, 4],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          delay: i * 0.1,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

// Floating particle background
const FloatingParticle = ({ delay, x, y }: { delay: number; x: string; y: string }) => (
  <motion.div
    className="absolute w-2 h-2 bg-indigo-500/20 rounded-full blur-sm"
    style={{ left: x, top: y }}
    animate={{
      y: [0, -20, 0],
      opacity: [0.2, 0.5, 0.2],
    }}
    transition={{
      duration: 5,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

export default function SignUpPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="h-[100dvh] flex w-full font-sans overflow-hidden bg-white">
      
      {/* ================= LEFT PANEL (AUTH FORM) ================= */}
      <div className="flex-1 flex flex-col relative z-10 lg:max-w-[55%] xl:max-w-[50%] w-full h-full overflow-y-auto">
        
        {/* Enhanced Background Mesh */}
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/60 via-white to-transparent" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          {/* Subtle noise texture overlay */}
          <div className="absolute inset-0 opacity-[0.015] [background-image:url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />
        </div>

        {/* Top Navigation - Enhanced */}
        <nav className="p-4 md:p-8 flex justify-between items-center w-full shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative bg-gradient-to-b from-blue-500 to-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20 border border-blue-400/30 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
                <Zap className="w-5 h-5 text-white fill-current" />
              </div>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">ZapBot</span>
          </Link>
          
          <Link 
            href="/" 
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> 
            <span className="hidden sm:inline">Back to site</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </nav>

        {/* Center Form Content */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 md:px-6 pb-8">
          <div className="w-full max-w-[400px]">
            
            {/* Enhanced Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-left mb-8"
            >
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 mb-6 text-xs font-bold uppercase tracking-wider"
              >
              </motion.div>

              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4 leading-[1.1]">
                Never take meeting{" "}
                <span className="relative">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
                    notes again
                  </span>
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-indigo-200 -z-10" viewBox="0 0 200 12" fill="none">
                    <path d="M0 8C50 2 150 2 200 8" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                  </svg>
                </span>
              </h1>
              
            </motion.div>

            {/* Clerk SignUp - Enhanced Styling */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full"
            >
              <SignUp 
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-none border-none p-0 bg-transparent w-full",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton: "rounded-xl border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all font-semibold text-slate-700 w-full h-11 shadow-sm",
                    socialButtonsBlockButtonText: "text-sm",
                    formButtonPrimary: "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 rounded-xl transition-all shadow-lg shadow-indigo-600/20 w-full h-11 text-sm font-semibold",
                    formFieldInput: "rounded-xl border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all w-full h-11 text-sm",
                    formFieldLabel: "text-slate-700 font-semibold text-sm ml-1 mb-1.5 block",
                    footerActionLink: "text-indigo-600 hover:text-indigo-700 font-bold",
                    dividerText: "text-slate-400 font-bold tracking-widest uppercase text-[10px]",
                    identityPreviewText: "text-sm text-slate-600",
                    identityPreviewEditButton: "text-indigo-600 font-semibold",
                    formFieldErrorText: "text-red-500 text-xs mt-1",
                    alertText: "text-red-500 text-sm",
                  }
                }}
              />
            </motion.div>

            {/* Trust Badges - Enhanced Grid */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-8 grid grid-cols-2 gap-4 pt-6 border-t border-slate-100"
            >
              <div className="flex items-center gap-2 text-slate-600">
                <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">SOC 2 Certified</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-100">
                  <Lock className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">End-to-End Encrypted</span>
              </div>
            </motion.div>

            {/* Feature Pills - Mobile Only (since right panel is hidden) */}
            <div className="lg:hidden mt-8 grid grid-cols-2 gap-3">
              {[
                { icon: Video, label: "Zoom, Meet, Teams" },
                { icon: MessageSquare, label: "Auto-Transcribe" },
                { icon: CheckCircle2, label: "Action Items" },
                { icon: BarChart3, label: "Analytics" },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-600"
                >
                  <feature.icon className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-xs font-medium">{feature.label}</span>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* ================= RIGHT PANEL (SHOWCASE) ================= */}
      <div className="hidden lg:flex flex-1 bg-slate-950 relative items-center justify-center p-12 overflow-hidden">
        
        {/* Enhanced Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-indigo-600/30 via-blue-500/10 to-transparent opacity-60" />
          <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[150px] pointer-events-none animate-pulse" />
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          {/* Floating Particles */}
          <FloatingParticle delay={0} x="20%" y="30%" />
          <FloatingParticle delay={1} x="70%" y="20%" />
          <FloatingParticle delay={2} x="40%" y="70%" />
          <FloatingParticle delay={3} x="80%" y="60%" />
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        {/* Main Mockup Container */}
        <div className="relative z-10 w-full max-w-xl">
          
          {/* Background Glow Effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-[2rem] blur-2xl" />

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-slate-900/80 backdrop-blur-3xl border border-slate-700/50 rounded-3xl shadow-[0_0_80px_rgba(79,70,229,0.2)] overflow-hidden"
          >
            {/* Glass Edge Highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
            
            {/* Header: Meeting Status */}
            <div className="p-6 border-b border-slate-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/30 blur-lg rounded-full" />
                    <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center border border-blue-400/30 shadow-lg">
                      <Video className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold text-lg">Q3 Marketing Sync</h3>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider border border-slate-700">Live</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-slate-400 text-xs">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 14:32
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-600" />
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> 4 Participants
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* ZapBot Active Badge */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75" />
                    <div className="relative w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-emerald-400 text-xs font-bold tracking-wide uppercase">ZapBot Recording</span>
                </div>
              </div>

              {/* Participant Avatars */}
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-800/50">
                <div className="flex -space-x-2">
                  {[
                    { name: "Sarah", color: "bg-purple-500", active: true },
                    { name: "David", color: "bg-blue-500", active: true },
                    { name: "Mike", color: "bg-emerald-500", active: false },
                    { name: "Emma", color: "bg-orange-500", active: false },
                  ].map((user, i) => (
                    <div key={i} className="relative group">
                      <div className={`w-8 h-8 rounded-full ${user.color} border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold`}>
                        {user.name[0]}
                      </div>
                      {user.active && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-slate-900 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span>2 speaking</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transcript Area */}
            <div className="p-6 space-y-4 max-h-[320px] overflow-hidden relative">
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none z-10" />
              
              <AnimatePresence>
                {mounted && (
                  <>
                    {/* Message 1 */}
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 text-[10px] font-bold">
                            S
                          </div>
                          <span className="text-slate-400 text-xs font-medium">Sarah (Design Lead)</span>
                        </div>
                        <span className="text-slate-600 text-[10px]">2m ago</span>
                      </div>
                      <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/30 text-slate-300 text-sm leading-relaxed backdrop-blur-sm group-hover:border-slate-700/50 transition-colors">
                        We need to finalize the ad creatives by tomorrow. David, can you handle the new copy for the landing page?
                      </div>
                    </motion.div>

                    {/* Message 2 - Currently Speaking */}
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 }}
                      className="group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300 text-[10px] font-bold">
                            D
                          </div>
                          <span className="text-blue-400 text-xs font-medium flex items-center gap-2">
                            David (Marketing)
                            <span className="flex items-center gap-1 text-[10px] text-blue-400/60">
                              <AudioWaveform />
                              Speaking...
                            </span>
                          </span>
                        </div>
                        <span className="text-slate-600 text-[10px]">Now</span>
                      </div>
                      <div className="bg-blue-500/5 p-4 rounded-2xl border border-blue-500/20 text-white text-sm leading-relaxed relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent" />
                        <span className="relative z-10">
                          Yeah, I can get that done. I'll send it over in the Slack channel by 3 PM tomorrow. Should I also prepare the email sequence?
                        </span>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* AI Action Item Popup - Enhanced */}
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.5, type: "spring", stiffness: 100 }}
                className="relative bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 p-5 rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.15)] backdrop-blur-md"
              >
                <div className="absolute -right-20 -top-20 w-40 h-40 bg-indigo-500/20 blur-3xl rounded-full" />
                <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-purple-500/10 blur-3xl rounded-full" />
                
                <div className="flex items-center gap-2 mb-3 relative z-10">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <span className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest">AI Extracted Action</span>
                  <div className="flex-1" />
                  <span className="text-[10px] text-indigo-400/60 font-mono">Just now</span>
                </div>
                
                <div className="flex items-start gap-3 relative z-10">
                  <div className="p-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-100 text-sm font-medium leading-relaxed mb-3">
                      Draft new copy for Q3 landing page and prepare email sequence
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5">
                        <Users className="w-3 h-3" />
                        @David
                      </span>
                      <span className="bg-slate-800 border border-slate-700 text-slate-400 text-[11px] px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        Tomorrow, 3:00 PM
                      </span>
                      <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        High Priority
                      </span>
                    </div>
                  </div>
                </div>

                {/* Smart Suggestions */}
                <div className="mt-4 pt-4 border-t border-indigo-500/20 flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Suggested:</span>
                  <button className="text-[11px] text-indigo-300 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-lg transition-colors border border-indigo-500/20">
                    Create Jira ticket →
                  </button>
                  <button className="text-[11px] text-indigo-300 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-lg transition-colors border border-indigo-500/20">
                    Add to Slack
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Bottom Stats Bar */}
            <div className="px-6 py-4 bg-slate-950/50 border-t border-slate-800/50 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Headphones className="w-3.5 h-3.5" />
                  AI Listening
                </span>
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5" />
                  94% Accuracy
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Recording
              </span>
            </div>
          </motion.div>

          {/* Floating Testimonial Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2, duration: 0.6 }}
            className="absolute -right-4 top-1/2 translate-x-full -translate-y-1/2 hidden xl:block"
          >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl w-64">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Sparkles key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <span className="text-white/80 text-xs font-medium">Saved 10h this week</span>
              </div>
              <p className="text-white/90 text-sm leading-relaxed mb-3">
                "ZapBot automatically created 15 action items from our 2-hour planning session. Game changer."
              </p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-orange-400" />
                <div>
                  <div className="text-white text-xs font-semibold">Alex Chen</div>
                  <div className="text-white/50 text-[10px]">VP of Product at Stripe</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

    </div>
  );
}