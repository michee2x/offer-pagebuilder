"use client";
import { useEffect, useState, useRef, useCallback } from "react";

/* ─────────────────────────────── FONTS (injected once) ─────────────────────── */
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=Inter:wght@400;500;600;700&display=swap";

/* ─────────────────────────── COUNTDOWN TIMER ──────────────────────────────── */
function useTimer() {
  const [time, setTime] = useState({ h: 11, m: 59, s: 42 });
  useEffect(() => {
    const KEY = "oiq_fe_ddl";
    let ddl = Number(localStorage.getItem(KEY) || 0);
    if (!ddl || ddl < Date.now()) {
      ddl = Date.now() + (11 * 3600 + 59 * 60 + 42) * 1000;
      localStorage.setItem(KEY, String(ddl));
    }
    const tick = () => {
      const d = Math.max(0, ddl - Date.now());
      setTime({ h: Math.floor(d / 3600000), m: Math.floor((d % 3600000) / 60000), s: Math.floor((d % 60000) / 1000) });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(time.h)}:${p(time.m)}:${p(time.s)}`;
}

/* ─────────────────────────── SCROLL REVEAL ────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [v, sv] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { sv(true); io.disconnect(); } }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, v };
}
function Rev({ children, d = 0, cls = "" }: { children: React.ReactNode; d?: number; cls?: string }) {
  const { ref, v } = useReveal();
  return (
    <div ref={ref} style={{ transitionDelay: `${d}ms` }} className={`rev ${v ? "rev-in" : ""} ${cls}`}>
      {children}
    </div>
  );
}

/* ─────────────────────────── COUNT-UP ─────────────────────────────────────── */
function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); io.disconnect(); } }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    let start = 0;
    const dur = 1400;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      setVal(Math.floor(p * to));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ─────────────────────────── FAQ ITEM ─────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? "open" : ""}`}>
      <button className="faq-q" onClick={() => setOpen(!open)}>
        <span>{q}</span>
        <span className="faq-plus">{open ? "−" : "+"}</span>
      </button>
      <div className="faq-a" style={{ maxHeight: open ? 400 : 0 }}>
        <p>{a}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────── MINI-CTA (sticky bottom) ─────────────────────── */
function MiniCta() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const h = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <div className={`mini-cta ${show ? "mini-cta--show" : ""}`}>
      <span className="mini-cta__label">Founder's Price — $49 One-Time</span>
      <a href="#pricing" className="btn btn-primary" style={{ animation: "none", padding: "11px 22px", fontSize: 14 }}>
        Build My First Offer →
      </a>
    </div>
  );
}

