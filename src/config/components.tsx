import React from 'react';
import { PricingCards } from '../components/macro/Pricing';

// HeyMessage Components
import { HeyMessageHeader } from '../components/macro/Header';
import { HeyMessageFeatures } from '../components/macro/Features';
import { HeyMessageSplit } from '../components/macro/Content';
import { HeyMessageFAQ } from '../components/macro/FAQ';
import { HeyMessageCTA } from '../components/macro/CTA';
import { HeyMessageFooter } from '../components/macro/Footer';

// Feature Components
import { FeatureHeader } from '../components/macro/Header';
import { FeatureHero, HeroCenter } from '../components/macro/Hero';
import { FeatureLogos } from '../components/macro/Logos';
import { FeatureTestimonials } from '../components/macro/Testimonials';
import { FeatureFAQ } from '../components/macro/FAQ';
import { FeaturePricing } from '../components/macro/Pricing';
import { FeatureCTA } from '../components/macro/CTA';
import { FeatureFooter } from '../components/macro/Footer';
import { FeaturesGrid } from '../components/macro/Features/FeaturesGrid';
import { FeatureSplit } from '../components/macro/Content/FeatureSplit';

import { UpsellHero } from '../components/macro/Funnel/UpsellHero';
import { DownsellHero } from '../components/macro/Funnel/DownsellHero';
import { ThankYouHero } from '../components/macro/Funnel/ThankYouHero';
// ─────────────────────────────────────────────────────────────────────────────
// Component Registry
// ─────────────────────────────────────────────────────────────────────────────
//
// HOW STYLING WORKS (UPDATED):
// Every component accepts BOTH a `className` prop (Tailwind string) AND a
// `style` prop (inline CSS object). The AI is instructed to prefer `className`
// because it enables hover:, transition-, group-hover:, and animation classes
// that are impossible with inline styles.
//
// Tailwind JIT arbitrary value syntax is used for dynamic colours:
//   bg-[#09090b]   text-[#7c3aed]   hover:bg-[#1e1e2e]   border-[#ffffff20]
//
// ─────────────────────────────────────────────────────────────────────────────

// Lucide — statically imported whitelist (~50 icons the AI can reference by name)
import {
  Zap, Shield, BarChart2, Star, Check, ArrowRight, Globe, Lock, Rocket,
  Heart, Users, TrendingUp, Award, Target, Clock, ChevronRight,
  CheckCircle, XCircle, Sparkles, Layers, DollarSign, Mail, Phone,
  Play, Eye, Brain, Flame, Crown, Gem, Timer, Infinity as InfinityIcon,
  AlertCircle, Lightbulb, ThumbsUp, MessageSquare, Share2, Settings,
  BarChart, PieChart, Activity, Briefcase, BookOpen, Code2, Database,
  Headphones, RefreshCw, Search, Send, ShoppingCart, Tag, Wifi,
  type LucideProps,
} from 'lucide-react';

// Map string name → Lucide component
const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Zap, Shield, BarChart2, Star, Check, ArrowRight, Globe, Lock, Rocket,
  Heart, Users, TrendingUp, Award, Target, Clock, ChevronRight,
  CheckCircle, XCircle, Sparkles, Layers, DollarSign, Mail, Phone,
  Play, Eye, Brain, Flame, Crown, Gem, Timer, Infinity: InfinityIcon,
  AlertCircle, Lightbulb, ThumbsUp, MessageSquare, Share2, Settings,
  BarChart, PieChart, Activity, Briefcase, BookOpen, Code2, Database,
  Headphones, RefreshCw, Search, Send, ShoppingCart, Tag, Wifi,
};

// Exported list for AI prompts
export const LUCIDE_ICON_NAMES = Object.keys(ICON_MAP);

// ─────────────────────────────────────────────────────────────────────────────

export type ComponentType =
  | 'Section'
  | 'Flex'
  | 'Grid'
  | 'Container'
  | 'Heading'
  | 'Text'
  | 'Button'
  | 'Image'
  | 'Card'
  | 'Divider'
  | 'List'
  | 'Icon'
  | 'Badge'
  | 'StatBlock'
  | 'TestimonialCard'
  | 'FeatureCard'
  | 'PricingCards'
  | 'HeyMessageHeader'
  | 'HeyMessageFeatures'
  | 'HeyMessageSplit'
  | 'HeyMessageFAQ'
  | 'HeyMessageCTA'
  | 'HeyMessageFooter'
  | 'FeatureHeader'
  | 'FeatureHero'
  | 'HeroCenter'
  | 'FeatureLogos'
  | 'FeatureTestimonials'
  | 'FeatureFAQ'
  | 'FeaturePricing'
  | 'FeatureCTA'
  | 'FeaturesGrid'
  | 'FeatureSplit'
  | 'FeatureFooter'
  | 'UpsellHero'
  | 'DownsellHero'
  | 'ThankYouHero';
export type FieldDef = {
  type: 'text' | 'textarea' | 'select' | 'color' | 'number' | 'array' | 'image';
  label: string;
  options?: string[];
  arrayFields?: Record<string, FieldDef>;
};

export interface ComponentConfig<Props = any> {
  type: ComponentType;
  label: string;
  defaultProps: Props;
  render: (props: Props) => React.ReactNode;
  fields: Record<string, FieldDef>;
  semantic?: {
    purpose: string;
    example: any;
  };
}

const applyStyle = (style?: Record<string, string>): React.CSSProperties =>
  (style ?? {}) as React.CSSProperties;

