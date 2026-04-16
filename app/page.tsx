"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import {
  motion, useScroll, useTransform, useSpring,
  AnimatePresence, useInView
} from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial, Torus } from "@react-three/drei";
import {
  Zap, ArrowRight, Sparkles, CheckCheck, Globe, Mic, Send, Code2,
  Database, Activity, Users, LayoutGrid, Bot, CheckCircle2, Circle,
  TerminalSquare, Quote, Twitter, Github, Linkedin, Video, Lock,
  Menu, X, ChevronDown, Play, Cpu, Layers, GitBranch, Shield,
  Wand2, BrainCircuit, BarChart3, Clock, Rocket, MessageSquare,
  LayoutDashboard, Search, MessageCircleCode
} from "lucide-react";
import {
  SignInButton, SignUpButton, useAuth, useUser, UserButton,
} from "@clerk/nextjs";

/* ── Types for props & states ────────────────── */
interface Line {
  speaker: string;
  text: string;
  time: string;
  conf: number;
  tag?: string;
}

interface Task {
  id: string;
  text: string;
  assignee: string;
  done: boolean;
}

interface BentoCardProps {
  wide?: boolean;
  accentColor: string;
  iconBg: string;
  Icon: any;
  title: string;
  desc: string;
  visual?: React.ReactNode;
}

/* ═══════════════════════════════════════════════
   GLOBAL CSS  — LIGHT THEME, ZERO BLUR
═══════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Figtree:wght@300;400;500;600;700;800;900&display=swap');

*,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }

:root {
  --bg:        #FFFFFF;
  --bg-soft:   #F8F8F7;
  --bg-card:   #FFFFFF;
  --bg-2:      #F3F4F6;
  --text:      #111111;
  --text-2:    #4B5563;
  --text-3:    #9CA3AF;
  --border:    rgba(0,0,0,0.07);
  --border-2:  rgba(0,0,0,0.13);
  --accent:    #2563EB;
  --accent-2:  #1D4ED8;
  --accent-bg: #EEF4FF;
  --success:   #059669;
  --purple:    #7C3AED;
  --r:         16px;
  --r-sm:      10px;
  --r-lg:      24px;
  --sh:        0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05);
  --sh-lg:     0 8px 32px rgba(0,0,0,0.09);
  --sh-xl:     0 20px 60px rgba(0,0,0,0.12);
}

html { scroll-behavior:smooth; }
body {
  font-family:'Figtree',sans-serif;
  background:var(--bg); color:var(--text);
  -webkit-font-smoothing:antialiased; overflow-x:hidden;
}
a { text-decoration:none; color:inherit; }
button { cursor:pointer; font-family:inherit; }

/* scrollbar */
::-webkit-scrollbar { width:4px; }
::-webkit-scrollbar-track { background:var(--bg-soft); }
::-webkit-scrollbar-thumb { background:var(--accent); border-radius:99px; }

/* ── layout */
.section { max-width:1200px; margin:0 auto; padding:0 24px; }

/* ── dot grid */
.dot-grid {
  background-image:radial-gradient(circle,rgba(0,0,0,0.08) 1px,transparent 1px);
  background-size:22px 22px;
}

/* ── fonts */
.serif      { font-family:'Instrument Serif',serif; }
.serif-i    { font-family:'Instrument Serif',serif; font-style:italic; }

/* ── gradient text */
.g-blue {
  background:linear-gradient(120deg,#2563EB,#7C3AED);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
}

/* ── pill badge */
.pill {
  display:inline-flex; align-items:center; gap:6px;
  background:var(--accent-bg); border:1px solid rgba(37,99,235,0.2);
  border-radius:999px; padding:5px 14px;
  font-size:11px; font-weight:700; color:var(--accent-2);
  letter-spacing:.04em; text-transform:uppercase;
}
.pill-green  { background:#ECFDF5; border-color:rgba(5,150,105,0.2); color:#065F46; }
.pill-purple { background:#F3F0FF; border-color:rgba(124,58,237,0.2); color:#5B21B6; }
.pill-gray   { background:var(--bg-soft); border-color:var(--border-2); color:var(--text-2); }

/* ── buttons */
.btn-dark {
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  background:var(--text); color:#fff;
  padding:13px 26px; border-radius:var(--r-sm);
  font-size:14px; font-weight:700; border:none;
  box-shadow:0 2px 8px rgba(0,0,0,0.18);
  transition:opacity .15s, transform .15s;
  position:relative; overflow:hidden;
}
.btn-dark:hover { opacity:.88; transform:translateY(-1px); }
.btn-dark::after {
  content:''; position:absolute; top:0; left:-120%; width:60%; height:100%;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent);
  animation:shine 3s ease-in-out infinite;
}
@keyframes shine { to { left:200%; } }

.btn-outline {
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  background:var(--bg-card); color:var(--text);
  padding:13px 26px; border-radius:var(--r-sm);
  font-size:14px; font-weight:600;
  border:1px solid var(--border-2);
  box-shadow:var(--sh);
  transition:box-shadow .15s, transform .15s, border-color .15s;
}
.btn-outline:hover { box-shadow:var(--sh-lg); transform:translateY(-1px); border-color:rgba(0,0,0,0.2); }

/* ── solid card */
.card {
  background:var(--bg-card);
  border:1px solid var(--border);
  border-radius:var(--r-lg);
  box-shadow:var(--sh);
  transition:box-shadow .25s, border-color .25s, transform .25s;
}
.card:hover { box-shadow:var(--sh-lg); border-color:var(--border-2); }

/* ── section divider */
.divider { border:none; border-top:1px solid var(--border); }

/* ── stat card */
.stat-card {
  background:var(--bg-card);
  border:1px solid var(--border);
  border-radius:var(--r-lg); padding:36px;
  text-align:center; box-shadow:var(--sh);
  transition:box-shadow .25s, transform .25s, border-color .25s;
}
.stat-card:hover { box-shadow:var(--sh-xl); border-color:rgba(37,99,235,0.25); transform:translateY(-4px); }

/* ── feature card */
.feat-card {
  background:var(--bg-card);
  border:1px solid var(--border);
  border-radius:var(--r-lg); padding:36px 32px;
  box-shadow:var(--sh);
  transition:box-shadow .25s, border-color .25s, transform .25s;
}
.feat-card:hover { box-shadow:var(--sh-xl); transform:translateY(-6px); }

/* ── step card */
.step-card {
  background:var(--bg-card);
  border:1px solid var(--border);
  border-radius:var(--r-lg); padding:40px 36px;
  box-shadow:var(--sh);
  transition:box-shadow .3s, border-color .3s, transform .3s;
  position:relative; overflow:hidden;
}
.step-card:hover { box-shadow:var(--sh-xl); transform:translateY(-8px); }

/* ── testi card */
.testi-card {
  background:var(--bg-card);
  border:1px solid var(--border);
  border-radius:var(--r-lg); padding:36px 32px;
  box-shadow:var(--sh);
  transition:box-shadow .25s, border-color .25s, transform .25s;
}
.testi-card:hover { box-shadow:var(--sh-xl); transform:translateY(-5px); }

/* ── pricing */
.price-card {
  background:var(--bg-card);
  border:1px solid var(--border-2);
  border-radius:var(--r-lg); padding:40px;
  display:flex; flex-direction:column;
  box-shadow:var(--sh);
  transition:transform .25s, box-shadow .25s;
}
.price-card:hover { transform:translateY(-5px); box-shadow:var(--sh-xl); }
.price-card-pro {
  background:#0C0C0C; color:#fff;
  border-color:rgba(255,255,255,0.1);
}

/* ── widget */
.widget {
  background:var(--bg-card);
  border:1px solid var(--border-2);
  border-radius:var(--r-lg);
  box-shadow:0 2px 8px rgba(0,0,0,0.04),0 16px 48px rgba(0,0,0,0.08);
  overflow:hidden;
}
.widget-topbar {
  background:var(--bg-soft); border-bottom:1px solid var(--border);
  padding:12px 18px; display:flex; align-items:center; justify-content:space-between;
}
.trafficlights { display:flex; gap:6px; align-items:center; }
.trafficlights span { width:11px; height:11px; border-radius:50%; }

/* ── integration chip */
.chip {
  display:inline-flex; align-items:center; gap:8px;
  background:var(--bg-card); border:1px solid var(--border-2);
  border-radius:999px; padding:8px 20px;
  font-size:13px; font-weight:600; color:var(--text-2);
  white-space:nowrap; box-shadow:var(--sh);
}

/* ── ticker */
@keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
.ticker-track { animation:ticker 26s linear infinite; white-space:nowrap; display:flex; gap:12px; }
.ticker-track:hover { animation-play-state:paused; }
.logo-mask { mask-image:linear-gradient(90deg,transparent,black 12%,black 88%,transparent); }

/* ── badge */
.badge {
  display:inline-flex; align-items:center; gap:8px;
  background:var(--bg-card); border:1px solid var(--border-2);
  border-radius:999px; padding:6px 16px;
  font-size:12px; font-weight:600; color:var(--text-2);
  box-shadow:var(--sh); cursor:pointer; transition:box-shadow .2s;
}
.badge:hover { box-shadow:var(--sh-lg); }

/* ── nav */
.nav {
  position:fixed; top:0; inset-inline:0; z-index:200;
  height:62px; display:flex; align-items:center;
  transition:all .35s;
}
.nav-scrolled {
  background:rgba(255,255,255,0.96);
  border-bottom:1px solid var(--border);
  box-shadow:0 1px 12px rgba(0,0,0,0.05);
}
.nav-inner {
  width:100%; max-width:1200px; margin:0 auto; padding:0 24px;
  display:flex; align-items:center; justify-content:space-between;
}
.nav-link {
  font-size:14px; font-weight:500; color:var(--text-2);
  transition:color .15s; position:relative; padding:4px 0;
}
.nav-link::after {
  content:''; position:absolute; bottom:-3px; left:0; right:0;
  height:1.5px; background:var(--accent);
  transform:scaleX(0); transition:transform .2s; transform-origin:left;
}
.nav-link:hover { color:var(--text); }
.nav-link:hover::after { transform:scaleX(1); }

/* ── live dot */
@keyframes livepulse { 0%,100%{opacity:1} 50%{opacity:.4} }
.live-dot { animation:livepulse 1.8s ease-in-out infinite; }

/* ── scroll bounce */
@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
.bounce { animation:bounce 2s ease-in-out infinite; }

/* ── no scroll */
.noscroll::-webkit-scrollbar { display:none; }
.noscroll { -ms-overflow-style:none; scrollbar-width:none; }

/* ── footer */
.footer { background:var(--bg-soft); border-top:1px solid var(--border); padding:72px 0 40px; }

/* ── bento grid */
.bento { display:grid; gap:20px; grid-template-columns:1fr; }
@media(min-width:768px) { .bento { grid-template-columns:repeat(3,1fr); grid-auto-rows:320px; } }
.bento-wide { grid-column:1; }
@media(min-width:768px) { .bento-wide { grid-column:span 2; } }

/* ── grids */
.feat-grid { display:grid; gap:20px; grid-template-columns:1fr; }
@media(min-width:640px)  { .feat-grid { grid-template-columns:repeat(2,1fr); } }
@media(min-width:1024px) { .feat-grid { grid-template-columns:repeat(3,1fr); } }

.stats-grid { display:grid; gap:20px; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); }
.steps-grid { display:grid; gap:24px; grid-template-columns:repeat(auto-fit,minmax(270px,1fr)); }
.price-grid { display:grid; gap:24px; max-width:980px; margin:0 auto; grid-template-columns:repeat(auto-fit,minmax(270px,1fr)); }
.testi-grid { display:grid; gap:20px; grid-template-columns:repeat(auto-fit,minmax(290px,1fr)); }
.footer-grid { display:grid; gap:48px; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); margin-bottom:64px; }

