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
import { TracingBeam } from "@/components/ui/tracing-beam";
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

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
    <div
      className="py-5 px-1 flex flex-col w-full cursor-pointer border-b border-white/10 transition-colors hover:border-white/25 bg-transparent"
      onClick={onClick}
      aria-expanded={isOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
    >
      <div className="flex justify-between items-center w-full gap-4">
        <h4 className="text-[#F5F5F7] text-[17px] md:text-[18px] font-semibold tracking-tight m-0 leading-snug">{q}</h4>
        <div className="w-6 h-6 rounded-full bg-white/10 shrink-0 relative flex items-center justify-center transition-transform duration-300">
          <span className="absolute bg-[#F5F5F7] w-3 h-[2px]" />
          <span className={`absolute bg-[#F5F5F7] w-[2px] h-3 transition-transform duration-300 ${isOpen ? 'rotate-90 opacity-0' : ''}`} />
        </div>
      </div>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? (ref.current ? ref.current.scrollHeight + 24 + 'px' : '500px') : '0px' }}
      >
        <div ref={ref} className="pt-4 text-[#A6A6B3] text-[15px] leading-relaxed mt-3">
          {a}
        </div>
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

const ProductVideo = ({ src, alt }: { src: string; alt: string }) => {
  const isWebP = src.endsWith('.webp');
  return (
    <div className="w-full max-w-[440px] mx-auto aspect-[16/10] bg-[#14141F] border border-white/10 rounded-[20px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative transition-transform duration-500 hover:-translate-y-1">
      {isWebP ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover pointer-events-none"
        />
      ) : (
        <video autoPlay loop muted playsInline className="w-full h-full object-cover pointer-events-none">
          <source src={src} type="video/mp4" />
        </video>
      )}
    </div>
  );
};

