"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  ArrowRight, CalendarDays, ChartNoAxesCombined, CheckCheck, 
  ListTodo, MessageCircleCode, Sparkles, Timer, Zap, Activity,
  Video, MessageSquare, Kanban, Database, Users, Star, Quote, 
  ShieldCheck, Globe, ZapIcon, Cpu
} from "lucide-react";
import LandingNavbar from "@/components/LandingNavbar";
import Footer from "./components/landing/Footer";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function Home() {
  const [liveLines, setLiveLines] = useState<any[]>([]);
  const [botStatus, setBotStatus] = useState("connecting");
  const [liveMessage, setLiveMessage] = useState("Waiting for secure feed...");

  useEffect(() => {
    let mounted = true;
    async function fetchLiveTranscript() {
      try {
        const selectedBotId = window.localStorage.getItem("zapbot.liveTranscriptBotId") || "";
        const query = selectedBotId.trim() ? `?botId=${encodeURIComponent(selectedBotId.trim())}` : "";
        const response = await fetch(`/api/public/live-transcript${query}`, { cache: "no-store" });
        const payload = await response.json();
        if (!mounted) return;
        if (!response.ok || !payload.success) {
          setLiveLines([]);
          setBotStatus("offline");
          setLiveMessage(payload.message || "Live transcript unavailable.");
          return;
        }
        setLiveLines(Array.isArray(payload.lines) ? payload.lines : []);
        setBotStatus(payload.botStatus || "unknown");
      } catch {
        if (!mounted) return;
        setBotStatus("offline");
      }
    }
    fetchLiveTranscript();
    const interval = setInterval(fetchLiveTranscript, 5000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-300 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      <LandingNavbar />

      <div className="fixed inset-0 -z-10 flex items-center justify-center">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />
      </div>

      <main className="relative z-10">
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 pt-40 pb-20 flex flex-col items-center text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-4xl flex flex-col items-center">
            <motion.div variants={fadeUp} className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-cyan-300 backdrop-blur-md mb-8">
              <Zap className="w-3.5 h-3.5" />
              <span>Zap Bot OS 2.0 is now live</span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[1.05] mb-8">
              Meeting capture, <br />
              <span className="bg-clip-text text-transparent bg-linear-to-b from-cyan-300 to-indigo-500">completely automated.</span>
            </motion.h1>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4">
              <Link href="/sign-up" className="bg-white text-black px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform">Start Free</Link>
              <Link href="/dashboard" className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-xl font-bold backdrop-blur-md">View Dashboard</Link>
            </motion.div>
          </motion.div>

          {/* MACBOOK UI MOCKUP */}
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="mt-20 w-full max-w-5xl mx-auto relative">
            <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full" />
            <div className="relative rounded-t-[2rem] border-[6px] border-[#2a2a2a] bg-[#000] aspect-[16/10] shadow-2xl overflow-hidden flex flex-col z-10">
              <div className="h-10 bg-[#111] border-b border-white/10 flex items-center px-4 justify-between">
                <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500/80" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" /><div className="w-2.5 h-2.5 rounded-full bg-green-500/80" /></div>
                <div className="text-[10px] text-zinc-500 font-mono">meet.google.com/zap-bot-demo</div>
                <div className="w-10" />
              </div>
              <div className="flex-1 flex bg-[#050505]">
                <div className="flex-1 p-6 grid grid-cols-2 gap-4 relative">
                  <div className="bg-[#111] rounded-2xl border border-white/5 flex items-center justify-center"><Video className="w-10 h-10 opacity-20" /></div>
                  <div className="bg-[#111] rounded-2xl border border-white/5 flex items-center justify-center"><Users className="w-10 h-10 opacity-20" /></div>
                </div>
                <div className="w-80 bg-[#0a0a0a] border-l border-white/5 p-4 flex flex-col gap-3">
                   <div className="flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-cyan-400" /><span className="text-xs font-bold text-white">Live Intelligence</span></div>
                   <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-[11px]"> Sarah: "Launch shifted to Q3." <br/><span className="text-cyan-400 font-bold tracking-widest">DECISION DETECTED</span></div>
                </div>
              </div>
            </div>
            <div className="h-6 bg-[#2a2a2a] rounded-b-[2rem] w-[105%] -ml-[2.5%] border-t border-[#444]" />
          </motion.div>
        </section>

        {/* NEW FEATURES SECTION */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-32">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-6">Built for speed.</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg">Every feature is engineered to remove friction from your post-meeting workflow.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Universal Join", desc: "One-click deployment to Zoom, Google Meet, and MS Teams.", icon: Globe, color: "text-blue-400" },
              { title: "RAG-Powered Chat", desc: "Ask questions and get answers grounded in meeting context.", icon: MessageCircleCode, color: "text-cyan-400" },
              { title: "Action Extraction", desc: "AI identifies tasks and pushes them to your project tools.", icon: CheckCheck, color: "text-indigo-400" },
              { title: "Enterprise Security", desc: "SOC2 compliant with full end-to-end data encryption.", icon: ShieldCheck, color: "text-emerald-400" },
              { title: "Live Timelines", desc: "Watch the transcript and indexing happen in real-time.", icon: Timer, color: "text-amber-400" },
              { title: "Deep Analysis", desc: "Speaker sentiment, decision logs, and meeting scoring.", icon: ChartNoAxesCombined, color: "text-rose-400" },
            ].map((f, i) => (
              <motion.div key={i} whileHover={{ y: -5 }} className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group">
                <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${f.color}`}><f.icon className="w-6 h-6" /></div>
                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* NEW PRICING SECTION */}
        <section id="pricing" className="max-w-7xl mx-auto px-6 py-32 border-t border-white/5">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-6">Simple, fair pricing.</h2>
            <p className="text-zinc-400">Scale meeting intelligence from individual to enterprise.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Free */}
            <div className="p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.01] flex flex-col">
              <h3 className="text-lg font-bold text-white mb-2">Starter</h3>
              <p className="text-4xl font-black text-white mb-6">$0<span className="text-sm font-normal text-zinc-500">/mo</span></p>
              <ul className="space-y-4 mb-10 text-sm text-zinc-400 flex-1">
                <li className="flex items-center gap-2"><CheckCheck className="w-4 h-4 text-cyan-500" /> 5 meetings / mo</li>
                <li className="flex items-center gap-2"><CheckCheck className="w-4 h-4 text-cyan-500" /> Basic transcript</li>
                <li className="flex items-center gap-2"><CheckCheck className="w-4 h-4 text-cyan-500" /> 24h retention</li>
              </ul>
              <button className="w-full py-4 rounded-xl border border-white/10 bg-white/5 font-bold hover:bg-white/10">Get Started</button>
            </div>
            {/* Pro - Highlighted */}
            <div className="p-10 rounded-[3rem] border-2 border-cyan-500/50 bg-cyan-500/[0.03] flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-cyan-500 text-black text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest">Most Popular</div>
              <h3 className="text-lg font-bold text-white mb-2">Pro Operator</h3>
              <p className="text-4xl font-black text-white mb-6">$29<span className="text-sm font-normal text-zinc-500">/mo</span></p>
              <ul className="space-y-4 mb-10 text-sm text-zinc-200 flex-1">
                <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-cyan-400" /> Unlimited meetings</li>
                <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-cyan-400" /> Advanced RAG Chat</li>
                <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-cyan-400" /> Custom integrations</li>
                <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-cyan-400" /> Priority Support</li>
              </ul>
              <button className="w-full py-4 rounded-xl bg-white text-black font-bold shadow-[0_0_30px_rgba(255,255,255,0.2)]">Go Pro Now</button>
            </div>
            {/* Enterprise */}
            <div className="p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.01] flex flex-col">
              <h3 className="text-lg font-bold text-white mb-2">Enterprise</h3>
              <p className="text-4xl font-black text-white mb-6">Custom</p>
              <ul className="space-y-4 mb-10 text-sm text-zinc-400 flex-1">
                <li className="flex items-center gap-2"><CheckCheck className="w-4 h-4 text-cyan-500" /> SSO & SAML</li>
                <li className="flex items-center gap-2"><CheckCheck className="w-4 h-4 text-cyan-500" /> Dedicated Instances</li>
                <li className="flex items-center gap-2"><CheckCheck className="w-4 h-4 text-cyan-500" /> API Access</li>
              </ul>
              <button className="w-full py-4 rounded-xl border border-white/10 bg-white/5 font-bold hover:bg-white/10">Contact Sales</button>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-bold mb-3">Wall of Love</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-white">Trusted by operators.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "Zap Bot entirely eliminated our post-meeting admin.", author: "Sarah Jenkins", role: "VP Product" },
              { quote: "The RAG query speed is unreal. It knows everything.", author: "David Chen", role: "Eng Manager" },
              { quote: "Context switching is gone. I just ask the bot.", author: "Elena Rodriguez", role: "Chief of Staff" }
            ].map((testimonial, i) => (
              <motion.div key={i} className="p-8 rounded-3xl border border-white/10 bg-[#0a0a0a]/50">
                <Quote className="w-8 h-8 text-white/10 mb-6" />
                <p className="text-zinc-300 mb-8 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-linear-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center font-bold">{testimonial.author.charAt(0)}</div>
                  <div><h4 className="text-white font-semibold text-sm">{testimonial.author}</h4><p className="text-[10px] text-zinc-500 uppercase">{testimonial.role}</p></div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}