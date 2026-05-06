# TripZ Landing

Production Next.js implementation of the TripZ FIHORIZON direction.

Live site:

```text
https://tripz-landing.vercel.app/
```

GitHub repository:

```text
https://github.com/Sanchay-T/tripz-landing.git
```

Production branch:

```text
master
```

## Stack

- Next.js App Router
- React
- Tailwind CSS
- `next/image`
- `next/font`
- Motion
- Lucide icons
- `class-variance-authority`, `clsx`, and `tailwind-merge` for reusable class composition

The page is intentionally static right now. There is no database, auth layer,
API route, or backend service in this repository.

## Commands

```bash
npm run dev -- -p 3003
npm run lint
npm test
npm run build
```

Use the in-app browser for visual review at:

```text
http://127.0.0.1:3003/
```

## Deploy

Production deploys through the GitHub-to-Vercel integration. Push `master` to
`origin` after validation:

```bash
npm run lint
npm test
npm run build
git push origin master
```

Local Vercel CLI auth may not have direct access to the linked Vercel project,
so the reliable production path is GitHub -> Vercel.

## Content Map

- Main page composition: `src/app/page.js`
- Live hero operations panel: `src/app/components/OperationsPanel.jsx`
- Hero copy and primary CTAs: `src/app/components/HeroLeft.jsx`
- Shared UI primitives: `src/app/components/ui.jsx`
- Site data, links, phone number, WhatsApp URL, and image registry:
  `src/lib/site-data.mjs`
- Visual assets: `public/images/`

Support number:

```text
+91 995 665 1212
```

WhatsApp links are generated from `supportPhoneE164` and `whatsappMessage` in
`src/lib/site-data.mjs`.

## Design Source

The original handoff was read from:

```text
/Users/sanchay/Downloads/Tripz LOGO-handoff.zip
```

Primary direction implemented:

```text
TripZ Design Concepts.html -> Direction 5 - Horizon
```

## Visual Rules

- Do not add page-level hand-calibrated custom CSS for layout.
- Use Tailwind responsive utilities and `next/image` containers with fixed
  aspect ratios.
- Keep images unique across major sections.
- Keep call and WhatsApp CTAs visible on mobile through the sticky bottom bar.
- Validate responsive behavior in the in-app browser before production deploy.
