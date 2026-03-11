"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-white">
      <div className="w-full max-w-md text-center">
        
        {/* Simple 404 Header */}
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-8xl font-black tracking-tighter text-white/10"
        >
          404
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="mt-2 text-2xl font-semibold italic">Page not found</h2>
          <p className="mt-4 text-zinc-500">
            We couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-10 flex flex-col gap-3"
        >
          <Link
            href="/dashboard"
            className="flex h-12 items-center justify-center rounded-xl bg-white text-sm font-bold text-black transition-transform hover:scale-[1.02] active:scale-95"
          >
            Go to Dashboard
          </Link>
          
          <Link
            href="/"
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-transparent text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </motion.div>

        {/* Subtle Branding */}
        <p className="mt-16 text-xs text-zinc-700 uppercase tracking-widest">
          Zap Bot
        </p>
      </div>
    </div>
  );
}