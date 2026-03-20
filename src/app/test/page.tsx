'use client';

import React from 'react';
import { HeyMessageHeader } from '@/components/macro/Header';
import { HeyMessageFeatures } from '@/components/macro/Features';
import { HeyMessageSplit } from '@/components/macro/Content';
import { HeyMessageFAQ } from '@/components/macro/FAQ';
import { HeyMessageCTA } from '@/components/macro/CTA';
import { HeyMessageFooter } from '@/components/macro/Footer';

export default function TestPage() {
  return (
    <div id="canvas-root" data-theme="heymessage-dark" className="bg-background text-foreground min-h-screen font-sans selection:bg-primary/30">
      <HeyMessageHeader />

      <main className="flex flex-col items-center pt-24 space-y-24">
        {/* Placeholder hero to push content down for scroll testing */}
        <section className="h-[60vh] flex flex-col items-center justify-center text-center px-4 w-full">
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter">
            Where thoughts<br />become actions.
          </h1>
          <p className="mt-6 text-muted-foreground max-w-lg text-lg">
            Scroll down to seamlessly trigger the Framer-motion stagger and parallax physics on the clones.
          </p>
        </section>

        <HeyMessageFeatures />
        
        <HeyMessageSplit 
          badgeText="DIFFERENT PATHS" 
          headline="Different paths to explore all guided by one silent companion." 
          imagePosition="left"
        />

        <HeyMessageSplit 
          badgeText="ONBOARDING" 
          headline="One prompt to begin, three steps to clarity." 
          imagePosition="right"
          imageUrl="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop"
        />

        <HeyMessageFAQ />

        <div className="w-full pb-12">
          <HeyMessageCTA />
        </div>
      </main>

      <HeyMessageFooter />
    </div>
  );
}
