"use client";
import { useEffect, useState, useRef } from "react";
import {
  ChevronRight, Shield, Globe, Users, Target, Zap, Gift, FileText, 
  XCircle, CheckCircle2, Infinity, Layers, Activity, Database, Check,
  Briefcase, PenTool, LayoutDashboard, MonitorPlay, MessageCircle, FileSignature
} from "lucide-react";

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=Inter:wght@400;500;600;700&display=swap";

const CSS = `
/* ── tokens ── */
:root{
  --bg:#08080D; --bg-soft:#0B0B12; --card:#14141F; --card-alt:#191927;
  --border:rgba(255,255,255,.08); --bsoft:rgba(255,255,255,.05);
  --text:#F5F5F7; --text2:#A6A6B3; --text3:#6B6B7B;
  --purple:#8B5CF6; --blue:#3B82F6; --green:#34D399; --amber:#F5A623; --red:#F87171;
  --grad:linear-gradient(135deg,#8B5CF6 0%,#3B82F6 100%);
  --grad-t:linear-gradient(135deg,#C4B5FD 0%,#93C5FD 100%);
  --r:16px; --rsm:10px; --maxw:1120px;
}
.sp{box-sizing:border-box;background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;line-height:1.6;overflow-x:hidden;-webkit-font-smoothing:antialiased;}
.sp *,.sp *::before,.sp *::after{box-sizing:border-box;}
.sp h1,.sp h2,.sp h3,.sp h4{font-family:'Manrope',sans-serif;font-weight:800;letter-spacing:-.02em;line-height:1.12;}
.sp a{color:inherit;text-decoration:none;}
.sp ul{list-style:none;margin:0;padding:0;}
.wrap{max-width:var(--maxw);margin:0 auto;padding:0 24px;}
.sect{padding:96px 0;position:relative;}
.sect.tight{padding:64px 0;}
.sect-head{text-align:center;max-width:760px;margin:0 auto 56px;}
.sect-head h2{font-size:clamp(26px,4vw,40px);margin-top:16px;}
.sect-head p{color:var(--text2);font-size:17px;margin-top:14px;}
.light{background:#F7F7FC;color:#14141F;--card:#fff;--card-alt:#F1F0FA;--border:#E6E5F2;--bsoft:#EDECF7;--text:#14141F;--text2:#54546A;--text3:#8B8BA3;}
@media(max-width:640px){.sect{padding:64px 0;}.sect-head h2{font-size:24px;}}
.rev{opacity:0;transform:translateY(26px);transition:opacity .7s cubic-bezier(.2,.7,.3,1),transform .7s cubic-bezier(.2,.7,.3,1);}
.rev-in{opacity:1;transform:none;}
@media(prefers-reduced-motion:reduce){.rev{opacity:1!important;transform:none!important;transition:none!important;}}
/* banner */
.banner{background:linear-gradient(90deg,#1c1010,#1a0f0f 60%,#10101a);border-bottom:1px solid rgba(245,166,35,.2);text-align:center;padding:11px 16px;font-size:13.5px;color:#FBBF24;font-weight:600;position:sticky;top:0;z-index:80;}
/* nav */
.topnav{position:sticky;top:40px;z-index:70;background:rgba(8,8,13,.88);backdrop-filter:blur(20px) saturate(160%);border-bottom:1px solid rgba(255,255,255,.07);}
.topnav .wrap{display:flex;align-items:center;justify-content:space-between;height:64px;}
.logo{display:flex;align-items:center;gap:8px;font-family:'Manrope';font-weight:800;font-size:18px;color:#fff;}
.logo-mark{width:26px;height:26px;border-radius:7px;background:var(--grad);position:relative;flex-shrink:0;box-shadow:0 3px 12px -3px rgba(139,92,246,.65);}
.logo-mark::after{content:'';position:absolute;width:9px;height:9px;background:#fff;border-radius:2px;top:50%;left:50%;transform:translate(-50%,-50%) rotate(45deg);opacity:.92;}
.navlinks{display:flex;gap:4px;font-size:14px;}
.navlinks a{color:var(--text2);padding:6px 13px;border-radius:8px;transition:color .18s,background .18s;}
.navlinks a:hover{color:#fff;background:rgba(255,255,255,.055);}
.btn-nav{background:var(--grad);color:#fff;font-weight:600;font-size:13.5px;padding:0 18px;height:34px;border-radius:9px;display:inline-flex;align-items:center;box-shadow:inset 0 1px 0 rgba(255,255,255,.2),0 0 0 1px rgba(139,92,246,.5),0 4px 20px -4px rgba(139,92,246,.75);transition:transform .18s,filter .18s;}
.btn-nav:hover{transform:translateY(-1px);filter:brightness(1.06);}
@media(max-width:820px){.navlinks{display:none;}}
/* mini-cta */
.mini-cta{position:fixed;left:0;right:0;bottom:-90px;z-index:75;background:rgba(8,8,13,.92);backdrop-filter:blur(10px);border-top:1px solid rgba(255,255,255,.07);padding:14px 20px;display:flex;align-items:center;justify-content:center;gap:18px;transition:bottom .35s cubic-bezier(.2,.7,.3,1);}
.mini-cta--show{bottom:0;}
.mini-cta__label{color:#fff;font-size:14px;font-weight:600;}
@media(max-width:560px){.mini-cta__label{display:none;}}
/* exit intent */
.exit-overlay{position:fixed;inset:0;background:rgba(8,8,13,.85);backdrop-filter:blur(8px);z-index:999;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .3s ease;}
.exit-modal{background:var(--card);border:1px solid rgba(139,92,246,.3);border-radius:24px;padding:40px;max-width:440px;text-align:center;position:relative;box-shadow:0 24px 60px -12px rgba(0,0,0,.6),0 0 0 1px rgba(139,92,246,.15);animation:slideUp .4s cubic-bezier(.2,.7,.3,1);}
.exit-close{position:absolute;top:16px;right:16px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:50%;color:var(--text3);cursor:pointer;transition:background .2s,color .2s;font-size:14px;}
.exit-close:hover{background:rgba(255,255,255,.08);color:var(--text);}
.exit-icon{font-size:42px;line-height:1;margin-bottom:20px;filter:drop-shadow(0 4px 12px rgba(245,166,35,.3));}
.exit-modal h3{font-family:'Manrope';font-size:24px;}
.exit-modal p{color:var(--text2);font-size:15px;margin-top:12px;line-height:1.6;}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes slideUp{from{opacity:0;transform:translateY(20px) scale(.96);}to{opacity:1;transform:translateY(0) scale(1);}}
/* buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-family:'Manrope';font-weight:700;font-size:15px;padding:13px 26px;border-radius:100px;cursor:pointer;border:none;text-decoration:none;transition:transform .2s ease,box-shadow .2s ease;white-space:nowrap;}
.btn-primary{background:var(--grad);color:#fff;box-shadow:0 8px 28px -8px rgba(139,92,246,.6);animation:pulseglow 3.5s ease-in-out 2;}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 36px -6px rgba(139,92,246,.85);}
.btn-lg{font-size:15px;padding:14px 32px;}
@keyframes pulseglow{0%,100%{box-shadow:0 8px 28px -8px rgba(139,92,246,.55);}50%{box-shadow:0 10px 40px -4px rgba(139,92,246,.9);}}
.ctas{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;flex-direction:column;align-items:center;}
.microcopy{color:var(--text3);font-size:12.5px;margin-top:10px;text-align:center;}
/* eyebrows */
.eyebrow{display:inline-flex;align-items:center;gap:8px;font-family:'Manrope';font-weight:700;font-size:12px;letter-spacing:.1em;padding:6px 16px;border-radius:999px;text-transform:uppercase;background:rgba(139,92,246,.1);border:1px solid rgba(139,92,246,.25);color:#C4B5FD;}
.eyebrow::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--grad);box-shadow:0 0 8px rgba(139,92,246,.6);}
.eyebrow-amber{display:inline-flex;align-items:center;gap:8px;font-family:'Manrope';font-weight:700;font-size:12px;letter-spacing:.1em;padding:6px 16px;border-radius:999px;text-transform:uppercase;background:rgba(245,166,35,.1);border:1px solid rgba(245,166,35,.25);color:#FCD34D;}
.eyebrow-amber::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--amber);flex-shrink:0;}
.grad-text{background:var(--grad-t);-webkit-background-clip:text;background-clip:text;color:transparent;}
/* hero */
.hero{padding:96px 0 72px;text-align:center;overflow:hidden;position:relative;background:radial-gradient(ellipse 1100px 600px at 50% 0%,rgba(139,92,246,.2) 0%,rgba(59,130,246,.1) 45%,transparent 70%);}
.blob{position:absolute;border-radius:50%;filter:blur(80px);z-index:0;animation:bfloat 9s ease-in-out infinite alternate;}
.blob1{width:500px;height:500px;background:rgba(139,92,246,.22);top:-180px;left:-120px;}
.blob2{width:400px;height:400px;background:rgba(59,130,246,.18);top:0;right:-120px;animation-delay:2s;}
@keyframes bfloat{0%{transform:translate(0,0);}100%{transform:translate(30px,-30px);}}
.hero .wrap{position:relative;z-index:1;}
.hero h1{font-size:clamp(28px,5vw,52px);max-width:860px;margin:20px auto 0;letter-spacing:-.025em;line-height:1.1;}
.hero .sub{color:var(--text2);font-size:17px;max-width:660px;margin:22px auto 0;line-height:1.72;}
/* prose */
.prose-block{max-width:740px;margin:0 auto;}
.prose-block p{color:var(--text2);font-size:16px;margin-top:18px;line-height:1.78;}
.prose-block p:first-child{margin-top:0;}
.prose-block strong{color:var(--text);}
.pullquote{background:var(--card-alt);border-left:3px solid var(--purple);border-radius:0 var(--rsm) var(--rsm) 0;padding:18px 22px;margin-top:22px;font-size:15.5px;font-weight:600;color:var(--text);}
.light .pullquote{background:#EAE8FD;}
/* grid */
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
@media(max-width:760px){.grid-2{grid-template-columns:1fr;}}
.card{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:28px;transition:transform .2s,border-color .2s;}
.card:hover{transform:translateY(-4px);border-color:rgba(139,92,246,.25);}
.card h4{font-family:'Manrope';font-size:17px;font-weight:700;}
.card p{color:var(--text2);font-size:14.5px;margin-top:12px;line-height:1.7;}
.card-icon{width:48px;height:48px;border-radius:12px;background:rgba(139,92,246,.1);display:flex;align-items:center;justify-content:center;margin-bottom:18px;}
/* vs table */
.vs-table{max-width:860px;margin:0 auto;background:var(--card);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;}
.vs-head{display:flex;border-bottom:1px solid var(--bsoft);background:var(--card-alt);}
.vs-head>div{flex:1;padding:16px 20px;font-family:'Manrope';font-weight:800;font-size:14px;text-align:center;}
.vs-head .bad{color:var(--text3);}
.vs-head .good{color:#A78BFA;background:rgba(139,92,246,.05);}
.vs-row{display:flex;border-bottom:1px solid var(--bsoft);}
.vs-row:last-child{border-bottom:none;}
.vs-row>div{flex:1;padding:16px 20px;font-size:14px;display:flex;align-items:center;justify-content:flex-start;text-align:left;}
.vs-row .bad{color:var(--text2);gap:10px;}
.vs-row .good{color:var(--text);font-weight:600;background:rgba(139,92,246,.03);gap:10px;}
@media(max-width:760px){.vs-head>div,.vs-row>div{font-size:12px;padding:12px;}}
/* bonus */
.bonus-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
@media(max-width:820px){.bonus-grid{grid-template-columns:1fr;}}
.bonus-card{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:24px;transition:transform .2s,border-color .2s;}
.bonus-card:hover{transform:translateY(-4px);border-color:rgba(139,92,246,.25);}
.bonus-icon{width:46px;height:46px;border-radius:12px;background:rgba(139,92,246,.1);display:flex;align-items:center;justify-content:center;margin-bottom:14px;}
.bonus-card h4{font-size:15px;font-family:'Manrope';font-weight:700;}
.bonus-card p{color:var(--text2);font-size:13.5px;margin-top:8px;line-height:1.65;}
/* value table */
.value-table{max-width:760px;margin:0 auto;border:1px solid var(--border);border-radius:var(--r);overflow:hidden;background:var(--card);}
.value-row{display:flex;justify-content:space-between;align-items:center;padding:13px 22px;border-bottom:1px solid var(--bsoft);font-size:14px;gap:12px;}
.value-row .vitem{color:var(--text2);flex:1;}
.value-row .vval{color:var(--text);font-weight:700;white-space:nowrap;}
.value-row.vtotal{background:var(--card-alt);}
.value-row.vtotal .vitem{color:var(--text);font-weight:700;}
.value-row.vprice{background:rgba(52,211,153,.06);border-bottom:none;}
.value-row.vprice .vitem{color:var(--text);font-family:'Manrope';font-weight:800;font-size:16px;}
.value-row.vprice .vval{color:var(--green);font-family:'Manrope';font-weight:800;font-size:26px;}
/* is-for-you */
.ify-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:860px;margin:0 auto;}
@media(max-width:760px){.ify-grid{grid-template-columns:1fr;}}
.ify-card{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:32px;}
.ify-card h3{font-size:20px;font-family:'Manrope';margin-bottom:20px;}
.ify-list li{display:flex;align-items:flex-start;gap:12px;color:var(--text2);font-size:14.5px;margin-bottom:16px;line-height:1.6;}
.ify-list li:last-child{margin-bottom:0;}
/* guarantee */
.guarantee{display:flex;align-items:center;gap:36px;max-width:760px;margin:0 auto;background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:36px;}
@media(max-width:700px){.guarantee{flex-direction:column;text-align:center;gap:20px;}}
.guarantee-seal{flex-shrink:0;width:68px;height:68px;border-radius:50%;background:linear-gradient(135deg,rgba(139,92,246,.15),rgba(59,130,246,.1));border:2px solid rgba(139,92,246,.25);display:flex;align-items:center;justify-content:center;}
.guarantee h3{font-size:20px;font-family:'Manrope';}
.guarantee p{color:var(--text2);font-size:14.5px;margin-top:8px;}
/* faq */
.faq{max-width:760px;margin:0 auto;display:flex;flex-direction:column;gap:6px;}
.faq-item{background:var(--card);border:1px solid var(--border);border-radius:var(--rsm);overflow:hidden;transition:border-color .2s;}
.faq-item.open{border-color:rgba(139,92,246,.35);}
.faq-q{display:flex;justify-content:space-between;align-items:center;padding:18px 22px;cursor:pointer;font-weight:600;font-size:14.5px;width:100%;background:none;border:none;text-align:left;color:var(--text);font-family:'Inter';gap:16px;}
.faq-q:hover{background:rgba(255,255,255,.025);}
.faq-plus{color:#A78BFA;font-size:20px;font-weight:300;flex-shrink:0;transition:transform .2s;}
.faq-item.open .faq-plus{transform:rotate(45deg);}
.faq-a{overflow:hidden;transition:max-height .28s ease;}
.faq-a p{padding:0 22px 18px;color:var(--text2);font-size:14px;line-height:1.72;}
/* final cta */
.final-cta{text-align:center;padding:100px 0;background:radial-gradient(ellipse 900px 500px at 50% 30%,rgba(139,92,246,.18),transparent 65%);}
.final-cta h2{font-size:clamp(22px,4vw,34px);max-width:700px;margin:0 auto;}
.final-cta .lead{color:var(--text2);font-size:16px;max-width:620px;margin:18px auto 0;line-height:1.75;}
.no-thanks{color:var(--text3);font-size:13px;margin-top:18px;text-align:center;display:block;text-decoration:underline;text-underline-offset:3px;cursor:pointer;transition:color .2s;}
.no-thanks:hover{color:var(--text2);}
/* footer */
.sp-footer{border-top:1px solid var(--bsoft);padding:36px 0;text-align:center;color:var(--text3);font-size:13px;}
.sp-footer a{color:var(--text3);}
.sp-footer a:hover{color:var(--text2);}
`;

