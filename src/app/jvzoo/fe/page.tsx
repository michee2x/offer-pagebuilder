"use client";

import { useEffect, useState, useRef } from "react";

// ─── Countdown Timer ───────────────────────────────────────────────────────────
function CountdownTimer() {
  const [time, setTime] = useState({ h: 3, m: 47, s: 22 });

  useEffect(() => {
    const stored = localStorage.getItem("oiq_fe_deadline");
    let deadline: number;
    if (stored) {
      deadline = Number(stored);
    } else {
      deadline = Date.now() + (3 * 3600 + 47 * 60 + 22) * 1000;
      localStorage.setItem("oiq_fe_deadline", String(deadline));
    }

    const tick = () => {
      const diff = Math.max(0, deadline - Date.now());
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <span className="fe-timer">
      {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
    </span>
  );
}

// ─── Scroll-reveal hook ────────────────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, visible };
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`fe-reveal ${visible ? "fe-reveal--in" : ""}`}
    >
      {children}
    </div>
  );
}

// ─── CTA Button ────────────────────────────────────────────────────────────────
function CTAButton({ label = "Build My First Offer — $49 One-Time", large = false }: { label?: string; large?: boolean }) {
  return (
    <a
      href="#"
      className={`fe-cta-btn ${large ? "fe-cta-btn--lg" : ""}`}
      onClick={(e) => e.preventDefault()}
    >
      <span>{label}</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
    </a>
  );
}

