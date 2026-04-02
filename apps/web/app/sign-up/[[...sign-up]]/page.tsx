"use client";

import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Zap, ArrowLeft, Code2 } from "lucide-react";
import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 px-6 py-20 overflow-hidden font-sans">
      
      {/* Background Mesh & Grid */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 inset-x-0 h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/60 via-white to-slate-50" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Top Navigation */}
      <nav className="absolute top-0 inset-x-0 p-8 flex justify-between items-center max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="bg-gradient-to-b from-blue-500 to-blue-600 p-1.5 rounded-lg shadow-sm shadow-blue-600/20 border border-blue-400/20 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 text-white fill-current" />
          </div>
          <span className="text-[18px] font-bold tracking-tight text-slate-900">ZapBot</span>
        </Link>
        <Link href="/" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm hover:shadow-md">
          <ArrowLeft className="w-3 h-3" /> Back to site
        </Link>
      </nav>

      <div className="relative w-full max-w-[420px] z-10 mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">
            Join the <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Future.</span>
          </h1>
          <p className="text-slate-500 text-[15px] font-medium">Build meeting intelligence in seconds.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-[2rem] border border-slate-200/80 bg-white/80 backdrop-blur-xl p-2 md:p-4 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.05)] ring-1 ring-slate-900/5"
        >
          <SignUp 
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            fallbackRedirectUrl="/dashboard"
            appearance={{
              variables: { colorPrimary: '#2563eb', colorText: '#0f172a' },
              elements: {
                card: 'shadow-none bg-transparent border-none',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton: 'border-slate-200 hover:bg-slate-50 text-slate-600 font-medium',
                formButtonPrimary: 'bg-slate-900 hover:bg-slate-800 shadow-sm text-[14px] font-semibold h-10',
                formFieldInput: 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-slate-900 focus:border-slate-900 rounded-lg h-10',
                formFieldLabel: 'text-slate-700 font-medium text-[13px]',
                footerActionText: 'text-slate-500',
                footerActionLink: 'text-blue-600 hover:text-blue-700 font-semibold',
                dividerLine: 'bg-slate-200',
                dividerText: 'text-slate-400 font-medium'
              }
            }}
          />
        </motion.div>

        <div className="mt-10 flex items-center justify-center gap-6 border-t border-slate-200 pt-8">
          <div className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Data Sovereign</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Code2 className="w-4 h-4 text-purple-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest">API Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}