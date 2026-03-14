import React from 'react';
import { ComponentType } from '@/store/builderStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ─────────────────────────────────────────────────────────────────────────────
// Component Registry
// ─────────────────────────────────────────────────────────────────────────────
//
// HOW STYLING WORKS:
// Every component has a `style` prop (Record<string, string>) which maps to
// inline CSS. The AI can update ANY CSS property through it — e.g.:
//   { "style": { "color": "green", "fontSize": "2rem", "backgroundColor": "#1a1a2e" } }
//
// This means the AI never needs a predefined field for color, padding, margin etc.
// The `fields` definition is only for the component's CONTENT and STRUCTURAL props
// (e.g. text, level, variant) — NOT styles.
// ─────────────────────────────────────────────────────────────────────────────

export interface ComponentConfig<Props = any> {
  type: ComponentType;
  label: string;
  defaultProps: Props;
  render: (props: Props) => React.ReactNode;
  fields: {
    [key in keyof Props]?: {
      type: 'text' | 'textarea' | 'select' | 'color' | 'number';
      label: string;
      options?: string[];
    };
  };
}

const applyStyle = (style?: Record<string, string>): React.CSSProperties =>
  (style ?? {}) as React.CSSProperties;

// ─────────────────────────────────────────────────────────────────────────────
export const COMPONENT_REGISTRY: Record<ComponentType, ComponentConfig<any>> = {

  // ── Container (Structure) ────────────────────────────────────────────────
  Container: {
    type: 'Container',
    label: 'Container',
    defaultProps: { style: { display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' } },
    fields: {},
    render: ({ style, children, isPreviewMode }: { style?: Record<string, string>, children?: React.ReactNode, isPreviewMode?: boolean }) => (
      <div 
        style={applyStyle(style)} 
        className={`w-full relative ${!isPreviewMode ? 'min-h-[50px] border border-dashed border-transparent hover:border-slate-300 transition-all rounded' : ''}`}
      >
        {children}
      </div>
    ),
  },

  // ── Heading ──────────────────────────────────────────────────────────────
  Heading: {
    type: 'Heading',
    label: 'Heading',
    defaultProps: { text: 'New Heading', level: '2', style: {} },
    fields: {
      text: { type: 'text', label: 'Text Content' },
      level: { type: 'select', label: 'Heading Level', options: ['1', '2', '3', '4', '5', '6'] },
      // `style` is not listed here — it's always available to the AI via the system prompt
    },
    render: ({ text, level, style }) => {
      const baseClass = 'font-bold mb-2';
      const sizeClass: Record<string, string> = {
        '1': 'text-5xl', '2': 'text-4xl', '3': 'text-3xl',
        '4': 'text-2xl', '5': 'text-xl', '6': 'text-lg',
      };
      const cls = `${baseClass} ${sizeClass[String(level)] ?? 'text-4xl'}`;
      const s = applyStyle(style);
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
    defaultProps: { text: 'This is some text content.', style: {} },
    fields: {
      text: { type: 'textarea', label: 'Content' },
    },
    render: ({ text, style }) => (
      <p className="leading-relaxed text-muted-foreground" style={applyStyle(style)}>
        {text}
      </p>
    ),
  },

  // ── Button ───────────────────────────────────────────────────────────────
  Button: {
    type: 'Button',
    label: 'Button',
    defaultProps: { text: 'Click Me', variant: 'default', href: '', style: {} },
    fields: {
      text: { type: 'text', label: 'Label' },
      variant: {
        type: 'select',
        label: 'Variant',
        options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      },
      href: { type: 'text', label: 'Link URL (optional)' },
    },
    render: ({ text, variant, href, style }) => (
      <Button
        // @ts-ignore variant string cast
        variant={variant}
        style={applyStyle(style)}
        asChild={!!href}
        className="my-2"
      >
        {href ? <a href={href}>{text}</a> : text}
      </Button>
    ),
  },

  // ── Image ─────────────────────────────────────────────────────────────────
  Image: {
    type: 'Image',
    label: 'Image',
    defaultProps: {
      src: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop',
      alt: 'Image',
      rounded: 'md',
      style: {},
    },
    fields: {
      src: { type: 'text', label: 'Image URL' },
      alt: { type: 'text', label: 'Alt Text' },
      rounded: { type: 'select', label: 'Corner Radius', options: ['none', 'sm', 'md', 'lg', 'full'] },
    },
    render: ({ src, alt, rounded, style }) => (
      <img
        src={src}
        alt={alt}
        className={`max-w-full h-auto object-cover rounded-${rounded}`}
        style={applyStyle(style)}
      />
    ),
  },

  // ── Card ─────────────────────────────────────────────────────────────────
  Card: {
    type: 'Card',
    label: 'Card',
    defaultProps: { title: 'Card Title', content: 'Card body content goes here.', style: {} },
    fields: {
      title: { type: 'text', label: 'Title' },
      content: { type: 'textarea', label: 'Content' },
    },
    render: ({ title, content, style }) => (
      <Card style={applyStyle(style)} className="my-2">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{content}</p>
        </CardContent>
      </Card>
    ),
  },

  // ── Divider ──────────────────────────────────────────────────────────────
  Divider: {
    type: 'Divider',
    label: 'Divider',
    defaultProps: { style: {} },
    fields: {},
    render: ({ style }) => (
      <hr className="my-4 border-border" style={applyStyle(style)} />
    ),
  },

  // ── List ─────────────────────────────────────────────────────────────────
  List: {
    type: 'List',
    label: 'List',
    defaultProps: {
      items: 'First item\nSecond item\nThird item',
      ordered: 'false',
      style: {},
    },
    fields: {
      items: { type: 'textarea', label: 'Items (one per line)' },
      ordered: { type: 'select', label: 'List Type', options: ['false', 'true'] },
    },
    render: ({ items, ordered, style }) => {
      const lines = (items ?? '').split('\n').filter(Boolean);
      const Tag = ordered === 'true' ? 'ol' : 'ul';
      return (
        <Tag
          className={`my-2 pl-6 space-y-1 text-foreground ${ordered === 'true' ? 'list-decimal' : 'list-disc'}`}
          style={applyStyle(style)}
        >
          {lines.map((item: string, i: number) => (
            <li key={i} className="text-muted-foreground">{item}</li>
          ))}
        </Tag>
      );
    },
  },
};
