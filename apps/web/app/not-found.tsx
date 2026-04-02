"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-6 font-sans overflow-hidden">
      
      {/* Background Mesh & Grid (Matching the rest of the app) */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 inset-x-0 h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/60 via-white to-slate-50" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        
        {/* Simple 404 Header */}
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-8xl md:text-9xl font-black tracking-tighter text-slate-200 drop-shadow-sm"
        >
          404
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">Page not found</h2>
          <p className="mt-3 text-[15px] font-medium text-slate-500 leading-relaxed">
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
            className="flex h-12 items-center justify-center rounded-xl bg-slate-900 text-[14px] font-semibold text-white shadow-sm transition-transform hover:bg-slate-800 hover:scale-[1.02] active:scale-95"
          >
            Go to Dashboard
          </Link>
          
          <Link
            href="/"
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-[14px] font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </motion.div>

        {/* Subtle Branding */}
        <div className="mt-16 flex items-center justify-center gap-2 opacity-80">
          <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            ZapBot OS
          </p>
        </div>
      </div>
    </div>
  );
}