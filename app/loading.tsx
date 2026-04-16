"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Zap, Activity, CheckCircle2, Shield, Cpu, Globe, Check } from "lucide-react";

/* ── inline styles — uses same CSS vars as ZapBot landing ── */
const S: Record<string, React.CSSProperties> = {
  root: {
    position: "fixed", inset: 0, zIndex: 9999,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "#FFFFFF",
    fontFamily: "'Figtree', sans-serif",
    overflow: "hidden",
  },
  dotGrid: {
    position: "absolute", inset: 0, pointerEvents: "none",
    backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)",
    backgroundSize: "24px 24px",
    opacity: 0.6,
  },
  radialGlow: {
    position: "absolute", inset: 0, pointerEvents: "none",
    background: "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(37,99,235,0.06) 0%, transparent 70%)",
  },
};

const MESSAGES = [
  "Initializing Intelligence Core...",
  "Establishing Secure WebSocket...",
  "Loading Workspace Context...",
  "Calibrating RAG Pipeline...",
  "Finalizing Boot Sequence...",
];

const CHECKS = [
  { label: "Core Engine Verified",      Icon: Cpu,    delay: 0.6 },
  { label: "End-to-End Encryption",     Icon: Shield, delay: 1.0 },
  { label: "Global Nodes Connected",    Icon: Globe,  delay: 1.4 },
];

