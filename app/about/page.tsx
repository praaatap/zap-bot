"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Target, 
  Cpu, 
  Zap, 
  Users, 
  History, 
  ArrowRight,
  Mic2,
  BrainCircuit,
  LayoutDashboard,
  PlugZap
} from "lucide-react";
import LandingNavbar from "@/components/LandingNavbar";
import Footer from "@/app/components/landing/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-zinc-300 selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-900/10 blur-[120px] rounded-full" />
      </div>

      <LandingNavbar />

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-24 md:py-32">
        {/* Header */}
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center mb-24"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6">
            We build the <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-500">memory</span> of your team.
          </h1>
          <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Zap Bot isn't just a transcriber. It's an intelligent layer that sits between your meetings and your next big breakthrough.
          </p>
        </motion.div>

        {/* Mission Section - Two Column */}
        <section className="grid md:grid-cols-2 gap-16 mb-32 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="flex items-center gap-2 text-cyan-400 font-bold tracking-widest text-xs uppercase mb-4">
              <Target className="w-4 h-4" />
              Our Mission
            </div>
            <h2 className="text-3xl font-bold text-white mb-6">Eliminating meeting fatigue.</h2>
            <p className="text-zinc-400 leading-relaxed mb-6">
              We believe meetings should be productive, insightful, and actionable. Traditional workflows waste hours on manual notes and lost context. 
            </p>
            <p className="text-zinc-400 leading-relaxed">
              We're on a mission to automate the "administrative overhead" of collaboration, empowering teams to focus on driving results and innovation.
            </p>
          </motion.div>
          <div className="relative aspect-square md:aspect-video rounded-3xl border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center group">
            <Cpu className="w-20 h-20 text-cyan-500/20 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        </section>

        {/* What We Do - Bento Grid */}
        <section className="mb-32">
          <div className="text-center mb-12">
             <h2 className="text-3xl font-bold text-white mb-4">The Zap Ecosystem</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: Mic2, title: "Smart Recording", desc: "Automated attendance on Zoom, Meet, and Teams. No manual clicks required.", color: "text-blue-400" },
              { icon: BrainCircuit, title: "AI Transcription", desc: "99% accuracy in 50+ languages with speaker identification.", color: "text-purple-400" },
              { icon: LayoutDashboard, title: "Intelligent Summaries", desc: "Extract action items, decisions, and blocking points instantly.", color: "text-emerald-400" },
              { icon: PlugZap, title: "Seamless Integration", desc: "Push tasks directly to Jira, Slack, or Linear without leaving the app.", color: "text-amber-400" }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] flex flex-col gap-4"
              >
                <div className={`p-3 rounded-xl bg-white/5 w-fit ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Story Section - Timeline Feel */}
        <section className="max-w-3xl mx-auto mb-32 border-l border-white/10 pl-8 md:pl-16 relative">
          <div className="flex items-center gap-2 text-indigo-400 font-bold tracking-widest text-xs uppercase mb-8">
            <History className="w-4 h-4" />
            Our Story
          </div>
          <div className="space-y-12">
            <div className="relative">
              <div className="absolute -left-[37px] md:-left-[69px] top-1 w-4 h-4 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
              <h3 className="text-xl font-bold text-white mb-2">The Spark (2024)</h3>
              <p className="text-zinc-400 leading-relaxed">
                Founded with a simple goal: make meetings better. We started as a small script to solve our own team's "what did we decide?" problem.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -left-[37px] md:-left-[69px] top-1 w-4 h-4 rounded-full bg-zinc-800 border border-white/10" />
              <h3 className="text-xl font-bold text-white mb-2">Scaling Intelligence</h3>
              <p className="text-zinc-400 leading-relaxed">
                After integrating the latest LLM models, we realized we could do more than just record—we could synthesize.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <motion.section 
          whileHover={{ scale: 1.01 }}
          className="p-12 rounded-[3rem] bg-gradient-to-b from-zinc-900 to-black border border-white/10 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-cyan-500/5 blur-3xl rounded-full -translate-y-1/2" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10">Ready to transform your meetings?</h2>
          <p className="text-zinc-500 mb-8 max-w-lg mx-auto relative z-10">
            Join 500+ teams using Zap Bot to reclaim their time and focus on what actually moves the needle.
          </p>
          <Link
            href="/dashboard"
            className="relative z-10 inline-flex items-center px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-all group"
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}