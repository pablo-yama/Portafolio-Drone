'use client';

import { Navigation } from '@/components/layout/Navigation';
import { Cursor } from '@/components/layout/Cursor';
import { SmoothScroll } from '@/components/layout/SmoothScroll';
import { Footer } from '@/components/layout/Footer';
import { FAQSection } from '@/components/sections/FAQSection';

export default function FAQPage() {
  return (
    <>
      <Cursor />
      <Navigation />
      <SmoothScroll>
        <main className="pt-32">
          <FAQSection />
        </main>
        <Footer />
      </SmoothScroll>
    </>
  );
}
