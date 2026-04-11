"use client";

import React, { useState, useRef, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, Settings, Shield, ChevronDown } from "lucide-react";

export const CustomUserButton = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isLoaded || !user) {
    return <div className="h-10 w-10 animate-pulse bg-slate-200 rounded-full" />;
  }

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 group outline-none"
      >
        <div className="relative">
          <img
            src={user.imageUrl}
            alt={user.fullName || "User"}
            className="h-10 w-10 rounded-full ring-2 ring-white shadow-sm group-hover:ring-blue-500 transition-all"
          />
          <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-emerald-500 rounded-full border-2 border-white" />
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-all ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-2 z-50 min-w-[240px] bg-white rounded-2xl border border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-2"
          >
            <div className="px-3 py-3 mb-2 border-b border-slate-50">
              <p className="text-[14px] font-bold text-slate-900">{user.fullName}</p>
              <p className="text-[12px] text-slate-500 truncate">{user.primaryEmailAddress?.emailAddress}</p>
            </div>

            <button className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer outline-none transition-colors">
              <User className="w-4 h-4 text-slate-400" />
              Profile Settings
            </button>

            <button className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer outline-none transition-colors">
              <Shield className="w-4 h-4 text-slate-400" />
              Security
            </button>

            <button className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer outline-none transition-colors">
              <Settings className="w-4 h-4 text-slate-400" />
              Preferences
            </button>

            <div className="h-px bg-slate-50 my-2" />

            <button
              onClick={() => signOut({ redirectUrl: "/" })}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-bold text-red-600 hover:bg-red-50 rounded-lg cursor-pointer outline-none transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