/* ─── WelcomePage ───────────────────────────────────────────────── */
export function WelcomePage() {
  const router = useRouter();
  const [navScrolled, setNavScrolled] = useState(false);
  const [activeScenario, setActiveScenario] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const cardRotate = useTransform(heroProgress, [0, 0.55], [20, 0]);
  const cardScale = useTransform(heroProgress, [0, 0.55], [1.06, 1]);
  const titleTranslate = useTransform(heroProgress, [0, 0.55], [0, -80]);

  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push('/');
      }
    });
    
    // Also check immediately in case the session is already established
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

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
      tab: 'Course Creator', who: 'Course Creator', meta: '34 · Austin, TX · 14K Instagram followers',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=face',
      quote: <>"The situation: you've researched competitors, maybe even taken a course or paid for a coaching call — <span style={{ color: '#60A5FA' }}>and you still don't have anything live.</span>"</>,
      body: "You describe your course idea in your own words. OfferIQ comes back with a suggested buyer persona, a benchmarked price point, a handful of conversion angles, and a full-funnel blueprint — then builds the pages from that same analysis, in the same session.",
      stats: [{ from: 'Months of feeling stuck', to: 'A working funnel by the end of one sitting' }, { from: 'A price you picked on instinct', to: 'A benchmarked price' }, { single: 'A full set of funnel pages drafted and assembled in one session' }],
    },
    {
      tab: 'Business Coach', who: 'Coach with an Existing Offer', meta: '41 · Atlanta, GA · $3,500 program',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=96&h=96&fit=crop&crop=face',
      quote: <>"The situation: you know something in your messaging isn't landing, <span style={{ color: '#60A5FA' }}>but you can't quite see what.</span>"</>,
      body: "You paste in your existing sales page URL. OfferIQ's report flags the actual mismatch, often that the page is selling a curriculum when the buyer is actually buying relief from a feeling and rewrites the copy around that insight.",
      stats: [{ from: 'A page built around features', to: 'A page built around what the buyer actually feels' }, { from: 'A stalled or underperforming funnel', to: 'a clearer read on why, and a rewritten page to test' }],
    },
    {
      tab: 'Agency Owner', who: 'Agency Owner', meta: '38 · Denver, CO · 6-person team',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=face',
      quote: <>"The situation: you want to offer offer-strategy and funnel-building as a service, <span style={{ color: '#60A5FA' }}>without hiring a strategist and copywriter for every client.</span>"</>,
      body: "You run each client's offer through OfferIQ instead — intelligence report, copy, and funnel delivered as one packaged deliverable.",
      stats: [{ from: 'A task that used to take a team multiple weeks', to: 'A task one person can turn around in a single session' }, { single: 'A new productized service line, without new headcount' }],
    },
    {
      tab: 'First-Time Entrepreneur', who: 'First-Time Entrepreneur', meta: '29 · Chicago, IL · 8 yrs experience',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=96&h=96&fit=crop&crop=face',
      quote: <>"The situation: you have real expertise and an audience, <span style={{ color: '#60A5FA' }}>but no idea what to actually build or price.</span>"</>,
      body: 'You choose "Build an Offer For Me," enter your niche, audience, and price range, and get back several validated offer ideas benchmarked against real converting funnels.',
      stats: [{ from: 'Months of "I know I should launch something"', to: 'a validated offer idea and a live funnel built from it in one session' }],
    },
  ];

  const compareRows = [
    ['Offer strategy & positioning, consultant', '$2,000 – $10,000 / project'],
    ['Direct-response sales copywriter', '$2,000 – $15,000 / page'],
    ['Landing page/funnel builder software', '$99 – $297 / month'],
    ['Lead magnet & bonus design + writing', '$500 – $2,000 / asset'],
    ['Paid traffic/media, buying strategist', '$1,500 – $5,000 / month'],
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
      name: 'Starter', price: '$39', period: '/mo', sub: '[$1 for your first 7 days, then $39/mo. Cancel anytime.]',
      features: ['<b>5 offer credits</b> — Refreshed Monthly', '1 Workspace', 'Full 4-Phase Engine: Strategy, Copy, Funnel (All 5 Funnel Pages), Traffic Plan', 'Asset Bank + Template Library access', 'Email Engagement Sequences', 'OfferIQ subdomain publishing', 'Payment & Autoresponder integration', 'Standard support'],
      best: 'Best for testing the platform and launching your first 1–3 offers.', popular: false, cta: 'Start Your $1 Trial',
    },
    {
      name: 'Growth', price: '$69', period: '/mo', sub: '[$1 for your first 7 days, then $69/mo. Cancel anytime.]',
      features: ['Everything in Starter, plus:', '<b>10 offer credits</b> — Refreshed monthly.', '3 Workspaces', 'Remove "Built with OfferIQ" branding', 'Advanced Analytics dashboard', 'Custom domain connection', 'Pixel tracking embed', 'Priority support'],
      best: 'Best for active creators running multiple offers or brands.', popular: true, cta: 'Start Your $1 Trial',
    },
    {
      name: 'Agency', price: '$179', period: '/mo', sub: '[$1 for your first 7 days, then $179/mo. Cancel anytime.]',
      features: ['Everything in Growth, plus:', '<b>30 offer credits</b> — Refreshed monthly.', '30 Workspaces', 'Agency Dashboard to manage your users', '30 client sub-accounts for agency delivery', 'Agency Marketing Assets - Agency Website, proposal, Commercial/Ads Graphics, Legal Contract Agreement', 'Done-For-You onboarding session', 'Dedicated priority support channel'],
      best: 'Best for agencies and consultants delivering offer strategy as a service.', popular: false, cta: 'Start Your $1 Trial',
    },
  ];

  const s = scenarios[activeScenario];

  return (
    <div className="dark antialiased overflow-x-hidden" style={{ background: 'rgb(11,11,11)', color: '#F5F5F7', fontFamily: "'FramerHeroBody', 'General Sans', -apple-system, BlinkMacSystemFont, sans-serif", lineHeight: 1.6, WebkitFontSmoothing: 'antialiased' }}>

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
              {/* Audience Rotator Badge */}
              <div className="inline-flex items-center gap-2.5 mb-2 cursor-default transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '100px', padding: '6px 14px 6px 10px' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#8B5CF6' }} />
                <span className="text-[13px] font-medium text-[#C4B5FD]" style={{ fontFamily: "'FramerHeroAccent', sans-serif" }}>Creators | Product Owners | Coaches | Newbies</span>
              </div>

              {/* Framer Main Headline */}
              <div className="framer-t2w3o5 mt-4">
                <h1 className="hero-h1 text-[#F5F5F7]" style={{ fontFamily: "'FramerHeroAccent', 'Clash Display', 'General Sans', sans-serif", fontSize: 'clamp(32px, 4.5vw, 52px)', lineHeight: 1.15, fontWeight: 700, letterSpacing: '-0.02em', maxWidth: '800px', margin: '0 auto' }}>
                  Turn Any Idea Into Something People{' '}
                  <span style={{ 
                    backgroundImage: 'linear-gradient(135deg, #18CCFC, #6344F5 32.5%, #AE48FF)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 8px 32px rgba(99,68,245,0.4))'
                  }}>Actually Want to Buy</span>{' '}
                  — Using OfferIQ.
                </h1>
              </div>

              {/* Framer Subtext / Description */}
              <div className="framer-gdfpn4 mt-5">
                <p style={{ fontFamily: "'Host Grotesk', 'General Sans', sans-serif", fontSize: 'clamp(14px, 1.5vw, 16px)', lineHeight: 1.55, color: '#A6A6B3', maxWidth: '640px', margin: '0 auto' }}>
                  Upload a URL, a PDF, or a single idea. OfferIQ analyzes it against 35,000+ real converting offers and hands you the complete revenue system: strategy, copy, live funnel, and traffic plan — built in one session.
                </p>
              </div>
            </section>

            <div className="flex items-center justify-center gap-4 mt-8 mb-4 flex-wrap">
              <a href="/login" className="inline-flex items-center gap-2 px-[32px] py-[14px] rounded-full text-white text-[14.5px] font-bold transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #18CCFC, #6344F5 32.5%, #AE48FF)', boxShadow: '0 8px 32px rgba(99,68,245,0.4)', fontFamily: "'Host Grotesk', sans-serif" }}>
                Build My Offer →
              </a>
              <a href="/login" className="inline-flex items-center gap-2 px-[32px] py-[14px] rounded-full text-[14.5px] font-semibold text-[#F5F5F7] transition-all hover:bg-white/[0.08]"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.14)', fontFamily: "'Host Grotesk', sans-serif" }}>
                Start Your $1 Trial
              </a>
            </div>

            <p className="text-[12px] text-[#6B6B7B] leading-[1.7] font-mono tracking-wide" style={{ fontFamily: "'Host Grotesk', monospace" }}>
              7-day $1 trial &middot; No marketing experience required &middot; 30-day money-back guarantee
            </p>
          </motion.div>

          {/* 3D Card */}
          <motion.div
            className="w-full max-w-[1040px] rounded-[20px] md:rounded-[30px] relative z-[1] p-2 md:p-5"
            style={{
              height: 'clamp(220px, 45vw, 580px)',
              border: '1px solid rgba(139,92,246,0.25)',
              background: 'linear-gradient(180deg, #1A1020 0%, #111118 100%)',
              rotateX: cardRotate, scale: cardScale, transformOrigin: 'center top',
              boxShadow: '0 0 0 1px rgba(59,130,246,0.08), 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 40px 80px -20px rgba(139,92,246,0.15)',
            }}
          >
            <div className="h-full w-full rounded-[12px] md:rounded-[18px] overflow-hidden bg-[#18181b] p-1 md:p-3.5 relative pointer-events-none" style={{ height: '100%' }}>
              <iframe
                src="https://www.youtube.com/embed/PYnfJl2OSic?autoplay=1&mute=1&loop=1&playlist=PYnfJl2OSic&controls=0&showinfo=0&rel=0&disablekb=1&iv_load_policy=3&modestbranding=1&start=30"
                className="rounded-[8px] md:rounded-[10px] block"
                allow="autoplay; encrypted-media"
                title="Apple Event — September 2024"
                style={{ border: 0, width: '100%', height: '100%' }}
              ></iframe>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── WHY THIS MATTERS ── */}
      <section className="py-[120px] md:py-[76px]" id="why">
        <div className="max-w-[1180px] mx-auto px-7">
          <Reveal>
            <div className="w-full flex flex-col gap-[48px] md:gap-[60px]">
              
              {/* Header */}
              <div className="flex flex-col items-center text-center gap-3 w-full max-w-[680px] mx-auto">
                <div
                  className="inline-block px-3 py-1 rounded-md text-[12px] font-bold uppercase tracking-widest text-black mb-1"
                  style={{ background: 'linear-gradient(168deg, rgb(248,223,66) 16%, rgb(255,245,153) 40%, rgb(225,164,39) 100%)' }}
                >
                  Why This Matters Right Now
                </div>
                <h2 className="font-semibold tracking-[-0.02em] leading-[1.08] text-[#F5F5F7] m-0" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>
                  Three traps quietly kill every offer<br/>before it has a chance to sell.
                </h2>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: '/3d-icons/3dicons-target-dynamic-color.png',
                    tag: 'The "Blank Canvas" Trap',
                    stat: '42%',
                    body: 'of startups fail simply because they build products with absolutely no market need. They build something nobody needed, and the cash runs out chasing demand that was never there.',
                    src: '— CB Insights',
                  },
                  {
                    icon: '/3d-icons/3dicons-3d-coin-dynamic-color.png',
                    tag: 'The Pricing Trap',
                    stat: '18%',
                    body: 'of startups collapse due to flawed pricing models. They either charge too much for the market or too little to sustain operations.',
                    src: '— CB Insights',
                  },
                  {
                    icon: '/3d-icons/3dicons-chart-dynamic-color.png',
                    tag: 'The “Acquisition Cost” Trap',
                    stat: '222%+',
                    body: 'Customer Acquisition Costs have skyrocketed by over 222%, making paid traffic more expensive than ever. Sending hyper-expensive clicks to a slow, pieced-together funnel will bleed your profit margins dry before you make a single sale.',
                    src: '— ProfitWell / Paddle',
                  },
                ].map((c, i) => {
                  return (
                    <div key={i} 
                      className="relative flex flex-col p-7 rounded-[14px] transition-all duration-500 group overflow-hidden bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.14]"
                    >
                      <div className="relative z-10 flex flex-col h-full pointer-events-none">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform shrink-0 bg-violet-500/10 border border-violet-500/20 text-violet-400">
                          <img src={c.icon} className="w-10 h-10 object-contain drop-shadow-sm" alt="" />
                        </div>
                        <span className="font-mono text-[11px] tracking-widest uppercase block mb-2 text-white/40">
                          {c.tag}
                        </span>
                        <div className="text-[32px] font-semibold mb-3 bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent tracking-tight leading-none">
                          {c.stat}
                        </div>
                        <p className="text-[15px] leading-relaxed mb-5 flex-grow text-[#A6A6B3]">
                          {c.body}
                        </p>
                        <span className="font-mono text-[11px] italic text-white/30">
                          {c.src}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="pt-2 border-t border-white/5">
                <p className="text-center text-[16px] md:text-[17px] font-medium max-w-[640px] mx-auto text-[#A6A6B3] m-0">
                  OfferIQ ends the guesswork.{' '}
                  <span className="text-white">It shows you what's already working, then builds the complete offer for you.</span>
                </p>
              </div>

            </div>
          </Reveal>
        </div>
      </section>

      {/* ── TWO WAYS IN ── */}
      <section className="py-[120px] md:py-[76px]" id="gate">
        <div className="max-w-[1180px] mx-auto px-7">
          <Reveal>
            <div className="max-w-[680px] mb-16 mx-auto text-center">
              <Eyebrow center>Two Ways In</Eyebrow>
              <h2 className="font-semibold tracking-[-0.02em] leading-[1.08] mb-[18px] text-[#F5F5F7]" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>Tell OfferIQ where you're starting from.</h2>
              <p className="text-[17px] text-[#A6A6B3] max-w-[560px] mx-auto">No Matter Where You're Starting, OfferIQ Meets You There.</p>
            </div>
          </Reveal>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto w-full">
            <WobbleCard
              containerClassName="col-span-1 lg:col-span-3 h-full bg-pink-800 min-h-[300px] overflow-hidden"
              className=""
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-0 w-full h-full">
                {/* Text */}
                <div className="relative z-20 max-w-xs shrink-0">
                  <p className="text-left text-xs font-mono text-white/40 tracking-widest uppercase mb-3">01 / I Already Have An Idea Or Existing Offer</p>
                  <h2 className="text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                    You already have an offer. Perfect. Let's make it stronger.
                  </h2>
                  <p className="mt-4 text-left text-base/6 text-neutral-200">
                    Paste a URL, upload a PDF, or describe it in your own words — OfferIQ builds a full Strategy Report, copy, and funnel around what you already have.
                  </p>
                  <div className="flex gap-3 mt-6 flex-wrap">
                    <span className="flex items-center gap-2 text-sm text-white/80 bg-white/10 w-fit px-3 py-1.5 rounded-full"><LinkIcon className="w-4 h-4" /> Paste a URL</span>
                    <span className="flex items-center gap-2 text-sm text-white/80 bg-white/10 w-fit px-3 py-1.5 rounded-full"><FileText className="w-4 h-4" /> Upload a PDF</span>
                    <span className="flex items-center gap-2 text-sm text-white/80 bg-white/10 w-fit px-3 py-1.5 rounded-full"><PenTool className="w-4 h-4" /> Describe it</span>
                  </div>
                  <a href="/login" className="mt-6 inline-flex items-center gap-2 text-[14px] font-bold text-black bg-white rounded-full px-[24px] py-[12px] transition-all hover:-translate-y-0.5 relative z-20 hover:shadow-[0_8px_20px_rgba(255,255,255,0.25)]">
                    Improve My Offer <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
                {/* Image container — reserves its own space so image never climbs over text */}
                <div className="relative flex items-center justify-end flex-1 min-h-[240px] pointer-events-none mt-4 lg:mt-0">
                  <div className="relative w-full max-w-[420px] h-[280px]">
                    <img
                      src="https://assets.aceternity.com/pro/bento-grids.png"
                      width={500}
                      height={500}
                      alt="platform demo"
                      className="absolute -right-8 lg:-right-16 -bottom-12 md:-bottom-16 w-[130%] max-w-[520px] h-auto object-contain rounded-2xl border border-white/15 shadow-[0_30px_70px_rgba(0,0,0,0.85)] transform -rotate-[7deg] origin-bottom-right grayscale filter z-10"
                    />
                  </div>
                </div>
              </div>
            </WobbleCard>
            
            <WobbleCard containerClassName="col-span-1 lg:col-span-3 bg-[linear-gradient(135deg,#18CCFC,#6344F5_32.5%,#AE48FF)] min-h-[300px] overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center gap-0 w-full h-full">
                {/* Text */}
                <div className="max-w-sm relative z-20 shrink-0">
                  <p className="text-left text-xs font-mono text-white/40 tracking-widest uppercase mb-3">02 / I Don't Have Anything Yet</p>
                  <h2 className="max-w-sm md:max-w-lg text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                    You have valuable skills and expertise, but no product.
                  </h2>
                  <p className="mt-4 max-w-[26rem] text-left text-base/6 text-neutral-200">
                    Give OfferIQ your niche, audience, and price range — get offer ideas that are already proven to work. Pick one, and OfferIQ builds it.
                  </p>
                  <div className="flex gap-3 mt-6 flex-wrap">
                    <span className="flex items-center gap-2 text-sm text-white/80 bg-white/10 w-fit px-3 py-1.5 rounded-full"><Target className="w-4 h-4" /> Pick a niche</span>
                    <span className="flex items-center gap-2 text-sm text-white/80 bg-white/10 w-fit px-3 py-1.5 rounded-full"><Users className="w-4 h-4" /> Define your buyer</span>
                    <span className="flex items-center gap-2 text-sm text-white/80 bg-white/10 w-fit px-3 py-1.5 rounded-full"><DollarSign className="w-4 h-4" /> Set a price range</span>
                  </div>
                  <a href="/login" className="mt-6 inline-flex items-center gap-2 text-[14px] font-bold text-black bg-white rounded-full px-[24px] py-[12px] transition-all hover:-translate-y-0.5 relative z-20 hover:shadow-[0_8px_20px_rgba(255,255,255,0.25)]">
                    Let's Build Your Offer <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
                {/* Image container — reserves its own space so image never climbs over text */}
                <div className="relative flex items-center justify-end flex-1 min-h-[240px] pointer-events-none mt-4 lg:mt-0">
                  <div className="relative w-full max-w-[480px] h-[280px]">
                    <img
                      src="/card-imgs/I%20don't%20Have%20an%20Offer%20-%20Color.png"
                      width={500}
                      height={500}
                      alt="platform demo"
                      className="absolute -right-8 lg:-right-20 -bottom-12 md:-bottom-16 w-[130%] max-w-[560px] h-auto object-contain rounded-2xl border border-white/15 shadow-[0_30px_70px_rgba(0,0,0,0.85)] transform rotate-[7deg] origin-bottom-right z-10"
                    />
                  </div>
                </div>
              </div>
            </WobbleCard>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-[120px] md:py-[76px]" id="how-it-works">
        <div className="max-w-[1180px] mx-auto px-7">
          <Reveal>
            <div className="max-w-[680px] mb-16 mx-auto text-center">
              <Eyebrow center>From Idea To Ready-To-Sell Business</Eyebrow>
              <h2 className="font-semibold tracking-[-0.02em] leading-[1.08] mb-[18px] text-[#F5F5F7]" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>
                You don't need to figure everything out before you begin.
              </h2>
              <p className="text-[17px] text-[#A6A6B3]">
                Just bring what you have — OfferIQ will do the rest. Most people go from idea to a launch-ready business in less than 30 minutes.
              </p>
            </div>
          </Reveal>

          <TracingBeam className="px-6 pb-6">
            <div className="flex flex-col gap-3 w-full relative z-10">
              {[
                {
                  num: '01',
                  title: 'Strategy Report',
                  sub: 'Positioning, Pricing & Full Funnel Blueprint',
                  time: '~4 min',
                  desc: 'Start with a URL, PDF, or description of your idea. OfferIQ turns that rough idea into something people understand and want — who to target, what to charge, and how to grab their attention, plus a full plan for every page.',
                },
                {
                  num: '02',
                  title: 'Copy Engine',
                  sub: 'Full Funnel Copy In Your Buyer’s Exact Vocabulary',
                  time: '~2 min',
                  desc: 'Long-form sales page, upsell, downsell, and thank-you copy — written from the Strategy Report, in your buyer’s exact vocabulary.',
                },
                {
                  num: '03',
                  title: 'Funnel Builder',
                  sub: 'Automated Page Assembly & AI Agent Edits',
                  time: '~5 min',
                  desc: 'Every page (Lead Magnet, Sales page, Upsell, Downsell & Thank-You Page) assembles automatically using your design direction. Edit inline, or tell the AI Agent what to change in plain language.',
                },
                {
                  num: '04',
                  title: 'Lead Generation & Engagement Plan',
                  sub: 'Ad Copy, Video Scripts & Email Sequences',
                  time: '~4 min',
                  desc: 'A clear plan for which platforms to try first, ready-to-use ad copy, a video sales script, a UGC script, and full email sequences — all before you spend a dollar on ads.',
                },
                {
                  num: '05',
                  title: 'Publish & Go Live',
                  sub: 'Custom Domain & Stripe / PayPal Payments',
                  time: 'Instant',
                  desc: 'Connect a domain, connect Stripe or PayPal, and go live. Your page is public and ready to take payments.',
                },
              ].map((step, i) => (
                <Reveal key={i}>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-8 px-6 py-5 rounded-[10px] bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.14] transition-colors bg-[rgb(20,20,20)] relative z-10">
                    
                    {/* Left: Number & Title */}
                    <div className="flex flex-col gap-1 w-full lg:w-[280px] shrink-0">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[13px] text-white/40">{step.num}</span>
                        <span className="text-[15px] text-white/85 font-medium">{step.title}</span>
                      </div>
                      <span className="text-[13px] text-white/50 pl-7">{step.sub}</span>
                    </div>

                    {/* Middle: Description */}
                    <span className="text-[14px] text-white/60 leading-relaxed flex-1">
                      {step.desc}
                    </span>

                    {/* Right: Time (Matching "Included" style) */}
                    <span className="flex items-center gap-2 text-emerald-400 text-[14px] font-medium shrink-0 lg:w-[100px] lg:justify-end mt-2 lg:mt-0">
                      <div className="w-5 h-5 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      {step.time}
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>
          </TracingBeam>
        </div>
      </section>

      {/* ── SHOWCASE ── */}
      <section className="py-[120px] md:py-[76px]" id="showcase">
        <div className="max-w-[1180px] mx-auto px-7">
          <Reveal>
            <div
              className="w-full flex flex-col gap-[60px] p-[32px] md:p-[60px]"
            >
              {/* Header — same style as Illustrative Scenarios / Replace The Stack */}
              <div className="flex flex-col items-center text-center gap-3 w-full max-w-[680px] mx-auto">
                <div
                  className="inline-block px-3 py-1 rounded-md text-[12px] font-bold uppercase tracking-widest text-black mb-1"
                  style={{ background: 'linear-gradient(168deg, rgb(248,223,66) 16%, rgb(255,245,153) 40%, rgb(225,164,39) 100%)' }}
                >
                  Product Showcase
                </div>
                <h2 className="font-semibold tracking-[-0.02em] leading-[1.08] text-[#F5F5F7] m-0" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>
                  One workspace, every phase of the offer, connected.
                </h2>
                <p className="text-[17px] text-[#A6A6B3] max-w-[560px] m-0">
                  Each phase builds on the one before it — nothing here is generic.
                </p>
              </div>

              {/* Timeline rows */}
              <div className="relative">
                {/* Thin vertical center line — hidden on mobile */}
                <div
                  className="hidden md:block absolute left-1/2 top-4 bottom-4 w-px -translate-x-1/2 bg-white/10 pointer-events-none"
                />

                <div className="flex flex-col gap-0">

                  {/* ── Row 1: text LEFT · spine · video RIGHT ── */}
                  <Reveal>
                    <div className="relative grid grid-cols-1 md:grid-cols-[1fr_48px_1fr] gap-x-8 gap-y-8 items-center pb-[60px] md:pb-[80px]">
                      {/* Left — copy */}
                      <div className="flex flex-col pr-0 md:pr-4">
                        <span className="inline-flex items-center gap-2 font-mono text-[12px] text-[#A6A6B3] tracking-[0.08em] uppercase mb-3">
                          <img src="/3d-icons/3dicons-map-pin-dynamic-color.png" className="w-6 h-6 object-contain" alt="" /> 01 · Two Ways to Start
                        </span>
                        <h3 className="text-[clamp(18px,2.2vw,24px)] font-semibold mb-3 text-[#F5F5F7] leading-snug">Start from what you have, or start from nothing at all.</h3>
                        <p className="text-[14.5px] text-[#A6A6B3] leading-relaxed mb-4">
                          Every path lands in the same place: a complete Revenue Strategy Report, ready in minutes.
                        </p>
                        <ul className="flex flex-col gap-2.5">
                          <li className="flex gap-2.5 items-start text-[14px] text-[#A6A6B3]"><Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" /><span dangerouslySetInnerHTML={{ __html: '<b>Analyse &amp; Build</b> a profitable revenue system from a URL, PDF, or idea you already have.' }} /></li>
                          <li className="flex gap-2.5 items-start text-[14px] text-[#A6A6B3]"><Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" /><span dangerouslySetInnerHTML={{ __html: '<b>Build an Offer From Nothing</b> — generate validated offer ideas from your niche, audience, and price range.' }} /></li>
                        </ul>
                      </div>

                      {/* Spine circle */}
                      <div className="hidden md:flex flex-col items-center justify-center self-stretch relative">
                        <div className="w-7 h-7 rounded-full bg-[#1F1F24] border border-white/15 text-white/70 font-mono text-[12px] font-medium flex items-center justify-center z-10 shadow-md">
                          1
                        </div>
                      </div>

                      {/* Right — video */}
                      <div className="pl-0 md:pl-4">
                        <ProductVideo
                          src="/videos/choice-gate.webp"
                          alt="OfferIQ choice gate to intelligence report"
                        />
                      </div>
                    </div>
                  </Reveal>

                  {/* ── Row 2: video LEFT · spine · text RIGHT ── */}
                  <Reveal>
                    <div className="relative grid grid-cols-1 md:grid-cols-[1fr_48px_1fr] gap-x-8 gap-y-8 items-center pb-[60px] md:pb-[80px]">
                      {/* Left — video */}
                      <div className="pr-0 md:pr-4 order-2 md:order-1">
                        <ProductVideo
                          src="/videos/copy-engine.mp4"
                          alt="Copy Engine writing live from your Intelligence Report"
                        />
                      </div>

                      {/* Spine circle */}
                      <div className="hidden md:flex flex-col items-center justify-center self-stretch relative order-2">
                        <div className="w-7 h-7 rounded-full bg-[#1F1F24] border border-white/15 text-white/70 font-mono text-[12px] font-medium flex items-center justify-center z-10 shadow-md">
                          2
                        </div>
                      </div>

                      {/* Right — copy */}
                      <div className="flex flex-col pl-0 md:pl-4 order-1 md:order-3">
                        <span className="inline-flex items-center gap-2 font-mono text-[12px] text-[#A6A6B3] tracking-[0.08em] uppercase mb-3">
                          <img src="/3d-icons/3dicons-pencil-dynamic-color.png" className="w-6 h-6 object-contain" alt="" /> 02 · Copy &amp; Funnel Builder
                        </span>
                        <h3 className="text-[clamp(18px,2.2vw,24px)] font-semibold mb-3 text-[#F5F5F7] leading-snug">Copy and Funnel Built from Your Data, Not a Template</h3>
                        <p className="text-[14.5px] text-[#A6A6B3] leading-relaxed mb-4">
                          Every word is written from your Strategy Report — not a generic swipe, so your copy actually speaks to your specific buyers.
                        </p>
                        <ul className="flex flex-col gap-2.5">
                          <li className="flex gap-2.5 items-start text-[14px] text-[#A6A6B3]"><Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" /><span dangerouslySetInnerHTML={{ __html: 'Full-funnel copy in one pass: <b>Long-Form Sales Pages (up to 12,000 words)</b>, lead page, Upsell, Downsell, and Thank You pages.' }} /></li>
                          <li className="flex gap-2.5 items-start text-[14px] text-[#A6A6B3]"><Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" /><span dangerouslySetInnerHTML={{ __html: 'Pages assemble themselves — colours, fonts, and layout are pulled from what we learned about your brand and buyer.' }} /></li>
                          <li className="flex gap-2.5 items-start text-[14px] text-[#A6A6B3]"><Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" /><span dangerouslySetInnerHTML={{ __html: 'Refine anything by chatting — tell the <b>built-in AI copilot</b> what to change and watch it update in real time.' }} /></li>
                        </ul>
                      </div>
                    </div>
                  </Reveal>

                  {/* ── Row 3: text LEFT · spine · video RIGHT ── */}
                  <Reveal>
                    <div className="relative grid grid-cols-1 md:grid-cols-[1fr_48px_1fr] gap-x-8 gap-y-8 items-center pb-[60px] md:pb-[80px]">
                      {/* Left — copy */}
                      <div className="flex flex-col pr-0 md:pr-4">
                        <span className="inline-flex items-center gap-2 font-mono text-[12px] text-[#A6A6B3] tracking-[0.08em] uppercase mb-3">
                          <img src="/3d-icons/3dicons-rocket-dynamic-color.png" className="w-6 h-6 object-contain" alt="" /> 03 · Publish &amp; Analytics
                        </span>
                        <h3 className="text-[clamp(18px,2.2vw,24px)] font-semibold mb-3 text-[#F5F5F7] leading-snug">Launch With Confidence: Live Pages and Real Analytics</h3>
                        <p className="text-[14.5px] text-[#A6A6B3] leading-relaxed mb-4">
                          One-click publishing; go live on an OfferIQ subdomain or connect your own custom domain. Stripe and PayPal buy buttons work the moment you publish.
                        </p>
                        <ul className="flex flex-col gap-2.5">
                          <li className="flex gap-2.5 items-start text-[14px] text-[#A6A6B3]"><Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" /><span dangerouslySetInnerHTML={{ __html: '<b>Stripe and PayPal</b> integration built in — your buy buttons work the moment you publish.' }} /></li>
                          <li className="flex gap-2.5 items-start text-[14.5px] text-[#A6A6B3]"><Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" /><span dangerouslySetInnerHTML={{ __html: 'Built-in <b>CRM</b> to collect and manage leads — plus track traffic source, conversion rate, and traffic quality in real time.' }} /></li>
                        </ul>
                      </div>

                      {/* Spine circle */}
                      <div className="hidden md:flex flex-col items-center justify-center self-stretch relative">
                        <div className="w-7 h-7 rounded-full bg-[#1F1F24] border border-white/15 text-white/70 font-mono text-[12px] font-medium flex items-center justify-center z-10 shadow-md">
                          3
                        </div>
                      </div>

                      {/* Right — video */}
                      <div className="pl-0 md:pl-4">
                        <ProductVideo
                          src="/videos/live-pages.mp4"
                          alt="Published pages with design direction applied"
                        />
                      </div>
                    </div>
                  </Reveal>

                  {/* ── Row 4: video LEFT · spine · text RIGHT ── */}
                  <Reveal>
                    <div className="relative grid grid-cols-1 md:grid-cols-[1fr_48px_1fr] gap-x-8 gap-y-8 items-center">
                      {/* Left — video */}
                      <div className="pr-0 md:pr-4 order-2 md:order-1">
                        <ProductVideo
                          src="/videos/traffic-intelligence.mp4"
                          alt="Traffic Intelligence platform priority matrix"
                        />
                      </div>

                      {/* Spine circle */}
                      <div className="hidden md:flex flex-col items-center justify-center self-stretch relative order-2">
                        <div className="w-7 h-7 rounded-full bg-[#1F1F24] border border-white/15 text-white/70 font-mono text-[12px] font-medium flex items-center justify-center z-10 shadow-md">
                          4
                        </div>
                      </div>

                      {/* Right — copy */}
                      <div className="flex flex-col pl-0 md:pl-4 order-1 md:order-3">
                        <span className="inline-flex items-center gap-2 font-mono text-[12px] text-[#A6A6B3] tracking-[0.08em] uppercase mb-3">
                          <img src="/3d-icons/3dicons-megaphone-dynamic-color.png" className="w-6 h-6 object-contain" alt="" /> 04 · Lead Generation &amp; Engagement
                        </span>
                        <h3 className="text-[clamp(18px,2.2vw,24px)] font-semibold mb-3 text-[#F5F5F7] leading-snug">Stop Guessing Where Your Buyers Are.</h3>
                        <p className="text-[14.5px] text-[#A6A6B3] leading-relaxed mb-4">
                          A complete plan for where to spend your ad budget, built by comparing funnels like yours that already convert.
                        </p>
                        <ul className="flex flex-col gap-2.5">
                          <li className="flex gap-2.5 items-start text-[14px] text-[#A6A6B3]"><Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" /><span dangerouslySetInnerHTML={{ __html: 'Ready-to-use <b>ad copy for Meta and Google</b>, plus a video sales script and a UGC video script, in your buyer’s own words.' }} /></li>
                          <li className="flex gap-2.5 items-start text-[14px] text-[#A6A6B3]"><Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" /><span dangerouslySetInnerHTML={{ __html: 'A simple <b>3-step testing plan</b> — know what to try first, second, and third instead of guessing with your budget.' }} /></li>
                          <li className="flex gap-2.5 items-start text-[14px] text-[#A6A6B3]"><Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" /><span dangerouslySetInnerHTML={{ __html: 'Full <b>email sequences</b> included — Lead Nurture, Launch, Re-engagement, Client Onboarding, and Upsell.' }} /></li>
                        </ul>
                      </div>
                    </div>
                  </Reveal>

                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── VAULT ── */}
      <section className="py-[120px] md:py-[76px]" id="vault">
        <div className="max-w-[1180px] mx-auto px-7">
          <Reveal>
            <div className="max-w-[680px] mb-16 mx-auto text-center">
              <Eyebrow center>Built-In Vault</Eyebrow>
              <h2 className="font-semibold tracking-[-0.02em] leading-[1.08] mb-[18px] text-[#F5F5F7]" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>
                Everything You Need To Launch Fast
              </h2>
              <p className="text-[17px] text-[#A6A6B3] max-w-[560px] mx-auto">
                OfferIQ builds all the assets you need to launch, build trust, capture leads, and help customers succeed after they purchase.
              </p>
            </div>
          </Reveal>

          <div className="flex flex-col gap-10">
            {/* Card 1: Asset Bank */}
            <Reveal>
              <div className="w-full rounded-[25px] bg-[rgb(20,20,20)] border border-white/10 shadow-[rgba(0,0,0,0.3)_0px_3px_6px_0px] overflow-hidden relative group">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center p-8 md:p-12 min-h-[420px]">
                  {/* Half 1: Copy & Features */}
                  <div className="flex flex-col relative z-20 max-w-[480px]">
                    <div className="flex items-center gap-3.5 mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-violet-500/10 border border-violet-500/20 shrink-0">
                        <img src="/3d-icons/3dicons-folder-dynamic-color.png" className="w-8 h-8 object-contain drop-shadow-md" alt="Asset Bank" />
                      </div>
                      <div>
                        <h3 className="text-[24px] md:text-[28px] font-semibold tracking-tight text-[#F5F5F7]">Asset Bank</h3>
                        <span className="font-mono text-[11px] text-violet-400 font-medium tracking-widest uppercase block mt-0.5">
                          Generated for you
                        </span>
                      </div>
                    </div>

                    <p className="text-[#A6A6B3] text-[15px] leading-relaxed mb-6">
                      The moment your Strategy Report is ready, the Asset Bank already knows which lead magnets and bonuses will move the needle and builds them for you as real, downloadable files.
                    </p>

                    <ul className="list-none space-y-3 mb-8">
                      <Step title="Auto-populated from your offer's bonuses and pricing — no manual setup needed." />
                      <Step title="One click generates a complete, titled, formatted PDF in under 60 seconds." />
                      <Step title="Covers lead magnets, fast-action bonuses and the main Offer Development Guide — each written specifically for your buyers." />
                    </ul>

                    <div className="flex flex-wrap gap-2 pt-5 border-t border-white/10">
                      {['Ebook', 'Checklist', 'Swipe File', 'Workbook'].map((label, i) => (
                        <Chip key={i}>
                          <FileText className="w-3.5 h-3.5 text-violet-400" /> {label}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  {/* Half 2: Tilted Offset Image Visual (Positioned safely away from text) */}
                  <div className="relative flex items-center justify-end min-h-[280px] lg:min-h-[340px] pointer-events-none">
                    <div className="relative w-full max-w-[420px] h-[240px]">
                      <div className="absolute inset-0 bg-violet-500/10 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
                      <img
                        src="/card-imgs/Asset%20bank.png"
                        alt="Asset Bank preview"
                        className="absolute -right-12 lg:-right-24 -bottom-16 md:-bottom-24 w-[115%] max-w-[480px] h-auto object-contain rounded-2xl border border-white/15 shadow-[0_30px_70px_rgba(0,0,0,0.85)] transform -rotate-[7deg] origin-bottom-right group-hover:scale-[1.02] transition-transform duration-500 z-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Card 2: Template Club (Reversed Split) */}
            <Reveal>
              <div className="w-full rounded-[25px] bg-[rgb(20,20,20)] border border-white/10 shadow-[rgba(0,0,0,0.3)_0px_3px_6px_0px] overflow-hidden relative group">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center p-8 md:p-12 min-h-[420px]">
                  {/* Half 1: Tilted Offset Image Visual (Positioned safely away from text) */}
                  <div className="relative flex items-center justify-start min-h-[280px] lg:min-h-[340px] order-2 lg:order-1 pointer-events-none">
                    <div className="relative w-full max-w-[420px] h-[240px]">
                      <div className="absolute inset-0 bg-blue-500/10 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
                      <img
                        src="/card-imgs/tempate.png"
                        alt="Template Club preview"
                        className="absolute -left-12 lg:-left-24 -bottom-16 md:-bottom-24 w-[115%] max-w-[480px] h-auto object-contain rounded-2xl border border-white/15 shadow-[0_30px_70px_rgba(0,0,0,0.85)] transform rotate-[7deg] origin-bottom-left group-hover:scale-[1.02] transition-transform duration-500 z-10"
                      />
                    </div>
                  </div>

                  {/* Half 2: Copy & Features */}
                  <div className="flex flex-col relative z-20 max-w-[480px] order-1 lg:order-2">
                    <div className="flex items-center gap-3.5 mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/10 border border-blue-500/20 shrink-0">
                        <img src="/3d-icons/3dicons-color-palette-dynamic-color.png" className="w-8 h-8 object-contain drop-shadow-md" alt="Template Library" />
                      </div>
                      <div>
                        <h3 className="text-[24px] md:text-[28px] font-semibold tracking-tight text-[#F5F5F7]">Template Library</h3>
                        <span className="font-mono text-[11px] text-blue-400 font-medium tracking-widest uppercase block mt-0.5">
                          Start Fast — Not from Scratch
                        </span>
                      </div>
                    </div>

                    <p className="text-[#A6A6B3] text-[15px] leading-relaxed mb-6">
                      OfferIQ gives you professionally designed offers, so you never have to start from scratch. Choose the one that best fits your business — then let OfferIQ fill it with your own messaging.
                    </p>

                    <ul className="list-none space-y-3 mb-8">
                      <Step title="Make It Yours — every template automatically adapts to your messaging, your positioning and your audience." />
                      <Step title="Everything is Connected — every resource is tied to the strategy you created earlier." />
                    </ul>

                    <div className="flex flex-wrap gap-2 pt-5 border-t border-white/10">
                      {['Coach', 'Course', 'SaaS', 'Digital', 'Service', 'Agency'].map((label, i) => (
                        <Chip key={i}>
                          <Layers className="w-3.5 h-3.5 text-blue-400" /> {label}
                        </Chip>
                      ))}
                    </div>
                  </div>
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
            <div
              className="w-full max-w-[1180px] mx-auto rounded-[25px] shadow-[rgba(0,0,0,0.3)_0px_3px_6px_0px] flex flex-col gap-6 md:gap-[48px] p-5 sm:p-8 md:p-[50px]"
              style={{
                border: '1.25px solid transparent',
                background: 'linear-gradient(rgb(20,20,20), rgb(20,20,20)) padding-box, linear-gradient(135deg, #18CCFC, #6344F5 32.5%, #AE48FF) border-box'
              }}
            >
              {/* Header */}
              <div className="flex flex-col items-center text-center gap-3 w-full max-w-[680px] mx-auto">
                <div
                  className="inline-block px-3 py-1 rounded-md text-[12px] font-bold uppercase tracking-widest text-black mb-1"
                  style={{ background: 'linear-gradient(168deg, rgb(248,223,66) 16%, rgb(255,245,153) 40%, rgb(225,164,39) 100%)' }}
                >
                  WHO IS OFFERIQ FOR?
                </div>
                <h2 className="font-semibold tracking-[-0.02em] leading-[1.08] text-[#F5F5F7] m-0" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>
                  As long as you have something Valuable To Share, OfferIQ Can Help You Turn It Into A Business.
                </h2>
                <p className="text-[17px] text-[#A6A6B3] max-w-[560px] m-0">
                  Four representative profiles — tap through to see how the same platform solves four different problems.
                </p>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 flex-wrap">
                {scenarios.map((sc, i) => (
                  <button
                    key={i}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[14px] font-medium transition-all cursor-pointer border ${activeScenario === i ? 'text-white border-white/20 bg-white/10' : 'text-[#A6A6B3] hover:text-white border-white/[0.07] bg-white/[0.03]'}`}
                    onClick={() => setActiveScenario(i)}
                  >
                    <img src={sc.avatar} alt={sc.tab} className="w-5 h-5 rounded-full object-cover shrink-0" /> {sc.tab}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div key={activeScenario} className="flex flex-col md:flex-row gap-6">

                {/* Left Panel — Problem */}
                <div className="flex-1 flex flex-col gap-5 p-7 rounded-[14px] bg-white/[0.03] border border-white/[0.08]">
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-4">
                    <img
                      src={s.avatar}
                      alt={s.who}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white/10 shrink-0"
                    />
                    <div className="flex flex-col gap-0.5">
                      <h3 className="text-[17px] text-white font-semibold m-0 leading-tight">{s.who}</h3>
                      <p className="text-[13px] text-white/50 m-0">{s.meta}</p>
                    </div>
                  </div>

                  <div className="w-full h-px bg-white/10" />

                  {/* Problem */}
                  <div className="flex flex-col gap-3">
                    <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-white/40">The Problem</span>
                    <p className="text-[15px] text-white leading-relaxed italic font-medium m-0">{s.quote}</p>
                    <p className="text-[14px] text-white/60 leading-relaxed m-0">{s.body}</p>
                  </div>
                </div>

                {/* Right Panel — Transformation */}
                <div className="flex-1 flex flex-col gap-5 p-7 rounded-[14px] bg-white/[0.03] border border-white/[0.08]">
                  <div className="flex flex-col gap-0">
                    <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-white/40 mb-3">The Transformation</span>
                    <h4 className="text-[32px] text-white font-semibold m-0 tracking-tight leading-none">The</h4>
                    <h4 className="text-[32px] font-semibold m-0 tracking-tight leading-none text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, rgb(124,92,255) 0%, #818CF8 100%)' }}>Transformation</h4>
                  </div>

                  <div className="w-full h-px bg-white/10" />

                  <div className="flex flex-col gap-3 flex-1">
                    {s.stats.map((st, i) => (
                      <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-[10px] bg-white/[0.03] border border-white/[0.07]">
                        <div className="w-5 h-5 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-emerald-400" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          {'from' in st && st.from ? (
                            <p className="text-[14px] text-white m-0 leading-tight">
                              <span className="text-white/40 line-through mr-2">{st.from}</span>
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

                  <a
                    href="/login"
                    className="group relative overflow-hidden w-full h-12 bg-[rgb(124,92,255)] hover:bg-[rgb(110,78,245)] text-white rounded-full font-semibold text-[14px] uppercase tracking-wider flex items-center justify-center shadow-[0_4px_24px_rgba(124,92,255,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] no-underline before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full group-hover:before:translate-x-full before:transition-transform before:duration-1000 before:ease-in-out"
                  >
                    <div className="relative flex items-center justify-center overflow-hidden h-5">
                      <span className="flex items-center gap-2 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full">
                        See How It Works <ArrowRight className="w-4 h-4" />
                      </span>
                      <span className="absolute flex items-center gap-2 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] translate-y-full group-hover:translate-y-0">
                        See How It Works <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </a>
                </div>
              </div>

            </div>
          </Reveal>
        </div>
      </section>


      {/* ── COMPARE ── */}
      <section className="py-[120px] md:py-[76px]" id="compare">
        <div className="max-w-[1180px] mx-auto px-7">
          <Reveal>
            <div
              className="w-full max-w-[1000px] mx-auto flex flex-col items-center gap-8 md:gap-[60px] p-5 sm:p-8 md:p-[50px]"
            >
              {/* Header */}
              <div className="flex flex-col items-center text-center gap-3 w-full max-w-[680px]">
                <div
                  className="inline-block px-3 py-1 rounded-md text-[12px] font-bold uppercase tracking-widest text-black mb-1"
                  style={{ background: 'linear-gradient(168deg, rgb(248,223,66) 16%, rgb(255,245,153) 40%, rgb(225,164,39) 100%)' }}
                >
                  Replace The Stack
                </div>
                <h2 className="font-semibold tracking-[-0.02em] leading-[1.08] text-[#F5F5F7] m-0" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>
                  You Don't Need to Hire an Entire Team.
                </h2>
                <p className="text-[17px] text-[#A6A6B3] max-w-[560px] m-0">
                  It's Not Just About Saving Money, It's About Saving Time And Making Better Decisions.
                </p>
              </div>

              {/* Rows */}
              <div className="flex flex-col gap-3 w-full">
                {compareRows.map((r, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-6 px-4 sm:px-6 py-3 sm:py-4 rounded-[10px] bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.14] transition-colors"
                  >
                    <span className="text-[15px] text-white/85 font-medium flex-1">{r[0]}</span>
                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                      <span className="text-[13px] sm:text-[14px] text-white/35 line-through decoration-white/20">{r[1]}</span>
                      <span className="flex items-center gap-2 text-emerald-400 text-[13px] sm:text-[14px] font-medium shrink-0">
                        <div className="w-5 h-5 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                        Included
                      </span>
                    </div>
                  </div>
                ))}

                {/* Total Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-6 px-4 sm:px-6 py-4 sm:py-5 rounded-[10px] bg-white/[0.02] border border-white/[0.12] mt-2">
                  <span className="text-white font-semibold text-[15px] flex-1">Total to replicate manually, per offer</span>
                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                    <span className="text-[13px] sm:text-[14px] text-white/35 line-through decoration-white/20">$6,200 – $32,747+</span>
                    <span className="flex items-center gap-2 text-[rgb(124,92,255)] font-semibold text-[13px] sm:text-[14px] shrink-0">
                      <div className="w-5 h-5 rounded-full bg-[rgba(124,92,255,0.15)] border border-[rgba(124,92,255,0.3)] flex items-center justify-center shrink-0">
                        <Zap className="w-3 h-3 text-[rgb(124,92,255)]" />
                      </div>
                      From $39/mo
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>


      {/* ── PRICING ── */}
      <section className="py-[120px] md:py-[80px]" id="pricing">
        <div className="max-w-[1180px] mx-auto px-7">
          <Reveal>
            <div className="max-w-[680px] mb-16 mx-auto text-center">
              <Eyebrow center>Pricing</Eyebrow>
              <h2 className="font-semibold tracking-[-0.02em] leading-[1.08] mb-[18px] text-[#F5F5F7] uppercase" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>
                Simple Pricing. <span className="text-[rgb(124,92,255)]">No Surprises.</span>
              </h2>
              <p className="text-[17px] text-[#A6A6B3] max-w-[560px] mx-auto">$1 for your first 7 days - Cancel anytime from your account, in one click.</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 w-full max-w-[1180px] mx-auto items-stretch">
            {pricingTiers.map((t, i) => (
              <Reveal key={i}>
                <div
                  className={`relative w-full rounded-[14px] p-7 md:p-8 overflow-hidden flex flex-col justify-between h-full border ${
                    i === 2 
                      ? 'border-[#E1A427]/40 bg-white/[0.03]' 
                      : i === 1
                      ? 'border-transparent'
                      : 'border-white/[0.08] bg-white/[0.03]'
                  }`}
                  style={
                    i === 1 
                      ? { background: 'linear-gradient(rgb(18,18,18), rgb(18,18,18)) padding-box, linear-gradient(135deg, #18CCFC, #6344F5 32.5%, #AE48FF) border-box', borderWidth: '1.25px' }
                      : {}
                  }
                >
                  {/* Content Container */}
                  <div className="relative z-10 flex flex-col justify-between h-full gap-8">
                    {/* Top Group: Name, Badge, Best For, Price */}
                    <div className="flex flex-col gap-5">
                      <div className="flex justify-between items-start">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                          i === 0 ? 'bg-violet-500/10 border border-violet-500/20 text-violet-400' :
                          i === 1 ? 'bg-purple-500/10 border border-purple-500/20 text-purple-300' :
                          'bg-[#E1A427]/10 border border-[#E1A427]/20 text-[#E1A427]'
                        }`}>
                          {i === 0 ? <img src="/3d-icons/3dicons-rocket-dynamic-color.png" className="w-12 h-12 object-contain drop-shadow-md" alt="Starter" /> : i === 1 ? <img src="/3d-icons/3dicons-chart-dynamic-color.png" className="w-11 h-11 object-contain drop-shadow-md" alt="Growth" /> : <img src="/3d-icons/3dicons-crown-dynamic-color.png" className="w-12 h-12 object-contain drop-shadow-md" alt="Agency" />}
                        </div>
                        {t.popular && (
                          <div className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-[0_2px_10px_rgba(124,92,255,0.4)]">
                            Most Popular
                          </div>
                        )}
                        {i === 2 && (
                          <div 
                            className="px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-widest text-black shadow-[0_2px_10px_rgba(225,164,39,0.4)]"
                            style={{ background: 'linear-gradient(168deg, rgb(248,223,66) 16%, rgb(255,245,153) 40%, rgb(225,164,39) 100%)' }}
                          >
                            Agency Scale
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <h3 className="text-[26px] text-white font-semibold m-0 leading-tight">
                          {t.name} Plan
                        </h3>
                        <p className="text-[#A6A6B3] text-[15px] leading-relaxed m-0 min-h-[40px]">
                          {t.best}
                        </p>
                      </div>

                      <div className="flex flex-col gap-1 pt-4 border-t border-white/10">
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className={`text-[42px] font-semibold tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-br ${
                            i === 2 ? 'from-[#F8DF42] to-[#E1A427]' : 'from-white to-white/70'
                          }`}>
                            {t.price}
                          </span>
                          <span className="text-[16px] text-white/50 font-medium">{t.period}</span>
                        </div>
                        <p className={`text-[13px] font-mono italic m-0 leading-relaxed ${i === 2 ? 'text-[#E1A427]/80' : 'text-white/30'}`}>{t.sub}</p>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="flex flex-col gap-3 flex-1 pt-4 border-t border-white/10">
                      {t.features.map((f, j) => (
                        <div key={j} className="flex items-start gap-3 w-full">
                          <Check className={`w-4 h-4 shrink-0 mt-0.5 ${i === 2 ? 'text-[#E1A427]' : 'text-emerald-400'}`} />
                          <p className="text-[15px] text-[#A6A6B3] m-0 leading-relaxed" dangerouslySetInnerHTML={{ __html: f }}></p>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <a
                      href="/login"
                      className={`group/btn relative overflow-hidden w-full h-12 rounded-full font-semibold text-[14px] uppercase tracking-wider flex items-center justify-center transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] no-underline mt-4 shrink-0 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full group-hover/btn:before:translate-x-full before:transition-transform before:duration-1000 before:ease-in-out ${
                        i === 2
                          ? 'text-black shadow-[0_4px_24px_rgba(225,164,39,0.4)] hover:shadow-[0_8px_32px_rgba(225,164,39,0.6)]'
                          : 'text-white bg-[rgb(124,92,255)] hover:bg-[rgb(110,78,245)] shadow-[0_4px_24px_rgba(124,92,255,0.35)] hover:shadow-[0_8px_32px_rgba(124,92,255,0.55)]'
                      }`}
                      style={i === 2 ? { background: 'linear-gradient(168deg, rgb(248,223,66) 16%, rgb(255,245,153) 40%, rgb(225,164,39) 100%)' } : {}}
                    >
                      <div className="relative flex items-center justify-center overflow-hidden h-5">
                        <span className="flex items-center gap-2 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover/btn:-translate-y-full">
                          <span>{t.cta}</span>
                          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
                        </span>
                        <span className="absolute flex items-center gap-2 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] translate-y-full group-hover/btn:translate-y-0">
                          <span>{t.cta}</span>
                          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
                        </span>
                      </div>
                    </a>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="flex flex-col gap-8 mt-12 max-w-[700px] mx-auto">
              <div className="flex flex-col sm:flex-row items-center gap-4 p-5 rounded-xl text-[15px] text-emerald-50 bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_20px_rgba(52,211,153,0.15)] text-center sm:text-left">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="font-medium">Backed by a 30-day money-back guarantee. If OfferIQ isn't right for you, get a full refund — no conditions.</span>
              </div>
              <p className="text-center text-[15px] text-[#A6A6B3] leading-relaxed">
                OfferIQ isn't just another software - OfferIQ is helping you move from an idea to a launched business - to a growing business.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-[120px] md:py-[76px] w-full relative overflow-hidden" id="faq">
        <div className="max-w-[1180px] mx-auto px-7">
          <Reveal>
            <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-16">
              {/* Left Column - Headers */}
              <div className="flex flex-col justify-start items-start gap-5 md:w-[380px] shrink-0">
                <div
                  className="inline-block px-3 py-1 rounded-md text-[12px] font-bold uppercase tracking-widest text-black mb-1"
                  style={{ background: 'linear-gradient(168deg, rgb(248,223,66) 16%, rgb(255,245,153) 40%, rgb(225,164,39) 100%)' }}
                >
                  Good To Know
                </div>
                <h2 className="font-semibold tracking-[-0.02em] leading-[1.08] text-[#F5F5F7] m-0" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>
                  Everything you need before you start
                </h2>
                <p className="text-[17px] text-[#A6A6B3] leading-relaxed m-0">
                  Answers to the most common questions. If something is missing, we'll be happy to help.
                </p>
                <a
                  href="mailto:help@ofiq.app"
                  className="inline-flex items-center gap-2 px-7 py-[12px] mt-4 rounded-full text-[15px] font-semibold text-[#F5F5F7] transition-all hover:bg-white/[0.08]"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.14)' }}
                >
                  Contact Us
                </a>
              </div>

              {/* Right Column - Accordions */}
              <div className="flex flex-col flex-1 w-full gap-2">
                {faqs.map((f, i) => (
                  <FaqItem
                    key={i}
                    q={f.q}
                    a={f.a}
                    isOpen={openFaq === i}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  />
                ))}
              </div>
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



    </div>
  );
}