// ─── Testimonial Card ──────────────────────────────────────────────────────────
function TestimonialCard({ quote, name, role }: { quote: string; name: string; role: string }) {
  return (
    <div className="fe-testimonial">
      <div className="fe-testimonial__stars">★★★★★</div>
      <p className="fe-testimonial__quote">"{quote}"</p>
      <div className="fe-testimonial__author">
        <div className="fe-testimonial__avatar">{name[0]}</div>
        <div>
          <div className="fe-testimonial__name">{name}</div>
          <div className="fe-testimonial__role">{role}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Feature Row ───────────────────────────────────────────────────────────────
function FeatureRow({ icon, title, description, value }: { icon: string; title: string; description: string; value: string }) {
  return (
    <div className="fe-feature">
      <div className="fe-feature__icon">{icon}</div>
      <div className="fe-feature__body">
        <div className="fe-feature__title">{title}</div>
        <div className="fe-feature__desc">{description}</div>
      </div>
      <div className="fe-feature__value">{value}</div>
    </div>
  );
}

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`fe-faq__item ${open ? "fe-faq__item--open" : ""}`}>
      <button className="fe-faq__q" onClick={() => setOpen(!open)}>
        {q}
        <span className="fe-faq__chevron">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="fe-faq__a">{a}</div>}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function FEPage() {
  return (
    <>
      <style>{`
        /* ── Reset & Base ── */
        .fe-page { background: #070708; color: #e8e8f0; font-family: 'DM Sans', system-ui, sans-serif; line-height: 1.65; overflow-x: hidden; }

        /* ── Urgency Banner ── */
        .fe-banner { background: linear-gradient(90deg, #f5a623 0%, #ff6b35 100%); color: #0a0a0b; font-weight: 700; font-size: 14px; letter-spacing: 0.01em; padding: 12px 20px; text-align: center; position: sticky; top: 0; z-index: 100; display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; }
        .fe-banner a { color: #0a0a0b; text-decoration: underline; }
        .fe-timer { font-variant-numeric: tabular-nums; background: rgba(0,0,0,0.15); padding: 2px 10px; border-radius: 6px; letter-spacing: 0.08em; }

        /* ── Scroll Reveal ── */
        .fe-reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .fe-reveal--in { opacity: 1; transform: translateY(0); }

        /* ── Sections ── */
        .fe-section { max-width: 860px; margin: 0 auto; padding: 72px 24px; }
        .fe-section--wide { max-width: 1100px; }
        .fe-section--center { text-align: center; }

        /* ── Hero ── */
        .fe-hero { background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245,166,35,0.18) 0%, transparent 70%); padding: 80px 24px 64px; text-align: center; }
        .fe-hero__pre { display: inline-block; font-size: 13px; font-weight: 600; color: #f5a623; letter-spacing: 0.06em; text-transform: uppercase; border: 1px solid rgba(245,166,35,0.3); border-radius: 100px; padding: 5px 16px; margin-bottom: 24px; }
        .fe-hero__h1 { font-size: clamp(32px, 5vw, 58px); font-weight: 800; line-height: 1.15; letter-spacing: -0.02em; color: #fff; max-width: 820px; margin: 0 auto 20px; }
        .fe-hero__sub { font-size: clamp(16px, 2vw, 19px); color: rgba(232,232,240,0.65); max-width: 640px; margin: 0 auto 36px; }
        .fe-hero__paths { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; max-width: 680px; margin: 40px auto 0; text-align: left; }
        @media (max-width: 600px) { .fe-hero__paths { grid-template-columns: 1fr; } }
        .fe-hero__path { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 20px; }
        .fe-hero__path-label { font-size: 11px; font-weight: 700; color: #f5a623; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px; }
        .fe-hero__path-text { font-size: 14px; color: rgba(232,232,240,0.7); }

        /* ── Video Slot ── */
        .fe-video-slot { max-width: 720px; margin: 48px auto; border-radius: 16px; overflow: hidden; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); aspect-ratio: 16/9; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.2); font-size: 15px; gap: 10px; }
        .fe-video-slot__play { width: 56px; height: 56px; background: rgba(245,166,35,0.15); border: 1px solid rgba(245,166,35,0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; }

        /* ── CTA Button ── */
        .fe-cta-btn { display: inline-flex; align-items: center; gap: 10px; background: linear-gradient(135deg, #f5a623 0%, #ff6b35 100%); color: #0a0a0b; font-weight: 800; font-size: 16px; border-radius: 100px; padding: 16px 32px; text-decoration: none; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 8px 32px rgba(245,166,35,0.35); cursor: pointer; border: none; white-space: nowrap; }
        .fe-cta-btn:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 14px 40px rgba(245,166,35,0.45); }
        .fe-cta-btn:active { transform: scale(0.98); }
        .fe-cta-btn--lg { font-size: 19px; padding: 20px 44px; }
        .fe-cta-wrap { text-align: center; margin: 40px 0; }
        .fe-cta-note { font-size: 13px; color: rgba(232,232,240,0.4); margin-top: 12px; }

        /* ── Section Headings ── */
        .fe-h2 { font-size: clamp(24px, 3.5vw, 38px); font-weight: 800; letter-spacing: -0.02em; color: #fff; margin-bottom: 16px; }
        .fe-h3 { font-size: clamp(18px, 2.5vw, 24px); font-weight: 700; color: #fff; margin-bottom: 12px; }
        .fe-lead { font-size: 18px; color: rgba(232,232,240,0.65); margin-bottom: 32px; }
        .fe-divider { border: none; border-top: 1px solid rgba(255,255,255,0.07); margin: 0; }

        /* ── Testimonials ── */
        .fe-testimonials { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
        .fe-testimonial { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); border-radius: 16px; padding: 24px; }
        .fe-testimonial__stars { color: #f5a623; font-size: 16px; margin-bottom: 12px; letter-spacing: 2px; }
        .fe-testimonial__quote { font-size: 15px; color: rgba(232,232,240,0.8); font-style: italic; margin-bottom: 18px; line-height: 1.6; }
        .fe-testimonial__author { display: flex; align-items: center; gap: 10px; }
        .fe-testimonial__avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #f5a623, #ff6b35); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; color: #0a0a0b; flex-shrink: 0; }
        .fe-testimonial__name { font-weight: 700; font-size: 14px; color: #fff; }
        .fe-testimonial__role { font-size: 12px; color: rgba(232,232,240,0.4); }

        /* ── Stats Bar ── */
        .fe-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(255,255,255,0.07); border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.07); }
        @media (max-width: 600px) { .fe-stats { grid-template-columns: 1fr; } }
        .fe-stat { background: rgba(255,255,255,0.03); padding: 28px 24px; text-align: center; }
        .fe-stat__num { font-size: 38px; font-weight: 800; color: #f5a623; letter-spacing: -0.03em; }
        .fe-stat__label { font-size: 13px; color: rgba(232,232,240,0.5); margin-top: 4px; }

        /* ── Workarounds Grid ── */
        .fe-workarounds { display: grid; gap: 12px; }
        .fe-workaround { background: rgba(255,60,60,0.05); border: 1px solid rgba(255,60,60,0.15); border-radius: 12px; padding: 18px 20px; display: flex; gap: 14px; }
        .fe-workaround__x { color: #ff4444; font-weight: 800; font-size: 18px; flex-shrink: 0; margin-top: 2px; }
        .fe-workaround__text { font-size: 15px; color: rgba(232,232,240,0.75); }
        .fe-workaround__text strong { color: #fff; }

        /* ── What If Section ── */
        .fe-whatif { background: rgba(245,166,35,0.06); border: 1px solid rgba(245,166,35,0.15); border-radius: 20px; padding: 40px; text-align: center; }
        .fe-whatif p { font-size: 20px; color: rgba(232,232,240,0.85); margin: 0 0 16px; }
        .fe-whatif p:last-child { margin: 0; }
        .fe-whatif strong { color: #f5a623; }

        /* ── Features ── */
        .fe-feature { display: flex; align-items: flex-start; gap: 16px; padding: 20px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .fe-feature:last-child { border-bottom: none; }
        .fe-feature__icon { font-size: 24px; width: 44px; height: 44px; background: rgba(245,166,35,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .fe-feature__body { flex: 1; }
        .fe-feature__title { font-weight: 700; font-size: 16px; color: #fff; margin-bottom: 4px; }
        .fe-feature__desc { font-size: 14px; color: rgba(232,232,240,0.55); }
        .fe-feature__value { font-size: 13px; font-weight: 700; color: rgba(245,166,35,0.7); white-space: nowrap; }

        /* ── Process Steps ── */
        .fe-steps { display: grid; gap: 16px; }
        .fe-step { display: flex; gap: 16px; align-items: flex-start; }
        .fe-step__num { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #f5a623, #ff6b35); color: #0a0a0b; font-weight: 800; font-size: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .fe-step__body { padding-top: 8px; }
        .fe-step__title { font-weight: 700; color: #fff; margin-bottom: 4px; }
        .fe-step__time { font-size: 12px; color: #f5a623; font-weight: 600; margin-bottom: 4px; }
        .fe-step__desc { font-size: 14px; color: rgba(232,232,240,0.55); }

        /* ── Pricing Table ── */
        .fe-pricing { background: rgba(255,255,255,0.03); border: 1px solid rgba(245,166,35,0.25); border-radius: 20px; overflow: hidden; }
        .fe-pricing__header { background: linear-gradient(135deg, rgba(245,166,35,0.15), rgba(255,107,53,0.1)); padding: 28px 32px; border-bottom: 1px solid rgba(245,166,35,0.15); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .fe-pricing__tag { font-size: 13px; font-weight: 700; color: #f5a623; text-transform: uppercase; letter-spacing: 0.08em; }
        .fe-pricing__title { font-size: 22px; font-weight: 800; color: #fff; }
        .fe-pricing__row { display: flex; justify-content: space-between; align-items: center; padding: 14px 32px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .fe-pricing__row:last-child { border-bottom: none; }
        .fe-pricing__item { font-size: 15px; color: rgba(232,232,240,0.75); }
        .fe-pricing__val { font-size: 14px; font-weight: 600; color: rgba(232,232,240,0.4); }
        .fe-pricing__total { background: rgba(245,166,35,0.08); border-top: 1px solid rgba(245,166,35,0.2); padding: 24px 32px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
        .fe-pricing__total-label { font-size: 16px; font-weight: 700; color: rgba(232,232,240,0.6); }
        .fe-pricing__total-val { font-size: 14px; color: rgba(232,232,240,0.4); text-decoration: line-through; }
        .fe-pricing__price { font-size: 48px; font-weight: 900; color: #f5a623; letter-spacing: -0.04em; line-height: 1; }
        .fe-pricing__price span { font-size: 20px; font-weight: 600; vertical-align: super; }

        /* ── Comparison Table ── */
        .fe-compare { width: 100%; border-collapse: collapse; border-radius: 16px; overflow: hidden; }
        .fe-compare th { background: rgba(255,255,255,0.05); padding: 16px 20px; font-size: 14px; font-weight: 700; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .fe-compare th:last-child { color: #f5a623; }
        .fe-compare td { padding: 14px 20px; font-size: 14px; border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: top; }
        .fe-compare td:first-child { color: rgba(232,232,240,0.6); }
        .fe-compare td:nth-child(2) { color: rgba(232,232,240,0.45); }
        .fe-compare td:last-child { color: #f5a623; font-weight: 600; }
        .fe-compare tr:last-child td { border-bottom: none; }
        .fe-compare-wrap { border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; }

        /* ── Bonuses ── */
        .fe-bonuses { display: grid; gap: 12px; }
        .fe-bonus { background: rgba(245,166,35,0.06); border: 1px solid rgba(245,166,35,0.15); border-radius: 12px; padding: 18px 20px; display: flex; gap: 14px; align-items: flex-start; }
        .fe-bonus__icon { font-size: 22px; flex-shrink: 0; }
        .fe-bonus__title { font-weight: 700; color: #fff; font-size: 15px; margin-bottom: 4px; }
        .fe-bonus__desc { font-size: 13px; color: rgba(232,232,240,0.55); }

        /* ── Checklist ── */
        .fe-checklist { display: flex; flex-wrap: wrap; gap: 10px 24px; }
        .fe-check { display: flex; align-items: center; gap: 8px; font-size: 14px; color: rgba(232,232,240,0.75); }
        .fe-check::before { content: "✅"; font-size: 14px; flex-shrink: 0; }

        /* ── Guarantee ── */
        .fe-guarantee { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.09); border-radius: 16px; padding: 28px; display: flex; gap: 20px; align-items: center; }
        .fe-guarantee__badge { font-size: 48px; flex-shrink: 0; }
        .fe-guarantee__text { font-size: 15px; color: rgba(232,232,240,0.7); }
        .fe-guarantee__title { font-weight: 800; font-size: 18px; color: #fff; margin-bottom: 6px; }

        /* ── FAQ ── */
        .fe-faq { display: grid; gap: 8px; }
        .fe-faq__item { border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; }
        .fe-faq__item--open { border-color: rgba(245,166,35,0.25); }
        .fe-faq__q { width: 100%; background: rgba(255,255,255,0.03); border: none; text-align: left; padding: 18px 20px; font-size: 15px; font-weight: 600; color: #fff; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 16px; transition: background 0.2s; font-family: inherit; }
        .fe-faq__q:hover { background: rgba(255,255,255,0.06); }
        .fe-faq__chevron { font-size: 20px; color: #f5a623; flex-shrink: 0; font-weight: 400; }
        .fe-faq__a { padding: 0 20px 18px; font-size: 14px; color: rgba(232,232,240,0.6); line-height: 1.7; }

        /* ── Founder ── */
        .fe-founder { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 36px; }
        .fe-founder__quote { font-size: 17px; color: rgba(232,232,240,0.8); font-style: italic; line-height: 1.7; margin-bottom: 20px; border-left: 3px solid #f5a623; padding-left: 20px; }
        .fe-founder__sig { font-weight: 700; color: #fff; font-size: 15px; }
        .fe-founder__role { font-size: 13px; color: rgba(232,232,240,0.4); }

        /* ── PS Block ── */
        .fe-ps { background: rgba(245,166,35,0.06); border: 1px solid rgba(245,166,35,0.15); border-radius: 16px; padding: 28px; }
        .fe-ps p { font-size: 15px; color: rgba(232,232,240,0.75); margin: 0 0 10px; }
        .fe-ps p:last-child { margin: 0; }
        .fe-ps strong { color: #f5a623; }

        /* ── Final CTA ── */
        .fe-final { background: radial-gradient(ellipse 80% 100% at 50% 100%, rgba(245,166,35,0.15) 0%, transparent 70%); text-align: center; padding: 80px 24px; }
        .fe-final__note { font-size: 13px; color: rgba(232,232,240,0.35); margin-top: 16px; }

        /* ── Warning note ── */
        .fe-note { display: inline-block; background: rgba(255,200,0,0.08); border: 1px solid rgba(255,200,0,0.2); border-radius: 8px; padding: 4px 12px; font-size: 12px; color: rgba(255,200,0,0.6); margin-bottom: 12px; }

        /* ── Pill label ── */
        .fe-pill { display: inline-block; background: rgba(245,166,35,0.12); color: #f5a623; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; border-radius: 100px; padding: 4px 14px; margin-bottom: 20px; }

        /* ── Responsive ── */
        @media (max-width: 600px) {
          .fe-pricing__header, .fe-pricing__row, .fe-pricing__total { padding-left: 20px; padding-right: 20px; }
          .fe-guarantee { flex-direction: column; text-align: center; }
        }
      `}</style>

      <div className="fe-page">

        {/* ── Urgency Banner ── */}
        <div className="fe-banner">
          ⏳ Founder's Price Ends Soon — Then It's $39/Month. Lock It In Now.{" "}
          <CountdownTimer />
        </div>

        {/* ── Hero ── */}
        <section className="fe-hero">
          <Reveal>
            <div className="fe-pill">For Creators · Product Owners · Coaches · First-Time Entrepreneurs</div>
            <h1 className="fe-hero__h1">
              Turn Any Idea Into A Complete, Sellable Offer: Strategy, Copy & Live Funnel — in one session.
            </h1>
            <p className="fe-hero__sub">
              Stop guessing what to sell, what to charge, and what to say. Give OfferIQ an idea, a URL, or an existing offer, and get back a full Intelligence Report, a matched copy set, and a live, payment-ready funnel — before you close the tab.
            </p>
            <CTAButton large />
            <p className="fe-cta-note" style={{ marginTop: 16 }}>No marketing experience required · 30-day money-back guarantee</p>
          </Reveal>

          <Reveal delay={150}>
            <div className="fe-hero__paths">
              <div className="fe-hero__path">
                <div className="fe-hero__path-label">Already Have Something</div>
                <div className="fe-hero__path-text">Paste a URL, upload a PDF, or describe it. OfferIQ builds the strategy and funnel around what you've already got.</div>
              </div>
              <div className="fe-hero__path">
                <div className="fe-hero__path-label">Starting From Scratch</div>
                <div className="fe-hero__path-text">Give OfferIQ your niche, audience, and price range. It hands you proven offer ideas, then builds the complete product you pick.</div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={250}>
            <div className="fe-video-slot" style={{ maxWidth: 720, margin: "48px auto 0" }}>
              <div className="fe-video-slot__play">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(245,166,35,0.9)"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
              <span>Demo Video Coming Soon</span>
            </div>
          </Reveal>
        </section>

        <hr className="fe-divider" />

        {/* ── Testimonials ── */}
        <section className="fe-section">
          <Reveal>
            <div className="fe-note">⚠️ Sample testimonials — replace with real ones before launch</div>
            <div className="fe-testimonials">
              <TestimonialCard
                quote="I had a coaching idea sitting in my notes for eight months. Pasted a rough description in, and had pricing, positioning, and a live page inside an hour."
                name="Danielle M."
                role="Business Coach"
              />
              <TestimonialCard
                quote="My course was already live and just not selling. The report told me exactly what was wrong with the price and the page. Fixed both."
                name="Marcus T."
                role="Course Creator"
              />
              <TestimonialCard
                quote="I had no idea what to charge. The pricing strategy section alone was worth ten times the price."
                name="Priya K."
                role="Consultant"
              />
            </div>
          </Reveal>
        </section>

        <hr className="fe-divider" />

        {/* ── Stats ── */}
        <section className="fe-section">
          <Reveal>
            <div className="fe-stats">
              <div className="fe-stat"><div className="fe-stat__num">35,000+</div><div className="fe-stat__label">Real offers benchmarked</div></div>
              <div className="fe-stat"><div className="fe-stat__num">&lt;30 min</div><div className="fe-stat__label">Idea to live funnel</div></div>
              <div className="fe-stat"><div className="fe-stat__num">$6,200+</div><div className="fe-stat__label">Saved vs. manual build</div></div>
            </div>
          </Reveal>
        </section>

        <hr className="fe-divider" />

        {/* ── The Actual Business ── */}
        <section className="fe-section">
          <Reveal>
            <h2 className="fe-h2">The Actual Business, Before Anything Else</h2>
            <p className="fe-lead">Every course, coaching program, digital product, and service business starts the same way: someone who knows something valuable has to turn that knowledge into an offer someone will pay for. That's the actual business. Everything else — the page, the ads, the emails — is construction.</p>
            <p style={{ color: "rgba(232,232,240,0.65)", fontSize: 16, lineHeight: 1.75 }}>
              Building a funnel before that strategy exists is like pouring a foundation before you've seen a blueprint. The version everyone's heard: figure out what you're good at, make a page, and sell it. Here's what that sentence skips over — who specifically buys this, what they'll actually pay, how to position it against everything else they've already seen, the actual words for five different pages, a lead magnet, which platform to advertise on first, and a set of emails for everyone who doesn't buy the first time.
            </p>
          </Reveal>
        </section>

        <hr className="fe-divider" />

        {/* ── Workarounds ── */}
        <section className="fe-section">
          <Reveal>
            <h2 className="fe-h2">The Workarounds That Don't Work</h2>
            <div className="fe-workarounds">
              {[
                { title: "Hire it out, piece by piece.", detail: "An offer strategist runs $2,000–$10,000. A copywriter runs $2,000–$15,000 per page. You're 3–6 weeks and several thousand dollars in before a single page is live — and still guessing." },
                { title: "Stitch together generic AI tools.", detail: "$20–$50/month for a writing tool, $99–$297/month for a page builder. Neither knows your positioning or what to say first. You still have to know the strategy before either tool is useful." },
                { title: "Buy a template pack or a course.", detail: "$67–$297 one-time. You get a shape to fill in, not a benchmarked price, not a persona, not a reason to believe the positioning is right for your specific offer." },
                { title: "Do it all yourself, from scratch.", detail: "Free in dollars. 20–40+ hours in research, writing, and design — and at the end of it, you still don't know if any of it is right, because none of it was checked against what actually converts." },
              ].map((w) => (
                <div className="fe-workaround" key={w.title}>
                  <div className="fe-workaround__x">✕</div>
                  <div className="fe-workaround__text"><strong>{w.title}</strong> {w.detail}</div>
                </div>
              ))}
            </div>
          </Reveal>

          <div className="fe-cta-wrap"><Reveal delay={100}><CTAButton /></Reveal></div>
        </section>

        <hr className="fe-divider" />

        {/* ── What If ── */}
        <section className="fe-section fe-section--center">
          <Reveal>
            <h2 className="fe-h2">What If The Strategy Came First?</h2>
            <div className="fe-whatif">
              <p>What if positioning, pricing, and a full-funnel blueprint came first — <strong>automatically</strong> — before you wrote a word?</p>
              <p>What if the copy for every page came out of that same strategy, not a blank cursor?</p>
              <p>What if the pages assembled themselves and the ad copy, video script, and email sequences were already in place before you'd spent a dollar on traffic?</p>
              <p style={{ marginTop: 20, fontWeight: 700, color: "#fff" }}>And what if the Offer is built for you? Yes! — A Complete, Sellable Offer built from Intelligence. No guesses.</p>
            </div>
            <p style={{ color: "rgba(232,232,240,0.65)", marginTop: 24, fontSize: 16 }}>
              This is not a page builder. It's not a copywriting tool. It's not a course platform. <strong style={{ color: "#fff" }}>OfferIQ is the layer that comes before all three</strong> — the strategic intelligence that decides what to sell, who to sell it to, and what to charge — then builds the pages, copy, and traffic plan from that same data.
            </p>
          </Reveal>
        </section>

        <hr className="fe-divider" />

        {/* ── Features ── */}
        <section className="fe-section">
          <Reveal>
            <h2 className="fe-h2">What OfferIQ Actually Does</h2>
            <p className="fe-lead">Instead of paying thousands and waiting weeks — everything in one session, benchmarked against 35,000+ real offers.</p>
          </Reveal>
          <Reveal delay={100}>
            <FeatureRow icon="🧠" title="Strategy Report" description="16 strategic sections — Positioning, Persona, Pain Point Mapping, Revenue Model, Funnel Blueprint, Pricing Strategy, Conversion Hooks, 0–100 Funnel Health Score, and more." value="vs. $2,000–$10,000" />
            <FeatureRow icon="✍️" title="Copy Engine" description="Full, ready-to-publish copy for every page — Sales, Upsell, Downsell, Thank You — written from your Intelligence Report, not a generic swipe file." value="vs. $2,000–$15,000/page" />
            <FeatureRow icon="🖥️" title="Funnel Builder" description="Every page assembled automatically from your report's design direction. Inline editing, AI section reordering, plain-language AI edits." value="vs. $99–$297/mo" />
            <FeatureRow icon="📦" title="Asset Bank" description="Your lead magnet and bonus stack, generated as real, downloadable, finished files." value="vs. $500–$2,000" />
            <FeatureRow icon="🚀" title="Traffic Intelligence™" description="Platform priority matrix, ready-to-deploy ad copy, a VSL script, a UGC script — before you spend a dollar." value="vs. $1,500–$5,000/mo" />
            <FeatureRow icon="📧" title="Email Sequences" description="Lead Nurture, Launch, Re-engagement, Client Onboarding, and Upsell — written and ready to connect." value="vs. $500–$2,000" />
            <FeatureRow icon="🌐" title="Publish & Deploy" description="One-click publishing, Stripe and PayPal integration built in. Live on your OfferIQ subdomain instantly." value="vs. platform fees" />
            <FeatureRow icon="👥" title="Leads & Analytics" description="Built-in CRM plus per-funnel analytics: traffic, conversion rate, traffic quality, device breakdown." value="vs. $97–$297/mo" />
            <FeatureRow icon="📦" title="Live Sellable Product" description="Unique Info Products built for your sale page, upsell and downsell — complete and ready to deliver." value="vs. $500–$5,000" />
          </Reveal>
        </section>

        <hr className="fe-divider" />

        {/* ── Process ── */}
        <section className="fe-section">
          <Reveal>
            <h2 className="fe-h2">The Process, Step By Step</h2>
            <p className="fe-lead">Most people go from idea to a launch-ready offer in under 30 minutes.</p>
            <div className="fe-steps">
              {[
                { n: "01", title: "Strategy Report", time: "~4 min", desc: "Positioning, pricing, a full-funnel blueprint. Start from an idea, a URL, a PDF, or nothing at all." },
                { n: "02", title: "Copy Engine", time: "~2 min", desc: "Full-funnel copy, in your buyer's exact vocabulary." },
                { n: "03", title: "Funnel Builder", time: "~5 min", desc: "Every page assembles automatically. Edit inline, or tell the AI Agent what to change." },
                { n: "04", title: "Lead Generation & Engagement Plan", time: "~4 min", desc: "Ad copy, a video sales script, a UGC script, full email sequences — before you spend a dollar on traffic." },
                { n: "05", title: "Publish & Go Live", time: "Instant", desc: "Connect Stripe or PayPal, publish live on your OfferIQ subdomain. Custom domain connection starts at Pro." },
              ].map((s) => (
                <div className="fe-step" key={s.n}>
                  <div className="fe-step__num">{s.n}</div>
                  <div className="fe-step__body">
                    <div className="fe-step__time">{s.time}</div>
                    <div className="fe-step__title">{s.title}</div>
                    <div className="fe-step__desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
          <div className="fe-cta-wrap"><Reveal delay={100}><CTAButton /></Reveal></div>
        </section>

        <hr className="fe-divider" />

        {/* ── Pricing Table ── */}
        <section className="fe-section">
          <Reveal>
            <div className="fe-pill">Front-End</div>
            <h2 className="fe-h2">Everything You're Getting Today</h2>
            <div className="fe-note">⚠️ Values below are proposed — not final</div>
            <div className="fe-pricing">
              <div className="fe-pricing__header">
                <div>
                  <div className="fe-pricing__tag">OfferIQ Starter</div>
                  <div className="fe-pricing__title">One-Time Access — All Included</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, color: "rgba(232,232,240,0.4)", textDecoration: "line-through", marginBottom: 4 }}>Total Value: $6,224</div>
                  <div className="fe-pricing__price"><span>$</span>49</div>
                  <div style={{ fontSize: 13, color: "rgba(232,232,240,0.4)" }}>One-Time</div>
                </div>
              </div>
              {[
                { item: "Live Sellable Offer (Main, Upsell & Downsell products)", val: "$2,997" },
                { item: "Two-Path Offer Analysis & Build Engine", val: "$497" },
                { item: "Full 16-Section Strategy Report", val: "$297" },
                { item: "Complete 5-Page Funnel Copy Set", val: "$997" },
                { item: "Live Funnel Builder (5 hosted pages)", val: "$297" },
                { item: "Asset Bank (lead magnet + 3 bonuses + Offer Guide)", val: "$297" },
                { item: "Full Email Sequence Suite (5 sequences)", val: "$197" },
                { item: "Traffic Intelligence™ Suite", val: "$397" },
                { item: "KPI Analytics Dashboard", val: "$97" },
                { item: "🎁 Bonus: Fast-Launch Swipe Pack", val: "$67" },
                { item: "🎁 Bonus: 30 Proven Offer Hooks Cheat Sheet", val: "$47" },
                { item: "🎁 Bonus: \"First Funnel in 24 Hours\" Video", val: "$37" },
              ].map((r) => (
                <div className="fe-pricing__row" key={r.item}>
                  <div className="fe-pricing__item">{r.item}</div>
                  <div className="fe-pricing__val">{r.val}</div>
                </div>
              ))}
            </div>
          </Reveal>
          <div className="fe-cta-wrap">
            <Reveal delay={100}>
              <CTAButton label="Build My First Offer — Save $6,175" large />
            </Reveal>
          </div>
        </section>

        <hr className="fe-divider" />

        {/* ── Comparison ── */}
        <section className="fe-section">
          <Reveal>
            <h2 className="fe-h2">Building Without A Blueprint vs. Building With OfferIQ</h2>
            <div className="fe-compare-wrap">
              <table className="fe-compare">
                <thead>
                  <tr>
                    <th>The Challenge</th>
                    <th>Without OfferIQ</th>
                    <th>With OfferIQ</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Positioning", "Guess, find out after launch", "Benchmarked against 35,000+ offers, before you build"],
                    ["Copy", "Write it, hope it lands", "Written from your own Strategy Report"],
                    ["Pages", "Assemble by hand or from a template", "Assembled automatically from your report's design direction"],
                    ["Traffic", "Guess where to advertise", "Platform priority matrix, before you spend a dollar"],
                    ["Cost & Time", "$6,200–$32,747+ and 3–6 weeks", "$49 and one sitting"],
                  ].map(([ch, without, with_]) => (
                    <tr key={ch}>
                      <td>{ch}</td>
                      <td>{without}</td>
                      <td>{with_}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </section>

        <hr className="fe-divider" />

        {/* ── Bonuses ── */}
        <section className="fe-section">
          <Reveal>
            <h2 className="fe-h2">Your Fast-Action Bonuses</h2>
            <div className="fe-bonuses">
              <div className="fe-bonus"><div className="fe-bonus__icon">🎁</div><div><div className="fe-bonus__title">Fast-Launch Swipe Pack</div><div className="fe-bonus__desc">20 pre-written eyebrow/headline/CTA formulas.</div></div></div>
              <div className="fe-bonus"><div className="fe-bonus__icon">🎁</div><div><div className="fe-bonus__title">30 Proven Offer Hooks Cheat Sheet</div><div className="fe-bonus__desc">5 hook archetypes across 6 niches.</div></div></div>
              <div className="fe-bonus"><div className="fe-bonus__icon">🎁</div><div><div className="fe-bonus__title">"First Funnel in 24 Hours" Video</div><div className="fe-bonus__desc">A focused 20-minute same-day walkthrough.</div></div></div>
            </div>
          </Reveal>
        </section>

        <hr className="fe-divider" />

        {/* ── Checklist ── */}
        <section className="fe-section">
          <Reveal>
            <h2 className="fe-h2">Why You'll Want This</h2>
            <div className="fe-checklist">
              {[
                "Live Sellable Offer",
                "16-section Intelligence Report",
                "Benchmarked against 35,000+ offers",
                "Full 5-page copy set",
                "Automatic page assembly",
                "Inline + AI-agent editing",
                "Lead magnet + bonus generation",
                "Platform priority matrix",
                "Ready-to-deploy ad copy",
                "VSL + UGC scripts",
                "5-sequence email suite",
                "One-click publish",
                "Stripe + PayPal built in",
                "Built-in CRM",
                "Per-funnel analytics",
                "Template Club access",
                "30-day guarantee",
              ].map((c) => <div className="fe-check" key={c}>{c}</div>)}
            </div>
          </Reveal>
        </section>

        <hr className="fe-divider" />

        {/* ── Guarantee ── */}
        <section className="fe-section">
          <Reveal>
            <div className="fe-guarantee">
              <div className="fe-guarantee__badge">🛡️</div>
              <div>
                <div className="fe-guarantee__title">30-Day Money-Back Guarantee</div>
                <div className="fe-guarantee__text">No interrogation, no hoops. If you go through the process and decide it's not for you, we'll refund every cent within 30 days. No questions asked.</div>
              </div>
            </div>
          </Reveal>
        </section>

        <hr className="fe-divider" />

        {/* ── Founder ── */}
        <section className="fe-section">
          <Reveal>
            <h2 className="fe-h2">Why I Built This</h2>
            <div className="fe-founder">
              <div className="fe-founder__quote">
                "I kept running into the same conversation with creators, coaches, and marketers. They weren't stuck because they lacked skill or effort — they were stuck because nobody had told them what to sell, who to sell it to, or what to charge for it. Every tool on the market assumes that part is already solved. I built OfferIQ to be the layer that comes before all of it."
              </div>
              <div className="fe-founder__sig">— Kenoye Kitoye</div>
              <div className="fe-founder__role">Founder, OfferIQ</div>
            </div>
          </Reveal>
        </section>

        <hr className="fe-divider" />

        {/* ── FAQ ── */}
        <section className="fe-section">
          <Reveal>
            <h2 className="fe-h2">Frequently Asked Questions</h2>
            <div className="fe-faq">
              {[
                { q: "Is this really one-time, or will I get billed later?", a: "One-time for Front-end and every upgrade tier. After this launch window closes, new customers move to the $39/month plan — buy now, and you're locked into one-time pricing for good." },
                { q: "Why is OfferIQ different from a funnel builder?", a: "Most funnel builders help you build pages. OfferIQ helps you decide what to sell, who to sell it to, how to position it, what to charge, and how to explain it — then builds the pages around that strategy. Funnel builders start with pages. OfferIQ starts with the offer." },
                { q: "What if I don't have any idea what to sell yet?", a: "Use \"I Don't Have Anything Yet.\" Give OfferIQ your niche, audience, and price range — it hands you offer ideas already proven to work, and builds the one you choose." },
                { q: "What if I already have an offer live somewhere else?", a: "Use \"I Already Have An Idea Or Existing Offer\" — paste the URL, and OfferIQ tells you where the positioning is likely costing you conversions." },
                { q: "Can I edit what OfferIQ creates?", a: "Yes. Edit anything inline, or tell the built-in AI Agent what to change in plain language. Treat the first output as a draft, not a final decision." },
                { q: "Does this work for my niche?", a: "The Strategy Report is benchmarked across a wide range of categories — creators, coaches, consultants, agencies, digital product sellers — not one template reused everywhere." },
                { q: "What happens when I hit the 5-offer cap?", a: "Your existing offers, pages, and data stay fully accessible. You can also upgrade to the Unlimited plan." },
                { q: "Can I connect my own domain?", a: "Not on Front-end — you're live on an OfferIQ subdomain, enough to launch and start selling today. Custom domain connection starts at Pro." },
                { q: "Can I use this for clients?", a: "Not on this tier — Front-end through Unlimited are personal-use. Client rights are introduced at Agency." },
              ].map((f) => <FAQItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </Reveal>
        </section>

        <hr className="fe-divider" />

        {/* ── PS Block ── */}
        <section className="fe-section">
          <Reveal>
            <div className="fe-ps">
              <p><strong>P.S.</strong> Three real traps kill most offers before they ever launch — the wrong thing, the wrong price, or expensive traffic sent to a slow funnel. OfferIQ addresses all three at once.</p>
              <p><strong>P.P.S.</strong> Doing this manually runs <strong>$6,200–$32,747+</strong> per offer, in real market rates. This is $49, once.</p>
              <p><strong>P.P.P.S.</strong> Founder pricing ends when this launch window closes. After that, it's $39/month for new customers.</p>
            </div>
          </Reveal>
        </section>

        {/* ── Final CTA ── */}
        <section className="fe-final">
          <Reveal>
            <p style={{ color: "rgba(232,232,240,0.5)", fontSize: 14, marginBottom: 12 }}>5 phases. Under 30 minutes. One sitting.</p>
            <h2 className="fe-h2">One idea. A live, payment-ready funnel.</h2>
            <p className="fe-lead">Built from 35,000 offers that already converted — not another guess.</p>
            <CTAButton label="Build My First Offer — $49 One-Time" large />
            <div className="fe-final__note">30-day guarantee · No monthly fee · Founder's pricing ends soon</div>
          </Reveal>
        </section>

      </div>
    </>
  );
}
