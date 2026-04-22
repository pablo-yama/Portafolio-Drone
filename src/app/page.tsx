import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { ArchiveSection } from '@/components/sections/ArchiveSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { LedgerSection } from '@/components/sections/LedgerSection';
import { MethodSection } from '@/components/sections/MethodSection';
import { PricingSection } from '@/components/sections/PricingSection';
import { ContactSection } from '@/components/sections/ContactSection';

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <HeroSection />
        <ArchiveSection />
        <AboutSection />
        <LedgerSection />
        <MethodSection />
        <PricingSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