const INSTEAD_CARDS = [
  { Icon: XCircle, title: "Freelance it under your own name, off-system", body: "You could do the strategy work by hand for a client — no sub-account, no dashboard, no contract, just you and a shared doc. Works once. Doesn't survive client #2 without you drowning in tabs." },
  { Icon: Users, title: "Turn the request down", body: "The safest-feeling option, and the most expensive — every 'I could probably do that for you' you don't say yes to is real income you'll never collect." },
  { Icon: FileText, title: "Buy a generic whitelabel tool instead", body: "Plenty of software lets you rebrand a dashboard for clients. None of them start with the actual strategic layer — positioning, pricing, persona — that makes what you deliver worth paying for." },
  { Icon: Database, title: "Build your own client system from scratch", body: "Spreadsheets, folders, a shared drive. Functional, until client #3 asks where their proposal is and you're searching three places to find it." },
];

const REPLACES_CARDS = [
  { Icon: Globe, title: "Instead of pitching from a blank page...", body: "The Agency Website and proposal templates mean you show up already looking like a business." },
  { Icon: FileSignature, title: "Instead of improvising a contract...", body: "The Legal Contract Agreement template means that's already handled." },
  { Icon: LayoutDashboard, title: "Instead of juggling tabs and screenshots...", body: "The Agency Dashboard means every client's offers and results live in one place you control." },
  { Icon: MonitorPlay, title: "Instead of your first client being your first mistake...", body: "The Done-For-You onboarding session means someone walks you through it before you're doing it live, under pressure." },
];

