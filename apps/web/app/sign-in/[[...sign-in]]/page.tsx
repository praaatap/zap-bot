"use client";

import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Zap, ArrowLeft } from "lucide-react";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { CLERK_DARK_APPEARANCE } from "@/types/auth";

export default function SignInPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#000] px-6 py-20 overflow-hidden">
      
      {/* Background Mesh & Grid (Matching Home Page) */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-900/15 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/15 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Top Navigation */}
      <nav className="absolute top-0 inset-x-0 p-8 flex justify-between items-center max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center transition-transform group-hover:rotate-12 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-white">Zap Bot</span>
        </Link>
        <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back to site
        </Link>
      </nav>

      <div className="relative w-full max-w-[480px] z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold tracking-tighter text-white mb-3">
            Welcome <span className="text-cyan-400">Back.</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium">Continue your high-velocity meeting workflow.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-[2.5rem] border border-white/10 bg-zinc-900/40 backdrop-blur-3xl p-4 md:p-6 shadow-2xl"
        >
          <div className="absolute -inset-10 bg-cyan-500/10 blur-[80px] -z-10 opacity-50" />
          <SignIn 
            appearance={CLERK_DARK_APPEARANCE}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            fallbackRedirectUrl="/dashboard"
          />
        </motion.div>

        {/* Trust Badges */}
        <div className="mt-12 flex items-center justify-center gap-8 border-t border-white/5 pt-8">
          <div className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white">Secure Session</span>
          </div>
          <div className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white">Instant Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
}