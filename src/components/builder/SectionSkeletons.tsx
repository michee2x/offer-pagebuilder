import React from 'react';
import { ComponentType } from '@/config/components';

// ─── Shared skeleton primitives ───────────────────────────────────────────────
const Sk = {
  line: (w = 'w-full', h = 'h-2', extra = '') => (
    <div className={`${w} ${h} rounded bg-muted-foreground/15 ${extra}`} />
  ),
  block: (w = 'w-full', h = 'h-8', extra = '') => (
    <div className={`${w} ${h} rounded-md bg-muted-foreground/10 ${extra}`} />
  ),
  circle: (size = 'w-8 h-8') => (
    <div className={`${size} rounded-full bg-muted-foreground/15 shrink-0`} />
  ),
  rect: (w = 'w-full', h = 'h-24', extra = '') => (
    <div className={`${w} ${h} rounded-lg bg-muted-foreground/10 ${extra}`} />
  ),
  btn: (w = 'w-20') => (
    <div className={`${w} h-7 rounded-full bg-primary/30`} />
  ),
};

// ─── Individual layout skeletons ──────────────────────────────────────────────

function NavSkeleton() {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-muted-foreground/10">
      {Sk.block('w-16', 'h-5')}
      <div className="flex gap-2">
        {Sk.line('w-10', 'h-2')} {Sk.line('w-10', 'h-2')} {Sk.line('w-10', 'h-2')}
      </div>
      {Sk.btn('w-16')}
    </div>
  );
}

function HeroSkeleton({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  return (
    <div className={`flex flex-col items-center gap-3 px-6 pt-8 pb-6 ${variant === 'dark' ? 'bg-slate-900/30' : ''}`}>
      {Sk.line('w-16', 'h-2')}
      {Sk.line('w-3/4', 'h-5', 'mt-1')}
      {Sk.line('w-1/2', 'h-5')}
      {Sk.line('w-2/3', 'h-2', 'mt-1')}
      <div className="flex gap-2 mt-2">{Sk.btn('w-20')} {Sk.btn('w-16')}</div>
      {Sk.rect('w-full', 'h-20', 'mt-3 rounded-xl')}
    </div>
  );
}

function FeatureGridSkeleton() {
  return (
    <div className="px-4 py-4 flex flex-col gap-3">
      <div className="flex flex-col items-center gap-1.5 mb-1">
        {Sk.line('w-1/2', 'h-4')} {Sk.line('w-1/3', 'h-2')}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5 p-2 rounded-lg border border-muted-foreground/10">
            {Sk.circle('w-6 h-6')}
            {Sk.line('w-3/4', 'h-2')}
            {Sk.line('w-full', 'h-1.5')}
            {Sk.line('w-2/3', 'h-1.5')}
          </div>
        ))}
      </div>
    </div>
  );
}

function SplitSkeleton({ imageRight = true }) {
  const img = Sk.rect('w-full', 'h-full', 'rounded-xl');
  const text = (
    <div className="flex flex-col gap-2 justify-center py-2">
      {Sk.line('w-16', 'h-1.5')}
      {Sk.line('w-3/4', 'h-4')}
      {Sk.line('w-1/2', 'h-4')}
      {Sk.line('w-full', 'h-1.5')}
      {Sk.line('w-4/5', 'h-1.5')}
      {[0, 1, 2].map(i => (
        <div key={i} className="flex items-start gap-2 mt-1">
          {Sk.circle('w-5 h-5')}
          <div className="flex flex-col gap-1 flex-1">
            {Sk.line('w-1/2', 'h-2')}
            {Sk.line('w-full', 'h-1.5')}
          </div>
        </div>
      ))}
    </div>
  );
  return (
    <div className="grid grid-cols-2 gap-3 px-4 py-4 h-full">
      {imageRight ? <>{text}{img}</> : <>{img}{text}</>}
    </div>
  );
}

