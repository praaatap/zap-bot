"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  CheckCheck, MessageCircleCode, Sparkles, Zap,
  Video, Users, ShieldCheck, Globe, Activity,
  Menu, ArrowRight, Bot, Mic, CheckCircle2, Circle, Send, 
  Twitter, Linkedin, Github, TerminalSquare, Code2, 
  LayoutGrid, Search, Lock, Database, MessageSquare, Quote
} from "lucide-react";

// --- ANIMATION VARIANTS ---
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};
const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const bentoItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

// --- DEMO DATA ---
const DEMO_LINES = [
  { speaker: "Sarah Jenkins",  text: "Alright, let's kick off the Q3 planning session.", time: "09:01:12", conf: 0.99 },
  { speaker: "David Chen",     text: "We need to finalise the budget by end of week.",   time: "09:02:04", tag: "ACTION", conf: 0.94 },
  { speaker: "Sarah Jenkins",  text: "Launch has been moved to Q3, confirmed by leadership.", time: "09:03:15", tag: "DECISION", conf: 0.98 },
  { speaker: "Elena R.",       text: "I'll send the updated roadmap to the team by Thursday.", time: "09:04:22", tag: "ACTION", conf: 0.91 },
  { speaker: "David Chen",     text: "Engineering is on track — no blockers right now.",  time: "09:05:40", conf: 0.96 },
  { speaker: "Sarah Jenkins",  text: "Let's schedule a follow-up for next Monday at 10 AM.", time: "09:06:11", tag: "ACTION", conf: 0.97 },
];

const INITIAL_ACTIONS = [
  { text: "Finalise Q3 budget",              assignee: "David C.",  done: false, id: "TSK-842" },
  { text: "Send updated roadmap to team",    assignee: "Elena R.",  done: false, id: "TSK-843" },
  { text: "Schedule follow-up for Monday",   assignee: "Sarah J.",  done: false, id: "TSK-844" },
];

// --- NAVBAR ---
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm" 
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-to-b from-blue-500 to-blue-600 p-1.5 rounded-lg shadow-sm shadow-blue-600/20 border border-blue-400/20">
            <Zap className="w-4 h-4 text-white fill-current" />
          </div>
          <span className="text-[17px] font-bold text-slate-900 tracking-tight">ZapBot</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-[14px] font-medium text-slate-500 hover:text-slate-900 transition-colors">Platform</Link>
          <Link href="#demo"     className="text-[14px] font-medium text-slate-500 hover:text-slate-900 transition-colors">Solutions</Link>
          <Link href="#pricing"  className="text-[14px] font-medium text-slate-500 hover:text-slate-900 transition-colors">Pricing</Link>
          <Link href="#api"      className="text-[14px] font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5">
            <Code2 className="w-4 h-4"/> Developers
          </Link>
        </div>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-5">
          <Link href="/login" className="text-[14px] font-medium text-slate-500 hover:text-slate-900 transition-colors">Sign In</Link>
          <Link href="/sign-up" className="relative group overflow-hidden bg-slate-900 text-white px-4 py-2 rounded-lg text-[13px] font-semibold shadow-sm transition-all hover:bg-slate-800 hover:shadow-md hover:-translate-y-[0.5px]">
            <span className="relative z-10 flex items-center gap-1.5">Get Started</span>
            {/* Subtle sheen effect on hover */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-slate-600 hover:text-slate-900 transition-colors p-2 rounded-lg hover:bg-slate-100">
          <Menu className="w-5 h-5"/>
        </button>
      </div>
    </nav>
  );
};

