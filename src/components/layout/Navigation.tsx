'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { NAV_LINKS, SITE_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';
import gsap from 'gsap';

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!navRef.current) return;
    gsap.from(navRef.current, {
      y: -100,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      delay: 2.5,
    });
  }, []);

  useEffect(() => {
    if (!mobileMenuRef.current) return;
    if (isMobileMenuOpen) {
      gsap.to(mobileMenuRef.current, {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.6,
        ease: 'power4.inOut',
      });
      gsap.from(mobileMenuRef.current.querySelectorAll('a'), {
        y: 40,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power3.out',
        delay: 0.3,
      });
    } else {
      gsap.to(mobileMenuRef.current, {
        clipPath: 'inset(0% 0% 100% 0%)',
        duration: 0.5,
        ease: 'power4.inOut',
      });
    }
  }, [isMobileMenuOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <nav
        ref={navRef}
        className={cn(
          'fixed top-0 left-0 right-0 z-[var(--z-nav)] px-[var(--container-padding)] py-5 transition-all duration-500',
          isScrolled && 'glass py-3'
        )}
      >
        <div className="container-custom flex items-center justify-between">
          {/* Logo — Personal name */}
          <Link
            href="/"
            className="relative z-10 text-xl font-bold tracking-wider uppercase"
            style={{ fontFamily: 'var(--font-clash)' }}
          >
            <span className="text-[var(--color-text)]">PABLO</span>
            <span className="text-[var(--color-accent)]">.</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="relative text-sm uppercase tracking-widest text-[var(--color-text-muted)] transition-colors duration-300 hover:text-[var(--color-text)] group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 h-px w-0 bg-[var(--color-accent)] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <Link
            href="/contact"
            className="hidden lg:flex items-center gap-2 rounded-full border border-[var(--glass-border)] px-6 py-2.5 text-sm uppercase tracking-wider transition-all duration-300 hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)] hover:border-[var(--color-accent)]"
          >
            Hablemos
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="relative z-10 flex flex-col gap-1.5 lg:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            <span
              className={cn(
                'block h-0.5 w-6 bg-[var(--color-text)] transition-all duration-300',
                isMobileMenuOpen && 'translate-y-2 rotate-45'
              )}
            />
            <span
              className={cn(
                'block h-0.5 w-6 bg-[var(--color-text)] transition-all duration-300',
                isMobileMenuOpen && 'opacity-0'
              )}
            />
            <span
              className={cn(
                'block h-0.5 w-6 bg-[var(--color-text)] transition-all duration-300',
                isMobileMenuOpen && '-translate-y-2 -rotate-45'
              )}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Fullscreen */}
      <div
        ref={mobileMenuRef}
        className="fixed inset-0 z-[calc(var(--z-nav)-1)] flex flex-col items-center justify-center bg-[var(--color-bg)] lg:hidden"
        style={{ clipPath: 'inset(0% 0% 100% 0%)' }}
      >
        <div className="flex flex-col items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-3xl font-bold uppercase tracking-wider text-[var(--color-text)] transition-colors hover:text-[var(--color-accent)]"
              style={{ fontFamily: 'var(--font-clash)' }}
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className="mt-4 rounded-full border border-[var(--color-accent)] px-8 py-3 text-sm uppercase tracking-widest text-[var(--color-accent)] transition-all hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)]"
          >
            Hablemos
          </Link>
        </div>
      </div>
    </>
  );
}