function TestimonialsSkeleton() {
  return (
    <div className="px-4 py-4 flex flex-col gap-3">
      <div className="flex flex-col items-center gap-1.5 mb-1">
        {Sk.line('w-2/3', 'h-4')} {Sk.line('w-1/2', 'h-2')}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5 p-2 rounded-lg border border-muted-foreground/10">
            <div className="flex gap-1">{Array.from({length:5}).map((_,s)=><div key={s} className="w-2 h-2 rounded-sm bg-yellow-400/40"/>)}</div>
            {Sk.line('w-full', 'h-1.5')}
            {Sk.line('w-4/5', 'h-1.5')}
            {Sk.line('w-3/4', 'h-1.5')}
            <div className="flex items-center gap-1.5 mt-1">
              {Sk.circle('w-5 h-5')}
              <div className="flex flex-col gap-1 flex-1">{Sk.line('w-1/2', 'h-1.5')}{Sk.line('w-1/3', 'h-1')}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PricingSkeleton() {
  return (
    <div className="px-4 py-4 flex flex-col gap-3">
      <div className="flex flex-col items-center gap-1.5 mb-1">
        {Sk.line('w-1/2', 'h-4')} {Sk.line('w-1/3', 'h-2')}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[false, true, false].map((popular, i) => (
          <div key={i} className={`flex flex-col gap-2 p-3 rounded-xl border ${popular ? 'border-primary/50 bg-primary/5' : 'border-muted-foreground/10'}`}>
            {Sk.line('w-1/2', 'h-2')}
            {Sk.line('w-2/3', 'h-5')}
            {Sk.line('w-full', 'h-1.5')}
            <div className="flex flex-col gap-1 mt-1">
              {Array.from({length: 4}).map((_,j) => (
                <div key={j} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary/30 shrink-0" />
                  {Sk.line('w-3/4', 'h-1.5')}
                </div>
              ))}
            </div>
            {Sk.btn('w-full')}
          </div>
        ))}
      </div>
    </div>
  );
}

function FAQSkeleton() {
  return (
    <div className="px-4 py-4 flex flex-col gap-3">
      <div className="flex flex-col items-center gap-1.5 mb-2">
        {Sk.line('w-1/2', 'h-4')}
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg border border-muted-foreground/10">
            {Sk.line('w-2/3', 'h-2')}
            <div className="w-4 h-4 rounded border border-muted-foreground/20 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CTASkeleton() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-8 m-3 rounded-2xl border border-muted-foreground/10 bg-muted-foreground/5">
      {Sk.line('w-2/3', 'h-5')}
      {Sk.line('w-1/2', 'h-5')}
      {Sk.line('w-1/2', 'h-2')}
      <div className="flex gap-2 mt-1">{Sk.btn('w-24')} {Sk.btn('w-20')}</div>
    </div>
  );
}

function FooterSkeleton() {
  return (
    <div className="px-4 py-4 border-t border-muted-foreground/10 flex flex-col gap-3">
      <div className="flex justify-between">
        {Sk.block('w-16', 'h-4')}
        <div className="flex gap-3">
          {Sk.line('w-8', 'h-2')} {Sk.line('w-8', 'h-2')} {Sk.line('w-8', 'h-2')}
        </div>
      </div>
      {Sk.line('w-1/3', 'h-1.5')}
    </div>
  );
}

function LogosSkeleton() {
  return (
    <div className="px-4 py-4 flex flex-col gap-3">
      {Sk.line('w-1/2', 'h-2', 'mx-auto')}
      <div className="grid grid-cols-5 gap-2 mt-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-6 rounded bg-muted-foreground/10" />
        ))}
      </div>
    </div>
  );
}

// ─── Registry map ─────────────────────────────────────────────────────────────
export const SECTION_SKELETONS: Partial<Record<ComponentType, React.ReactNode>> = {
  FeatureHeader:      <NavSkeleton />,
  HeyMessageHeader:   <NavSkeleton />,
  FeatureHero:        <HeroSkeleton variant="dark" />,
  HeroCenter:         <HeroSkeleton variant="light" />,
  HeyMessageFeatures: <FeatureGridSkeleton />,
  FeaturesGrid:       <FeatureGridSkeleton />,
  FeatureSplit:       <SplitSkeleton imageRight={true} />,
  HeyMessageSplit:    <SplitSkeleton imageRight={false} />,
  FeatureTestimonials:<TestimonialsSkeleton />,
  FeaturePricing:     <PricingSkeleton />,
  PricingCards:       <PricingSkeleton />,
  HeyMessageFAQ:      <FAQSkeleton />,
  FeatureFAQ:         <FAQSkeleton />,
  HeyMessageCTA:      <CTASkeleton />,
  FeatureCTA:         <CTASkeleton />,
  HeyMessageFooter:   <FooterSkeleton />,
  FeatureFooter:      <FooterSkeleton />,
  FeatureLogos:       <LogosSkeleton />,
};