const VS_ROWS = [
  ["Pitch from a blank page and a promise", "Show up with a real website and proposal, day one"],
  ["Improvise a contract mid-conversation", "A ready contract template, before you need it"],
  ["Track clients across tabs and screenshots", "One dashboard for every client"],
  ["Your first client is your first mistake", "A DFY onboarding session before you go live"],
  ["Support questions sit in a general queue", "Dedicated priority channel + private training"],
];

const BONUSES = [
  { Icon: Target, title: `"$10K/Month Agency Blueprint" Training`, desc: "How to price your first packages, who to pitch first, and how to fill 30 sub-accounts without cold-calling strangers." },
  { Icon: Layers, title: "Client Onboarding Funnel Templates", desc: "A kickoff and questionnaire flow, so client #1 doesn't start with you improvising the intake process." },
  { Icon: MessageCircle, title: "1-on-1 Agency Setup Call (30 min)", desc: "A real conversation, not another video — walk through your first few client setups with someone who's done it before." },
];

const VALUE_ROWS: [string, string][] = [
  ["30 Client Sub-Accounts", "$497"],
  ["Agency Website", "$197"],
  ["Proposal Templates", "$97"],
  ["Commercial / Ads Graphics", "$97"],
  ["Legal Contract Agreement", "$147"],
  ["Agency Dashboard", "$197"],
  ["Done-For-You Onboarding Session", "$197"],
  ["Dedicated Support Channel + Private Training", "$97"],
  ['Bonus: "$10K/Month Agency Blueprint" Training', "$197"],
  ["Bonus: Client Onboarding Funnel Templates", "$97"],
  ["Bonus: 1-on-1 Agency Setup Call (30 min)", "$197"],
];

