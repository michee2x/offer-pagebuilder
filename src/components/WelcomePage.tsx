'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useScroll, useTransform, motion } from 'motion/react';
import {
  Link as LinkIcon, FileText, PenTool, Target, Users, DollarSign, Zap,
  Check, CreditCard, Megaphone, Music, ArrowRight, TrendingUp, Shield,
  Layers, Package, Palette, Rocket
} from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";

/* ─── Reveal wrapper ─────────────────────────────────────────────── */
function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); io.disconnect(); }
    }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}>
      {children}
    </div>
  );
}

/* ─── Eyebrow label ─────────────────────────────────────────────── */
function Eyebrow({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div className={`flex items-center gap-2 font-mono text-[12.5px] tracking-[0.14em] uppercase text-[#60A5FA] mb-[18px] ${center ? 'justify-center' : ''}`}>
      <span className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: 'linear-gradient(135deg,#0066FF 0%,#4338CA 100%)', boxShadow: '0 0 12px rgba(236,72,153,0.6)' }} />
      {children}
    </div>
  );
}

/* ─── Chip pill ─────────────────────────────────────────────────── */
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-[#A6A6B3] bg-white/[0.04] border border-white/[0.08] rounded-full px-3 py-1.5">
      {children}
    </span>
  );
}

/* ─── Nav logo mark ─────────────────────────────────────────────── */
function LogoMark() {
  return (
    <div className="w-7 h-7 rounded-lg relative flex items-center justify-center flex-shrink-0"
      style={{ background: 'linear-gradient(135deg,#0066FF 0%,#4338CA 100%)', boxShadow: '0 3px 14px -3px rgba(139,92,246,0.65)' }}>
      <div className="w-[10px] h-[10px] bg-white rounded-[2.5px] rotate-45 opacity-90" />
    </div>
  );
}

