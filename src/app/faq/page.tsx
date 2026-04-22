'use client';

import { Navigation } from '@/components/layout/Navigation';
import { Cursor } from '@/components/layout/Cursor';
import { SmoothScroll } from '@/components/layout/SmoothScroll';
import { Footer } from '@/components/layout/Footer';
import { FAQSection } from '@/components/sections/FAQSection';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';

export default function FAQPage() {
  return (
    <>
      <Cursor />
      <WhatsAppButton />
      <Navigation />
      <SmoothScroll>
        <main className="pt-32">
          {/* SEO H1 — visually styled as a page header */}
          <FAQSection />
        </main>
        <Footer />
      </SmoothScroll>
    </>
  );
}
