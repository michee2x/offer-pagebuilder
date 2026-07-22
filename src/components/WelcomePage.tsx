'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useScroll, useTransform, motion } from 'motion/react';
import {
  Link as LinkIcon, FileText, PenTool, Target, Users, DollarSign, Zap,
  Check, CreditCard, Megaphone, Music, ArrowRight, TrendingUp, Shield,
  Layers, Package, Palette, Rocket, GraduationCap, Mic, Building2, Sprout, Crown,
  Compass
} from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Timeline } from "@/components/ui/timeline";
import { WobbleCard } from "@/components/ui/wobble-card";
import { CardSpotlight } from "@/components/ui/card-spotlight";

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
    <div className={`flex items-center gap-2 font-mono text-[12.5px] tracking-[0.14em] uppercase text-[#A78BFA] mb-[18px] ${center ? 'justify-center' : ''}`}>
      <span className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: 'linear-gradient(135deg,#8B5CF6 0%,#3B82F6 100%)', boxShadow: '0 0 14px rgba(139,92,246,0.5)' }} />
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
      style={{ background: 'linear-gradient(135deg,#8B5CF6 0%,#3B82F6 100%)', boxShadow: '0 3px 14px -3px rgba(139,92,246,0.65)' }}>
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

const Step = ({ title }: { title: string }) => {
  return (
    <li className="flex gap-3 items-start">
      <CheckIcon />
      <p className="text-[#A6A6B3] text-[14.5px] mt-0.5 leading-relaxed">{title}</p>
    </li>
  );
};

const CheckIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-violet-500 mt-1 shrink-0">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 2c-.218 0 -.432 .002 -.642 .005l-.616 .017l-.299 .013l-.579 .034l-.553 .046c-4.785 .464 -6.732 2.411 -7.196 7.196l-.046 .553l-.034 .579c-.005 .098 -.01 .198 -.013 .299l-.017 .616l-.004 .318l-.001 .324c0 .218 .002 .432 .005 .642l.017 .616l.013 .299l.034 .579l.046 .553c.464 4.785 2.411 6.732 7.196 7.196l.553 .046l.579 .034c.098 .005 .198 .01 .299 .013l.616 .017l.642 .005l.642 -.005l.616 -.017l.299 -.013l.579 -.034l.553 -.046c4.785 -.464 6.732 -2.411 7.196 -7.196l.046 -.553l.034 -.579c.005 -.098 .01 -.198 .013 -.299l.017 -.616l.005 -.642l-.005 -.642l-.017 -.616l-.013 -.299l-.034 -.579l-.046 -.553c-.464 -4.785 -2.411 -6.732 -7.196 -7.196l-.553 -.046l-.579 -.034a28.058 28.058 0 0 0 -.299 -.013l-.616 -.017l-.318 -.004l-.324 -.001zm2.293 7.293a1 1 0 0 1 1.497 1.32l-.083 .094l-4 4a1 1 0 0 1 -1.32 .083l-.094 -.083l-2 -2a1 1 0 0 1 1.32 -1.497l.094 .083l1.293 1.292l3.293 -3.292z" fill="currentColor" strokeWidth="0" />
    </svg>
  );
};

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

  const whyTimelineData = [
    {
      title: "Trap 1",
      content: (
        <div>
          <p className="mb-4 text-xl font-medium text-violet-300 md:text-2xl">
            The "Blank Canvas" Trap
          </p>
          <p className="mb-8 text-sm font-normal text-[#A6A6B3] md:text-[17px] leading-relaxed">
            <span className="font-mono tracking-tight text-[#F5F5F7] text-2xl md:text-3xl font-light mr-2">42%</span> 
            of startups fail simply because they build products with absolutely no market need — chasing demand that was never there until the cash runs out.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://assets.aceternity.com/templates/startup-1.webp"
              alt="startup template"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
            <img
              src="https://assets.aceternity.com/templates/startup-2.webp"
              alt="startup template"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
            <img
              src="https://assets.aceternity.com/templates/startup-3.webp"
              alt="startup template"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
            <img
              src="https://assets.aceternity.com/templates/startup-4.webp"
              alt="startup template"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Trap 2",
      content: (
        <div>
          <p className="mb-4 text-xl font-medium text-violet-300 md:text-2xl">
            The Pricing Trap
          </p>
          <p className="mb-8 text-sm font-normal text-[#A6A6B3] md:text-[17px] leading-relaxed">
            <span className="font-mono tracking-tight text-[#F5F5F7] text-2xl md:text-3xl font-light mr-2">18%</span> 
            of startups collapse due to flawed pricing models — charging too much for the market to bear, or too little to sustain operations.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://assets.aceternity.com/pro/hero-sections.png"
              alt="hero template"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
            <img
              src="https://assets.aceternity.com/features-section.png"
              alt="feature template"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
            <img
              src="https://assets.aceternity.com/pro/bento-grids.png"
              alt="bento template"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
            <img
              src="https://assets.aceternity.com/cards.png"
              alt="cards template"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Trap 3",
      content: (
        <div>
          <p className="mb-4 text-xl font-medium text-violet-300 md:text-2xl">
            The "Acquisition Cost" Trap
          </p>
          <p className="mb-4 text-sm font-normal text-[#A6A6B3] md:text-[17px] leading-relaxed">
            <span className="font-mono tracking-tight text-[#F5F5F7] text-2xl md:text-3xl font-light mr-2">222%+</span> 
            is how far Customer Acquisition Costs have climbed. Hyper-expensive clicks sent to a slow, pieced-together funnel bleed profit dry before the first sale.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://assets.aceternity.com/pro/hero-sections.png"
              alt="hero template"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
            <img
              src="https://assets.aceternity.com/features-section.png"
              alt="feature template"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
            <img
              src="https://assets.aceternity.com/pro/bento-grids.png"
              alt="bento template"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
            <img
              src="https://assets.aceternity.com/cards.png"
              alt="cards template"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
          </div>
        </div>
      ),
    },
  ];

  const scenarios = [
    {
      icon: GraduationCap, tab: 'Course Creator', who: 'Marketing Consultant', meta: '34 · Austin, TX · 14K Instagram followers',
      quote: <>"I'd researched competitors, taken two copywriting courses, and paid $800 for a coach call. <span style={{ color: '#60A5FA' }}>I still had nothing live.</span>"</>,
      body: "She uploaded her course idea as a text description. In under a minute, OfferIQ returned her exact persona, a price point $300 higher than she'd planned to charge, five conversion hooks, and a full funnel blueprint — then wrote and built the entire funnel in the same session.",
      stats: [{ from: '6 months stuck', to: 'Live in one evening' }, { from: '$197 planned price', to: '$497 recommended price' }, { single: '5 pages + funnel — written, designed, and published in one session' }],
    },
    {
      icon: Mic, tab: 'Business Coach', who: 'Executive Life Coach', meta: '41 · Atlanta, GA · $3,500 program',
      quote: <>"I knew the problem was in the messaging. <span style={{ color: '#60A5FA' }}>I just couldn't see what was wrong with it.</span>"</>,
      body: "She pasted her existing sales page URL into OfferIQ. The Intelligence Report found the real problem in seconds: her page led with a 12-step curriculum, but her buyer purchases from identity anxiety. OfferIQ rewrote the copy around that insight and raised her price to $4,500.",
      stats: [{ from: '0.7% conversion', to: '2.5%+ projected, same ad budget' }, { from: '$9,600 spent, unprofitable', to: 'Profitable within 30 days (projected)' }, { from: '$3,500 price', to: '$4,500 pricing correction' }],
    },
    {
      icon: Building2, tab: 'Agency Owner', who: 'Digital Marketing Agency Owner', meta: '38 · Denver, CO · 6-person team',
      quote: <>"Every new service means a new hiring decision. <span style={{ color: '#60A5FA' }}>I couldn't productize this without a repeatable system.</span>"</>,
      body: "He wanted to add offer strategy and funnel building as a $3,000–$5,000 productized service, without hiring. He now runs each client's offer through OfferIQ. What took his team three weeks now takes two hours.",
      stats: [{ from: '3 weeks per client', to: '2 hours per client' }, { single: '$15,000–$30,000/month projected new service-line revenue' }, { single: 'Zero new hires required to deliver it' }],
    },
    {
      icon: Sprout, tab: 'First-Time Entrepreneur', who: 'Corporate HR Professional', meta: '29 · Chicago, IL · 8 yrs experience',
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
    <div className="dark antialiased overflow-x-hidden" style={{ background: '#08080D', color: '#F5F5F7', fontFamily: "'FramerHeroBody', 'General Sans', -apple-system, BlinkMacSystemFont, sans-serif", lineHeight: 1.6, WebkitFontSmoothing: 'antialiased' }}>

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
              style={{ background: 'linear-gradient(135deg,#8B5CF6 0%,#3B82F6 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2),0 0 0 1px rgba(139,92,246,0.5),0 4px 20px -4px rgba(139,92,246,0.7)' }}>
              Log In
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero-section relative overflow-hidden min-h-[160vh]" id="hero" ref={heroRef}
        style={{
          backgroundColor: '#08080D',
          backgroundImage: `url('https://framerusercontent.com/images/tNr9II3jZ7nSELI0b7PCG4TjJs.png?scale-down-to=4096&width=5760&height=3232')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
        }}>
        {/* Dark overlay to ensure text remains readable */}
        <div className="absolute inset-0 bg-[#08080D]/40 pointer-events-none z-0"></div>

        {/* Ambient purple-blue glow */}
        <div aria-hidden="true" className="absolute rounded-full pointer-events-none z-0 w-[1100px] h-[700px] -top-[180px] left-1/2 -translate-x-1/2 blur-[50px]"
          style={{ background: 'radial-gradient(ellipse at center,rgba(139,92,246,0.24) 0%,rgba(59,130,246,0.14) 45%,transparent 70%)' }} />

        <div className="relative z-[1] px-7 pt-[150px] pb-20 flex flex-col items-center" style={{ perspective: '1200px' }}>
          {/* Framer Container for text block */}
          <motion.div className="framer-1nctip6 w-full max-w-[840px] text-center mx-auto mb-[60px] relative z-[2]" style={{ translateY: titleTranslate }}>
            <section className="framer-n851dn">
              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 mb-2 cursor-default transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '100px', padding: '6px 14px 6px 10px' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#8B5CF6' }} />
                <span className="text-[13px] font-medium text-[#C4B5FD]" style={{ fontFamily: "'FramerHeroAccent', sans-serif" }}>New: Intelligence-First Offer OS v2.0</span>
                <ArrowRight style={{ width: 12, height: 12, marginLeft: 4, flexShrink: 0, color: '#A78BFA' }} />
              </div>

              {/* Framer Main Headline */}
              <div className="framer-t2w3o5 mt-4">
                <h1 className="hero-h1 text-[#F5F5F7]" style={{ fontFamily: "'FramerHeroAccent', 'Clash Display', 'General Sans', sans-serif", fontSize: 'clamp(32px, 4.5vw, 52px)', lineHeight: 1.15, fontWeight: 700, letterSpacing: '-0.02em', maxWidth: '800px', margin: '0 auto' }}>
                  <span className="text-white">Stop guessing what sells.</span><br />
                  Engineer an offer that{' '}
                  <span style={{ color: '#34D399' }}>converts</span>.
                </h1>
              </div>

              {/* Framer Subtext / Description */}
              <div className="framer-gdfpn4 mt-5">
                <p style={{ fontFamily: "'Host Grotesk', 'General Sans', sans-serif", fontSize: 'clamp(14px, 1.5vw, 16px)', lineHeight: 1.55, color: '#A6A6B3', maxWidth: '640px', margin: '0 auto' }}>
                  Upload a URL, PDF, or a single idea. OfferIQ benchmarks it against 35,000+ real converting offers and returns your complete revenue system — strategy, copy, a live funnel, and a traffic plan. All in one session.
                </p>
              </div>
            </section>

            <div className="flex items-center justify-center gap-4 mt-8 mb-4 flex-wrap">
              <a href="/login" className="inline-flex items-center gap-2 px-[32px] py-[14px] rounded-full text-white text-[14.5px] font-bold transition-all hover:-translate-y-0.5"
                style={{ background: 'radial-gradient(150% 150% at 50% 0%, #D946EF 0%, #8B5CF6 50%, #4F46E5 100%)', boxShadow: '0 14px 30px rgba(192, 132, 252, 0.35)', fontFamily: "'Host Grotesk', sans-serif" }}>
                Build My Offer Now
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-3.5 h-3.5"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </a>
              <a href="/login" className="inline-flex items-center gap-2 px-[32px] py-[14px] rounded-full text-[14.5px] font-semibold text-[#F5F5F7] transition-all hover:bg-white/[0.08] hover:border-white/25"
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', fontFamily: "'Host Grotesk', sans-serif" }}>
                Start Your $1 Trial
              </a>
            </div>

            <p className="text-[12px] text-[#6B6B7B] leading-[1.7] font-mono tracking-wide" style={{ fontFamily: "'Host Grotesk', monospace" }}>
              $1 for your first 7 days &middot; $39/mo after &middot; Cancel anytime &middot; 30-day money-back guarantee
            </p>
          </motion.div>

          {/* 3D Card */}
          <motion.div
            className="w-full max-w-[1040px] rounded-[30px] relative z-[1] p-5"
            style={{
              height: 580,
              border: '1px solid rgba(139,92,246,0.25)',
              background: 'linear-gradient(180deg, #1A1020 0%, #111118 100%)',
              rotateX: cardRotate, scale: cardScale, transformOrigin: 'center top',
              boxShadow: '0 0 0 1px rgba(59,130,246,0.08), 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 40px 80px -20px rgba(139,92,246,0.15)',
            }}
          >
            <div className="h-full w-full rounded-[18px] overflow-hidden bg-[#18181b] p-3.5 relative pointer-events-none" style={{ height: '100%' }}>
              <iframe
                src="https://www.youtube.com/embed/TX9qSaGXFyU?autoplay=1&mute=1&loop=1&playlist=TX9qSaGXFyU&controls=0&showinfo=0&rel=0&disablekb=1&iv_load_policy=3&modestbranding=1&start=10"
                className="rounded-[10px] block"
                allow="autoplay; encrypted-media"
                style={{ border: 0, width: '100%', height: '100%' }}
              ></iframe>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── WHY IT MATTERS ── */}
      <section className="py-[60px]" id="why">
        <div className="relative w-full overflow-clip">
          <Timeline data={whyTimelineData} />
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
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto w-full">
            <WobbleCard
              containerClassName="col-span-1 lg:col-span-2 h-full bg-pink-800 min-h-[500px] lg:min-h-[300px]"
              className=""
            >
              <div className="max-w-xs relative z-20">
                <h2 className="text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                  Analyse & Build My Offer
                </h2>
                <p className="mt-4 text-left text-base/6 text-neutral-200">
                  You already have an offer, a live page, or a rough idea. Paste a URL, upload a PDF, or describe it in your own words — OfferIQ builds the complete intelligence report, copy, and funnel around what you already have.
                </p>
                <div className="flex flex-col gap-3 mt-6">
                  <span className="flex items-center gap-2 text-sm text-white/80 bg-white/10 w-fit px-3 py-1.5 rounded-full"><LinkIcon className="w-4 h-4" /> Paste a URL</span>
                  <span className="flex items-center gap-2 text-sm text-white/80 bg-white/10 w-fit px-3 py-1.5 rounded-full"><FileText className="w-4 h-4" /> Upload a PDF</span>
                  <span className="flex items-center gap-2 text-sm text-white/80 bg-white/10 w-fit px-3 py-1.5 rounded-full"><PenTool className="w-4 h-4" /> Describe it</span>
                </div>
              </div>
              <img
                src="https://assets.aceternity.com/pro/bento-grids.png"
                width={500}
                height={500}
                alt="platform demo"
                className="absolute -right-4 lg:-right-[40%] grayscale filter -bottom-10 object-contain rounded-2xl"
              />
            </WobbleCard>
            
            <WobbleCard containerClassName="col-span-1 min-h-[300px]">
              <h2 className="max-w-80 text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                Two entry points. One destination.
              </h2>
              <p className="mt-4 max-w-[26rem] text-left text-base/6 text-neutral-200">
                Every path lands in the exact same place: a complete, validated Intelligence Report ready to scale.
              </p>
              <a href="/login" className="mt-8 inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#F5F5F7] rounded-full px-[18px] py-2.5 transition-all hover:-translate-y-0.5 hover:bg-white/[0.1] relative z-20"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                Start here <ArrowRight className="w-4 h-4" />
              </a>
            </WobbleCard>
            
            <WobbleCard containerClassName="col-span-1 lg:col-span-3 bg-blue-900 min-h-[500px] lg:min-h-[600px] xl:min-h-[300px]">
              <div className="max-w-sm relative z-20">
                <h2 className="max-w-sm md:max-w-lg text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                  Build an Offer For Me
                </h2>
                <p className="mt-4 max-w-[26rem] text-left text-base/6 text-neutral-200">
                  You have an audience and expertise, but no product. Give OfferIQ your niche, audience, and price range — get validated offer ideas benchmarked against real converting funnels, ready to build the moment you pick one.
                </p>
                <div className="flex gap-3 mt-6 flex-wrap">
                  <span className="flex items-center gap-2 text-sm text-white/80 bg-white/10 w-fit px-3 py-1.5 rounded-full"><Target className="w-4 h-4" /> Pick a niche</span>
                  <span className="flex items-center gap-2 text-sm text-white/80 bg-white/10 w-fit px-3 py-1.5 rounded-full"><Users className="w-4 h-4" /> Define buyer</span>
                  <span className="flex items-center gap-2 text-sm text-white/80 bg-white/10 w-fit px-3 py-1.5 rounded-full"><DollarSign className="w-4 h-4" /> Set price range</span>
                </div>
              </div>
              <img
                src="https://assets.aceternity.com/pro/hero-sections.png"
                width={500}
                height={500}
                alt="platform demo"
                className="absolute -right-10 md:-right-[40%] lg:-right-[20%] -bottom-10 object-contain rounded-2xl"
              />
            </WobbleCard>
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
          <div className="flex flex-col gap-5">
            {[
              { t: 'Intelligence Report', time: '~4 min', d: 'Your offer is analyzed against 35,000+ validated funnels — positioning, persona, pricing, hooks, and a full funnel blueprint come back specific to you.' },
              { t: 'Copy Engine', time: '~2 min', d: "Lead page, long-form sales page, upsell, downsell, and thank-you copy — written from the intelligence report, in your buyer's exact vocabulary." },
              { t: 'Page Builder', time: '~5 min', d: 'Every page assembles automatically using your design direction. Edit inline, or tell the AI copilot what to change in plain language.' },
              { t: 'Traffic Intelligence™ & Email', time: '~4 min', d: 'A platform priority matrix, ready-to-deploy ad copy, a VSL script, a UGC script, and full email sequences — before you spend a dollar on ads.' },
              { t: 'Publish & Go Live', time: 'instant', d: 'Connect a domain, connect Stripe or PayPal, and deploy. Your funnel is public and payment-enabled.' },
            ].map((step, i) => (
              <Reveal key={i}>
                <div className="relative flex flex-col md:flex-row gap-6 md:gap-8 p-6 md:p-8 items-start group bg-[#11111A] border border-white/[0.04] rounded-3xl transition-all duration-300 hover:bg-[#14141F] hover:border-white/[0.08] hover:shadow-2xl overflow-hidden">
                  <div className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center font-mono text-[16px] font-bold text-[#A6A6B3] group-hover:text-violet-400 flex-shrink-0 transition-colors duration-300"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6 flex-1 w-full pt-1">
                    <div>
                      <h4 className="text-[20px] font-semibold text-[#F5F5F7] mb-2.5 tracking-tight group-hover:text-white transition-colors">{step.t}</h4>
                      <p className="text-[15.5px] text-[#A6A6B3] leading-relaxed max-w-[640px] group-hover:text-[#D4D4E0] transition-colors">{step.d}</p>
                    </div>
                    <div className="flex items-center px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 whitespace-nowrap flex-shrink-0 transition-all">
                      <span className="font-mono text-[13px] font-bold text-emerald-400 tracking-wide uppercase">{step.time}</span>
                    </div>
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

          <div className="flex flex-col gap-8 md:gap-16">
            {/* Row 1 */}
            <Reveal>
              <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-center py-[40px] md:py-[70px] border-b border-white/10">
                <div className="flex flex-col flex-1 w-full">
                  <span className="inline-flex items-center gap-2 font-mono text-[12px] text-blue-400 tracking-[0.08em] uppercase mb-4">
                    <Compass className="w-3.5 h-3.5" /> 01 · Choice Gate
                  </span>
                  <h3 className="text-[clamp(22px,3vw,30px)] font-semibold mb-[18px] text-[#F5F5F7]">Start from what you have — or start from nothing at all</h3>
                  <ul className="flex flex-col gap-[14px] mt-[22px]">
                    <li className="flex gap-3 items-start text-[15px] text-[#A6A6B3]"><Check className="w-[18px] h-[18px] shrink-0 mt-1 text-emerald-400" /> <span dangerouslySetInnerHTML={{ __html: '<b>Analyse & Build My Offer</b> for a URL, PDF, or idea you already have.' }} /></li>
                    <li className="flex gap-3 items-start text-[15px] text-[#A6A6B3]"><Check className="w-[18px] h-[18px] shrink-0 mt-1 text-emerald-400" /> <span dangerouslySetInnerHTML={{ __html: '<b>Build an Offer For Me</b> generates validated offer ideas from your niche, audience, and price range.' }} /></li>
                    <li className="flex gap-3 items-start text-[15px] text-[#A6A6B3]"><Check className="w-[18px] h-[18px] shrink-0 mt-1 text-emerald-400" /> <span dangerouslySetInnerHTML={{ __html: 'Every path lands in the same place: a complete Intelligence Report, ready in minutes.' }} /></li>
                  </ul>
                </div>
                <div className="flex-1 w-full">
                  <div className="bg-[#14141F] border border-white/10 rounded-[16px] overflow-hidden shadow-[0_30px_70px_-30px_rgba(0,0,0,0.6)] transition-transform duration-500 hover:-translate-y-1">
                    <video autoPlay loop muted playsInline className="w-full h-auto object-cover pointer-events-none">
                      <source src="/videos/choice-gate.mp4" type="video/mp4" />
                    </video>
                    <div className="font-mono text-[11px] text-[#6B6B7B] p-3 px-4 border-t border-white/10 bg-[#191927]">
                      [ Product Video: OfferIQ choice gate → intelligence report ]
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Row 2 (Reverse) */}
            <Reveal>
              <div className="flex flex-col md:flex-row-reverse gap-12 md:gap-16 items-center py-[40px] md:py-[70px] border-b border-white/10">
                <div className="flex flex-col flex-1 w-full">
                  <span className="inline-flex items-center gap-2 font-mono text-[12px] text-blue-400 tracking-[0.08em] uppercase mb-4">
                    <PenTool className="w-3.5 h-3.5" /> 02 · Copy and Pages Built From Your Data
                  </span>
                  <h3 className="text-[clamp(22px,3vw,30px)] font-semibold mb-[18px] text-[#F5F5F7]">Copy and pages built from your data, not a template</h3>
                  <ul className="flex flex-col gap-[14px] mt-[22px]">
                    <li className="flex gap-3 items-start text-[15px] text-[#A6A6B3]"><Check className="w-[18px] h-[18px] shrink-0 mt-1 text-emerald-400" /> <span dangerouslySetInnerHTML={{ __html: 'Every word is written from your <b>Intelligence Report</b> — not a generic swipe file, so your copy actually speaks to your specific buyer.' }} /></li>
                    <li className="flex gap-3 items-start text-[15px] text-[#A6A6B3]"><Check className="w-[18px] h-[18px] shrink-0 mt-1 text-emerald-400" /> <span dangerouslySetInnerHTML={{ __html: 'Full funnel copy in one pass: <b>Lead Capture, Long-Form Sales Page (up to 12,000 words), Upsell, Downsell, and Thank You pages.</b>' }} /></li>
                    <li className="flex gap-3 items-start text-[15px] text-[#A6A6B3]"><Check className="w-[18px] h-[18px] shrink-0 mt-1 text-emerald-400" /> <span dangerouslySetInnerHTML={{ __html: 'Pages assemble themselves — colors, fonts, and layout pulled straight from your <b>Design Intelligence</b>, no design decisions left to guess at.' }} /></li>
                    <li className="flex gap-3 items-start text-[15px] text-[#A6A6B3]"><Check className="w-[18px] h-[18px] shrink-0 mt-1 text-emerald-400" /> <span dangerouslySetInnerHTML={{ __html: 'Refine anything by chatting — tell the built-in <b>AI copilot</b> “make this headline punchier” and watch it update in real time.' }} /></li>
                    <li className="flex gap-3 items-start text-[15px] text-[#A6A6B3]"><Check className="w-[18px] h-[18px] shrink-0 mt-1 text-emerald-400" /> <span dangerouslySetInnerHTML={{ __html: 'Drag-and-drop when you want manual control — reorder sections, swap images, edit inline.' }} /></li>
                  </ul>
                </div>
                <div className="flex-1 w-full">
                  <div className="bg-[#14141F] border border-white/10 rounded-[16px] overflow-hidden shadow-[0_30px_70px_-30px_rgba(0,0,0,0.6)] transition-transform duration-500 hover:-translate-y-1">
                    <video autoPlay loop muted playsInline className="w-full h-auto object-cover pointer-events-none">
                      <source src="/videos/copy-engine.mp4" type="video/mp4" />
                    </video>
                    <div className="font-mono text-[11px] text-[#6B6B7B] p-3 px-4 border-t border-white/10 bg-[#191927]">
                      [ Product Video: Copy Engine writing live from your Intelligence Report ]
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Row 3 */}
            <Reveal>
              <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-center py-[40px] md:py-[70px] border-b border-white/10">
                <div className="flex flex-col flex-1 w-full">
                  <span className="inline-flex items-center gap-2 font-mono text-[12px] text-blue-400 tracking-[0.08em] uppercase mb-4">
                    <Rocket className="w-3.5 h-3.5" /> 03 · Launch-Ready Assets, Live Pages, Real Analytics
                  </span>
                  <h3 className="text-[clamp(22px,3vw,30px)] font-semibold mb-[18px] text-[#F5F5F7]">Launch-ready assets, live pages, and real analytics</h3>
                  <ul className="flex flex-col gap-[14px] mt-[22px]">
                    <li className="flex gap-3 items-start text-[15px] text-[#A6A6B3]"><Check className="w-[18px] h-[18px] shrink-0 mt-1 text-emerald-400" /> <span dangerouslySetInnerHTML={{ __html: '<b>One-click publishing</b> — go live on an OfferIQ subdomain or connect your own custom domain.' }} /></li>
                    <li className="flex gap-3 items-start text-[15px] text-[#A6A6B3]"><Check className="w-[18px] h-[18px] shrink-0 mt-1 text-emerald-400" /> <span dangerouslySetInnerHTML={{ __html: '<b>Stripe and PayPal</b> integration built in — your buy buttons work the moment you publish.' }} /></li>
                    <li className="flex gap-3 items-start text-[15px] text-[#A6A6B3]"><Check className="w-[18px] h-[18px] shrink-0 mt-1 text-emerald-400" /> <span dangerouslySetInnerHTML={{ __html: 'Built-in <b>CRM</b> for every lead across every funnel — plus per-funnel analytics on traffic, conversion rate, traffic quality, and device breakdown.' }} /></li>
                  </ul>
                </div>
                <div className="flex-1 w-full">
                  <div className="bg-[#14141F] border border-white/10 rounded-[16px] overflow-hidden shadow-[0_30px_70px_-30px_rgba(0,0,0,0.6)] transition-transform duration-500 hover:-translate-y-1">
                    <video autoPlay loop muted playsInline className="w-full h-auto object-cover pointer-events-none">
                      <source src="/videos/live-pages.mp4" type="video/mp4" />
                    </video>
                    <div className="font-mono text-[11px] text-[#6B6B7B] p-3 px-4 border-t border-white/10 bg-[#191927]">
                      [ Product Video: Published pages with design direction applied ]
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Row 4 (Reverse) */}
            <Reveal>
              <div className="flex flex-col md:flex-row-reverse gap-12 md:gap-16 items-center py-[40px] md:py-[70px] border-b-0">
                <div className="flex flex-col flex-1 w-full">
                  <span className="inline-flex items-center gap-2 font-mono text-[12px] text-blue-400 tracking-[0.08em] uppercase mb-4">
                    <Target className="w-3.5 h-3.5" /> 04 · Traffic Intelligence™ + Email
                  </span>
                  <h3 className="text-[clamp(22px,3vw,30px)] font-semibold mb-[18px] text-[#F5F5F7]">Stop guessing where your buyers are</h3>
                  <ul className="flex flex-col gap-[14px] mt-[22px]">
                    <li className="flex gap-3 items-start text-[15px] text-[#A6A6B3]"><Check className="w-[18px] h-[18px] shrink-0 mt-1 text-emerald-400" /> <span dangerouslySetInnerHTML={{ __html: 'A complete acquisition strategy before you spend a dollar — <b>platform priority matrix</b> built from comparable converting funnels.' }} /></li>
                    <li className="flex gap-3 items-start text-[15px] text-[#A6A6B3]"><Check className="w-[18px] h-[18px] shrink-0 mt-1 text-emerald-400" /> <span dangerouslySetInnerHTML={{ __html: 'Ready-to-deploy <b>ad copy for Meta and Google</b> — plus a VSL script and a UGC script written from your persona data.' }} /></li>
                    <li className="flex gap-3 items-start text-[15px] text-[#A6A6B3]"><Check className="w-[18px] h-[18px] shrink-0 mt-1 text-emerald-400" /> <span dangerouslySetInnerHTML={{ __html: 'A <b>3-phase media buying plan</b> — so you know what to test first, second, and third instead of burning budget on random variations.' }} /></li>
                    <li className="flex gap-3 items-start text-[15px] text-[#A6A6B3]"><Check className="w-[18px] h-[18px] shrink-0 mt-1 text-emerald-400" /> <span dangerouslySetInnerHTML={{ __html: 'Full <b>email sequences</b> included — Lead Nurture, Launch, Re-engagement, Client Onboarding, and Upsell, ready to connect to your leads.' }} /></li>
                  </ul>
                </div>
                <div className="flex-1 w-full">
                  <div className="bg-[#14141F] border border-white/10 rounded-[16px] overflow-hidden shadow-[0_30px_70px_-30px_rgba(0,0,0,0.6)] transition-transform duration-500 hover:-translate-y-1">
                    <video autoPlay loop muted playsInline className="w-full h-auto object-cover pointer-events-none">
                      <source src="/videos/traffic-intelligence.mp4" type="video/mp4" />
                    </video>
                    <div className="font-mono text-[11px] text-[#6B6B7B] p-3 px-4 border-t border-white/10 bg-[#191927]">
                      [ Product Video: Traffic Intelligence™ platform priority matrix ]
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

          </div>
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
              <CardSpotlight className="h-full p-8 flex flex-col justify-start" color="rgba(124, 58, 237, 0.15)">
                <div className="flex items-center gap-3 mb-6 relative z-20">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-violet-500/10 border border-violet-500/20">
                    <Package className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-[22px] font-semibold tracking-tight text-[#F5F5F7]">Asset Bank</h3>
                    <p className="text-xs text-violet-400/80 font-mono tracking-widest uppercase mt-1">Generates for you</p>
                  </div>
                </div>
                <p className="text-[#A6A6B3] relative z-20 text-[15px] leading-relaxed mb-8">
                  The moment your Intelligence Report is ready, the Asset Bank already knows which lead magnets and bonuses will move the needle — and writes them for you as real, downloadable files.
                </p>
                <div className="mt-auto relative z-20">
                  <ul className="list-none space-y-4">
                    <Step title="Auto-populated from your Bonus Stack & Revenue Model — no manual setup." />
                    <Step title="One click generates a complete, titled, formatted PDF in under 60 seconds." />
                    <Step title="Covers lead magnets, core bonuses, and fast-action bonuses." />
                  </ul>
                  <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-white/5">
                    {['Ebook', 'Checklist', 'Swipe File', 'Workbook'].map((label, i) => (<Chip key={i}><FileText className="w-3.5 h-3.5" /> {label}</Chip>))}
                  </div>
                </div>
              </CardSpotlight>
            </Reveal>
            <Reveal>
              <CardSpotlight className="h-full p-8 flex flex-col justify-start" color="rgba(79, 140, 255, 0.15)">
                <div className="flex items-center gap-3 mb-6 relative z-20">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/10 border border-blue-500/20">
                    <Palette className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-[22px] font-semibold tracking-tight text-[#F5F5F7]">Template Club</h3>
                    <p className="text-xs text-blue-400/80 font-mono tracking-widest uppercase mt-1">You choose the start</p>
                  </div>
                </div>
                <p className="text-[#A6A6B3] relative z-20 text-[15px] leading-relaxed mb-8">
                  A growing library of pre-built funnel and page layouts, organized by niche and offer type — pulled from patterns that already convert. Browse, preview, and drop one straight into your workspace.
                </p>
                <div className="mt-auto relative z-20">
                  <ul className="list-none space-y-4">
                    <Step title="Organized by niche and offer type — course, coaching, digital product, service." />
                    <Step title="New templates added continuously as a member's library." />
                    <Step title="Clone a template, then let your Intelligence Report auto-fill it with your own copy." />
                  </ul>
                  <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-white/5">
                    {['Coach', 'Course', 'SaaS', 'Agency'].map((label, i) => (<Chip key={i}><Layers className="w-3.5 h-3.5" /> {label}</Chip>))}
                  </div>
                </div>
              </CardSpotlight>
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
                  {React.createElement(sc.icon, { className: "w-4 h-4 opacity-80" })} {sc.tab}
                </button>
              ))}
            </div>
          </Reveal>
          <div key={activeScenario} className="relative w-full rounded-[24px] p-8 md:p-10 lg:p-12 overflow-hidden flex flex-col md:flex-row gap-12 items-center justify-between mx-auto shadow-2xl">
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0">
              <img src="https://framerusercontent.com/images/SDsAJ6I8XsFKBVPdZDedEUUvJE4.png" alt="Background" className="w-full h-full object-cover hue-rotate-[220deg]" />
            </div>

            <div className="relative z-10 flex flex-col gap-[76px] w-full md:w-1/2">
              <div className="flex flex-col gap-7">
                <div className="w-[56px] h-[47px] rounded-[12.5px] flex items-center justify-center text-[20px] shadow-sm" style={{ background: 'rgba(12, 12, 12, 0.82)' }}>
                  {React.createElement(s.icon, { className: "w-6 h-6 text-white" })}
                </div>
                <div className="flex flex-col gap-4">
                  <h3 className="text-[24px] text-white font-normal leading-tight">{s.who}</h3>
                  <p className="text-[14px] leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.64)' }}>
                    {s.meta}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 w-full">
                <div className="flex justify-between items-center w-full">
                  <p className="text-[14px] m-0 font-medium" style={{ color: 'rgba(255, 255, 255, 0.64)' }}>The Problem</p>
                </div>
                <div className="w-full h-px" style={{ background: 'rgba(255, 255, 255, 0.2)' }} />
                <p className="text-[14px] text-white leading-relaxed mt-2 italic font-medium">
                  {s.quote}
                </p>
                <p className="text-[14px] leading-relaxed mt-2" style={{ color: 'rgba(255, 255, 255, 0.64)' }}>
                  {s.body}
                </p>
              </div>
            </div>

            <div className="relative z-10 flex flex-col gap-7 w-full md:w-1/2">
              <div className="flex flex-col gap-0">
                <h4 className="text-[40px] text-white font-normal m-0 tracking-tight leading-none">The</h4>
                <h4 className="text-[40px] font-normal m-0 tracking-tight leading-none text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #60A5FA 0%, #818CF8 100%)' }}>Transformation</h4>
              </div>
              
              <div className="w-full h-px" style={{ background: 'rgba(255, 255, 255, 0.2)' }} />

              <div className="flex flex-col gap-4 w-full mt-2">
                {s.stats.map((st, i) => (
                  <div key={i} className="flex items-center gap-3 w-full">
                    <div className="flex w-[20px] h-[20px] rounded-full justify-center items-center shrink-0" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                      <svg viewBox="0 0 24 24" className="w-[14px] h-[14px]" xmlns="http://www.w3.org/2000/svg">
                        <path d="M 0 5.25 L 3.75 9 L 12.75 0" fill="transparent" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" stroke="white" transform="translate(6 7.5)" />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                      {'from' in st && st.from ? (
                        <p className="text-[14px] text-white m-0 leading-tight">
                          <span style={{ color: 'rgba(255, 255, 255, 0.64)' }} className="line-through mr-2">{st.from}</span>
                          {st.to}
                        </p>
                      ) : (
                        <p className="text-[14px] text-white m-0 leading-tight">
                          {'single' in st ? st.single : ''}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <a href="/login" className="flex w-full h-[44px] rounded-[50px] justify-center items-center gap-2 no-underline relative overflow-hidden mt-3 group" style={{ background: 'rgba(12, 12, 12, 0.82)' }}>
                <span className="text-[14px] text-white z-10">See How It Works</span>
                <svg className="w-[20px] h-[20px] fill-white z-10 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20">
                  <path d="M 13.477 9.167 L 9.007 4.697 L 10.185 3.518 L 16.667 10 L 10.185 16.482 L 9.007 15.303 L 13.477 10.833 L 3.334 10.833 L 3.334 9.167 Z" />
                </svg>
                {/* Hover overlay from user's CSS */}
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(255, 255, 255, 0.16)' }} />
              </a>
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
            <div className="relative w-full rounded-[24px] overflow-hidden shadow-2xl border border-white/10 mx-auto" style={{ maxWidth: '960px' }}>
              {/* Background Image Layer */}
              <div className="absolute inset-0 z-0">
                <img src="https://framerusercontent.com/images/SDsAJ6I8XsFKBVPdZDedEUUvJE4.png" alt="Background" className="w-full h-full object-cover hue-rotate-[220deg]" />
                <div className="absolute inset-0 bg-[#0C0C0C]/85 mix-blend-multiply" />
              </div>

              <div className="relative z-10 w-full overflow-x-auto">
                <table className="w-full text-[14px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#0C0C0C]/50 backdrop-blur-md">
                      <th className="text-left py-5 px-8 font-mono text-[12px] text-white/50 uppercase tracking-[0.1em] font-medium">Capability</th>
                      <th className="text-left py-5 px-8 font-mono text-[12px] text-white/50 uppercase tracking-[0.1em] font-medium">Typical Cost Elsewhere</th>
                      <th className="text-left py-5 px-8 font-mono text-[12px] text-white/50 uppercase tracking-[0.1em] font-medium">In OfferIQ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compareRows.map((r, i) => (
                      <tr key={i} className="border-b border-white/5 bg-[#0C0C0C]/30 hover:bg-[#0C0C0C]/60 transition-colors backdrop-blur-sm">
                        <td className="py-4 px-8 text-white/80 text-[15px]">{r[0]}</td>
                        <td className="py-4 px-8 text-white/40 text-[15px] line-through decoration-white/20">{r[1]}</td>
                        <td className="py-4 px-8 text-emerald-400 text-[15px] font-medium"><span className="flex items-center gap-2"><div className="flex w-[20px] h-[20px] rounded-full justify-center items-center shrink-0" style={{ background: 'rgba(255, 255, 255, 0.2)' }}><Check className="w-3.5 h-3.5 text-white" /></div> Included</span></td>
                      </tr>
                    ))}
                    <tr className="bg-[#0C0C0C]/80 border-t border-violet-500/30">
                      <td className="py-6 px-8 text-white font-semibold text-[16px]">Total to replicate manually, per offer</td>
                      <td className="py-6 px-8 text-white/40 text-[15px] line-through decoration-white/20">$21,000 – $172,000+</td>
                      <td className="py-6 px-8 text-violet-400 font-semibold text-[16px]"><span className="flex items-center gap-2"><div className="flex w-[20px] h-[20px] rounded-full justify-center items-center shrink-0" style={{ background: 'rgba(255, 255, 255, 0.2)' }}><Zap className="w-3.5 h-3.5 text-white" /></div> From $39/mo</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 w-full max-w-[1180px] mx-auto items-stretch">
            {pricingTiers.map((t, i) => (
              <Reveal key={i}>
                <div className="relative w-full rounded-[24px] p-8 md:p-10 overflow-hidden flex flex-col justify-between h-full border shadow-2xl transition-transform hover:-translate-y-2 duration-300" style={{ borderColor: t.popular ? 'rgba(96,165,250,0.4)' : 'rgba(255,255,255,0.1)' }}>
                  {/* Background Image Layer */}
                  <div className="absolute inset-0 z-0">
                    <img src="https://framerusercontent.com/images/SDsAJ6I8XsFKBVPdZDedEUUvJE4.png" alt="Background" className="w-full h-full object-cover hue-rotate-[220deg]" />
                    <div className="absolute inset-0 bg-[#0C0C0C]/85 mix-blend-multiply" />
                    {t.popular && <div className="absolute inset-0 bg-blue-500/10 pointer-events-none" />}
                  </div>

                  {/* Top Section */}
                  <div className="relative z-10 flex flex-col gap-10 w-full">
                    <div className="flex flex-col gap-6">
                      <div className="flex justify-between items-start">
                        <div className="w-[56px] h-[47px] rounded-[12.5px] flex items-center justify-center text-[20px] shadow-sm" style={{ background: 'rgba(12, 12, 12, 0.82)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          {i === 0 ? <Rocket className="w-5 h-5 text-white" /> : i === 1 ? <Zap className="w-5 h-5 text-white" /> : <Crown className="w-5 h-5 text-white" />}
                        </div>
                        {t.popular && (
                          <div className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest text-white shadow-[0_0_15px_rgba(96,165,250,0.4)]" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #4338CA 100%)' }}>
                            Most Popular
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-4">
                        <h3 className="text-[24px] text-white font-normal m-0 leading-tight">{t.name} Plan</h3>
                        <p className="text-[14px] leading-relaxed m-0 h-10" style={{ color: 'rgba(255, 255, 255, 0.64)' }}>
                          {t.best}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 w-full">
                      <div className="flex justify-between items-center w-full">
                        <p className="text-[14px] m-0" style={{ color: 'rgba(255, 255, 255, 0.64)' }}>Commitment</p>
                        <p className="text-[14px] m-0 text-white font-medium">{t.period === '/mo' ? 'Monthly' : 'One-time'}</p>
                      </div>
                      <div className="w-full h-px" style={{ background: 'rgba(255, 255, 255, 0.2)' }} />
                    </div>
                  </div>

                  {/* Bottom Section */}
                  <div className="relative z-10 flex flex-col gap-7 w-full mt-10">
                    <div className="flex flex-col gap-0">
                      <h4 className="text-[40px] text-white font-normal m-0 tracking-tight leading-none" style={{ letterSpacing: '-1px' }}>{t.price}</h4>
                      <p className="text-[14px] m-0 mt-2 h-10 leading-relaxed" style={{ color: '#60A5FA' }}>{t.sub}</p>
                    </div>
                    
                    <div className="w-full h-px" style={{ background: 'rgba(255, 255, 255, 0.2)' }} />

                    <div className="flex flex-col gap-4 w-full mt-2 flex-1">
                      {t.features.map((f, j) => (
                        <div key={j} className="flex items-start gap-3 w-full">
                          <div className="flex w-[20px] h-[20px] rounded-full justify-center items-center shrink-0 mt-0.5" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                            <svg viewBox="0 0 24 24" className="w-[14px] h-[14px]" xmlns="http://www.w3.org/2000/svg">
                              <path d="M 0 5.25 L 3.75 9 L 12.75 0" fill="transparent" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" stroke="white" transform="translate(6 7.5)" />
                            </svg>
                          </div>
                          <p className="text-[14px] text-white m-0 leading-relaxed" dangerouslySetInnerHTML={{ __html: f }}></p>
                        </div>
                      ))}
                    </div>

                    <a href="/login" className="flex w-full h-[44px] rounded-[50px] justify-center items-center gap-2 no-underline relative overflow-hidden mt-6 group" style={{ background: 'rgba(12, 12, 12, 0.82)', border: t.popular ? '1px solid rgba(96,165,250,0.4)' : 'none' }}>
                      <span className="text-[14px] text-white z-10 font-medium">{t.cta}</span>
                      <svg className="w-[20px] h-[20px] fill-white z-10 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20">
                        <path d="M 13.477 9.167 L 9.007 4.697 L 10.185 3.518 L 16.667 10 L 10.185 16.482 L 9.007 15.303 L 13.477 10.833 L 3.334 10.833 L 3.334 9.167 Z" />
                      </svg>
                      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(255, 255, 255, 0.16)' }} />
                    </a>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="flex items-center gap-3 mt-12 max-w-[600px] mx-auto p-4 rounded-xl text-[14px] text-[#A6A6B3]"
              style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <Shield className="w-5 h-5 shrink-0" style={{ color: '#60A5FA' }} />
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