/* ── responsive */
@media(max-width:767px) {
  .hide-m  { display:none !important; }
  .hero-h1 { font-size:48px !important; line-height:1.07 !important; }
}
@media(min-width:768px) { .show-m { display:none !important; } }
`;

/* ═══════════════════════════════════════════════
   THREE.JS — light-adapted particles (soft blue)
═══════════════════════════════════════════════ */
function Particles() {
  const mesh = useRef<any>(null);
  const count = 1600;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i*3]   = (Math.random()-.5)*26;
    pos[i*3+1] = (Math.random()-.5)*26;
    pos[i*3+2] = (Math.random()-.5)*26;
  }
  useFrame(s => {
    if (mesh.current) {
      mesh.current.rotation.y = s.clock.elapsedTime * 0.03;
      mesh.current.rotation.x = s.clock.elapsedTime * 0.015;
    }
  });
  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          {...{
            attach: "attributes-position",
            array: pos,
            count: count,
            itemSize: 3
          } as any}
        />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#2563EB" transparent opacity={0.28} sizeAttenuation />
    </points>
  );
}

function DistortOrb() {
  const ref = useRef<any>(null);
  useFrame(s => {
    if (ref.current) {
      ref.current.rotation.x = s.clock.elapsedTime * 0.2;
      ref.current.rotation.y = s.clock.elapsedTime * 0.14;
    }
  });
  return (
    <Float speed={1.6} rotationIntensity={0.35} floatIntensity={1.1}>
      <mesh ref={ref}>
        <Sphere args={[1.9, 64, 64]}>
          <MeshDistortMaterial
            color="#2563EB" distort={0.38} speed={1.7}
            roughness={0} metalness={0.05}
            transparent opacity={0.07}
          />
        </Sphere>
      </mesh>
      <mesh>
        <Sphere args={[1.92, 28, 28]}>
          <meshBasicMaterial color="#3B82F6" transparent opacity={0.04} wireframe />
        </Sphere>
      </mesh>
    </Float>
  );
}

function Rings() {
  const r1 = useRef<any>(null), r2 = useRef<any>(null);
  useFrame(s => {
    if (r1.current) {
      r1.current.rotation.x = s.clock.elapsedTime * 0.34;
      r1.current.rotation.z = s.clock.elapsedTime * 0.11;
    }
    if (r2.current) {
      r2.current.rotation.y = s.clock.elapsedTime * 0.20;
      r2.current.rotation.z = s.clock.elapsedTime * 0.08;
    }
  });
  return (
    <Float speed={1.2} floatIntensity={0.6}>
      <mesh ref={r1}>
        <Torus args={[2.9, 0.012, 16, 220]}>
          <meshBasicMaterial color="#2563EB" transparent opacity={0.16} />
        </Torus>
      </mesh>
      <mesh ref={r2}>
        <Torus args={[3.6, 0.007, 16, 220]} rotation={[0.5, 0, 0.8]}>
          <meshBasicMaterial color="#7C3AED" transparent opacity={0.1} />
        </Torus>
      </mesh>
    </Float>
  );
}

function HeroScene() {
  return (
    <Canvas
      camera={{ position:[0,0,8], fov:58 }}
      style={{ position:"absolute", inset:0, pointerEvents:"none" }}
      gl={{ antialias:true, alpha:true }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5,5,5]}   intensity={1.2} color="#2563EB" />
        <pointLight position={[-5,-5,-5]} intensity={0.5} color="#7C3AED" />
        <Particles />
        <DistortOrb />
        <Rings />
      </Suspense>
    </Canvas>
  );
}

/* ═══════════════════════════════════════════════
   SCROLL HELPERS
═══════════════════════════════════════════════ */
function Card3D({ children }: { children: React.ReactNode }) {
  const ref = useRef<any>(null);
  const { scrollYProgress } = useScroll({ target:ref, offset:["start end","end start"] });
  const rotateX = useTransform(scrollYProgress, [0,.4,.6,1], [22,0,0,-18]);
  const opacity  = useTransform(scrollYProgress, [0,.18,.82,1], [0,1,1,0]);
  const scale    = useTransform(scrollYProgress, [0,.18,.82,1], [0.88,1,1,0.93]);
  const y        = useTransform(scrollYProgress, [0,.4], [50,0]);
  return (
    <motion.div ref={ref} style={{ rotateX, opacity, scale, y, transformPerspective:1100, transformOrigin:"center center" }}>
      {children}
    </motion.div>
  );
}

function ParaWrap({ children, range=["-6%","6%"] }: { children: React.ReactNode, range?: string[] }) {
  const ref = useRef<any>(null);
  const { scrollYProgress } = useScroll({ target:ref, offset:["start end","end start"] });
  const y = useTransform(scrollYProgress, [0,1], range);
  return <motion.div ref={ref} style={{ y }}>{children}</motion.div>;
}

/* ═══════════════════════════════════════════════
   ANIMATED COUNTER
═══════════════════════════════════════════════ */
function Counter({ to, suffix="" }: { to: number, suffix?: string }) {
  const ref    = useRef<any>(null);
  const inView = useInView(ref, { once:true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let cur = 0;
    const step = to/(2*60);
    const id = setInterval(() => {
      cur += step;
      if (cur >= to) { setN(to); clearInterval(id); return; }
      setN(Math.floor(cur));
    }, 1000/60);
    return () => clearInterval(id);
  }, [inView, to]);
  return <span ref={ref}>{n.toLocaleString()}{suffix}</span>;
}

/* ═══════════════════════════════════════════════
   DEMO DATA
═══════════════════════════════════════════════ */
const DEMO_LINES = [
  { speaker:"Sarah J.", text:"Alright, let's kick off the Q3 planning session.", time:"09:01", conf:0.99 },
  { speaker:"David C.", text:"We need to finalise the budget by end of week.",  time:"09:02", tag:"ACTION",   conf:0.94 },
  { speaker:"Sarah J.", text:"Launch moved to Q3 — confirmed by leadership.",    time:"09:03", tag:"DECISION", conf:0.98 },
  { speaker:"Elena R.", text:"I'll send the updated roadmap to team Thursday.",  time:"09:04", tag:"ACTION",   conf:0.91 },
  { speaker:"David C.", text:"Engineering on track — no blockers right now.",    time:"09:05", conf:0.96 },
  { speaker:"Sarah J.", text:"Let's schedule a follow-up Monday at 10 AM.",      time:"09:06", tag:"ACTION",   conf:0.97 },
];
const INIT_TASKS = [
  { text:"Finalise Q3 budget",           assignee:"David C.", done:false, id:"TSK-842" },
  { text:"Send updated roadmap to team",  assignee:"Elena R.", done:false, id:"TSK-843" },
  { text:"Schedule follow-up Monday",     assignee:"Sarah J.", done:false, id:"TSK-844" },
];

/* ═══════════════════════════════════════════════
   MEETING WIDGET  (light, solid)
═══════════════════════════════════════════════ */
function MeetingWidget() {
  const [tab, setTab]     = useState("transcript");
  const [lines, setLines] = useState<Line[]>([]);
  const [tasks, setTasks] = useState<Task[]>(INIT_TASKS);
  const [live, setLive]   = useState(true);
  const [idx, setIdx]     = useState(0);
  const scrollRef         = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!live) return;
    if (idx >= DEMO_LINES.length) {
      const t = setTimeout(() => { setLines([]); setIdx(0); }, 4000);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => { setLines(p => [...p, DEMO_LINES[idx]]); setIdx(p => p+1); }, 1800);
    return () => clearTimeout(t);
  }, [idx, live]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const TABS = [
    { id:"transcript", label:"Transcript", Icon:Mic },
    { id:"tasks",      label:"Tasks",      Icon:CheckCircle2 },
    { id:"logs",       label:"Raw Log",    Icon:TerminalSquare },
  ];

  return (
    <div className="widget">
      {/* topbar */}
      <div className="widget-topbar">
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div className="trafficlights">
            <span style={{ background:"#FC5F57" }} />
            <span style={{ background:"#FEBD2E" }} />
            <span style={{ background:"#27C840" }} />
          </div>
          <div style={{
            display:"flex", alignItems:"center", gap:8,
            background:"#fff", border:"1px solid var(--border-2)",
            borderRadius:8, padding:"5px 12px", boxShadow:"var(--sh)"
          }}>
            <Activity size={12} color="var(--accent)" />
            <span style={{ fontSize:12, fontWeight:600, color:"var(--text-2)" }}>Q3 Planning Sync — ZapBot</span>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:11, fontFamily:"monospace", color:"var(--text-3)" }} className="hide-m">
            wss://zapbot.ai/live
          </span>
          <div style={{
            display:"flex", alignItems:"center", gap:6,
            background:"#F0FDF4", border:"1px solid #BBF7D0",
            borderRadius:8, padding:"4px 10px"
          }}>
            <span className="live-dot" style={{ width:6, height:6, borderRadius:"50%", background:"#22C55E", display:"inline-block" }} />
            <span style={{ fontSize:10, fontWeight:800, color:"#166534", letterSpacing:".07em" }}>LIVE</span>
          </div>
        </div>
      </div>

      {/* body */}
      <div style={{ display:"flex", height:500 }}>
        {/* video tiles */}
        <div style={{
          flex:1, background:"var(--bg-soft)", padding:16,
          display:"flex", flexDirection:"column", gap:12
        }} className="hide-m">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, flex:1 }}>
            {/* speaker 1 — active */}
            <div style={{
              background:"#fff", borderRadius:14,
              border:"1.5px solid rgba(37,99,235,0.3)",
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              position:"relative", overflow:"hidden", boxShadow:"var(--sh)"
            }}>
              <div style={{
                width:54, height:54, borderRadius:"50%",
                background:"var(--accent-bg)",
                display:"flex", alignItems:"center", justifyContent:"center",
                border:"2px solid rgba(37,99,235,0.2)"
              }}>
                <span style={{ fontSize:18, fontWeight:800                , color:"var(--accent)" }}>SJ</span>
              </div>
              {/* waveform */}
              <div style={{ position:"absolute", top:10, right:10, display:"flex", gap:2, alignItems:"flex-end", height:18 }}>
                {[3,5,4,7,3,5].map((h,i) => (
                  <motion.div key={i}
                    animate={{ height:[`${h*2}px`,`${h*3.8}px`,`${h*2}px`] }}
                    transition={{ repeat:Infinity, duration:.7, delay:i*.1, ease:"easeInOut" }}
                    style={{ width:3, background:"var(--accent)", borderRadius:2 }}
                  />
                ))}
              </div>
              <div style={{
                position:"absolute", bottom:8, left:8,
                background:"rgba(255,255,255,0.95)",
                border:"1px solid var(--border)", borderRadius:6,
                padding:"3px 8px", fontSize:10, fontWeight:700, color:"var(--text)"
              }}>Sarah Jenkins</div>
            </div>

            {/* speaker 2 */}
            <div style={{
              background:"#fff", borderRadius:14,
              border:"1px solid var(--border)",
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              position:"relative", overflow:"hidden", boxShadow:"var(--sh)"
            }}>
              <div style={{
                width:54, height:54, borderRadius:"50%",
                background:"var(--bg-soft)",
                border:"1px solid var(--border-2)",
                display:"flex", alignItems:"center", justifyContent:"center"
              }}>
                <span style={{ fontSize:18, fontWeight:800, color:"var(--text-2)" }}>DC</span>
              </div>
              <div style={{
                position:"absolute", bottom:8, left:8,
                background:"rgba(255,255,255,0.95)",
                border:"1px solid var(--border)", borderRadius:6,
                padding:"3px 8px", fontSize:10, fontWeight:700, color:"var(--text)"
              }}>David Chen</div>
              <Mic size={14} color="var(--text-3)" style={{ position:"absolute", top:10, right:10 }} />
            </div>
          </div>

          {/* controls bar */}
          <div style={{
            background:"#fff", border:"1px solid var(--border)",
            borderRadius:12, padding:"8px 12px",
            display:"flex", alignItems:"center", justifyContent:"space-between",
            boxShadow:"var(--sh)"
          }}>
            <button onClick={() => setLive(v => !v)} style={{
              display:"flex", alignItems:"center", gap:7,
              padding:"7px 14px", borderRadius:8, border:"none",
              fontSize:12, fontWeight:700, fontFamily:"inherit",
              background: live ? "var(--bg-soft)" : "var(--text)",
              color:      live ? "var(--text-2)"  : "#fff",
              transition:"all .2s", cursor:"pointer"
            }}>
              <Bot size={13} /> {live ? "Pause Bot" : "Resume Bot"}
            </button>
            <div style={{ display:"flex", gap:4 }}>
              {[Users, LayoutGrid].map((Icon,i) => (
                <button key={i} style={{
                  padding:8, borderRadius:8, border:"none",
                  background:"transparent", color:"var(--text-3)", cursor:"pointer"
                }}>
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* data panel */}
        <div style={{
          width:"100%", maxWidth:380,
          display:"flex", flexDirection:"column",
          borderLeft:"1px solid var(--border)",
          background:"#fff"
        }}>
          {/* tabs */}
          <div style={{
            display:"flex", gap:3, padding:"8px 10px",
            borderBottom:"1px solid var(--border)",
            background:"var(--bg-soft)"
          }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex:1,
                display:"flex", alignItems:"center", justifyContent:"center", gap:5,
                padding:"7px 0", borderRadius:8, border:"none", fontFamily:"inherit",
                fontSize:12, fontWeight:600, cursor:"pointer",
                background: tab===t.id ? "#fff"          : "transparent",
                color:      tab===t.id ? "var(--text)"   : "var(--text-3)",
                boxShadow:  tab===t.id ? "var(--sh)"     : "none",
                transition:"all .2s"
              }}>
                <t.Icon size={12} /> {t.label}
              </button>
            ))}
          </div>

          {/* panel */}
          <div style={{ flex:1, overflow:"hidden", position:"relative" }}>
            <div style={{ position:"absolute", top:0, inset:"0 0 auto", height:22,
              background:"linear-gradient(to bottom,#fff,transparent)",
              zIndex:5, pointerEvents:"none" }} />
            <div style={{ position:"absolute", bottom:0, inset:"auto 0 0", height:22,
              background:"linear-gradient(to top,#fff,transparent)",
              zIndex:5, pointerEvents:"none" }} />

            <AnimatePresence mode="wait">
              {/* TRANSCRIPT */}
              {tab==="transcript" && (
                <motion.div key="tr"
                  initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                  ref={scrollRef} className="noscroll"
                  style={{ height:"100%", overflowY:"auto", padding:"20px 18px", display:"flex", flexDirection:"column", gap:20 }}
                >
                  {lines.map((l,i) => (
                    <motion.div key={i}
                      initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                      style={{ display:"flex", flexDirection:"column", gap:6 }}
                    >
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span style={{ fontSize:11, fontWeight:700, color:"var(--text)", textTransform:"uppercase", letterSpacing:".06em" }}>
                          {l.speaker}
                        </span>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          {l.tag && (
                            <span className={l.tag==="DECISION" ? "pill pill-purple" : "pill"}
                              style={{ fontSize:9, padding:"2px 8px" }}>
                              {l.tag}
                            </span>
                          )}
                          <span style={{ fontSize:10, color:"var(--text-3)", fontFamily:"monospace" }}>{l.time}</span>
                        </div>
                      </div>
                      <p style={{ fontSize:13, color:"var(--text-2)", lineHeight:1.65 }}>{l.text}</p>
                      {/* confidence bar */}
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <div style={{ flex:1, height:2, background:"rgba(0,0,0,0.06)", borderRadius:1 }}>
                          <div style={{ width:`${l.conf*100}%`, height:"100%", background:"linear-gradient(90deg,#2563EB,#7C3AED)", borderRadius:1 }} />
                        </div>
                        <span style={{ fontSize:9, color:"var(--text-3)", fontFamily:"monospace" }}>{Math.round(l.conf*100)}%</span>
                      </div>
                    </motion.div>
                  ))}
                  {live && idx < DEMO_LINES.length && lines.length > 0 && (
                    <div style={{ display:"flex", gap:5 }}>
                      {[0,1,2].map(i => (
                        <motion.div key={i}
                          animate={{ y:["0px","-5px","0px"], opacity:[0.3,1,0.3] }}
                          transition={{ repeat:Infinity, duration:.9, delay:i*.2 }}
                          style={{ width:7, height:7, borderRadius:"50%", background:"var(--text-3)" }}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* TASKS */}
              {tab==="tasks" && (
                <motion.div key="ta"
                  initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                  style={{ height:"100%", padding:18, display:"flex", flexDirection:"column", gap:10 }}
                >
                  {tasks.map((a,i) => (
                    <motion.div key={i} whileHover={{ y:-2 }}
                      onClick={() => setTasks(p => p.map((x,j) => j===i ? {...x,done:!x.done} : x))}
                      style={{
                        padding:"12px 14px", borderRadius:12, cursor:"pointer",
                        border:`1px solid ${a.done ? "var(--border)" : "var(--border-2)"}`,
                        background: a.done ? "var(--bg-soft)" : "#fff",
                        display:"flex", alignItems:"flex-start", gap:12,
                        opacity: a.done ? .5 : 1,
                        boxShadow: a.done ? "none" : "var(--sh)",
                        transition:"all .2s"
                      }}
                    >
                      <div style={{ marginTop:2, color: a.done ? "var(--success)" : "var(--accent)" }}>
                        {a.done ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                          <span style={{ fontSize:10, fontFamily:"monospace", color:"var(--text-3)" }}>{a.id}</span>
                          <span style={{
                            fontSize:10, fontWeight:700,
                            background:"var(--bg-soft)", border:"1px solid var(--border)",
                            borderRadius:5, padding:"1px 7px", color:"var(--text-2)"
                          }}>{a.assignee}</span>
                        </div>
                        <p style={{ fontSize:13, fontWeight:500, color: a.done ? "var(--text-3)" : "var(--text)", textDecoration: a.done ? "line-through" : "none", lineHeight:1.45 }}>
                          {a.text}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  <button style={{
                    marginTop:"auto", width:"100%", padding:"11px 0",
                    borderRadius:10, border:"1px solid var(--border-2)",
                    background:"#fff", fontSize:12, fontWeight:700,
                    color:"var(--text-2)", cursor:"pointer", fontFamily:"inherit",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:7,
                    boxShadow:"var(--sh)", transition:"all .2s"
                  }}>
                    <Send size={13} color="var(--accent)" /> Push to Linear
                  </button>
                </motion.div>
              )}

              {/* RAW LOG — keep dark terminal */}
              {tab==="logs" && (
                <motion.div key="lo"
                  initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                  className="noscroll"
                  style={{ height:"100%", overflowY:"auto", padding:18,
                    background:"#0C0C0C", fontFamily:"monospace", fontSize:11,
                    color:"#64748B", lineHeight:1.8 }}
                >
                  {lines.map((l,i) => (
                    <div key={i} style={{ marginBottom:16 }}>
                      <span style={{ color:"#475569" }}>[{l.time}]</span>{" "}
                      <span style={{ color:"#60A5FA" }}>INFO</span>{" "}
                      <span style={{ color:"#34D399" }}>EVENT_EMITTED</span>
                      <div style={{ paddingLeft:16, marginTop:3 }}>
                        <span style={{ color:"#F472B6" }}>speaker:</span>{" "}
                        <span style={{ color:"#E2E8F0" }}>"{l.speaker}"</span><br/>
                        <span style={{ color:"#F472B6" }}>confidence:</span>{" "}
                        <span style={{ color:"#FCD34D" }}>{l.conf}</span><br/>
                        {l.tag && <><span style={{ color:"#F472B6" }}>intent:</span>{" "}<span style={{ color:"#A5B4FC" }}>"{l.tag}"</span><br/></>}
                      </div>
                    </div>
                  ))}
                  <motion.div animate={{ opacity:[1,0,1] }} transition={{ repeat:Infinity, duration:1.1 }}
                    style={{ width:8, height:13, background:"#64748B", display:"inline-block" }} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   NAVBAR  (Clerk-aware)
═══════════════════════════════════════════════ */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav className={`nav ${scrolled ? "nav-scrolled" : ""}`}>
      <div className="nav-inner">
        {/* logo */}
        <a href="/" style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:32, height:32, borderRadius:10,
            background:"var(--text)",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 2px 10px rgba(0,0,0,0.2)"
          }}>
            <Zap size={16} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontSize:18, fontWeight:800, letterSpacing:"-.02em" }}>ZapBot</span>
        </a>

        {/* desktop links */}
        <div style={{ display:"flex", alignItems:"center", gap:36 }} className="hide-m">
          {["Platform","Solutions","Pricing","Developers","Blog"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="nav-link">{l}</a>
          ))}
        </div>

        {/* auth CTAs */}
        <div style={{ display:"flex", alignItems:"center", gap:12 }} className="hide-m">
          {!isLoaded ? null : isSignedIn ? (
            <>
              <a href="/dashboard" className="btn-dark" style={{ padding:"8px 18px", fontSize:13 }}>
                <LayoutDashboard size={14} /> Dashboard
              </a>
              <UserButton appearance={{ elements:{ avatarBox:"w-9 h-9 rounded-full" } }} />
            </>
          ) : (
            <>
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <button style={{
                  background:"none", border:"none", cursor:"pointer",
                  fontSize:14, fontWeight:500, color:"var(--text-2)", fontFamily:"inherit",
                  transition:"color .15s"
                }}
                  onMouseEnter={e => e.currentTarget.style.color="var(--text)"}
                  onMouseLeave={e => e.currentTarget.style.color="var(--text-2)"}
                >Sign In</button>
              </SignInButton>
              <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                <button className="btn-dark" style={{ padding:"8px 18px", fontSize:13 }}>
                  Get Started
                </button>
              </SignUpButton>
            </>
          )}
        </div>

        {/* mobile hamburger */}
        <button className="show-m" onClick={() => setOpen(v => !v)}
          style={{ padding:8, borderRadius:8, border:"none", background:"var(--bg-soft)", color:"var(--text-2)" }}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }}
            style={{
              position:"absolute", top:"100%", inset:"100% 0 auto", zIndex:100,
              background:"#fff", borderBottom:"1px solid var(--border)",
              overflow:"hidden", boxShadow:"var(--sh-lg)"
            }}
          >
            <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:18 }}>
              {["Platform","Solutions","Pricing","Developers","Blog"].map(l => (
                <a key={l} href={`#${l.toLowerCase()}`} className="nav-link" style={{ fontSize:16 }}
                  onClick={() => setOpen(false)}>{l}</a>
              ))}
              <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                <button className="btn-dark" style={{ justifyContent:"center", width:"100%" }}>
                  Get Started Free <ArrowRight size={14} />
                </button>
              </SignUpButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