/* ─── FAQ Item ──────────────────────────────────────────────────── */
function FaqItem({ q, a, isOpen, onClick }: { q: string; a: string; isOpen: boolean; onClick: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="border-b border-white/[0.07]">
      <button
        className="w-full flex items-center justify-between gap-4 py-6 text-left text-[#F5F5F7] font-medium text-[17px] hover:text-white/80 transition-colors cursor-pointer bg-transparent border-none"
        onClick={onClick}
        aria-expanded={isOpen}
      >
        <span>{q}</span>
        <span className={`w-6 h-6 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
          <svg viewBox="0 0 10 10" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="1" x2="5" y2="9" />
            <line x1="1" y1="5" x2="9" y2="5" />
          </svg>
        </span>
      </button>
      <div className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? (ref.current ? ref.current.scrollHeight + 'px' : '500px') : '0px' }}>
        <div ref={ref} className="pb-6 text-[#A6A6B3] text-[15px] leading-relaxed">{a}</div>
      </div>
    </div>
  );
}

/* ─── Showcase Modal Content ─────────────────────────────────────── */
function ChoiceGateContent() {
  return (
    <div className="space-y-6 pt-6">
      <p className="text-[#A6A6B3] text-sm uppercase tracking-widest font-semibold">Two entry points — one destination</p>
      <p className="text-[#F5F5F7] text-lg md:text-2xl leading-relaxed">
        <span className="font-bold text-white">Start from what you have — or start from nothing at all.</span>{' '}
        OfferIQ meets you exactly where you are. Paste a URL. Upload a PDF. Describe an idea in plain language. Or tell us your niche and your audience and let us build the offer from scratch.
      </p>
      <ul className="space-y-4">
        {['Analyse & Build My Offer — for a URL, PDF, or idea you already have.','Build an Offer For Me — generates validated offer ideas from your niche, audience, and price range.','Every path lands in the same place: a complete Intelligence Report, ready in minutes.'].map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-[#A6A6B3] text-base"><Check className="w-5 h-5 mt-0.5 text-emerald-500 shrink-0" /><span>{item}</span></li>
        ))}
      </ul>
    </div>
  );
}
function CopyEngineContent() {
  return (
    <div className="space-y-6 pt-6">
      <p className="text-[#A6A6B3] text-sm uppercase tracking-widest font-semibold">Built from your data — not a template</p>
      <p className="text-[#F5F5F7] text-lg md:text-2xl leading-relaxed">
        <span className="font-bold text-white">Generic copy dies on the page. Yours won't.</span>{' '}
        Every word OfferIQ writes is pulled directly from your Intelligence Report — your buyer's vocabulary, your positioning, your angles.
      </p>
      <ul className="space-y-4">
        {["Every word written from your Intelligence Report — so your copy actually speaks to your specific buyer.","Full funnel in one pass: Lead Capture, Long-Form Sales Page (up to 12,000 words), Upsell, Downsell, and Thank You pages.","Pages assemble themselves — colors, fonts, and layout pulled straight from your Design Intelligence.","Refine anything by chatting — tell the AI copilot 'make this headline punchier' and watch it update in real time.","Drag-and-drop when you want manual control — reorder sections, swap images, edit inline."].map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-[#A6A6B3] text-base"><Check className="w-5 h-5 mt-0.5 text-emerald-500 shrink-0" /><span>{item}</span></li>
        ))}
      </ul>
    </div>
  );
}
function LaunchContent() {
  return (
    <div className="space-y-6 pt-6">
      <p className="text-[#A6A6B3] text-sm uppercase tracking-widest font-semibold">Go live. Get paid. See everything.</p>
      <p className="text-[#F5F5F7] text-lg md:text-2xl leading-relaxed">
        <span className="font-bold text-white">Most builders stop at "publish." OfferIQ doesn't.</span>{' '}
        Your funnel goes live payment-enabled, analytics-ready, and CRM-connected — the moment you hit deploy.
      </p>
      <ul className="space-y-4">
        {["One-click publishing — go live on an OfferIQ subdomain or connect your own custom domain.","Stripe and PayPal integration built in — your buy buttons work the moment you publish.","Built-in CRM for every lead across every funnel — plus per-funnel analytics on traffic, conversion rate, traffic quality, and device breakdown."].map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-[#A6A6B3] text-base"><Check className="w-5 h-5 mt-0.5 text-emerald-500 shrink-0" /><span>{item}</span></li>
        ))}
      </ul>
    </div>
  );
}
function TrafficContent() {
  return (
    <div className="space-y-6 pt-6">
      <p className="text-[#A6A6B3] text-sm uppercase tracking-widest font-semibold">A complete acquisition strategy — before you spend a dollar</p>
      <p className="text-[#F5F5F7] text-lg md:text-2xl leading-relaxed">
        <span className="font-bold text-white">Stop guessing where your buyers are.</span>{' '}
        OfferIQ benchmarks your offer against real converting funnels and tells you exactly which platforms to hit first, what to run, and in what sequence — with the copy already written.
      </p>
      <ul className="space-y-4">
        {["A complete acquisition strategy before you spend a dollar — platform priority matrix built from comparable converting funnels.","Ready-to-deploy ad copy for Meta and Google — plus a VSL script and a UGC script written from your persona data.","A 3-phase media buying plan — so you know what to test first, second, and third instead of burning budget on random variations.","Full email sequences included — Lead Nurture, Launch, Re-engagement, Client Onboarding, and Upsell."].map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-[#A6A6B3] text-base"><Check className="w-5 h-5 mt-0.5 text-emerald-500 shrink-0" /><span>{item}</span></li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Showcase Carousel ──────────────────────────────────────────── */
function ShowcaseCarousel() {
  const showcaseData = [
    { category: "Choice Gate", title: "Start from what you have — or start from nothing at all", src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2187&auto=format&fit=crop", content: <ChoiceGateContent /> },
    { category: "Copy & Page Builder", title: "Copy and pages built from your data, not a template", src: "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=2073&auto=format&fit=crop", content: <CopyEngineContent /> },
    { category: "Publish & Analytics", title: "Launch-ready assets, live pages, and real analytics", src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop", content: <LaunchContent /> },
    { category: "Traffic Intelligence™", title: "Stop guessing where your buyers are", src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop", content: <TrafficContent /> },
  ];
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12">
      <Carousel opts={{ align: 'start', loop: true }} className="w-full">
        <CarouselContent className="-ml-4">
          {showcaseData.map((item, index) => (
            <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="relative h-[400px] overflow-hidden rounded-[2rem] group cursor-pointer border border-white/10 hover:border-violet-500/50 transition-colors duration-300">
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${item.src})` }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                    <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col justify-end h-full">
                      <span className="text-violet-400 font-mono text-xs font-semibold uppercase tracking-widest mb-3">{item.category}</span>
                      <h3 className="text-white text-2xl font-medium leading-tight">{item.title}</h3>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-[800px] w-[90vw] bg-[#101016] border-white/10 text-white p-0 overflow-hidden rounded-[2rem]">
                  <DialogTitle className="sr-only">{item.title}</DialogTitle>
                  <div className="h-48 md:h-64 w-full relative">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${item.src})` }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#101016] via-[#101016]/80 to-transparent" />
                  </div>
                  <div className="px-6 md:px-12 pb-12 pt-0 max-h-[60vh] overflow-y-auto">{item.content}</div>
                </DialogContent>
              </Dialog>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:flex justify-end gap-2 mt-8">
          <CarouselPrevious className="relative inset-auto translate-y-0 h-12 w-12 rounded-full bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white" />
          <CarouselNext className="relative inset-auto translate-y-0 h-12 w-12 rounded-full bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white" />
        </div>
      </Carousel>
    </div>
  );
}

/* ─── WelcomePage ───────────────────────────────────────────────── */
export function WelcomePage() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [activeScenario, setActiveScenario] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const cardRotate = useTransform(heroProgress, [0, 0.55], [20, 0]);
  const cardScale = useTransform(heroProgress, [0, 0.55], [1.06, 1]);
  const titleTranslate = useTransform(heroProgress, [0, 0.55], [0, -80]);

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const whyCards = [
    {
      index: '01', stat: '42%', tag: 'The "Blank Canvas" Trap',
      body: 'of startups fail simply because they build products with absolutely no market need — chasing demand that was never there until the cash runs out.',
      src: '— Vincent, Founder of Preuve AI',
      icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>),
    },
    {
      index: '02', stat: '18%', tag: 'The Pricing Trap',
      body: 'of startups collapse due to flawed pricing models — charging too much for the market to bear, or too little to sustain operations.',
      src: '— ideaproof.io',
      icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>),
    },
    {
      index: '03', stat: '222%+', tag: 'The "Acquisition Cost" Trap',
      body: 'is how far Customer Acquisition Costs have climbed. Hyper-expensive clicks sent to a slow, pieced-together funnel bleed profit dry before the first sale.',
      src: '— ProfitWell / Paddle',
      icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>),
    },
  ];

  const scenarios = [
    {
      emoji: '🎓', tab: 'Course Creator', who: 'Marketing Consultant', meta: '34 · Austin, TX · 14K Instagram followers',
      quote: <>"I'd researched competitors, taken two copywriting courses, and paid $800 for a coach call. <span style={{ color: '#60A5FA' }}>I still had nothing live.</span>"</>,
      body: "She uploaded her course idea as a text description. In under a minute, OfferIQ returned her exact persona, a price point $300 higher than she'd planned to charge, five conversion hooks, and a full funnel blueprint — then wrote and built the entire funnel in the same session.",
      stats: [{ from: '6 months stuck', to: 'Live in one evening' }, { from: '$197 planned price', to: '$497 recommended price' }, { single: '5 pages + funnel — written, designed, and published in one session' }],
    },
    {
      emoji: '🎤', tab: 'Business Coach', who: 'Executive Life Coach', meta: '41 · Atlanta, GA · $3,500 program',
      quote: <>"I knew the problem was in the messaging. <span style={{ color: '#60A5FA' }}>I just couldn't see what was wrong with it.</span>"</>,
      body: "She pasted her existing sales page URL into OfferIQ. The Intelligence Report found the real problem in seconds: her page led with a 12-step curriculum, but her buyer purchases from identity anxiety. OfferIQ rewrote the copy around that insight and raised her price to $4,500.",
      stats: [{ from: '0.7% conversion', to: '2.5%+ projected, same ad budget' }, { from: '$9,600 spent, unprofitable', to: 'Profitable within 30 days (projected)' }, { from: '$3,500 price', to: '$4,500 pricing correction' }],
    },
    {
      emoji: '🏢', tab: 'Agency Owner', who: 'Digital Marketing Agency Owner', meta: '38 · Denver, CO · 6-person team',
      quote: <>"Every new service means a new hiring decision. <span style={{ color: '#60A5FA' }}>I couldn't productize this without a repeatable system.</span>"</>,
      body: "He wanted to add offer strategy and funnel building as a $3,000–$5,000 productized service, without hiring. He now runs each client's offer through OfferIQ. What took his team three weeks now takes two hours.",
      stats: [{ from: '3 weeks per client', to: '2 hours per client' }, { single: '$15,000–$30,000/month projected new service-line revenue' }, { single: 'Zero new hires required to deliver it' }],
    },
    {
      emoji: '🌱', tab: 'First-Time Entrepreneur', who: 'Corporate HR Professional', meta: '29 · Chicago, IL · 8 yrs experience',
      quote: <>"I knew I had teachable expertise. <span style={{ color: '#60A5FA' }}>I had no idea what to build, or where to start.</span>"</>,
      body: 'She had 18 months of "how to launch a course" content behind her and nothing live. She selected "Build an Offer For Me," entered her niche and audience, and received five validated offer ideas. She picked "The 90-Day People Ops Accelerator" at $997 — OfferIQ built the full intelligence report and funnel for it in the same session.',
      stats: [{ from: '18 months, no product', to: 'Live funnel in under 3 hours' }, { single: '5 validated offer ideas generated from niche + audience + price range' }, { single: '$997 price point — market-tested, not guessed' }],
    },
  ];

  const compareRows = [
    ['Offer strategy & positioning consultant', '$2,000 – $10,000 / project'],
    ['Direct-response sales copywriter', '$2,000 – $15,000 / page'],
    ['Landing page / funnel builder software', '$99 – $297 / month'],
    ['Lead magnet & bonus design + writing', '$500 – $2,000 / asset'],
    ['Paid traffic / media buying strategist', '$1,500 – $5,000 / month'],
    ['Email sequence writing & tooling', '$50 – $150 / month + writer fees'],
    ['CRM & lead analytics tool', '$50 – $300 / month'],
  ];

  const faqs = [
    { q: 'Is OfferIQ a subscription, or a one-time purchase?', a: 'Both structures exist, by tier. Starter and Growth are monthly subscriptions — you\'re billed each month and can cancel anytime from your account. Agency is a single one-time payment with credits that never expire.' },
    { q: 'How does the $1 trial work, exactly?', a: 'You get full access to the Starter plan for 7 days for $1. If you don\'t cancel before day 7, your card is billed the standard $39/mo rate and your subscription continues month to month.' },
    { q: 'Do unused offer credits roll over to the next month?', a: 'No. Starter and Growth credits refresh monthly and reset at the start of each new billing cycle. Agency credits are a fixed pool that never expires and never refreshes, because they\'re paid for once.' },
    { q: 'What happens to my published funnels if I cancel my subscription?', a: 'Your funnels are taken offline when your subscription ends. Your underlying data — copy, reports, and assets — stays accessible in your account for a limited window so you can export it or reactivate later.' },
    { q: 'What happens when I run out of credits partway through the month?', a: 'Your existing offers, pages, and data remain fully accessible. To build additional new offers before your next refresh, you can purchase additional credit packs for $10 per credit.' },
    { q: 'Can I upgrade or downgrade my plan later?', a: 'Yes. You can upgrade to a higher tier at any time by paying the price difference for the remainder of your billing cycle. Downgrades take effect at your next renewal date.' },
    { q: 'Is there a refund policy?', a: 'Yes — a 30-day money-back guarantee applies to every tier, including Agency. If OfferIQ isn\'t right for you, request a full refund within 30 days of your purchase, no conditions.' },
    { q: 'Does OfferIQ work outside the US?', a: 'Yes. OfferIQ supports multiple currencies and target countries in the offer creation process, with additional payment integrations (Paystack, Flutterwave) on the roadmap.' },
    { q: 'What if I run an agency and need more than 30 client sub-accounts?', a: 'Contact support after purchase — additional sub-account packs are available for agencies scaling beyond the Agency tier\'s built-in allocation.' },
  ];

  const pricingTiers = [
    {
      name: 'Starter', price: '$39', period: '/mo', sub: '$1 for your first 7 days, then $39/mo. Cancel anytime.',
      features: ['<b>5 offer credits</b> — refreshed monthly', '1 Workspace', 'Full 4-Phase Engine: Intelligence, Copy, Pages, Traffic', 'Asset Bank + Template Club access', 'Email Sequences', 'OfferIQ subdomain publishing', 'Payment & Autoresponder integration', 'Standard support'],
      best: 'Best for testing the platform and launching your first 1–3 offers.', popular: false, cta: 'Start Your $1 Trial',
    },
    {
      name: 'Growth', price: '$69', period: '/mo', sub: 'Billed monthly. Cancel anytime.',
      features: ['Everything in Starter, plus:', '<b>10 offer credits</b> — refreshed monthly', '3 Workspaces', 'Remove "Built with OfferIQ" branding', 'Advanced Analytics dashboard', 'Custom domain connection', 'Pixel tracking embed', 'Priority support'],
      best: 'Best for active creators running multiple offers or brands.', popular: true, cta: 'Get Growth',
    },
    {
      name: 'Agency', price: '$179', period: 'one-time', sub: 'A single payment — not a subscription.',
      features: ['Everything in Growth, plus:', '<b>30 offer credits</b> — yours forever, never expire', '30 Workspaces', '30 client sub-accounts for agency delivery', 'Agency asset pack — proposals & branded covers', 'Done-For-You onboarding session', 'Dedicated priority support channel'],
      best: 'Best for agencies and consultants delivering offer strategy as a service.', popular: false, cta: 'Get Agency',
    },
  ];

  const s = scenarios[activeScenario];

  return (
    <div className="dark antialiased overflow-x-hidden" style={{ background: '#08080D', color: '#F5F5F7', fontFamily: "'General Sans', -apple-system, BlinkMacSystemFont, sans-serif", lineHeight: 1.6, WebkitFontSmoothing: 'antialiased' }}>

      {/* ── NAV ── */}
      <nav
        id="nav"
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-[350ms] border-b ${navScrolled ? 'py-[11px] border-white/[0.07]' : 'py-[18px] border-transparent'}`}
        style={{ background: navScrolled ? 'rgba(8,8,13,0.80)' : 'transparent', backdropFilter: navScrolled ? 'blur(20px) saturate(160%)' : 'none', boxShadow: navScrolled ? '0 1px 0 rgba(255,255,255,0.04),0 4px 24px -4px rgba(0,0,0,0.4)' : 'none' }}
      >
        <div className="max-w-[1180px] mx-auto px-7 flex items-center justify-between gap-6">
          <a href="/" className="flex items-center gap-[9px] font-semibold text-[18px] tracking-[-0.01em] text-[#F5F5F7] no-underline flex-shrink-0 hover:opacity-85 transition-opacity">
            <LogoMark />
            OfferIQ
          </a>
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {[['#showcase','Product'],['#how-it-works','How It Works'],['#pricing','Pricing'],['#faq','FAQ']].map(([href, label]) => (
              <a key={href} href={href} className="text-[14px] font-[450] text-[#A6A6B3] px-[13px] py-1.5 rounded-lg hover:text-[#F5F5F7] hover:bg-white/[0.055] transition-all tracking-[-0.01em]">{label}</a>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a href="/login" className="text-white text-[13.5px] font-semibold px-[18px] h-[34px] rounded-[9px] inline-flex items-center tracking-[-0.01em] transition-all hover:-translate-y-px hover:brightness-110"
              style={{ background: '#0066FF', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2),0 0 0 1px rgba(0,102,255,0.5),0 4px 20px -4px rgba(0,102,255,0.75)' }}>
              Log In
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden min-h-[160vh]" style={{ background: '#08080D' }} id="hero" ref={heroRef}>
        {/* Ambient glow */}
        <div aria-hidden="true" className="absolute rounded-full pointer-events-none z-0 w-[1100px] h-[700px] -top-[180px] left-1/2 -translate-x-1/2 blur-[50px]"
          style={{ background: 'radial-gradient(ellipse at center,rgba(0,102,255,0.16) 0%,rgba(67,56,202,0.10) 45%,transparent 70%)' }} />
        {/* Checkerboard grid */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-0"
          style={{ backgroundImage: 'repeating-conic-gradient(rgba(255,255,255,0.022) 0% 25%,rgba(255,255,255,0.010) 25% 50%)', backgroundSize: '40px 40px', WebkitMaskImage: 'radial-gradient(ellipse 80% 55% at 50% 0%,black 15%,transparent 70%)', maskImage: 'radial-gradient(ellipse 80% 55% at 50% 0%,black 15%,transparent 70%)' }} />

        <div className="relative z-[1] px-7 pt-[150px] pb-20 flex flex-col items-center" style={{ perspective: '1200px' }}>
          {/* Title block */}
          <motion.div className="w-full max-w-[840px] text-center mx-auto mb-[60px] relative z-[2]" style={{ translateY: titleTranslate }}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 mb-7 cursor-default transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(0,102,255,0.08)', border: '1px solid rgba(0,102,255,0.22)', borderRadius: '100px', padding: '6px 14px 6px 10px' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#0066FF' }} />
              <span className="text-[13px] font-medium text-[#60A5FA]">New: Intelligence-First Offer OS v2.0</span>
              <ArrowRight style={{ width: 12, height: 12, marginLeft: 4, flexShrink: 0, color: '#60A5FA' }} />
            </div>

            <h1 className="mb-6 text-[#F5F5F7]" style={{ fontSize: 'clamp(28px,6vw,56px)', lineHeight: 1.05, fontWeight: 800, letterSpacing: '-3px' }}>
              <span className="text-neutral-500">Stop guessing what sells.</span><br />
              Engineer an offer that{' '}
              <span style={{ background: 'linear-gradient(135deg,#60A5FA 0%,#818CF8 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>converts</span>.
            </h1>

            <p className="text-[17px] leading-[1.7] text-[#A6A6B3] max-w-[580px] mx-auto mb-9">
              Upload a URL, PDF, or a single idea. OfferIQ benchmarks it against 35,000+ real converting offers and returns your complete revenue system — strategy, copy, a live funnel, and a traffic plan. All in one session.
            </p>

            <div className="flex items-center justify-center gap-3.5 mb-6 flex-wrap">
              <a href="/login" className="inline-flex items-center gap-2 px-[26px] py-[15px] rounded-[10px] text-white text-[14.5px] font-bold transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg,#0066FF 0%,#4338CA 100%)', boxShadow: '0 14px 30px rgba(0,102,255,0.25)' }}>
                Build My Offer Now
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-3.5 h-3.5"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </a>
              <a href="/login" className="inline-flex items-center gap-2 px-6 py-[15px] rounded-[10px] text-[14.5px] font-semibold text-[#F5F5F7] transition-all hover:bg-white/[0.08] hover:border-white/25"
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)' }}>
                Start Your $1 Trial
              </a>
            </div>

            <p className="text-[12.5px] text-[#6B6B7B] leading-[1.7] font-mono">
              $1 for your first 7 days &middot; $39/mo after &middot; Cancel anytime &middot; 30-day money-back guarantee
            </p>
          </motion.div>

          {/* 3D Card */}
          <motion.div
            className="w-full max-w-[1040px] rounded-[30px] relative z-[1] p-5"
            style={{
              height: 580, border: '4px solid rgba(255,255,255,0.1)', background: '#111118',
              rotateX: cardRotate, scale: cardScale, transformOrigin: 'center top',
              boxShadow: '0 0 #0000004d,0 9px 20px #0000004a,0 37px 37px #00000042,0 84px 50px #00000026,0 149px 60px #0000000a,0 233px 65px #00000003',
            }}
          >
            <div className="h-full w-full rounded-[18px] overflow-hidden bg-[#18181b] p-3.5">
              <video autoPlay muted loop playsInline className="w-full h-full object-cover rounded-[10px] block">
                <source src="https://videos.pexels.com/video-files/7710230/7710230-hd_1280_720_25fps.mp4" type="video/mp4" />
              </video>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── WHY IT MATTERS ── */}
      <section className="py-[120px] md:py-[76px]" id="why">
        <div className="max-w-[1180px] mx-auto px-7">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-20 items-start">

            {/* Left */}
            <div className="lg:w-5/12 lg:sticky lg:top-32 space-y-8">
              <Eyebrow>Why This Matters Right Now</Eyebrow>
              <h2 className="font-semibold tracking-[-0.02em] text-[#F5F5F7]" style={{ fontSize: 'clamp(28px,3.5vw,52px)', lineHeight: 1.08 }}>
                <span className="text-neutral-500">Three traps</span> quietly kill every offer before it sells.
              </h2>
              <p className="text-[17px] md:text-[19px] text-[#A6A6B3] leading-relaxed font-light">
                Most offers don't fail because the idea was bad. They fail in one of three predictable, well-documented places — before a single ad ever runs.
              </p>
              <div className="p-6 md:p-8 rounded-2xl relative overflow-hidden" style={{ background: '#13131A', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl" style={{ background: 'linear-gradient(to bottom,#7C3AED,#4338CA)' }} />
                <p className="text-[15px] md:text-[17px] text-[#D4D4E0] font-medium leading-relaxed">
                  OfferIQ exists to catch all three before you spend a dollar building or promoting anything.
                </p>
              </div>
            </div>

            {/* Right - cards */}
            <div className="lg:w-7/12 flex flex-col gap-6 w-full">
              {whyCards.map((c, i) => (
                <div key={i} className="relative overflow-hidden rounded-[2rem] p-8 md:p-10 group transition-colors duration-500 hover:border-white/10"
                  style={{ background: '#121218', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full pointer-events-none transition-colors duration-700 group-hover:opacity-100 opacity-70"
                    style={{ background: 'radial-gradient(circle,rgba(124,58,237,0.15) 0%,transparent 70%)', filter: 'blur(40px)' }} />
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-8">
                      <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-white/60 group-hover:text-violet-400 transition-colors">
                        {c.icon}
                      </div>
                      <span className="font-mono text-[#505060] text-sm tracking-widest">{c.index} / 03</span>
                    </div>
                    <div className="font-mono tracking-tight text-[#F5F5F7] mb-2" style={{ fontSize: 'clamp(40px,6vw,64px)', fontWeight: 300 }}>{c.stat}</div>
                    <h3 className="text-xl md:text-2xl font-medium text-violet-300 mb-5">{c.tag}</h3>
                    <p className="text-[15px] md:text-[17px] text-[#A6A6B3] leading-relaxed mb-5">{c.body}</p>
                    <div className="text-[11px] font-semibold text-[#505060] uppercase tracking-widest font-mono">{c.src}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Banner */}
          <div className="mt-20 lg:mt-28">
            <div className="relative overflow-hidden rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-8 group transition-colors duration-500"
              style={{ background: 'linear-gradient(135deg,#121218 0%,#161622 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform duration-500"
                style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <p className="text-xl md:text-2xl lg:text-[28px] font-medium text-[#F5F5F7] leading-relaxed tracking-tight text-center md:text-left pt-1">
                OfferIQ is the end of trial-and-error marketing.{' '}
                <span style={{ background: 'linear-gradient(135deg,#818CF8 0%,#60A5FA 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                  We replace the guesswork with a data-backed blueprint.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TWO WAYS IN ── */}
      <section className="py-[120px] md:py-[76px]" id="gate">
        <div className="max-w-[1180px] mx-auto px-7">
          <Reveal>
            <div className="max-w-[680px] mb-16 mx-auto text-center">
              <Eyebrow center>Two Ways In</Eyebrow>
              <h2 className="font-semibold tracking-[-0.02em] leading-[1.08] mb-[18px] text-[#F5F5F7]" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>Tell OfferIQ where you're starting from.</h2>
              <p className="text-[17px] text-[#A6A6B3] max-w-[560px] mx-auto">There's no wrong entry point — just the one that matches what you already have.</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: <LinkIcon className="w-6 h-6 text-violet-400" />, index: '01 / HAVE AN OFFER', title: 'Analyse & Build My Offer', desc: "You already have an offer, a live page, or a rough idea. Paste a URL, upload a PDF, or describe it in your own words — OfferIQ builds the complete intelligence report, copy, and funnel around what you already have.", chips: [<><LinkIcon className="w-4 h-4" /> Paste a URL</>, <><FileText className="w-4 h-4" /> Upload a PDF</>, <><PenTool className="w-4 h-4" /> Describe it</>] },
              { icon: <Target className="w-6 h-6 text-violet-400" />, index: '02 / NO OFFER YET', title: 'Build an Offer For Me', desc: "You have an audience and expertise, but no product. Give OfferIQ your niche, audience, and price range — get validated offer ideas benchmarked against real converting funnels, ready to build the moment you pick one.", chips: [<><Target className="w-4 h-4" /> Pick a niche</>, <><Users className="w-4 h-4" /> Define your buyer</>, <><DollarSign className="w-4 h-4" /> Set a price range</>] },
            ].map((card, i) => (
              <Reveal key={i}>
                <div className="rounded-2xl p-8 flex flex-col gap-5 h-full" style={{ background: '#14141F', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>{card.icon}</div>
                  <span className="font-mono text-[11px] text-[#505060] tracking-[0.1em] uppercase">{card.index}</span>
                  <h3 className="text-[22px] font-semibold tracking-[-0.02em] text-[#F5F5F7]">{card.title}</h3>
                  <p className="text-[15px] text-[#A6A6B3] leading-relaxed flex-1">{card.desc}</p>
                  <div className="flex flex-wrap gap-2">{card.chips.map((c, j) => <Chip key={j}>{c}</Chip>)}</div>
                  <a href="/login" className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#F5F5F7] rounded-full px-[18px] py-2.5 self-start transition-all hover:-translate-y-0.5 hover:bg-white/[0.1]"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.14)' }}>
                    Start here <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-[120px] md:py-[76px]" id="how-it-works">
        <div className="max-w-[1180px] mx-auto px-7">
          <Reveal>
            <div className="max-w-[680px] mb-16">
              <Eyebrow>From Idea To Live Funnel</Eyebrow>
              <h2 className="font-semibold tracking-[-0.02em] leading-[1.08] mb-[18px] text-[#F5F5F7]" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>The average user goes from first login to a live, payment-enabled funnel in under 30 minutes.</h2>
              <p className="text-[17px] text-[#A6A6B3]">For a returning user building their second or third offer, it takes under 15.</p>
            </div>
          </Reveal>
          <div className="flex flex-col">
            {[
              { t: 'Intelligence Report', time: '~4 min', d: 'Your offer is analyzed against 35,000+ validated funnels — positioning, persona, pricing, hooks, and a full funnel blueprint come back specific to you.' },
              { t: 'Copy Engine', time: '~2 min', d: "Lead page, long-form sales page, upsell, downsell, and thank-you copy — written from the intelligence report, in your buyer's exact vocabulary." },
              { t: 'Page Builder', time: '~5 min', d: 'Every page assembles automatically using your design direction. Edit inline, or tell the AI copilot what to change in plain language.' },
              { t: 'Traffic Intelligence™ & Email', time: '~4 min', d: 'A platform priority matrix, ready-to-deploy ad copy, a VSL script, a UGC script, and full email sequences — before you spend a dollar on ads.' },
              { t: 'Publish & Go Live', time: 'instant', d: 'Connect a domain, connect Stripe or PayPal, and deploy. Your funnel is public and payment-enabled.' },
            ].map((step, i) => (
              <Reveal key={i}>
                <div className="grid gap-6 md:gap-8 py-8 items-start group" style={{ gridTemplateColumns: '56px 1fr', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-mono text-[13px] font-semibold text-[#A6A6B3] group-hover:text-violet-400 transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <h4 className="text-[18px] font-semibold text-[#F5F5F7] mb-2 tracking-[-0.01em]">{step.t}</h4>
                      <p className="text-[15px] text-[#A6A6B3] leading-relaxed max-w-[600px]">{step.d}</p>
                    </div>
                    <span className="font-mono text-[13px] text-[#505060] whitespace-nowrap flex-shrink-0 mt-1">{step.time}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHOWCASE ── */}
      <section className="py-[120px] md:py-[76px]" id="showcase">
        <div className="max-w-[1180px] mx-auto px-7">
          <Reveal>
            <div className="max-w-[680px] mb-16 mx-auto text-center">
              <Eyebrow center>Product Showcase</Eyebrow>
              <h2 className="font-semibold tracking-[-0.02em] leading-[1.08] mb-[18px] text-[#F5F5F7]" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>One workspace. Every phase of the offer, connected.</h2>
              <p className="text-[17px] text-[#A6A6B3] max-w-[560px] mx-auto">Each phase reads the one before it — nothing here is generic, because none of it is generated in isolation.</p>
            </div>
          </Reveal>
        </div>
        <div className="w-full py-4">
          <ShowcaseCarousel />
        </div>
      </section>

      {/* ── VAULT ── */}
      <section className="py-[120px] md:py-[76px]" id="vault">
        <div className="max-w-[1180px] mx-auto px-7">
          <Reveal>
            <div className="max-w-[680px] mb-16 mx-auto text-center">
              <Eyebrow center>Built-In Vault</Eyebrow>
              <h2 className="font-semibold tracking-[-0.02em] leading-[1.08] mb-[18px] text-[#F5F5F7]" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>Assets and templates, ready the moment you need them.</h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Reveal>
              <div className="rounded-2xl p-8 flex flex-col gap-5 h-full" style={{ background: '#14141F', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}><Package className="w-6 h-6 text-violet-400" /></div>
                <h3 className="text-[22px] font-semibold tracking-[-0.02em] text-[#F5F5F7]">Asset Bank — "Generates for you"</h3>
                <p className="text-[15px] text-[#A6A6B3] leading-relaxed">The moment your Intelligence Report is ready, the Asset Bank already knows which lead magnets and bonuses will move the needle — and writes them for you as real, downloadable files.</p>
                <ul className="flex flex-col gap-3 flex-1">
                  {["Auto-populated from your Bonus Stack & Revenue Model — no manual setup.", "One click generates a complete, titled, formatted PDF in under 60 seconds.", "Covers lead magnets, core bonuses, and fast-action bonuses — each written in your buyer's exact vocabulary."].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-[15px] text-[#A6A6B3]"><Check className="w-4 h-4 mt-0.5 text-violet-400 shrink-0" />{item}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Ebook', 'Checklist', 'Swipe File', 'Workbook'].map((label, i) => (<Chip key={i}><FileText className="w-3.5 h-3.5" /> {label}</Chip>))}
                </div>
              </div>
            </Reveal>
            <Reveal>
              <div className="rounded-2xl p-8 flex flex-col gap-5 h-full" style={{ background: '#14141F', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(79,140,255,0.12)', border: '1px solid rgba(79,140,255,0.25)' }}><Palette className="w-6 h-6 text-blue-400" /></div>
                <h3 className="text-[22px] font-semibold tracking-[-0.02em] text-[#F5F5F7]">Template Club — "You choose the start"</h3>
                <p className="text-[15px] text-[#A6A6B3] leading-relaxed">A growing library of pre-built funnel and page layouts, organized by niche and offer type — pulled from patterns that already convert. Browse, preview, and drop one straight into your workspace.</p>
                <ul className="flex flex-col gap-3 flex-1">
                  {["Organized by niche and offer type — course, coaching, digital product, service.", "New templates added continuously as a member's library, included with every plan.", "Clone a template, then let your Intelligence Report auto-fill it with your own copy and design direction."].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-[15px] text-[#A6A6B3]"><Check className="w-4 h-4 mt-0.5 text-blue-400 shrink-0" />{item}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Coach', 'Course', 'SaaS', 'Agency'].map((label, i) => (<Chip key={i}><Layers className="w-3.5 h-3.5" /> {label}</Chip>))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── SCENARIOS ── */}
      <section className="py-[120px] md:py-[76px]" id="scenarios">
        <div className="max-w-[1180px] mx-auto px-7">
          <Reveal>
            <div className="max-w-[680px] mb-12 mx-auto text-center">
              <Eyebrow center>Illustrative Scenarios</Eyebrow>
              <h2 className="font-semibold tracking-[-0.02em] leading-[1.08] mb-[18px] text-[#F5F5F7]" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>Whoever you are, the wall looks familiar.</h2>
              <p className="text-[17px] text-[#A6A6B3] max-w-[560px] mx-auto">Four representative profiles — tap through to see how the same platform solves four different problems.</p>
            </div>
          </Reveal>
          <Reveal>
            <div className="flex gap-2 flex-wrap mb-8">
              {scenarios.map((sc, i) => (
                <button key={i}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[14px] font-medium transition-all cursor-pointer border ${activeScenario === i ? 'text-white' : 'text-[#A6A6B3] hover:text-white'}`}
                  style={{ background: activeScenario === i ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)', borderColor: activeScenario === i ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)' }}
                  onClick={() => setActiveScenario(i)}>
                  <span>{sc.emoji}</span>{sc.tab}
                </button>
              ))}
            </div>
          </Reveal>
          <div key={activeScenario} className="grid grid-cols-1 md:grid-cols-2 gap-12 rounded-2xl p-8 md:p-12" style={{ background: '#14141F', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full text-2xl flex items-center justify-center flex-shrink-0" style={{ background: '#1E1E2E', border: '1px solid rgba(255,255,255,0.1)' }}>{s.emoji}</div>
                <div className="flex flex-col gap-1">
                  <b className="font-semibold text-[#F5F5F7]">{s.who}</b>
                  <span className="text-[13px] text-[#505060]">{s.meta}</span>
                </div>
              </div>
              <blockquote className="text-[22px] font-semibold leading-snug text-[#F5F5F7] mb-6 tracking-[-0.02em]">{s.quote}</blockquote>
              <p className="text-[16px] text-[#A6A6B3] leading-relaxed">{s.body}</p>
            </div>
            <div className="flex flex-col gap-4">
              {s.stats.map((st, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl p-4" style={{ background: '#1E1E2E' }}>
                  <TrendingUp className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    {'from' in st && st.from && <div className="text-[13px] text-[#505060] line-through">{st.from}</div>}
                    {'to' in st && st.to && <div className="text-[15px] text-white font-semibold">{st.to}</div>}
                    {'single' in st && st.single && <div className="text-[15px] text-white font-semibold">{st.single}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center font-mono text-[12px] text-[#505060] mt-6">
            Illustrative scenarios based on representative buyer profiles — not actual customer accounts.
          </p>
        </div>
      </section>

      {/* ── COMPARE ── */}
      <section className="py-[120px] md:py-[76px]" id="compare">
        <div className="max-w-[1180px] mx-auto px-7">
          <Reveal>
            <div className="max-w-[680px] mb-16 mx-auto text-center">
              <Eyebrow center>Replace The Stack</Eyebrow>
              <h2 className="font-semibold tracking-[-0.02em] leading-[1.08] mb-[18px] text-[#F5F5F7]" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>What this replaces, per offer</h2>
              <p className="text-[17px] text-[#A6A6B3] max-w-[560px] mx-auto">Typical market rates for each role, sourced from standard freelance and SaaS pricing ranges — for reference, not a guarantee.</p>
            </div>
          </Reveal>
          <Reveal>
            <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                    <th className="text-left py-4 px-6 font-mono text-[11px] text-[#505060] uppercase tracking-[0.1em]">Capability</th>
                    <th className="text-left py-4 px-6 font-mono text-[11px] text-[#505060] uppercase tracking-[0.1em]">Typical Cost Elsewhere</th>
                    <th className="text-left py-4 px-6 font-mono text-[11px] text-[#505060] uppercase tracking-[0.1em]">In OfferIQ</th>
                  </tr>
                </thead>
                <tbody>
                  {compareRows.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <td className="py-4 px-6 text-[#A6A6B3] text-[15px]">{r[0]}</td>
                      <td className="py-4 px-6 text-[#505060] text-[15px] line-through">{r[1]}</td>
                      <td className="py-4 px-6 text-emerald-400 text-[15px] font-medium"><span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Included</span></td>
                    </tr>
                  ))}
                  <tr style={{ background: 'rgba(124,58,237,0.07)', borderTop: '1px solid rgba(124,58,237,0.2)' }}>
                    <td className="py-5 px-6 text-[#F5F5F7] font-semibold text-[15px]">Total to replicate manually, per offer</td>
                    <td className="py-5 px-6 text-[#505060] text-[15px] line-through">$21,000 – $172,000+</td>
                    <td className="py-5 px-6 text-violet-400 font-semibold text-[15px]"><span className="flex items-center gap-1.5"><Zap className="w-4 h-4" /> From $39/mo</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-[120px] md:py-[76px]" id="pricing">
        <div className="max-w-[1180px] mx-auto px-7">
          <Reveal>
            <div className="max-w-[680px] mb-16 mx-auto text-center">
              <Eyebrow center>Pricing</Eyebrow>
              <h2 className="font-semibold tracking-[-0.02em] leading-[1.08] mb-[18px] text-[#F5F5F7]" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>Simple monthly pricing.</h2>
              <p className="text-[17px] text-[#A6A6B3] max-w-[560px] mx-auto">Try Starter for $1 over your first 7 days, then $39/mo. Cancel anytime — from your account, in one click.</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingTiers.map((t, i) => (
              <Reveal key={i}>
                <div className="relative rounded-2xl p-8 flex flex-col gap-5 h-full"
                  style={{ background: t.popular ? '#14141F' : '#0F0F17', border: t.popular ? '1px solid rgba(124,58,237,0.35)' : '1px solid rgba(255,255,255,0.07)', boxShadow: t.popular ? '0 0 50px rgba(124,58,237,0.15)' : 'none' }}>
                  {t.popular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[11px] font-bold uppercase tracking-widest text-white px-3 py-1 rounded-full"
                      style={{ background: 'linear-gradient(135deg,#0066FF 0%,#4338CA 100%)' }}>Most Popular</span>
                  )}
                  <span className="font-mono text-[11px] uppercase tracking-widest text-[#505060]">{t.name}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[48px] font-bold text-[#F5F5F7]" style={{ letterSpacing: '-2px' }}>{t.price}</span>
                    <span className="text-[17px] text-[#505060]">{t.period}</span>
                  </div>
                  <p className="text-[13px] text-[#505060] leading-relaxed">{t.sub}</p>
                  <ul className="flex flex-col gap-3 flex-1">
                    {t.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-[14px] text-[#A6A6B3]">
                        <Check className="w-4 h-4 mt-0.5 text-violet-400 shrink-0" />
                        <span dangerouslySetInnerHTML={{ __html: f }} />
                      </li>
                    ))}
                  </ul>
                  <p className="text-[13px] text-[#505060] leading-relaxed">{t.best}</p>
                  <a href="/login"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[10px] text-[14px] font-semibold transition-all hover:-translate-y-0.5"
                    style={{ background: t.popular ? 'linear-gradient(135deg,#0066FF 0%,#4338CA 100%)' : 'rgba(255,255,255,0.04)', color: '#F5F5F7', border: t.popular ? 'none' : '1px solid rgba(255,255,255,0.14)', boxShadow: t.popular ? '0 8px 30px -8px rgba(139,92,246,0.6)' : 'none' }}>
                    {t.cta}
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="flex items-center gap-3 mt-12 max-w-[600px] mx-auto p-4 rounded-xl text-[14px] text-[#A6A6B3]"
              style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Backed by a 30-day money-back guarantee. If OfferIQ isn't right for you, get a full refund — no conditions.</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-[120px] md:py-[76px]" id="faq">
        <div className="max-w-[1180px] mx-auto px-7">
          <Reveal>
            <div className="max-w-[680px] mb-16 mx-auto text-center">
              <Eyebrow center>Questions</Eyebrow>
              <h2 className="font-semibold tracking-[-0.02em] leading-[1.08] text-[#F5F5F7]" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>Frequently asked questions</h2>
            </div>
          </Reveal>
          <Reveal>
            <div className="max-w-[760px] mx-auto">
              {faqs.map((f, i) => (
                <FaqItem key={i} q={f.q} a={f.a} isOpen={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-[120px] md:py-[76px]" id="cta">
        <div className="max-w-[1180px] mx-auto px-7">
          <Reveal>
            <div className="max-w-[600px] mx-auto text-center">
              <Eyebrow center>Ready When You Are</Eyebrow>
              <h2 className="font-semibold tracking-[-0.02em] leading-[1.08] mb-[18px] text-[#F5F5F7]" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>Your next offer is one click away.</h2>
              <p className="text-[17px] text-[#A6A6B3] leading-relaxed mb-8">Every month without a validated offer is a month of revenue you don't make. OfferIQ closes the gap between idea and income — in one session.</p>
              <div className="flex items-center justify-center gap-4 flex-wrap mb-6">
                <a href="/login" className="inline-flex items-center gap-2 px-7 py-[15px] rounded-full text-white text-[15px] font-semibold transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg,#0066FF 0%,#4338CA 100%)', boxShadow: '0 8px 30px -8px rgba(139,92,246,0.6)' }}>
                  Build My Next Offer <ArrowRight className="w-4 h-4" />
                </a>
                <a href="#pricing" className="inline-flex items-center gap-2 px-7 py-[15px] rounded-full text-[15px] font-semibold text-[#F5F5F7] transition-all hover:bg-white/[0.08]"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.14)' }}>
                  See Pricing
                </a>
              </div>
              <p className="font-mono text-[12.5px] text-[#505060]">// $1 gets you in the door for 7 days. Cancel anytime.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-[1180px] mx-auto px-7 py-16">
          <div className="flex flex-col lg:flex-row gap-16 pb-16" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="max-w-sm">
              <div className="flex items-center gap-[9px] font-semibold text-[18px] text-[#F5F5F7] mb-4">
                <LogoMark />
                OfferIQ
              </div>
              <p className="text-[15px] text-[#A6A6B3] leading-relaxed">The intelligence layer that should happen before anything gets built — delivered instantly, and connected directly to the copy, pages, and traffic plan that follow from it.</p>
              <div className="flex flex-wrap gap-2 mt-5">
                {[['CreditCard','Stripe'],['CreditCard','PayPal'],['Megaphone','Meta Ads'],['Music','TikTok']].map(([icon, label], i) => (
                  <Chip key={i}>
                    {icon === 'CreditCard' ? <CreditCard className="w-3.5 h-3.5" /> : icon === 'Megaphone' ? <Megaphone className="w-3.5 h-3.5" /> : <Music className="w-3.5 h-3.5" />}
                    {label}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-8 flex-1">
              {[
                { title: 'Product', links: [['#showcase','Feature Showcase'],['#vault','Asset Bank & Templates'],['/login','Pricing']] },
                { title: 'Company', links: [['help.ofiq.app','Knowledge base'],['mailto:help@ofiq.app','Contact Support'],['#faq','FAQ']] },
                { title: 'Legal', links: [['#','Terms of Service'],['#','Privacy Policy'],['#','Refund Policy']] },
              ].map((col, i) => (
                <div key={i}>
                  <h5 className="font-semibold text-[#F5F5F7] mb-4 text-[14px]">{col.title}</h5>
                  {col.links.map(([href, label], j) => (
                    <a key={j} href={href} className="block text-[#A6A6B3] text-[14px] hover:text-[#F5F5F7] transition-colors mb-3">{label}</a>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 text-[13px] text-[#505060]">
            <span>© 2026 OfferIQ, a Chigisoft product. All rights reserved.</span>
            <span>Built for creators who'd rather launch than guess.</span>
          </div>
        </div>
      </footer>

      {/* ── Mobile sticky CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 flex md:hidden" style={{ background: 'rgba(8,8,13,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <a href="/login" className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-full text-white font-semibold text-[15px]"
          style={{ background: 'linear-gradient(135deg,#0066FF 0%,#4338CA 100%)' }}>
          Start Building <ArrowRight className="w-4 h-4" />
        </a>
      </div>

    </div>
  );
}
