"use client";
import { useEffect, useState, useRef } from "react";
import {
  ChevronRight, Shield, Globe, Users, Target, Zap, Gift, FileText,
  XCircle, CheckCircle2, Infinity, Layers, Infinity as InfinityIcon, Activity, Database,
  AlertTriangle
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
/* cards grids */
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
@media(max-width:760px){.grid-2{grid-template-columns:1fr;}}
.card{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:28px;transition:transform .2s,border-color .2s;}
.card:hover{transform:translateY(-4px);border-color:rgba(139,92,246,.25);}
.card h4{font-family:'Manrope';font-size:16px;font-weight:700;}
.card p{color:var(--text2);font-size:14.5px;margin-top:10px;line-height:1.7;}
.card-icon{width:48px;height:48px;border-radius:12px;background:rgba(139,92,246,.1);display:flex;align-items:center;justify-content:center;margin-bottom:18px;}
/* why-matters */
.why-grid{display:flex;flex-direction:column;gap:14px;max-width:820px;margin:0 auto;}
.why-row{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:24px 28px;display:grid;grid-template-columns:44px 1fr;gap:20px;align-items:start;transition:transform .2s,border-color .2s;}
.why-row:hover{transform:translateX(4px);border-color:rgba(139,92,246,.25);}
.why-icon{width:44px;height:44px;border-radius:10px;background:rgba(139,92,246,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.why-body h4{font-family:'Manrope';font-size:15.5px;font-weight:700;}
.why-body p{color:var(--text2);font-size:14px;margin-top:8px;line-height:1.7;}
/* vs table */
.vs-table{max-width:760px;margin:0 auto;background:var(--card);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;}
.vs-head{display:flex;border-bottom:1px solid var(--bsoft);background:var(--card-alt);}
.vs-head>div{flex:1;padding:16px 24px;font-family:'Manrope';font-weight:800;font-size:16px;text-align:center;}
.vs-head .bad{color:var(--text3);}
.vs-head .good{color:#A78BFA;background:rgba(139,92,246,.05);}
.vs-row{display:flex;border-bottom:1px solid var(--bsoft);}
.vs-row:last-child{border-bottom:none;}
.vs-row>div{flex:1;padding:16px 24px;font-size:14px;display:flex;align-items:center;}
.vs-row .bad{color:var(--text2);gap:10px;}
.vs-row .good{color:var(--text);font-weight:600;background:rgba(139,92,246,.03);gap:10px;}
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
/* urgency block */
.urgency-block{max-width:720px;margin:0 auto;background:linear-gradient(160deg,rgba(245,166,35,.08),var(--card));border:1px solid rgba(245,166,35,.2);border-radius:var(--r);padding:36px;}
.urgency-block h3{font-family:'Manrope';font-size:clamp(18px,3vw,24px);}
.urgency-block p{color:var(--text2);font-size:15px;margin-top:14px;line-height:1.75;}
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
  { Icon: XCircle, title: "Delete an old offer to make room for a new one.", body: "Real option, real cost — you lose the diagnostic history Pro just built for that offer, permanently, to test something else." },
  { Icon: Users, title: "Spin up a second account.", body: "Splits your leads, your analytics, your workspace. Now you're running two disconnected businesses instead of one." },
  { Icon: AlertTriangle, title: "Just stop testing new ideas.", body: "The option that feels safest and costs the most — every idea you don't build is revenue you'll never even know you missed." },
];

const REPLACES_CARDS = [
  { Icon: InfinityIcon, title: "Instead of deleting an old offer to build a new one...", body: "Unlimited live offers means every idea worth trying gets tried." },
  { Icon: Activity, title: "Instead of watching your list hit a wall right as a campaign starts working...", body: "Unlimited leads means the ceiling isn't there when you need room the most." },
  { Icon: Globe, title: "Instead of sharing one domain connection across every brand or niche...", body: "Unlimited custom domains means every offer gets its own real address." },
];

const VS_ROWS = [
  ["5 live offers, on either tier", "Unlimited live offers"],
  ["10,000 leads, then a hard stop", "Unlimited leads"],
  ["1 custom domain", "Unlimited custom domains"],
  ["Delete something to build something new", "Every idea gets built"],
];

const BONUSES = [
  { Icon: Activity, title: "90-Day Traffic & Scaling Blueprint", desc: "A week-by-week plan for taking a funnel from $0 to consistent daily sales." },
  { Icon: Layers, title: "Advanced A/B Split-Test Templates", desc: "Pre-built headline and hook variant sets, ready to test against each other." },
  { Icon: Shield, title: "Email Deliverability Mastery", desc: "Protects your sender reputation now that your sends are uncapped." },
  { Icon: Zap, title: `"Second Offer in 15 Minutes" Guide`, desc: "Build your next offer even faster than your first." },
  { Icon: Database, title: "Multi-Offer Portfolio Tracker", desc: "A dashboard for managing pricing, LTV, and Funnel Health across every offer you build." },
];

const VALUE_ROWS: [string, string][] = [
  ["Unlimited Live Offer Funnels", "$497"],
  ["Unlimited Leads Captured", "$397"],
  ["Unlimited Custom Domains", "$197"],
  ["Bonus: 90-Day Traffic & Scaling Blueprint", "$197"],
  ["Bonus: Advanced A/B Split-Test Templates", "$97"],
  ["Bonus: Email Deliverability Mastery (mini-course)", "$97"],
  ['Bonus: "Second Offer in 15 Minutes" Workflow Guide', "$47"],
  ["Bonus: Multi-Offer Portfolio Tracker (Sheet + video)", "$97"],
];

const FAQ_ITEMS = [
  { q: "Do I need Pro before I can get this?", a: "No. Unlimited's three unlocks — offers, leads, domains — work independently of Pro's diagnostics and domain tools. You can get Unlimited with or without Pro." },
  { q: "What happened to multi-workspace access?", a: "It's not part of this tier. Unlimited is purely about removing count-based caps — offers, leads, and domains — not adding new workspace structure." },
  { q: "Does 'unlimited leads' mean unlimited forever, or does it reset?", a: "Forever. There's no monthly refresh, no recurring cap — once removed, it's removed for the life of your license." },
  { q: "Is this really the only place to get unlimited access?", a: "Yes. No monthly plan on the OfferIQ site — including the top tier — offers uncapped offers, leads, or domains." },
  { q: "Can I upgrade to this later instead of deciding now?", a: "Yes, from your dashboard — at the regular price, without today's five bonuses, and without the lifetime future-updates inclusion locked in at this rate." },
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
      <button className="faq-q" onClick={() => setOpen(!open)}><span>{q}</span><span className="faq-plus">{open ? "−" : "+"}</span></button>
      <div className="faq-a" style={{ maxHeight: open ? 400 : 0 }}><p>{a}</p></div>
    </div>
  );
}
function MiniCta() {
  const [show, setShow] = useState(false);
  useEffect(() => { const h = () => setShow(window.scrollY > 600); window.addEventListener("scroll", h, { passive: true }); return () => window.removeEventListener("scroll", h); }, []);
  return (
    <div className={`mini-cta${show ? " mini-cta--show" : ""}`}>
      <span className="mini-cta__label">Unlimited — $297 One-Time Upgrade</span>
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
export default function OTO2Page() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href={FONT_HREF} rel="stylesheet" />
      <style>{CSS}</style>

      <div className="sp">
        <ExitIntent
          message="This Is The Only Tier On offeriq.app Where 'Unlimited' Actually Means Unlimited — For Life."
          cta="Remove The Ceiling — $297"
        />
        <MiniCta />

        {/* BANNER */}
        <div className="banner">
          ⚠️ This Is The Only Tier On offeriq.app Where &quot;Unlimited&quot; Actually Means Unlimited — <strong>For Life.</strong>
        </div>

        {/* NAV */}
        <nav className="topnav">
          <div className="wrap">
            <div className="logo">
              <div className="logo-mark" />
              OFFER<span style={{ color: "#A78BFA" }}>IQ</span>
            </div>
            <div className="navlinks">
              <a href="#why-matters">Why It Matters</a>
              <a href="#pricing">Pricing</a>
              <a href="#faq">FAQ</a>
            </div>
            <a href="#pricing" className="btn-nav">Upgrade — $297</a>
          </div>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="blob blob1" /><div className="blob blob2" />
          <div className="wrap">
            <Rev>
              <span className="eyebrow">For OfferIQ Users Who Don&apos;t Want To Ask Permission To Build The Next One</span>
              <h1>
                Even offeriq.app&apos;s Most Expensive Monthly Plan Is Still Capped.{" "}
                <span className="grad-text">This Is The Only Place That Isn&apos;t — For Life, Once, $297.</span>
              </h1>
              <p className="sub">
                Unlimited live offers. Unlimited leads. Unlimited custom domains. Not a bigger number — no number at all. One payment, and every offer you ever build under this license, plus every feature OfferIQ ships from here forward, is yours for as long as OfferIQ exists.
              </p>
              <div className="ctas" style={{ marginTop: 36 }}>
                <a href="#pricing" className="btn btn-primary btn-lg">
                  Yes — Remove The Ceiling, For Life, $297 One-Time <ChevronRight size={17} />
                </a>
                <p className="microcopy">30-day money-back guarantee · One-time, never recurring</p>
              </div>
            </Rev>
          </div>
        </section>

        {/* THE NUMBER STILL CAPPED */}
        <section className="sect light">
          <div className="wrap">
            <Rev>
              <span className="eyebrow-amber">The Hidden Constraint</span>
              <h2 style={{ marginTop: 18, fontSize: "clamp(24px,3.5vw,36px)", maxWidth: 720, marginBottom: 0 }}>
                Pro Solved &quot;Is It Working.&quot; This Is The Number That&apos;s Still Capped.
              </h2>
            </Rev>
            <Rev d={80}>
              <div className="prose-block" style={{ marginTop: 32 }}>
                <p>Pro gave you the diagnostics to know exactly why an offer converts — or doesn&apos;t. That&apos;s real. But even with perfect diagnostics, you&apos;re still capped: <strong>5 live offers</strong>, no matter which tier got you there, and a <strong>10,000-lead ceiling</strong> once Pro raised it from 500.</p>
                <p>Picture finding your best offer yet. Pro&apos;s analytics just told you exactly why it&apos;s converting — the ad&apos;s paying for itself, the list is climbing toward that 10,000-lead wall. And your fifth idea for a follow-up offer is sitting there unbuilt, because Front-end and Pro both stop counting at 5.</p>
                <div className="pullquote">
                  Knowing why something works doesn&apos;t help if you&apos;ve run out of room to build the next one.
                </div>
              </div>
            </Rev>
            <div style={{ textAlign: "center", marginTop: 44 }}>
              <Rev>
                <a href="#pricing" className="btn btn-primary">
                  Yes — Remove The Ceiling, For Life, $297 One-Time <ChevronRight size={16} />
                </a>
              </Rev>
            </div>
          </div>
        </section>

        {/* WHAT PEOPLE DO INSTEAD */}
        <section className="sect">
          <div className="wrap">
            <Rev cls="sect-head">
              <span className="eyebrow">The Alternative</span>
              <h2>What People Do Instead Of Removing The Cap</h2>
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

        {/* WHAT UNLIMITED ISN'T */}
        <section className="sect light tight">
          <div className="wrap">
            <div className="prose-block" style={{ textAlign: "center" }}>
              <Rev>
                <span className="eyebrow-amber">Clarification</span>
                <h3 style={{ fontFamily: "Manrope", fontSize: 28, marginTop: 16 }}>What Unlimited Isn&apos;t</h3>
                <p style={{ marginTop: 18 }}>
                  Unlimited isn&apos;t a bigger cap. It isn&apos;t &quot;50 instead of 5&quot; dressed up as unlimited — that would still be a number, just a further-away one.
                </p>
                <p>
                  <strong style={{ color: "var(--text)" }}>It is the one tier, at any price, anywhere on offeriq.app, where the number simply doesn&apos;t exist.</strong> Not on the monthly site. Not on any other tier in this funnel. Here.
                </p>
              </Rev>
            </div>
          </div>
        </section>

        {/* WHAT UNLIMITED ACTUALLY REPLACES */}
        <section className="sect">
          <div className="wrap">
            <Rev cls="sect-head">
              <span className="eyebrow">The Real Value</span>
              <h2>What Unlimited Actually Replaces</h2>
            </Rev>
            <div className="why-grid">
              {REPLACES_CARDS.map((w, i) => (
                <Rev key={w.title} d={i * 40}>
                  <div className="why-row" style={{ gridTemplateColumns: "36px 1fr" }}>
                    <div className="why-icon" style={{ width: 36, height: 36, background: "rgba(59,130,246,.1)" }}>
                      <Ico icon={w.Icon} size={18} color="#60A5FA" />
                    </div>
                    <div className="why-body">
                      <h4>{w.title}</h4>
                      <p>{w.body}</p>
                    </div>
                  </div>
                </Rev>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 48 }}>
              <Rev>
                <a href="#pricing" className="btn btn-primary btn-lg">
                  Yes — Remove The Ceiling, For Life, $297 One-Time <ChevronRight size={17} />
                </a>
              </Rev>
            </div>
          </div>
        </section>

        {/* YOURS FOR AS LONG AS OFFERIQ EXISTS */}
        <section id="why-matters" className="sect light tight">
          <div className="wrap">
            <div className="prose-block" style={{ textAlign: "center" }}>
              <Rev>
                <span className="eyebrow-amber">Lifetime Inclusion</span>
                <h3 style={{ fontFamily: "Manrope", fontSize: 28, marginTop: 16 }}>Not Just Unlimited. Yours, For As Long As OfferIQ Exists.</h3>
                <p style={{ marginTop: 18 }}>
                  This isn&apos;t a bigger monthly allowance. It&apos;s a permanent, one-time license: every offer you ever build under it stays yours, and <strong>every feature OfferIQ ships in the future</strong> — anything added to the platform from this point forward — is included automatically, at no extra cost, for as long as you hold this license.
                </p>
                <p>
                  You&apos;re not buying more room. You&apos;re buying out of the ceiling entirely, once.
                </p>
              </Rev>
            </div>
          </div>
        </section>

        {/* CAPPED VS UNLIMITED */}
        <section className="sect tight">
          <div className="wrap">
            <Rev cls="sect-head">
              <span className="eyebrow">The Contrast</span>
              <h2>Capped vs. Unlimited</h2>
            </Rev>
            <Rev d={40}>
              <div className="vs-table">
                <div className="vs-head">
                  <div className="bad">Front-end + Pro</div>
                  <div className="good">Unlimited</div>
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

        {/* WHY THIS DOESN'T NEED A COMPARISON */}
        <section className="sect light">
          <div className="wrap">
            <Rev cls="sect-head">
              <h2>Why This Doesn&apos;t Need A Comparison</h2>
            </Rev>
            <div className="prose-block">
              <Rev d={40}>
                <div style={{ background: "var(--card)", padding: 28, borderRadius: 16, border: "1px solid var(--border)", marginBottom: 16 }}>
                  <p style={{ color: "var(--text2)", fontSize: 15, margin: 0 }}>
                    <strong style={{ color: "var(--text)", display: "block", marginBottom: 8 }}>Even the top monthly plan on the OfferIQ site is credit-based</strong> — capped, every single month, forever. Uncapped access has never existed as a monthly option, at any price. This is the only place it exists at all.
                  </p>
                </div>
              </Rev>
              <Rev d={80}>
                <div style={{ background: "var(--card)", padding: 28, borderRadius: 16, border: "1px solid var(--border)" }}>
                  <h4 style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "Manrope", fontSize: 16 }}>
                    ⚠️ Directional early-access signal, not a fabricated precise stat.
                  </h4>
                  <p style={{ color: "var(--text2)", fontSize: 14.5, marginTop: 10 }}>
                    Early-access users who removed the cap tended to build noticeably more than the 5 offers they&apos;d been sitting at — often testing 3–4 new ideas in the first two weeks alone, once the ceiling was gone.
                  </p>
                </div>
              </Rev>
            </div>
          </div>
        </section>

        {/* CAP DOESN'T GET REFUNDED URGENCY */}
        <section className="sect tight">
          <div className="wrap">
            <Rev>
              <div className="urgency-block">
                <span className="eyebrow-amber" style={{ display: "inline-flex", marginBottom: 16 }}>The Cost Of Waiting</span>
                <h3 style={{ marginTop: 14 }}>The Cap You&apos;re Under Right Now Doesn&apos;t Get Refunded Later</h3>
                <p>Every week spent capped is offers, leads, or domains you simply couldn&apos;t build. Upgrading later doesn&apos;t restore what you couldn&apos;t do while you were under the limit — that window is just gone.</p>
                <p style={{ marginTop: 12 }}>
                  And once this launches to its regular model, this exact structure — one-time, lifetime, every future feature included — <strong style={{ color: "var(--text)" }}>won&apos;t be sold again.</strong> New customers after that get the recurring version. This page is the only place the lifetime license exists.
                </p>
                <div style={{ textAlign: "center", marginTop: 28 }}>
                  <a href="#pricing" className="btn btn-primary">Yes — Remove The Ceiling, For Life, $297 One-Time <ChevronRight size={16} /></a>
                </div>
              </div>
            </Rev>
          </div>
        </section>

        {/* VALUE TABLE / PRICING */}
        <section id="pricing" className="sect light tight">
          <div className="wrap">
            <Rev cls="sect-head">
              <span className="eyebrow-amber">Everything You&apos;re Getting With This Upgrade</span>
              <h2>OfferIQ Unlimited — $297, One-Time</h2>
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
                <div className="value-row vtotal"><span className="vitem">Total Real Value</span><span className="vval">$1,626</span></div>
                <div className="value-row vprice"><span className="vitem">Your Price Today — One-Time</span><span className="vval">$297</span></div>
              </div>
            </Rev>
            <div style={{ textAlign: "center", marginTop: 36 }}>
              <Rev d={100}>
                <a href="#" className="btn btn-primary btn-lg">
                  Yes — Remove The Ceiling, For Life, $297 One-Time <ChevronRight size={17} />
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
            <div style={{ textAlign: "center", marginTop: 44 }}>
              <Rev>
                <a href="#pricing" className="btn btn-primary">
                  Yes — Remove The Ceiling, For Life, $297 One-Time <ChevronRight size={16} />
                </a>
              </Rev>
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
                    <li><CheckCircle2 color="#10B981" size={18} style={{ marginTop: 2, flexShrink: 0 }} /> You&apos;ve already found (or expect to find) more than one offer worth running</li>
                    <li><CheckCircle2 color="#10B981" size={18} style={{ marginTop: 2, flexShrink: 0 }} /> You&apos;d rather pay once than delete old offers to make room for new ones</li>
                    <li><CheckCircle2 color="#10B981" size={18} style={{ marginTop: 2, flexShrink: 0 }} /> You want every future OfferIQ feature included automatically, without buying another upgrade</li>
                  </ul>
                </div>
              </Rev>
              <Rev d={80}>
                <div className="ify-card" style={{ borderColor: "rgba(248,113,113,.3)" }}>
                  <h3>This isn&apos;t for you yet if:</h3>
                  <ul className="ify-list">
                    <li><XCircle color="#F87171" size={18} style={{ marginTop: 2, flexShrink: 0 }} /> You haven&apos;t tested whether your first offer works — Front-end and Pro will carry you a long way before 5 offers is a real constraint</li>
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
                  <p>Same guarantee as everything else in OfferIQ. If Unlimited doesn&apos;t earn its place, email support within 30 days for a full refund — no interrogation.</p>
                </div>
              </div>
            </Rev>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="sect">
          <div className="wrap">
            <Rev cls="sect-head"><h2>Quick Questions</h2></Rev>
            <div className="faq">
              {FAQ_ITEMS.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="final-cta">
          <div className="wrap">
            <Rev>
              <p style={{ color: "var(--text3)", fontSize: 13, marginBottom: 14 }}>
                No more deleting an offer to build the next one. No more hitting a wall right as it works.
              </p>
              <h2>
                This is the last cap in the entire funnel —{" "}
                <span className="grad-text">and the only tier that includes every feature OfferIQ ever ships.</span>
              </h2>
              <p className="lead">Automatically. For life.</p>
              <div style={{ marginTop: 36 }}>
                <a href="#pricing" className="btn btn-primary btn-lg">
                  Yes — Remove The Ceiling, For Life, $297 One-Time <ChevronRight size={17} />
                </a>
                <p className="microcopy">30-day guarantee · This page, this price, once.</p>
                <a href="#" className="no-thanks">
                  No thanks — I&apos;ll delete an old offer every time I want to build a new one.
                </a>
              </div>
            </Rev>
          </div>
        </section>

        {/* FOOTER */}
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
