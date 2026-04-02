'use client';

import { useState } from 'react';
import { SmoothScroll } from '@/components/layout/SmoothScroll';

import { Cursor } from '@/components/layout/Cursor';
import { Preloader } from '@/components/layout/Preloader';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { AboutSection } from '@/components/sections/AboutSection';

import { WorkGrid } from '@/components/sections/WorkGrid';
import { StatsSection } from '@/components/sections/StatsSection';
import { ServicesSection } from '@/components/sections/ServicesSection';
import { CTASection } from '@/components/sections/CTASection';
import { ProcessSection } from '@/components/sections/ProcessSection';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { useAssetPreloader } from '@/hooks/useAssetPreloader';

export default function Home() {
  const { progress, isComplete } = useAssetPreloader();
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      <Preloader
        progress={progress}
        isComplete={isComplete}
        onComplete={() => setIsLoaded(true)}
      />
      <Cursor />
      <WhatsAppButton />
      <SmoothScroll>
        <main>
          <HeroSection />
          <AboutSection />
          <WorkGrid />
          <StatsSection />
          <ProcessSection />
          <ServicesSection />
          <CTASection />
        </main>
        <Footer />
      </SmoothScroll>
    </>
  );
}