// ─────────────────────────────────────────────────────────────────────────────
export const COMPONENT_REGISTRY: Record<ComponentType, ComponentConfig<any>> = {
  // ── Section ────────────────────────────────────────────────────────────
  Section: {
    type: 'Section',
    label: 'Section',
    semantic: {
      purpose: 'A full-width semantic <section> used as the outermost wrapper for a part of the landing page. Must supply an ID if used for navigation.',
      example: { id: 'features', className: 'w-full py-24 bg-background' }
    },
    defaultProps: {
      id: '',
      className: 'w-full py-24 bg-background',
      style: {},
    },
    fields: {
      id: { type: 'text', label: 'Section ID (for anchor links)' },
      className: { type: 'text', label: 'Tailwind Classes' },
    },
    render: ({ id, className, style, children, isPreviewMode }: any) => (
      <section
        id={id || undefined}
        className={`w-full relative ${className ?? ''} ${
          !isPreviewMode
            ? 'min-h-[100px] outline-dashed outline-1 outline-transparent hover:outline-slate-300/40 transition-all'
            : ''
        }`}
        style={applyStyle(style)}
      >
        {children}
      </section>
    ),
  },

  // ── Flex ───────────────────────────────────────────────────────────────
  Flex: {
    type: 'Flex',
    label: 'Flex',
    semantic: {
      purpose: 'A flexbox container. Use this to align items in a row or column.',
      example: { className: 'flex flex-col md:flex-row items-center justify-between gap-8 w-full max-w-7xl mx-auto px-6' }
    },
    defaultProps: {
      className: 'flex flex-col gap-4 w-full',
      style: {},
    },
    fields: {
      className: { type: 'text', label: 'Tailwind Classes' },
    },
    render: ({ className, style, children, isPreviewMode }: any) => (
      <div
        className={`relative ${className ?? ''} ${
          !isPreviewMode
            ? 'min-h-[50px] outline-dashed outline-1 outline-transparent hover:outline-blue-300/40 transition-all'
            : ''
        }`}
        style={applyStyle(style)}
      >
        {children}
      </div>
    ),
  },

  // ── Grid ───────────────────────────────────────────────────────────────
  Grid: {
    type: 'Grid',
    label: 'Grid',
    semantic: {
      purpose: 'A CSS grid container. Use this to lay out multiple identical items (like feature cards).',
      example: { className: 'grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl mx-auto' }
    },
    defaultProps: {
      className: 'grid grid-cols-1 md:grid-cols-3 gap-6 w-full',
      style: {},
    },
    fields: {
      className: { type: 'text', label: 'Tailwind Classes' },
    },
    render: ({ className, style, children, isPreviewMode }: any) => (
      <div
        className={`relative ${className ?? ''} ${
          !isPreviewMode
            ? 'min-h-[50px] outline-dashed outline-1 outline-transparent hover:outline-purple-300/40 transition-all'
            : ''
        }`}
        style={applyStyle(style)}
      >
        {children}
      </div>
    ),
  },


  // ── Container ────────────────────────────────────────────────────────────
  Container: {
    type: 'Container',
    label: 'Container',
    semantic: {
      purpose: 'A generic div layout wrapper. You can use this for absolute positioning, specific sizing, or flex/grid if you provide the right tailwind classes.',
      example: { className: 'flex flex-col gap-4 p-8 w-full bg-card border rounded-xl' }
    },
    defaultProps: {
      className: 'flex flex-col gap-4 p-8 w-full',
      style: {},
    },
    fields: {
      className: { type: 'text', label: 'Tailwind Classes' },
    },
    render: ({ className, style, children, isPreviewMode }: any) => (
      <div
        className={`w-full relative ${className ?? ''} ${
          !isPreviewMode
            ? 'min-h-[50px] outline-dashed outline-1 outline-transparent hover:outline-slate-300/40 transition-all rounded'
            : ''
        }`}
        style={applyStyle(style)}
      >
        {children}
      </div>
    ),
  },

  // ── Heading ──────────────────────────────────────────────────────────────
  Heading: {
    type: 'Heading',
    label: 'Heading',
    semantic: {
      purpose: 'A semantic HTML heading (H1-H6).',
      example: { text: 'Welcome to our platform', level: '2', className: 'font-extrabold text-4xl text-foreground tracking-tight' }
    },
    defaultProps: { text: 'New Heading', level: '2', className: 'font-bold text-4xl', style: {} },
    fields: {
      text: { type: 'text', label: 'Text Content' },
      level: { type: 'select', label: 'Heading Level', options: ['1', '2', '3', '4', '5', '6'] },
      className: { type: 'text', label: 'Tailwind Classes' },
    },
    render: ({ text, level, className, style }: any) => {
      const s = applyStyle(style);
      const cls = className ?? 'font-bold text-4xl';
      const map: Record<string, React.ReactNode> = {
        '1': <h1 className={cls} style={s}>{text}</h1>,
        '2': <h2 className={cls} style={s}>{text}</h2>,
        '3': <h3 className={cls} style={s}>{text}</h3>,
        '4': <h4 className={cls} style={s}>{text}</h4>,
        '5': <h5 className={cls} style={s}>{text}</h5>,
        '6': <h6 className={cls} style={s}>{text}</h6>,
      };
      return map[String(level)] ?? map['2'];
    },
  },

  // ── Text / Paragraph ─────────────────────────────────────────────────────
  Text: {
    type: 'Text',
    label: 'Text Block',
    semantic: {
      purpose: 'A standard paragraph of text.',
      example: { text: 'We offer the best service.', className: 'text-muted-foreground text-lg leading-relaxed' }
    },
    defaultProps: { text: 'This is some text content.', className: 'leading-relaxed text-base', style: {} },
    fields: {
      text: { type: 'textarea', label: 'Content' },
      className: { type: 'text', label: 'Tailwind Classes' },
    },
    render: ({ text, className, style }: any) => (
      <p className={className ?? 'leading-relaxed text-base'} style={applyStyle(style)}>
        {text}
      </p>
    ),
  },

  // ── Button ───────────────────────────────────────────────────────────────
  Button: {
    type: 'Button',
    label: 'Button',
    semantic: {
      purpose: 'A clickable button or link.',
      example: { text: 'Get Started', href: '#signup', className: 'inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity' }
    },
    defaultProps: {
      text: 'Click Me',
      href: '',
      className: 'inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 cursor-pointer',
      style: {},
    },
    fields: {
      text: { type: 'text', label: 'Label' },
      href: { type: 'text', label: 'Link URL (optional)' },
      className: { type: 'text', label: 'Tailwind Classes' },
    },
    render: ({ text, href, className, style }: any) => {
      const cls = className ?? 'inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 cursor-pointer';
      if (href) {
        return <a href={href} className={cls} style={applyStyle(style)}>{text}</a>;
      }
      return <button className={cls} style={applyStyle(style)}>{text}</button>;
    },
  },

  // ── Image ─────────────────────────────────────────────────────────────────
  Image: {
    type: 'Image',
    label: 'Image',
    semantic: {
      purpose: 'An image element.',
      example: { src: 'https://images.unsplash.com/photo-1...', alt: 'Dashboard preview', className: 'w-full rounded-2xl shadow-2xl border border-border' }
    },
    defaultProps: {
      src: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop',
      alt: 'Image',
      className: 'w-full h-auto object-cover rounded-2xl',
      style: {},
    },
    fields: {
      src: { type: 'image', label: 'Image' },
      alt: { type: 'text', label: 'Alt Text' },
      className: { type: 'text', label: 'Tailwind Classes' },
    },
    render: ({ src, alt, className, style }: any) => (
      <img
        src={src}
        alt={alt}
        className={className ?? 'w-full h-auto object-cover rounded-2xl'}
        style={applyStyle(style)}
      />
    ),
  },

  // ── Card ─────────────────────────────────────────────────────────────────
  Card: {
    type: 'Card',
    label: 'Card',
    semantic: {
      purpose: 'A versatile container with a border and background. Used heavily in Shadcn.',
      example: { title: 'Analytics', content: 'Real-time data insights.', className: 'rounded-xl border border-border bg-card text-card-foreground p-6 flex flex-col gap-2' }
    },
    defaultProps: {
      title: 'Card Title',
      content: 'Card body content goes here.',
      className: 'rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.02]',
      style: {},
    },
    fields: {
      title: { type: 'text', label: 'Title' },
      content: { type: 'textarea', label: 'Content' },
      className: { type: 'text', label: 'Tailwind Classes' },
    },
    render: ({ title, content, className, style }: any) => (
      <div
        className={className ?? 'rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.02]'}
        style={applyStyle(style)}
      >
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-sm opacity-70 leading-relaxed">{content}</p>
      </div>
    ),
  },

  // ── Divider ──────────────────────────────────────────────────────────────
  Divider: {
    type: 'Divider',
    label: 'Divider',
    semantic: {
      purpose: 'A horizontal line separator.',
      example: { className: 'w-full h-px bg-border my-8' }
    },
    defaultProps: { className: 'my-8 border-t opacity-20', style: {} },
    fields: {
      className: { type: 'text', label: 'Tailwind Classes' },
    },
    render: ({ className, style }: any) => (
      <hr className={className ?? 'my-8 border-t opacity-20'} style={applyStyle(style)} />
    ),
  },

  // ── List ─────────────────────────────────────────────────────────────────
  List: {
    type: 'List',
    label: 'List',
    semantic: {
      purpose: 'An unordered or ordered list of items.',
      example: { items: 'Fast setup\nReliable\nCheap', ordered: 'false', className: 'pl-6 space-y-2 text-muted-foreground list-disc' }
    },
    defaultProps: { items: 'First item\nSecond item\nThird item', ordered: 'false', className: 'pl-5 space-y-2', style: {} },
    fields: {
      items: { type: 'textarea', label: 'Items (one per line)' },
      ordered: { type: 'select', label: 'List Type', options: ['false', 'true'] },
      className: { type: 'text', label: 'Tailwind Classes' },
    },
    render: ({ items, ordered, className, style }: any) => {
      const lines = (items ?? '').split('\n').filter(Boolean);
      const Tag = ordered === 'true' ? 'ol' : 'ul';
      return (
        <Tag
          className={`${className ?? 'pl-5 space-y-2'} ${ordered === 'true' ? 'list-decimal' : 'list-disc'}`}
          style={applyStyle(style)}
        >
          {lines.map((item: string, i: number) => (
            <li key={i} className="leading-relaxed">{item}</li>
          ))}
        </Tag>
      );
    },
  },

  // ── Icon — Lucide icon by string name ────────────────────────────────────
  Icon: {
    type: 'Icon',
    label: 'Icon',
    semantic: {
      purpose: 'A Lucide icon.',
      example: { name: 'Zap', size: 24, className: 'text-primary' }
    },
    defaultProps: { name: 'Zap', size: 24, className: '', style: {} },
    fields: {
      name: { type: 'text', label: 'Icon Name (from Lucide list)' },
      size: { type: 'number', label: 'Size (px)' },
      className: { type: 'text', label: 'Tailwind Classes' },
    },
    render: ({ name, size, className, style }: any) => {
      const IconComponent = ICON_MAP[name] ?? Zap;
      return (
        <IconComponent
          size={size ?? 24}
          className={className ?? ''}
          style={applyStyle(style)}
        />
      );
    },
  },

  // ── Badge — pill label ────────────────────────────────────────────────────
  Badge: {
    type: 'Badge',
    label: 'Badge',
    semantic: {
      purpose: 'A small pill label or tag.',
      example: { text: 'NEW', className: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/20 text-primary uppercase' }
    },
    defaultProps: {
      text: 'New',
      className: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase',
      style: {},
    },
    fields: {
      text: { type: 'text', label: 'Label' },
      className: { type: 'text', label: 'Tailwind Classes' },
    },
    render: ({ text, className, style }: any) => (
      <span
        className={className ?? 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase'}
        style={applyStyle(style)}
      >
        {text}
      </span>
    ),
  },

  // ── StatBlock — big number + label ───────────────────────────────────────
  StatBlock: {
    type: 'StatBlock',
    label: 'Stat Block',
    semantic: {
      purpose: 'A large number with a small label, used for metrics.',
      example: { value: '99%', label: 'Uptime', className: 'flex flex-col gap-2 items-center', valueClassName: 'text-5xl font-black text-foreground', labelClassName: 'text-sm text-muted-foreground uppercase tracking-widest' }
    },
    defaultProps: {
      value: '2,500+',
      label: 'Happy Customers',
      className: 'flex flex-col items-center gap-1 text-center',
      valueClassName: 'text-4xl font-extrabold',
      labelClassName: 'text-sm opacity-60 uppercase tracking-widest',
      style: {},
    },
    fields: {
      value: { type: 'text', label: 'Stat Value' },
      label: { type: 'text', label: 'Stat Label' },
      valueClassName: { type: 'text', label: 'Value Tailwind Classes' },
      labelClassName: { type: 'text', label: 'Label Tailwind Classes' },
      className: { type: 'text', label: 'Wrapper Tailwind Classes' },
    },
    render: ({ value, label, className, valueClassName, labelClassName, style }: any) => (
      <div className={className ?? 'flex flex-col items-center gap-1 text-center'} style={applyStyle(style)}>
        <span className={valueClassName ?? 'text-4xl font-extrabold'}>{value}</span>
        <span className={labelClassName ?? 'text-sm opacity-60 uppercase tracking-widest'}>{label}</span>
      </div>
    ),
  },

  // ── TestimonialCard ───────────────────────────────────────────────────────
  TestimonialCard: {
    type: 'TestimonialCard',
    label: 'Testimonial Card',
    defaultProps: {
      name: 'Alex Johnson',
      role: 'Founder, Acme Inc.',
      quote: 'This completely changed how I operate my business. Absolute game changer.',
      stars: 5,
      initials: 'AJ',
      className: 'rounded-2xl border p-6 flex flex-col gap-4 transition-all duration-300 hover:scale-[1.02]',
      avatarClassName: 'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
      style: {},
    },
    fields: {
      name: { type: 'text', label: 'Name' },
      role: { type: 'text', label: 'Role / Company' },
      quote: { type: 'textarea', label: 'Quote' },
      stars: { type: 'number', label: 'Star Rating (1-5)' },
      initials: { type: 'text', label: 'Avatar Initials' },
      className: { type: 'text', label: 'Card Tailwind Classes' },
      avatarClassName: { type: 'text', label: 'Avatar Tailwind Classes' },
    },
    render: ({ name, role, quote, stars, initials, className, avatarClassName, style }: any) => {
      const count = Math.min(5, Math.max(1, Number(stars) || 5));
      return (
        <div className={className ?? 'rounded-2xl border p-6 flex flex-col gap-4 transition-all duration-300 hover:scale-[1.02]'} style={applyStyle(style)}>
          {/* Stars */}
          <div className="flex gap-1">
            {Array.from({ length: count }).map((_, i) => (
              <Star key={i} size={14} className="fill-current text-yellow-400" />
            ))}
          </div>
          {/* Quote */}
          <p className="leading-relaxed text-sm opacity-90 italic">"{quote}"</p>
          {/* Author */}
          <div className="flex items-center gap-3 pt-2">
            <div className={avatarClassName ?? 'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0'}>
              {initials}
            </div>
            <div>
              <p className="font-semibold text-sm">{name}</p>
              <p className="text-xs opacity-50">{role}</p>
            </div>
          </div>
        </div>
      );
    },
  },

  // ── FeatureCard — icon + title + description ──────────────────────────────
  FeatureCard: {
    type: 'FeatureCard',
    label: 'Feature Card',
    defaultProps: {
      icon: 'Zap',
      title: 'Lightning Fast',
      description: 'Built for speed and performance at every level of scale.',
      className: 'rounded-2xl border p-6 flex flex-col gap-4 transition-all duration-300 hover:scale-[1.02] hover:border-opacity-60 group',
      iconClassName: 'w-10 h-10 rounded-xl flex items-center justify-center mb-2',
      titleClassName: 'font-bold text-lg',
      descClassName: 'text-sm leading-relaxed opacity-70',
      iconSize: 20,
      style: {},
    },
    fields: {
      icon: { type: 'text', label: 'Icon Name (Lucide)' },
      title: { type: 'text', label: 'Title' },
      description: { type: 'textarea', label: 'Description' },
      className: { type: 'text', label: 'Card Tailwind Classes' },
      iconClassName: { type: 'text', label: 'Icon Wrapper Classes' },
      iconSize: { type: 'number', label: 'Icon Size (px)' },
    },
    render: ({ icon, title, description, className, iconClassName, titleClassName, descClassName, iconSize, style }: any) => {
      const IconComp = ICON_MAP[icon] ?? Zap;
      return (
        <div className={className ?? 'rounded-2xl border p-6 flex flex-col gap-4 transition-all duration-300 hover:scale-[1.02] group'} style={applyStyle(style)}>
          <div className={iconClassName ?? 'w-10 h-10 rounded-xl flex items-center justify-center mb-2'}>
            <IconComp size={iconSize ?? 20} />
          </div>
          <h3 className={titleClassName ?? 'font-bold text-lg'}>{title}</h3>
          <p className={descClassName ?? 'text-sm leading-relaxed opacity-70'}>{description}</p>
        </div>
      );
    },
  },

  // ── PRICING (KEPT) ───────────────────────────────────────────────────────
  PricingCards: {
    type: 'PricingCards',
    label: 'Pricing Cards',
    semantic: {
      purpose: 'Tiered pricing cards showing different plans, prices, and features. Usually 2 or 3 tiers.',
      example: {
        sectionTitle: 'Simple, Transparent Pricing',
        tiers: [
          { name: 'Starter', price: '$29/mo', description: 'Perfect for new entrepreneurs.', features: [{ text: '3 Funnels' }, { text: 'Basic AI Generation' }, { text: 'Standard Themes' }], buttonText: 'Start Free Trial' },
          { name: 'Pro', price: '$99/mo', description: 'For growing businesses.', features: [{ text: 'Unlimited Funnels' }, { text: 'Advanced GPT-4 Copy' }, { text: 'All 40+ Themes' }, { text: 'Priority Support' }], buttonText: 'Upgrade to Pro', isPopular: true }
        ]
      }
    },
    defaultProps: { sectionTitle: 'Pricing', tiers: [] },
    fields: {
      sectionId: { type: 'text', label: 'Section ID (Anchor link)' },
      sectionTitle: { type: 'text', label: 'Section Title' },
      sectionSubtitle: { type: 'textarea', label: 'Section Subtitle' },
      tiers: {
        type: 'array',
        label: 'Pricing Tiers',
        arrayFields: {
          name: { type: 'text', label: 'Plan Name' },
          price: { type: 'text', label: 'Price (e.g. $99/mo)' },
          description: { type: 'textarea', label: 'Description' },
          buttonText: { type: 'text', label: 'CTA Button Text' },
          // Note: features is now an array of objects to map smoothly with the ArrayEditor
          features: {
            type: 'array',
            label: 'Bullet Points',
            arrayFields: {
              text: { type: 'text', label: 'Feature Text' }
            }
          }
        }
      }
    },
    render: (props: any) => <PricingCards {...props} />
  },

  // ── HEYMESSAGE COMPONENTS ──────────────────────────────────────────

  HeyMessageHeader: {
    type: 'HeyMessageHeader',
    label: 'HM Header',
    semantic: {
      purpose: 'A sticky top navigation bar inspired by HeyMessage.',
      example: { logoText: 'MyBrand', ctaText: 'Get Started' }
    },
    defaultProps: { logoText: 'HeyMessage', ctaText: 'Get Started' },
    fields: {
      logoText: { type: 'text', label: 'Logo Text' },
      ctaText: { type: 'text', label: 'CTA Text' },
      ctaHref: { type: 'text', label: 'CTA Link' },
    },
    render: (props: any) => <HeyMessageHeader {...props} />
  },

  HeyMessageFeatures: {
    type: 'HeyMessageFeatures',
    label: 'HM Features Grid',
    semantic: {
      purpose: 'A modern 3-column features grid with image cards and staggered animations.',
      example: { badgeText: 'FEATURES', headline: 'Awesome features.' }
    },
    defaultProps: { 
      badgeText: 'FEATURES', 
      headline: 'Discover the power.',
      features: [
        { id: 'f1', title: 'Context Aware', description: 'Understands your whole project so it writes perfect, context-rich responses instantly.', imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop' },
        { id: 'f2', title: 'Natural Responses', description: 'Reads and writes like a human, natively adapting to your precise brand voice.', imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop' },
        { id: 'f3', title: 'Brilliant Clarity', description: 'Breaks down complex problems into surprisingly clear and actionable steps.', imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop' }
      ]
    },
    fields: {
      sectionId: { type: 'text', label: 'Section ID (Anchor link)' },
      badgeText: { type: 'text', label: 'Badge Text' },
      headline: { type: 'textarea', label: 'Headline' },
      features: {
        type: 'array',
        label: 'Features List',
        arrayFields: {
          title: { type: 'text', label: 'Title' },
          description: { type: 'textarea', label: 'Description' },
          imageUrl: { type: 'image', label: 'Image URL' }
        }
      }
    },
    render: (props: any) => <HeyMessageFeatures {...props} />
  },

  HeyMessageSplit: {
    type: 'HeyMessageSplit',
    label: 'HM Split Content',
    semantic: {
      purpose: 'A highly versatile section that splits an image and a vertical list of item points.',
      example: { badgeText: 'HOW IT WORKS', imagePosition: 'left' }
    },
    defaultProps: { 
      badgeText: 'ONBOARDING', 
      imagePosition: 'left',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
      contentItems: [
        { id: '1', title: '1 — Call', description: 'Just type a simple prompt and command the AI to begin.' },
        { id: '2', title: '2 — Execute', description: 'The invisible system runs deeply connected reasoning.' },
        { id: '3', title: '3 — Enhance', description: 'Get actionable clarity delivered instantly.' }
      ]
    },
    fields: {
      sectionId: { type: 'text', label: 'Section ID (Anchor link)' },
      badgeText: { type: 'text', label: 'Badge' },
      headline: { type: 'textarea', label: 'Headline' },
      imagePosition: { type: 'select', label: 'Image Position', options: ['left', 'right'] },
      imageUrl: { type: 'image', label: 'Image URL' },
      contentItems: {
        type: 'array',
        label: 'Split Items',
        arrayFields: {
          title: { type: 'text', label: 'Title' },
          description: { type: 'textarea', label: 'Description' }
        }
      }
    },
    render: (props: any) => <HeyMessageSplit {...props} />
  },

  HeyMessageFAQ: {
    type: 'HeyMessageFAQ',
    label: 'HM FAQ Accordion',
    semantic: {
      purpose: 'A clean, animated accordion FAQ list.',
      example: { badgeText: 'SUPPORT', headline: 'Your Questions' }
    },
    defaultProps: { badgeText: 'FAQ', headline: 'Your questions, answered.' },
    fields: {
      sectionId: { type: 'text', label: 'Section ID (Anchor link)' },
      badgeText: { type: 'text', label: 'Badge' },
      headline: { type: 'textarea', label: 'Headline' },
    },
    render: (props: any) => <HeyMessageFAQ {...props} />
  },

  HeyMessageCTA: {
    type: 'HeyMessageCTA',
    label: 'HM Container CTA',
    semantic: {
      purpose: 'A bottom-of-page containerized CTA with a background image overlay.',
      example: { headline: 'Ready to start?', buttonText: 'Try Now' }
    },
    defaultProps: { headline: 'Step into the future.', buttonText: 'Get Started', bgImageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop' },
    fields: {
      sectionId: { type: 'text', label: 'Section ID (Anchor link)' },
      headline: { type: 'textarea', label: 'Headline' },
      subheadline: { type: 'textarea', label: 'Sub-headline' },
      buttonText: { type: 'text', label: 'Button Text' },
      bgImageUrl: { type: 'image', label: 'Background Image' },
    },
    render: (props: any) => <HeyMessageCTA {...props} />
  },

  HeyMessageFooter: {
    type: 'HeyMessageFooter',
    label: 'HM Minimal Footer',
    semantic: {
      purpose: 'A simple, minimal footer with logo on the left and vertical links on the right.',
      example: { logoText: 'MyBrand', description: 'Your data is safe.' }
    },
    defaultProps: { logoText: 'HeyMessage', description: 'Secure and fast.' },
    fields: {
      logoText: { type: 'text', label: 'Logo Text' },
      description: { type: 'textarea', label: 'Description' },
    },
    render: (props: any) => <HeyMessageFooter {...props} />
  },

  // ── FEATURE COMPONENTS ───────────────────────────────────────────────

  FeatureHeader: {
    type: 'FeatureHeader',
    label: 'Feature Header',
    semantic: {
      purpose: 'A minimal top navigation bar with a blur effect.',
      example: { logoText: 'Feature', ctaText: 'Get Feature' }
    },
    defaultProps: { logoText: 'Feature', ctaText: 'Get Feature' },
    fields: {
      logoText: { type: 'text', label: 'Logo Text' },
      ctaText: { type: 'text', label: 'CTA Text' },
      ctaHref: { type: 'text', label: 'CTA Link' },
    },
    render: (props: any) => <FeatureHeader {...props} />
  },

  FeatureHero: {
    type: 'FeatureHero',
    label: 'Feature Hero',
    semantic: {
      purpose: 'A glowing dark-mode hero section with a dashboard graphic.',
      example: { headline: 'Turn data into decisions' }
    },
    defaultProps: { badgeText: '', headline: 'Turn data into decisions', dashboardImageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop' },
    fields: {
      sectionId: { type: 'text', label: 'Section ID (Anchor link)' },
      badgeText: { type: 'text', label: 'Badge Text' },
      headline: { type: 'textarea', label: 'Headline' },
      subheadline: { type: 'textarea', label: 'Sub-headline' },
      dashboardImageUrl: { type: 'image', label: 'Dashboard Image' },
    },
    render: (props: any) => <FeatureHero {...props} />
  },

  HeroCenter: {
    type: 'HeroCenter',
    label: 'Hero (Centered)',
    semantic: {
      purpose: 'A bright, clean, centered hero section. Best for simple and direct value propositions.',
      example: { headline: 'The easiest way to build', subheadline: 'Start for free today.' }
    },
    defaultProps: { badgeText: 'NEW', headline: 'The easiest way to build', subheadline: 'Start for free today.', primaryCta: 'Get Started' },
    fields: {
      sectionId: { type: 'text', label: 'Section ID (Anchor link)' },
      badgeText: { type: 'text', label: 'Badge Text' },
      headline: { type: 'textarea', label: 'Headline' },
      subheadline: { type: 'textarea', label: 'Sub-headline' },
      primaryCta: { type: 'text', label: 'Primary CTA' },
      secondaryCta: { type: 'text', label: 'Secondary CTA' },
      imageUrl: { type: 'image', label: 'Image URL' },
    },
    render: (props: any) => <HeroCenter {...props} />
  },

  FeaturesGrid: {
    type: 'FeaturesGrid',
    label: 'Features (Grid)',
    semantic: {
      purpose: 'A clean 3-column grid of feature cards. Excellent for listing multiple benefits concisely.',
      example: { sectionTitle: 'Everything you need', features: [{ title: 'Fast', description: 'Very fast', icon: 'Zap' }] }
    },
    defaultProps: { sectionTitle: 'Everything you need', features: [{ title: 'Fast', description: 'Very fast', icon: 'Zap' }] },
    fields: {
      sectionId: { type: 'text', label: 'Section ID (Anchor link)' },
      sectionTitle: { type: 'text', label: 'Section Title' },
      sectionSubtitle: { type: 'textarea', label: 'Section Subtitle' },
      features: {
        type: 'array',
        label: 'Features Box',
        arrayFields: {
          icon: { type: 'text', label: 'Icon (Lucide)' },
          title: { type: 'text', label: 'Title' },
          description: { type: 'textarea', label: 'Description' }
        }
      }
    },
    render: (props: any) => <FeaturesGrid {...props} />
  },

  FeatureSplit: {
    type: 'FeatureSplit',
    label: 'Feature (Split)',
    semantic: {
      purpose: 'A dark-mode split section with an image on one side and a vertical list of benefits on the other.',
      example: { headline: 'Stop jumping between tools' }
    },
    defaultProps: { badgeText: 'INTEGRATION', headline: 'Stop jumping between tools', imagePosition: 'right', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop', contentItems: [] },
    fields: {
      sectionId: { type: 'text', label: 'Section ID (Anchor link)' },
      badgeText: { type: 'text', label: 'Badge Text' },
      headline: { type: 'textarea', label: 'Headline' },
      subheadline: { type: 'textarea', label: 'Sub-headline' },
      imageUrl: { type: 'image', label: 'Image URL' },
      imagePosition: { type: 'select', label: 'Image Position', options: ['left', 'right'] },
      contentItems: {
        type: 'array',
        label: 'Split Items',
        arrayFields: {
          id: { type: 'text', label: 'ID' },
          title: { type: 'text', label: 'Title' },
          description: { type: 'textarea', label: 'Description' },
        }
      }
    },
    render: (props: any) => <FeatureSplit {...props} />
  },

  FeatureLogos: {
    type: 'FeatureLogos',
    label: 'Feature Logos',
    semantic: {
      purpose: 'A grid of faint logos for social proof.',
      example: { headline: 'TRUSTED BY INNOVATIVE TEAMS' }
    },
    defaultProps: { headline: 'TRUSTED BY INNOVATIVE TEAMS' },
    fields: {
      sectionId: { type: 'text', label: 'Section ID (Anchor link)' },
      headline: { type: 'text', label: 'Headline' },
      logos: {
        type: 'array',
        label: 'Logos',
        arrayFields: {
          name: { type: 'text', label: 'Company Name' },
          domain: { type: 'text', label: 'Company Domain (e.g. stripe.com)' }
        }
      }
    },
    render: (props: any) => <FeatureLogos {...props} />
  },

  FeatureTestimonials: {
    type: 'FeatureTestimonials',
    label: 'Feature Testimonials',
    semantic: {
      purpose: 'A 6-card masonry grid detailing user reviews.',
      example: { headline: 'Reviews that make us blush' }
    },
    defaultProps: { 
      headline: 'Reviews that make us blush',
      testimonials: [
        { id: '1', name: 'Sarah Chen', role: 'Growth Lead @ StartupX', content: "This entirely changed how we look at our user retention.", avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
        { id: '2', name: 'Marcus Bell', role: 'Founder @ ScaleIt', content: "I've tried every BI tool on the market.", avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704e' },
        { id: '3', name: 'Elena Silva', role: 'Head of Data @ Nexus', content: "The automated board reporting alone saves me ten hours a week.", avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704f' }
      ]
    },
    fields: {
      sectionId: { type: 'text', label: 'Section ID (Anchor link)' },
      headline: { type: 'textarea', label: 'Headline' },
      testimonials: {
        type: 'array',
        label: 'Testimonials',
        arrayFields: {
          name: { type: 'text', label: 'Name' },
          role: { type: 'text', label: 'Role / Company' },
          content: { type: 'textarea', label: 'Review Content' },
          avatarUrl: { type: 'image', label: 'Avatar URL (Optional)' },
        }
      }
    },
    render: (props: any) => <FeatureTestimonials {...props} />
  },

  FeatureFAQ: {
    type: 'FeatureFAQ',
    label: 'Feature FAQ',
    semantic: {
      purpose: 'A clean accordion answering common questions.',
      example: { headline: 'Any questions?' }
    },
    defaultProps: { headline: 'Any questions?' },
    fields: {
      sectionId: { type: 'text', label: 'Section ID (Anchor link)' },
      headline: { type: 'textarea', label: 'Headline' },
      faqs: {
        type: 'array',
        label: 'FAQs',
        arrayFields: {
          question: { type: 'text', label: 'Question' },
          answer: { type: 'textarea', label: 'Answer' },
        }
      }
    },
    render: (props: any) => <FeatureFAQ {...props} />
  },

  FeaturePricing: {
    type: 'FeaturePricing',
    label: 'Feature Pricing',
    semantic: {
      purpose: 'A 3-tier dark mode pricing card display.',
      example: { headline: 'What will it cost?' }
    },
    defaultProps: { headline: 'What will it cost?' },
    fields: {
      sectionId: { type: 'text', label: 'Section ID (Anchor link)' },
      headline: { type: 'textarea', label: 'Headline' },
      subheadline: { type: 'textarea', label: 'Sub-headline' },
      tiers: {
        type: 'array',
        label: 'Pricing Tiers',
        arrayFields: {
          name: { type: 'text', label: 'Plan Name' },
          price: { type: 'text', label: 'Price' },
          description: { type: 'textarea', label: 'Description' },
          buttonText: { type: 'text', label: 'Button Text' },
          isPopular: { type: 'select', label: 'Is Popular?', options: ['true', 'false'] },
          features: {
            type: 'array',
            label: 'Features List',
            arrayFields: {
              text: { type: 'text', label: 'Feature Item Text' },
              included: { type: 'select', label: 'Included?', options: ['true', 'false'] }
            }
          }
        }
      }
    },
    render: (props: any) => <FeaturePricing {...props} />
  },

  FeatureCTA: {
    type: 'FeatureCTA',
    label: 'Feature CTA',
    semantic: {
      purpose: 'A golden-accented CTA container used at the bottom of pages.',
      example: { headline: 'Ready to make better decisions with your data?' }
    },
    defaultProps: { headline: 'Ready to make better decisions with your data?', imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop' },
    fields: {
      sectionId: { type: 'text', label: 'Section ID (Anchor link)' },
      headline: { type: 'textarea', label: 'Headline' },
      buttonText: { type: 'text', label: 'Button Text' },
      imageUrl: { type: 'image', label: 'Image URL' },
    },
    render: (props: any) => <FeatureCTA {...props} />
  },

  FeatureFooter: {
    type: 'FeatureFooter',
    label: 'Feature Footer',
    semantic: {
      purpose: 'A minimal footer with logo on the left and vertical links.',
      example: { logoText: 'Feature', description: 'Data decisions, un-complicated.' }
    },
    defaultProps: { logoText: 'Feature', description: 'Data decisions, un-complicated.' },
    fields: {
      logoText: { type: 'text', label: 'Logo Text' },
      description: { type: 'textarea', label: 'Description' },
    },
    render: (props: any) => <FeatureFooter {...props} />
  },

  UpsellHero: {
    type: 'UpsellHero',
    label: 'Upsell Video Hero',
    defaultProps: {
      headline: 'WAIT! Your order is not complete...',
      subheadline: 'Do not close this page. Add our comprehensive video masterclass for 80% off.',
      videoUrl: '',
      price: '$97',
      originalPrice: '$497',
      primaryCta: 'Yes, Upgrade My Order Now',
      declineCta: 'No thanks, I choose to skip this one-time discount and pass up on the value.',
      className: '',
      style: {}
    },
    fields: {
      headline: { type: 'textarea', label: 'Headline' },
      subheadline: { type: 'textarea', label: 'Subheadline' },
      videoUrl: { type: 'text', label: 'Video Embed URL' },
      price: { type: 'text', label: 'Upsell Price' },
      originalPrice: { type: 'text', label: 'Original Price (Crossed out)' },
      primaryCta: { type: 'text', label: 'Add-to-Order Text' },
      declineCta: { type: 'textarea', label: 'Decline Link Text' },
      className: { type: 'text', label: 'Tailwind Classes' }
    },
    semantic: { purpose: 'Main video sales letter for an Upsell page.', example: { headline: 'WAIT! Your order is almost complete...' } },
    render: (props) => <UpsellHero {...props} />
  },

  DownsellHero: {
    type: 'DownsellHero',
    label: 'Downsell Offer Hero',
    defaultProps: {
      headline: 'Lets Make This Easier...',
      subheadline: 'I know times might be tight. How about a 3-part payment plan?',
      price: '$33/mo',
      originalPrice: '$97',
      paymentPlanText: '3 Split Payments',
      primaryCta: 'Yes, Upgrade My Order Now',
      declineCta: 'No thanks, I will pass on this final offer.',
      className: '',
      style: {}
    },
    fields: {
      headline: { type: 'textarea', label: 'Headline' },
      subheadline: { type: 'textarea', label: 'Subheadline' },
      price: { type: 'text', label: 'Downsell Price' },
      originalPrice: { type: 'text', label: 'Original Price' },
      paymentPlanText: { type: 'text', label: 'Payment Plan Taglet' },
      primaryCta: { type: 'text', label: 'Add-to-Order Text' },
      declineCta: { type: 'textarea', label: 'Decline Link Text' },
      className: { type: 'text', label: 'Tailwind Classes' }
    },
    semantic: { purpose: 'Offer variant optimized for downsells or payment plans.', example: { headline: 'Lets Make This Easier...' } },
    render: (props) => <DownsellHero {...props} />
  },

  ThankYouHero: {
    type: 'ThankYouHero',
    label: 'Thank You Hero',
    defaultProps: {
      headline: 'Order Confirmed!',
      subheadline: 'Your payment was successfully processed. Welcome aboard.',
      receiptTotal: '$1,997.00',
      nextStep1: 'Check your email for your receipt and login credentials directly.',
      nextStep2: 'Join our exclusive Facebook community to network with other members.',
      nextStep3: 'Click the button below to instantly access your product.',
      primaryCta: 'Access the Product',
      className: '',
      style: {}
    },
    fields: {
      headline: { type: 'text', label: 'Headline' },
      subheadline: { type: 'textarea', label: 'Subheadline' },
      receiptTotal: { type: 'text', label: 'Receipt Total' },
      nextStep1: { type: 'textarea', label: 'Next Step 1' },
      nextStep2: { type: 'textarea', label: 'Next Step 2' },
      nextStep3: { type: 'textarea', label: 'Next Step 3' },
      primaryCta: { type: 'text', label: 'Primary CTA Text' },
      className: { type: 'text', label: 'Tailwind Classes' }
    },
    semantic: { purpose: 'Post-purchase order confirmation and next steps screen.', example: { headline: 'Order Confirmed!' } },
    render: (props) => <ThankYouHero {...props} />
  }

};
