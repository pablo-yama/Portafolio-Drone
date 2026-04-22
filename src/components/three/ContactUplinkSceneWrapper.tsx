'use client';

import dynamic from 'next/dynamic';

const ContactUplinkScene = dynamic(
  () =>
    import('@/components/three/ContactUplinkScene').then(
      (m) => m.ContactUplinkScene,
    ),
  { ssr: false },
);

export function ContactUplinkSceneWrapper() {
  return <ContactUplinkScene />;
}
