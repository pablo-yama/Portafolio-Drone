import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { CinematicHero, AerialIntroduction } from '@/components/sections/CinematicHero';
import { SelectedWork } from '@/components/sections/SelectedWork';
import { PilotSection } from '@/components/sections/PilotSection';
import { LedgerSection } from '@/components/sections/LedgerSection';
import { MethodFlightSection } from '@/components/sections/MethodFlightSection';
import { RatesSection } from '@/components/sections/RatesSection';
import { UplinkSection } from '@/components/sections/UplinkSection';

export default function Home() {
  return (
    <>
      <Navigation />
      <main id="main-content" className="aerial-home">
        <CinematicHero />
        <AerialIntroduction />
        <SelectedWork />
        <PilotSection />
        <LedgerSection />
        <MethodFlightSection />
        <RatesSection />
        <UplinkSection />
      </main>
      <Footer />
    </>
  );
}
