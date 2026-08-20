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
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; media-src 'self' https:; frame-src https://www.youtube.com https://youtube.com;",
  },
];

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
    ];
  },
  /* Permanent redirect from www → apex.
     NOTE: Vercel's domain-level redirect historically returns 307. Adding this
     rule at the Next.js layer forces a 308 (permanent) when the host matches,
     which search engines treat as equivalent to 301 for PageRank consolidation.
     Also ensure the apex is set as the primary domain in Vercel's domain settings. */
  async redirects() {
    return [
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
      /* /work y /about eran stubs vacíos indexables; el contenido real vive en
         /archivo y en la sección #about del home. */
      {
        source: '/work',
        destination: '/archivo',
        permanent: true,
      },
      {
        source: '/about',
        destination: '/#about',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