export default function GlobalLoading() {
  const [msgIdx,   setMsgIdx]   = useState(0);
  const [progress, setProgress] = useState(8);
  const [checks,   setChecks]   = useState([false, false, false]);

  /* rotate messages */
  useEffect(() => {
    const id = setInterval(() =>
      setMsgIdx(p => (p + 1) % MESSAGES.length), 2000);
    return () => clearInterval(id);
  }, []);

  /* non-linear progress */
  useEffect(() => {
    const id = setInterval(() => {
      setProgress(p => {
        if (p >= 98) return p;
        return p + Math.max(0.15, (100 - p) * 0.045);
      });
    }, 140);
    return () => clearInterval(id);
  }, []);

  /* stagger check marks */
  useEffect(() => {
    const timers = CHECKS.map((c, i) =>
      setTimeout(() => setChecks(p => { const n=[...p]; n[i]=true; return n; }),
        c.delay * 1000 + 600)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const pct = Math.round(progress);

  return (
    <div style={S.root}>
      {/* backgrounds */}
      <div style={S.dotGrid} />
      <div style={S.radialGlow} />

      {/* Subtle border top accent */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: "linear-gradient(90deg, #2563EB, #7C3AED, #059669)",
        zIndex: 1,
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative", zIndex: 10,
          display: "flex", flexDirection: "column", alignItems: "center",
          textAlign: "center", width: "100%", maxWidth: 480, padding: "0 24px",
        }}
      >

        {/* ── ORBITAL LOGO ── */}
        <div style={{ position: "relative", width: 160, height: 160, marginBottom: 40,
          display: "flex", alignItems: "center", justifyContent: "center" }}>

          {/* Ring 1 — clockwise, dashed */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute", width: 156, height: 156, borderRadius: "50%",
              border: "1px dashed rgba(37,99,235,0.18)",
            }}
          />

          {/* Ring 2 — counter-clockwise, solid accent */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute", width: 120, height: 120, borderRadius: "50%",
              border: "1px solid transparent",
              borderTopColor: "rgba(37,99,235,0.35)",
              borderRightColor: "rgba(124,58,237,0.25)",
            }}
          />

          {/* Ring 3 — fast, thin */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute", width: 86, height: 86, borderRadius: "50%",
              border: "1px solid rgba(37,99,235,0.1)",
              borderBottomColor: "rgba(37,99,235,0.4)",
            }}
          />

          {/* Orbiting dot on ring 2 */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute", width: 120, height: 120,
              display: "flex", alignItems: "flex-start", justifyContent: "center",
            }}
          >
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#2563EB",
              boxShadow: "0 0 8px rgba(37,99,235,0.6)",
              marginTop: -4,
            }} />
          </motion.div>

          {/* Orbiting dot on ring 3 — purple */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute", width: 86, height: 86,
              display: "flex", alignItems: "flex-end", justifyContent: "center",
            }}
          >
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#7C3AED",
              boxShadow: "0 0 6px rgba(124,58,237,0.5)",
              marginBottom: -3,
            }} />
          </motion.div>

          {/* Center logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "relative", zIndex: 10,
              width: 64, height: 64, borderRadius: 18,
              background: "#111111",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* Subtle pulsing ring around logo */}
            <motion.div
              animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute", inset: -8, borderRadius: 26,
                border: "1px solid rgba(37,99,235,0.4)",
                pointerEvents: "none",
              }}
            />
            <Zap size={28} color="#fff" fill="#fff" />
          </motion.div>
        </div>

        {/* ── HEADING ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: 8 }}
        >
          <h1 style={{
            fontSize: 28, fontWeight: 800, letterSpacing: "-.03em",
            color: "#111111", lineHeight: 1.2, margin: 0,
          }}>
            Starting{" "}
            <span style={{
              background: "linear-gradient(120deg, #2563EB, #7C3AED)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              ZapBot OS
            </span>
          </h1>
          <p style={{
            fontSize: 14, color: "#9CA3AF", fontWeight: 500,
            marginTop: 6, letterSpacing: "-.01em",
          }}>
            Preparing your workspace…
          </p>
        </motion.div>

        {/* ── MESSAGE PILL ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          style={{
            marginTop: 24,
            display: "flex", alignItems: "center", gap: 10,
            background: "#F8F8F7", border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: 999, padding: "9px 20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05)",
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Activity size={14} color="#2563EB" />
          </motion.div>
          <div style={{ width: 218, height: 20, position: "relative", overflow: "hidden", textAlign: "left" }}>
            <AnimatePresence mode="popLayout">
              <motion.p
                key={msgIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                style={{
                  position: "absolute", inset: 0,
                  fontSize: 12.5, fontWeight: 600, color: "#4B5563",
                  fontFamily: "'Figtree', sans-serif",
                  whiteSpace: "nowrap", lineHeight: "20px",
                }}
              >
                {MESSAGES[msgIdx]}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── PROGRESS BAR ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{ marginTop: 36, width: "100%", maxWidth: 340 }}
        >
          {/* labels */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 8, padding: "0 2px",
          }}>
            <span style={{
              fontSize: 10, fontWeight: 800, textTransform: "uppercase",
              letterSpacing: ".1em", color: "#9CA3AF",
            }}>
              Boot Sequence
            </span>
            <span style={{
              fontSize: 12, fontWeight: 700, fontFamily: "monospace",
              color: "#2563EB",
            }}>
              {pct}%
            </span>
          </div>

          {/* track */}
          <div style={{
            height: 6, width: "100%", borderRadius: 99,
            background: "#F3F4F6",
            border: "1px solid rgba(0,0,0,0.06)",
            overflow: "hidden", position: "relative",
          }}>
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{
                position: "absolute", left: 0, top: 0,
                height: "100%", borderRadius: 99,
                background: "linear-gradient(90deg, #2563EB, #7C3AED)",
              }}
            />
            {/* shimmer sweep */}
            <motion.div
              animate={{ x: ["-100%", "300%"] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.4 }}
              style={{
                position: "absolute", top: 0, bottom: 0, width: "30%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
                borderRadius: 99,
              }}
            />
          </div>

          {/* segment ticks */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            padding: "5px 2px 0", opacity: 0.35,
          }}>
            {[0, 25, 50, 75, 100].map(v => (
              <span key={v} style={{
                fontSize: 9, fontFamily: "monospace",
                color: pct >= v ? "#2563EB" : "#9CA3AF",
                fontWeight: 700,
              }}>{v}</span>
            ))}
          </div>
        </motion.div>

        {/* ── CHECKS ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          style={{
            marginTop: 32, width: "100%", maxWidth: 340,
            display: "flex", flexDirection: "column", gap: 10,
          }}
        >
          {CHECKS.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: checks[i] ? 1 : 0.28, x: 0 }}
              transition={{ delay: c.delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 16px", borderRadius: 12,
                background: checks[i] ? "#F0FDF4" : "#F8F8F7",
                border: `1px solid ${checks[i] ? "rgba(5,150,105,0.2)" : "rgba(0,0,0,0.07)"}`,
                transition: "all 0.4s ease",
              }}
            >
              {/* icon box */}
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: checks[i] ? "#ECFDF5" : "#F3F4F6",
                border: `1px solid ${checks[i] ? "rgba(5,150,105,0.25)" : "rgba(0,0,0,0.08)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "all 0.4s ease",
              }}>
                <Check size={14} color={checks[i] ? "#059669" : "#9CA3AF"} />
              </div>

              <span style={{
                fontSize: 12.5, fontWeight: 600,
                color: checks[i] ? "#065F46" : "#9CA3AF",
                letterSpacing: "-.01em", flex: 1, textAlign: "left",
                transition: "color 0.4s ease",
              }}>
                {c.label}
              </span>

              <AnimatePresence>
                {checks[i] && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  >
                    <CheckCircle2 size={15} color="#059669" />
                  </motion.div>
                )}
                {!checks[i] && (
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  >
                    <div style={{
                      width: 15, height: 15, borderRadius: "50%",
                      border: "2px solid #D1D5DB",
                      borderTopColor: "#2563EB",
                      animation: "spin 1s linear infinite",
                    }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* ── FOOTER BRAND ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          style={{
            marginTop: 40,
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            background: "#111111",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Zap size={12} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#111111", letterSpacing: "-.02em" }}>ZapBot</span>
          <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 500 }}>· AI Meeting Assistant</span>
        </motion.div>

      </motion.div>

      {/* spin keyframes */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}