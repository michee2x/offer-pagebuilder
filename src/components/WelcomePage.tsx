
'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Link as LinkIcon, FileText, PenTool, Target, Users, DollarSign, Zap, BookOpen, GraduationCap, Building, Sprout, Check, CreditCard, Megaphone, Music, ArrowRight, Play, TrendingUp } from 'lucide-react';
import '../app/welcome.css';

function FaqItem({ q, a, isOpen, onClick }: { q: string, a: string, isOpen: boolean, onClick: () => void }){
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className={`faq-item ${isOpen ? 'open' : ''}`}>
      <button className="faq-q" onClick={onClick} aria-expanded={isOpen}>
        <span>{q}</span>
        <span className="plus"></span>
      </button>
      <div className="faq-a" style={{maxHeight: isOpen ? (ref.current ? ref.current.scrollHeight + 'px' : '400px') : '0px'}}>
        <div className="faq-a-inner" ref={ref}>{a}</div>
      </div>
    </div>
  );
}

export function WelcomePage() {
  const scenarios = [
    {
      icon: <GraduationCap className="w-4 h-4 inline mr-2" />, avatarIcon: <GraduationCap className="w-6 h-6" />, tab: "Course Creator", who: "Marketing Consultant", meta: "34 · Austin, TX · 14K Instagram followers",
      quote: <>"I'd researched competitors, taken two copywriting courses, and paid $800 for a coach call. <span className="accent">I still had nothing live.</span>"</>,
      body: "She uploaded her course idea as a text description. In under a minute, OfferIQ returned her exact persona, a price point $300 higher than she'd planned to charge, five conversion hooks, and a full funnel blueprint — then wrote and built the entire funnel in the same session.",
      stats: [
        { from: "6 months stuck", to: "Live in one evening" },
        { from: "$197 planned price", to: "$497 recommended price" },
        { single: "5 pages + funnel — written, designed, and published in one session" },
      ]
    },
    {
      icon: <Target className="w-4 h-4 mr-2 inline" />, avatarIcon: <Target className="w-6 h-6" />, tab: "Business Coach", who: "Executive Life Coach", meta: "41 · Atlanta, GA · $3,500 program",
      quote: <>"I knew the problem was in the messaging. <span className="accent">I just couldn't see what was wrong with it.</span>"</>,
      body: "She pasted her existing sales page URL into OfferIQ. The Intelligence Report found the real problem in seconds: her page led with a 12-step curriculum, but her buyer purchases from identity anxiety — they want to stop feeling behind, not learn a curriculum. OfferIQ rewrote the copy around that insight and raised her price to $4,500.",
      stats: [
        { from: "0.7% conversion", to: "2.5%+ projected, same ad budget" },
        { from: "$9,600 spent, unprofitable", to: "Profitable within 30 days (projected)" },
        { from: "$3,500 price", to: "$4,500 pricing correction" },
      ]
    },
    {
      icon: <Building className="w-4 h-4 inline mr-2" />, avatarIcon: <Building className="w-6 h-6" />, tab: "Agency Owner", who: "Digital Marketing Agency Owner", meta: "38 · Denver, CO · 6-person team",
      quote: <>"Every new service means a new hiring decision. <span className="accent">I couldn't productize this without a repeatable system.</span>"</>,
      body: "He wanted to add offer strategy and funnel building as a $3,000–$5,000 productized service, without hiring. He now runs each client's offer through OfferIQ — intelligence report, copy, and funnel delivered as a packaged deliverable. What took his team three weeks now takes two hours.",
      stats: [
        { from: "3 weeks per client", to: "2 hours per client" },
        { single: "$15,000–$30,000/month projected new service-line revenue" },
        { single: "Zero new hires required to deliver it" },
      ]
    },
    {
      icon: <Sprout className="w-4 h-4 inline mr-2" />, avatarIcon: <Sprout className="w-6 h-6" />, tab: "First-Time Entrepreneur", who: "Corporate HR Professional", meta: "29 · Chicago, IL · 8 yrs experience",
      quote: <>"I knew I had teachable expertise. <span className="accent">I had no idea what to build, or where to start.</span>"</>,
      body: "She had 18 months of “how to launch a course” content behind her and nothing live. She selected “Build an Offer For Me,” entered her niche and audience, and received five validated offer ideas. She picked “The 90-Day People Ops Accelerator” at $997 — OfferIQ built the full intelligence report and funnel for it in the same session.",
      stats: [
        { from: "18 months, no product", to: "Live funnel in under 3 hours" },
        { single: "5 validated offer ideas generated from niche + audience + price range" },
        { single: "$997 price point — market-tested, not guessed" },
      ]
    },
  ];

  const [activeScenario, setActiveScenario] = useState(0);
  const s = scenarios[activeScenario];

  const faqs = [
    { q:"Is OfferIQ a subscription, or a one-time purchase?", a:"Both structures exist, by tier. Starter and Growth are monthly subscriptions — you're billed each month and can cancel anytime from your account. Agency is a single one-time payment with credits that never expire. Pick whichever fits how you plan to use the platform." },
    { q:"How does the $1 trial work, exactly?", a:"You get full access to the Starter plan for 7 days for $1. If you don't cancel before day 7, your card is billed the standard $39/mo rate and your subscription continues month to month. You can cancel anytime, including during the trial, with no further charge." },
    { q:"Do unused offer credits roll over to the next month?", a:"No. Starter and Growth credits refresh monthly and reset at the start of each new billing cycle — unused credits don't carry over. If you consistently need more than your plan's monthly allowance, Growth or a credit top-up is the better fit. Agency credits work differently: they're a fixed pool that never expires and never refreshes, because they're paid for once." },
    { q:"What happens to my published funnels if I cancel my subscription?", a:"Your funnels are taken offline when your subscription ends, since active publishing and hosting are part of what your monthly plan pays for. Your underlying data — copy, reports, and assets — stays accessible in your account for a limited window so you can export it or reactivate later, but live pages stop serving until you resubscribe." },
    { q:"What happens when I run out of credits partway through the month?", a:"Your existing offers, pages, and data remain fully accessible — nothing is taken away. To build additional new offers before your next refresh, you can purchase additional credit packs for $10 per credit; one credit builds one complete offer (Intelligence Report + Copy + Pages + Traffic Strategy + Asset Bank)." },
    { q:"Can I upgrade or downgrade my plan later?", a:"Yes. You can upgrade to a higher tier at any time by paying the price difference for the remainder of your billing cycle. Downgrades take effect at your next renewal date, so you keep your current plan's benefits until then." },
    { q:"Is there a refund policy?", a:"Yes — a 30-day money-back guarantee applies to every tier, including Agency. If OfferIQ isn't right for you, request a full refund within 30 days of your purchase, no conditions." },
    { q:"Does OfferIQ work outside the US?", a:"Yes. OfferIQ supports multiple currencies and target countries in the offer creation process, with additional payment integrations (Paystack, Flutterwave) on the roadmap for broader regional support." },
    { q:"What if I run an agency and need more than 30 client sub-accounts?", a:"Contact support after purchase — additional sub-account packs are available for agencies scaling beyond the Agency tier's built-in allocation." },
  ];
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    // Nav Scroll
    const nav = document.getElementById('nav');
    if (nav) {
      const handleScroll = () => {
        nav.classList.toggle('scrolled', window.scrollY > 30);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    // Scroll Reveal
    const revealEls = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    // FAQ Accordion
    const setupFaq = () => {
      document.querySelectorAll('.faq-item').forEach((item: any) => {
        const btn = item.querySelector('.faq-q') as HTMLElement;
        const panel = item.querySelector('.faq-a') as HTMLElement;
        const inner = item.querySelector('.faq-a-inner') as HTMLElement;
        if (item.classList.contains('open')) {
          panel.style.maxHeight = inner.scrollHeight + 'px';
        }
        btn.addEventListener('click', () => {
          const isOpen = item.classList.contains('open');
          document.querySelectorAll('.faq-item').forEach((other: any) => {
            other.classList.remove('open');
            (other.querySelector('.faq-a') as HTMLElement).style.maxHeight = '0px';
            (other.querySelector('.faq-q') as HTMLElement).setAttribute('aria-expanded', 'false');
          });
          if (!isOpen) {
            item.classList.add('open');
            panel.style.maxHeight = inner.scrollHeight + 'px';
            btn.setAttribute('aria-expanded', 'true');
          }
        });
      });
    }
    setupFaq();
  }, []);

  return (
    <div className="welcome-page-html">
      <div className="welcome-page">



        <nav className="nav" id="nav">
          <div className="wrap">
            <div className="nav-logo"><div className="mark"></div>OfferIQ</div>
            <div className="nav-links">
              <a href="#showcase">Product</a>
              <a href="#vault">Asset Bank &amp; Templates</a>
              <a href="#how-it-works">How It Works</a>
              <a href="/login">Pricing</a>
              <a href="/login">FAQ</a>
            </div>
            <div className="nav-cta">
              <a href="/login" className="btn btn-ghost btn-sm">Log In</a>
              <a href="/login" className="btn btn-primary btn-sm">Start Building
                <ArrowRight className="icon-inline w-4 h-4" />
              </a>
            </div>
          </div>
        </nav>


        <header className="hero">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Intelligence-First Offer OS</span>
              <h1>Every offer starts with intelligence.<br />Yours starts <span className="grad-text">today.</span></h1>
              <p className="lede">
                Upload a URL, a PDF, or a single idea. OfferIQ analyzes it against 35,000+ real converting
                offers and hands you the complete revenue system: strategy, copy, a live funnel, and a
                traffic plan — built in one session.
              </p>
              <div className="hero-cta-row">
                <a href="/login" className="btn btn-primary">Analyse My Offer
                  <ArrowRight className="icon-inline w-4 h-4" />
                </a>
                <a href="/login" className="btn btn-ghost">Build One For Me</a>
              </div>
              <p className="hero-micro">// No design or copywriting experience required. Cancel anytime.</p>
            </div>
            <div className="hero-visual">
              <div className="video-shell reveal h-full">
                <button className="play-btn" aria-label="Play demo video">
                  <Play className="w-7 h-7 text-white ml-1" />
                </button>
                <span className="video-label">Product demo</span>
                <span className="video-duration">4:12</span>
              </div>
            </div>
          </div>
        </header>


        <section className="proof">
          <div className="wrap">
            <p className="proof-label">Why this matters right now</p>
            <div className="proof-grid">
              <div className="proof-stat reveal">
                <div className="num">58.3%</div>
                <div className="desc">of creators say they actively struggle to monetize their audience.</div>
                <div className="src">— Behind The Scenes, 2026 Creator Economy Report</div>
              </div>
              <div className="proof-stat reveal">
                <div className="num">6.5 mo</div>
                <div className="desc">average time it takes a creator to earn their first dollar online.</div>
                <div className="src">— The Tilt / Demandsage Creator Economy Data, 2026</div>
              </div>
              <div className="proof-stat reveal">
                <div className="num">79%</div>
                <div className="desc">of course creators say marketing, not the product, is their biggest obstacle.</div>
                <div className="src">— Mirasee Course Creator Survey</div>
              </div>
            </div>
          </div>
        </section>


        <section className="section" id="problem">
          <div className="wrap">
            <div className="section-head reveal">
              <span className="eyebrow">The Pattern</span>
              <h2>You don't have a launch problem.<br />You have a strategy problem.</h2>
              <p>The tools you already use — page builders, course platforms, copy software — all assume the strategy exists. It doesn't. That's the layer OfferIQ was built to fill.</p>
            </div>
            <div className="problem-grid">
              <div className="problem-card reveal">
                <span className="tag">Pattern 01</span>
                <h3>Months of almost-launching</h3>
                <p>Without validated positioning and pricing, every attempt to build a funnel ends the same way — a product that doesn't convert, or one that never goes live at all.</p>
              </div>
              <div className="problem-card reveal">
                <span className="tag">Pattern 02</span>
                <h3>Copy that reads well and still fails</h3>
                <p>A hired copywriter can't fix a broken strategic foundation. Good sentences built on the wrong persona and the wrong hook still don't convert.</p>
              </div>
              <div className="problem-card reveal">
                <span className="tag">Pattern 03</span>
                <h3>Guessing at traffic</h3>
                <p>Most entrepreneurs either avoid paid traffic entirely or test blind across platforms — burning $10,000–$30,000 before finding creative that converts, if they ever do.</p>
              </div>
            </div>
          </div>
        </section>


        <section className="section" id="gate">
          <div className="wrap">
            <div className="section-head center reveal">
              <span className="eyebrow center">Two Ways In</span>
              <h2>Tell OfferIQ where you're starting from.</h2>
              <p>There's no wrong entry point — just the one that matches what you already have.</p>
            </div>
            <div className="gate-grid">
              <div className="gate-card reveal">
                <span className="gate-index">01 / HAVE AN OFFER</span>
                <h3>Analyse &amp; Build My Offer</h3>
                <p>You already have an offer, a live page, or a rough idea. Paste a URL, upload a PDF, or describe it in your own words — OfferIQ builds the complete intelligence report, copy, and funnel around what you already have.</p>
                <div className="gate-inputs">
                  <span className="chip"><LinkIcon className="w-4 h-4 mr-2 inline" /> Paste a URL</span>
                  <span className="chip"><FileText className="w-4 h-4 mr-2 inline" /> Upload a PDF</span>
                  <span className="chip"><PenTool className="w-4 h-4 mr-2 inline" /> Describe it</span>
                </div>
                <a href="/login" className="btn btn-ghost btn-sm">Start here →</a>
              </div>
              <div className="gate-card reveal">
                <span className="gate-index">02 / NO OFFER YET</span>
                <h3>Build an Offer For Me</h3>
                <p>You have an audience and expertise, but no product. Give OfferIQ your niche, audience, and price range — get five validated offer ideas benchmarked against real converting funnels, ready to build the moment you pick one.</p>
                <div className="gate-inputs">
                  <span className="chip"><Target className="w-4 h-4 mr-2 inline" /> Pick a niche</span>
                  <span className="chip"><Users className="w-4 h-4 mr-2 inline" /> Define your buyer</span>
                  <span className="chip"><DollarSign className="w-4 h-4 mr-2 inline" /> Set a price range</span>
                </div>
                <a href="/login" className="btn btn-ghost btn-sm">Start here →</a>
              </div>
            </div>
          </div>
        </section>


        <section className="section" id="how-it-works">
          <div className="wrap">
            <div className="section-head reveal">
              <span className="eyebrow">From Idea To Live Funnel</span>
              <h2>The average user goes from first login to a live, payment-enabled funnel in under 30 minutes.</h2>
              <p>For a returning user building their second or third offer, it takes under 15.</p>
            </div>
            <div className="timeline">
              <div className="tl-item reveal">
                <div className="tl-num">01</div>
                <div className="tl-body"><div><h4>Intelligence Report</h4><p>Your offer is analyzed against 35,000+ validated funnels — positioning, persona, pricing, hooks, and a full funnel blueprint come back specific to you.</p></div><span className="tl-time">~2 min</span></div>
              </div>
              <div className="tl-item reveal">
                <div className="tl-num">02</div>
                <div className="tl-body"><div><h4>Copy Engine</h4><p>Lead page, long-form sales page, upsell, downsell, and thank-you copy — written from the intelligence report, in your buyer's exact vocabulary.</p></div><span className="tl-time">~4 min</span></div>
              </div>
              <div className="tl-item reveal">
                <div className="tl-num">03</div>
                <div className="tl-body"><div><h4>Page Builder</h4><p>Every page assembles automatically using your design direction. Edit inline, or tell the AI copilot what to change in plain language.</p></div><span className="tl-time">~7 min</span></div>
              </div>
              <div className="tl-item reveal">
                <div className="tl-num">04</div>
                <div className="tl-body"><div><h4>Traffic Intelligence™ &amp; Email</h4><p>A platform priority matrix, ready-to-deploy ad copy, a VSL script, a UGC script, and full email sequences — before you spend a dollar on ads.</p></div><span className="tl-time">~3 min</span></div>
              </div>
              <div className="tl-item reveal">
                <div className="tl-num">05</div>
                <div className="tl-body"><div><h4>Publish &amp; Go Live</h4><p>Connect a domain, connect Stripe or PayPal, and deploy. Your funnel is public and payment-enabled.</p></div><span className="tl-time">instant</span></div>
              </div>
            </div>
          </div>
        </section>


        <section className="section" id="showcase">
          <div className="wrap">
            <div className="section-head center reveal">
              <span className="eyebrow center">Product Showcase</span>
              <h2>One workspace. Every phase of the offer, connected.</h2>
              <p>Each phase reads the one before it — nothing here is generic, because none of it is generated in isolation.</p>
            </div>

            <div className="feature-row reveal">
              <div className="feature-copy">
                <span className="feature-tag">01 · Workspace &amp; Live Tracking</span>
                <h3>Every offer lives in one workspace, tracked from day one</h3>
                <ul className="feature-list">
                  <li><Check className="w-[18px] h-[18px] mt-[3px] text-emerald-400 shrink-0" /><span><b>Live Tracking</b> starts the moment your workspace is created — views, visitors, and conversion rate update automatically.</span></li>
                  <li><Check className="w-[18px] h-[18px] mt-[3px] text-emerald-400 shrink-0" /><span>A running <b>Funnel Health Score</b> gives you one number for how launch-ready your offer really is.</span></li>
                  <li><Check className="w-[18px] h-[18px] mt-[3px] text-emerald-400 shrink-0" /><span><b>Global Traffic Distribution</b> maps where your visitors are actually coming from, by region.</span></li>
                </ul>
              </div>
              <div className="feature-media">
                <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" alt="OfferIQ workspace overview" />
                <div className="media-caption">[ Screenshot: OfferIQ workspace overview ]</div>
              </div>
            </div>

            <div className="feature-row reverse reveal">
              <div className="feature-copy">
                <span className="feature-tag">02 · Choice Gate</span>
                <h3>Start from what you have — or start from nothing at all</h3>
                <ul className="feature-list">
                  <li><Check className="w-[18px] h-[18px] mt-[3px] text-emerald-400 shrink-0" /><span><b>Analyse &amp; Build My Offer</b> for a URL, PDF, or idea you already have.</span></li>
                  <li><Check className="w-[18px] h-[18px] mt-[3px] text-emerald-400 shrink-0" /><span><b>Build an Offer For Me</b> generates five validated offer ideas from your niche, audience, and price range.</span></li>
                  <li><Check className="w-[18px] h-[18px] mt-[3px] text-emerald-400 shrink-0" /><span>Every path lands in the same place: a complete Intelligence Report, ready in minutes.</span></li>
                </ul>
              </div>
              <div className="feature-media">
                <img src="https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=2055&auto=format&fit=crop" alt="OfferIQ offer choice gate" />
                <div className="media-caption">[ Screenshot: OfferIQ offer choice gate ]</div>
              </div>
            </div>

            <div className="feature-row reveal">
              <div className="feature-copy">
                <span className="feature-tag">03 · Copy Engine</span>
                <h3>Copy written in your buyer's exact words</h3>
                <ul className="feature-list">
                  <li><Check className="w-[18px] h-[18px] mt-[3px] text-emerald-400 shrink-0" /><span>Full funnel copy — <b>lead page, sales page (up to 12,000 words), upsell, downsell, thank-you</b> — generated from the Intelligence Report, not a template.</span></li>
                  <li><Check className="w-[18px] h-[18px] mt-[3px] text-emerald-400 shrink-0" /><span>Refine any section by chatting with the <b>OfferIQ Agent</b>: "make the problem section more specific to my audience."</span></li>
                  <li><Check className="w-[18px] h-[18px] mt-[3px] text-emerald-400 shrink-0" /><span>Inline editing on every section — <b>no copywriting experience required.</b></span></li>
                </ul>
              </div>
              <div className="feature-media">
                <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop" alt="OfferIQ landing experience" />
                <div className="media-caption">[ Screenshot: OfferIQ landing experience ]</div>
              </div>
            </div>

            <div className="feature-row reverse reveal">
              <div className="feature-copy">
                <span className="feature-tag">04 · Traffic Intelligence™ + Email Sequences</span>
                <h3>Know where to spend before you spend a dollar</h3>
                <ul className="feature-list">
                  <li><Check className="w-[18px] h-[18px] mt-[3px] text-emerald-400 shrink-0" /><span>A <b>platform priority matrix</b> ranks Meta, Google, and TikTok for your specific offer and audience.</span></li>
                  <li><Check className="w-[18px] h-[18px] mt-[3px] text-emerald-400 shrink-0" /><span>Ready-to-deploy <b>ad copy, a VSL script, and a UGC script</b> — written from the same persona data as your sales page.</span></li>
                  <li><Check className="w-[18px] h-[18px] mt-[3px] text-emerald-400 shrink-0" /><span>Five full <b>email sequences</b> — Lead Nurture, Launch, Re-engagement, Onboarding, Upsell — ready to connect to your leads.</span></li>
                </ul>
              </div>
              <div className="feature-media">
                <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" alt="Traffic Intelligence panel" />
                <div className="media-caption">[ Screenshot: Traffic Intelligence™ panel ]</div>
              </div>
            </div>
          </div>
        </section>


        <section className="section" id="vault">
          <div className="wrap">
            <div className="section-head center reveal">
              <span className="eyebrow center">Your Content Vault</span>
              <h2>Asset Bank &amp; Template Club</h2>
              <p>Two libraries built into every workspace: one generates your bonuses on demand, the other hands you proven templates so you're never starting from a blank page.</p>
            </div>
            <div className="vault-grid">
              <div className="vault-card asset-bank reveal">
                <span className="vault-badge"><Zap className="w-4 h-4 inline mr-2" /> Generated for your offer</span>
                <h3>Asset Bank</h3>
                <p className="vault-lede">The moment your Intelligence Report identifies a bonus or lead magnet worth building, it shows up here — pre-named, pre-described, ready to generate as a real, downloadable file.</p>
                <div className="mock-pdf-grid">
                  <div className="mock-pdf"><div className="icon"></div><div className="t">5-Day Positioning Checklist</div><span className="badge">Lead Magnet</span></div>
                  <div className="mock-pdf"><div className="icon"></div><div className="t">Pricing Swipe Templates</div><span className="badge">Core Bonus</span></div>
                  <div className="mock-pdf"><div className="icon"></div><div className="t">Launch Week Playbook</div><span className="badge">Fast-Action</span></div>
                </div>
                <ul className="vault-list">
                  <li><Check className="w-[15px] h-[15px] mt-[3px] text-violet-400 shrink-0" /><span><b>Auto-identified</b> the moment your Intelligence Report is ready — no manual setup.</span></li>
                  <li><Check className="w-[15px] h-[15px] mt-[3px] text-violet-400 shrink-0" /><span>Generated in <b>under 60 seconds</b>, written from your persona and pain-point data — not filler.</span></li>
                  <li><Check className="w-[15px] h-[15px] mt-[3px] text-violet-400 shrink-0" /><span>Three categories: <b>Lead Magnets, Core Bonuses, Fast-Action Bonuses</b> — each formatted and ready to attach.</span></li>
                </ul>
                <div className="vault-note">// Downloadable as formatted PDF, titled and structured, no extra design work.</div>
              </div>

              <div className="vault-card template-club reveal">
                <span className="vault-badge"><BookOpen className="w-4 h-4 inline mr-2" /> Curated &amp; proven</span>
                <h3>Template Club</h3>
                <p className="vault-lede">A growing library of page, email, and ad templates pulled from real converting offers in the 35,000+ funnel database — browse by niche or funnel type and apply a whole design direction in one click.</p>
                <div className="mock-template-grid">
                  <div className="mock-template"><div className="thumb"></div><div className="cap">Coaching Sales Page<span className="cat">Funnel</span></div></div>
                  <div className="mock-template"><div className="thumb"></div><div className="cap">Launch Email Set<span className="cat">Email</span></div></div>
                  <div className="mock-template"><div className="thumb"></div><div className="cap">UGC Ad Script<span className="cat">Traffic</span></div></div>
                </div>
                <ul className="vault-list">
                  <li><Check className="w-[15px] h-[15px] mt-[3px] text-violet-400 shrink-0" /><span>Browse templates by <b>niche, funnel type, or price point</b> instead of designing from a blank canvas.</span></li>
                  <li><Check className="w-[15px] h-[15px] mt-[3px] text-violet-400 shrink-0" /><span>One click applies a template's <b>full design direction</b> — layout, palette, and copy structure — to any page.</span></li>
                  <li><Check className="w-[15px] h-[15px] mt-[3px] text-violet-400 shrink-0" /><span>New templates added on an <b>ongoing basis</b> as new top-performing offers enter the database.</span></li>
                </ul>
                <div className="vault-note">// Included at every tier — Growth and Agency unlock expanded categories and earlier access to new drops.</div>
              </div>
            </div>
          </div>
        </section>



        <section className="section" id="story">
          <div className="wrap">
            <div className="section-head reveal">
              <span className="eyebrow">Illustrative Scenarios</span>
              <h2>Different starting points. Same result: live, same session.</h2>
              <p>Four representative buyer profiles — tap one to see how OfferIQ fits their specific situation.</p>
            </div>

            <div className="scenario-tabs reveal">
              {scenarios.map((sc, i) => (
                <button key={i} className={`scenario-tab ${activeScenario === i ? 'active' : ''}`} onClick={() => setActiveScenario(i)}>
                  {sc.icon}{sc.tab}
                </button>
              ))}
            </div>

            <div className="reveal in">
              <div className="scenario">
                <div>
                  <div className="scenario-persona">
                    <div className="avatar-placeholder">{s.avatarIcon}</div>
                    <div className="who"><b>{s.who}</b><span>{s.meta}</span></div>
                  </div>
                  <blockquote>{s.quote}</blockquote>
                  <p className="scenario-body">{s.body}</p>
                </div>
                <div className="scenario-stats">
                  {s.stats.map((st: any, i) => (
                    <div className="scenario-stat" key={i}>
                      <TrendingUp className="w-5 h-5 text-violet-400 shrink-0" />
                      <div>
                        {st.from && <div className="from">{st.from}</div>}
                        {st.to && <div className="to">{st.to}</div>}
                        {st.single && <div className="single">{st.single}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>


        <section className="section" id="compare">
          <div className="wrap">
            <div className="section-head center reveal">
              <span className="eyebrow center">Replace The Stack</span>
              <h2>What this replaces, per offer</h2>
              <p>Typical market rates for each role, sourced from standard freelance and SaaS pricing ranges — for reference, not a guarantee.</p>
            </div>
            <div className="table-scroll reveal">
              <table className="compare-table">
                <thead><tr><th>Capability</th><th>Typical Cost Elsewhere</th><th>In OfferIQ</th></tr></thead>
                <tbody>
                  <tr><td>Offer strategy &amp; positioning consultant</td><td className="cost-old">$2,000 – $10,000 / project</td><td className="cost-new"><Check className="w-4 h-4 inline mr-2" /> Included</td></tr>
                  <tr><td>Direct-response sales copywriter</td><td className="cost-old">$2,000 – $15,000 / page</td><td className="cost-new"><Check className="w-4 h-4 inline mr-2" /> Included</td></tr>
                  <tr><td>Landing page / funnel builder software</td><td className="cost-old">$99 – $297 / month</td><td className="cost-new"><Check className="w-4 h-4 inline mr-2" /> Included</td></tr>
                  <tr><td>Lead magnet &amp; bonus design + writing</td><td className="cost-old">$500 – $2,000 / asset</td><td className="cost-new"><Check className="w-4 h-4 inline mr-2" /> Included</td></tr>
                  <tr><td>Paid traffic / media buying strategist</td><td className="cost-old">$1,500 – $5,000 / month</td><td className="cost-new"><Check className="w-4 h-4 inline mr-2" /> Included</td></tr>
                  <tr><td>Email sequence writing &amp; tooling</td><td className="cost-old">$50 – $150 / month + writer fees</td><td className="cost-new"><Check className="w-4 h-4 inline mr-2" /> Included</td></tr>
                  <tr><td>CRM &amp; lead analytics tool</td><td className="cost-old">$50 – $300 / month</td><td className="cost-new"><Check className="w-4 h-4 inline mr-2" /> Included</td></tr>
                  <tr className="total"><td>Total to replicate manually, per offer</td><td className="cost-old">$21,000 – $172,000+</td><td className="cost-new">From $49, one-time</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>



        <section className="section" id="pricing">
          <div className="wrap">
            <div className="section-head center reveal">
              <span className="eyebrow center">Pricing</span>
              <h2>One payment. Your credits never expire.</h2>
              <p>This is not a subscription. Every tier is a fixed, lifetime pool of offer credits — no monthly bill, no renewal.</p>
            </div>
            <div className="pricing-grid">
              <div className="price-card reveal">
                <span className="price-tier">Starter</span>
                <div className="price-amount"><span className="num">$49</span><span className="period">one-time</span></div>
                <p className="price-sub">One-time. 5 offer credits, forever.</p>
                <ul className="price-features">
                  <li><Check className="w-[16px] h-[16px] mt-[3px] text-violet-400 shrink-0" /><span><b>5 offer credits</b> — yours forever, never expire</span></li>
                  <li><Check className="w-[16px] h-[16px] mt-[3px] text-violet-400 shrink-0" /><span>1 Workspace</span></li>
                  <li><Check className="w-[16px] h-[16px] mt-[3px] text-violet-400 shrink-0" /><span>Full 4-Phase Engine: Intelligence, Copy, Pages, Traffic</span></li>
                  <li><Check className="w-[16px] h-[16px] mt-[3px] text-violet-400 shrink-0" /><span>Asset Bank — lead magnets &amp; bonuses</span></li>
                  <li><Check className="w-[16px] h-[16px] mt-[3px] text-violet-400 shrink-0" /><span>Email Sequences</span></li>
                  <li><Check className="w-[16px] h-[16px] mt-[3px] text-violet-400 shrink-0" /><span>OfferIQ subdomain publishing</span></li>
                  <li><Check className="w-[16px] h-[16px] mt-[3px] text-violet-400 shrink-0" /><span>Payment &amp; Autoresponder integration</span></li>
                  <li><Check className="w-[16px] h-[16px] mt-[3px] text-violet-400 shrink-0" /><span>Standard support</span></li>
                </ul>
                <p className="price-best">Best for testing the platform and launching your first 1–3 offers.</p>
                <a href="/login" className="btn btn-ghost">Get Starter</a>
              </div>

              <div className="price-card popular reveal">
                <span className="popular-badge">Most Popular</span>
                <span className="price-tier">Growth</span>
                <div className="price-amount"><span className="num">$149</span><span className="period">one-time</span></div>
                <p className="price-sub">One-time. 10 offer credits, forever.</p>
                <ul className="price-features">
                  <li><Check className="w-[16px] h-[16px] mt-[3px] text-violet-400 shrink-0" /><span>Everything in Starter, plus:</span></li>
                  <li><Check className="w-[16px] h-[16px] mt-[3px] text-violet-400 shrink-0" /><span><b>10 offer credits</b> — yours forever, never expire</span></li>
                  <li><Check className="w-[16px] h-[16px] mt-[3px] text-violet-400 shrink-0" /><span>3 Workspaces</span></li>
                  <li><Check className="w-[16px] h-[16px] mt-[3px] text-violet-400 shrink-0" /><span>5 Team member seats</span></li>
                  <li><Check className="w-[16px] h-[16px] mt-[3px] text-violet-400 shrink-0" /><span>Remove "Built with OfferIQ" branding</span></li>
                  <li><Check className="w-[16px] h-[16px] mt-[3px] text-violet-400 shrink-0" /><span>Advanced Analytics dashboard</span></li>
                  <li><Check className="w-[16px] h-[16px] mt-[3px] text-violet-400 shrink-0" /><span>Custom domain connection</span></li>
                  <li><Check className="w-[16px] h-[16px] mt-[3px] text-violet-400 shrink-0" /><span>Pixel tracking embed</span></li>
                  <li><Check className="w-[16px] h-[16px] mt-[3px] text-violet-400 shrink-0" /><span>Priority support</span></li>
                </ul>
                <p className="price-best">Best for active creators running multiple offers or brands.</p>
                <a href="/login" className="btn btn-primary">Get Growth</a>
              </div>

              <div className="price-card reveal">
                <span className="price-tier">Agency</span>
                <div className="price-amount"><span className="num">$497</span><span className="period">one-time</span></div>
                <p className="price-sub">One-time. 30 offer credits, forever.</p>
                <ul className="price-features">
                  <li><Check className="w-[16px] h-[16px] mt-[3px] text-violet-400 shrink-0" /><span>Everything in Growth, plus:</span></li>
                  <li><Check className="w-[16px] h-[16px] mt-[3px] text-violet-400 shrink-0" /><span><b>30 offer credits</b> — yours forever, never expire</span></li>
                  <li><Check className="w-[16px] h-[16px] mt-[3px] text-violet-400 shrink-0" /><span>Unlimited Workspaces</span></li>
                  <li><Check className="w-[16px] h-[16px] mt-[3px] text-violet-400 shrink-0" /><span>10 Team member seats</span></li>
                  <li><Check className="w-[16px] h-[16px] mt-[3px] text-violet-400 shrink-0" /><span>20 client sub-accounts for agency delivery</span></li>
                  <li><Check className="w-[16px] h-[16px] mt-[3px] text-violet-400 shrink-0" /><span>Agency asset pack — proposals &amp; branded covers</span></li>
                  <li><Check className="w-[16px] h-[16px] mt-[3px] text-violet-400 shrink-0" /><span>Done-For-You onboarding session</span></li>
                  <li><Check className="w-[16px] h-[16px] mt-[3px] text-violet-400 shrink-0" /><span>Dedicated priority support channel</span></li>
                </ul>
                <p className="price-best">Best for agencies and consultants delivering offer strategy as a service.</p>
                <a href="/login" className="btn btn-ghost">Get Agency</a>
              </div>
            </div>

            <div className="guarantee-strip reveal">
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Backed by a 60-day money-back guarantee. If OfferIQ isn't right for you, get a full refund — no conditions.</span>
            </div>
            <p className="fomo-note">// Additional offer credits available at $10/each after your pool is used. Codes stack up to 3× per tier. Lifetime one-time pricing like this doesn't outlast standard SaaS pricing forever.</p>
          </div>
        </section>


        <section className="section" id="faq">
          <div className="wrap">
            <div className="section-head center reveal">
              <span className="eyebrow center">Questions</span>
              <h2>Frequently asked questions</h2>
            </div>
            <div className="faq-list reveal in" style={{ "maxWidth": "760px", "margin": "0 auto" }}>
              {faqs.map((f, i) => (
                <FaqItem key={i} q={f.q} a={f.a} isOpen={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)} />
              ))}
            </div>
          </div>
        </section>


        <section className="section" id="cta">
          <div className="wrap">
            <div className="final-cta reveal">
              <span className="eyebrow center">Ready When You Are</span>
              <h2>Your next offer is one prompt away.</h2>
              <p>Every month without a validated offer is a month of revenue you don't make. OfferIQ closes the gap between idea and income — in one session.</p>
              <div className="final-cta-row">
                <a href="/login" className="btn btn-primary">Analyse My Offer
                  <ArrowRight className="icon-inline w-4 h-4" />
                </a>
                <a href="/login" className="btn btn-ghost">See Pricing</a>
              </div>
              <p className="final-urgency">// Lifetime one-time pricing on infrastructure like this doesn't stay open forever.</p>
            </div>
          </div>
        </section>


        <footer>
          <div className="wrap">
            <div className="footer-top">
              <div className="footer-brand">
                <div className="nav-logo"><div className="mark"></div>OfferIQ</div>
                <p>The intelligence layer that should happen before anything gets built — delivered instantly, and connected directly to the copy, pages, and traffic plan that follow from it.</p>
                <div className="badge-row" style={{ "marginTop": "18px", }}>
                  <span className="integration-pill"><CreditCard className="w-4 h-4 inline mr-2" /> Stripe</span>
                  <span className="integration-pill"><CreditCard className="w-4 h-4 inline mr-2" /> PayPal</span>
                  <span className="integration-pill"><Megaphone className="w-4 h-4 inline mr-2" /> Meta Ads</span>
                  <span className="integration-pill"><Music className="w-4 h-4 inline mr-2" /> TikTok</span>
                </div>
              </div>
              <div className="footer-cols">
                <div className="footer-col">
                  <h5>Product</h5>
                  <a href="#showcase">Feature Showcase</a>
                  <a href="#vault">Asset Bank &amp; Templates</a>
                  <a href="/login">Pricing</a>
                </div>
                <div className="footer-col">
                  <h5>Company</h5>
                  <a href="help.ofiq.app">Knowledge base</a>
                  <a href="mailto:help@ofiq.app">Contact Support</a>
                  <a href="#faq">FAQ</a>
                </div>
                <div className="footer-col">
                  <h5>Legal</h5>
                  <a href="#">Terms of Service</a>
                  <a href="#">Privacy Policy</a>
                  <a href="#">Refund Policy</a>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <span>© 2026 OfferIQ, a Chigisoft product. All rights reserved.</span>
              <span>Built for creators who'd rather launch than guess.</span>
            </div>
          </div>
        </footer>

        <div className="mobile-cta">
          <a href="/login" className="btn btn-primary">Start Building →</a>
        </div>



      </div>
    </div>
  );
}
