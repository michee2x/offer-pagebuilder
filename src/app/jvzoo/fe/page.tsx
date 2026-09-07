"use client";
import { useEffect, useState, useRef } from "react";
import {
  TrendingDown, DollarSign, TrendingUp,
  Brain, PenLine, Monitor, Package, Rocket, Mail,
  Globe, Users, ShoppingCart,
  Briefcase, Bot, LayoutTemplate, Clock,
  Gift, BookOpen, Play as PlayIcon,
  Shield, BarChart2, ChevronRight,
} from "lucide-react";

/* ─── Google Fonts ─────────────────────────────────────────────────────────── */
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=Inter:wght@400;500;600;700&display=swap";

/* ─── Countdown timer ──────────────────────────────────────────────────────── */
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

/* ─── Scroll reveal ────────────────────────────────────────────────────────── */
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
    <div ref={ref} style={{ transitionDelay: `${d}ms` }} className={`rev${v ? " rev-in" : ""}${cls ? " " + cls : ""}`}>
      {children}
    </div>
  );
}

/* ─── Count-up ─────────────────────────────────────────────────────────────── */
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
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1400, 1);
      setVal(Math.floor(p * to));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ─── FAQ item ─────────────────────────────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item${open ? " open" : ""}`}>
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

/* ─── Sticky mini-CTA ──────────────────────────────────────────────────────── */
function MiniCta() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const h = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <div className={`mini-cta${show ? " mini-cta--show" : ""}`}>
      <span className="mini-cta__label">{"Founder's Price — $49 One-Time"}</span>
      <a href="#pricing" className="btn btn-primary" style={{ animation: "none", padding: "11px 22px", fontSize: 14 }}>
        Build My First Offer <ChevronRight size={15} />
      </a>
    </div>
  );
}

/* ─── Exit intent ──────────────────────────────────────────────────────────── */
function ExitIntent({ message, cta, link = "#pricing" }: { message: string; cta: string; link?: string }) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !dismissed && !show) {
        setShow(true);
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [dismissed, show]);

  if (!show) return null;

  return (
    <div className="exit-overlay" onClick={() => { setShow(false); setDismissed(true); }}>
      <div className="exit-modal" onClick={e => e.stopPropagation()}>
        <div className="exit-close" onClick={() => { setShow(false); setDismissed(true); }}>✕</div>
        <div className="exit-icon">⚠️</div>
        <h3>Wait — before you go.</h3>
        <p>{message}</p>
        <a href={link} className="btn btn-primary btn-lg" onClick={() => { setShow(false); setDismissed(true); }} style={{ marginTop: 24, width: "100%" }}>
          {cta} <ChevronRight size={17} />
        </a>
      </div>
    </div>
  );
}

/* ─── Lucide icon wrapper ──────────────────────────────────────────────────── */
function Ico({ icon: Icon, size = 22, color = "currentColor" }: { icon: React.ElementType; size?: number; color?: string }) {
  return <Icon size={size} color={color} strokeWidth={1.8} />;
}

/* ════════════════════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════════════════════ */
export default function FEPage() {
  const timer = useTimer();

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href={FONT_HREF} rel="stylesheet" />

      <style>{`
