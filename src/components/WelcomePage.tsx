'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Link as LinkIcon, FileText, PenTool, Target, Users, DollarSign, Zap, BookOpen, GraduationCap, Building, Sprout, Check, CreditCard, Megaphone, Music, ArrowRight, Play, TrendingUp, Shield, Compass, Layers, Package, Palette, Rocket } from 'lucide-react';
import '../app/welcome.css';

function FaqItem({ q, a, isOpen, onClick }: { q: string, a: string, isOpen: boolean, onClick: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className={`faq-item ${isOpen ? 'open' : ''}`}>
      <button className="faq-q" onClick={onClick} aria-expanded={isOpen}>
        <span>{q}</span>
        <span className="plus"></span>
      </button>
      <div className="faq-a" style={{ maxHeight: isOpen ? (ref.current ? ref.current.scrollHeight + 'px' : '400px') : '0px' }}>
        <div className="faq-a-inner" ref={ref}>{a}</div>
      </div>
    </div>
  );
}

export function WelcomePage() {
  const [activeScenario, setActiveScenario] = useState(0);
  const [offers, setOffers] = useState(5);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const whyCards = [
    { icon: <Compass />, tag: "The “Blank Canvas” Trap", stat: "42%", body: "of startups fail simply because they build products with absolutely no market need — chasing demand that was never there until the cash runs out.", src: "— Vincent, Founder of Preuve AI" },
    { icon: <DollarSign />, tag: "The Pricing Trap", stat: "18%", body: "of startups collapse due to flawed pricing models — charging too much for the market to bear, or too little to sustain operations.", src: "— ideaproof.io" },
    { icon: <TrendingUp />, tag: "The “Acquisition Cost” Trap", stat: "222%+", body: "is how far Customer Acquisition Costs have climbed. Hyper-expensive clicks sent to a slow, pieced-together funnel bleed profit dry before the first sale.", src: "— ProfitWell / Paddle" },
  ];

  const scenarios = [
    {
      emoji: "🎓", tab: "Course Creator", who: "Marketing Consultant", meta: "34 · Austin, TX · 14K Instagram followers",
      quote: <>"I'd researched competitors, taken two copywriting courses, and paid $800 for a coach call. <span className="accent">I still had nothing live.</span>"</>,
      body: "She uploaded her course idea as a text description. In under a minute, OfferIQ returned her exact persona, a price point $300 higher than she'd planned to charge, five conversion hooks, and a full funnel blueprint — then wrote and built the entire funnel in the same session.",
      stats: [
        { from: "6 months stuck", to: "Live in one evening" },
        { from: "$197 planned price", to: "$497 recommended price" },
        { single: "5 pages + funnel — written, designed, and published in one session" },
      ]
    },
    {
      emoji: "🎤", tab: "Business Coach", who: "Executive Life Coach", meta: "41 · Atlanta, GA · $3,500 program",
      quote: <>"I knew the problem was in the messaging. <span className="accent">I just couldn't see what was wrong with it.</span>"</>,
      body: "She pasted her existing sales page URL into OfferIQ. The Intelligence Report found the real problem in seconds: her page led with a 12-step curriculum, but her buyer purchases from identity anxiety — they want to stop feeling behind, not learn a curriculum. OfferIQ rewrote the copy around that insight and raised her price to $4,500.",
      stats: [
        { from: "0.7% conversion", to: "2.5%+ projected, same ad budget" },
        { from: "$9,600 spent, unprofitable", to: "Profitable within 30 days (projected)" },
        { from: "$3,500 price", to: "$4,500 pricing correction" },
      ]
    },
    {
      emoji: "🏢", tab: "Agency Owner", who: "Digital Marketing Agency Owner", meta: "38 · Denver, CO · 6-person team",
      quote: <>"Every new service means a new hiring decision. <span className="accent">I couldn't productize this without a repeatable system.</span>"</>,
      body: "He wanted to add offer strategy and funnel building as a $3,000–$5,000 productized service, without hiring. He now runs each client's offer through OfferIQ — intelligence report, copy, and funnel delivered as a packaged deliverable. What took his team three weeks now takes two hours.",
      stats: [
        { from: "3 weeks per client", to: "2 hours per client" },
        { single: "$15,000–$30,000/month projected new service-line revenue" },
        { single: "Zero new hires required to deliver it" },
      ]
    },
    {
      emoji: "🌱", tab: "First-Time Entrepreneur", who: "Corporate HR Professional", meta: "29 · Chicago, IL · 8 yrs experience",
      quote: <>"I knew I had teachable expertise. <span className="accent">I had no idea what to build, or where to start.</span>"</>,
      body: "She had 18 months of “how to launch a course” content behind her and nothing live. She selected “Build an Offer For Me,” entered her niche and audience, and received five validated offer ideas. She picked “The 90-Day People Ops Accelerator” at $997 — OfferIQ built the full intelligence report and funnel for it in the same session.",
      stats: [
        { from: "18 months, no product", to: "Live funnel in under 3 hours" },
        { single: "5 validated offer ideas generated from niche + audience + price range" },
        { single: "$997 price point — market-tested, not guessed" },
      ]
    },
  ];
  const s = scenarios[activeScenario];

  const compareRows = [
    ["Offer strategy & positioning consultant", "$2,000 – $10,000 / project"],
    ["Direct-response sales copywriter", "$2,000 – $15,000 / page"],
    ["Landing page / funnel builder software", "$99 – $297 / month"],
    ["Lead magnet & bonus design + writing", "$500 – $2,000 / asset"],
    ["Paid traffic / media buying strategist", "$1,500 – $5,000 / month"],
    ["Email sequence writing & tooling", "$50 – $150 / month + writer fees"],
    ["CRM & lead analytics tool", "$50 – $300 / month"],
  ];

  const faqs = [
    { q: "Is OfferIQ a subscription, or a one-time purchase?", a: "Both structures exist, by tier. Starter and Growth are monthly subscriptions — you're billed each month and can cancel anytime from your account. Agency is a single one-time payment with credits that never expire. Pick whichever fits how you plan to use the platform." },
    { q: "How does the $1 trial work, exactly?", a: "You get full access to the Starter plan for 7 days for $1. If you don't cancel before day 7, your card is billed the standard $39/mo rate and your subscription continues month to month. You can cancel anytime, including during the trial, with no further charge." },
    { q: "Do unused offer credits roll over to the next month?", a: "No. Starter and Growth credits refresh monthly and reset at the start of each new billing cycle — unused credits don't carry over. If you consistently need more than your plan's monthly allowance, Growth or a credit top-up is the better fit. Agency credits work differently: they're a fixed pool that never expires and never refreshes, because they're paid for once." },
    { q: "What happens to my published funnels if I cancel my subscription?", a: "Your funnels are taken offline when your subscription ends, since active publishing and hosting are part of what your monthly plan pays for. Your underlying data — copy, reports, and assets — stays accessible in your account for a limited window so you can export it or reactivate later, but live pages stop serving until you resubscribe." },
    { q: "What happens when I run out of credits partway through the month?", a: "Your existing offers, pages, and data remain fully accessible — nothing is taken away. To build additional new offers before your next refresh, you can purchase additional credit packs for $10 per credit; one credit builds one complete offer (Intelligence Report + Copy + Pages + Traffic Strategy + Asset Bank)." },
    { q: "Can I upgrade or downgrade my plan later?", a: "Yes. You can upgrade to a higher tier at any time by paying the price difference for the remainder of your billing cycle. Downgrades take effect at your next renewal date, so you keep your current plan's benefits until then." },
    { q: "Is there a refund policy?", a: "Yes — a 30-day money-back guarantee applies to every tier, including Agency. If OfferIQ isn't right for you, request a full refund within 30 days of your purchase, no conditions." },
    { q: "Does OfferIQ work outside the US?", a: "Yes. OfferIQ supports multiple currencies and target countries in the offer creation process, with additional payment integrations (Paystack, Flutterwave) on the roadmap for broader regional support." },
    { q: "What if I run an agency and need more than 30 client sub-accounts?", a: "Contact support after purchase — additional sub-account packs are available for agencies scaling beyond the Agency tier's built-in allocation." },
  ];

  const pricingTiers = [
    {
      name: "Starter", price: "$39", period: "/mo", sub: "$1 for your first 7 days, then $39/mo. Cancel anytime.",
      features: ["<b>5 offer credits</b> — refreshed monthly", "1 Workspace", "Full 4-Phase Engine: Intelligence, Copy, Pages, Traffic", "Asset Bank + Template Club access", "Email Sequences", "OfferIQ subdomain publishing", "Payment & Autoresponder integration", "Standard support"],
      best: "Best for testing the platform and launching your first 1–3 offers.",
      popular: false, cta: "Start Your $1 Trial"
    },
    {
      name: "Growth", price: "$69", period: "/mo", sub: "Billed monthly. Cancel anytime.",
      features: ["Everything in Starter, plus:", "<b>10 offer credits</b> — refreshed monthly", "3 Workspaces", "Remove “Built with OfferIQ” branding", "Advanced Analytics dashboard", "Custom domain connection", "Pixel tracking embed", "Priority support"],
      best: "Best for active creators running multiple offers or brands.",
      popular: true, cta: "Get Growth"
    },
    {
      name: "Agency", price: "$179", period: "one-time", sub: "A single payment — not a subscription.",
      features: ["Everything in Growth, plus:", "<b>30 offer credits</b> — yours forever, never expire", "30 Workspaces", "30 client sub-accounts for agency delivery", "Agency asset pack — proposals & branded covers", "Done-For-You onboarding session", "Dedicated priority support channel"],
      best: "Best for agencies and consultants delivering offer strategy as a service.",
      popular: false, cta: "Get Agency"
    },
  ];

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

  const manualCostPerOffer = 8000;
  const starterAnnual = 39 * 12;
  const growthAnnual = 69 * 12;
  const manualTotal = offers * manualCostPerOffer;
  const iqTotal = offers <= 60 ? starterAnnual : growthAnnual;
  const savings = manualTotal - iqTotal;
  const fmt = (n: number) => "$" + n.toLocaleString();

  return (
    <div className="welcome-page-html">
      <div className="welcome-page">
        {/* EXISTING NAV */}
        <nav className="nav" id="nav">
          <div className="wrap">
            <div className="nav-logo"><div className="mark"></div>OfferIQ</div>
            <div className="nav-links">
              <a href="#showcase">Product</a>
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

        {/* EXISTING HERO */}
        <header className="hero">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Intelligence-First Offer OS</span>
              <h1>Stop guessing what sells.<br />Engineer an offer that <span className="grad-text">does.</span></h1>
              <p className="lede">
                Upload a URL, a PDF, or a single idea. OfferIQ analyzes it against 35,000+ real converting offers and hands you the complete revenue system: strategy, copy, a live funnel, and a traffic plan — built in one session
              </p>
              <div className="hero-cta-row">
                <a href="/login" className="btn btn-primary">Build My Next Offer
                  <ArrowRight className="icon-inline w-4 h-4" />
                </a>
                <a href="/login" className="btn btn-ghost">Start Your $1 Trial</a>
              </div>
              <p className="hero-micro">// $1 for your first 7 days, then $39/mo. Cancel anytime. <br />
                // No copywriting or design experience required. 30-day money-back guarantee..</p>
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

        {/* CLONED SECTIONS BEGIN */}

        <section className="section" id="why">
          <div className="wrap">
            <div className="reveal">
              <div className="section-head center">
                <span className="eyebrow">Why This Matters Right Now</span>
                <h2>Three traps quietly kill every offer<br/>before it has a chance to sell.</h2>
              </div>
            </div>
            <div className="why-grid">
              {whyCards.map((c, i) => (
                <div className="reveal" key={i}>
                  <div className="why-card">
                    <div className="why-icon">{c.icon}</div>
                    <span className="tag">{c.tag}</span>
                    <div className="stat">{c.stat}</div>
                    <p>{c.body}</p>
                    <span className="src">{c.src}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="reveal">
              <p className="why-close">OfferIQ is the end of trial-and-error marketing. <span className="accent">We replace the guesswork with a data-backed blueprint.</span></p>
            </div>
          </div>
        </section>

        <section className="section" id="gate">
          <div className="wrap">
            <div className="reveal">
              <div className="section-head center">
                <span className="eyebrow">Two Ways In</span>
                <h2>Tell OfferIQ where you're starting from.</h2>
                <p>There's no wrong entry point — just the one that matches what you already have.</p>
              </div>
            </div>
            <div className="gate-grid">
              <div className="reveal">
                <div className="gate-card">
                  <div className="gate-icon"><LinkIcon className="w-6 h-6 text-white"/></div>
                  <span className="gate-index">01 / HAVE AN OFFER</span>
                  <h3>Analyse &amp; Build My Offer</h3>
                  <p>You already have an offer, a live page, or a rough idea. Paste a URL, upload a PDF, or describe it in your own words — OfferIQ builds the complete intelligence report, copy, and funnel around what you already have.</p>
                  <div className="gate-inputs">
                    <span className="chip"><LinkIcon className="w-4 h-4"/> Paste a URL</span>
                    <span className="chip"><FileText className="w-4 h-4"/> Upload a PDF</span>
                    <span className="chip"><PenTool className="w-4 h-4"/> Describe it</span>
                  </div>
                  <a href="/login" className="btn btn-ghost btn-sm">Start here <ArrowRight className="w-4 h-4"/></a>
                </div>
              </div>
              <div className="reveal">
                <div className="gate-card">
                  <div className="gate-icon"><Target className="w-6 h-6 text-white"/></div>
                  <span className="gate-index">02 / NO OFFER YET</span>
                  <h3>Build an Offer For Me</h3>
                  <p>You have an audience and expertise, but no product. Give OfferIQ your niche, audience, and price range — get validated offer ideas benchmarked against real converting funnels, ready to build the moment you pick one.</p>
                  <div className="gate-inputs">
                    <span className="chip"><Target className="w-4 h-4"/> Pick a niche</span>
                    <span className="chip"><Users className="w-4 h-4"/> Define your buyer</span>
                    <span className="chip"><DollarSign className="w-4 h-4"/> Set a price range</span>
                  </div>
                  <a href="/login" className="btn btn-ghost btn-sm">Start here <ArrowRight className="w-4 h-4"/></a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="how-it-works">
          <div className="wrap">
            <div className="reveal">
              <div className="section-head">
                <span className="eyebrow">From Idea To Live Funnel</span>
                <h2>The average user goes from first login to a live, payment-enabled funnel in under 30 minutes.</h2>
                <p className="tl-foot">For a returning user building their second or third offer, it takes under 15.</p>
              </div>
            </div>
            <div className="timeline">
              {[
                { t: "Intelligence Report", time: "~4 min", d: "Your offer is analyzed against 35,000+ validated funnels — positioning, persona, pricing, hooks, and a full funnel blueprint come back specific to you." },
                { t: "Copy Engine", time: "~2 min", d: "Lead page, long-form sales page, upsell, downsell, and thank-you copy — written from the intelligence report, in your buyer's exact vocabulary." },
                { t: "Page Builder", time: "~5 min", d: "Every page assembles automatically using your design direction. Edit inline, or tell the AI copilot what to change in plain language." },
                { t: "Traffic Intelligence™ & Email", time: "~4 min", d: "A platform priority matrix, ready-to-deploy ad copy, a VSL script, a UGC script, and full email sequences — before you spend a dollar on ads." },
                { t: "Publish & Go Live", time: "instant", d: "Connect a domain, connect Stripe or PayPal, and deploy. Your funnel is public and payment-enabled." },
              ].map((s, i) => (
                <div className="reveal" key={i}>
                  <div className="tl-item">
                    <div className="tl-num">{String(i + 1).padStart(2, '0')}</div>
                    <div className="tl-body">
                      <div>
                        <h4>{s.t}</h4>
                        <p>{s.d}</p>
                      </div>
                      <span className="tl-time">{s.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="showcase">
          <div className="wrap">
            <div className="reveal">
              <div className="section-head center">
                <span className="eyebrow">Product Showcase</span>
                <h2>One workspace. Every phase of the offer, connected.</h2>
                <p>Each phase reads the one before it — nothing here is generic, because none of it is generated in isolation.</p>
              </div>
            </div>

            <div className="reveal">
              <div className="feature-row">
                <div className="feature-copy">
                  <span className="feature-tag"><Compass className="w-4 h-4 inline mr-2" /> 01 · Choice Gate</span>
                  <h3>Start from what you have — or start from nothing at all</h3>
                  <ul className="feature-list">
                    <li><Check className="w-5 h-5 mt-0.5 text-emerald-400 shrink-0" /><span dangerouslySetInnerHTML={{ __html: "<b>Analyse &amp; Build My Offer</b> for a URL, PDF, or idea you already have." }} /></li>
                    <li><Check className="w-5 h-5 mt-0.5 text-emerald-400 shrink-0" /><span dangerouslySetInnerHTML={{ __html: "<b>Build an Offer For Me</b> generates validated offer ideas from your niche, audience, and price range." }} /></li>
                    <li><Check className="w-5 h-5 mt-0.5 text-emerald-400 shrink-0" /><span dangerouslySetInnerHTML={{ __html: "Every path lands in the same place: a complete Intelligence Report, ready in minutes." }} /></li>
                  </ul>
                </div>
                <div className="feature-media">
                  <div className="mock-report">
                    <div className="mock-report-top">
                      <div className="mock-report-title">Choice Gate<span>Two entry points, one report</span></div>
                    </div>
                    <div className="mock-rows">
                      <div className="mock-row"><span className="dot"></span>URL analysed <b>ofiq-demo.com</b><span className="pct">✓</span></div>
                      <div className="mock-row"><span className="dot"></span>Niche selected <b>Online Coaching</b><span className="pct">✓</span></div>
                      <div className="mock-row"><span className="dot pending"></span>Report compiling <b>16 sections</b><span className="pct">76%</span></div>
                    </div>
                  </div>
                  <div className="media-caption">[ Illustration: OfferIQ choice gate → intelligence report ]</div>
                </div>
              </div>
            </div>

            <div className="reveal">
              <div className="feature-row reverse">
                <div className="feature-copy">
                  <span className="feature-tag"><PenTool className="w-4 h-4 inline mr-2" /> 02 · Copy and Pages Built From Your Data</span>
                  <h3>Copy and pages built from your data, not a template</h3>
                  <ul className="feature-list">
                    <li><Check className="w-5 h-5 mt-0.5 text-emerald-400 shrink-0" /><span dangerouslySetInnerHTML={{ __html: "Every word is written from your <b>Intelligence Report</b> — not a generic swipe file, so your copy actually speaks to your specific buyer." }} /></li>
                    <li><Check className="w-5 h-5 mt-0.5 text-emerald-400 shrink-0" /><span dangerouslySetInnerHTML={{ __html: "Full funnel copy in one pass: <b>Lead Capture, Long-Form Sales Page (up to 12,000 words), Upsell, Downsell, and Thank You pages.</b>" }} /></li>
                    <li><Check className="w-5 h-5 mt-0.5 text-emerald-400 shrink-0" /><span dangerouslySetInnerHTML={{ __html: "Pages assemble themselves — colors, fonts, and layout pulled straight from your <b>Design Intelligence</b>, no design decisions left to guess at." }} /></li>
                    <li><Check className="w-5 h-5 mt-0.5 text-emerald-400 shrink-0" /><span dangerouslySetInnerHTML={{ __html: "Refine anything by chatting — tell the built-in <b>AI copilot</b> “make this headline punchier” and watch it update in real time." }} /></li>
                    <li><Check className="w-5 h-5 mt-0.5 text-emerald-400 shrink-0" /><span dangerouslySetInnerHTML={{ __html: "Drag-and-drop when you want manual control — reorder sections, swap images, edit inline." }} /></li>
                  </ul>
                </div>
                <div className="feature-media">
                  <div className="mock-copy">
                    <div className="mock-copy-line" style={{ width: '88%' }}></div>
                    <div className="mock-copy-line" style={{ width: '100%' }}></div>
                    <div className="mock-copy-line" style={{ width: '64%' }}></div>
                    <div style={{ height: 16 }}></div>
                    <div className="mock-copy-line" style={{ width: '92%' }}></div>
                    <div className="mock-copy-line" style={{ width: '40%' }}></div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-faint)', marginTop: 14 }}>Writing downsell copy<span className="mock-copy-caret"></span></p>
                  </div>
                  <div className="media-caption">[ Illustration: Copy Engine writing live from your Intelligence Report ]</div>
                </div>
              </div>
            </div>

            <div className="reveal">
              <div className="feature-row">
                <div className="feature-copy">
                  <span className="feature-tag"><Rocket className="w-4 h-4 inline mr-2" /> 03 · Launch-Ready Assets, Live Pages, Real Analytics</span>
                  <h3>Launch-ready assets, live pages, and real analytics</h3>
                  <ul className="feature-list">
                    <li><Check className="w-5 h-5 mt-0.5 text-emerald-400 shrink-0" /><span dangerouslySetInnerHTML={{ __html: "<b>One-click publishing</b> — go live on an OfferIQ subdomain or connect your own custom domain." }} /></li>
                    <li><Check className="w-5 h-5 mt-0.5 text-emerald-400 shrink-0" /><span dangerouslySetInnerHTML={{ __html: "<b>Stripe and PayPal</b> integration built in — your buy buttons work the moment you publish." }} /></li>
                    <li><Check className="w-5 h-5 mt-0.5 text-emerald-400 shrink-0" /><span dangerouslySetInnerHTML={{ __html: "Built-in <b>CRM</b> for every lead across every funnel — plus per-funnel analytics on traffic, conversion rate, traffic quality, and device breakdown." }} /></li>
                  </ul>
                </div>
                <div className="feature-media">
                  <div className="mock-pages">
                    <div className="mock-page-thumb">
                      <div className="bar"></div>
                      <div className="body"><div></div><div></div><div></div></div>
                      <div className="mock-swatches">
                        <span className="mock-swatch" style={{ background: '#8B5CF6' }}></span>
                        <span className="mock-swatch" style={{ background: '#EC4899' }}></span>
                        <span className="mock-swatch" style={{ background: '#191927' }}></span>
                      </div>
                    </div>
                    <div className="mock-page-thumb">
                      <div className="bar" style={{ background: 'var(--surface-3)' }}></div>
                      <div className="body"><div></div><div></div><div></div></div>
                      <div className="mock-swatches">
                        <span className="mock-swatch" style={{ background: '#4F8CFF' }}></span>
                        <span className="mock-swatch" style={{ background: '#34D399' }}></span>
                        <span className="mock-swatch" style={{ background: '#191927' }}></span>
                      </div>
                    </div>
                  </div>
                  <div className="media-caption">[ Illustration: Published pages with design direction applied ]</div>
                </div>
              </div>
            </div>

            <div className="reveal">
              <div className="feature-row reverse">
                <div className="feature-copy">
                  <span className="feature-tag"><Target className="w-4 h-4 inline mr-2" /> 04 · Traffic Intelligence™ + Email</span>
                  <h3>Stop guessing where your buyers are</h3>
                  <ul className="feature-list">
                    <li><Check className="w-5 h-5 mt-0.5 text-emerald-400 shrink-0" /><span dangerouslySetInnerHTML={{ __html: "A complete acquisition strategy before you spend a dollar — <b>platform priority matrix</b> built from comparable converting funnels." }} /></li>
                    <li><Check className="w-5 h-5 mt-0.5 text-emerald-400 shrink-0" /><span dangerouslySetInnerHTML={{ __html: "Ready-to-deploy <b>ad copy for Meta and Google</b> — plus a VSL script and a UGC script written from your persona data." }} /></li>
                    <li><Check className="w-5 h-5 mt-0.5 text-emerald-400 shrink-0" /><span dangerouslySetInnerHTML={{ __html: "A <b>3-phase media buying plan</b> — so you know what to test first, second, and third instead of burning budget on random variations." }} /></li>
                    <li><Check className="w-5 h-5 mt-0.5 text-emerald-400 shrink-0" /><span dangerouslySetInnerHTML={{ __html: "Full <b>email sequences</b> included — Lead Nurture, Launch, Re-engagement, Client Onboarding, and Upsell, ready to connect to your leads." }} /></li>
                  </ul>
                </div>
                <div className="feature-media">
                  <div className="mock-traffic">
                    <div className="mock-bar-row"><span className="plat">Meta</span><div className="mock-bar-track"><div className="mock-bar-fill" style={{ width: '88%' }}></div></div><span className="val">88</span></div>
                    <div className="mock-bar-row"><span className="plat">Google</span><div className="mock-bar-track"><div className="mock-bar-fill" style={{ width: '71%' }}></div></div><span className="val">71</span></div>
                    <div className="mock-bar-row"><span className="plat">Organic</span><div className="mock-bar-track"><div className="mock-bar-fill" style={{ width: '54%' }}></div></div><span className="val">54</span></div>
                    <div className="mock-bar-row"><span className="plat">TikTok</span><div className="mock-bar-track"><div className="mock-bar-fill" style={{ width: '39%' }}></div></div><span className="val">39</span></div>
                  </div>
                  <div className="media-caption">[ Illustration: Traffic Intelligence™ platform priority matrix ]</div>
                </div>
              </div>
            </div>

          </div>
        </section>

        <section className="section" id="vault">
          <div className="wrap">
            <div className="reveal">
              <div className="section-head center">
                <span className="eyebrow">Built-In Vault</span>
                <h2>Assets and templates, ready the moment you need them.</h2>
              </div>
            </div>
            <div className="vault-grid">
              <div className="reveal">
                <div className="vault-card">
                  <div className="vault-icon"><Package className="w-6 h-6 text-magenta-400" /></div>
                  <h3>Asset Bank — “Generates for you”</h3>
                  <p>The moment your Intelligence Report is ready, the Asset Bank already knows which lead magnets and bonuses will move the needle — and writes them for you as real, downloadable files.</p>
                  <ul className="vault-list">
                    <li><Check className="w-4 h-4 mt-0.5 text-violet-400 shrink-0"/>Auto-populated from your Bonus Stack &amp; Revenue Model — no manual setup.</li>
                    <li><Check className="w-4 h-4 mt-0.5 text-violet-400 shrink-0"/>One click generates a complete, titled, formatted PDF in under 60 seconds.</li>
                    <li><Check className="w-4 h-4 mt-0.5 text-violet-400 shrink-0"/>Covers lead magnets, core bonuses, and fast-action bonuses — each written in your buyer's exact vocabulary.</li>
                  </ul>
                  <div className="vault-format-row mt-4">
                    <span className="chip"><FileText className="w-3.5 h-3.5"/> Ebook</span>
                    <span className="chip"><FileText className="w-3.5 h-3.5"/> Checklist</span>
                    <span className="chip"><FileText className="w-3.5 h-3.5"/> Swipe File</span>
                    <span className="chip"><FileText className="w-3.5 h-3.5"/> Workbook</span>
                  </div>
                </div>
              </div>
              <div className="reveal">
                <div className="vault-card">
                  <div className="vault-icon" style={{backgroundColor: 'rgba(79,140,255,0.12)', borderColor: 'rgba(79,140,255,0.25)'}}><Palette className="w-6 h-6 text-blue-400" /></div>
                  <h3>Template Club — “You choose the start”</h3>
                  <p>A growing library of pre-built funnel and page layouts, organized by niche and offer type — pulled from patterns that already convert. Browse, preview, and drop one straight into your workspace.</p>
                  <ul className="vault-list">
                    <li><Check className="w-4 h-4 mt-0.5 text-blue-400 shrink-0"/>Organized by niche and offer type — course, coaching, digital product, service.</li>
                    <li><Check className="w-4 h-4 mt-0.5 text-blue-400 shrink-0"/>New templates added continuously as a member's library, included with every plan.</li>
                    <li><Check className="w-4 h-4 mt-0.5 text-blue-400 shrink-0"/>Clone a template, then let your Intelligence Report auto-fill it with your own copy and design direction.</li>
                  </ul>
                  <div className="vault-format-row mt-4">
                    <span className="chip"><Layers className="w-3.5 h-3.5"/> Coach</span>
                    <span className="chip"><Layers className="w-3.5 h-3.5"/> Course</span>
                    <span className="chip"><Layers className="w-3.5 h-3.5"/> SaaS</span>
                    <span className="chip"><Layers className="w-3.5 h-3.5"/> Agency</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="demo">
          <div className="wrap">
            <div className="reveal">
              <div className="section-head center">
                <span className="eyebrow">See It Live</span>
                <h2>Watch OfferIQ build a complete offer, start to finish.</h2>
                <p>One idea in. A live, payment-enabled funnel out. Real time.</p>
              </div>
            </div>
            <div className="reveal">
              <div className="video-shell">
                <button className="play-btn" aria-label="Watch the demo"><Play className="w-7 h-7 ml-1 text-white"/></button>
                <span className="video-duration">4:12</span>
              </div>
            </div>
            <div className="reveal">
              <div className="video-ctas mt-8 flex justify-center gap-4 flex-wrap">
                <a href="/login" className="btn btn-primary">Build My Next Offer <ArrowRight className="w-4 h-4"/></a>
                <a href="/login" className="btn btn-ghost">Start Your $1 Trial</a>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="scenarios">
          <div className="wrap">
            <div className="reveal">
              <div className="section-head center">
                <span className="eyebrow">Illustrative Scenarios</span>
                <h2>Whoever you are, the wall looks familiar.</h2>
                <p>Four representative profiles — tap through to see how the same platform solves four different problems.</p>
              </div>
            </div>
            <div className="reveal">
              <div className="scenario-tabs">
                {scenarios.map((sc, i) => (
                  <button key={i} className={`scenario-tab ${activeScenario === i ? 'active' : ''}`} onClick={() => setActiveScenario(i)}>
                    <span className="emoji">{sc.emoji}</span>{sc.tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="reveal in" key={activeScenario}>
              <div className="scenario">
                <div>
                  <div className="scenario-persona">
                    <div className="avatar-placeholder">{s.emoji}</div>
                    <div className="who"><b>{s.who}</b><span>{s.meta}</span></div>
                  </div>
                  <blockquote>{s.quote}</blockquote>
                  <p className="scenario-body">{s.body}</p>
                </div>
                <div className="scenario-stats">
                  {s.stats.map((st, i) => (
                    <div className="scenario-stat" key={i}>
                      <TrendingUp className="w-5 h-5 text-violet-400 shrink-0"/>
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
            <div className="reveal">
              <p style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-faint)', marginTop: 24 }}>
                Illustrative scenarios based on representative buyer profiles — not actual customer accounts.
              </p>
            </div>
          </div>
        </section>

        <section className="section" id="compare">
          <div className="wrap">
            <div className="reveal">
              <div className="section-head center">
                <span className="eyebrow">Replace The Stack</span>
                <h2>What this replaces, per offer</h2>
                <p>Typical market rates for each role, sourced from standard freelance and SaaS pricing ranges — for reference, not a guarantee.</p>
              </div>
            </div>
            <div className="reveal">
              <div className="table-scroll">
                <table className="compare-table">
                  <thead><tr><th>Capability</th><th>Typical Cost Elsewhere</th><th>In OfferIQ</th></tr></thead>
                  <tbody>
                    {compareRows.map((r, i) => (
                      <tr key={i}>
                        <td>{r[0]}</td>
                        <td className="cost-old">{r[1]}</td>
                        <td className="cost-new"><Check className="w-4 h-4 mr-1.5"/> Included</td>
                      </tr>
                    ))}
                    <tr className="total">
                      <td>Total to replicate manually, per offer</td>
                      <td className="cost-old">$21,000 – $172,000+</td>
                      <td className="cost-new"><Zap className="w-4 h-4 mr-1.5"/> From $39/mo</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="calculator">
          <div className="wrap">
            <div className="reveal">
              <div className="section-head center">
                <span className="eyebrow">Do The Math</span>
                <h2>What would this cost you to build manually?</h2>
                <p>Drag the slider to your actual launch plan for the year.</p>
              </div>
            </div>
            <div className="reveal">
              <div className="calc">
                <div>
                  <div className="calc-slider-label"><span>Offers you want to launch this year</span><b>{offers}</b></div>
                  <input type="range" min="1" max="30" value={offers} onChange={e => setOffers(parseInt(e.target.value))} />
                  <p style={{ marginTop: '22px', fontSize: '13.5px', color: 'var(--text-faint)' }}>Based on a conservative blended estimate of $8,000 per offer for a strategist, copywriter, designer, and media buyer working separately.</p>
                </div>
                <div className="calc-result">
                  <div className="calc-line old"><span className="l">Hiring it out</span><span className="v">{fmt(manualTotal)}</span></div>
                  <div className="calc-line new"><span className="l">With OfferIQ (annual plan)</span><span className="v">{fmt(iqTotal)}</span></div>
                  <div className="calc-save">
                    <b>{fmt(savings)} saved</b>
                    <span>Across {offers} offer{offers > 1 ? 's' : ''} this year</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="pricing">
          <div className="wrap">
            <div className="reveal">
              <div className="section-head center">
                <span className="eyebrow">Pricing</span>
                <h2>Simple monthly pricing.</h2>
                <p>Try Starter for $1 over your first 7 days, then $39/mo. Cancel anytime — from your account, in one click.</p>
              </div>
            </div>
            <div className="pricing-grid">
              {pricingTiers.map((t, i) => (
                <div className="reveal" key={i}>
                  <div className={`price-card ${t.popular ? 'popular' : ''}`}>
                    {t.popular && <span className="popular-badge">Most Popular</span>}
                    <span className="price-tier">{t.name}</span>
                    <div className="price-amount"><span className="num">{t.price}</span><span className="period">{t.period}</span></div>
                    <p className="price-sub">{t.sub}</p>
                    <ul className="price-features">
                      {t.features.map((f, j) => <li key={j}><Check className="w-4 h-4 mt-0.5 text-violet-400 shrink-0"/><span dangerouslySetInnerHTML={{ __html: f }} /></li>)}
                    </ul>
                    <p className="price-best">{t.best}</p>
                    <a href="/login" className={`btn ${t.popular ? 'btn-primary' : 'btn-ghost'}`} style={{ justifyContent: 'center' }}>{t.cta}</a>
                  </div>
                </div>
              ))}
            </div>
            <div className="reveal">
              <div className="guarantee-strip">
                <Shield className="w-5 h-5 text-emerald-400 shrink-0"/>
                <span>Backed by a 30-day money-back guarantee. If OfferIQ isn't right for you, get a full refund — no conditions.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="faq">
          <div className="wrap">
            <div className="reveal">
              <div className="section-head center">
                <span className="eyebrow">Questions</span>
                <h2>Frequently asked questions</h2>
              </div>
            </div>
            <div className="reveal">
              <div className="faq-list" style={{ maxWidth: '760px', margin: '0 auto' }}>
                {faqs.map((f, i) => (
                  <FaqItem key={i} q={f.q} a={f.a} isOpen={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="cta">
          <div className="wrap">
            <div className="reveal">
              <div className="final-cta">
                <span className="eyebrow" style={{ justifyContent: 'center' }}>Ready When You Are</span>
                <h2>Your next offer is one click away.</h2>
                <p>Every month without a validated offer is a month of revenue you don't make. OfferIQ closes the gap between idea and income — in one session.</p>
                <div className="final-cta-row">
                  <a href="/login" className="btn btn-primary">Build My Next Offer <ArrowRight className="w-4 h-4"/></a>
                  <a href="/login" className="btn btn-ghost">See Pricing</a>
                </div>
                <p className="final-urgency">// $1 gets you in the door for 7 days. Cancel anytime.</p>
              </div>
            </div>
          </div>
        </section>

        {/* EXISTING FOOTER */}
        <footer>
          <div className="wrap">
            <div className="footer-top">
              <div className="footer-brand">
                <div className="nav-logo"><div className="mark"></div>OfferIQ</div>
                <p>The intelligence layer that should happen before anything gets built — delivered instantly, and connected directly to the copy, pages, and traffic plan that follow from it.</p>
                <div className="badge-row" style={{ marginTop: "18px" }}>
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
          <a href="/login" className="btn btn-primary">Start Building <ArrowRight className="w-4 h-4"/></a>
        </div>

      </div>
    </div>
  );
}
