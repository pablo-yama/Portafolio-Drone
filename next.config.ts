import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; media-src 'self' https:; frame-src https://www.youtube.com https://youtube.com;",
  },
];

/* Content negotiation (https://acceptmarkdown.com) makes every page URL serve
   two representations: HTML for browsers, Markdown for agents that send
   `Accept: text/markdown`. Caches therefore have to key on Accept.

   src/proxy.ts sets this on the responses it produces itself, but Next's
   app-page handler overwrites `Vary` with its own RSC list right before
   rendering (see `getVaryHeader` in next/dist/server/route-modules/app-page),
   so the HTML branch needs the value re-applied at the routing layer. The value
   below is the union of both lists so nothing is lost whichever layer wins. */
const NEGOTIATION_VARY =
  'Accept, RSC, Next-Router-State-Tree, Next-Router-Prefetch, '
  + 'Next-Router-Segment-Prefetch, Accept-Encoding';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        /* Everything except Next's immutable asset pipeline, which is keyed by
           content hash and must not be split across Accept variants. */
        source: '/((?!_next/static|_next/image).*)',
        headers: [{ key: 'Vary', value: NEGOTIATION_VARY }],
      },
    ];
  },
  /* Permanent redirect from www → apex.
     NOTE: Vercel's domain-level redirect historically returns 307. Adding this
     rule at the Next.js layer forces a 308 (permanent) when the host matches,
     which search engines treat as equivalent to 301 for PageRank consolidation.
     Also ensure the apex is set as the primary domain in Vercel's domain settings. */
  async redirects() {
    return [
      /* Spanish-language alias for the trust-anchor privacy page. /privacy is
         canonical because that is the path agents and crawlers probe for. */
      {
        source: '/privacidad',
        destination: '/privacy',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.yamamotoaerial.com',
          },
        ],
        destination: 'https://yamamotoaerial.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
