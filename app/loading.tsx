"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Zap, Activity, CheckCircle2 } from "lucide-react";

const loadingMessages = [
  "Initializing Intelligence Core...",
  "Establishing Secure WebSocket...",
  "Loading Workspace Context...",
  "Calibrating RAG Models...",
  "Finalizing Boot Sequence...",
];

export default function GlobalLoading() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(12);

  // Rotate messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Simulate non-linear progress
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return prev;
        // Slows down as it gets closer to 100
        const diff = 100 - prev;
        return prev + Math.max(0.2, diff * 0.05);
      });
    }, 150);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 px-6 overflow-hidden font-sans">
      
      {/* Background Mesh & Grid */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 inset-x-0 h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-50/80 via-slate-50 to-slate-50" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Ambient Glowing Blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center text-center">
        
        {/* Pulsing Logo with Orbital Rings */}
        <div className="relative mb-12 flex items-center justify-center">
          {/* Outer Ring */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute w-40 h-40 rounded-full border border-slate-200/80 border-t-blue-500/30 border-r-transparent shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]"
          />
          {/* Inner Ring */}
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute w-32 h-32 rounded-full border border-slate-200/80 border-b-indigo-500/30 border-l-transparent"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-b from-blue-500 to-blue-600 shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] border border-blue-400/30 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 blur-xl rounded-full scale-150 animate-pulse" />
            <Zap className="h-8 w-8 text-white fill-current relative z-10" />
          </motion.div>
        </div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-2"
        >
          Starting <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">ZapBot OS</span>
        </motion.h1>

        {/* Rotating Messages Glass Pill */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 flex items-center justify-center gap-3 bg-white/60 backdrop-blur-md border border-slate-200/60 shadow-sm rounded-full px-5 py-2.5"
        >
          <Activity className="w-4 h-4 text-blue-500 animate-[spin_3s_linear_infinite]" />
          <div className="w-[200px] text-left relative h-5 overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.p
                key={messageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-0 text-[13px] font-semibold text-slate-600"
              >
                {loadingMessages[messageIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Sleek Progress Bar */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-12 w-full max-w-xs"
        >
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Boot Sequence
            </span>
            <span className="text-[10px] font-bold font-mono text-blue-600">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80 shadow-inner">
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Simulated CLI Details (Optional high-tech flair) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-10 flex flex-col items-center gap-1.5 opacity-40"
        >
          <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest text-slate-500">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Core Engine Verified
          </div>
          <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest text-slate-500">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> End-to-End Encryption
          </div>
        </motion.div>

      </div>
    </div>
  );
}