/* ─────────────────────────── MAIN PAGE ────────────────────────────────────── */
export default function FEPage() {
  const timer = useTimer();

  return (
    <>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href={FONT_HREF} rel="stylesheet" />

      <style>{`
/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════════════ */
:root {
  --bg:       #0A0A12;
  --bg-soft:  #0D0D18;
  --card:     #12121E;
  --card-alt: #151522;
  --border:   #232336;
  --bsoft:    #1B1B2A;
  --text:     #F5F5FA;
  --text2:    #B0B0C4;
  --text3:    #6E6E85;
  --purple:   #7C5CFC;
  --blue:     #4F8FFF;
  --green:    #1FB27A;
  --red:      #E15656;
  --gold:     linear-gradient(90deg,#F5D77E,#D9A94A);
  --grad:     linear-gradient(90deg,#6D5EF8,#4F8FFF);
  --grad-t:   linear-gradient(90deg,#8B7CFF,#4F8FFF);
  --r:        20px;
  --rsm:      12px;
  --maxw:     1120px;
}

/* ═══════════════════════════════════════════════════════════
   BASE
═══════════════════════════════════════════════════════════ */
.sp { box-sizing:border-box; margin:0; padding:0; }
.sp *, .sp *::before, .sp *::after { box-sizing:border-box; }
.sp { background:var(--bg); color:var(--text); font-family:'Inter',system-ui,sans-serif;
      line-height:1.6; overflow-x:hidden; -webkit-font-smoothing:antialiased; }
.sp h1,.sp h2,.sp h3,.sp h4 { font-family:'Manrope',sans-serif; font-weight:800;
  letter-spacing:-0.02em; line-height:1.12; }
.sp a { color:inherit; text-decoration:none; }
.sp ul { list-style:none; }

/* ═══════════════════════════════════════════════════════════
   LAYOUT
═══════════════════════════════════════════════════════════ */
.wrap { max-width:var(--maxw); margin:0 auto; padding:0 24px; }
.sect { padding:96px 0; position:relative; }
.sect.tight { padding:64px 0; }
.sect-head { text-align:center; max-width:760px; margin:0 auto 56px; }
.sect-head h2 { font-size:clamp(28px,4vw,40px); margin-top:16px; }
.sect-head p { color:var(--text2); font-size:17px; margin-top:14px; }
.light { background:#F7F7FC; color:#14141F; --card:#fff; --card-alt:#F1F0FA;
         --border:#E6E5F2; --bsoft:#EDECF7; --text:#14141F; --text2:#54546A; --text3:#8B8BA3; }
.split { display:grid; grid-template-columns:1fr 1fr; gap:56px; align-items:center; }
.split.rev-dir { direction:rtl; }
.split.rev-dir > * { direction:ltr; }
@media (max-width:860px) { .split { grid-template-columns:1fr; gap:36px; } .split.rev-dir { direction:ltr; } }
@media (max-width:640px) { .sect { padding:64px 0; } .sect-head h2 { font-size:28px; } }

/* ═══════════════════════════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════════════════════════ */
.rev { opacity:0; transform:translateY(26px);
  transition:opacity .7s cubic-bezier(.2,.7,.3,1),transform .7s cubic-bezier(.2,.7,.3,1); }
.rev-in { opacity:1; transform:none; }
@media (prefers-reduced-motion:reduce) { .rev { opacity:1 !important; transform:none !important; transition:none !important; } }

/* ═══════════════════════════════════════════════════════════
   BANNER
═══════════════════════════════════════════════════════════ */
.banner { background:linear-gradient(90deg,#1c1430,#1a1030 60%,#101425);
  border-bottom:1px solid var(--bsoft); text-align:center; padding:10px 16px;
  font-size:13.5px; color:#E9D9A8; font-weight:600; position:sticky; top:0; z-index:80; }
.timer-dig { display:inline-flex; gap:5px; margin-left:8px; }
.timer-dig span { background:#00000088; border:1px solid #ffffff22; border-radius:6px;
  padding:2px 8px; font-variant-numeric:tabular-nums; color:#fff; font-weight:700; font-family:'JetBrains Mono',monospace; }

/* ═══════════════════════════════════════════════════════════
   NAV
═══════════════════════════════════════════════════════════ */
.topnav { position:sticky; top:37px; z-index:70; background:rgba(10,10,18,.88);
  backdrop-filter:blur(12px); border-bottom:1px solid var(--bsoft); }
.topnav .wrap { display:flex; align-items:center; justify-content:space-between; height:68px; }
.logo { display:flex; align-items:center; gap:3px; font-family:'Manrope'; font-weight:800;
  font-size:20px; color:#fff; }
.logo-badge { background:var(--grad); color:#fff; font-size:11px; font-weight:800;
  padding:2px 7px; border-radius:6px; margin-left:2px; }
.navlinks { display:flex; gap:32px; font-size:14px; color:var(--text2); font-weight:500; }
.navlinks a:hover { color:#fff; }
.btn-nav { background:var(--grad); color:#fff; font-weight:700; font-size:13.5px;
  padding:9px 20px; border-radius:10px; transition:transform .15s; }
.btn-nav:hover { transform:translateY(-1px); }
@media (max-width:820px) { .navlinks { display:none; } }

/* ═══════════════════════════════════════════════════════════
   MINI-CTA (sticky bottom)
═══════════════════════════════════════════════════════════ */
.mini-cta { position:fixed; left:0; right:0; bottom:-90px; z-index:75;
  background:rgba(10,10,18,.92); backdrop-filter:blur(10px);
  border-top:1px solid #2a2a44; padding:14px 20px;
  display:flex; align-items:center; justify-content:center; gap:18px;
  transition:bottom .35s cubic-bezier(.2,.7,.3,1); }
.mini-cta--show { bottom:0; }
.mini-cta__label { color:#fff; font-size:14px; font-weight:600; }
@media (max-width:560px) { .mini-cta__label { display:none; } }

/* ═══════════════════════════════════════════════════════════
   BUTTONS
═══════════════════════════════════════════════════════════ */
.btn { display:inline-flex; align-items:center; justify-content:center; gap:8px;
  font-family:'Manrope'; font-weight:800; font-size:16px; padding:17px 30px;
  border-radius:14px; cursor:pointer; border:none; text-decoration:none;
  transition:transform .15s ease,box-shadow .15s ease; }
.btn-primary { background:var(--grad); color:#fff;
  box-shadow:0 8px 30px -8px rgba(124,92,252,.6);
  animation:pulseglow 3.5s ease-in-out 2; }
.btn-primary:hover { transform:translateY(-2px); box-shadow:0 14px 36px -6px rgba(124,92,252,.85); }
.btn-lg { font-size:18px; padding:20px 40px; border-radius:16px; }
@keyframes pulseglow {
  0%,100% { box-shadow:0 8px 30px -8px rgba(124,92,252,.55); }
  50%      { box-shadow:0 10px 44px -4px rgba(124,92,252,.95); }
}
.ctas { display:flex; gap:16px; justify-content:center; flex-wrap:wrap; }
.microcopy { color:var(--text3); font-size:13.5px; margin-top:16px; text-align:center; }

/* ═══════════════════════════════════════════════════════════
   EYEBROW LABELS
═══════════════════════════════════════════════════════════ */
.eyebrow { display:inline-block; background:var(--gold); color:#20180a;
  font-family:'Manrope'; font-weight:800; font-size:12px; letter-spacing:.06em;
  padding:7px 18px; border-radius:999px; text-transform:uppercase; }
.eyebrow-dot { display:inline-flex; align-items:center; gap:8px;
  background:rgba(124,92,252,.12); border:1px solid rgba(124,92,252,.35);
  color:#8F6FFF; font-size:13px; font-weight:600; padding:7px 18px; border-radius:999px; }
.eyebrow-dot i { width:6px; height:6px; border-radius:50%; background:var(--purple); display:inline-block; }
.light .eyebrow-dot { color:#5B3FD1; }

/* ═══════════════════════════════════════════════════════════
   GRADIENT TEXT
═══════════════════════════════════════════════════════════ */
.grad-text { background:var(--grad-t); -webkit-background-clip:text; background-clip:text; color:transparent; }

/* ═══════════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════════ */
.hero { padding:88px 0 64px; text-align:center; overflow:hidden; position:relative; }
.blob { position:absolute; border-radius:50%; filter:blur(70px); z-index:0; animation:bfloat 9s ease-in-out infinite alternate; }
.blob1 { width:420px; height:420px; background:rgba(124,92,252,.35); top:-140px; left:-100px; }
.blob2 { width:380px; height:380px; background:rgba(79,143,255,.28); top:0; right:-120px; animation-delay:1.5s; }
@keyframes bfloat { 0%{transform:translate(0,0);} 100%{transform:translate(30px,-30px);} }
.hero .wrap { position:relative; z-index:1; }
.hero h1 { font-size:clamp(32px,5vw,52px); max-width:920px; margin:20px auto 0; }
.hero .sub { color:var(--text2); font-size:18px; max-width:700px; margin:22px auto 0; }

/* ═══════════════════════════════════════════════════════════
   PATH CARDS
═══════════════════════════════════════════════════════════ */
.path-cards { display:grid; grid-template-columns:1fr 1fr; gap:18px; max-width:880px; margin:44px auto 0; text-align:left; }
@media (max-width:700px) { .path-cards { grid-template-columns:1fr; } }
.path-card { background:var(--card); border:1px solid var(--border); border-radius:var(--r);
  padding:26px; transition:transform .25s,box-shadow .25s; }
.path-card:hover { transform:translateY(-4px); box-shadow:0 16px 40px -10px rgba(124,92,252,.25); }
.path-card .tag { font-size:11.5px; color:var(--purple); font-weight:700; letter-spacing:.06em; text-transform:uppercase; }
.path-card h4 { font-size:16.5px; font-family:'Manrope'; font-weight:700; margin-top:10px; }
.path-card p { color:var(--text2); font-size:14px; margin-top:8px; }

/* ═══════════════════════════════════════════════════════════
   VIDEO SLOT
═══════════════════════════════════════════════════════════ */
.video-slot { max-width:820px; margin:52px auto 0; aspect-ratio:16/9;
  background:linear-gradient(145deg,#171426,#0d0d16);
  border:1px solid var(--border); border-radius:var(--r);
  display:flex; align-items:center; justify-content:center; flex-direction:column; gap:14px;
  position:relative; overflow:hidden; cursor:pointer; }
.video-slot::before { content:""; position:absolute; inset:0;
  background:radial-gradient(circle at 50% 50%,rgba(124,92,252,.22),transparent 65%); }
.playbtn { width:68px; height:68px; border-radius:50%; background:var(--grad);
  display:flex; align-items:center; justify-content:center; z-index:1;
  box-shadow:0 10px 40px -6px rgba(124,92,252,.7); transition:transform .2s; }
.playbtn:hover { transform:scale(1.08); }
.video-label { color:var(--text3); font-size:13px; z-index:1; letter-spacing:.03em; }

/* ═══════════════════════════════════════════════════════════
   TESTIMONIALS
═══════════════════════════════════════════════════════════ */
.testi-strip { display:flex; gap:16px; max-width:1000px; margin:52px auto 0;
  overflow-x:auto; padding-bottom:8px; scrollbar-width:thin; }
.testi { min-width:290px; background:var(--card); border:1px solid var(--border);
  border-radius:var(--rsm); padding:20px; text-align:left; font-size:14px; color:var(--text2);
  transition:transform .2s; flex-shrink:0; }
.testi:hover { transform:translateY(-3px); }
.testi-who { display:flex; align-items:center; gap:10px; margin-top:14px; }
.testi-avatar { width:32px; height:32px; border-radius:50%; background:var(--grad);
  flex-shrink:0; display:flex; align-items:center; justify-content:center;
  font-size:12px; font-weight:800; color:#fff; font-family:'Manrope'; }
.testi-name { font-size:13px; color:var(--text); font-weight:600; }
.testi-role { font-size:12px; color:var(--text3); }
.sample-flag { font-size:11px; color:#C99A2E; margin-top:8px; display:block; }

/* ═══════════════════════════════════════════════════════════
   PROSE (text blocks in split sections)
═══════════════════════════════════════════════════════════ */
.prose p { color:var(--text2); font-size:16px; margin-top:16px; line-height:1.75; }
.prose p:first-child { margin-top:0; }
.prose strong { color:var(--text); font-weight:700; }
.pullquote { background:var(--card-alt); border-left:3px solid var(--purple);
  border-radius:0 var(--rsm) var(--rsm) 0; padding:18px 22px; margin-top:22px;
  font-size:15.5px; font-weight:600; color:var(--text); }
.light .pullquote { background:#EAE8FD; }
.hl-p { color:var(--purple); font-weight:700; }
.hl-gold { color:#B8860B; font-weight:700; }
.light .hl-gold { color:#8B5E00; }

/* ═══════════════════════════════════════════════════════════
   ILLUSTRATION BOXES
═══════════════════════════════════════════════════════════ */
.illus-box { background:var(--card); border:1px solid var(--border); border-radius:var(--r);
  padding:28px; display:flex; align-items:center; justify-content:center; min-height:240px; }
.light .illus-box { background:#fff; border-color:#E6E5F2; }

/* ═══════════════════════════════════════════════════════════
   WORKAROUND CARDS
═══════════════════════════════════════════════════════════ */
.wcards { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
@media (max-width:720px) { .wcards { grid-template-columns:1fr; } }
.wcard { background:var(--card); border:1px solid var(--border); border-radius:var(--r);
  padding:26px; position:relative; overflow:hidden; transition:transform .2s; }
.wcard:hover { transform:translateY(-3px); }
.wcard-tag { font-size:11px; letter-spacing:.06em; color:var(--text3); font-family:'Inter'; }
.wcard-stamp { position:absolute; top:22px; right:22px; font-size:10px; font-weight:700;
  color:var(--red); border:1px solid var(--red); padding:3px 9px; border-radius:6px;
  transform:rotate(4deg); letter-spacing:.03em; }
.wcard-icon { width:42px; height:42px; border-radius:12px; display:flex; align-items:center;
  justify-content:center; margin:14px 0 12px; font-size:18px; }
.wcard h4 { font-size:16px; font-family:'Manrope'; font-weight:700; }
.wcard-cost { color:var(--red); font-weight:700; font-size:13.5px; margin-top:8px; }
.wcard p { color:var(--text2); font-size:14px; margin-top:8px; }

/* ═══════════════════════════════════════════════════════════
   CHIPS (audience tags)
═══════════════════════════════════════════════════════════ */
.chips { display:flex; flex-wrap:wrap; gap:12px; justify-content:center; max-width:700px; margin:0 auto; }
.chip { background:var(--card); border:1px solid var(--border); border-radius:999px;
  padding:11px 22px; font-size:14px; color:var(--text2); transition:transform .15s; }
.chip:hover { transform:translateY(-2px); border-color:rgba(124,92,252,.4); }

/* ═══════════════════════════════════════════════════════════
   TRAP / STAT CARDS
═══════════════════════════════════════════════════════════ */
.traps { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
@media (max-width:900px) { .traps { grid-template-columns:1fr; } }
.trap-card { background:var(--card); border:1px solid var(--border); border-radius:var(--r);
  padding:28px; transition:transform .25s; }
.trap-card:hover { transform:translateY(-4px); }
.light .trap-card { background:#fff; border-color:#E6E5F2; }
.trap-icon { width:56px; height:56px; border-radius:14px; display:flex; align-items:center;
  justify-content:center; margin-bottom:20px; }
.trap-label { font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:var(--text3); font-weight:700; }
.trap-stat { font-family:'Manrope'; font-weight:800; font-size:44px; margin-top:6px; line-height:1; }
.trap-card p { color:var(--text2); font-size:14px; margin-top:14px; }
.trap-src { color:var(--text3); font-size:12px; margin-top:10px; display:block; }

/* ═══════════════════════════════════════════════════════════
   REPLACE THE STACK ROWS
═══════════════════════════════════════════════════════════ */
.stack-list { max-width:820px; margin:0 auto; display:flex; flex-direction:column; gap:10px; }
.stack-row { display:flex; align-items:center; justify-content:space-between; gap:20px;
  background:var(--card); border:1px solid var(--border); border-radius:var(--rsm);
  padding:18px 24px; flex-wrap:wrap; transition:transform .15s; }
.stack-row:hover { transform:translateX(4px); }
.light .stack-row { background:#fff; border-color:#E6E5F2; }
.stack-name { font-size:15px; font-weight:600; color:var(--text); }
.light .stack-name { color:#14141F; }
.stack-right { display:flex; align-items:center; gap:16px; }
.stack-old { color:var(--text3); text-decoration:line-through; font-size:13.5px; }
.stack-incl { color:var(--green); font-weight:700; font-size:13.5px; display:flex; align-items:center; gap:6px; }

/* ═══════════════════════════════════════════════════════════
   FEATURE GRID
═══════════════════════════════════════════════════════════ */
.feat-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
@media (max-width:900px) { .feat-grid { grid-template-columns:1fr 1fr; } }
@media (max-width:600px) { .feat-grid { grid-template-columns:1fr; } }
.feat-card { background:var(--card); border:1px solid var(--border); border-radius:var(--r);
  padding:24px; transition:transform .2s,box-shadow .2s; }
.feat-card:hover { transform:translateY(-4px); box-shadow:0 14px 40px -10px rgba(124,92,252,.2); }
.feat-icon { width:46px; height:46px; border-radius:12px; display:flex; align-items:center;
  justify-content:center; margin-bottom:14px; background:rgba(124,92,252,.12); font-size:22px; }
.feat-card h4 { font-size:16px; font-family:'Manrope'; font-weight:700; }
.feat-card p { color:var(--text2); font-size:13.5px; margin-top:8px; }

/* ═══════════════════════════════════════════════════════════
   PROCESS STEPS
═══════════════════════════════════════════════════════════ */
.steps { max-width:760px; margin:0 auto; display:flex; flex-direction:column; }
.step { display:flex; gap:22px; padding:26px 0; border-bottom:1px solid var(--bsoft); }
.step:last-child { border-bottom:none; }
.light .step { border-color:#EDECF7; }
.step-num { font-family:'Manrope'; font-weight:800; font-size:20px; color:transparent;
  -webkit-text-stroke:1.4px rgba(124,92,252,.6); flex-shrink:0; width:44px; padding-top:2px; }
.step-body h4 { font-size:17px; font-family:'Manrope'; font-weight:700; }
.step-time { color:var(--purple); font-size:12px; font-weight:700; margin-left:10px; }
.step-body p { color:var(--text2); font-size:14px; margin-top:6px; }

/* ═══════════════════════════════════════════════════════════
   FOR / NOT FOR GRID
═══════════════════════════════════════════════════════════ */
.fit-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
@media (max-width:720px) { .fit-grid { grid-template-columns:1fr; } }
.fit-card { border-radius:var(--r); padding:30px; border:1px solid var(--border); }
.fit-card.yes { background:linear-gradient(160deg,rgba(31,178,122,.08),var(--card)); }
.fit-card.no { background:linear-gradient(160deg,rgba(225,86,86,.06),var(--card)); }
.fit-card h4 { font-family:'Manrope'; font-size:18px; margin-bottom:16px; }
.fit-list { display:flex; flex-direction:column; gap:12px; }
.fit-list li { display:flex; gap:10px; font-size:14.5px; color:var(--text2); }
.fit-list .tick { font-weight:800; flex-shrink:0; }
.fit-list .tick.y { color:var(--green); }
.fit-list .tick.n { color:var(--red); }

/* ═══════════════════════════════════════════════════════════
   VALUE TABLE
═══════════════════════════════════════════════════════════ */
.value-table { max-width:760px; margin:0 auto; border:1px solid var(--border); border-radius:var(--r); overflow:hidden; background:var(--card); }
.value-row { display:flex; justify-content:space-between; align-items:center;
  padding:15px 24px; border-bottom:1px solid var(--bsoft); font-size:14.5px; gap:12px; }
.value-row .vitem { color:var(--text2); flex:1; }
.value-row .vval { color:var(--text); font-weight:700; white-space:nowrap; }
.value-row.vtotal { background:var(--card-alt); }
.value-row.vtotal .vitem { color:var(--text); font-weight:700; }
.value-row.vprice { background:rgba(31,178,122,.08); border-bottom:none; }
.value-row.vprice .vitem { color:var(--text); font-family:'Manrope'; font-weight:800; font-size:17px; }
.value-row.vprice .vval { color:var(--green); font-family:'Manrope'; font-weight:800; font-size:28px; }
.value-note { font-size:11.5px; color:var(--text3); text-align:center; margin-top:12px; }

/* ═══════════════════════════════════════════════════════════
   VERSUS PANEL
═══════════════════════════════════════════════════════════ */
.versus { display:grid; grid-template-columns:1fr 1fr; max-width:920px; margin:0 auto;
  border-radius:var(--r); overflow:hidden; border:1px solid var(--border); }
@media (max-width:760px) { .versus { grid-template-columns:1fr; } }
.versus-col { padding:30px; }
.versus-col.old { background:rgba(225,86,86,.06); }
.versus-col.new { background:rgba(31,178,122,.08); }
.versus-col h4 { font-family:'Manrope'; font-size:14px; text-transform:uppercase; letter-spacing:.04em; margin-bottom:18px; }
.versus-col.old h4 { color:var(--red); }
.versus-col.new h4 { color:var(--green); }
.versus-row { display:flex; gap:10px; font-size:14px; color:var(--text2); padding:10px 0; border-top:1px solid var(--bsoft); }
.versus-row:first-of-type { border-top:none; }
.versus-col.old .versus-row::before { content:"✗"; color:var(--red); font-weight:800; flex-shrink:0; }
.versus-col.new .versus-row::before { content:"✓"; color:var(--green); font-weight:800; flex-shrink:0; }

/* ═══════════════════════════════════════════════════════════
   BONUS CARDS
═══════════════════════════════════════════════════════════ */
.bonus-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
@media (max-width:820px) { .bonus-grid { grid-template-columns:1fr; } }
.bonus-card { background:var(--card); border:1px solid var(--border); border-radius:var(--r);
  padding:24px; text-align:center; transition:transform .2s; }
.bonus-card:hover { transform:translateY(-4px); }
.bonus-card h4 { font-size:15px; font-family:'Manrope'; font-weight:700; margin-top:12px; }
.bonus-card p { color:var(--text2); font-size:13.5px; margin-top:8px; }
.bonus-icon { width:52px; height:52px; border-radius:14px; background:rgba(124,92,252,.12);
  display:flex; align-items:center; justify-content:center; margin:0 auto; font-size:24px; }

/* ═══════════════════════════════════════════════════════════
   GUARANTEE BOX
═══════════════════════════════════════════════════════════ */
.guarantee { display:flex; align-items:center; gap:36px; max-width:820px; margin:0 auto;
  background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:40px; }
@media (max-width:700px) { .guarantee { flex-direction:column; text-align:center; gap:20px; } }
.guarantee-seal { font-size:64px; flex-shrink:0; line-height:1; }
.guarantee h3 { font-size:22px; font-family:'Manrope'; }
.guarantee p { color:var(--text2); font-size:15px; margin-top:10px; }

/* ═══════════════════════════════════════════════════════════
   CHECKLIST
═══════════════════════════════════════════════════════════ */
.checklist { display:flex; flex-wrap:wrap; gap:12px 28px; max-width:880px; margin:0 auto; justify-content:center; }
.checklist li { font-size:14px; color:var(--text2); display:flex; align-items:center; gap:8px; }
.checklist li::before { content:"✓"; color:var(--green); font-weight:800; flex-shrink:0; }

/* ═══════════════════════════════════════════════════════════
   FOUNDER CARD
═══════════════════════════════════════════════════════════ */
.founder { max-width:720px; margin:0 auto; background:var(--card); border:1px solid var(--border);
  border-radius:var(--r); padding:40px; }
.founder-head { display:flex; align-items:center; gap:16px; margin-bottom:20px; }
.founder-avatar { width:54px; height:54px; border-radius:50%; background:var(--grad);
  flex-shrink:0; display:flex; align-items:center; justify-content:center;
  font-family:'Manrope'; font-weight:800; color:#fff; font-size:18px; }
.founder-name { font-weight:700; font-size:15px; }
.founder-role { color:var(--text3); font-size:13px; }
.founder blockquote { font-size:16px; color:var(--text2); font-style:italic; line-height:1.75;
  border-left:3px solid var(--purple); padding-left:20px; }

/* ═══════════════════════════════════════════════════════════
   FAQ
═══════════════════════════════════════════════════════════ */
.faq { max-width:760px; margin:0 auto; display:flex; flex-direction:column; gap:8px; }
.faq-item { background:var(--card); border:1px solid var(--border); border-radius:var(--rsm); overflow:hidden; }
.faq-item.open { border-color:rgba(124,92,252,.4); }
.faq-q { display:flex; justify-content:space-between; align-items:center; padding:20px 24px;
  cursor:pointer; font-weight:600; font-size:15px; width:100%; background:none; border:none;
  text-align:left; color:var(--text); font-family:'Inter'; gap:16px; }
.faq-q:hover { background:rgba(255,255,255,.03); }
.faq-plus { color:var(--purple); font-size:22px; font-weight:300; flex-shrink:0;
  transition:transform .2s; }
.faq-item.open .faq-plus { transform:rotate(45deg); }
.faq-a { overflow:hidden; transition:max-height .28s ease; }
.faq-a p { padding:0 24px 20px; color:var(--text2); font-size:14.5px; }

/* ═══════════════════════════════════════════════════════════
   PS BLOCK
═══════════════════════════════════════════════════════════ */
.ps-block { max-width:720px; margin:0 auto; display:flex; flex-direction:column; gap:12px; }
.ps-block p { color:var(--text2); font-size:14.5px; }
.ps-block strong { color:var(--text); }

/* ═══════════════════════════════════════════════════════════
   FINAL CTA
═══════════════════════════════════════════════════════════ */
.final-cta { text-align:center; padding:100px 0;
  background:radial-gradient(ellipse 900px 500px at 50% 30%,rgba(124,92,252,.2),transparent 65%); }
.final-cta h2 { font-size:clamp(26px,4vw,36px); max-width:680px; margin:0 auto; }
.final-cta .lead { color:var(--text2); font-size:16.5px; max-width:600px; margin:18px auto 0; }

/* ═══════════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════════ */
.sp-footer { border-top:1px solid var(--bsoft); padding:36px 0; text-align:center;
  color:var(--text3); font-size:13px; }
.sp-footer a { color:var(--text3); }
.sp-footer a:hover { color:var(--text2); }
      `}</style>

      <div className="sp">
        <MiniCta />

        {/* ── Banner ── */}
        <div className="banner">
          ⏳ Founder's Price Ends Soon — Then It&apos;s $39/Month. Lock It In Now.{" "}
          <span className="timer-dig">
            {timer.split(":").map((v, i) => <span key={i}>{v}</span>)}
          </span>
        </div>

        {/* ── Nav ── */}
        <nav className="topnav">
          <div className="wrap">
            <div className="logo">OFFER<span className="logo-badge">IQ</span></div>
            <div className="navlinks">
              <a href="#product">Product</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#pricing">Pricing</a>
              <a href="#faq">FAQ</a>
            </div>
            <a href="#pricing" className="btn-nav">Log In</a>
          </div>
        </nav>

        {/* ══════════════════════════════════════
            HERO
        ══════════════════════════════════════ */}
        <section className="hero">
          <div className="blob blob1" /><div className="blob blob2" />
          <div className="wrap">
            <Rev>
              <span className="eyebrow-dot"><i />For Creators · Product Owners · Coaches · First-Time Entrepreneurs</span>
              <h1>
                Turn Any Idea Into A Complete, Sellable Offer: Strategy, Copy &amp; Live Funnel,{" "}
                <span className="grad-text">Lead Magnet and Traffic Plan</span> — In One Session.
              </h1>
              <p className="sub">
                Stop guessing what to sell, what to charge, and what to say. Give OfferIQ an idea, a URL, or an existing offer, and get back a full Intelligence Report, a matched copy set, and a live, payment-ready funnel — before you close the tab.
              </p>
              <div className="ctas" style={{ marginTop: 34 }}>
                <a href="#pricing" className="btn btn-primary btn-lg">Build My First Offer — $49 One-Time →</a>
              </div>
              <p className="microcopy">No marketing experience required · 30-day money-back guarantee</p>
            </Rev>

            <div className="path-cards">
              <Rev d={80}>
                <div className="path-card">
                  <span className="tag">Path 01</span>
                  <h4>I Already Have An Idea Or Existing Offer</h4>
                  <p>Paste a URL, upload a PDF, or describe it. OfferIQ builds the strategy and funnel around what you&apos;ve already got.</p>
                </div>
              </Rev>
              <Rev d={160}>
                <div className="path-card">
                  <span className="tag">Path 02</span>
                  <h4>I Don&apos;t Have Anything Yet</h4>
                  <p>Give OfferIQ your niche, audience, and price range. It hands you offer ideas already proven to work, then builds the complete product you pick.</p>
                </div>
              </Rev>
            </div>

            <Rev d={200}>
              <div className="video-slot">
                <div className="playbtn">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                </div>
                <span className="video-label">[ Demo video — 90-second product walkthrough ]</span>
              </div>
            </Rev>

            <Rev d={250}>
              <div className="testi-strip">
                {[
                  { q: "I had a coaching idea sitting in my notes for eight months. Pasted a rough description in, and had pricing, positioning, and a live page inside an hour.", name: "Danielle M.", role: "Business Coach" },
                  { q: "My course was already live and just not selling. The report told me exactly what was wrong with the price and the page. Fixed both.", name: "Marcus T.", role: "Course Creator" },
                  { q: "I had no idea what to charge or how to frame it. OfferIQ gave me a number I could actually stand behind — and the copy to go with it.", name: "Priya K.", role: "Consultant" },
                ].map((t) => (
                  <div className="testi" key={t.name}>
                    <p>&ldquo;{t.q}&rdquo;</p>
                    <div className="testi-who">
                      <div className="testi-avatar">{t.name[0]}</div>
                      <div>
                        <div className="testi-name">{t.name}</div>
                        <div className="testi-role">{t.role}</div>
                      </div>
                    </div>
                    <span className="sample-flag">⚠ Sample — swap with real testimonials before launch</span>
                  </div>
                ))}
              </div>
            </Rev>
          </div>
        </section>

        {/* ══════════════════════════════════════
            THE ACTUAL BUSINESS (light, split)
        ══════════════════════════════════════ */}
        <section id="product" className="sect light">
          <div className="wrap split">
            <Rev cls="prose">
              <span className="eyebrow-dot"><i />Before The Page, The Ads, Or The Emails</span>
              <h2 style={{ fontSize: "clamp(24px,3vw,32px)", marginTop: 16 }}>The Actual Business, Before Anything Else</h2>
              <p style={{ marginTop: 20 }}>Every course, coaching program, or service business starts the same way: someone who knows something valuable has to turn that knowledge into an offer someone will pay for. <strong>That&apos;s the actual business.</strong> Everything else — the page, the ads, the emails — is construction.</p>
              <p>Building a funnel before that strategy exists is like pouring a foundation before you&apos;ve seen a blueprint. You can still put up walls. You just don&apos;t know yet whether the house is where anyone wants to live.</p>
              <div className="pullquote">The version everyone&apos;s heard skips the part that matters: who specifically buys this, what they&apos;ll actually pay, and how to position it against everything they&apos;ve already seen.</div>
            </Rev>
            <Rev d={100} cls="illus-box">
              <svg width="320" height="260" viewBox="0 0 320 260" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs><linearGradient id="ig1" x1="0" y1="0" x2="320" y2="260" gradientUnits="userSpaceOnUse"><stop stopColor="#7C5CFC"/><stop offset="1" stopColor="#4F8FFF"/></linearGradient></defs>
                <rect x="10" y="10" width="300" height="240" rx="16" fill="#F1EFFC"/>
                <g opacity=".4" stroke="#B9AEF2" strokeWidth="1">
                  <line x1="10" y1="60" x2="310" y2="60"/><line x1="10" y1="110" x2="310" y2="110"/><line x1="10" y1="160" x2="310" y2="160"/>
                  <line x1="80" y1="10" x2="80" y2="250"/><line x1="160" y1="10" x2="160" y2="250"/><line x1="240" y1="10" x2="240" y2="250"/>
                </g>
                <path d="M60 200 L60 130 L160 74 L260 130 L260 200 Z" fill="url(#ig1)" opacity=".9"/>
                <rect x="140" y="160" width="40" height="40" fill="#F1EFFC"/>
                <circle cx="160" cy="74" r="7" fill="#fff"/>
                <circle cx="60" cy="200" r="5" fill="#fff" opacity=".7"/>
                <circle cx="260" cy="200" r="5" fill="#fff" opacity=".7"/>
              </svg>
            </Rev>
          </div>
        </section>

        {/* ══════════════════════════════════════
            WORKAROUNDS (dark, case-file cards)
        ══════════════════════════════════════ */}
        <section className="sect">
          <div className="wrap">
            <Rev cls="sect-head">
              <span className="eyebrow">Workaround Log · 4 Cases On File</span>
              <h2>The Workarounds That Don&apos;t Work</h2>
            </Rev>
            <div className="wcards">
              {[
                { stamp: "✗ Doesn't Scale", tag: "CASE 01 · REF WA-01", bg: "rgba(124,92,252,.14)", title: "Hire it out, piece by piece", cost: "$2,000–$10,000/project + $2,000–$15,000/page", body: "Coordinate a strategist, a copywriter, a designer, and a media buyer, and you're 3–6 weeks and several thousand dollars in before a single page is live — and still guessing whether they got your specific buyer right." },
                { stamp: "✗ Still Broken",   tag: "CASE 02 · REF WA-02", bg: "rgba(79,143,255,.14)",  title: "Stitch together generic AI tools", cost: "$20–$50/mo writing tool + $99–$297/mo page builder", body: "Neither tool knows your positioning, your pricing, or what to say first. You still have to know the strategy before either one is useful." },
                { stamp: "✗ Unvalidated",    tag: "CASE 03 · REF WA-03", bg: "rgba(201,154,46,.14)",  title: "Buy a template pack or a course", cost: "$67–$297 one-time", body: "You get a shape to fill in, not a benchmarked price, not a persona, not a reason to believe the positioning is right for your specific offer." },
                { stamp: "✗ No Guarantee",   tag: "CASE 04 · REF WA-04", bg: "rgba(225,86,86,.14)",   title: "Do it all yourself, from scratch", cost: "Free in dollars — 20–40+ hours of your time", body: "At the end of it, you still don't know if any of it is right, because none of it was checked against what actually converts." },
              ].map((w, i) => (
                <Rev key={w.title} d={i * 60}>
                  <div className="wcard">
                    <span className="wcard-stamp">{w.stamp}</span>
                    <span className="wcard-tag" style={{ fontFamily: "monospace", fontSize: 11 }}>{w.tag}</span>
                    <div className="wcard-icon" style={{ background: w.bg }} />
                    <h4>{w.title}</h4>
                    <div className="wcard-cost">{w.cost}</div>
                    <p>{w.body}</p>
                  </div>
                </Rev>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 44 }}>
              <Rev><a href="#pricing" className="btn btn-primary">Build My First Offer — $49 One-Time →</a></Rev>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            WHAT IF STRATEGY CAME FIRST (light, split reversed)
        ══════════════════════════════════════ */}
        <section className="sect light">
          <div className="wrap split rev-dir">
            <Rev cls="illus-box">
              <svg width="300" height="240" viewBox="0 0 300 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="ig2" x1="0" y1="0" x2="300" y2="240" gradientUnits="userSpaceOnUse"><stop stopColor="#F5D77E"/><stop offset="1" stopColor="#7C5CFC"/></linearGradient>
                  <linearGradient id="ig2b" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#7C5CFC"/><stop offset="1" stopColor="#4F8FFF"/></linearGradient>
                </defs>
                <circle cx="90" cy="90" r="46" fill="url(#ig2)"/>
                <rect x="72" y="126" width="36" height="14" rx="4" fill="#D9C48A"/>
                <g stroke="#C9C9E8" strokeWidth="2"><line x1="90" y1="18" x2="90" y2="4"/><line x1="34" y1="46" x2="22" y2="36"/><line x1="146" y1="46" x2="158" y2="36"/></g>
                <path d="M148 92 L202 92" stroke="#B9AEF2" strokeWidth="2" strokeDasharray="4 5"/>
                <rect x="202" y="44" width="88" height="110" rx="10" fill="#fff" stroke="#E6E5F2" strokeWidth="2"/>
                <rect x="216" y="64" width="60" height="6" rx="3" fill="url(#ig2b)"/>
                <rect x="216" y="80" width="44" height="6" rx="3" fill="#E6E5F2"/>
                <rect x="216" y="96" width="50" height="6" rx="3" fill="#E6E5F2"/>
                <rect x="216" y="118" width="36" height="22" rx="6" fill="#1FB27A" opacity=".85"/>
              </svg>
            </Rev>
            <Rev d={100} cls="prose">
              <span className="eyebrow-dot"><i />The Reframe</span>
              <h2 style={{ fontSize: "clamp(24px,3vw,32px)", marginTop: 16 }}>What If The Strategy Came First?</h2>
              <p style={{ marginTop: 20 }}>What if positioning, pricing, and a full-funnel blueprint came first — <span className="hl-p">automatically</span> — before you wrote a word? What if the copy for every page came out of that same strategy, not a blank cursor?</p>
              <p>And what if the offer is built for you? Yes — <strong>a complete, sellable offer built from intelligence, no guesses.</strong> That&apos;s exactly what OfferIQ does.</p>
              <p>This isn&apos;t a page builder, a copywriting tool, or a course platform — those all assume the hard part is already solved. <strong>OfferIQ is the layer that comes before all three.</strong></p>
            </Rev>
          </div>
        </section>

        {/* ══════════════════════════════════════
            BUILT FOR REAL PEOPLE (dark)
        ══════════════════════════════════════ */}
        <section className="sect tight">
          <div className="wrap">
            <Rev cls="sect-head">
              <span className="eyebrow-dot" style={{ display: "inline-flex", margin: "0 auto" }}><i />Built For Real People, Not Agencies</span>
              <h2 style={{ marginTop: 18 }}>No agency budget. No marketing department. No problem.</h2>
              <p>Built for anyone who wants to sell something valuable — with no budget for a strategist or large team.</p>
            </Rev>
            <Rev d={100}>
              <div className="chips">
                {["First-Time Entrepreneurs","Coaches & Consultants","Digital Product Sellers","Marketing Agencies","Content Creators"].map(c => (
                  <span className="chip" key={c}>{c}</span>
                ))}
              </div>
            </Rev>
          </div>
        </section>

        {/* ══════════════════════════════════════
            THREE TRAPS (light)
        ══════════════════════════════════════ */}
        <section className="sect light">
          <div className="wrap">
            <Rev cls="sect-head">
              <span className="eyebrow">Why This Isn&apos;t Just A Feeling</span>
              <h2>Three traps quietly kill every offer before it has a chance to sell.</h2>
            </Rev>
            <div className="traps">
              {[
                { icon: "📉", bg: "rgba(225,86,86,.12)", label: "The "Blank Canvas" Trap", n: 42, suf: "%", p: 'of startups fail simply because they built something nobody actually needed.', src: "— CB Insights" },
                { icon: "💰", bg: "rgba(201,154,46,.12)", label: "The Pricing Trap",         n: 18, suf: "%", p: 'of startups collapse from a flawed pricing model — too little to sustain, or too much for the market.', src: "— CB Insights" },
                { icon: "📈", bg: "rgba(79,143,255,.12)", label: "The Acquisition Cost Trap", n: 222, suf: "%+", p: 'Customer acquisition costs have climbed that much — expensive clicks bleed margin dry before a single sale lands.', src: "— ProfitWell / Paddle" },
              ].map((t, i) => (
                <Rev key={t.label} d={i * 80}>
                  <div className="trap-card">
                    <div className="trap-icon" style={{ background: t.bg }}>{t.icon}</div>
                    <div className="trap-label">{t.label}</div>
                    <div className="trap-stat" style={{ color: "var(--purple)" }}>
                      <CountUp to={t.n} suffix={t.suf} />
                    </div>
                    <p>{t.p}</p>
                    <span className="trap-src">{t.src}</span>
                  </div>
                </Rev>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 44 }}>
              <Rev><a href="#pricing" className="btn btn-primary">Build My First Offer — $49 One-Time →</a></Rev>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            REAL COST (dark, split)
        ══════════════════════════════════════ */}
        <section className="sect">
          <div className="wrap split">
            <Rev cls="prose">
              <span className="eyebrow">The Real Cost Of Getting This Wrong</span>
              <p style={{ marginTop: 20 }}>Getting the persona wrong doesn&apos;t just cost you a guess — it costs <span className="hl-p">every dollar of traffic</span> you send to a page that talks to the wrong person.</p>
              <p>Getting the price wrong doesn&apos;t just feel bad — it either caps your revenue or kills conversions, and you often can&apos;t tell which one is happening from the inside.</p>
              <div className="pullquote">
                At real market rates, doing this manually runs <span className="hl-gold">$6,200 to $32,747+ per offer</span>. Building two validated offers a year the traditional way is <span className="hl-gold">$12,400 to $65,494+</span> — and 6–12 weeks of coordinating people who don&apos;t share your context.
              </div>
              <p>That&apos;s not a one-time cost. That&apos;s the tax on every offer you ever build without the strategy layer in place first.</p>
            </Rev>
            <Rev d={100} cls="illus-box">
              <svg width="300" height="250" viewBox="0 0 300 250" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs><linearGradient id="ig3" x1="0" y1="0" x2="300" y2="250" gradientUnits="userSpaceOnUse"><stop stopColor="#E15656"/><stop offset="1" stopColor="#7C5CFC"/></linearGradient></defs>
                <path d="M60 28 H240 L178 128 H122 Z" fill="url(#ig3)" opacity=".88"/>
                <rect x="130" y="128" width="40" height="60" fill="#1a1628"/>
                <path d="M130 188 Q150 208 170 188 L170 208 L130 208 Z" fill="#1a1628"/>
                <circle cx="88" cy="152" r="9" fill="#F5D77E" opacity=".8"/>
                <circle cx="68" cy="182" r="7" fill="#F5D77E" opacity=".7"/>
                <circle cx="104" cy="196" r="6" fill="#F5D77E" opacity=".6"/>
                <circle cx="216" cy="156" r="9" fill="#F5D77E" opacity=".8"/>
                <circle cx="236" cy="186" r="6" fill="#F5D77E" opacity=".6"/>
                <text x="150" y="68" fontFamily="Manrope,sans-serif" fontSize="13" fontWeight="800" fill="#fff" textAnchor="middle">LEAK</text>
              </svg>
            </Rev>
          </div>
        </section>

        {/* ══════════════════════════════════════
            REPLACE THE STACK (light)
        ══════════════════════════════════════ */}
        <section className="sect light">
          <div className="wrap">
            <Rev cls="sect-head">
              <span className="eyebrow">Replace The Stack</span>
              <h2>What OfferIQ Actually Does</h2>
              <p>Instead of paying thousands and waiting weeks — everything in one session, benchmarked against 35,000+ real offers.</p>
            </Rev>
            <Rev d={80}>
              <div className="stack-list">
                {[
                  ["Offer strategy & positioning, consultant",       "$2,000–$10,000 / project"],
                  ["Direct-response sales copywriter",               "$2,000–$15,000 / page"],
                  ["Landing page / funnel builder software",         "$99–$297 / month"],
                  ["Lead magnet & bonus design + writing",           "$500–$2,000 / asset"],
                  ["Paid traffic / media buying strategist",         "$1,500–$5,000 / month"],
                  ["Email sequence writing & tooling",               "$50–$150/month + writer fees"],
                  ["Content creator / info product build",           "$500–$5,000"],
                ].map(([name, old]) => (
                  <div className="stack-row" key={name}>
                    <span className="stack-name">{name}</span>
                    <div className="stack-right">
                      <span className="stack-old">{old}</span>
                      <span className="stack-incl">✓ Included</span>
                    </div>
                  </div>
                ))}
              </div>
            </Rev>
          </div>
        </section>

        {/* ══════════════════════════════════════
            WHAT YOU GET (dark, feat grid)
        ══════════════════════════════════════ */}
        <section id="how-it-works" className="sect">
          <div className="wrap">
            <Rev cls="sect-head">
              <span className="eyebrow">What You Get</span>
              <h2>One workspace. Every phase of the offer, connected.</h2>
            </Rev>
            <div className="feat-grid">
              {[
                { icon: "🧠", title: "Strategy Report",      desc: "16 strategic sections, benchmarked against 35,000+ real offers. Positioning, Persona, Pricing, Funnel Health Score, and more." },
                { icon: "✍️", title: "Copy Engine",          desc: "Full, ready-to-publish copy for every page — written from your Intelligence Report, not a generic swipe file." },
                { icon: "🖥️", title: "Funnel Builder",       desc: "Every page assembled automatically. Inline editing, AI section reordering, plain-language AI edits." },
                { icon: "📦", title: "Asset Bank",           desc: "Your lead magnet and bonus stack, generated as real, downloadable, finished files." },
                { icon: "🚀", title: "Traffic Intelligence™", desc: "Platform priority matrix, ready-to-deploy ad copy, a VSL script, a UGC script." },
                { icon: "📧", title: "Email Sequences",      desc: "Lead Nurture, Launch, Re-engagement, Client Onboarding, and Upsell — written and ready to connect." },
                { icon: "🌐", title: "Publish & Deploy",     desc: "One-click publishing. Stripe and PayPal integration built in. Live on your subdomain instantly." },
                { icon: "👥", title: "Leads & Analytics",   desc: "Built-in CRM plus per-funnel analytics: traffic, conversion rate, device breakdown." },
                { icon: "📦", title: "Live Sellable Product", desc: "Unique info products built for your sale page, upsell, and downsell — complete and ready to deliver." },
              ].map((f, i) => (
                <Rev key={f.title} d={i * 40}>
                  <div className="feat-card">
                    <div className="feat-icon">{f.icon}</div>
                    <h4>{f.title}</h4>
                    <p>{f.desc}</p>
                  </div>
                </Rev>
              ))}
            </div>
            <p style={{ textAlign: "center", color: "var(--text3)", marginTop: 28, fontSize: 14 }}>
              30-Day Money-Back Guarantee — no interrogation, no hoops.
            </p>
          </div>
        </section>

        {/* ══════════════════════════════════════
            PROCESS STEPS (light)
        ══════════════════════════════════════ */}
        <section className="sect light">
          <div className="wrap">
            <Rev cls="sect-head">
              <span className="eyebrow">The Process, Step By Step</span>
              <h2>Most people go from idea to a launch-ready offer in under <span style={{ color: "var(--purple)" }}>30 minutes</span>.</h2>
            </Rev>
            <Rev d={80}>
              <div className="steps">
                {[
                  { n:"01", t:"Strategy Report",                    time:"~4 min",  d:"Positioning, pricing, a full-funnel blueprint. Start from an idea, a URL, a PDF, or nothing at all." },
                  { n:"02", t:"Copy Engine",                        time:"~2 min",  d:"Full-funnel copy, in your buyer's exact vocabulary." },
                  { n:"03", t:"Funnel Builder",                     time:"~5 min",  d:"Every page assembles automatically. Edit inline, or tell the AI Agent what to change in plain language." },
                  { n:"04", t:"Lead Generation & Engagement Plan",  time:"~4 min",  d:"Ad copy, a video sales script, a UGC script, full email sequences — before you spend a dollar on traffic." },
                  { n:"05", t:"Publish & Go Live",                  time:"Instant", d:"Connect Stripe or PayPal, publish live on your OfferIQ subdomain. Custom domain connection starts at Pro." },
                ].map((s) => (
                  <div className="step" key={s.n}>
                    <div className="step-num">{s.n}</div>
                    <div className="step-body">
                      <h4>{s.t}<span className="step-time">{s.time}</span></h4>
                      <p>{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Rev>
          </div>
        </section>

        {/* ══════════════════════════════════════
            NOT CHATGPT + CAVEAT (dark)
        ══════════════════════════════════════ */}
        <section className="sect tight">
          <div className="wrap">
            <Rev>
              <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto" }}>
                <h3 style={{ fontFamily: "Manrope", fontSize: "clamp(20px,3vw,26px)", fontWeight: 800 }}>Not ChatGPT With Extra Steps</h3>
                <p style={{ color: "var(--text2)", marginTop: 16, fontSize: 16 }}>ChatGPT gives you sentences — it doesn&apos;t know what converts in your niche, doesn&apos;t build the page, doesn&apos;t connect a payment processor, and has no data on what <strong style={{ color: "var(--text)" }}>35,000 other offers</strong> already proved works. OfferIQ starts where a generic AI writer stops.</p>
              </div>
            </Rev>
            <Rev d={80}>
              <div style={{ textAlign: "center", maxWidth: 660, margin: "56px auto 0" }}>
                <h3 style={{ fontFamily: "Manrope", fontSize: "clamp(18px,2.5vw,22px)", fontWeight: 800 }}>One Honest Caveat</h3>
                <p style={{ color: "var(--text2)", marginTop: 16, fontSize: 16 }}>This won&apos;t replace years of business experience overnight, and no report can guarantee a specific result. What OfferIQ replaces is the blank page — the strategic guesswork that normally sits between &ldquo;I know something valuable&rdquo; and &ldquo;here&apos;s a live, priced, positioned offer.&rdquo;</p>
              </div>
            </Rev>
          </div>
        </section>

        {/* ══════════════════════════════════════
            IS THIS FOR YOU (dark)
        ══════════════════════════════════════ */}
        <section className="sect tight">
          <div className="wrap">
            <Rev cls="sect-head">
              <h2>Is This For You?</h2>
            </Rev>
            <div className="fit-grid">
              <Rev d={60}>
                <div className="fit-card yes">
                  <h4 style={{ color: "var(--green)" }}>This is for you if:</h4>
                  <ul className="fit-list">
                    {[
                      "You want to sell something valuable that will get you started online",
                      "You have real expertise, an audience, or a service and no positioned offer built from it yet",
                      "You already have an offer live and know something's off, but can't diagnose what",
                      "You'd rather spend $49 and 30 minutes than $6,200+ and six weeks finding out the hard way",
                      "You want the strategy and the pages built from the same data, not assembled separately",
                    ].map(l => <li key={l}><span className="tick y">✓</span>{l}</li>)}
                  </ul>
                </div>
              </Rev>
              <Rev d={120}>
                <div className="fit-card no">
                  <h4 style={{ color: "var(--red)" }}>This isn&apos;t for you if:</h4>
                  <ul className="fit-list">
                    {[
                      "You already have a fully benchmarked strategy and just need a page builder",
                      "You want a done-for-you agency relationship rather than a system you run yourself",
                      "You're not planning to actually publish or sell anything with what gets built",
                    ].map(l => <li key={l}><span className="tick n">✗</span>{l}</li>)}
                  </ul>
                </div>
              </Rev>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            PRICING / VALUE TABLE
        ══════════════════════════════════════ */}
        <section id="pricing" className="sect">
          <div className="wrap">
            <Rev cls="sect-head">
              <span className="eyebrow">Front-End · OfferIQ Starter</span>
              <h2>Everything You&apos;re Getting Today</h2>
              <p style={{ fontSize: 13, color: "var(--text3)", marginTop: 8 }}>⚠ Values are proposed — not final. Awaiting approval.</p>
            </Rev>
            <Rev d={80}>
              <div className="value-table">
                {[
                  ["Live Sellable Offer (Main, Upsell & Downsell products)", "$2,997"],
                  ["Two-Path Offer Analysis & Build Engine", "$497"],
                  ["Full 16-Section Strategy Report", "$297"],
                  ["Complete 5-Page Funnel Copy Set", "$997"],
                  ["Live Funnel Builder (5 hosted pages)", "$297"],
                  ["Asset Bank (lead magnet + 3 bonuses + Offer Guide)", "$297"],
                  ["Full Email Sequence Suite (5 sequences)", "$197"],
                  ["Traffic Intelligence™ Suite", "$397"],
                  ["KPI Analytics Dashboard", "$97"],
                  ["Bonus: Fast-Launch Swipe Pack", "$67"],
                  ["Bonus: 30 Proven Offer Hooks Cheat Sheet", "$47"],
                  ["Bonus: "First Funnel in 24 Hours" Video", "$37"],
                ].map(([item, val]) => (
                  <div className="value-row" key={item}>
                    <span className="vitem">{item}</span>
                    <span className="vval">{val}</span>
                  </div>
                ))}
                <div className="value-row vtotal">
                  <span className="vitem">Total Real Value</span>
                  <span className="vval">$6,224</span>
                </div>
                <div className="value-row vprice">
                  <span className="vitem">Your Price Today — One-Time</span>
                  <span className="vval">$49</span>
                </div>
              </div>
              <p className="value-note">⚠ Sample — confirm values with your team before launch</p>
            </Rev>
            <div style={{ textAlign: "center", marginTop: 36 }}>
              <Rev d={100}>
                <a href="#" className="btn btn-primary btn-lg">Build My First Offer — Save $6,175 →</a>
                <p className="microcopy" style={{ marginTop: 16 }}>30-day money-back guarantee · No monthly fee · Founder's pricing ends soon</p>
              </Rev>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            VERSUS PANEL (dark)
        ══════════════════════════════════════ */}
        <section className="sect tight">
          <div className="wrap">
            <Rev cls="sect-head">
              <h2>Building Without A Blueprint vs. Building With OfferIQ</h2>
            </Rev>
            <Rev d={80}>
              <div className="versus">
                <div className="versus-col old">
                  <h4>Without OfferIQ</h4>
                  {["Guess at positioning, find out after launch","Write copy and hope it lands","Assemble pages by hand or from a template","Guess where to advertise and at what budget","$6,200–$32,747+ and 3–6 weeks"].map(r => <div className="versus-row" key={r}>{r}</div>)}
                </div>
                <div className="versus-col new">
                  <h4>With OfferIQ</h4>
                  {["Positioning benchmarked against 35,000+ offers, before you build","Copy written from your own Strategy Report","Pages assembled automatically from your report's direction","A platform priority matrix, before you spend a dollar","$49 and one sitting"].map(r => <div className="versus-row" key={r}>{r}</div>)}
                </div>
              </div>
            </Rev>
          </div>
        </section>

        {/* ══════════════════════════════════════
            BONUSES (dark)
        ══════════════════════════════════════ */}
        <section className="sect tight">
          <div className="wrap">
            <Rev cls="sect-head">
              <h2>Your Fast-Action Bonuses</h2>
            </Rev>
            <div className="bonus-grid">
              {[
                { icon: "🎁", title: "Fast-Launch Swipe Pack", desc: "20 pre-written eyebrow/headline/CTA formulas ready to deploy." },
                { icon: "🎁", title: "30 Proven Offer Hooks", desc: "5 hook archetypes across 6 niches — a cheat sheet you'll use every time." },
                { icon: "🎁", title: '"First Funnel in 24 Hours"', desc: "A focused 20-minute walkthrough to get your first offer live the same day." },
              ].map((b, i) => (
                <Rev key={b.title} d={i * 80}>
                  <div className="bonus-card">
                    <div className="bonus-icon">{b.icon}</div>
                    <h4>{b.title}</h4>
                    <p>{b.desc}</p>
                  </div>
                </Rev>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            CHECKLIST (dark)
        ══════════════════════════════════════ */}
        <section className="sect tight">
          <div className="wrap">
            <Rev cls="sect-head"><h2>Why You&apos;ll Want This</h2></Rev>
            <Rev d={80}>
              <ul className="checklist">
                {["Live Sellable Offer","16-section Intelligence Report","Benchmarked against 35,000+ offers","Full 5-page copy set","Automatic page assembly","Inline + AI-agent editing","Lead magnet + bonus generation","Platform priority matrix","Ready-to-deploy ad copy","VSL + UGC scripts","5-sequence email suite","One-click publish","Stripe + PayPal built in","Built-in CRM","Per-funnel analytics","Template Club access","30-day guarantee"].map(c => <li key={c}>{c}</li>)}
              </ul>
            </Rev>
          </div>
        </section>

        {/* ══════════════════════════════════════
            GUARANTEE (dark)
        ══════════════════════════════════════ */}
        <section className="sect tight">
          <div className="wrap">
            <Rev>
              <div className="guarantee">
                <div className="guarantee-seal">🛡️</div>
                <div>
                  <h3>30-Day Money-Back Guarantee</h3>
                  <p>No interrogation, no hoops. If you go through the process and decide it&apos;s not for you, we&apos;ll refund every cent within 30 days. No questions asked.</p>
                </div>
              </div>
            </Rev>
          </div>
        </section>

        {/* ══════════════════════════════════════
            FOUNDER (dark)
        ══════════════════════════════════════ */}
        <section className="sect tight">
          <div className="wrap">
            <Rev cls="sect-head"><h2>Why I Built This</h2></Rev>
            <Rev d={80}>
              <div className="founder">
                <div className="founder-head">
                  <div className="founder-avatar">K</div>
                  <div>
                    <div className="founder-name">Kenoye Kitoye</div>
                    <div className="founder-role">Founder, OfferIQ</div>
                  </div>
                </div>
                <blockquote>&ldquo;I kept running into the same conversation with creators, coaches, and marketers. They weren&apos;t stuck because they lacked skill or effort — they were stuck because nobody had told them what to sell, who to sell it to, or what to charge for it. Every tool on the market assumes that part is already solved. I built OfferIQ to be the layer that comes before all of it.&rdquo;</blockquote>
              </div>
            </Rev>
          </div>
        </section>

        {/* ══════════════════════════════════════
            FAQ (dark)
        ══════════════════════════════════════ */}
        <section id="faq" className="sect">
          <div className="wrap">
            <Rev cls="sect-head">
              <h2>Frequently Asked Questions</h2>
            </Rev>
            <div className="faq">
              {[
                { q:"Is this really one-time, or will I get billed later?", a:"One-time for Front-end and every upgrade tier. After this launch window closes, new customers move to the $39/month plan — buy now, and you're locked into one-time pricing for good." },
                { q:"Why is OfferIQ different from a funnel builder?", a:"Most funnel builders help you build pages. OfferIQ helps you decide what to sell, who to sell it to, how to position it, what to charge, and how to explain it — then builds the pages around that strategy. Funnel builders start with pages. OfferIQ starts with the offer." },
                { q:"What if I don't have any idea what to sell yet?", a:"Use "I Don't Have Anything Yet." Give OfferIQ your niche, audience, and price range — it hands you offer ideas already proven to work, and builds the one you choose." },
                { q:"What if I already have an offer live somewhere else?", a:"Use "I Already Have An Idea Or Existing Offer" — paste the URL, and OfferIQ tells you where the positioning is likely costing you conversions." },
                { q:"Can I edit what OfferIQ creates?", a:"Yes. Edit anything inline, or tell the built-in AI Agent what to change in plain language. Treat the first output as a draft, not a final decision." },
                { q:"Does this work for my niche?", a:"The Strategy Report is benchmarked across a wide range of categories — creators, coaches, consultants, agencies, digital product sellers — not one template reused everywhere." },
                { q:"What happens when I hit the 5-offer cap?", a:"Your existing offers, pages, and data stay fully accessible. You can upgrade to the Unlimited plan." },
                { q:"Can I connect my own domain?", a:"Not on Front-end — you're live on an OfferIQ subdomain, enough to launch and start selling today. Custom domain connection starts at Pro." },
                { q:"Can I use this for clients?", a:"Not on this tier — Front-end through Unlimited are personal-use. Client rights are introduced at Agency." },
              ].map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            PS BLOCK (dark)
        ══════════════════════════════════════ */}
        <section className="sect tight">
          <div className="wrap">
            <Rev>
              <div className="ps-block">
                <p><strong>P.S.</strong> Three real traps kill most offers before they ever launch — the wrong thing, the wrong price, or expensive traffic sent to a funnel that was never going to convert. OfferIQ addresses all three at once.</p>
                <p><strong>P.P.S.</strong> Doing this manually runs <strong>$6,200–$32,747+</strong> per offer at real market rates. This is $49, once.</p>
                <p><strong>P.P.P.S.</strong> Founder pricing ends when this launch window closes. After that, it&apos;s $39/month for new customers.</p>
              </div>
            </Rev>
          </div>
        </section>

        {/* ══════════════════════════════════════
            FINAL CTA
        ══════════════════════════════════════ */}
        <section className="final-cta">
          <div className="wrap">
            <Rev>
              <p style={{ color: "var(--text3)", fontSize: 14, marginBottom: 12 }}>5 phases. Under 30 minutes. One sitting.</p>
              <h2>One idea. A live, payment-ready funnel.</h2>
              <p className="lead">Built from 35,000 offers that already converted — not another guess.</p>
              <div className="ctas" style={{ marginTop: 36 }}>
                <a href="#pricing" className="btn btn-primary btn-lg">Build My First Offer — $49 One-Time →</a>
              </div>
              <p className="microcopy">30-day guarantee · No monthly fee · Founder&apos;s pricing ends soon</p>
            </Rev>
          </div>
        </section>

        {/* ══════════════════════════════════════
            FOOTER
        ══════════════════════════════════════ */}
        <footer className="sp-footer">
          <div className="wrap">
            <p>© {new Date().getFullYear()} OfferIQ · <a href="/terms">Terms</a> · <a href="/policy">Privacy</a> · <a href="/refund">Refund Policy</a></p>
          </div>
        </footer>
      </div>
    </>
  );
}