const FAQ_ITEMS = [
  { q: "Do I need Unlimited or Scale before I can get this?", a: "No. Agency is independent — its 30 sub-accounts are a separate cap from anything Unlimited or Scale unlock. Agency stacks on top of whatever you already have." },
  { q: "I don't have any clients yet — is this too early?", a: "That's exactly what the Done-For-You onboarding session and the Agency Blueprint bonus are for — this tier assumes you're starting, not that you already have a roster." },
  { q: "What if I need more than 30 clients?", a: "You can expand beyond 30 sub-accounts for an additional cost as your agency grows — 30 is the starting room, not a hard ceiling." },
  { q: "Should I wait to see what else is coming?", a: "No — this price and these three bonuses exist on this page only." },
  { q: "If I get the Bundle later, do I waste what I paid here?", a: "No. Everything you pay for here carries forward — the Bundle isn't a replacement, it's the full set, including this." },
];

/* ── helpers ── */
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
  return <div ref={ref} style={{ transitionDelay: `${d}ms` }} className={`rev${v ? " rev-in" : ""}${cls ? " " + cls : ""}`}>{children}</div>;
}
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
function MiniCta() {
  const [show, setShow] = useState(false);
  useEffect(() => { const h = () => setShow(window.scrollY > 600); window.addEventListener("scroll", h, { passive: true }); return () => window.removeEventListener("scroll", h); }, []);
  return (
    <div className={`mini-cta${show ? " mini-cta--show" : ""}`}>
      <span className="mini-cta__label">Agency — $197 One-Time Upgrade</span>
      <a href="#pricing" className="btn btn-primary" style={{ animation: "none", padding: "10px 22px", fontSize: 14 }}>Upgrade Now <ChevronRight size={15} /></a>
    </div>
  );
}
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
function Ico({ icon: Icon, size = 22, color = "currentColor" }: { icon: React.ElementType; size?: number; color?: string }) {
  return <Icon size={size} color={color} strokeWidth={1.8} />;
}

