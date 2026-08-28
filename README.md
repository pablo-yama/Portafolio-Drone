This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Checks

```bash
npm run lint            # eslint
npm run typecheck       # tsc --noEmit
npm test                # unit tests (node:test) for src/lib
npm run test:endpoints  # production build + HTTP checks against `next start`
```

`npm run test:endpoints` builds the app and boots a real server on a free port, then
asserts status codes, content negotiation, `Vary`, redirects, and the machine-readable
files. Run it before shipping anything that touches `src/proxy.ts`, `next.config.ts`,
or the routes under `src/app/`.

## Agent-readable surface

Every page URL serves two representations. Browsers get HTML; a client that ranks
`text/markdown` above `text/html` gets Markdown from the same URL, per
[acceptmarkdown.com](https://acceptmarkdown.com):

```bash
curl -H 'Accept: text/markdown' http://localhost:3000/about
curl http://localhost:3000/about.md          # equivalent .md suffix
```

- [`src/proxy.ts`](src/proxy.ts) negotiates and rewrites to `src/app/api/markdown/route.ts`.
- [`src/lib/contentNegotiation.ts`](src/lib/contentNegotiation.ts) parses `Accept` (RFC 9110).
- [`src/lib/markdownPages.ts`](src/lib/markdownPages.ts) builds each page's Markdown from
  `src/lib/constants.ts`, so the HTML and Markdown views cannot drift apart.
- [`public/agents.md`](public/agents.md) and [`public/llms.txt`](public/llms.txt) carry the
  when-to-use guidance and the price table. Update them alongside `SERVICE_PACKAGES`.
- Unknown paths return a real `404` whose body is a Markdown site map; an `Accept` header
  that excludes every representation returns `406`.


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
