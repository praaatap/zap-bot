"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon, Sparkles, Zap } from "lucide-react";
import Footer from "./components/landing/Footer";

const loadingMessages = [
  "Initializing Intelligence...",
  "Syncing Meeting BaaS...",
  "Preparing RAG Context...",
  "Booting Workspace Intelligence...",
  "Authenticating Secure Feed...",
];

export default function GlobalLoading() {
  const [messageIndex, setMessageIndex] = useState(0);

  // Cycle through loading messages for a "dynamic" feel
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#000] px-4 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />
      </div>

      <div className="relative z-10 w-full max-w-[280px] text-center">
        {/* Animated Brand Logo */}
        <div className="relative mx-auto mb-10 w-20 h-20">
          {/* Pulsing Outer Rings */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-3xl border border-cyan-500/50"
          />
          <motion.div 
            animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            className="absolute inset-0 rounded-3xl border border-cyan-400/30"
          />
          
          {/* Main Logo Card */}
          <div className="relative h-full w-full rounded-2xl bg-white flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.1)]">
            <motion.img
                src="/icon.svg"
                alt="Zap Bot Logo"
                className="w-10 h-10 rounded-full"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>

        {/* Loading Text with AnimatePresence */}
        <div className="h-10">
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-sm font-bold text-white tracking-tight"
            >
              {loadingMessages[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress Bar Container */}
        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/5">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
            }}
            className="h-full w-1/2 bg-linear-to-r from-transparent via-cyan-500 to-transparent"
          />
        </div>

        {/* Brand Label */}
        <div className="mt-12 flex items-center justify-center gap-2 opacity-20">
          <Zap className="h-3 w-3 fill-white" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
            Zap Bot OS
          </span>
        </div>
      </div>
    </div>
  );
}