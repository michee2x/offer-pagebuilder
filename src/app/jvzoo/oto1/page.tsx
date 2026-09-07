"use client";
import { useEffect, useState, useRef } from "react";
import {
  ChevronRight, Shield, BarChart2, Globe, Tag,
  Users, CreditCard, Zap, Target, Headphones,
  TrendingUp, Eye, Gift, FileText, Calculator,
  XCircle, CheckCircle2, AlertTriangle, Lightbulb
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
/* easy-yes */
.easy-yes{max-width:720px;margin:0 auto;background:var(--card);border:1px solid rgba(139,92,246,.25);border-radius:var(--r);padding:40px;text-align:center;}
.easy-yes h3{font-family:'Manrope';font-size:clamp(20px,3vw,26px);}
.easy-yes p{color:var(--text2);font-size:16px;margin-top:16px;line-height:1.75;}
.price-compare{display:flex;align-items:center;justify-content:center;gap:32px;margin-top:28px;flex-wrap:wrap;}
.price-box{text-align:center;}
.price-box .label{font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;font-weight:600;}
.price-box .amount{font-family:'Manrope';font-weight:800;font-size:36px;margin-top:6px;}
.price-box.old .amount{color:var(--text3);text-decoration:line-through;font-size:28px;}
.price-box.new .amount{background:var(--grad-t);-webkit-background-clip:text;background-clip:text;color:transparent;}
.price-divider{color:var(--text3);font-size:28px;font-weight:300;}
/* bonus */
.bonus-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
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
  { Icon: Eye, title: "Eyeball the conversion rate and guess.", body: "The number moves, you tell yourself a story about why. No data behind the story. Same guess, dressed up as intuition." },
  { Icon: Zap, title: "Bolt on a free analytics tool yourself.", body: "Free, sure — but disconnected from your actual funnel steps, your Strategy Report, or anything OfferIQ already knows about your offer. Hours of configuration for something that still can't tell you if positioning or price is the problem." },
  { Icon: Users, title: "Ask in a Facebook group.", body: "Free advice from people who've never seen your funnel, guessing at your problem with less information than you already have." },
  { Icon: XCircle, title: "Ignore it.", body: \`Keep running the offer on hope. Most people don't diagnose a leaking funnel — they just quietly stop running ads to it a few months later and call the idea "a dud," instead of finding the actual fix.\` },
];

const REPLACES_CARDS = [
  { Icon: BarChart2, title: "Instead of eyeballing a single conversion number and guessing why...", body: "Advanced Traffic Analytics shows you exactly which traffic source, device, and funnel step is where people actually leave." },
  { Icon: CreditCard, title: "Instead of losing a sale because a buyer's preferred processor wasn't there...", body: "Stripe + PayPal running together means that never costs you a sale." },
  { Icon: Target, title: "Instead of losing track of which ad actually worked...", body: "The Tracking Pixel Suite (Meta, Google Analytics, Hotjar) tells you exactly which campaign paid for itself." },
  { Icon: Zap, title: "Instead of your tools failing to talk to each other...", body: "Zapier + Make means OfferIQ plugs into whatever you're already running your business on." },
  { Icon: Globe, title: "Instead of a shared subdomain and a visible tool tag quietly undercutting trust...", body: "Your own domain with branding removed means every visitor sees a real business, not a tool's output." },
];

const REMAINING_WHY = [
  { Icon: FileText, color: "#A78BFA", title: \`You get the "why," not just the number.\`, body: \`The Advanced Strategy Report goes deeper than the standard one — Pain Points, Funnel Health, Platform Priority, Offer Positioning, Target Persona, Conversion Hooks, Messaging Matrix, Value Perception, Use Cases, and Monetization Strategy, all specific to your offer.\` },
  { Icon: Users, color: "#34D399", title: "Room to actually grow a list, not just start one.", body: "500 leads is enough to prove a concept. 10,000 means you're not capped out the moment your offer actually starts working — the exact moment a cap costs you the most." },
  { Icon: Eye, color: "#A78BFA", title: "You're not the only one who can move fast.", body: "3 workspace seats means you can bring in a VA, a partner, or a client without sharing your own login." },
  { Icon: Headphones, color: "#60A5FA", title: "Momentum doesn't die in a support queue.", body: "Priority support means a stuck moment stays a stuck moment — minutes, not days." },
];

const VS_ROWS = [
  ["One conversion number, no context", "Traffic Quality + Device + Drop-off, broken down by step"],
  ["Guess which ad actually worked", "Pixel-tracked attribution per campaign"],
  ["Lose sales to a missing payment option", "Stripe + PayPal running together"],
  ["Capped at 500 leads right as it starts working", "Room for 10,000"],
  ["Tools that don't talk to each other", "Zapier + Make, connected to everything"],
];

const BONUSES = [
  { Icon: Gift, title: "DFY Ad Creative Template Pack", desc: "25 Canva-ready static ad templates, matched to the 5 Conversion Hook types already in your Traffic Intelligence™ suite." },
  { Icon: FileText, title: \`"5 High-Converting Niches Right Now"\`, desc: "A quarterly-refreshed market report, so this stays current instead of going stale." },
  { Icon: Calculator, title: "Traffic Budget Calculator", desc: "Plug in your Funnel Health Score and price point, get a suggested Phase 1/2/3 ad-spend split back instantly." },
];

const VALUE_ROWS: [string, string][] = [
  ["Advanced Strategy Report (10 additional analysis layers)", "$297"],
  ["Advanced Traffic Analytics (Quality + Device + Drop-off)", "$297"],
  ["Custom Domain Connection", "$97"],
  ['"Built with OfferIQ" Tag Removed', "$67"],
  ["+9,500 Leads (500 → 10,000)", "$297"],
  ["+2 Workspace Seats (1 → 3)", "$97"],
  ["Stripe + PayPal Simultaneously", "$147"],
  ["Zapier + Make Automation", "$147"],
  ["Tracking Pixel Suite (Meta / Google Analytics / Hotjar)", "$97"],
  ["Priority Support", "$47"],
  ["Bonus: DFY Ad Creative Template Pack (25 templates)", "$97"],
  ['Bonus: "5 High-Converting Niches Right Now" Report', "$67"],
  ["Bonus: Traffic Budget Calculator", "$47"],
];

const FAQ_ITEMS = [
  { q: "Does this increase my offer limit?", a: "No — Pro is about depth on the offers you're already running: deeper strategy data, real analytics, payment flexibility, and lead capacity. Offer-count limits are addressed at Unlimited." },
  { q: "I don't have much traffic yet — is this too early?", a: "If your offer isn't live yet, yes — start with Front-end. If it's live and getting any real visits at all, the sooner analytics are running, the more diagnostic history you have when you need it." },
  { q: "How is this different from what my ad platform already shows me?", a: "Ad platforms show you what happened on their side of the click. Traffic Quality, Device Breakdown, and Funnel Drop-off show you what happened after that click landed on your funnel — where specifically people stopped." },
  { q: "Do I need technical skill to set up the tracking pixels?", a: "No. Connect once inside your dashboard; OfferIQ handles the rest." },
  { q: "Does this replace what I bought, or add to it?", a: "Adds to it. Everything from Front-end stays exactly as it was." },
  { q: "Should I wait to see what else is coming before deciding?", a: "No — this price and these bonuses are only here, on this page, right now." },
  { q: "If I get Unlimited later, do I waste what I paid for Pro?", a: "No. Unlimited fully includes everything in Pro — nothing here is replaced or wasted, it's extended further." },
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
  return <div ref={ref} style={{ transitionDelay: \`\${d}ms\` }} className={\`rev\${v ? " rev-in" : ""}\${cls ? " " + cls : ""}\`}>{children}</div>;
}
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={\`faq-item\${open ? " open" : ""}\`}>
      <button className="faq-q" onClick={() => setOpen(!open)}><span>{q}</span><span className="faq-plus">{open ? "−" : "+"}</span></button>
      <div className="faq-a" style={{ maxHeight: open ? 400 : 0 }}><p>{a}</p></div>
    </div>
  );
}
function MiniCta() {
  const [show, setShow] = useState(false);
  useEffect(() => { const h = () => setShow(window.scrollY > 600); window.addEventListener("scroll", h, { passive: true }); return () => window.removeEventListener("scroll", h); }, []);
  return (
    <div className={\`mini-cta\${show ? " mini-cta--show" : ""}\`}>
      <span className="mini-cta__label">Pro — $97 One-Time Upgrade</span>
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
export default function OTO1Page() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href={FONT_HREF} rel="stylesheet" />
      <style>{CSS}</style>

      <div className="sp">
        <ExitIntent 
          message="Your Front-End Purchase Isn't The Whole Picture. One Step Changes What You Can Actually See." 
          cta="Lock In Pro Now — $97"
        />
        <MiniCta />

        {/* BANNER */}
        <div className="banner">
          ⚠️ Wait — Your Front-End Purchase Isn't The Whole Picture.{" "}
          <strong>One Step Changes What You Can Actually See.</strong>
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
            <a href="#pricing" className="btn-nav">Upgrade — $97</a>
          </div>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="blob blob1" /><div className="blob blob2" />
          <div className="wrap">
            <Rev>
              <span className="eyebrow">For OfferIQ Users Whose First Offer Is Already Live</span>
              <h1>
                You Stopped Guessing What To Build.{" "}
                <span className="grad-text">Pro Is Where You Stop Guessing Whether It&apos;s Working.</span>
              </h1>
              <p className="sub">
                A deeper Strategy Report, real analytics on where people actually drop off, a domain and branding that read as a real business, both major payment processors, and enough lead capacity to let a list actually compound.
              </p>
              <div className="ctas" style={{ marginTop: 36 }}>
                <a href="#pricing" className="btn btn-primary btn-lg">
                  Yes — Show Me What&apos;s Actually Happening, $97 One-Time <ChevronRight size={17} />
                </a>
                <p className="microcopy">30-day money-back guarantee · One-time, never recurring</p>
              </div>
            </Rev>
          </div>
        </section>

        {/* THE GUESS MOVED DOWNSTREAM */}
        <section className="sect light">
          <div className="wrap">
            <Rev>
              <span className="eyebrow-amber">The Problem Nobody Warns You About Next</span>
              <h2 style={{ marginTop: 18, fontSize: "clamp(24px,3.5vw,36px)", maxWidth: 720, marginBottom: 0 }}>
                The Guess Didn&apos;t Disappear. It Moved Downstream.
              </h2>
            </Rev>
            <Rev d={80}>
              <div className="prose-block" style={{ marginTop: 32 }}>
                <p>You already ended the biggest guess — what to sell, what to charge, what to say. Front-end proved OfferIQ works. <strong>Your offer is live.</strong></p>
                <p>Here&apos;s the guess nobody warns you about next: <strong>whether it&apos;s actually converting well, and why.</strong></p>
                <p>Picture your dashboard three weeks in. Visits are happening. A few sales have landed. But is that funnel converting at 1% or 4%? Is the problem your ad, a device rendering the page badly, or a single broken step two pages in? On Front-end, the honest answer is: <strong>you can&apos;t fully tell.</strong> You get a conversion rate. You don&apos;t get the reason behind it.</p>
                <div className="pullquote">
                  That gap is where real money quietly leaks — not because the offer is wrong, but because nothing is watching closely enough to tell you where.
                </div>
              </div>
            </Rev>
            <div style={{ textAlign: "center", marginTop: 44 }}>
              <Rev>
                <a href="#pricing" className="btn btn-primary">
                  Yes — Show Me What&apos;s Actually Happening, $97 One-Time <ChevronRight size={16} />
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
              <h2>What People Do Instead Of Actually Knowing</h2>
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

        {/* WHAT PRO ISN'T */}
        <section className="sect light tight">
          <div className="wrap">
            <div className="prose-block" style={{ textAlign: "center" }}>
              <Rev>
                <span className="eyebrow-amber">Clarification</span>
                <h3 style={{ fontFamily: "Manrope", fontSize: 28, marginTop: 16 }}>What Pro Isn&apos;t</h3>
                <p style={{ marginTop: 18 }}>
                  Pro isn&apos;t a vanity dashboard bolted onto your funnel after the fact. It isn&apos;t a generic analytics widget you&apos;d get from any $20/month app, disconnected from what actually makes your offer work.
                </p>
                <p>
                  <strong style={{ color: "var(--text)" }}>It is the diagnostic layer built directly from your own Strategy Report</strong> — the same data that positioned your offer in the first place, now watching whether that positioning is actually landing.
                </p>
              </Rev>
            </div>
          </div>
        </section>

        {/* WHAT PRO ACTUALLY REPLACES */}
        <section className="sect">
          <div className="wrap">
            <Rev cls="sect-head">
              <span className="eyebrow">The Real Value</span>
              <h2>What Pro Actually Replaces</h2>
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
                  Yes — Show Me What&apos;s Actually Happening, $97 One-Time <ChevronRight size={17} />
                </a>
              </Rev>
            </div>
          </div>
        </section>

        {/* WHY EACH REMAINING UPGRADE MATTERS */}
        <section id="why-matters" className="sect light tight">
          <div className="wrap">
            <Rev cls="sect-head">
              <span className="eyebrow-amber">More Included</span>
              <h2>Why Each Remaining Upgrade Matters</h2>
            </Rev>
            <div className="why-grid">
              {REMAINING_WHY.map((w, i) => (
                <Rev key={w.title} d={i * 40}>
                  <div className="why-row">
                    <div className="why-icon"><Ico icon={w.Icon} size={20} color={w.color} /></div>
                    <div className="why-body">
                      <h4>{w.title}</h4>
                      <p>{w.body}</p>
                    </div>
                  </div>
                </Rev>
              ))}
            </div>
          </div>
        </section>

        {/* WHY THIS ISN'T JUST A FEELING */}
        <section className="sect">
          <div className="wrap">
            <Rev cls="sect-head">
              <h2>Why This Isn&apos;t Just A Feeling</h2>
            </Rev>
            <div className="prose-block">
              <Rev d={40}>
                <div style={{ background: "var(--card)", padding: 28, borderRadius: 16, border: "1px solid var(--border)", marginBottom: 16 }}>
                  <h4 style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "Manrope", fontSize: 16 }}>
                    💸 Cart abandonment from a missing payment option is measurable, not theoretical.
                  </h4>
                  <p style={{ color: "var(--text2)", fontSize: 14.5, marginTop: 10 }}>
                    Independent research from the Baymard Institute found that 13% of online shoppers abandon their purchase when their preferred payment method isn&apos;t available at checkout. Running Stripe and PayPal together means that 13% never comes out of your pocket.
                  </p>
                </div>
              </Rev>
              <Rev d={80}>
                <div style={{ background: "var(--card)", padding: 28, borderRadius: 16, border: "1px solid var(--border)" }}>
                  <h4 style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "Manrope", fontSize: 16 }}>
                    📊 Directional early-access signal, not a fabricated precise stat.
                  </h4>
                  <p style={{ color: "var(--text2)", fontSize: 14.5, marginTop: 10 }}>
                    In early access, the users who turned on Advanced Traffic Analytics tended to find at least one real leak in their funnel — a weak traffic source, a device issue, a drop-off step — within their first few days, not months later after the ad spend was already gone.
                  </p>
                </div>
              </Rev>
            </div>
            <div style={{ textAlign: "center", marginTop: 44 }}>
              <Rev d={120}>
                <a href="#pricing" className="btn btn-primary">
                  Yes — Show Me What&apos;s Actually Happening, $97 One-Time <ChevronRight size={16} />
                </a>
              </Rev>
            </div>
          </div>
        </section>

        {/* GUESSING VS KNOWING */}
        <section className="sect light tight">
          <div className="wrap">
            <Rev cls="sect-head">
              <span className="eyebrow-amber">The Contrast</span>
              <h2>Guessing vs. Knowing</h2>
            </Rev>
            <Rev d={40}>
              <div className="vs-table">
                <div className="vs-head">
                  <div className="bad">Without Pro</div>
                  <div className="good">With Pro</div>
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

        {/* EASY YES */}
        <section className="sect">
          <div className="wrap">
            <Rev>
              <div className="easy-yes" style={{ background: "linear-gradient(145deg, var(--card), var(--bg))" }}>
                <span className="eyebrow" style={{ display: "inline-flex" }}>Why This Is An Easy Yes</span>
                <h3 style={{ marginTop: 18 }}>The math is simple.</h3>
                <p>
                  The domain, the branding removal, the analytics, the tracking pixels, the priority support — that combination is almost exactly what the monthly OfferIQ Growth plan charges{" "}
                  <strong style={{ color: "var(--text)" }}>$69/month</strong> for.
                </p>
                <div className="price-compare">
                  <div className="price-box old">
                    <div className="label">Monthly Growth Plan</div>
                    <div className="amount">$69<span style={{ fontSize: 16, fontWeight: 500 }}>/mo</span></div>
                  </div>
                  <div className="price-divider">vs</div>
                  <div className="price-box new">
                    <div className="label">Pro — One-Time</div>
                    <div className="amount">$97</div>
                  </div>
                </div>
                <p style={{ marginTop: 24 }}>
                  <strong style={{ color: "var(--text)" }}>Pro is $97. Once.</strong> You break even against the monthly plan in under six weeks.
                </p>
                <div style={{ marginTop: 32 }}>
                  <a href="#pricing" className="btn btn-primary btn-lg">
                    Upgrade for $97 — One-Time <ChevronRight size={17} />
                  </a>
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
              <h2>OfferIQ Pro — $97, One-Time</h2>
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
                <div className="value-row vtotal"><span className="vitem">Total Real Value</span><span className="vval">$1,801</span></div>
                <div className="value-row vprice"><span className="vitem">Your Price Today — One-Time</span><span className="vval">$97</span></div>
              </div>
            </Rev>
            <div style={{ textAlign: "center", marginTop: 36 }}>
              <Rev d={100}>
                <a href="#" className="btn btn-primary btn-lg">
                  Yes — Show Me What&apos;s Actually Happening, $97 One-Time <ChevronRight size={17} />
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
            <div className="bonus-grid">
              {BONUSES.map((b, i) => (
                <Rev key={b.title} d={i * 80}>
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
                  Yes — Show Me What&apos;s Actually Happening, $97 One-Time <ChevronRight size={16} />
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
                    <li><CheckCircle2 color="#10B981" size={18} style={{ marginTop: 2, flexShrink: 0 }} /> Your offer is live and getting real traffic</li>
                    <li><CheckCircle2 color="#10B981" size={18} style={{ marginTop: 2, flexShrink: 0 }} /> You&apos;ve noticed something&apos;s off, but can&apos;t tell what</li>
                    <li><CheckCircle2 color="#10B981" size={18} style={{ marginTop: 2, flexShrink: 0 }} /> You want to know which ad or campaign is actually working, not just that sales happened</li>
                    <li><CheckCircle2 color="#10B981" size={18} style={{ marginTop: 2, flexShrink: 0 }} /> A single conversion number has stopped telling you anything useful</li>
                  </ul>
                </div>
              </Rev>
              <Rev d={80}>
                <div className="ify-card" style={{ borderColor: "rgba(248,113,113,.3)" }}>
                  <h3>This isn&apos;t for you yet if:</h3>
                  <ul className="ify-list">
                    <li><XCircle color="#F87171" size={18} style={{ marginTop: 2, flexShrink: 0 }} /> You haven&apos;t published your first offer — get that live on Front-end first. There&apos;s nothing to diagnose without real traffic.</li>
                  </ul>
                </div>
              </Rev>
            </div>
          </div>
        </section>

        {/* DATA-LOSS URGENCY */}
        <section className="sect tight">
          <div className="wrap">
            <Rev>
              <div className="urgency-block">
                <span className="eyebrow-amber" style={{ display: "inline-flex", marginBottom: 16 }}>One More Thing</span>
                <h3 style={{ marginTop: 14 }}>Analytics only ever work going forward.</h3>
                <p>Every day your offer runs on Front-end alone is traffic and leads you can never go back and analyze — that diagnostic history is just gone, whether or not you upgrade later.</p>
                <p style={{ marginTop: 12 }}>
                  This page won&apos;t load again at this price. <strong style={{ color: "var(--text)" }}>Founder pricing rises as this launch progresses</strong> — what you lock in today is the lowest this ever gets.
                </p>
                <div style={{ textAlign: "center", marginTop: 28 }}>
                  <a href="#pricing" className="btn btn-primary">Lock In Pro Now — $97 <ChevronRight size={16} /></a>
                </div>
              </div>
            </Rev>
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
                  <p>Same guarantee as everything else in OfferIQ. If Pro doesn&apos;t earn its place, email support within 30 days for a full refund — no interrogation.</p>
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
                A deeper report. Real analytics. Your own domain. Both payment processors. Room to compound.
              </p>
              <h2>
                Front-end told you OfferIQ works.{" "}
                <span className="grad-text">Pro is how you find out why.</span>
              </h2>
              <p className="lead">Before the data you needed is already gone.</p>
              <div style={{ marginTop: 36 }}>
                <a href="#pricing" className="btn btn-primary btn-lg">
                  Yes — Show Me What&apos;s Actually Happening, $97 One-Time <ChevronRight size={17} />
                </a>
                <p className="microcopy">30-day guarantee · This page, this price, once.</p>
                <a href="#" className="no-thanks">
                  No thanks, I&apos;ll keep guessing at why it&apos;s converting the way it is.
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