/* ── tokens ── */
:root{
  --bg:#08080D; --bg-soft:#0B0B12; --card:#14141F; --card-alt:#191927;
  --border:rgba(255,255,255,.08); --bsoft:rgba(255,255,255,.05);
  --text:#F5F5F7; --text2:#A6A6B3; --text3:#6B6B7B;
  --purple:#8B5CF6; --blue:#3B82F6; --green:#34D399; --amber:#D97706;
  --grad:linear-gradient(135deg,#8B5CF6 0%,#3B82F6 100%);
  --grad-t:linear-gradient(135deg,#C4B5FD 0%,#93C5FD 100%);
  --gold:linear-gradient(90deg,#F5D77E,#D9A94A);
  --r:16px; --rsm:10px; --maxw:1120px;
}
/* ── base ── */
.sp{box-sizing:border-box;background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;line-height:1.6;overflow-x:hidden;-webkit-font-smoothing:antialiased;}
.sp *,.sp *::before,.sp *::after{box-sizing:border-box;}
.sp h1,.sp h2,.sp h3,.sp h4{font-family:'Manrope',sans-serif;font-weight:800;letter-spacing:-.02em;line-height:1.12;}
.sp a{color:inherit;text-decoration:none;}
.sp ul{list-style:none;margin:0;padding:0;}
/* ── layout ── */
.wrap{max-width:var(--maxw);margin:0 auto;padding:0 24px;}
.sect{padding:96px 0;position:relative;}
.sect.tight{padding:64px 0;}
.sect-head{text-align:center;max-width:760px;margin:0 auto 56px;}
.sect-head h2{font-size:clamp(26px,4vw,40px);margin-top:16px;}
.sect-head p{color:var(--text2);font-size:17px;margin-top:14px;}
.light{background:#F7F7FC;color:#14141F;--card:#fff;--card-alt:#F1F0FA;--border:#E6E5F2;--bsoft:#EDECF7;--text:#14141F;--text2:#54546A;--text3:#8B8BA3;}
.split{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;}
.split.rev-dir{direction:rtl;}
.split.rev-dir>*{direction:ltr;}
@media(max-width:860px){.split{grid-template-columns:1fr;gap:36px;}.split.rev-dir{direction:ltr;}}
@media(max-width:640px){.sect{padding:64px 0;}.sect-head h2{font-size:26px;}}
/* ── reveal ── */
.rev{opacity:0;transform:translateY(26px);transition:opacity .7s cubic-bezier(.2,.7,.3,1),transform .7s cubic-bezier(.2,.7,.3,1);}
.rev-in{opacity:1;transform:none;}
@media(prefers-reduced-motion:reduce){.rev{opacity:1!important;transform:none!important;transition:none!important;}}
/* ── banner ── */
.banner{background:linear-gradient(90deg,#1c1430,#1a1030 60%,#101425);border-bottom:1px solid rgba(255,255,255,.06);text-align:center;padding:10px 16px;font-size:13.5px;color:#E9D9A8;font-weight:600;position:sticky;top:0;z-index:80;}
.timer-dig{display:inline-flex;gap:5px;margin-left:8px;}
.timer-dig span{background:#00000088;border:1px solid #ffffff22;border-radius:6px;padding:2px 8px;font-variant-numeric:tabular-nums;color:#fff;font-weight:700;font-family:monospace;}
/* ── nav ── */
.topnav{position:sticky;top:37px;z-index:70;background:rgba(8,8,13,.88);backdrop-filter:blur(20px) saturate(160%);border-bottom:1px solid rgba(255,255,255,.07);}
.topnav .wrap{display:flex;align-items:center;justify-content:space-between;height:64px;}
.logo{display:flex;align-items:center;gap:8px;font-family:'Manrope';font-weight:800;font-size:18px;color:#fff;}
.logo-mark{width:26px;height:26px;border-radius:7px;background:var(--grad);display:flex;align-items:center;justify-content:center;box-shadow:0 3px 12px -3px rgba(139,92,246,.65);}
.logo-mark::after{content:'';width:9px;height:9px;background:#fff;border-radius:2px;transform:rotate(45deg);opacity:.92;}
.navlinks{display:flex;gap:4px;font-size:14px;font-weight:450;}
.navlinks a{color:var(--text2);padding:6px 13px;border-radius:8px;transition:color .18s,background .18s;letter-spacing:-.01em;}
.navlinks a:hover{color:#fff;background:rgba(255,255,255,.055);}
.btn-nav{background:var(--grad);color:#fff;font-weight:600;font-size:13.5px;padding:0 18px;height:34px;border-radius:9px;display:inline-flex;align-items:center;box-shadow:inset 0 1px 0 rgba(255,255,255,.2),0 0 0 1px rgba(139,92,246,.5),0 4px 20px -4px rgba(139,92,246,.75);transition:transform .18s,box-shadow .18s,filter .18s;}
.btn-nav:hover{transform:translateY(-1px);box-shadow:inset 0 1px 0 rgba(255,255,255,.25),0 0 0 1px rgba(139,92,246,.6),0 8px 28px -4px rgba(139,92,246,.85);filter:brightness(1.06);}
@media(max-width:820px){.navlinks{display:none;}}
/* ── mini-cta ── */
.mini-cta{position:fixed;left:0;right:0;bottom:-90px;z-index:75;background:rgba(8,8,13,.92);backdrop-filter:blur(10px);border-top:1px solid rgba(255,255,255,.07);padding:14px 20px;display:flex;align-items:center;justify-content:center;gap:18px;transition:bottom .35s cubic-bezier(.2,.7,.3,1);}
.mini-cta--show{bottom:0;}
.mini-cta__label{color:#fff;font-size:14px;font-weight:600;}
@media(max-width:560px){.mini-cta__label{display:none;}}
/* ── exit intent ── */
.exit-overlay{position:fixed;inset:0;background:rgba(8,8,13,.85);backdrop-filter:blur(8px);z-index:999;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .3s ease;}
.exit-modal{background:var(--card);border:1px solid rgba(139,92,246,.3);border-radius:24px;padding:40px;max-width:440px;text-align:center;position:relative;box-shadow:0 24px 60px -12px rgba(0,0,0,.6),0 0 0 1px rgba(139,92,246,.15);animation:slideUp .4s cubic-bezier(.2,.7,.3,1);}
.exit-close{position:absolute;top:16px;right:16px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:50%;color:var(--text3);cursor:pointer;transition:background .2s,color .2s;font-size:14px;}
.exit-close:hover{background:rgba(255,255,255,.08);color:var(--text);}
.exit-icon{font-size:42px;line-height:1;margin-bottom:20px;filter:drop-shadow(0 4px 12px rgba(245,166,35,.3));}
.exit-modal h3{font-family:'Manrope';font-size:24px;}
.exit-modal p{color:var(--text2);font-size:15px;margin-top:12px;line-height:1.6;}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes slideUp{from{opacity:0;transform:translateY(20px) scale(.96);}to{opacity:1;transform:translateY(0) scale(1);}}
/* ── buttons ── */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-family:'Manrope';font-weight:700;font-size:15px;padding:13px 26px;border-radius:100px;cursor:pointer;border:none;text-decoration:none;transition:transform .2s ease,box-shadow .2s ease,background .2s ease;white-space:nowrap;}
.btn-primary{background:var(--grad);color:#fff;box-shadow:0 8px 28px -8px rgba(139,92,246,.6);animation:pulseglow 3.5s ease-in-out 2;}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 36px -6px rgba(139,92,246,.85);}
.btn-lg{font-size:15px;padding:14px 30px;}
@keyframes pulseglow{0%,100%{box-shadow:0 8px 28px -8px rgba(139,92,246,.55);}50%{box-shadow:0 10px 40px -4px rgba(139,92,246,.9);}}
.ctas{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}
.microcopy{color:var(--text3);font-size:13px;margin-top:14px;text-align:center;}
/* ── eyebrow ── */
.eyebrow{display:inline-flex;align-items:center;gap:8px;font-family:'Manrope';font-weight:700;font-size:12px;letter-spacing:.1em;padding:6px 16px;border-radius:999px;text-transform:uppercase;background:rgba(139,92,246,.1);border:1px solid rgba(139,92,246,.25);color:#C4B5FD;}
.eyebrow::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--grad);box-shadow:0 0 8px rgba(139,92,246,.6);}
.eyebrow-dot{display:inline-flex;align-items:center;gap:8px;background:rgba(139,92,246,.1);border:1px solid rgba(139,92,246,.25);color:#C4B5FD;font-size:13px;font-weight:600;padding:7px 18px;border-radius:999px;}
.eyebrow-dot i{width:6px;height:6px;border-radius:50%;background:var(--purple);display:inline-block;animation:pulseBadge 2s infinite;}
@keyframes pulseBadge{0%{box-shadow:0 0 0 0 rgba(139,92,246,.4);}70%{box-shadow:0 0 0 6px rgba(139,92,246,0);}100%{box-shadow:0 0 0 0 rgba(139,92,246,0);}}
.light .eyebrow-dot{color:#5B3FD1;}
.grad-text{background:var(--grad-t);-webkit-background-clip:text;background-clip:text;color:transparent;}
/* ── blobs ── */
.hero{padding:96px 0 72px;text-align:center;overflow:hidden;position:relative;background:radial-gradient(ellipse 1100px 600px at 50% 0%,rgba(139,92,246,.2) 0%,rgba(59,130,246,.1) 45%,transparent 70%);}
.blob{position:absolute;border-radius:50%;filter:blur(70px);z-index:0;animation:bfloat 9s ease-in-out infinite alternate;}
.blob1{width:420px;height:420px;background:rgba(139,92,246,.28);top:-140px;left:-100px;}
.blob2{width:380px;height:380px;background:rgba(59,130,246,.2);top:0;right:-120px;animation-delay:1.5s;}
@keyframes bfloat{0%{transform:translate(0,0);}100%{transform:translate(30px,-30px);}}
.hero .wrap{position:relative;z-index:1;}
.hero h1{font-size:clamp(32px,5.5vw,58px);max-width:920px;margin:20px auto 0;letter-spacing:-.025em;}
.hero .sub{color:var(--text2);font-size:17px;max-width:640px;margin:20px auto 0;line-height:1.7;}
/* ── path cards ── */
.path-cards{display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:860px;margin:40px auto 0;text-align:left;}
@media(max-width:700px){.path-cards{grid-template-columns:1fr;}}
.path-card{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:24px;transition:transform .25s,box-shadow .25s,border-color .25s;}
.path-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px -10px rgba(139,92,246,.2);border-color:rgba(139,92,246,.3);}
.path-card .tag{font-size:11px;color:#A78BFA;font-weight:700;letter-spacing:.08em;text-transform:uppercase;}
.path-card h4{font-size:15.5px;font-family:'Manrope';font-weight:700;margin-top:10px;}
.path-card p{color:var(--text2);font-size:14px;margin-top:8px;}
/* ── video slot ── */
.video-slot{max-width:820px;margin:48px auto 0;aspect-ratio:16/9;background:linear-gradient(145deg,#171426,#0d0d16);border:1px solid var(--border);border-radius:20px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:14px;position:relative;overflow:hidden;cursor:pointer;}
.video-slot::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,rgba(139,92,246,.18),transparent 65%);}
.playbtn{width:62px;height:62px;border-radius:50%;background:var(--grad);display:flex;align-items:center;justify-content:center;z-index:1;box-shadow:0 10px 36px -6px rgba(139,92,246,.6);transition:transform .2s;}
.playbtn:hover{transform:scale(1.08);}
.video-label{color:var(--text3);font-size:13px;z-index:1;letter-spacing:.03em;}
/* ── testimonials ── */
.testi-strip{display:flex;gap:14px;max-width:1000px;margin:48px auto 0;overflow-x:auto;padding-bottom:8px;scrollbar-width:thin;}
.testi{min-width:280px;background:var(--card);border:1px solid var(--border);border-radius:var(--rsm);padding:20px;font-size:14px;color:var(--text2);transition:transform .2s,border-color .2s;flex-shrink:0;}
.testi:hover{transform:translateY(-3px);border-color:rgba(139,92,246,.25);}
.testi-who{display:flex;align-items:center;gap:10px;margin-top:14px;}
.testi-avatar{width:30px;height:30px;border-radius:50%;background:var(--grad);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#fff;font-family:'Manrope';}
.testi-name{font-size:13px;color:var(--text);font-weight:600;}
.testi-role{font-size:12px;color:var(--text3);}
.sample-flag{font-size:11px;color:var(--amber);margin-top:8px;display:block;opacity:.8;}
/* ── prose / split sections ── */
.prose p{color:var(--text2);font-size:16px;margin-top:16px;line-height:1.75;}
.prose p:first-child{margin-top:0;}
.prose strong{color:var(--text);font-weight:700;}
.pullquote{background:var(--card-alt);border-left:3px solid var(--purple);border-radius:0 var(--rsm) var(--rsm) 0;padding:18px 22px;margin-top:22px;font-size:15.5px;font-weight:600;color:var(--text);}
.light .pullquote{background:#EAE8FD;}
.hl-p{color:#A78BFA;font-weight:700;}
.hl-gold{color:#B8860B;font-weight:700;}
.light .hl-gold{color:#7A4D00;}
.illus-box{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:28px;display:flex;align-items:center;justify-content:center;min-height:240px;}
.light .illus-box{background:#fff;border-color:#E6E5F2;}
/* ── chips ── */
.chips{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:700px;margin:0 auto;}
.chip{background:var(--card);border:1px solid var(--border);border-radius:999px;padding:10px 20px;font-size:13.5px;color:var(--text2);transition:transform .15s,border-color .15s;}
.chip:hover{transform:translateY(-2px);border-color:rgba(139,92,246,.35);}
/* ── workaround cards ── */
.wcards{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
@media(max-width:720px){.wcards{grid-template-columns:1fr;}}
.wcard{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:26px;position:relative;overflow:hidden;transition:transform .2s,border-color .2s;}
.wcard:hover{transform:translateY(-3px);border-color:rgba(139,92,246,.25);}
.wcard-tag{font-size:11px;letter-spacing:.08em;color:var(--text3);font-family:monospace;text-transform:uppercase;}
.wcard-stamp{position:absolute;top:20px;right:20px;font-size:10px;font-weight:700;color:var(--text3);border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);padding:3px 9px;border-radius:6px;letter-spacing:.04em;}
.wcard-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin:14px 0 12px;}
.wcard h4{font-size:15.5px;font-family:'Manrope';font-weight:700;}
.wcard-cost{color:var(--text3);font-weight:600;font-size:13px;margin-top:8px;}
.wcard p{color:var(--text2);font-size:14px;margin-top:8px;}
/* ── trap / stat cards ── */
.traps{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
@media(max-width:900px){.traps{grid-template-columns:1fr;}}
.trap-card{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:28px;transition:transform .25s,border-color .25s;}
.trap-card:hover{transform:translateY(-4px);border-color:rgba(139,92,246,.25);}
.light .trap-card{background:#fff;border-color:#E6E5F2;}
.trap-icon{width:52px;height:52px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;}
.trap-label{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--text3);font-weight:700;}
.trap-stat{font-family:'Manrope';font-weight:800;font-size:40px;margin-top:6px;line-height:1;background:var(--grad-t);-webkit-background-clip:text;background-clip:text;color:transparent;}
.trap-card p{color:var(--text2);font-size:14px;margin-top:14px;}
.trap-src{color:var(--text3);font-size:12px;margin-top:10px;display:block;}
/* ── replace-the-stack ── */
.stack-list{max-width:820px;margin:0 auto;display:flex;flex-direction:column;gap:8px;}
.stack-row{display:flex;align-items:center;justify-content:space-between;gap:20px;background:var(--card);border:1px solid var(--border);border-radius:var(--rsm);padding:16px 22px;flex-wrap:wrap;transition:transform .15s,border-color .15s;}
.stack-row:hover{transform:translateX(4px);border-color:rgba(139,92,246,.25);}
.light .stack-row{background:#fff;border-color:#E6E5F2;}
.stack-name{font-size:14.5px;font-weight:600;color:var(--text);}
.light .stack-name{color:#14141F;}
.stack-right{display:flex;align-items:center;gap:14px;}
.stack-old{color:var(--text3);text-decoration:line-through;font-size:13px;}
.stack-incl{color:var(--green);font-weight:700;font-size:13px;}
/* ── feature grid ── */
.feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
@media(max-width:900px){.feat-grid{grid-template-columns:1fr 1fr;}}
@media(max-width:600px){.feat-grid{grid-template-columns:1fr;}}
.feat-card{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:22px;transition:transform .2s,box-shadow .2s,border-color .2s;}
.feat-card:hover{transform:translateY(-4px);box-shadow:0 14px 40px -10px rgba(139,92,246,.15);border-color:rgba(139,92,246,.25);}
.feat-icon{width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:14px;background:rgba(139,92,246,.1);}
.feat-card h4{font-size:15px;font-family:'Manrope';font-weight:700;}
.feat-card p{color:var(--text2);font-size:13.5px;margin-top:8px;}
/* ── process steps ── */
.steps{max-width:760px;margin:0 auto;display:flex;flex-direction:column;}
.step{display:flex;gap:22px;padding:26px 0;border-bottom:1px solid var(--bsoft);}
.step:last-child{border-bottom:none;}
.light .step{border-color:#EDECF7;}
.step-num{font-family:'Manrope';font-weight:800;font-size:20px;color:transparent;-webkit-text-stroke:1.4px rgba(139,92,246,.5);flex-shrink:0;width:44px;padding-top:2px;}
.step-body h4{font-size:16px;font-family:'Manrope';font-weight:700;}
.step-time{color:#A78BFA;font-size:12px;font-weight:600;margin-left:10px;background:rgba(139,92,246,.1);padding:2px 8px;border-radius:999px;}
.step-body p{color:var(--text2);font-size:14px;margin-top:6px;}
/* ── for / not-for ── */
.fit-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
@media(max-width:720px){.fit-grid{grid-template-columns:1fr;}}
.fit-card{border-radius:var(--r);padding:28px;border:1px solid var(--border);}
.fit-card.yes{background:linear-gradient(160deg,rgba(52,211,153,.07),var(--card));}
.fit-card.no{background:linear-gradient(160deg,rgba(139,92,246,.07),var(--card));}
.fit-card h4{font-family:'Manrope';font-size:17px;margin-bottom:16px;}
.fit-list{display:flex;flex-direction:column;gap:12px;}
.fit-list li{display:flex;gap:10px;font-size:14px;color:var(--text2);}
.tick{font-weight:800;flex-shrink:0;}
.tick.y{color:var(--green);}
.tick.n{color:var(--text3);}
/* ── value table ── */
.value-table{max-width:760px;margin:0 auto;border:1px solid var(--border);border-radius:var(--r);overflow:hidden;background:var(--card);}
.value-row{display:flex;justify-content:space-between;align-items:center;padding:13px 22px;border-bottom:1px solid var(--bsoft);font-size:14px;gap:12px;}
.value-row .vitem{color:var(--text2);flex:1;}
.value-row .vval{color:var(--text);font-weight:700;white-space:nowrap;}
.value-row.vtotal{background:var(--card-alt);}
.value-row.vtotal .vitem{color:var(--text);font-weight:700;}
.value-row.vprice{background:rgba(52,211,153,.06);border-bottom:none;}
.value-row.vprice .vitem{color:var(--text);font-family:'Manrope';font-weight:800;font-size:16px;}
.value-row.vprice .vval{color:var(--green);font-family:'Manrope';font-weight:800;font-size:26px;}
.value-note{font-size:11.5px;color:var(--text3);text-align:center;margin-top:12px;}
/* ── versus ── */
.versus{display:grid;grid-template-columns:1fr 1fr;max-width:920px;margin:0 auto;border-radius:var(--r);overflow:hidden;border:1px solid var(--border);}
@media(max-width:760px){.versus{grid-template-columns:1fr;}}
.versus-col{padding:28px;}
.versus-col.old{background:rgba(255,255,255,.02);border-right:1px solid var(--bsoft);}
.versus-col.new{background:rgba(139,92,246,.06);}
.versus-col h4{font-family:'Manrope';font-size:13px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:16px;}
.versus-col.old h4{color:var(--text3);}
.versus-col.new h4{color:#A78BFA;}
.versus-row{display:flex;gap:10px;font-size:13.5px;color:var(--text2);padding:9px 0;border-top:1px solid var(--bsoft);}
.versus-row:first-of-type{border-top:none;}
.versus-col.old .versus-row::before{content:"✗";color:var(--text3);font-weight:800;flex-shrink:0;}
.versus-col.new .versus-row::before{content:"✓";color:var(--green);font-weight:800;flex-shrink:0;}
/* ── bonus cards ── */
.bonus-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
@media(max-width:820px){.bonus-grid{grid-template-columns:1fr;}}
.bonus-card{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:24px;text-align:center;transition:transform .2s,border-color .2s;}
.bonus-card:hover{transform:translateY(-4px);border-color:rgba(139,92,246,.25);}
.bonus-card h4{font-size:15px;font-family:'Manrope';font-weight:700;margin-top:12px;}
.bonus-card p{color:var(--text2);font-size:13.5px;margin-top:8px;}
.bonus-icon{width:48px;height:48px;border-radius:12px;background:rgba(139,92,246,.1);display:flex;align-items:center;justify-content:center;margin:0 auto;}
/* ── guarantee ── */
.guarantee{display:flex;align-items:center;gap:36px;max-width:820px;margin:0 auto;background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:36px;}
@media(max-width:700px){.guarantee{flex-direction:column;text-align:center;gap:20px;}}
.guarantee-seal{flex-shrink:0;width:68px;height:68px;border-radius:50%;background:linear-gradient(135deg,rgba(139,92,246,.15),rgba(59,130,246,.1));border:2px solid rgba(139,92,246,.25);display:flex;align-items:center;justify-content:center;}
.guarantee h3{font-size:20px;font-family:'Manrope';}
.guarantee p{color:var(--text2);font-size:14.5px;margin-top:10px;}
/* ── checklist ── */
.checklist{display:flex;flex-wrap:wrap;gap:10px 24px;max-width:880px;margin:0 auto;justify-content:center;}
.checklist li{font-size:13.5px;color:var(--text2);display:flex;align-items:center;gap:8px;}
.checklist li::before{content:"✓";color:var(--green);font-weight:800;flex-shrink:0;}
/* ── founder ── */
.founder{max-width:720px;margin:0 auto;background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:36px;}
.founder-head{display:flex;align-items:center;gap:16px;margin-bottom:20px;}
.founder-avatar{width:50px;height:50px;border-radius:50%;background:var(--grad);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:'Manrope';font-weight:800;color:#fff;font-size:18px;}
.founder-name{font-weight:700;font-size:15px;}
.founder-role{color:var(--text3);font-size:13px;}
.founder blockquote{font-size:15.5px;color:var(--text2);font-style:italic;line-height:1.75;border-left:3px solid rgba(139,92,246,.5);padding-left:20px;}
/* ── faq ── */
.faq{max-width:760px;margin:0 auto;display:flex;flex-direction:column;gap:6px;}
.faq-item{background:var(--card);border:1px solid var(--border);border-radius:var(--rsm);overflow:hidden;transition:border-color .2s;}
.faq-item.open{border-color:rgba(139,92,246,.35);}
.faq-q{display:flex;justify-content:space-between;align-items:center;padding:18px 22px;cursor:pointer;font-weight:600;font-size:14.5px;width:100%;background:none;border:none;text-align:left;color:var(--text);font-family:'Inter';gap:16px;}
.faq-q:hover{background:rgba(255,255,255,.025);}
.faq-plus{color:#A78BFA;font-size:20px;font-weight:300;flex-shrink:0;transition:transform .2s;}
.faq-item.open .faq-plus{transform:rotate(45deg);}
.faq-a{overflow:hidden;transition:max-height .28s ease;}
.faq-a p{padding:0 22px 18px;color:var(--text2);font-size:14px;}
/* ── ps block ── */
.ps-block{max-width:720px;margin:0 auto;display:flex;flex-direction:column;gap:12px;}
.ps-block p{color:var(--text2);font-size:14.5px;}
.ps-block strong{color:var(--text);}
/* ── final cta ── */
.final-cta{text-align:center;padding:100px 0;background:radial-gradient(ellipse 900px 500px at 50% 30%,rgba(139,92,246,.18),transparent 65%);}
.final-cta h2{font-size:clamp(24px,4vw,36px);max-width:680px;margin:0 auto;}
.final-cta .lead{color:var(--text2);font-size:16px;max-width:580px;margin:16px auto 0;}
/* ── footer ── */
.sp-footer{border-top:1px solid var(--bsoft);padding:36px 0;text-align:center;color:var(--text3);font-size:13px;}
.sp-footer a{color:var(--text3);}
.sp-footer a:hover{color:var(--text2);}
      `}</style>

      <div className="sp">
        <ExitIntent 
          message="Your Founder's Price is still active for the next few minutes. Come back, and it may not be." 
          cta="Build My First Offer — $49"
        />
        <MiniCta />

        {/* Banner */}
        <div className="banner">
          {"Founder's Price Ends Soon — Then It's $39/Month. Lock It In Now."}
          <span className="timer-dig">
            {timer.split(":").map((v, i) => <span key={i}>{v}</span>)}
          </span>
        </div>

        {/* Nav */}
        <nav className="topnav">
          <div className="wrap">
            <div className="logo">
              <div className="logo-mark" />
              OFFER<span style={{ color: "#A78BFA" }}>IQ</span>
            </div>
            <div className="navlinks">
              <a href="#product">Product</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#pricing">Pricing</a>
              <a href="#faq">FAQ</a>
            </div>
            <a href="#pricing" className="btn-nav">Get Started</a>
          </div>
        </nav>

        {/* ── HERO ── */}
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
                <a href="#pricing" className="btn btn-primary btn-lg">
                  Build My First Offer — $49 One-Time <ChevronRight size={18} />
                </a>
              </div>
              <p className="microcopy">No marketing experience required &nbsp;·&nbsp; 30-day money-back guarantee</p>
            </Rev>

            <div className="path-cards">
              <Rev d={80}>
                <div className="path-card">
                  <span className="tag">Path 01</span>
                  <h4>I Already Have An Idea Or Existing Offer</h4>
                  <p>Paste a URL, upload a PDF, or describe it. OfferIQ builds the strategy and funnel around what you already have.</p>
                </div>
              </Rev>
              <Rev d={160}>
                <div className="path-card">
                  <span className="tag">Path 02</span>
                  <h4>I Do Not Have Anything Yet</h4>
                  <p>Give OfferIQ your niche, audience, and price range. It hands you offer ideas already proven to work, then builds the complete product you pick.</p>
                </div>
              </Rev>
            </div>

            <Rev d={200}>
              <div className="video-slot">
                <div className="playbtn"><PlayIcon size={24} color="#fff" fill="#fff" /></div>
                <span className="video-label">Demo video — 90-second product walkthrough</span>
              </div>
            </Rev>

            <Rev d={250}>
              <div className="testi-strip">
                {[
                  { q: "I had a coaching idea sitting in my notes for eight months. Pasted a rough description in, and had pricing, positioning, and a live page inside an hour.", name: "Danielle M.", role: "Business Coach" },
                  { q: "My course was already live and just not selling. The report told me exactly what was wrong with the price and the page. Fixed both.", name: "Marcus T.", role: "Course Creator" },
                  { q: "I had no idea what to charge or how to frame it. OfferIQ gave me a number I could stand behind — and the copy to go with it.", name: "Priya K.", role: "Consultant" },
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
                    <span className="sample-flag">Sample — swap with real testimonials before launch</span>
                  </div>
                ))}
              </div>
            </Rev>
          </div>
        </section>

        {/* ── THE ACTUAL BUSINESS (light) ── */}
        <section id="product" className="sect light">
          <div className="wrap split">
            <Rev cls="prose">
              <span className="eyebrow-dot"><i />Before The Page, The Ads, Or The Emails</span>
              <h2 style={{ fontSize: "clamp(22px,3vw,30px)", marginTop: 16 }}>The Actual Business, Before Anything Else</h2>
              <p style={{ marginTop: 20 }}>Every course, coaching program, or service business starts the same way: someone who knows something valuable has to turn that knowledge into an offer someone will pay for. <strong>That is the actual business.</strong> Everything else — the page, the ads, the emails — is construction.</p>
              <p>Building a funnel before that strategy exists is like pouring a foundation before you have seen a blueprint. You can still put up walls. You just do not know yet whether the house is where anyone wants to live.</p>
              <div className="pullquote">The version everyone has heard skips the part that matters: who specifically buys this, what they will actually pay, and how to position it against everything they have already seen.</div>
            </Rev>
            <Rev d={100} cls="illus-box">
              <svg width="320" height="260" viewBox="0 0 320 260" fill="none">
                <defs><linearGradient id="ig1" x1="0" y1="0" x2="320" y2="260" gradientUnits="userSpaceOnUse"><stop stopColor="#7C5CFC"/><stop offset="1" stopColor="#4F8FFF"/></linearGradient></defs>
                <rect x="10" y="10" width="300" height="240" rx="16" fill="#F1EFFC"/>
                <g opacity=".4" stroke="#B9AEF2" strokeWidth="1">
                  <line x1="10" y1="60" x2="310" y2="60"/><line x1="10" y1="110" x2="310" y2="110"/>
                  <line x1="10" y1="160" x2="310" y2="160"/><line x1="80" y1="10" x2="80" y2="250"/>
                  <line x1="160" y1="10" x2="160" y2="250"/><line x1="240" y1="10" x2="240" y2="250"/>
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

        {/* ── WORKAROUNDS (dark) ── */}
        <section className="sect">
          <div className="wrap">
            <Rev cls="sect-head">
              <span className="eyebrow">Workaround Log · 4 Cases On File</span>
              <h2>The Workarounds That Do Not Work</h2>
            </Rev>
            <div className="wcards">
              {[
                { stamp: "High Cost",       tag: "CASE 01", bg: "rgba(139,92,246,.14)", Icon: Briefcase,     title: "Hire it out, piece by piece",          cost: "$2,000–$10,000/project · $2,000–$15,000/page", body: "Coordinate a strategist, a copywriter, a designer, and a media buyer, and you are 3–6 weeks and several thousand dollars in before a single page is live." },
                { stamp: "Missing Strategy", tag: "CASE 02", bg: "rgba(59,130,246,.14)",   Icon: Bot,           title: "Stitch together generic AI tools",     cost: "$20–$50/mo writing tool · $99–$297/mo page builder", body: "Neither tool knows your positioning, your pricing, or what to say first. You still have to know the strategy before either one is useful." },
                { stamp: "Unvalidated",      tag: "CASE 03", bg: "rgba(245,166,35,.14)",   Icon: LayoutTemplate, title: "Buy a template pack or a course",   cost: "$67–$297 one-time", body: "You get a shape to fill in — not a benchmarked price, not a persona, not a reason to believe the positioning is right for your specific offer." },
                { stamp: "Time Cost",        tag: "CASE 04", bg: "rgba(139,92,246,.1)",    Icon: Clock,         title: "Do it all yourself, from scratch",     cost: "Free in dollars — 20–40+ hours of your time", body: "At the end of it, you still do not know if any of it is right, because none of it was checked against what actually converts." },
              ].map((w, i) => (
                <Rev key={w.title} d={i * 60}>
                  <div className="wcard">
                    <span className="wcard-stamp">{w.stamp}</span>
                    <span className="wcard-tag">{w.tag}</span>
                    <div className="wcard-icon" style={{ background: w.bg }}>
                      <Ico icon={w.Icon} size={20} color="#A78BFA" />
                    </div>
                    <h4>{w.title}</h4>
                    <div className="wcard-cost">{w.cost}</div>
                    <p>{w.body}</p>
                  </div>
                </Rev>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 44 }}>
              <Rev><a href="#pricing" className="btn btn-primary">Build My First Offer — $49 One-Time <ChevronRight size={16} /></a></Rev>
            </div>
          </div>
        </section>

        {/* ── WHAT IF STRATEGY CAME FIRST (light, reversed) ── */}
        <section className="sect light">
          <div className="wrap split rev-dir">
            <Rev cls="illus-box">
              <svg width="300" height="240" viewBox="0 0 300 240" fill="none">
                <defs>
                  <linearGradient id="ig2" x1="0" y1="0" x2="300" y2="240" gradientUnits="userSpaceOnUse"><stop stopColor="#F5D77E"/><stop offset="1" stopColor="#7C5CFC"/></linearGradient>
                  <linearGradient id="ig2b" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#7C5CFC"/><stop offset="1" stopColor="#4F8FFF"/></linearGradient>
                </defs>
                <circle cx="90" cy="90" r="46" fill="url(#ig2)"/>
                <rect x="72" y="126" width="36" height="14" rx="4" fill="#D9C48A"/>
                <g stroke="#C9C9E8" strokeWidth="2">
                  <line x1="90" y1="18" x2="90" y2="4"/>
                  <line x1="34" y1="46" x2="22" y2="36"/>
                  <line x1="146" y1="46" x2="158" y2="36"/>
                </g>
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
              <h2 style={{ fontSize: "clamp(22px,3vw,30px)", marginTop: 16 }}>What If The Strategy Came First?</h2>
              <p style={{ marginTop: 20 }}>What if positioning, pricing, and a full-funnel blueprint came first — <span className="hl-p">automatically</span> — before you wrote a single word? What if the copy for every page came out of that same strategy, not a blank cursor?</p>
              <p>And what if the offer is built for you? Yes — <strong>a complete, sellable offer built from intelligence, no guesses.</strong> That is exactly what OfferIQ does.</p>
              <p>This is not a page builder, a copywriting tool, or a course platform — those all assume the hard part is already solved. <strong>OfferIQ is the layer that comes before all three.</strong></p>
            </Rev>
          </div>
        </section>

        {/* ── BUILT FOR REAL PEOPLE (dark) ── */}
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

        {/* ── THREE TRAPS (light) ── */}
        <section className="sect light">
          <div className="wrap">
            <Rev cls="sect-head">
              <span className="eyebrow">Why This Is Not Just A Feeling</span>
              <h2>Three traps quietly kill every offer before it has a chance to sell.</h2>
            </Rev>
            <div className="traps">
              {[
                { Icon: TrendingDown, bg: "rgba(139,92,246,.1)",  color: "#A78BFA", label: "The Blank Canvas Trap",      n: 42,  suf: "%",  p: "of startups fail because they built something nobody actually needed.", src: "— CB Insights" },
                { Icon: DollarSign,   bg: "rgba(245,166,35,.1)",  color: "#F5A623", label: "The Pricing Trap",          n: 18,  suf: "%",  p: "of startups collapse from a flawed pricing model — too little to sustain, or too much for the market.", src: "— CB Insights" },
                { Icon: TrendingUp,   bg: "rgba(59,130,246,.1)",  color: "#60A5FA", label: "The Acquisition Cost Trap", n: 222, suf: "%+", p: "Customer acquisition costs have climbed that much — expensive clicks bleed margin dry before a single sale lands.", src: "— ProfitWell / Paddle" },
              ].map((t, i) => (
                <Rev key={t.label} d={i * 80}>
                  <div className="trap-card">
                    <div className="trap-icon" style={{ background: t.bg }}>
                      <Ico icon={t.Icon} size={24} color={t.color} />
                    </div>
                    <div className="trap-label">{t.label}</div>
                    <div className="trap-stat"><CountUp to={t.n} suffix={t.suf} /></div>
                    <p>{t.p}</p>
                    <span className="trap-src">{t.src}</span>
                  </div>
                </Rev>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 44 }}>
              <Rev><a href="#pricing" className="btn btn-primary">Build My First Offer — $49 One-Time <ChevronRight size={16} /></a></Rev>
            </div>
          </div>
        </section>

        {/* ── REAL COST (dark) ── */}
        <section className="sect">
          <div className="wrap split">
            <Rev cls="prose">
              <span className="eyebrow">The Real Cost Of Getting This Wrong</span>
              <p style={{ marginTop: 20 }}>Getting the persona wrong does not just cost you a guess — it costs <span className="hl-p">every dollar of traffic</span> you send to a page that talks to the wrong person.</p>
              <p>Getting the price wrong does not just feel bad — it either caps your revenue or kills conversions, and you often cannot tell which one is happening from the inside.</p>
              <div className="pullquote">
                At real market rates, doing this manually runs <span className="hl-gold">$6,200 to $32,747+ per offer</span>. Building two validated offers a year the traditional way is <span className="hl-gold">$12,400 to $65,494+</span> — and 6–12 weeks of coordinating people who do not share your context.
              </div>
              <p>That is not a one-time cost. That is the tax on every offer you ever build without the strategy layer in place first.</p>
            </Rev>
            <Rev d={100} cls="illus-box">
              <svg width="300" height="250" viewBox="0 0 300 250" fill="none">
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

        {/* ── REPLACE THE STACK (light) ── */}
        <section className="sect light">
          <div className="wrap">
            <Rev cls="sect-head">
              <span className="eyebrow">Replace The Stack</span>
              <h2>What OfferIQ Actually Replaces</h2>
              <p>Instead of paying thousands and waiting weeks — everything benchmarked against 35,000+ real offers, in one session.</p>
            </Rev>
            <Rev d={80}>
              <div className="stack-list">
                {[
                  ["Offer strategy & positioning, consultant",    "$2,000–$10,000 / project"],
                  ["Direct-response sales copywriter",            "$2,000–$15,000 / page"],
                  ["Landing page / funnel builder software",      "$99–$297 / month"],
                  ["Lead magnet & bonus design + writing",        "$500–$2,000 / asset"],
                  ["Paid traffic / media buying strategist",      "$1,500–$5,000 / month"],
                  ["Email sequence writing & tooling",            "$50–$150/month + writer fees"],
                  ["Content creator / info product build",        "$500–$5,000"],
                ].map(([name, old]) => (
                  <div className="stack-row" key={name}>
                    <span className="stack-name">{name}</span>
                    <div className="stack-right">
                      <span className="stack-old">{old}</span>
                      <span className="stack-incl">Included</span>
                    </div>
                  </div>
                ))}
              </div>
            </Rev>
          </div>
        </section>

        {/* ── WHAT YOU GET (dark) ── */}
        <section id="how-it-works" className="sect">
          <div className="wrap">
            <Rev cls="sect-head">
              <span className="eyebrow">What You Get</span>
              <h2>One workspace. Every phase of the offer, connected.</h2>
            </Rev>
            <div className="feat-grid">
              {[
                { Icon: Brain,       title: "Strategy Report",        desc: "16 strategic sections, benchmarked against 35,000+ real offers. Positioning, Persona, Pricing, Funnel Health Score, and more." },
                { Icon: PenLine,     title: "Copy Engine",            desc: "Full, ready-to-publish copy for every page — written from your Intelligence Report, not a generic swipe file." },
                { Icon: Monitor,     title: "Funnel Builder",         desc: "Every page assembled automatically. Inline editing, AI section reordering, plain-language AI edits by chat." },
                { Icon: Package,     title: "Asset Bank",             desc: "Your lead magnet and bonus stack, generated as real, downloadable, finished files." },
                { Icon: Rocket,      title: "Traffic Intelligence",   desc: "Platform priority matrix, ready-to-deploy ad copy, a VSL script, and a UGC script — before you spend a dollar on traffic." },
                { Icon: Mail,        title: "Email Sequences",        desc: "Lead Nurture, Launch, Re-engagement, Client Onboarding, and Upsell — written and ready to connect." },
                { Icon: Globe,       title: "Publish & Deploy",       desc: "One-click publishing. Stripe and PayPal integration built in. Live on your subdomain instantly." },
                { Icon: BarChart2,   title: "Leads & Analytics",     desc: "Built-in CRM plus per-funnel analytics: traffic, conversion rate, device breakdown." },
                { Icon: ShoppingCart, title: "Live Sellable Product", desc: "Unique info products built for your sale page, upsell, and downsell — complete and ready to deliver." },
              ].map((f, i) => (
                <Rev key={f.title} d={i * 40}>
                  <div className="feat-card">
                    <div className="feat-icon"><Ico icon={f.Icon} size={22} color="#8B7CFF" /></div>
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

        {/* ── PROCESS STEPS (light) ── */}
        <section className="sect light">
          <div className="wrap">
            <Rev cls="sect-head">
              <span className="eyebrow">The Process, Step By Step</span>
              <h2>Most people go from idea to a launch-ready offer in under <span style={{ color: "var(--purple)" }}>30 minutes</span>.</h2>
            </Rev>
            <Rev d={80}>
              <div className="steps">
                {[
                  { n:"01", t:"Strategy Report",                   time:"~4 min",  d:"Positioning, pricing, a full-funnel blueprint. Start from an idea, a URL, a PDF, or nothing at all." },
                  { n:"02", t:"Copy Engine",                       time:"~2 min",  d:"Full-funnel copy, in your buyer's exact vocabulary." },
                  { n:"03", t:"Funnel Builder",                    time:"~5 min",  d:"Every page assembles automatically. Edit inline or tell the AI Agent what to change in plain language." },
                  { n:"04", t:"Lead Generation & Engagement Plan", time:"~4 min",  d:"Ad copy, a video sales script, a UGC script, full email sequences — before you spend a dollar on traffic." },
                  { n:"05", t:"Publish & Go Live",                 time:"Instant", d:"Connect Stripe or PayPal, publish live on your OfferIQ subdomain. Custom domain connection starts at Pro." },
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

        {/* ── NOT CHATGPT + CAVEAT (dark) ── */}
        <section className="sect tight">
          <div className="wrap">
            <Rev>
              <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto" }}>
                <h3 style={{ fontFamily: "Manrope", fontSize: "clamp(20px,3vw,26px)", fontWeight: 800 }}>Not ChatGPT With Extra Steps</h3>
                <p style={{ color: "var(--text2)", marginTop: 16, fontSize: 16, lineHeight: 1.75 }}>ChatGPT gives you sentences — it does not know what converts in your niche, does not build the page, does not connect a payment processor, and has no data on what <strong style={{ color: "var(--text)" }}>35,000 other offers</strong> already proved works. OfferIQ starts where a generic AI writer stops.</p>
              </div>
            </Rev>
            <Rev d={80}>
              <div style={{ textAlign: "center", maxWidth: 660, margin: "56px auto 0" }}>
                <h3 style={{ fontFamily: "Manrope", fontSize: "clamp(18px,2.5vw,22px)", fontWeight: 800 }}>One Honest Caveat</h3>
                <p style={{ color: "var(--text2)", marginTop: 16, fontSize: 16, lineHeight: 1.75 }}>This will not replace years of business experience overnight, and no report can guarantee a specific result. What OfferIQ replaces is the blank page — the strategic guesswork that normally sits between &ldquo;I know something valuable&rdquo; and &ldquo;here is a live, priced, positioned offer.&rdquo;</p>
              </div>
            </Rev>
          </div>
        </section>

        {/* ── IS THIS FOR YOU (dark) ── */}
        <section className="sect tight">
          <div className="wrap">
            <Rev cls="sect-head"><h2>Is This For You?</h2></Rev>
            <div className="fit-grid">
              <Rev d={60}>
                <div className="fit-card yes">
                  <h4 style={{ color: "var(--green)" }}>This is for you if:</h4>
                  <ul className="fit-list">
                    {[
                      "You want to sell something valuable that will get you started online",
                      "You have real expertise, an audience, or a service and no positioned offer built from it yet",
                      "You already have an offer live and know something is off, but cannot diagnose what",
                      "You would rather spend $49 and 30 minutes than $6,200+ and six weeks finding out the hard way",
                      "You want the strategy and the pages built from the same data, not assembled separately",
                    ].map(l => <li key={l}><span className="tick y">✓</span>{l}</li>)}
                  </ul>
                </div>
              </Rev>
              <Rev d={120}>
                <div className="fit-card no">
                  <h4 style={{ color: "var(--text2)" }}>This is not for you if:</h4>
                  <ul className="fit-list">
                    {[
                      "You already have a fully benchmarked strategy and just need a page builder",
                      "You want a done-for-you agency relationship rather than a system you run yourself",
                      "You are not planning to actually publish or sell anything with what gets built",
                    ].map(l => <li key={l}><span className="tick n">—</span>{l}</li>)}
                  </ul>
                </div>
              </Rev>
            </div>
          </div>
        </section>

        {/* ── PRICING / VALUE TABLE (dark) ── */}
        <section id="pricing" className="sect">
          <div className="wrap">
            <Rev cls="sect-head">
              <span className="eyebrow">Front-End · OfferIQ Starter</span>
              <h2>Everything You Are Getting Today</h2>
              <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 6 }}>Values are proposed — confirm with your team before launch</p>
            </Rev>
            <Rev d={80}>
              <div className="value-table">
                {[
                  ["Live Sellable Offer (Main, Upsell & Downsell products)",  "$2,997"],
                  ["Two-Path Offer Analysis & Build Engine",                   "$497"],
                  ["Full 16-Section Strategy Report",                          "$297"],
                  ["Complete 5-Page Funnel Copy Set",                          "$997"],
                  ["Live Funnel Builder (5 hosted pages)",                     "$297"],
                  ["Asset Bank (lead magnet + 3 bonuses + Offer Guide)",       "$297"],
                  ["Full Email Sequence Suite (5 sequences)",                  "$197"],
                  ["Traffic Intelligence Suite",                               "$397"],
                  ["KPI Analytics Dashboard",                                  "$97"],
                  ["Bonus: Fast-Launch Swipe Pack",                            "$67"],
                  ["Bonus: 30 Proven Offer Hooks Cheat Sheet",                 "$47"],
                  ["Bonus: First Funnel in 24 Hours Video",                    "$37"],
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
            </Rev>
            <div style={{ textAlign: "center", marginTop: 36 }}>
              <Rev d={100}>
                <a href="#" className="btn btn-primary btn-lg">
                  Build My First Offer — Save $6,175 <ChevronRight size={18} />
                </a>
                <p className="microcopy" style={{ marginTop: 16 }}>
                  30-day guarantee &nbsp;·&nbsp; No monthly fee &nbsp;·&nbsp; {"Founder's"} pricing ends soon
                </p>
              </Rev>
            </div>
          </div>
        </section>

        {/* ── VERSUS (dark) ── */}
        <section className="sect tight">
          <div className="wrap">
            <Rev cls="sect-head"><h2>Building Without A Blueprint vs. Building With OfferIQ</h2></Rev>
            <Rev d={80}>
              <div className="versus">
                <div className="versus-col old">
                  <h4>Without OfferIQ</h4>
                  {["Guess at positioning — find out after launch","Write copy and hope it lands","Assemble pages by hand or from a template","Guess where to advertise and at what budget","$6,200–$32,747+ and 3–6 weeks, done manually"].map(r => <div className="versus-row" key={r}>{r}</div>)}
                </div>
                <div className="versus-col new">
                  <h4>With OfferIQ</h4>
                  {["Positioning benchmarked against 35,000+ offers, before you build","Copy written from your own Strategy Report","Pages assembled automatically from your report's design direction","A platform priority matrix, before you spend a dollar","$49 and one sitting"].map(r => <div className="versus-row" key={r}>{r}</div>)}
                </div>
              </div>
            </Rev>
          </div>
        </section>

        {/* ── BONUSES (dark) ── */}
        <section className="sect tight">
          <div className="wrap">
            <Rev cls="sect-head"><h2>Your Fast-Action Bonuses</h2></Rev>
            <div className="bonus-grid">
              {[
                { Icon: Gift,     title: "Fast-Launch Swipe Pack",       desc: "20 pre-written eyebrow, headline, and CTA formulas ready to deploy." },
                { Icon: BookOpen, title: "30 Proven Offer Hooks",         desc: "5 hook archetypes across 6 niches — a cheat sheet you will use every time." },
                { Icon: PlayIcon, title: "First Funnel in 24 Hours",      desc: "A focused 20-minute walkthrough to get your first offer live the same day." },
              ].map((b, i) => (
                <Rev key={b.title} d={i * 80}>
                  <div className="bonus-card">
                    <div className="bonus-icon"><Ico icon={b.Icon} size={24} color="#8B7CFF" /></div>
                    <h4>{b.title}</h4>
                    <p>{b.desc}</p>
                  </div>
                </Rev>
              ))}
            </div>
          </div>
        </section>

        {/* ── CHECKLIST (dark) ── */}
        <section className="sect tight">
          <div className="wrap">
            <Rev cls="sect-head"><h2>Why You Will Want This</h2></Rev>
            <Rev d={80}>
              <ul className="checklist">
                {["Live Sellable Offer","16-section Intelligence Report","Benchmarked against 35,000+ offers","Full 5-page copy set","Automatic page assembly","Inline + AI-agent editing","Lead magnet + bonus generation","Platform priority matrix","Ready-to-deploy ad copy","VSL + UGC scripts","5-sequence email suite","One-click publish","Stripe + PayPal built in","Built-in CRM","Per-funnel analytics","Template Club access","30-day guarantee"].map(c => <li key={c}>{c}</li>)}
              </ul>
            </Rev>
          </div>
        </section>

        {/* ── GUARANTEE (dark) ── */}
        <section className="sect tight">
          <div className="wrap">
            <Rev>
              <div className="guarantee">
                <div className="guarantee-seal"><Ico icon={Shield} size={32} color="#8B7CFF" /></div>
                <div>
                  <h3>30-Day Money-Back Guarantee</h3>
                  <p>No interrogation, no hoops. If you go through the process and decide it is not for you, we will refund every cent within 30 days. No questions asked.</p>
                </div>
              </div>
            </Rev>
          </div>
        </section>

        {/* ── FOUNDER (dark) ── */}
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
                <blockquote>
                  &ldquo;I kept running into the same conversation with creators, coaches, and marketers. They were not stuck because they lacked skill or effort — they were stuck because nobody had told them what to sell, who to sell it to, or what to charge for it. Every tool on the market assumes that part is already solved. I built OfferIQ to be the layer that comes before all of it.&rdquo;
                </blockquote>
              </div>
            </Rev>
          </div>
        </section>

        {/* ── FAQ (dark) ── */}
        <section id="faq" className="sect">
          <div className="wrap">
            <Rev cls="sect-head"><h2>Frequently Asked Questions</h2></Rev>
            <div className="faq">
              {[
                { q: "Is this really one-time, or will I get billed later?", a: "One-time for Front-end and every upgrade tier. After this launch window closes, new customers move to the $39/month plan — buy now, and you are locked into one-time pricing for good." },
                { q: "Why is OfferIQ different from a funnel builder?", a: "Most funnel builders help you build pages. OfferIQ helps you decide what to sell, who to sell it to, how to position it, what to charge, and how to explain it — then builds the pages around that strategy. Funnel builders start with pages. OfferIQ starts with the offer." },
                { q: "What if I do not have any idea what to sell yet?", a: "Use 'I Don't Have Anything Yet.' Give OfferIQ your niche, audience, and price range — it hands you offer ideas already proven to work, and builds the one you choose." },
                { q: "What if I already have an offer live somewhere else?", a: "Use 'I Already Have An Idea Or Existing Offer' — paste the URL, and OfferIQ tells you where the positioning is likely costing you conversions." },
                { q: "Can I edit what OfferIQ creates?", a: "Yes. Edit anything inline, or tell the built-in AI Agent what to change in plain language. Treat the first output as a draft, not a final decision." },
                { q: "Does this work for my niche?", a: "The Strategy Report is benchmarked across a wide range of categories — creators, coaches, consultants, agencies, digital product sellers — not one template reused everywhere." },
                { q: "What happens when I hit the 5-offer cap?", a: "Your existing offers, pages, and data stay fully accessible. You can upgrade to the Unlimited plan to add more." },
                { q: "Can I connect my own domain?", a: "Not on Front-end — you are live on an OfferIQ subdomain, enough to launch and start selling today. Custom domain connection starts at Pro." },
                { q: "Can I use this for clients?", a: "Not on this tier — Front-end through Unlimited are personal-use. Client rights are introduced at Agency." },
              ].map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </div>
        </section>

        {/* ── PS BLOCK (dark) ── */}
        <section className="sect tight">
          <div className="wrap">
            <Rev>
              <div className="ps-block">
                <p><strong>P.S.</strong> Three real traps kill most offers before they ever launch — the wrong thing, the wrong price, or expensive traffic sent to a funnel that was never going to convert. OfferIQ addresses all three at once.</p>
                <p><strong>P.P.S.</strong> Doing this manually runs <strong>$6,200–$32,747+</strong> per offer at real market rates. This is $49, once.</p>
                <p><strong>P.P.P.S.</strong> {"Founder's"} pricing ends when this launch window closes. After that, it is $39/month for new customers.</p>
              </div>
            </Rev>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="final-cta">
          <div className="wrap">
            <Rev>
              <p style={{ color: "var(--text3)", fontSize: 14, marginBottom: 12 }}>5 phases. Under 30 minutes. One sitting.</p>
              <h2>One idea. A live, payment-ready funnel.</h2>
              <p className="lead">Built from 35,000 offers that already converted — not another guess.</p>
              <div className="ctas" style={{ marginTop: 36 }}>
                <a href="#pricing" className="btn btn-primary btn-lg">
                  Build My First Offer — $49 One-Time <ChevronRight size={18} />
                </a>
              </div>
              <p className="microcopy">30-day guarantee &nbsp;·&nbsp; No monthly fee &nbsp;·&nbsp; {"Founder's"} pricing ends soon</p>
            </Rev>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="sp-footer">
          <div className="wrap">
            <p>
              &copy; {new Date().getFullYear()} OfferIQ &nbsp;&middot;&nbsp;{" "}
              <a href="/terms">Terms</a> &nbsp;&middot;&nbsp;{" "}
              <a href="/policy">Privacy</a> &nbsp;&middot;&nbsp;{" "}
              <a href="/refund">Refund Policy</a>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
