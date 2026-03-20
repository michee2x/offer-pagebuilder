'use client';

import React from 'react';
import { FeatureHeader } from '@/components/macro/Header/FeatureHeader';
import { FeatureHero } from '@/components/macro/Hero/FeatureHero';
import { FeatureLogos } from '@/components/macro/Logos/FeatureLogos';
import { FeatureTestimonials } from '@/components/macro/Testimonials/FeatureTestimonials';
import { FeatureFAQ } from '@/components/macro/FAQ/FeatureFAQ';
import { FeaturePricing } from '@/components/macro/Pricing/FeaturePricing';
import { FeatureCTA } from '@/components/macro/CTA/FeatureCTA';
import { FeatureFooter } from '@/components/macro/Footer/FeatureFooter';

export default function TestPage() {
  return (
    <div id="canvas-root" data-theme="feature-dark" className="bg-[#0A0A0A] text-white min-h-screen font-sans selection:bg-[#F2AE40]/30 selection:text-white">
      <FeatureHeader />
      
      <main className="flex flex-col w-full relative overflow-x-hidden pb-32 gap-32">
        <FeatureHero />
        
        <FeatureLogos />

        <FeatureTestimonials />

        <FeatureFAQ />

        <FeaturePricing />

        <FeatureCTA />

      </main>

      <FeatureFooter />
    </div>
  );
}