// --- INTERACTIVE WIDGET ---
const MeetingWidget = () => {
  const [activeTab, setActiveTab]       = useState<"transcript" | "actions" | "logs">("transcript");
  const [visibleLines, setVisibleLines] = useState<typeof DEMO_LINES>([]);
  const [actions, setActions]           = useState(INITIAL_ACTIONS);
  const [isLive, setIsLive]             = useState(true);
  const [lineIndex, setLineIndex]       = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLive) return;
    if (lineIndex >= DEMO_LINES.length) {
      const t = setTimeout(() => { setVisibleLines([]); setLineIndex(0); }, 5000);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      const line = DEMO_LINES[lineIndex];
      if (!line) return;
      setVisibleLines(p => [...p, line]);
      setLineIndex(p => p + 1);
    }, 2000);
    return () => clearTimeout(t);
  }, [lineIndex, isLive]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [visibleLines, activeTab]);

  const tabs = [
    { id: "transcript", label: "Transcript", icon: Mic },
    { id: "actions",    label: "Entities", icon: Code2 },
    { id: "logs",       label: "Raw Data", icon: TerminalSquare },
  ];

  return (
    <div className="bg-white rounded-[24px] border border-slate-200/80 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.05)] overflow-hidden font-sans ring-1 ring-slate-900/5">
      
      {/* Top Bar */}
      <div className="bg-slate-50/50 border-b border-slate-200/80 px-4 py-3 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300 hover:bg-red-400 transition-colors cursor-pointer" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300 hover:bg-amber-400 transition-colors cursor-pointer" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300 hover:bg-emerald-400 transition-colors cursor-pointer" />
          </div>
          <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] font-medium text-slate-600">Q3 Planning Sync</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-400 hidden sm:block">ws://connected</span>
            <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-2 py-1 rounded-md text-blue-700">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wide">Syncing</span>
            </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row h-[520px]">
        {/* LEFT: Video Area */}
        <div className="flex-1 p-5 flex flex-col gap-4 bg-slate-50 relative">
          <div className="grid grid-cols-2 gap-4 flex-1">
            <div className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden shadow-sm group">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center border-2 border-blue-100 transition-transform group-hover:scale-105">
                <span className="text-xl font-bold text-blue-600">SJ</span>
              </div>
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-semibold text-slate-700 shadow-sm border border-slate-100">
                Sarah Jenkins
              </div>
              {/* Speaking indicator */}
              <div className="absolute top-4 right-4 flex gap-0.5 items-end h-3">
                {[1, 3, 2].map((h, i) => (
                  <div key={i} className="w-1 bg-blue-500 rounded-full animate-pulse" style={{ height: h * 4, animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
              <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                <span className="text-xl font-bold text-slate-400">DC</span>
              </div>
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-semibold text-slate-700 shadow-sm border border-slate-100">
                David Chen
              </div>
              <Mic className="absolute top-4 right-4 w-4 h-4 text-slate-300" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-2 rounded-xl flex items-center justify-between shadow-sm">
            <button onClick={() => setIsLive(v => !v)} className={`px-4 py-2 rounded-lg text-[12px] font-bold transition-all flex items-center gap-2 ${isLive ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20"}`}>
                <Bot className="w-4 h-4" /> {isLive ? "Pause Bot" : "Resume Bot"}
            </button>
            <div className="flex items-center gap-1">
                <button className="p-2 border border-transparent rounded-lg hover:bg-slate-100 text-slate-500"><Users className="w-4 h-4"/></button>
                <button className="p-2 border border-transparent rounded-lg hover:bg-slate-100 text-slate-500"><LayoutGrid className="w-4 h-4"/></button>
            </div>
          </div>
        </div>

        {/* RIGHT: Data Panel */}
        <div className="w-full md:w-[400px] border-t md:border-t-0 md:border-l border-slate-200/80 flex flex-col bg-white">
          
          {/* Animated Tabs */}
          <div className="flex p-2 gap-1 border-b border-slate-100 bg-slate-50/50">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex-1 flex items-center justify-center gap-2 py-2 text-[12px] font-semibold rounded-md transition-colors z-10 ${
                  activeTab === tab.id ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white rounded-md shadow-sm border border-slate-200"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    style={{ zIndex: -1 }}
                  />
                )}
                <tab.icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-hidden flex flex-col bg-white relative">
            <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />

            <AnimatePresence mode="wait">
              {/* TRANSCRIPT */}
              {activeTab === "transcript" && (
                <motion.div key="transcript" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto p-5 space-y-5" ref={scrollRef}>
                  {visibleLines.map((line, i) => (
                    <div key={i} className="flex flex-col gap-1.5 group">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                          {line.speaker}
                          <span className="text-[10px] font-mono text-slate-300 font-normal opacity-0 group-hover:opacity-100 transition-opacity">{line.time}</span>
                        </span>
                        {line.tag && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide ${
                            line.tag === "DECISION" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"
                          }`}>
                            {line.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-[14px] text-slate-600 leading-relaxed">
                        {line.text}
                      </p>
                    </div>
                  ))}
                  {isLive && visibleLines.length > 0 && lineIndex < DEMO_LINES.length && (
                    <div className="flex items-center gap-2 pt-2">
                      <div className="flex gap-1">
                        {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{animationDelay: `${i*150}ms`}}/>)}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ACTIONS */}
              {activeTab === "actions" && (
                <motion.div key="actions" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex-1 p-5 flex flex-col gap-3">
                  {actions.map((action, i) => (
                    <motion.div key={i} whileHover={{ y: -1 }} className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                        action.done ? "bg-slate-50 border-slate-200 opacity-60" : "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300"
                      }`}
                      onClick={() => setActions(p => p.map((a, idx) => idx === i ? { ...a, done: !a.done } : a))}
                    >
                      <div className={`mt-0.5 ${action.done ? "text-slate-400" : "text-blue-600"}`}>
                        {action.done ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[11px] font-mono font-medium text-slate-500">{action.id}</span>
                          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{action.assignee}</span>
                        </div>
                        <p className={`text-[13px] font-medium leading-snug ${action.done ? "line-through text-slate-500" : "text-slate-900"}`}>
                          {action.text}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  <button className="mt-auto w-full py-3 rounded-lg border border-slate-200 bg-white shadow-sm text-[12px] font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group">
                    <Send className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" /> Push to Linear
                  </button>
                </motion.div>
              )}

              {/* LOGS */}
              {activeTab === "logs" && (
                <motion.div key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 bg-slate-900 p-5 font-mono text-[11px] text-slate-300 overflow-y-auto leading-relaxed" ref={logRef}>
                  {visibleLines.map((line, i) => (
                    <div key={i} className="mb-4">
                      <span className="text-slate-500">[{line.time}]</span>{" "}
                      <span className="text-blue-400">INFO</span>{" "}
                      <span className="text-emerald-400">EVENT_EMITTED</span><br />
                      <div className="pl-4 mt-1">
                        <span className="text-pink-400">speaker:</span> "{line.speaker}"<br />
                        <span className="text-pink-400">confidence:</span> {line.conf}<br />
                        {line.tag && <><span className="text-pink-400">extracted_intent:</span> "{line.tag}"<br /></>}
                      </div>
                    </div>
                  ))}
                  <div className="animate-pulse w-2 h-3 bg-slate-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [annualBilling, setAnnualBilling] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200 selection:text-blue-900 overflow-x-hidden relative">
      
      {/* SaaS Premium Background Gradient */}
      <div className="absolute top-0 inset-x-0 h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/50 via-white to-slate-50 -z-10" />

      <Navbar />

      <main className="relative pt-32">
        {/* --- HERO SECTION --- */}
        <section className="max-w-7xl mx-auto px-6 pb-20 flex flex-col items-center text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="w-full max-w-4xl mx-auto">
            
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3 py-1.5 mb-8 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-[12px] font-semibold text-slate-700">Introducing ZapBot 2.0</span>
              <div className="w-px h-3 bg-slate-300 mx-1" />
              <span className="text-[12px] font-semibold text-blue-600 flex items-center gap-1">Read the launch post <ArrowRight className="w-3 h-3"/></span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.05]">
              Capture meetings. <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Automate the rest.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              The AI copilot that acts like a senior operator. It joins your calls, structures unstructured dialogue, and creates tickets in your issue tracker.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/sign-up" className="w-full sm:w-auto bg-slate-900 text-white px-8 py-3.5 rounded-xl font-semibold text-[15px] hover:bg-slate-800 transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] flex items-center justify-center gap-2">
                Get Started for Free
              </Link>
              <Link href="#demo" className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 px-8 py-3.5 rounded-xl font-semibold text-[15px] hover:bg-slate-50 transition-all shadow-sm">
                Book a Demo
              </Link>
            </motion.div>
            
            {/* Trusted By Strip */}
            <motion.div variants={fadeUp} className="pt-8 border-t border-slate-200/60 max-w-3xl mx-auto">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-6">Powering innovative teams worldwide</p>
              <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale">
                <span className="text-xl font-black tracking-tighter">acme corp</span>
                <span className="text-xl font-black tracking-tighter">GLOBAL</span>
                <span className="text-xl font-black tracking-tighter">VERTEX</span>
                <span className="text-xl font-black tracking-tighter">quant</span>
              </div>
            </motion.div>

          </motion.div>
        </section>

        {/* --- WIDGET SHOWCASE --- */}
        <section id="demo" className="max-w-5xl mx-auto px-6 pb-24">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="relative">
            <MeetingWidget />
          </motion.div>
        </section>

        {/* --- HOW IT WORKS (NEW SECTION) --- */}
        <section className="max-w-7xl mx-auto px-6 py-24 border-t border-slate-200/60">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              From conversation to completion.
            </h2>
            <p className="text-slate-500 text-lg">ZapBot operates entirely in the background. You talk, it works.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-blue-100 via-blue-200 to-purple-100 z-0" />

            {[
              { step: "01", title: "Connect Calendar", desc: "Link your Google Workspace or Office 365. ZapBot detects meetings automatically.", icon: Globe },
              { step: "02", title: "AI Transcription", desc: "The bot joins your call, recording and structuring dialogue in real-time.", icon: Mic },
              { step: "03", title: "Automated Routing", desc: "Action items and summaries are instantly pushed to Notion, Jira, or Linear.", icon: Send }
            ].map((s, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                <div className="w-24 h-24 bg-white rounded-full border-[6px] border-slate-50 flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] mb-6 group-hover:scale-105 transition-transform duration-500">
                  <s.icon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-[12px] font-bold text-blue-600 mb-2 uppercase tracking-widest">Step {s.step}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-slate-500 leading-relaxed px-4">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* --- BENTO GRID FEATURES (UPGRADED) --- */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-32 border-t border-slate-200/60 overflow-hidden bg-white">
          <div className="text-center mb-20 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-5">
              Everything you need to move faster.
            </h2>
            <p className="text-slate-500 text-lg font-medium leading-relaxed">
              We've stripped away the noise. High-fidelity meeting capture, enterprise security, and blazing-fast search.
            </p>
          </div>

          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[auto] md:auto-rows-[320px]"
          >
            
            {/* CARD 1: Universal Sync (Wide) */}
            <motion.div variants={bentoItem} className="col-span-1 md:col-span-2 rounded-[2rem] border border-slate-200/80 bg-white shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-200 transition-all duration-500 overflow-hidden group relative flex flex-col md:flex-row">
              <div className="p-8 md:p-10 flex-1 flex flex-col justify-center z-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 border border-blue-100 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Universal Platform Sync</h3>
                <p className="text-slate-500 font-medium leading-relaxed">ZapBot natively joins Google Meet, Zoom, and MS Teams. No plugins required. It quietly structures data in the background.</p>
              </div>
              <div className="flex-1 bg-slate-50 relative min-h-[200px] flex items-center justify-center border-t md:border-t-0 md:border-l border-slate-100 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />
                <div className="relative z-20 flex items-center gap-4 sm:gap-6">
                  <div className="flex flex-col gap-4">
                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-blue-500"><Video className="w-4 h-4"/></motion.div>
                    <motion.div animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-purple-500"><MessageSquare className="w-4 h-4"/></motion.div>
                  </div>
                  <div className="h-px w-12 sm:w-16 bg-slate-300 relative">
                    <motion.div animate={{ x: [0, 48] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="absolute top-1/2 -translate-y-1/2 left-0 w-2 h-2 rounded-full bg-blue-500" />
                  </div>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30 flex items-center justify-center text-white ring-4 ring-blue-50">
                    <Database className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CARD 2: SOC2 (Square) */}
            <motion.div variants={bentoItem} className="col-span-1 rounded-[2rem] border border-slate-200/80 bg-white shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 hover:border-emerald-200 transition-all duration-500 overflow-hidden group relative flex flex-col">
              <div className="h-40 bg-emerald-50/40 border-b border-slate-100 relative flex items-center justify-center overflow-hidden">
                 <div className="absolute inset-0 flex items-center justify-center">
                   <motion.div animate={{ scale: [1, 2, 2], opacity: [0.5, 0, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }} className="absolute w-16 h-16 rounded-full border-2 border-emerald-400" />
                   <motion.div animate={{ scale: [1, 2.5, 2.5], opacity: [0.3, 0, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: "easeOut" }} className="absolute w-16 h-16 rounded-full border-2 border-emerald-300" />
                 </div>
                 <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600 relative z-10 border border-emerald-100 group-hover:scale-110 transition-transform duration-500">
                   <Lock className="w-6 h-6" />
                 </div>
              </div>
              <div className="p-8 flex-1 flex flex-col justify-end">
                <h3 className="text-xl font-bold text-slate-900 mb-2">SOC2 Type II</h3>
                <p className="text-slate-500 text-[15px] font-medium leading-relaxed">Enterprise-grade security. We never train foundational models on your data.</p>
              </div>
            </motion.div>

            {/* CARD 3: Developer API (Square) */}
            <motion.div variants={bentoItem} className="col-span-1 rounded-[2rem] border border-slate-200/80 bg-white shadow-sm hover:shadow-xl hover:shadow-purple-900/5 hover:border-purple-200 transition-all duration-500 overflow-hidden group relative flex flex-col">
              <div className="h-40 bg-slate-900 p-5 relative overflow-hidden flex items-center justify-center">
                 <div className="absolute top-3 left-4 flex gap-1.5">
                   <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                   <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                   <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                 </div>
                 <div className="font-mono text-[11px] sm:text-[12px] leading-relaxed text-emerald-400 bg-black/40 p-3 rounded-lg border border-white/10 w-full mt-4">
                   <span className="text-purple-400">POST</span> /api/v1/sync<br/>
                   <span className="text-slate-500">{'{'}</span><br/>
                   <span className="text-blue-300">  "id":</span> "mtg_8x9",<br/>
                   <span className="text-blue-300">  "tasks":</span> <span className="text-amber-300">true</span><br/>
                   <span className="text-slate-500">{'}'}</span>
                 </div>
              </div>
              <div className="p-8 flex-1 flex flex-col justify-end">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Developer API</h3>
                <p className="text-slate-500 text-[15px] font-medium leading-relaxed">Webhooks and REST endpoints to route meeting artifacts anywhere.</p>
              </div>
            </motion.div>

            {/* CARD 4: Semantic RAG Search (Wide) */}
            <motion.div variants={bentoItem} className="col-span-1 md:col-span-2 rounded-[2rem] border border-slate-200/80 bg-white shadow-sm hover:shadow-xl hover:shadow-amber-900/5 hover:border-amber-200 transition-all duration-500 overflow-hidden group relative flex flex-col md:flex-row-reverse">
              <div className="p-8 md:p-10 flex-1 flex flex-col justify-center z-10">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6 border border-amber-100 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                  <MessageCircleCode className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Semantic RAG Search</h3>
                <p className="text-slate-500 font-medium leading-relaxed">Query your entire meeting history. "What did marketing say about the Q3 budget?" ZapBot finds the exact timestamp instantly.</p>
              </div>
              <div className="flex-1 bg-slate-50 min-h-[200px] relative flex items-center justify-center border-t md:border-t-0 md:border-r border-slate-100 p-6 sm:p-8">
                 <div className="w-full max-w-sm bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden">
                   <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center gap-3">
                     <Search className="w-4 h-4 text-amber-500" />
                     <span className="text-[13px] font-medium text-slate-400 flex-1">Q3 Budget...</span>
                     <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-0.5 h-4 bg-amber-500" />
                   </div>
                   <div className="p-4 bg-slate-50/50 flex flex-col gap-3">
                     <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-sm flex gap-3 items-center">
                        <div className="w-7 h-7 rounded bg-purple-50 text-purple-600 flex items-center justify-center text-[9px] font-bold border border-purple-100">12:04</div>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                           <motion.div initial={{ width: 0 }} whileInView={{ width: "70%" }} transition={{ delay: 0.5, duration: 1 }} className="h-full bg-amber-400" />
                        </div>
                     </div>
                   </div>
                 </div>
              </div>
            </motion.div>

          </motion.div>
        </section>

        {/* --- TESTIMONIALS (NEW SECTION) --- */}
        <section className="bg-slate-50 py-24 border-t border-b border-slate-200/60">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">Loved by engineering & product teams.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { text: "ZapBot entirely eliminated our post-meeting admin. The RAG query speed is genuinely unreal.", author: "Sarah Jenkins", role: "VP Product at Vertex" },
                { text: "Context switching is gone. I just ask the bot — it remembers every single meeting.", author: "Elena Rodriguez", role: "Chief of Staff at Acme" },
                { text: "It changed how our eng team operates. 50% less time in syncs, more time shipping code.", author: "David Marcus", role: "CTO at Quant" },
              ].map((t, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <Quote className="w-8 h-8 text-blue-100 mb-6" />
                  <p className="text-slate-700 text-[15px] leading-relaxed mb-6 font-medium">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">
                      {t.author.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-900">{t.author}</p>
                      <p className="text-[12px] text-slate-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- PRICING (UPGRADED) --- */}
        <section id="pricing" className="max-w-7xl mx-auto px-6 py-32 bg-white">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">Predictable pricing.</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto mb-10">Start for free, upgrade when you need to scale your team's velocity.</p>
            
            {/* Functional Billing Toggle */}
            <div className="inline-flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
               <button 
                  onClick={() => setAnnualBilling(false)}
                  className={`px-6 py-2 rounded-lg text-[13px] font-bold transition-all ${!annualBilling ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"}`}
               >
                 Monthly
               </button>
               <button 
                  onClick={() => setAnnualBilling(true)}
                  className={`px-6 py-2 rounded-lg text-[13px] font-bold transition-all flex items-center gap-2 ${annualBilling ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"}`}
               >
                 Annually <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider">Save 20%</span>
               </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
            {/* Starter */}
            <div className="p-8 rounded-[2rem] border border-slate-200 bg-white shadow-sm flex flex-col">
              <p className="text-[14px] font-bold text-slate-900 mb-2">Starter</p>
              <p className="text-slate-500 text-[13px] mb-6 h-10">Perfect for individuals wanting to try AI meetings.</p>
              <div className="mb-8 flex items-baseline gap-1"><span className="text-5xl font-bold text-slate-900">$0</span> <span className="text-slate-500 font-medium">/mo</span></div>
              <button className="w-full py-3 rounded-xl border-2 border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-colors mb-8">Start Free</button>
              <ul className="space-y-4 text-[14px] text-slate-600 font-medium flex-1">
                <li className="flex items-center gap-3"><CheckCheck className="w-5 h-5 text-slate-300" /> 5 meetings per month</li>
                <li className="flex items-center gap-3"><CheckCheck className="w-5 h-5 text-slate-300" /> Standard transcription</li>
                <li className="flex items-center gap-3"><CheckCheck className="w-5 h-5 text-slate-300" /> 7-day history</li>
              </ul>
            </div>

            {/* Pro - Elevated & Glowing */}
            <div className="relative p-8 rounded-[2rem] bg-slate-900 shadow-[0_20px_60px_-15px_rgba(59,130,246,0.3)] flex flex-col transform md:-translate-y-4 border border-slate-800">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 rounded-t-[2rem]" />
              <div className="absolute top-0 inset-x-0 h-[200px] bg-gradient-to-b from-blue-500/20 to-transparent pointer-events-none rounded-t-[2rem]" />
              
              <div className="flex justify-between items-center mb-2 relative z-10">
                 <p className="text-[14px] font-bold text-white">Pro</p>
                 <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-blue-500/30">Popular</span>
              </div>
              <p className="text-slate-400 text-[13px] mb-6 h-10 relative z-10">For operators and teams who need deep automation.</p>
              <div className="mb-8 flex items-baseline gap-1 relative z-10">
                <span className="text-5xl font-bold text-white">${annualBilling ? "24" : "29"}</span> 
                <span className="text-slate-400 font-medium">/mo</span>
              </div>
              <button className="w-full py-3 rounded-xl bg-white font-bold text-slate-900 hover:bg-slate-100 transition-colors mb-8 shadow-[0_0_20px_rgba(255,255,255,0.1)] relative z-10">Upgrade to Pro</button>
              <ul className="space-y-4 text-[14px] text-slate-300 font-medium flex-1 relative z-10">
                <li className="flex items-center gap-3"><CheckCheck className="w-5 h-5 text-blue-400" /> Unlimited meetings</li>
                <li className="flex items-center gap-3"><CheckCheck className="w-5 h-5 text-blue-400" /> AI Task Extraction</li>
                <li className="flex items-center gap-3"><CheckCheck className="w-5 h-5 text-blue-400" /> Push to Linear/Jira</li>
                <li className="flex items-center gap-3"><CheckCheck className="w-5 h-5 text-blue-400" /> Unlimited history</li>
              </ul>
            </div>

            {/* Enterprise */}
            <div className="p-8 rounded-[2rem] border border-slate-200 bg-white shadow-sm flex flex-col">
              <p className="text-[14px] font-bold text-slate-900 mb-2">Enterprise</p>
              <p className="text-slate-500 text-[13px] mb-6 h-10">For organizations demanding security and scale.</p>
              <div className="mb-8 flex items-baseline gap-1"><span className="text-5xl font-bold text-slate-900">Custom</span></div>
              <button className="w-full py-3 rounded-xl border-2 border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-colors mb-8">Contact Sales</button>
              <ul className="space-y-4 text-[14px] text-slate-600 font-medium flex-1">
                <li className="flex items-center gap-3"><CheckCheck className="w-5 h-5 text-slate-300" /> SSO & SAML</li>
                <li className="flex items-center gap-3"><CheckCheck className="w-5 h-5 text-slate-300" /> Dedicated VPC</li>
                <li className="flex items-center gap-3"><CheckCheck className="w-5 h-5 text-slate-300" /> Custom integrations</li>
              </ul>
            </div>
          </div>
        </section>

       
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-16">
            <div className="col-span-2 md:col-span-2">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                  <Zap className="w-4 h-4 text-white fill-current" />
                </div>
                <span className="text-lg font-bold text-slate-900 tracking-tight">ZapBot</span>
              </div>
              <p className="text-slate-500 text-[14px] leading-relaxed mb-6 max-w-xs font-medium">
                The AI meeting layer for modern teams. Capture, structure, and automate your workflow.
              </p>
            </div>
            
            <div className="col-span-1">
              <p className="text-[13px] font-bold text-slate-900 mb-5 uppercase tracking-wider">Product</p>
              <ul className="space-y-4 text-[14px] font-medium">
                <li><Link href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Features</Link></li>
                <li><Link href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Integrations</Link></li>
                <li><Link href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Pricing</Link></li>
              </ul>
            </div>

            <div className="col-span-1">
              <p className="text-[13px] font-bold text-slate-900 mb-5 uppercase tracking-wider">Developers</p>
              <ul className="space-y-4 text-[14px] font-medium">
                <li><Link href="#" className="text-slate-500 hover:text-blue-600 transition-colors">API Reference</Link></li>
                <li><Link href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Documentation</Link></li>
                <li><Link href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Webhooks</Link></li>
              </ul>
            </div>

            <div className="col-span-1">
              <p className="text-[13px] font-bold text-slate-900 mb-5 uppercase tracking-wider">Company</p>
              <ul className="space-y-4 text-[14px] font-medium">
                <li><Link href="#" className="text-slate-500 hover:text-blue-600 transition-colors">About Us</Link></li>
                <li><Link href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Careers</Link></li>
                <li><Link href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[13px] font-semibold text-slate-500">All systems operational</p>
            </div>
            <p className="text-[13px] font-medium text-slate-400">© 2026 ZapBot Inc. All rights reserved.</p>
            <div className="flex items-center gap-5">
              <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors"><Github className="w-4 h-4" /></a>
              <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors"><Linkedin className="w-4 h-4" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}