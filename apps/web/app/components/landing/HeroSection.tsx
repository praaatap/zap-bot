"use client";

import { motion } from "framer-motion";
import { Play, ChevronRight, Sparkles } from "lucide-react";

// Fixed TS error with 'as const' and tuned for "Slow & Smooth" feel
const slowSpring = { 
  type: "spring", 
  stiffness: 80,   // Reduced for even smoother entry
  damping: 25,     // High friction for no bounciness
  mass: 1.5        // Added weight
} as const;

export default function HeroSection() {
  return (
    <section className="relative pt-44 pb-20 px-6 overflow-hidden">
      {/* --- BACKGROUND AMBIENCE --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] pointer-events-none z-0">
        {/* Main glow */}
        <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[1400px] h-[700px] bg-blue-600/10 dark:bg-blue-500/[0.04] blur-[140px] rounded-full" />
        {/* Vertical center beam */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-[600px] bg-gradient-to-b from-blue-500/0 via-blue-500/20 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* --- BADGE --- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={slowSpring}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-10 hover:border-white/20 transition-all cursor-default group"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-12 transition-transform" />
          <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-slate-400 group-hover:text-white transition-colors">
            Trusted by 2,000+ teams
          </span>
        </motion.div>

        {/* --- HEADING (With Text Gradient) --- */}
        <motion.h1 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...slowSpring, delay: 0.15 }}
          className="text-6xl md:text-[5.5rem] font-extrabold tracking-tighter leading-[1.0] mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40"
        >
          Your AI partner for <br />
          <span className="text-blue-500 italic font-medium px-2">smarter meetings.</span>
        </motion.h1>

        {/* --- SUBTEXT --- */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...slowSpring, delay: 0.3 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-14 leading-relaxed font-medium"
        >
          The most advanced meeting assistant ever built. Automated notes, 
          real-time transcription, and seamless workflow integration.
        </motion.p>

        {/* --- ACTIONS --- */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ ...slowSpring, delay: 0.45 }}
           className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
           <button className="group relative w-full sm:w-auto px-12 py-5 bg-white text-black rounded-full font-bold shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(255,255,255,0.25)] hover:scale-105 transition-all flex items-center justify-center gap-2 overflow-hidden">
             {/* Subtle Shimmer Effect */}
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
             <span className="relative z-10">Join the Waitlist</span>
             <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />
           </button>
           
           <button className="w-full sm:w-auto px-12 py-5 bg-white/5 border border-white/10 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-white backdrop-blur-md">
             <Play className="w-4 h-4 fill-white" /> Watch Demo
           </button>
        </motion.div>

        {/* --- DASHBOARD PREVIEW (3D Morphing) --- */}
        <motion.div 
          initial={{ opacity: 0, y: 120 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...slowSpring, delay: 0.7 }}
          className="mt-28 perspective-[2000px]"
        >
          <div className="relative group mx-auto max-w-5xl transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] [transform:rotateX(12deg)_translateY(0px)] group-hover:[transform:rotateX(0deg)_translateY(-20px)]">
            
            {/* Ambient Background Glow behind the card */}
            <div className="absolute -inset-10 bg-blue-600/20 rounded-[3rem] blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="relative rounded-[2.5rem] border border-white/10 bg-[#0A0A0A] p-2.5 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] overflow-hidden">
              {/* Border Beam Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent translate-x-[-100%] animate-[shimmer_3s_infinite]" />

              <div className="rounded-[1.8rem] border border-white/5 bg-[#050505] aspect-video overflow-hidden relative">
                
                {/* Simulated UI with better detail */}
                <div className="p-10 w-full h-full flex flex-col gap-8 opacity-60 group-hover:opacity-100 transition-opacity duration-700">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3">
                      <div className="w-16 h-4 bg-white/10 rounded-full" />
                      <div className="w-24 h-4 bg-white/5 rounded-full" />
                    </div>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/5" />
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40" />
                    </div>
                  </div>
                  
                  <div className="space-y-5 max-w-lg">
                    <div className="h-5 bg-white/10 rounded-xl w-full" />
                    <div className="h-5 bg-white/10 rounded-xl w-[92%]" />
                    <div className="h-5 bg-white/5 rounded-xl w-[60%]" />
                  </div>

                  {/* Dynamic Floating Action Card */}
                  <div className="absolute bottom-12 right-12 w-72 p-5 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-3xl shadow-2xl translate-y-6 group-hover:translate-y-0 transition-transform duration-1000 delay-100">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400" />
                      <div className="space-y-2">
                        <div className="h-2 w-24 bg-white/20 rounded" />
                        <div className="h-1.5 w-16 bg-white/10 rounded" />
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: "85%" }} 
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} 
                        className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" 
                      />
                    </div>
                  </div>
                </div>

                {/* Loading State Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] group-hover:backdrop-blur-0 transition-all duration-700">
                   <div className="flex flex-col items-center gap-4">
                     <div className="w-12 h-12 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" />
                     <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/40">Synthesizing Meeting Data</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}