"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Menu, X, ChevronRight } from "lucide-react";
import icon from '@/app/icon.svg';
const navItems = [
  { name: "Features", href: "#features" },
  { name: "How it works", href: "#how-it-works" },
  { name: "Pricing", href: "#pricing" },
];

// Added 'as const' to fix the TypeScript 'AnimationGeneratorType' error
const slowSpring = {
  type: "spring",
  stiffness: 120,
  damping: 24,
  mass: 1.2,
} as const;

export default function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex justify-center p-6 pointer-events-none">
      <motion.nav
        layout
        transition={slowSpring}
        className={`
          pointer-events-auto relative flex items-center justify-between gap-8 px-5 transition-colors duration-1000
          ${scrolled 
            ? "w-auto min-w-110 rounded-full bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-2.5" 
            : "w-full max-w-7xl rounded-3xl bg-transparent border border-transparent py-5"}
        `}
      >
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3 group pl-2">
          <motion.img
            src={icon.src}
            alt="Zap Bot Logo"
            className="w-8 h-8 rounded-full group-hover:rotate-12 transition-transform duration-500"
          />  
          <motion.span 
            layout="position"
            transition={slowSpring}
            className="text-xl font-bold tracking-tight text-white hidden sm:block"
          >
            Zap Bot
          </motion.span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onMouseEnter={() => setHoveredPath(item.name)}
              onMouseLeave={() => setHoveredPath(null)}
              className="relative px-5 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors duration-500"
            >
              <span className="relative z-10">{item.name}</span>
              {hoveredPath === item.name && (
                <motion.div
                  layoutId="navbar-hover-pill"
                  className="absolute inset-0 bg-white/5 rounded-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ ...slowSpring, duration: 0.8 }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pr-1">
          <motion.div layout="position" transition={slowSpring}>
            <Link 
              href="/sign-in" 
              className="hidden sm:block text-sm font-semibold text-slate-400 hover:text-white transition-colors duration-700"
            >
              Log in
            </Link>
          </motion.div>

          <motion.div 
            layout
            transition={slowSpring}
            whileHover={{ scale: 1.03 }} 
            whileTap={{ scale: 0.97 }}
          >
            <Link 
              href="/sign-up" 
              className={`
                flex items-center gap-2 font-bold rounded-full transition-all duration-1000
                ${scrolled 
                  ? "bg-white text-black px-5 py-2 text-sm" 
                  : "bg-white text-black px-8 py-3.5 text-base shadow-[0_0_20px_rgba(255,255,255,0.15)]"}
              `}
            >
              Get Started
              {!scrolled && <ChevronRight className="w-4 h-4" />}
            </Link>
          </motion.div>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={slowSpring}
            className="md:hidden absolute top-28 left-6 right-6 p-6 rounded-[2.5rem] border border-white/10 bg-black/80 backdrop-blur-3xl shadow-2xl z-50"
          >
            <div className="flex flex-col gap-3">
              {navItems.map((item, idx) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.1 }}
                >
                  <Link 
                    href={item.href}
                    className="block px-4 py-4 text-xl font-medium text-slate-300 hover:text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              <div className="h-px bg-white/5 my-4" />
              <Link 
                href="/sign-up" 
                className="w-full py-5 text-center font-bold bg-white text-black rounded-3xl"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}