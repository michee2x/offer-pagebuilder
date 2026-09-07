"use client";
import { useEffect, useState, useRef } from "react";
import {
  ChevronRight, Shield, Globe, Users, Target, Zap, Gift, FileText, 
  XCircle, CheckCircle2, Infinity, Layers, Activity, Database, Check,
  Briefcase, PenTool, LayoutDashboard, MonitorPlay, MessageCircle, FileSignature,
  Star, PlayCircle, FolderOpen, Package
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
/* stack items */
.stack-list{display:flex;flex-direction:column;gap:16px;max-width:860px;margin:0 auto;}
.stack-item{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:24px 28px;display:flex;align-items:center;gap:24px;transition:transform .2s,border-color .2s;}
.stack-item:hover{transform:translateY(-2px);border-color:rgba(139,92,246,.25);}
.stack-icon{width:56px;height:56px;border-radius:14px;background:rgba(139,92,246,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.stack-content h4{font-size:17px;font-family:'Manrope';font-weight:800;color:var(--text);margin-bottom:6px;}
.stack-content p{font-size:14.5px;color:var(--text2);margin:0;line-height:1.6;}
@media(max-width:640px){.stack-item{flex-direction:column;text-align:center;gap:16px;}}
/* value table */
.value-table{max-width:960px;margin:0 auto;border:1px solid var(--border);border-radius:var(--r);overflow:hidden;background:var(--card);}
.value-row{display:flex;justify-content:space-between;align-items:center;padding:16px 24px;border-bottom:1px solid var(--bsoft);font-size:14px;gap:20px;}
.value-row .vitem{flex:1;display:flex;flex-direction:column;}
.value-row .vitem-title{color:var(--text);font-weight:700;font-size:15px;margin-bottom:4px;}
.value-row .vitem-desc{color:var(--text2);font-size:13.5px;line-height:1.5;}
.value-row .vval{color:var(--text);font-weight:700;white-space:nowrap;font-size:16px;}
.value-row.vtotal{background:var(--card-alt);}
.value-row.vtotal .vitem-title{color:var(--text);font-weight:800;}
.value-row.vprice{background:rgba(52,211,153,.06);border-bottom:none;padding:24px;}
.value-row.vprice .vitem-title{color:var(--text);font-family:'Manrope';font-weight:800;font-size:18px;}
.value-row.vprice .vval{color:var(--green);font-family:'Manrope';font-weight:800;font-size:32px;}
@media(max-width:760px){.value-row{flex-direction:column;align-items:flex-start;gap:12px;}.value-row .vval{align-self:flex-end;}}
/* guarantee */
.guarantee{display:flex;align-items:center;gap:36px;max-width:860px;margin:0 auto;background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:40px;}
@media(max-width:700px){.guarantee{flex-direction:column;text-align:center;gap:20px;}}
.guarantee-seal{flex-shrink:0;width:76px;height:76px;border-radius:50%;background:linear-gradient(135deg,rgba(139,92,246,.15),rgba(59,130,246,.1));border:2px solid rgba(139,92,246,.25);display:flex;align-items:center;justify-content:center;}
.guarantee h3{font-size:22px;font-family:'Manrope';margin-bottom:10px;}
.guarantee p{color:var(--text2);font-size:15px;line-height:1.7;}
/* warning box */
.warning-box{background:linear-gradient(135deg,rgba(245,166,35,.1),transparent);border:1px solid rgba(245,166,35,.3);border-radius:12px;padding:16px 20px;display:flex;align-items:flex-start;gap:14px;margin-bottom:20px;}
.warning-box strong{color:#FBBF24;display:block;margin-bottom:4px;font-size:14px;}
.warning-box p{color:var(--text2);font-size:13.5px;margin:0;line-height:1.5;}
/* faq */
.faq{max-width:860px;margin:0 auto;display:flex;flex-direction:column;gap:8px;}
.faq-item{background:var(--card);border:1px solid var(--border);border-radius:var(--rsm);overflow:hidden;transition:border-color .2s;}
.faq-item.open{border-color:rgba(139,92,246,.35);}
.faq-q{display:flex;justify-content:space-between;align-items:center;padding:20px 24px;cursor:pointer;font-weight:600;font-size:15px;width:100%;background:none;border:none;text-align:left;color:var(--text);font-family:'Inter';gap:16px;}
.faq-q:hover{background:rgba(255,255,255,.025);}
.faq-plus{color:#A78BFA;font-size:20px;font-weight:300;flex-shrink:0;transition:transform .2s;}
.faq-item.open .faq-plus{transform:rotate(45deg);}
.faq-a{overflow:hidden;transition:max-height .28s ease;}
.faq-a p{padding:0 24px 20px;color:var(--text2);font-size:14.5px;line-height:1.75;}
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

const EVERYTHING_ITEMS = [
  { Icon: Target, title: "Front-end", body: "Go from idea to a live, payment-ready funnel in one sitting, built on 35,000 offers that already converted." },
  { Icon: Activity, title: "Pro", body: "The diagnostic layer: deeper strategy analysis, real traffic analytics, your own domain, both payment processors, tracking pixels, 10,000 leads." },
  { Icon: Infinity, title: "Unlimited", body: "No cap left, anywhere. Unlimited offers, leads, and custom domains — plus lifetime access and every future OfferIQ feature, automatically, for as long as you hold this license." },
  { Icon: Briefcase, title: "Agency", body: "Get paid for what you just learned. 30 client sub-accounts and everything needed to run this as a real service business." },
  { Icon: FolderOpen, title: "Template Club", body: "20 premium, already-researched offers loaded into your account today, with new ones added every month, for as long as you hold this license." },
];

const EXCLUSIVES = [
  { Icon: Package, title: "The DFY 10-Niche Offer Pack", body: "10 fully pre-built Intelligence Reports and matched copy sets, across proven categories — course creators, coaches, agencies, and more. Clone one, adapt it, and skip straight to editing instead of starting from a blank input." },
  { Icon: PlayCircle, title: "A Live VIP Onboarding Webinar", body: "A small-group session walking the entire Front-end → Agency workflow end to end, live, with room for your actual questions — not another pre-recorded video." },
];

const VALUE_ROWS = [
  { title: "Front-end", desc: "Two-path offer analysis, full Intelligence Report, complete 5-page copy set, live funnel builder, Asset Bank, full email sequence suite, Traffic Intelligence™, KPI analytics", val: "$49" },
  { title: "Pro", desc: "Advanced Strategy Report, Advanced Traffic Analytics, custom domain, branding removed, 10,000 leads, 3 workspace seats, Stripe + PayPal, Zapier + Make, tracking pixel suite, priority support", val: "$97" },
  { title: "Unlimited", desc: "Unlimited live offers, unlimited leads, unlimited custom domains, lifetime access to every future OfferIQ feature", val: "$297" },
  { title: "Agency", desc: "30 client sub-accounts, Agency Website, proposal templates, ad graphics, legal contract agreement, Agency Dashboard, DFY onboarding, dedicated support", val: "$197" },
  { title: "Template Club", desc: "20 premium pre-built offers, loaded now, with new ones added monthly", val: "$97" },
];

const FAQ_ITEMS = [
  { 
    q: "I already bought Front-end (or another tier) separately — does Bundle still make sense?", 
    a: "⚠️ [PENDING CONFIRMATION] Flagging — needs your confirmation: does Bundle credit whatever's already been purchased, or is it a flat $497 regardless? Left generic below until confirmed.\n\nIf you've already purchased a tier separately, reach out to support before buying Bundle to make sure you're not paying for anything twice.",
    isWarning: true
  },
  { q: "Does Bundle include lifetime access to future features?", a: "Yes — because Bundle includes full Unlimited, and Unlimited itself grants automatic access to every future OfferIQ feature for life. That's part of the stack, not a separate bundle-only bonus." },
  { q: "Why pay $497 upfront instead of spreading these out?", a: "Because spreading it out costs more, not less — a minimum of $143 more, before counting that the two bundle-exclusive bonuses only exist when bought together." },
  { q: "What if I never end up using the Agency features?", a: "Bundle's price is fixed regardless of which tiers you actually use — and even conservatively, it's still less than buying Pro, Unlimited, and Agency alone would cost." },
  { q: "Is this really less risky than buying separately?", a: "If anything, less: one 30-day guarantee window covers the whole stack, instead of tracking four separate refund windows across four separate purchases." },
  { q: "Can I still buy tiers separately instead?", a: "Yes, from the funnel or your dashboard — at each tier's individual price, without Bundle's two exclusive bonuses." },
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
function FaqItem({ q, a, isWarning = false }: { q: string; a: string; isWarning?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item${open ? " open" : ""}`}>
      <button className="faq-q" onClick={() => setOpen(!open)}>
        <span>{q}</span>
        <span className="faq-plus">{open ? "−" : "+"}</span>
      </button>
      <div className="faq-a" style={{ maxHeight: open ? 600 : 0 }}>
        {isWarning ? (
          <div style={{ padding: "0 24px 20px" }}>
            <div className="warning-box">
              <span style={{ fontSize: 20 }}>⚠️</span>
              <div>
                <strong>Action Required</strong>
                {a.split('\n\n').map((para, i) => (
                  <p key={i} style={{ marginBottom: i === 0 ? 12 : 0 }}>{para.replace("⚠️", "").trim()}</p>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p>{a}</p>
        )}
      </div>
    </div>
  );
}
function MiniCta() {
  const [show, setShow] = useState(false);
  useEffect(() => { const h = () => setShow(window.scrollY > 600); window.addEventListener("scroll", h, { passive: true }); return () => window.removeEventListener("scroll", h); }, []);
  return (
    <div className={`mini-cta${show ? " mini-cta--show" : ""}`}>
      <span className="mini-cta__label">OfferIQ Bundle — $497 One-Time</span>
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
export default function BundlePage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href={FONT_HREF} rel="stylesheet" />
      <style>{CSS}</style>

      <div className="sp">
        <ExitIntent 
          message="Buy These Five Upgrades Separately Later, And You'll Never See This Price Or These Bonuses Combined Again." 
          cta="Give Me Everything — $497"
        />
        <MiniCta />

        {/* BANNER */}
        <div className="banner">
          ⚠️ Buy These Five Upgrades Separately Later, And You&apos;ll <strong>Never See This Price Or These Bonuses Combined Again.</strong>
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
              <a href="#exclusives">Exclusives</a>
              <a href="#pricing">Pricing</a>
              <a href="#faq">FAQ</a>
            </div>
            <a href="#pricing" className="btn-nav">Get Everything — $497</a>
          </div>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="blob blob1" /><div className="blob blob2" />
          <div className="wrap">
            <Rev>
              <span className="eyebrow">For Anyone Done Deciding Which Upgrade To Get, One At A Time</span>
              <h1>
                Own Every Tier Of OfferIQ, Plus The Template Club.{" "}
                <span className="grad-text">$2,031 In Real Value. One Payment: $497.</span>
              </h1>
              <p className="sub">
                Front-end, Pro, Unlimited, Agency, and the full Template Club library — every bonus included, permanently, as one purchase. Plus two things that exist nowhere else in this funnel: a 10-niche done-for-you offer pack and a live VIP onboarding webinar.
              </p>
              <div className="ctas" style={{ marginTop: 36 }}>
                <a href="#pricing" className="btn btn-primary btn-lg">
                  Yes — Give Me Everything, $497 One-Time <ChevronRight size={17} />
                </a>
                <p className="microcopy">30-day money-back guarantee · One-time, never recurring</p>
              </div>
            </Rev>
          </div>
        </section>

        {/* WHY DECIDE PIECE BY PIECE */}
        <section className="sect light">
          <div className="wrap">
            <Rev cls="sect-head">
              <span className="eyebrow-amber">The Math</span>
              <h2>Why Decide Piece By Piece When You Already Know The Answer</h2>
            </Rev>
            <div className="prose-block">
              <Rev d={40}>
                <p>
                  Picture doing this the other way. Front-end today. Pro next week, once you want the deeper diagnostics. Unlimited a month from now, once a cap actually gets in the way. Agency whenever a client finally asks — <strong>if you ever get there at all,</strong> because that&apos;s four separate moments of hesitation, four separate chances to just not click buy.
                </p>
                <div className="pullquote" style={{ marginTop: 24, marginBottom: 24 }}>
                  That&apos;s the real cost of piece by piece. It&apos;s not just $143 more. It&apos;s the version of this where you stall out on decision three and never reach decision four.
                </div>
                <p>
                  Bundle isn&apos;t a discount. It&apos;s the version of this where that stall never happens, because there&apos;s nothing left to decide.
                </p>
                <div style={{ textAlign: "center", marginTop: 36 }}>
                  <a href="#pricing" className="btn btn-primary">
                    Yes — Give Me Everything, $497 One-Time <ChevronRight size={16} />
                  </a>
                </div>
              </Rev>
            </div>
          </div>
        </section>

        {/* EVERYTHING YOU'RE UNLOCKING (STACK) */}
        <section id="whats-included" className="sect">
          <div className="wrap">
            <Rev cls="sect-head">
              <span className="eyebrow">The Full Stack</span>
              <h2>Everything You&apos;re Unlocking</h2>
            </Rev>
            <div className="stack-list">
              {EVERYTHING_ITEMS.map((item, i) => (
                <Rev key={item.title} d={i * 40}>
                  <div className="stack-item">
                    <div className="stack-icon"><Ico icon={item.Icon} size={26} color="#A78BFA" /></div>
                    <div className="stack-content">
                      <h4>{item.title}</h4>
                      <p>{item.body}</p>
                    </div>
                  </div>
                </Rev>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 56 }}>
              <Rev>
                <a href="#pricing" className="btn btn-primary btn-lg">
                  Yes — Give Me Everything, $497 One-Time <ChevronRight size={17} />
                </a>
              </Rev>
            </div>
          </div>
        </section>

        {/* TWO THINGS YOU ONLY GET RIGHT HERE */}
        <section id="exclusives" className="sect light tight">
          <div className="wrap">
            <Rev cls="sect-head" style={{ marginBottom: 40 }}>
              <span className="eyebrow-amber">Bundle Exclusives</span>
              <h2>Two Things You Only Get Right Here</h2>
            </Rev>
            <div className="grid-2" style={{ maxWidth: 960, margin: "0 auto" }}>
              {EXCLUSIVES.map((exc, i) => (
                <Rev key={exc.title} d={i * 40}>
                  <div className="card" style={{ background: "#fff", borderColor: "var(--border)" }}>
                    <div className="card-icon" style={{ background: "rgba(245,166,35,.1)" }}>
                      <Ico icon={exc.Icon} size={22} color="#F5A623" />
                    </div>
                    <h4>{exc.title}</h4>
                    <p>{exc.body}</p>
                  </div>
                </Rev>
              ))}
            </div>
            <Rev d={80}>
              <div className="prose-block" style={{ textAlign: "center", marginTop: 40 }}>
                <p style={{ fontSize: 13.5, color: "var(--text3)" }}>
                  (Unlimited&apos;s lifetime future-feature access is part of the full stack above, not a separate Bundle-only extra — you get it because Bundle includes full Unlimited, same as anyone who buys Unlimited alone would.)
                </p>
                <div style={{ marginTop: 24 }}>
                  <a href="#pricing" className="btn btn-primary">
                    Yes — Give Me Everything, $497 One-Time <ChevronRight size={16} />
                  </a>
                </div>
              </div>
            </Rev>
          </div>
        </section>

        {/* THE NUMBER THAT DOESN'T NEED CONVINCING */}
        <section className="sect">
          <div className="wrap">
            <Rev cls="sect-head">
              <h2>The Number That Doesn&apos;t Need Convincing</h2>
            </Rev>
            <div className="prose-block">
              <Rev d={40}>
                <p>
                  Forget the value stack for a second. Just addition: <strong>Front-end $49 + Pro $97 + Unlimited $297 + Agency $197 + Template Club $97 = $737</strong>, bought separately, at full price, with none of the exclusives.
                </p>
                <div style={{ background: "var(--card-alt)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: 24, marginTop: 24, marginBottom: 24, textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 18, fontFamily: "Manrope", color: "var(--text)", fontWeight: 700 }}>
                    Bundle: $497. That&apos;s $240 less — before a single bonus counts.
                  </p>
                </div>
                <p style={{ textAlign: "center" }}>
                  Everything in the Exclusives section is on top of that. This line alone is reason enough.
                </p>
              </Rev>
            </div>
          </div>
        </section>

        {/* VALUE TABLE / PRICING */}
        <section id="pricing" className="sect light tight">
          <div className="wrap">
            <Rev cls="sect-head">
              <span className="eyebrow-amber">The Full Value Stack</span>
              <h2>OfferIQ Everything — $497, One-Time</h2>
              <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 6 }}>Tier rows show real one-time prices, not marketing-value estimates.</p>
            </Rev>
            <Rev d={80}>
              <div className="value-table">
                {VALUE_ROWS.map((row) => (
                  <div className="value-row" key={row.title}>
                    <div className="vitem">
                      <span className="vitem-title">{row.title}</span>
                      <span className="vitem-desc">{row.desc}</span>
                    </div>
                    <span className="vval">{row.val}</span>
                  </div>
                ))}
                <div className="value-row vtotal">
                  <div className="vitem"><span className="vitem-title">Total</span></div>
                  <span className="vval">$737</span>
                </div>
                <div className="value-row vprice">
                  <div className="vitem"><span className="vitem-title">Your Price Today</span></div>
                  <span className="vval">$497</span>
                </div>
              </div>
            </Rev>
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <Rev d={100}>
                <a href="#" className="btn btn-primary btn-lg">
                  Yes — Give Me Everything, $497 One-Time <ChevronRight size={17} />
                </a>
                <p className="microcopy" style={{ marginTop: 14 }}>
                  30-day guarantee · No monthly fee · Founder&apos;s pricing ends soon
                </p>
              </Rev>
            </div>
          </div>
        </section>

        {/* GUARANTEE */}
        <section className="sect tight">
          <div className="wrap">
            <Rev>
              <div className="guarantee">
                <div className="guarantee-seal"><Ico icon={Shield} size={36} color="#A78BFA" /></div>
                <div>
                  <h3>One Guarantee Covers Everything</h3>
                  <p>Same 30-day money-back guarantee as every tier in OfferIQ — except here, it&apos;s <strong>one guarantee for the entire stack</strong>, not four separate 30-day clocks tied to four separate purchases. If Bundle doesn&apos;t earn its place, email support within 30 days for a full refund on everything, at once. No interrogation.</p>
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
              {FAQ_ITEMS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} isWarning={f.isWarning} />)}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="final-cta" style={{ background: "var(--bg)" }}>
          <div className="wrap">
            <Rev>
              <p style={{ color: "var(--text3)", fontSize: 14, marginBottom: 16 }}>
                Every tier. Every bonus. Two things you can&apos;t get anywhere else.
              </p>
              <h2>
                The only real question left: <span className="grad-text">One decision instead of four.</span>
              </h2>
              <div className="prose-block" style={{ marginTop: 24, marginBottom: 36 }}>
                <p style={{ margin: 0 }}>
                  Front-end already proved OfferIQ works. The only thing left to decide is whether you want Pro, Unlimited, and Agency the way most people get them — one hesitation at a time, at full price, over months — or all at once, today, for less than the pieces would have cost.
                </p>
              </div>
              <div>
                <a href="#pricing" className="btn btn-primary btn-lg">
                  Yes — Give Me Everything, $497 One-Time <ChevronRight size={17} />
                </a>
                <p className="microcopy">30-day guarantee, covering all of it. This page, this price, once.</p>
                <a href="#" className="no-thanks">
                  No thanks, I&apos;ll make this decision three more times, at full price, later.
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