/* ═══════════════════════════════════════════════
   TICKER
═══════════════════════════════════════════════ */
const INTEGRATIONS = [
  "🎯 Jira","📝 Notion","📊 Linear","📅 Google Calendar","💬 Slack",
  "🎥 Zoom","📞 Google Meet","🖥 MS Teams","⚡ Zapier","🔗 Salesforce",
  "🗂 Asana","📧 Outlook","🤖 HubSpot","📦 Trello","🚀 ClickUp",
];
function Ticker() {
  const doubled = [...INTEGRATIONS, ...INTEGRATIONS];
  return (
    <div style={{ overflow:"hidden", padding:"28px 0" }} className="logo-mask">
      <div className="ticker-track" style={{ gap:12 }}>
        {doubled.map((name,i) => <span key={i} className="chip">{name}</span>)}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   FEATURES DATA
═══════════════════════════════════════════════ */
const FEATURES = [
  { Icon:Mic,          c:"#2563EB", bg:"#EEF4FF", title:"Real-time Transcription",  desc:"Military-grade ASR with 98.7% accuracy across 42 languages. Handles cross-talk, accents, and technical jargon." },
  { Icon:BrainCircuit, c:"#7C3AED", bg:"#F3F0FF", title:"AI Intent Detection",      desc:"GPT-4o classifies every sentence — action items, decisions, blockers, risks — as speech happens live." },
  { Icon:GitBranch,    c:"#059669", bg:"#ECFDF5", title:"Smart Task Routing",       desc:"Auto-creates JIRA, Linear, Notion & Asana tasks with correct assignees, priorities, and due dates." },
  { Icon:Shield,       c:"#D97706", bg:"#FFFBEB", title:"SOC2 Type II + HIPAA",    desc:"Zero data retention option. Your calls never train our models. Full audit logs and custom DLP policies." },
  { Icon:BarChart3,    c:"#DC2626", bg:"#FEF2F2", title:"Meeting Analytics",        desc:"Track talk-time ratios, sentiment trends, and engagement scores. Surface who dominates every call." },
  { Icon:Wand2,        c:"#0891B2", bg:"#ECFEFF", title:"Auto-generated Briefs",    desc:"A structured brief lands in everyone's inbox 30 seconds after the call ends. No manual notes ever again." },
];

/* ═══════════════════════════════════════════════
   BENTO CARD  (for visual feature section)
═══════════════════════════════════════════════ */
function BentoCard({ wide, accentColor, iconBg, Icon, title, desc, visual }: BentoCardProps) {
  return (
    <motion.div
      className={`card ${wide ? "bento-wide" : ""}`}
      initial={{ opacity:0, y:24 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true }}
      transition={{ duration:.6, ease:[.16,1,.3,1] }}
      whileHover={{ y:-5, boxShadow:"0 20px 60px rgba(0,0,0,0.1)" }}
      style={{ overflow:"hidden", display:"flex", flexDirection: wide ? "row" : "column" }}
    >
      <div style={{ padding:"32px 36px", flex:1, display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
        <div style={{
          width:44, height:44, borderRadius:12,
          background:iconBg, border:`1px solid ${accentColor}22`,
          display:"flex", alignItems:"center", justifyContent:"center",
          marginBottom:20
        }}>
          <Icon size={20} color={accentColor} />
        </div>
        <h3 style={{ fontSize:18, fontWeight:700, marginBottom:10, letterSpacing:"-.02em" }}>{title}</h3>
        <p style={{ fontSize:14, color:"var(--text-2)", lineHeight:1.65 }}>{desc}</p>
      </div>
      {visual && (
        <div style={{
          flex: wide ? 1 : 0,
          minHeight: wide ? "auto" : 180,
          background:"var(--bg-soft)",
          borderTop:  wide ? "none" : "1px solid var(--border)",
          borderLeft: wide ? "1px solid var(--border)" : "none",
          display:"flex", alignItems:"center", justifyContent:"center",
          overflow:"hidden", position:"relative"
        }}>
          <div style={{
            position:"absolute", inset:0,
            backgroundImage:"radial-gradient(circle,rgba(0,0,0,0.07) 1px,transparent 1px)",
            backgroundSize:"22px 22px", opacity:.6
          }} />
          <div style={{ position:"relative", zIndex:1 }}>{visual}</div>
        </div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
export default function ZapBotLanding() {
  const [annual, setAnnual]     = useState(false);
  const { isSignedIn, isLoaded } = useAuth();
  const { scrollYProgress }     = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness:100, damping:30 });

  return (
    <>
      <style>{CSS}</style>

      {/* scroll progress bar */}
      <motion.div style={{
        scaleX, transformOrigin:"left",
        position:"fixed", top:0, left:0, right:0, height:3, zIndex:999,
        background:"linear-gradient(90deg,#2563EB,#7C3AED,#059669)"
      }} />

      <div style={{ minHeight:"100vh", background:"var(--bg)", overflowX:"hidden" }}>
        <Navbar />

        {/* ══ HERO ══ */}
        <section style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", overflow:"hidden" }}>
          <HeroScene />

          {/* dot grid */}
          <div style={{ position:"absolute", inset:0, zIndex:1, pointerEvents:"none",
            backgroundImage:"radial-gradient(circle,rgba(0,0,0,0.07) 1px,transparent 1px)",
            backgroundSize:"22px 22px", opacity:.55 }} />

          {/* subtle blue radial — no blur */}
          <div style={{ position:"absolute", inset:0, zIndex:1, pointerEvents:"none",
            background:"radial-gradient(ellipse 70% 55% at 50% 50%, rgba(37,99,235,0.06) 0%, transparent 70%)" }} />

          <div className="section" style={{ position:"relative", zIndex:10, textAlign:"center", padding:"140px 24px 80px" }}>
            <motion.div initial={{ opacity:0, y:32 }} animate={{ opacity:1, y:0 }} transition={{ duration:.8, ease:[.16,1,.3,1] }}>

              {/* badge */}
              <motion.div initial={{ opacity:0, scale:.88 }} animate={{ opacity:1, scale:1 }} transition={{ duration:.5, delay:.1 }}
                style={{ display:"flex", justifyContent:"center", marginBottom:36 }}>
                <div className="badge">
                  <Sparkles size={13} color="var(--accent)" />
                  <span>Introducing ZapBot 2.0 — GPT-4o</span>
                  <span style={{ width:1, height:14, background:"var(--border-2)", margin:"0 6px" }} />
                  <span style={{ color:"var(--accent)", display:"flex", alignItems:"center", gap:4 }}>
                    Read post <ArrowRight size={11} />
                  </span>
                </div>
              </motion.div>

              {/* H1 */}
              <motion.h1 className="hero-h1 serif"
                style={{ fontSize:82, lineHeight:1.03, letterSpacing:"-.04em", fontWeight:400, margin:"0 auto 28px", maxWidth:880 }}
                initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.7, delay:.15 }}
              >
                Capture meetings.{" "}
                <span className="serif-i g-blue">Automate the rest.</span>
              </motion.h1>

              {/* sub */}
              <motion.p style={{ fontSize:19, color:"var(--text-2)", maxWidth:560, margin:"0 auto 48px", lineHeight:1.72, fontWeight:400 }}
                initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:.7, delay:.25 }}>
                The AI copilot that acts like a senior operator. Joins your calls, structures dialogue,
                and creates tickets automatically — before the call even ends.
              </motion.p>

              {/* CTAs — Clerk-aware */}
              <motion.div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap", marginBottom:64 }}
                initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:.6, delay:.35 }}>
                {!isLoaded ? null : isSignedIn ? (
                  <>
                    <a href="/dashboard" className="btn-dark" style={{ padding:"15px 36px", fontSize:16 }}>
                      <LayoutDashboard size={16} /> Go to Dashboard
                    </a>
                    <a href="#demo" className="btn-outline" style={{ padding:"15px 30px", fontSize:16 }}>
                      <Play size={15} style={{ color:"var(--accent)" }} /> Watch Demo
                    </a>
                  </>
                ) : (
                  <>
                    <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                      <button className="btn-dark" style={{ padding:"15px 36px", fontSize:16, fontFamily:"inherit" }}>
                        Get Started for Free <ArrowRight size={16} />
                      </button>
                    </SignUpButton>
                    <a href="#demo" className="btn-outline" style={{ padding:"15px 30px", fontSize:16 }}>
                      <Play size={15} style={{ color:"var(--accent)" }} /> Book a Demo
                    </a>
                  </>
                )}
              </motion.div>

              {/* quick stats */}
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.55 }}>
                <div style={{ borderTop:"1px solid var(--border)", paddingTop:36, maxWidth:640, margin:"0 auto" }}>
                  <p style={{ fontSize:11, fontWeight:700, color:"var(--text-3)", letterSpacing:".12em", textTransform:"uppercase", marginBottom:24 }}>
                    Powering innovative teams worldwide
                  </p>
                  <div style={{ display:"flex", justifyContent:"center", gap:48, flexWrap:"wrap" }}>
                    {[
                      { val:"98.7%", label:"Accuracy" },
                      { val:"< 3s",  label:"Latency"  },
                      { val:"50K+",  label:"Teams"     },
                      { val:"SOC2",  label:"Certified" },
                    ].map((s,i) => (
                      <div key={i} style={{ textAlign:"center" }}>
                        <div style={{ fontSize:22, fontWeight:800, color:"var(--text)", letterSpacing:"-.02em" }}>{s.val}</div>
                        <div style={{ fontSize:11, color:"var(--text-3)", fontWeight:700, letterSpacing:".07em", textTransform:"uppercase" }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

            </motion.div>
          </div>

          {/* scroll hint */}
          <div className="bounce" style={{
            position:"absolute", bottom:32, left:"50%", transform:"translateX(-50%)",
            display:"flex", flexDirection:"column", alignItems:"center", gap:7,
            color:"var(--text-3)", fontSize:10, fontWeight:700, letterSpacing:".12em", zIndex:10
          }}>
            <span>SCROLL</span>
            <ChevronDown size={15} />
          </div>
        </section>

        {/* ══ TICKER ══ */}
        <div style={{ borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)", background:"var(--bg-soft)" }}>
          <p style={{ textAlign:"center", paddingTop:18, fontSize:11, fontWeight:700, color:"var(--text-3)", letterSpacing:".12em", textTransform:"uppercase" }}>
            NATIVE INTEGRATIONS
          </p>
          <Ticker />
        </div>

        {/* ══ WIDGET DEMO ══ */}
        <section id="demo" style={{ padding:"120px 0 80px", position:"relative" }}>
          <div className="section">
            <ParaWrap range={["-5%","5%"]}>
              <div style={{ textAlign:"center", marginBottom:56 }}>
                <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
                  <span className="pill pill-purple"><Wand2 size={11} /> Live Product Demo</span>
                </div>
                <h2 className="serif" style={{ fontSize:52, fontWeight:400, letterSpacing:"-.04em", marginBottom:16, lineHeight:1.1 }}>
                  See it work{" "}
                  <span className="serif-i g-blue">in real time.</span>
                </h2>
                <p style={{ fontSize:17, color:"var(--text-2)", maxWidth:500, margin:"0 auto" }}>
                  A live simulation of ZapBot processing an actual meeting. Every element updates as it would in production.
                </p>
              </div>
            </ParaWrap>

            <Card3D>
              <div style={{ maxWidth:960, margin:"0 auto" }}>
                <MeetingWidget />
              </div>
            </Card3D>
          </div>
        </section>

        {/* ══ HOW IT WORKS ══ */}
        <section style={{ padding:"120px 0", background:"var(--bg-soft)", borderTop:"1px solid var(--border)" }}>
          <div className="section">
            <ParaWrap range={["-4%","4%"]}>
              <div style={{ textAlign:"center", marginBottom:80 }}>
                <span className="pill" style={{ marginBottom:20, display:"inline-flex" }}>
                  <Rocket size={11} /> Setup in 60 seconds
                </span>
                <h2 className="serif" style={{ fontSize:52, fontWeight:400, letterSpacing:"-.04em", lineHeight:1.1, marginTop:16 }}>
                  From zero to automated{" "}
                  <span className="serif-i g-blue">in 3 steps.</span>
                </h2>
              </div>
            </ParaWrap>

            <div className="steps-grid">
              {[
                { n:"01", Icon:Globe,      c:"#2563EB", bg:"#EEF4FF", badge:"30 seconds",
                  title:"Connect your calendar",
                  desc:"Link Google Workspace or Office 365 in one click. ZapBot reads upcoming meetings and auto-schedules itself as a silent attendee." },
                { n:"02", Icon:Mic,        c:"#7C3AED", bg:"#F3F0FF", badge:"Real-time",
                  title:"Bot joins your calls",
                  desc:"ZapBot appears as a silent participant. It transcribes, diarises speakers, detects intents and structures data live as the call happens." },
                { n:"03", Icon:CheckCheck, c:"#059669", bg:"#ECFDF5", badge:"Automated",
                  title:"Tasks created instantly",
                  desc:"Action items, decisions and follow-ups are pushed to your project tools with correct owners and deadlines — before the call ends." },
              ].map((s,i) => (
                <Card3D key={i}>
                  <motion.div className="step-card"
                    whileHover={{ y:-8, borderColor:`${s.c}33`, boxShadow:`0 20px 60px rgba(0,0,0,0.1)` }}
                  >
                    {/* watermark number */}
                    <div style={{
                      position:"absolute", top:-10, right:20, fontSize:110,
                      fontWeight:900, color:"rgba(0,0,0,0.025)",
                      lineHeight:1, userSelect:"none", fontFamily:"'Figtree',sans-serif"
                    }}>{s.n}</div>

                    <div style={{
                      width:64, height:64, borderRadius:18,
                      background:s.bg, border:`1px solid ${s.c}22`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      marginBottom:28, boxShadow:`0 4px 20px ${s.c}18`
                    }}>
                      <s.Icon size={28} color={s.c} />
                    </div>

                    <div style={{ marginBottom:16 }}>
                      <span className="pill pill-green" style={{ fontSize:10, padding:"2px 10px" }}>{s.badge}</span>
                    </div>
                    <h3 style={{ fontSize:22, fontWeight:700, marginBottom:14, letterSpacing:"-.03em" }}>{s.title}</h3>
                    <p style={{ fontSize:15, color:"var(--text-2)", lineHeight:1.72 }}>{s.desc}</p>
                  </motion.div>
                </Card3D>
              ))}
            </div>
          </div>
        </section>

        {/* ══ STATS ══ */}
       {/* ══ STATS ══ */}
<section style={{ padding:"110px 0", borderTop:"1px solid var(--border)", background:"var(--bg)", position:"relative", overflow:"hidden" }}>
  
  {/* Background dot grid */}
  <div style={{
    position:"absolute", inset:0, pointerEvents:"none",
    backgroundImage:"radial-gradient(circle,rgba(0,0,0,0.055) 1px,transparent 1px)",
    backgroundSize:"24px 24px", opacity:.6
  }} />
  
  {/* Soft radial center glow */}
  <div style={{
    position:"absolute", inset:0, pointerEvents:"none",
    background:"radial-gradient(ellipse 80% 60% at 50% 50%, rgba(37,99,235,0.045) 0%, transparent 70%)"
  }} />

  <div className="section" style={{ position:"relative", zIndex:1 }}>

    {/* Header */}
    <ParaWrap range={["-4%","4%"]}>
      <div style={{ textAlign:"center", marginBottom:72 }}>
        <span className="pill" style={{ marginBottom:18, display:"inline-flex" }}>
          <BarChart3 size={11} /> Traction
        </span>
        <h2 className="serif" style={{
          fontSize:52, fontWeight:400, letterSpacing:"-.04em",
          lineHeight:1.1, marginTop:16
        }}>
          Numbers that{" "}
          <span className="serif-i g-blue">speak for themselves.</span>
        </h2>
        <p style={{
          fontSize:17, color:"var(--text-2)", maxWidth:440,
          margin:"16px auto 0", lineHeight:1.7
        }}>
          Trusted by teams at Stripe, Notion, Razorpay and 49,997 others.
        </p>
      </div>
    </ParaWrap>

    {/* Stats grid */}
    <div style={{
      display:"grid",
      gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))",
      gap:0,
      border:"1px solid var(--border-2)",
      borderRadius:24,
      overflow:"hidden",
      boxShadow:"0 4px 24px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
      background:"var(--bg-card)"
    }}>
      {[
        {
          val:50000,   sx:"+",
          label:"Teams worldwide",
          sub:"↑ 340% YoY growth",
          subColor:"#059669",
          Icon:Users,
          accent:"#2563EB", accentBg:"#EEF4FF",
          bar:82
        },
        {
          val:2400000, sx:"+",
          label:"Meetings processed",
          sub:"Across 190+ countries",
          subColor:"var(--text-3)",
          Icon:MessageSquare,
          accent:"#7C3AED", accentBg:"#F3F0FF",
          bar:95
        },
        {
          val:98,      sx:".7%",
          label:"Transcription accuracy",
          sub:"vs. 94.2% industry avg",
          subColor:"#059669",
          Icon:Cpu,
          accent:"#0891B2", accentBg:"#ECFEFF",
          bar:99
        },
        {
          val:12,      sx:" min",
          label:"Saved per meeting",
          sub:"~96 hrs/year per person",
          subColor:"#D97706",
          Icon:Clock,
          accent:"#D97706", accentBg:"#FFFBEB",
          bar:74
        },
      ].map((s, i, arr) => (
        <motion.div key={i}
          initial={{ opacity:0, y:28 }}
          whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }}
          transition={{ delay:i * 0.1, duration:0.6, ease:[0.16,1,0.3,1] }}
          whileHover={{ background:"#FAFAFA" }}
          style={{
            padding:"44px 40px",
            borderRight: i < arr.length - 1 ? "1px solid var(--border)" : "none",
            display:"flex", flexDirection:"column", gap:0,
            position:"relative", cursor:"default",
            transition:"background .2s",
            /* vertical divider on mobile */
            borderBottom: "1px solid var(--border)"
          }}
        >
          {/* Top accent line */}
          <div style={{
            position:"absolute", top:0, left:40, right:40,
            height:2, borderRadius:"0 0 2px 2px",
            background:`linear-gradient(90deg, ${s.accent}, transparent)`,
            opacity:0.55
          }} />

          {/* Icon box */}
          <div style={{
            width:48, height:48, borderRadius:14,
            background:s.accentBg,
            border:`1px solid ${s.accent}22`,
            display:"flex", alignItems:"center", justifyContent:"center",
            marginBottom:24,
            boxShadow:`0 4px 12px ${s.accent}14`
          }}>
            <s.Icon size={20} color={s.accent} />
          </div>

          {/* Number */}
          <div style={{
            fontSize:52, fontWeight:900, letterSpacing:"-.04em",
            lineHeight:1, marginBottom:10,
            fontFamily:"'Figtree',sans-serif",
            color:"var(--text)"
          }}>
            <Counter to={s.val} suffix={s.sx} />
          </div>

          {/* Label */}
          <div style={{
            fontSize:15, fontWeight:600, color:"var(--text)",
            marginBottom:8, letterSpacing:"-.01em"
          }}>
            {s.label}
          </div>

          {/* Sub-label */}
          <div style={{
            fontSize:12.5, color:s.subColor, fontWeight:500, marginBottom:24
          }}>
            {s.sub}
          </div>

          {/* Progress bar */}
          <div style={{
            marginTop:"auto",
            height:4, borderRadius:99,
            background:"rgba(0,0,0,0.06)",
            overflow:"hidden"
          }}>
            <motion.div
              initial={{ width:0 }}
              whileInView={{ width:`${s.bar}%` }}
              viewport={{ once:true }}
              transition={{ delay:i*0.1 + 0.4, duration:1.2, ease:[0.16,1,0.3,1] }}
              style={{
                height:"100%", borderRadius:99,
                background:`linear-gradient(90deg, ${s.accent}, ${s.accent}99)`
              }}
            />
          </div>
        </motion.div>
      ))}
    </div>

    {/* Bottom social proof strip */}
    <motion.div
      initial={{ opacity:0, y:16 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true }}
      transition={{ delay:0.5, duration:0.6 }}
      style={{
        marginTop:32,
        padding:"20px 32px",
        border:"1px solid var(--border)",
        borderRadius:16,
        background:"var(--bg-soft)",
        display:"flex", alignItems:"center",
        justifyContent:"space-between", flexWrap:"wrap", gap:16
      }}
    >
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        {/* Avatar stack */}
        <div style={{ display:"flex" }}>
          {["#2563EB","#7C3AED","#059669","#D97706","#DC2626"].map((c,i) => (
            <div key={i} style={{
              width:32, height:32, borderRadius:"50%",
              background:c, border:"2px solid #fff",
              marginLeft: i===0 ? 0 : -10,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:11, fontWeight:800, color:"#fff",
              boxShadow:"0 1px 4px rgba(0,0,0,0.12)"
            }}>
              {["A","S","R","D","M"][i]}
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize:13.5, fontWeight:600, color:"var(--text)" }}>
            Joined by <strong>50,000+</strong> teams this year
          </div>
          <div style={{ fontSize:12, color:"var(--text-3)" }}>
            Stripe · Razorpay · Notion · Linear · Vercel and more
          </div>
        </div>
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        {/* Star rating */}
        <div style={{ display:"flex", gap:2 }}>
          {[...Array(5)].map((_,i) => (
            <span key={i} style={{ color:"#F59E0B", fontSize:15 }}>★</span>
          ))}
        </div>
        <span style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>4.9</span>
        <span style={{ fontSize:12, color:"var(--text-3)" }}>/ 5 · 2,400+ reviews</span>
        <a href="#" style={{
          marginLeft:8,
          display:"inline-flex", alignItems:"center", gap:5,
          fontSize:12, fontWeight:600, color:"var(--accent)",
          borderBottom:"1px solid rgba(37,99,235,0.3)",
          transition:"border-color .15s"
        }}>
          Read reviews <ArrowRight size={11} />
        </a>
      </div>
    </motion.div>

  </div>
</section>

        {/* ══ FEATURES GRID ══ */}
        <section id="platform" style={{ padding:"120px 0", borderTop:"1px solid var(--border)", background:"var(--bg-soft)" }}>
          <div className="section">
            <ParaWrap range={["-5%","5%"]}>
              <div style={{ textAlign:"center", marginBottom:72 }}>
                <span className="pill" style={{ marginBottom:20, display:"inline-flex" }}>
                  <Layers size={11} /> Platform Capabilities
                </span>
                <h2 className="serif" style={{ fontSize:52, fontWeight:400, letterSpacing:"-.04em", lineHeight:1.1, marginBottom:16, marginTop:16 }}>
                  Everything to eliminate{" "}
                  <span className="serif-i g-blue">meeting busywork.</span>
                </h2>
                <p style={{ fontSize:17, color:"var(--text-2)", maxWidth:480, margin:"0 auto" }}>
                  Six core capabilities that compound into one unfair advantage for your team.
                </p>
              </div>
            </ParaWrap>

            <div className="feat-grid">
              {FEATURES.map((f,i) => (
                <Card3D key={i}>
                  <motion.div className="feat-card"
                    whileHover={{ borderColor:`${f.c}33`, boxShadow:`0 16px 48px rgba(0,0,0,0.09)` }}
                    style={{ height:"100%" }}
                  >
                    <div style={{
                      width:52, height:52, borderRadius:14,
                      background:f.bg, border:`1px solid ${f.c}22`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      marginBottom:24
                    }}>
                      <f.Icon size={22} color={f.c} />
                    </div>
                    <h3 style={{ fontSize:19, fontWeight:700, marginBottom:12, letterSpacing:"-.025em" }}>{f.title}</h3>
                    <p style={{ fontSize:14.5, color:"var(--text-2)", lineHeight:1.76 }}>{f.desc}</p>
                  </motion.div>
                </Card3D>
              ))}
            </div>
          </div>
        </section>

        {/* ══ BENTO VISUAL SECTION ══ */}
        <section id="solutions" style={{ padding:"120px 0", borderTop:"1px solid var(--border)" }}>
          <div className="section">
            <ParaWrap range={["-4%","4%"]}>
              <div style={{ textAlign:"center", marginBottom:64 }}>
                <h2 className="serif" style={{ fontSize:48, fontWeight:400, letterSpacing:"-.04em", marginBottom:14 }}>
                  Everything you need{" "}
                  <span className="serif-i g-blue">to move faster.</span>
                </h2>
                <p style={{ fontSize:17, color:"var(--text-2)", maxWidth:460, margin:"0 auto" }}>
                  High-fidelity capture, enterprise security, and blazing-fast semantic search.
                </p>
              </div>
            </ParaWrap>

            <div className="bento">
              <BentoCard wide accentColor="var(--accent)" iconBg="var(--accent-bg)" Icon={Globe}
                title="Universal Platform Sync"
                desc="ZapBot natively joins Google Meet, Zoom, and MS Teams. No plugins required. It quietly structures data in the background."
                visual={
                  <div style={{ display:"flex", alignItems:"center", gap:20 }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                      {[Video, "💬"].map((Icon,i) => (
                        <motion.div key={i}
                          animate={{ y: i===0 ? [0,-5,0] : [0,5,0] }}
                          transition={{ repeat:Infinity, duration:3+i, ease:"easeInOut" }}
                          style={{
                            width:42, height:42, borderRadius:12, background:"#fff",
                            border:"1px solid var(--border-2)",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            boxShadow:"var(--sh)"
                          }}>
                          {i===0 ? <Video size={18} color="var(--accent)" /> : <span style={{ fontSize:18 }}>💬</span>}
                        </motion.div>
                      ))}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      {[0,1,2].map(i => (
                        <motion.div key={i}
                          animate={{ opacity:[0.2,1,0.2] }}
                          transition={{ repeat:Infinity, duration:1.4, delay:i*.25 }}
                          style={{ width:5, height:5, borderRadius:"50%", background:"var(--accent)" }}
                        />
                      ))}
                    </div>
                    <div style={{
                      width:56, height:56, borderRadius:16, background:"var(--text)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      boxShadow:"0 8px 24px rgba(0,0,0,0.15)"
                    }}>
                      <Database size={24} color="#fff" />
                    </div>
                  </div>
                }
              />

              <BentoCard accentColor="#059669" iconBg="#ECFDF5" Icon={Lock}
                title="SOC2 Type II"
                desc="Enterprise-grade security. We never train foundational models on your data."
                visual={
                  <div style={{ position:"relative", width:80, height:80, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {[1,1.5,2].map((s,i) => (
                      <motion.div key={i}
                        animate={{ scale:[1,s*1.4,s*1.4], opacity:[0.5,0,0] }}
                        transition={{ repeat:Infinity, duration:2.4, delay:i*.4 }}
                        style={{ position:"absolute", width:48, height:48, borderRadius:"50%", border:"1.5px solid #34D399" }}
                      />
                    ))}
                    <div style={{
                      width:48, height:48, borderRadius:14, background:"#fff",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      border:"1px solid #D1FAE5", boxShadow:"0 4px 16px rgba(5,150,105,0.15)",
                      position:"relative", zIndex:1
                    }}>
                      <Lock size={22} color="#059669" />
                    </div>
                  </div>
                }
              />

              <BentoCard accentColor="#7C3AED" iconBg="#F3F0FF" Icon={Search}
                title="Semantic Search"
                desc='Search across all your meetings with natural language. Ask "What did we decide about pricing in Q2?"'
                visual={
                  <div style={{
                    background:"#fff", border:"1px solid var(--border-2)",
                    borderRadius:10, padding:"10px 14px",
                    display:"flex", alignItems:"center", gap:10,
                    boxShadow:"var(--sh)", minWidth:220
                  }}>
                    <Search size={14} color="#7C3AED" />
                    <motion.span
                      animate={{ opacity:[1,0,1] }}
                      transition={{ repeat:Infinity, duration:3 }}
                      style={{ fontSize:12, color:"var(--text-2)" }}
                    >
                      What did we decide about pricing...
                    </motion.span>
                  </div>
                }
              />
            </div>
          </div>
        </section>

        {/* ══ PRICING ══ */}
        <section id="pricing" style={{ padding:"120px 0", borderTop:"1px solid var(--border)", background:"var(--bg-soft)" }}>
          <div className="section">
            <ParaWrap range={["-4%","4%"]}>
              <div style={{ textAlign:"center", marginBottom:64 }}>
                <span className="pill" style={{ marginBottom:20, display:"inline-flex" }}>
                  <Sparkles size={11} /> Pricing
                </span>
                <h2 className="serif" style={{ fontSize:52, fontWeight:400, letterSpacing:"-.04em", marginBottom:16, marginTop:16 }}>
                  Simple,{" "}
                  <span className="serif-i g-blue">transparent</span>
                  {" "}pricing.
                </h2>

                {/* toggle */}
                <div style={{
                  display:"inline-flex", alignItems:"center", gap:14,
                  background:"var(--bg-card)", border:"1px solid var(--border-2)",
                  borderRadius:999, padding:"6px 22px", marginTop:24,
                  boxShadow:"var(--sh)"
                }}>
                  <span style={{ fontSize:13, fontWeight:600, color: !annual ? "var(--text)" : "var(--text-3)" }}>Monthly</span>
                  <button onClick={() => setAnnual(v => !v)} style={{
                    width:46, height:24, borderRadius:999, border:"none",
                    background: annual ? "var(--text)" : "var(--bg-2)",
                    position:"relative", transition:"all .3s", cursor:"pointer"
                  }}>
                    <motion.div animate={{ x: annual ? 22 : 2 }} transition={{ type:"spring", stiffness:400, damping:25 }}
                      style={{ width:20, height:20, borderRadius:"50%", background:"#fff", position:"absolute", top:2, boxShadow:"0 2px 6px rgba(0,0,0,0.3)" }} />
                  </button>
                  <span style={{ fontSize:13, fontWeight:600, color: annual ? "var(--text)" : "var(--text-3)" }}>
                    Annual <span style={{ color:"var(--success)", fontSize:11 }}>-20%</span>
                  </span>
                </div>
              </div>
            </ParaWrap>

            <div className="price-grid">
              {[
                {
                  name:"Starter", price:0, label:"Free forever",
                  desc:"Perfect for individuals and small teams getting started.",
                  features:["5 meetings / month","Basic transcription","Email summaries","1 integration"],
                  cta:"Get Started", pro:false
                },
                {
                  name:"Pro", price: annual ? 19 : 24, label:"per seat / mo",
                  desc:"For teams that run on meetings and need full automation.",
                  features:["Unlimited meetings","Real-time transcription","AI action detection","All integrations","Meeting analytics","SOC2 compliance"],
                  cta:"Start Free Trial", pro:true
                },
                {
                  name:"Enterprise", price:null, label:"Custom pricing",
                  desc:"For large orgs with custom security, compliance and SLA needs.",
                  features:["Everything in Pro","Custom SSO / SAML","Dedicated bot infra","SLA guarantees","Audit logs + DLP","Priority support"],
                  cta:"Contact Sales", pro:false
                },
              ].map((plan,i) => (
                <motion.div key={i} className={`price-card ${plan.pro ? "price-card-pro" : ""}`}
                  initial={{ opacity:0, y:32 }} whileInView={{ opacity:1, y:0 }}
                  viewport={{ once:true }} transition={{ delay:i*.12 }}
                  whileHover={{ y:-6 }}
                >
                  {plan.pro && (
                    <div style={{ marginBottom:20 }}>
                      <span className="pill" style={{ fontSize:10 }}><Sparkles size={10} /> Most Popular</span>
                    </div>
                  )}
                  <div style={{ marginBottom:8 }}>
                    <span style={{ fontSize:13, fontWeight:700, color: plan.pro ? "rgba(255,255,255,0.6)" : "var(--text-2)", textTransform:"uppercase", letterSpacing:".09em" }}>
                      {plan.name}
                    </span>
                  </div>
                  <div style={{ marginBottom:14 }}>
                    {plan.price !== null ? (
                      <div style={{ display:"flex", alignItems:"baseline", gap:5 }}>
                        <span style={{ fontSize:52, fontWeight:900, letterSpacing:"-.04em" }}>
                          {plan.price===0 ? "Free" : `$${plan.price}`}
                        </span>
                        {plan.price > 0 && (
                          <span style={{ color: plan.pro ? "rgba(255,255,255,0.45)" : "var(--text-3)", fontSize:14 }}>{plan.label}</span>
                        )}
                      </div>
                    ) : (
                      <div style={{ fontSize:38, fontWeight:900 }}>Custom</div>
                    )}
                  </div>
                  <p style={{ fontSize:14, color: plan.pro ? "rgba(255,255,255,0.55)" : "var(--text-2)", lineHeight:1.65, marginBottom:28 }}>{plan.desc}</p>

                  <div style={{ flex:1, display:"flex", flexDirection:"column", gap:13, marginBottom:32 }}>
                    {plan.features.map((f,j) => (
                      <div key={j} style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <CheckCircle2 size={15} color={plan.pro ? "#a5b4fc" : "var(--success)"} />
                        <span style={{ fontSize:14, color: plan.pro ? "rgba(255,255,255,0.75)" : "var(--text-2)" }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  {plan.pro ? (
                    <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                      <button className="btn-dark" style={{
                        justifyContent:"center", width:"100%",
                        background:"#fff", color:"#0C0C0C",
                        fontFamily:"inherit"
                      }}>
                        {plan.cta} <ArrowRight size={14} />
                      </button>
                    </SignUpButton>
                  ) : (
                    <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                      <button className="btn-outline" style={{ justifyContent:"center", width:"100%", fontFamily:"inherit" }}>
                        {plan.cta}
                      </button>
                    </SignUpButton>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ TESTIMONIALS ══ */}
        <section style={{ padding:"120px 0", borderTop:"1px solid var(--border)" }}>
          <div className="section">
            <ParaWrap range={["-4%","4%"]}>
              <div style={{ textAlign:"center", marginBottom:72 }}>
                <h2 className="serif" style={{ fontSize:52, fontWeight:400, letterSpacing:"-.04em", lineHeight:1.1 }}>
                  Loved by{" "}
                  <span className="serif-i g-blue">thousands of teams.</span>
                </h2>
              </div>
            </ParaWrap>

            <div className="testi-grid">
              {[
                { name:"Arjun Mehta",     role:"Head of Product @ Razorpay", av:"AM", c:"#2563EB",
                  text:"ZapBot cut our post-meeting admin by 90%. Tasks appear in Linear before we've even left the call. Genuinely magical." },
                { name:"Sophie Williams", role:"Eng Manager @ Stripe",       av:"SW", c:"#7C3AED",
                  text:"We were drowning in meeting notes. ZapBot fixed that overnight. The accuracy on technical vocabulary is incredible." },
                { name:"Carlos Mendes",   role:"CEO @ Fintech Startup",      av:"CM", c:"#059669",
                  text:"I've tried every notetaking tool. ZapBot is in a different league. The intent detection alone saves my team ~2 hrs/day." },
              ].map((t,i) => (
                <motion.div key={i} className="testi-card"
                  initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
                  viewport={{ once:true }} transition={{ delay:i*.12 }}
                  whileHover={{ y:-6, borderColor:`${t.c}22` }}
                >
                  <div style={{ display:"flex", gap:3, marginBottom:20 }}>
                    {[...Array(5)].map((_,j) => (
                      <span key={j} style={{ color:"#F59E0B", fontSize:16 }}>★</span>
                    ))}
                  </div>
                  <p style={{ fontSize:15.5, color:"var(--text-2)", lineHeight:1.76, marginBottom:28, fontStyle:"italic" }}>
                    "{t.text}"
                  </p>
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <div style={{
                      width:44, height:44, borderRadius:"50%",
                      background:`${t.c}12`, border:`1px solid ${t.c}22`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:13, fontWeight:800, color:t.c
                    }}>{t.av}</div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:14 }}>{t.name}</div>
                      <div style={{ fontSize:12, color:"var(--text-3)" }}>{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ FINAL CTA ══ */}
        <section style={{ padding:"130px 0 160px", textAlign:"center", position:"relative", overflow:"hidden",
          background:"var(--bg-soft)", borderTop:"1px solid var(--border)" }}>
          {/* dot grid */}
          <div style={{
            position:"absolute", inset:0, zIndex:0, pointerEvents:"none",
            backgroundImage:"radial-gradient(circle,rgba(0,0,0,0.07) 1px,transparent 1px)",
            backgroundSize:"22px 22px", opacity:.55
          }} />
          <div style={{
            position:"absolute", inset:0, zIndex:0, pointerEvents:"none",
            background:"radial-gradient(ellipse 60% 60% at 50% 50%, rgba(37,99,235,0.06) 0%, transparent 70%)"
          }} />

          <div className="section" style={{ position:"relative", zIndex:1 }}>
            <motion.div initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:.8 }}>
              <div style={{ display:"flex", justifyContent:"center", marginBottom:28 }}>
                <div style={{
                  width:72, height:72, borderRadius:22,
                  background:"var(--text)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow:"0 8px 32px rgba(0,0,0,0.2)"
                }}>
                  <Zap size={32} color="#fff" fill="#fff" />
                </div>
              </div>
              <h2 className="serif" style={{ fontSize:68, fontWeight:400, letterSpacing:"-.04em", lineHeight:1.05, marginBottom:24 }}>
                Stop taking notes.<br />
                <span className="serif-i g-blue">Start taking action.</span>
              </h2>
              <p style={{ fontSize:20, color:"var(--text-2)", maxWidth:500, margin:"0 auto 48px", lineHeight:1.72 }}>
                Join 50,000+ teams who let ZapBot handle the admin so they can focus on what actually matters.
              </p>
              <div style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap" }}>
                <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                  <button className="btn-dark" style={{ padding:"18px 48px", fontSize:17, fontFamily:"inherit" }}>
                    Get Started — Free <ArrowRight size={17} />
                  </button>
                </SignUpButton>
                <button className="btn-outline" style={{ padding:"18px 36px", fontSize:17 }}>
                  Schedule a Demo
                </button>
              </div>
              <p style={{ marginTop:24, fontSize:13, color:"var(--text-3)" }}>
                No credit card · Setup in 60 seconds · Cancel anytime
              </p>
            </motion.div>
          </div>
        </section>

        {/* ══ FOOTER ══ */}
        <footer className="footer">
          <div className="section">
            <div className="footer-grid">
              <div>
                <a href="/" style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                  <div style={{
                    width:30, height:30, borderRadius:9, background:"var(--text)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    boxShadow:"0 2px 8px rgba(0,0,0,0.2)"
                  }}>
                    <Zap size={14} color="#fff" fill="#fff" />
                  </div>
                  <span style={{ fontSize:17, fontWeight:800 }}>ZapBot</span>
                </a>
                <p style={{ fontSize:13.5, color:"var(--text-3)", lineHeight:1.75, maxWidth:200 }}>
                  The AI meeting assistant that works as hard as you do.
                </p>
                <div style={{ display:"flex", gap:10, marginTop:20 }}>
                  {[Twitter,Github,Linkedin].map((Icon,i) => (
                    <a key={i} href="#" style={{
                      width:36, height:36, borderRadius:9,
                      background:"var(--bg-card)", border:"1px solid var(--border-2)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      color:"var(--text-3)", transition:"all .2s", boxShadow:"var(--sh)"
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor="var(--accent)"; e.currentTarget.style.color="var(--accent)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border-2)"; e.currentTarget.style.color="var(--text-3)"; }}
                    >
                      <Icon size={15} />
                    </a>
                  ))}
                </div>
              </div>

              {[
                { title:"Product",  links:["Platform","Integrations","API Docs","Changelog","Status"]  },
                { title:"Company",  links:["About","Blog","Careers","Press","Contact"]                 },
                { title:"Legal",    links:["Privacy Policy","Terms","Cookie Policy","GDPR","SOC2"]     },
              ].map((col,i) => (
                <div key={i}>
                  <h4 style={{ fontSize:11, fontWeight:800, color:"var(--text)", textTransform:"uppercase", letterSpacing:".1em", marginBottom:20 }}>
                    {col.title}
                  </h4>
                  <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
                    {col.links.map(link => (
                      <a key={link} href="#" style={{ fontSize:14, color:"var(--text-3)", transition:"color .15s" }}
                        onMouseEnter={e => e.currentTarget.style.color="var(--text)"}
                        onMouseLeave={e => e.currentTarget.style.color="var(--text-3)"}
                      >{link}</a>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <hr className="divider" style={{ marginBottom:32 }} />
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                <span style={{ fontSize:13, color:"var(--text-3)" }}>© 2026 ZapBot AI Inc. All rights reserved.</span>
                <span style={{ fontSize:11, color:"var(--text-3)", opacity:0.6 }}>Made with passion by <a href="https://pratapsingh.tech" target="_blank" rel="noopener noreferrer" style={{ textDecoration:"underline" }}>pratapsingh.tech</a></span>
              </div>
              <span className="pill pill-green" style={{ fontSize:10 }}>
                <span style={{ width:5, height:5, background:"#22C55E", borderRadius:"50%", display:"inline-block" }} />
                All systems operational
              </span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}