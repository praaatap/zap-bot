"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Hero from "./components/landing/Hero";
import Features from "./components/landing/Features";
import Testimonials from "./components/landing/Testimonials";
import FAQSection from "./components/landing/FAQSection";
import Footer from "./components/landing/Footer";
import StatsSection from "./components/landing/StatsSection";
import IntegrationsSection from "./components/landing/IntegrationsSection";
import HowItWorksSection from "./components/landing/HowItWorksSection";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] text-gray-100 flex flex-col font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Header */}
      <header
        className={`fixed top-4 inset-x-4 z-50 transition-all duration-500 rounded-full border border-white/10 ${isScrolled
          ? "max-w-4xl mx-auto bg-black/80 backdrop-blur-2xl py-3 shadow-2xl scale-95"
          : "max-w-7xl mx-auto bg-white/5 backdrop-blur-lg py-5"
          }`}
        style={{ transformOrigin: 'top center' }}
      >
        <div className="px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-extrabold text-lg shadow-[0_0_20px_rgba(34,211,238,0.3)] group-hover:shadow-cyan-500/60 transition-all duration-300">
              Z
            </div>
            <span className="text-xl font-bold tracking-tight bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">Zap Bot</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => handleNavClick('features')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Features</button>
            <button onClick={() => handleNavClick('how-it-works')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">How it Works</button>
            <button onClick={() => handleNavClick('pricing')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Pricing</button>
            <button onClick={() => handleNavClick('faq')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">FAQ</button>
            <Link href="/extension" className="text-sm font-medium text-gray-400 hover:text-white transition-colors underline-offset-4 hover:underline">Extension</Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-bold text-white px-6 py-2.5 rounded-full bg-primary hover:bg-primary/80 transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-cyan-500/40 transform hover:-translate-y-0.5">
              Enter Dashboard
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-gray-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className="w-6 flex flex-col gap-1.5 pt-0.5">
              <span className={`h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? "rotate-45 translate-y-2 w-6" : "w-6"}`} />
              <span className={`h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : "w-4"}`} />
              <span className={`h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45 -translate-y-2 w-6" : "w-6"}`} />
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-100 bg-black/95 backdrop-blur-3xl pt-32 px-10 md:hidden">
          <div className="flex flex-col gap-8 text-3xl font-bold text-white">
            <button onClick={() => handleNavClick('features')} className="text-left py-2 hover:text-primary transition-colors">Features</button>
            <button onClick={() => handleNavClick('how-it-works')} className="text-left py-2 hover:text-primary transition-colors">How it Works</button>
            <button onClick={() => handleNavClick('pricing')} className="text-left py-2 hover:text-primary transition-colors">Pricing</button>
            <button onClick={() => handleNavClick('faq')} className="text-left py-2 hover:text-primary transition-colors">FAQ</button>
            <Link href="/extension" className="text-left py-2 hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Extension</Link>
            <div className="h-px bg-white/10 my-4" />
            <Link href="/dashboard" className="text-center py-5 rounded-3xl bg-primary text-white text-xl" onClick={() => setIsMobileMenuOpen(false)}>
              Enter Dashboard
            </Link>
          </div>
        </div>
      )}

      <main className="flex-1 relative">
        <Hero />
        <StatsSection />
        <div id="features">
          <Features />
        </div>
        <IntegrationsSection />
        <HowItWorksSection />
        <div id="pricing" />
        <Testimonials />
        <div id="faq">
          <FAQSection />
        </div>
      </main>

      <Footer />
    </div>
  );
}
