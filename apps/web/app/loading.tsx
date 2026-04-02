"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Zap, Activity } from "lucide-react";

const loadingMessages = [
  "Initializing Intelligence...",
  "Syncing Meeting BaaS...",
  "Preparing RAG Context...",
  "Booting Workspace Intelligence...",
  "Authenticating Secure Feed...",
];

export default function GlobalLoading() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(12);

  // Rotate messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // Simulate progress
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;
        const diff = 92 - prev;
        return prev + Math.max(0.8, diff * 0.08);
      });
    }, 220);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 px-6 overflow-hidden font-sans">
      
      {/* Background Mesh & Grid (Matches Landing & Auth Pages) */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 inset-x-0 h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/60 via-white to-slate-50" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center text-center">
        
        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 shadow-sm"
        >
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-700">
            System Boot Sequence
          </span>
        </motion.div>

        {/* Pulsing Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-b from-blue-500 to-blue-600 shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] border border-blue-400/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/20 blur-xl rounded-full scale-150 animate-pulse" />
            <motion.div
              animate={{ y: [0, -3, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Zap className="h-10 w-10 text-white fill-current relative z-10" />
            </motion.div>
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-2 leading-[1.1]"
        >
          Preparing your <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            intelligent workspace.
          </span>
        </motion.h1>

        {/* Rotating Messages */}
        <div className="mt-6 h-6 flex items-center justify-center gap-2">
          <Activity className="w-4 h-4 text-slate-400 animate-spin-slow" />
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className="text-[14px] font-medium text-slate-500"
            >
              {loadingMessages[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress Bar Container */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-10 w-full max-w-sm"
        >
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Loading Data
            </span>
            <span className="text-[11px] font-bold text-slate-600">
              {Math.round(progress)}%
            </span>
          </div>

          {/* Progress Track */}
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80 shadow-inner border border-slate-200">
            {/* Progress Fill */}
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 relative overflow-hidden"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {/* Shimmer effect on the progress bar */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </motion.div>
          </div>
        </motion.div>

        {/* Footer Brand */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-16 flex items-center gap-2"
        >
          <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            ZapBot OS
          </span>
        </motion.div>

      </div>
    </div>
  );
}