/* ════ PAGE ════ */
export default function OTO4Page() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href={FONT_HREF} rel="stylesheet" />
      <style>{CSS}</style>

      <div className="sp">
        <ExitIntent 
          message="This Is The Only Tier That Lets You Charge Someone Else For This. Shown Once, Right Here." 
          cta="Let Me Sell This — $197"
        />
        <MiniCta />

        {/* BANNER */}
        <div className="banner">
          ⚠️ This Is The Only Tier That Lets You Charge Someone Else For This. <strong>Shown Once, Right Here.</strong>
        </div>

        {/* NAV */}
        <nav className="topnav">
          <div className="wrap">
            <div className="logo">
              <div className="logo-mark" />
              OFFER<span style={{ color: "#A78BFA" }}>IQ</span>
            </div>
            <div className="navlinks">
              <a href="#whats-included">What&apos;s Included</a>
              <a href="#pricing">Pricing</a>
              <a href="#faq">FAQ</a>
            </div>
            <a href="#pricing" className="btn-nav">Upgrade — $197</a>
          </div>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="blob blob1" /><div className="blob blob2" />
          <div className="wrap">
            <Rev>
              <span className="eyebrow">For OfferIQ Users Ready To Stop Being The Only One Who Benefits</span>
              <h1>
                Clients Already Pay $6,200–$32,747 For What You Just Learned To Build.{" "}
                <span className="grad-text">Agency Is How You Start Charging For It.</span>
              </h1>
              <p className="sub">
                Real income, not just a bigger toolkit: 30 client sub-accounts, a full agency asset kit — website, proposals, contracts, ad graphics — a done-for-you onboarding session, and dedicated support, all in one unlock. Works whether you have Pro, Scale, Unlimited, all three, or none.
              </p>
              <div className="ctas" style={{ marginTop: 36 }}>
                <a href="#pricing" className="btn btn-primary btn-lg">
                  Yes — Let Me Sell This, $197 One-Time <ChevronRight size={17} />
                </a>
                <p className="microcopy">30-day money-back guarantee · One-time, never recurring</p>
              </div>
            </Rev>
          </div>
        </section>

        {/* THE GUESS YOU HAVEN'T ANSWERED YET */}
        <section className="sect light">
          <div className="wrap">
            <Rev cls="sect-head">
              <span className="eyebrow-amber">The Final Question</span>
              <h2>The Guess You Haven&apos;t Answered Yet</h2>
            </Rev>
            <div className="prose-block">
              <Rev d={40}>
                <p>
                  Every guess this funnel has ended so far has been about your own offer — what to sell, what to charge, how much room to give it. There&apos;s one guess left, and it&apos;s bigger than any of those: <strong style={{ color: "var(--text)" }}>whether you could be doing this for other people, too.</strong>
                </p>
                <div className="pullquote" style={{ marginTop: 24, marginBottom: 24 }}>
                  Picture it: a coach in your network hears what you built for yourself and asks, &quot;could you do that for me?&quot;
                </div>
                <p>
                  Right now, the honest answer is no — not because you don&apos;t know how, but because nothing in your account gives you a place to build it, manage it, or legally sell it to them. You&apos;d be improvising a business model in the middle of a conversation you weren&apos;t ready for.
                </p>
                <div style={{ textAlign: "center", marginTop: 36 }}>
                  <a href="#pricing" className="btn btn-primary">
                    Yes — Let Me Sell This, $197 One-Time <ChevronRight size={16} />
                  </a>
                </div>
              </Rev>
            </div>
          </div>
        </section>

        {/* WHAT PEOPLE DO INSTEAD */}
        <section className="sect">
          <div className="wrap">
            <Rev cls="sect-head">
              <h2>What People Do Instead Of Actually Saying Yes</h2>
            </Rev>
            <div className="grid-2">
              {INSTEAD_CARDS.map((c, i) => (
                <Rev key={c.title} d={i * 40}>
                  <div className="card">
                    <div className="card-icon"><Ico icon={c.Icon} size={22} color="#A78BFA" /></div>
                    <h4>{c.title}</h4>
                    <p>{c.body}</p>
                  </div>
                </Rev>
              ))}
            </div>
          </div>
        </section>

        {/* WHAT AGENCY ISN'T */}
        <section className="sect light tight">
          <div className="wrap">
            <div className="prose-block" style={{ textAlign: "center" }}>
              <Rev>
                <span className="eyebrow-amber">Clarification</span>
                <h3 style={{ fontFamily: "Manrope", fontSize: 28, marginTop: 16 }}>What Agency Isn&apos;t</h3>
                <p style={{ marginTop: 18 }}>
                  Agency isn&apos;t a higher usage limit dressed up as a business. It isn&apos;t &quot;more offers, but for other people&quot; — that&apos;s not what actually changes here.
                </p>
                <p>
                  <strong style={{ color: "var(--text)" }}>It is the one unlock in this funnel that changes what you&apos;re legally and practically allowed to build:</strong> not just your own offers, but someone else&apos;s — managed cleanly, billed properly, with the paperwork already handled.
                </p>
              </Rev>
            </div>
          </div>
        </section>

        {/* WHAT AGENCY ACTUALLY REPLACES */}
        <section className="sect">
          <div className="wrap">
            <Rev cls="sect-head">
              <span className="eyebrow">The Real Value</span>
              <h2>What Agency Actually Replaces</h2>
            </Rev>
            <div className="grid-2">
              {REPLACES_CARDS.map((w, i) => (
                <Rev key={w.title} d={i * 40}>
                  <div className="card">
                    <div className="card-icon" style={{ background: "rgba(59,130,246,.1)" }}>
                      <Ico icon={w.Icon} size={22} color="#60A5FA" />
                    </div>
                    <h4>{w.title}</h4>
                    <p>{w.body}</p>
                  </div>
                </Rev>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 48 }}>
              <Rev>
                <a href="#pricing" className="btn btn-primary btn-lg">
                  Yes — Let Me Sell This, $197 One-Time <ChevronRight size={17} />
                </a>
              </Rev>
            </div>
          </div>
        </section>

        {/* VS TABLE */}
        <section className="sect tight light">
          <div className="wrap">
            <Rev cls="sect-head">
              <h2>Freelancing It vs. Running It Through Agency</h2>
            </Rev>
            <Rev d={40}>
              <div className="vs-table">
                <div className="vs-head">
                  <div className="bad">Freelancing It</div>
                  <div className="good">Agency</div>
                </div>
                {VS_ROWS.map((r, i) => (
                  <div className="vs-row" key={i}>
                    <div className="bad"><XCircle size={16} color="var(--text3)" style={{ flexShrink: 0 }} /> {r[0]}</div>
                    <div className="good"><CheckCircle2 size={16} color="#A78BFA" style={{ flexShrink: 0 }} /> {r[1]}</div>
                  </div>
                ))}
              </div>
            </Rev>
          </div>
        </section>

        {/* WHAT THIS IS ACTUALLY WORTH */}
        <section className="sect">
          <div className="wrap">
            <Rev cls="sect-head">
              <h2>What This Is Actually Worth</h2>
            </Rev>
            <div className="prose-block">
              <Rev d={40}>
                <p>
                  Go back to the Front-end page for a second. The real cost of replicating an offer strategy manually — a strategist, a copywriter, a page builder, a traffic strategist, all separately: <strong>$6,200 to $32,747+, per offer.</strong>
                </p>
                <p>
                  That number isn&apos;t just what it costs you to avoid paying. It&apos;s what a client would pay someone else for that exact result, right now, today.
                </p>
                <div className="pullquote" style={{ marginTop: 24, marginBottom: 24 }}>
                  Agency is what turns you into that someone else. $197 once, to be the person a business pays $2,000, $5,000, or more to deliver what you already know how to build.
                </div>
              </Rev>
            </div>
          </div>
        </section>

        {/* VALUE TABLE / PRICING */}
        <section id="pricing" className="sect light tight">
          <div className="wrap">
            <Rev cls="sect-head">
              <span className="eyebrow-amber">Everything You&apos;re Getting</span>
              <h2>OfferIQ Agency — $197, One-Time</h2>
              <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 6 }}>Values are proposed — confirm with your team before launch</p>
            </Rev>
            <Rev d={80}>
              <div className="value-table">
                {VALUE_ROWS.map(([item, val]) => (
                  <div className="value-row" key={item}>
                    <span className="vitem">{item}</span>
                    <span className="vval">{val}</span>
                  </div>
                ))}
                <div className="value-row vtotal"><span className="vitem">Total Real Value</span><span className="vval">$2,017</span></div>
                <div className="value-row vprice"><span className="vitem">Your Price Today — One-Time</span><span className="vval">$197</span></div>
              </div>
            </Rev>
            <div style={{ textAlign: "center", marginTop: 36 }}>
              <Rev d={100}>
                <a href="#" className="btn btn-primary btn-lg">
                  Yes — Let Me Sell This, $197 One-Time <ChevronRight size={17} />
                </a>
                <p className="microcopy" style={{ marginTop: 14 }}>
                  30-day guarantee · No monthly fee · Founder&apos;s pricing ends soon
                </p>
              </Rev>
            </div>
          </div>
        </section>

        {/* BONUSES */}
        <section className="sect">
          <div className="wrap">
            <Rev cls="sect-head">
              <span className="eyebrow">Your Fast-Action Bonuses</span>
              <h2>Included today only.</h2>
            </Rev>
            <div className="bonus-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
              {BONUSES.map((b, i) => (
                <Rev key={b.title} d={i * 60}>
                  <div className="bonus-card">
                    <div className="bonus-icon"><Ico icon={b.Icon} size={22} color="#A78BFA" /></div>
                    <h4>{b.title}</h4>
                    <p>{b.desc}</p>
                  </div>
                </Rev>
              ))}
            </div>
          </div>
        </section>

        {/* IS THIS FOR YOU */}
        <section className="sect light tight">
          <div className="wrap">
            <Rev cls="sect-head">
              <h2>Is This For You?</h2>
            </Rev>
            <div className="ify-grid">
              <Rev d={40}>
                <div className="ify-card">
                  <h3>This is for you if:</h3>
                  <ul className="ify-list">
                    <li><CheckCircle2 color="#10B981" size={18} style={{ marginTop: 2, flexShrink: 0 }} /> Someone&apos;s already asked if you could build this for them, and you didn&apos;t have a real answer</li>
                    <li><CheckCircle2 color="#10B981" size={18} style={{ marginTop: 2, flexShrink: 0 }} /> You want a second income stream that doesn&apos;t depend on finding your own next offer idea</li>
                    <li><CheckCircle2 color="#10B981" size={18} style={{ marginTop: 2, flexShrink: 0 }} /> You&apos;d rather look like a real agency from day one than improvise your way there</li>
                  </ul>
                </div>
              </Rev>
              <Rev d={80}>
                <div className="ify-card" style={{ borderColor: "rgba(248,113,113,.3)" }}>
                  <h3>This isn&apos;t for you yet if:</h3>
                  <ul className="ify-list">
                    <li><XCircle color="#F87171" size={18} style={{ marginTop: 2, flexShrink: 0 }} /> You haven&apos;t built and tested your own offer yet — prove it works for you first, then sell the process</li>
                    <li><XCircle color="#F87171" size={18} style={{ marginTop: 2, flexShrink: 0 }} /> Managing someone else&apos;s business alongside your own isn&apos;t something you want on your plate right now</li>
                  </ul>
                </div>
              </Rev>
            </div>
          </div>
        </section>

        {/* GUARANTEE */}
        <section className="sect tight">
          <div className="wrap">
            <Rev>
              <div className="guarantee">
                <div className="guarantee-seal"><Ico icon={Shield} size={30} color="#A78BFA" /></div>
                <div>
                  <h3>30-Day Money-Back Guarantee</h3>
                  <p>Same guarantee as everything else in OfferIQ. If Agency doesn&apos;t earn its place, email support within 30 days for a full refund — no interrogation.</p>
                </div>
              </div>
            </Rev>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="sect light">
          <div className="wrap">
            <Rev cls="sect-head"><h2>Quick Questions</h2></Rev>
            <div className="faq">
              {FAQ_ITEMS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="final-cta" style={{ background: "var(--bg)" }}>
          <div className="wrap">
            <Rev>
              <p style={{ color: "var(--text3)", fontSize: 13, marginBottom: 14 }}>
                Every offer you&apos;ve built so far made you money once.
              </p>
              <h2>
                This is the tier where that same skill starts{" "}
                <span className="grad-text">making you money from other people&apos;s businesses too.</span>
              </h2>
              <div style={{ marginTop: 36 }}>
                <a href="#pricing" className="btn btn-primary btn-lg">
                  Yes — Let Me Sell This, $197 One-Time <ChevronRight size={17} />
                </a>
                <p className="microcopy">30-day guarantee · This page, this price, once.</p>
                <a href="#" className="no-thanks">
                  No thanks, I&apos;ll keep turning down people who ask.
                </a>
              </div>
            </Rev>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="sp-footer" style={{ background: "var(--bg)" }}>
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
