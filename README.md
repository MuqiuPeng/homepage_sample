# homepage_sample

A bilingual (中/EN) corporate homepage **template** with deep-teal + sunlight-gold glassmorphism, built as a Next.js 16 + Tailwind v4 reference. All copy is placeholder content (lorem ipsum + bracketed labels) — the structure, motion and layout are the deliverable; real text and assets are dropped in later.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **next-intl** for `/zh` and `/en` locale routing
- **Framer Motion** for in-view reveals and hero molecular SVG
- **lucide-react** icons + a few inline SVG brand glyphs
- Custom `SnapScrollController` for damped one-section-per-gesture wheel snap (with native CSS scroll-snap as fallback for keyboard / touch / anchor links)

## Sections

```
Hero  →  TrustStrip  →  Overview  →  ProductSystem
     →  Industries  →  WhyUs  →  ProductPreview  →  Contact
```

Each main section is `min-h-screen` with `snap-start`; TrustStrip stays as a non-snap transition band between Hero and Overview.

## Local development

```bash
pnpm install
pnpm dev   # http://localhost:3000  (or pnpm dev --port 3030)
```

Routes:

- `/` redirects to `/zh`
- `/zh` and `/en` are pre-rendered statically

## Customizing

- Copy: edit `messages/zh.json` and `messages/en.json` — all labels live here
- Color palette: `app/globals.css` `@theme` block (`--color-brand-*`, `--color-accent-*`)
- Section structure: `app/[locale]/page.tsx`
- Snap feel: `components/motion/SnapScrollController.tsx` — `ANIM_MS` (transition duration) and `GESTURE_GAP_MS` (gesture boundary detection)

## Deployment

Designed for Vercel — zero-config; just import the repo, set custom domain in dashboard.
