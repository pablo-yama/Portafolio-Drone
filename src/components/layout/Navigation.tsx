'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Navigation — Archive v2 bar.
 *
 * Fixed header split into three zones:
 *   • Brand (signal dot + name / MX)
 *   • Numbered nav links (01 Archivo → 05 Contacto)
 *   • Live altitude readout + availability indicator
 *
 * Anchor links (#archive, #about, …) only resolve on the homepage. When the
 * user is on a subpage like /contact, we route to /#anchor instead so the
 * links actually do something.
 */

interface NavLink {
  n: string;
  label: string;
  /** Anchor hash (e.g. '#archive') or a full path (e.g. '/contact') */
  href: string;
}

const LINKS: NavLink[] = [
  { n: '01', label: 'Archivo', href: '#archive' },
  { n: '02', label: 'Piloto', href: '#about' },
  { n: '03', label: 'Método', href: '#method' },
  { n: '04', label: 'Tarifas', href: '#rates' },
  { n: '05', label: 'Contacto', href: '/contact' },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [altText, setAltText] = useState('ALT 120M');

  const isHome = pathname === '/';

  useEffect(() => {
    const el = document.getElementById('altBar');
    if (!el) return;
    const observer = new MutationObserver(() =>
      setAltText(el.textContent || 'ALT 120M'),
    );
    observer.observe(el, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  /**
   * Given a link href, return what should actually load:
   *   • '/contact' → always '/contact'
   *   • '#archive' on home → scroll in-page
   *   • '#archive' off home → navigate to '/#archive'
   */
  const resolveHref = (href: string): string => {
    if (!href.startsWith('#')) return href;
    return isHome ? href : `/${href}`;
  };

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (!href.startsWith('#')) return; // normal route nav, let <Link> handle it

    if (isHome) {
      // in-page smooth scroll
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      // off-home: go back to home with hash, and let the browser jump to the anchor
      e.preventDefault();
      router.push(`/${href}`);
    }
  };

  const isActive = (href: string): boolean => {
    if (href === '/contact') return pathname.startsWith('/contact');
    return false;
  };

  return (
    <header className="bar">
      <Link href="/" className="brand" aria-label="Ir al inicio">
        <span className="sig" />
        YAMAMOTO · AERIAL <span style={{ color: 'var(--dim-2)' }}>/ MX</span>
      </Link>
      <div className="mid">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={resolveHref(l.href)}
            onClick={(e) => handleNavClick(e, l.href)}
            style={isActive(l.href) ? { color: 'var(--signal)' } : undefined}
          >
            <span className="n">{l.n}</span>
            {l.label}
          </Link>
        ))}
      </div>
      <div className="right">
        {/* altBar text is mirrored from the live telemetry simulator */}
        <span className="alt" id="altBar">
          {altText}
        </span>
        <span className="live">Disponible</span>
      </div>
    </header>
  );
}
