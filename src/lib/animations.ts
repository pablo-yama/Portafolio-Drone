'use client';

import gsap from 'gsap';
import { EASE, DURATION } from './constants';

export function animateTextReveal(element: Element) {
  return gsap.from(element, {
    y: '110%',
    opacity: 0,
    duration: DURATION.slow,
    ease: EASE.smooth,
    stagger: 0.03,
  });
}

export function animateImageReveal(element: Element) {
  return gsap.fromTo(
    element,
    { clipPath: 'inset(100% 0 0 0)' },
    {
      clipPath: 'inset(0% 0 0 0)',
      duration: DURATION.cinematic,
      ease: EASE.cinematic,
    }
  );
}

export function animateFadeIn(element: Element, delay = 0) {
  return gsap.from(element, {
    y: 40,
    opacity: 0,
    duration: DURATION.normal,
    ease: EASE.smooth,
    delay,
  });
}

export function animateStaggerIn(elements: Element[], stagger = 0.1) {
  return gsap.from(elements, {
    y: 60,
    opacity: 0,
    duration: DURATION.normal,
    ease: EASE.smooth,
    stagger,
  });
}

export function createParallax(element: Element, speed: number = 0.5) {
  return gsap.to(element, {
    y: () => window.innerHeight * speed * -1,
    ease: 'none',
    scrollTrigger: {
      trigger: element,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  });
}

export function animateCounter(element: Element, target: number) {
  return gsap.to(element, {
    textContent: target,
    duration: DURATION.cinematic,
    ease: EASE.smooth,
    snap: { textContent: 1 },
    scrollTrigger: {
      trigger: element,
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
  });
}
