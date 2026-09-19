'use client';

import { LazyMotion, MotionConfig, domMax } from 'framer-motion';
import type { ReactNode } from 'react';
import { LenisProvider } from './LenisProvider';
import { GrainLayer } from './GrainLayer';

/** Default easing for every m.* transition that does not set its own. */
const EASE_EDITORIAL: [number, number, number, number] = [0.2, 0.8, 0.2, 1];

/** Global animation and scrolling context; content is available immediately. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user" transition={{ ease: EASE_EDITORIAL }}>
        <LenisProvider>
          {children}
          <GrainLayer />
        </LenisProvider>
      </MotionConfig>
    </LazyMotion>
  );
}
