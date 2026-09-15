'use client';

import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { FAQSection } from '@/components/sections/FAQSection';

export default function FAQPage() {
  return (
    <>
      <Navigation />
        <main className="pt-32">
          <FAQSection />
        </main>
        <Footer />
    </>
  );
}
