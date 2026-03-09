"use client";

import LandingNavbar from "@/components/LandingNavbar";
import Features from "./components/landing/Features";
import StatsSection from "./components/landing/StatsSection";
import IntegrationsSection from "./components/landing/IntegrationsSection";
import HowItWorksSection from "./components/landing/HowItWorksSection";
import Testimonials from "./components/landing/Testimonials";
import FAQSection from "./components/landing/FAQSection";
import Footer from "./components/landing/Footer";
import HeroSection from "./components/landing/HeroSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-blue-500/30 font-sans antialiased">
      
      <LandingNavbar />
      
      {/* --- GLOBAL AMBIENT NOISE & LIGHT --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/[0.05] blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10">
        <HeroSection />

        {/* --- LOGO CLOUD --- */}
        <div className="py-20 border-y border-white/5 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-xs font-bold tracking-[0.2em] uppercase text-slate-500 mb-10">Integrates with your favorite tools</p>
            <div className="flex flex-wrap justify-center gap-12 md:gap-24 grayscale opacity-30 hover:opacity-100 transition-opacity duration-700 font-bold text-xl text-white">
               <span>Stripe</span>
               <span>Linear</span>
               <span>Vercel</span>
               <span>Supabase</span>
               <span>GitHub</span>
            </div>
          </div>
        </div>

        <StatsSection />
        <div id="features" className="scroll-mt-32"><Features /></div>
        <IntegrationsSection />
        <div id="how-it-works" className="scroll-mt-32"><HowItWorksSection /></div>
        <Testimonials />
        <div id="faq" className="scroll-mt-32"><FAQSection /></div>
      </main>

      <Footer />
    </div>
  );
}