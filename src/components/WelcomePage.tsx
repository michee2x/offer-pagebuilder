
'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Link as LinkIcon, FileText, PenTool, Target, Users, DollarSign, Zap, BookOpen, GraduationCap, Building, Sprout, Check, CreditCard, Megaphone, Music } from 'lucide-react';
import '../app/welcome.css';

export function WelcomePage() {
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
            (other.querySelector('.faq-q') as HTMLElement).setAttribute('aria-expanded','false');
          });
          if (!isOpen) {
            item.classList.add('open');
            panel.style.maxHeight = inner.scrollHeight + 'px';
            btn.setAttribute('aria-expanded','true');
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
        <svg className="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
      </a>
    </div>
  </div>
</nav>


<header className="hero">
  <div className="wrap hero-grid">
    <div className="hero-copy">
      <span className="eyebrow">Intelligence-First Offer OS</span>
      <h1>Every offer starts with intelligence.<br/>Yours starts <span className="grad-text">today.</span></h1>
      <p className="lede">
        Upload a URL, a PDF, or a single idea. OfferIQ analyzes it against 35,000+ real converting
        offers and hands you the complete revenue system: strategy, copy, a live funnel, and a
        traffic plan — built in one session.
      </p>
      <div className="hero-cta-row">
        <a href="/login" className="btn btn-primary">Analyse My Offer
          <svg className="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        </a>
        <a href="/login" className="btn btn-ghost">Build One For Me</a>
      </div>
      <p className="hero-micro">// No design or copywriting experience required. Cancel anytime.</p>
    </div>
    <div className="hero-visual">
      <div className="browser-frame">
        <div className="browser-bar"><span></span><span></span><span></span><div className="url">ofiq.app</div></div>
        <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop" alt="OfferIQ workspace dashboard" />
      </div>
      <div className="float-card float-score">
        <div className="score-ring"></div>
        <div><div className="label">Funnel Health</div><div className="value">Ready to launch</div></div>
      </div>
      <div className="float-card float-pulse">
        <span className="pulse-dot"></span><span className="txt">Intelligence Report: <b>Complete</b></span>
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
      <h2>You don't have a launch problem.<br/>You have a strategy problem.</h2>
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
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span><b>Live Tracking</b> starts the moment your workspace is created — views, visitors, and conversion rate update automatically.</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>A running <b>Funnel Health Score</b> gives you one number for how launch-ready your offer really is.</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span><b>Global Traffic Distribution</b> maps where your visitors are actually coming from, by region.</span></li>
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
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span><b>Analyse &amp; Build My Offer</b> for a URL, PDF, or idea you already have.</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span><b>Build an Offer For Me</b> generates five validated offer ideas from your niche, audience, and price range.</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>Every path lands in the same place: a complete Intelligence Report, ready in minutes.</span></li>
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
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>Full funnel copy — <b>lead page, sales page (up to 12,000 words), upsell, downsell, thank-you</b> — generated from the Intelligence Report, not a template.</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>Refine any section by chatting with the <b>OfferIQ Agent</b>: "make the problem section more specific to my audience."</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>Inline editing on every section — <b>no copywriting experience required.</b></span></li>
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
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>A <b>platform priority matrix</b> ranks Meta, Google, and TikTok for your specific offer and audience.</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>Ready-to-deploy <b>ad copy, a VSL script, and a UGC script</b> — written from the same persona data as your sales page.</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>Five full <b>email sequences</b> — Lead Nurture, Launch, Re-engagement, Onboarding, Upsell — ready to connect to your leads.</span></li>
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
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span><b>Auto-identified</b> the moment your Intelligence Report is ready — no manual setup.</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>Generated in <b>under 60 seconds</b>, written from your persona and pain-point data — not filler.</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>Three categories: <b>Lead Magnets, Core Bonuses, Fast-Action Bonuses</b> — each formatted and ready to attach.</span></li>
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
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>Browse templates by <b>niche, funnel type, or price point</b> instead of designing from a blank canvas.</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>One click applies a template's <b>full design direction</b> — layout, palette, and copy structure — to any page.</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>New templates added on an <b>ongoing basis</b> as new top-performing offers enter the database.</span></li>
        </ul>
        <div className="vault-note">// Included at every tier — Growth and Agency unlock expanded categories and earlier access to new drops.</div>
      </div>
    </div>
  </div>
</section>


<section className="section" id="demo">
  <div className="wrap">
    <div className="section-head center reveal">
      <span className="eyebrow center">See It Live</span>
      <h2>Watch OfferIQ build a complete offer, start to finish</h2>
      <p>One idea in. A live, payment-enabled funnel out. Real time, no cuts.</p>
    </div>
    <div className="video-shell reveal">
      <button className="play-btn" aria-label="Play demo video">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </button>
      <span className="video-duration">4:12</span>
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

    <div className="scenario-tabs reveal" id="scenarioTabs">
      <button className="scenario-tab active" data-scenario="0"><GraduationCap className="w-4 h-4 inline mr-2" /> Course Creator</button>
      <button className="scenario-tab" data-scenario="1"><Target className="w-4 h-4 mr-2 inline" /> Business Coach</button>
      <button className="scenario-tab" data-scenario="2"><Building className="w-4 h-4 inline mr-2" /> Agency Owner</button>
      <button className="scenario-tab" data-scenario="3"><Sprout className="w-4 h-4 inline mr-2" /> First-Time Entrepreneur</button>
    </div>

    <div className="reveal" id="storyPanel"></div>
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


<section className="section" id="calculator">
  <div className="wrap">
    <div className="section-head center reveal">
      <span className="eyebrow center">Do The Math</span>
      <h2>What would this cost you to build manually?</h2>
      <p>Drag the slider to your actual launch plan for the year.</p>
    </div>
    <div className="calc reveal">
      <div>
        <div className="calc-slider-label"><span>Offers you want to launch this year</span><b id="offerCount">5</b></div>
        <input type="range" min="1" max="30" value="5" id="offerSlider" />
        <p style={{"marginTop": "22px", "fontSize": "13.5px", "color": "var(--text-faint)", }}>Based on a conservative blended estimate of $8,000 per offer for a strategist, copywriter, designer, and media buyer working separately.</p>
      </div>
      <div className="calc-result">
        <div className="calc-line old"><span className="l">Hiring it out</span><span className="v" id="manualCost">$40,000</span></div>
        <div className="calc-line new"><span className="l">With OfferIQ</span><span className="v" id="iqCost">$49</span></div>
        <div className="calc-save"><b id="savedAmount">$39,951 saved</b><span id="savedLabel">Across 5 offers this year</span></div>
      </div>
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
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span><b>5 offer credits</b> — yours forever, never expire</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>1 Workspace</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>Full 4-Phase Engine: Intelligence, Copy, Pages, Traffic</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>Asset Bank — lead magnets &amp; bonuses</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>Email Sequences</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>OfferIQ subdomain publishing</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>Payment &amp; Autoresponder integration</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>Standard support</span></li>
        </ul>
        <p className="price-best">Best for testing the platform and launching your first 1–3 offers.</p>
        <a href="/login" className="btn btn-ghost" style={{"justifyContent": "center", }}>Get Starter</a>
      </div>

      <div className="price-card popular reveal">
        <span className="popular-badge">Most Popular</span>
        <span className="price-tier">Growth</span>
        <div className="price-amount"><span className="num">$149</span><span className="period">one-time</span></div>
        <p className="price-sub">One-time. 10 offer credits, forever.</p>
        <ul className="price-features">
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>Everything in Starter, plus:</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span><b>10 offer credits</b> — yours forever, never expire</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>3 Workspaces</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>5 Team member seats</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>Remove "Built with OfferIQ" branding</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>Advanced Analytics dashboard</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>Custom domain connection</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>Pixel tracking embed</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>Priority support</span></li>
        </ul>
        <p className="price-best">Best for active creators running multiple offers or brands.</p>
        <a href="/login" className="btn btn-primary" style={{"justifyContent": "center", }}>Get Growth</a>
      </div>

      <div className="price-card reveal">
        <span className="price-tier">Agency</span>
        <div className="price-amount"><span className="num">$497</span><span className="period">one-time</span></div>
        <p className="price-sub">One-time. 30 offer credits, forever.</p>
        <ul className="price-features">
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>Everything in Growth, plus:</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span><b>30 offer credits</b> — yours forever, never expire</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>Unlimited Workspaces</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>10 Team member seats</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>20 client sub-accounts for agency delivery</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>Agency asset pack — proposals &amp; branded covers</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>Done-For-You onboarding session</span></li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>Dedicated priority support channel</span></li>
        </ul>
        <p className="price-best">Best for agencies and consultants delivering offer strategy as a service.</p>
        <a href="/login" className="btn btn-ghost" style={{"justifyContent": "center", }}>Get Agency</a>
      </div>
    </div>

    <div className="guarantee-strip reveal">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"/></svg>
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
    <div className="faq-list reveal" style={{"maxWidth": "760px", "margin": "0 auto", }} id="faqList"></div>
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
          <svg className="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
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
        <div className="badge-row" style={{"marginTop": "18px", }}>
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
          <a href="#">About Chigisoft</a>
          <a href="#">Contact Support</a>
          <a href="/login">FAQ</a>
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
