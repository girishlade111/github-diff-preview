# GitHub Diff Preview

A pixel-faithful **GitHub-style pull request diff viewer** built with Next.js and shadcn/ui components. Paste in diff data (or view the bundled sample) and get a beautiful, interactive diff interface with split/unified views, expandable hunks, line copying, and GitHub's exact visual language — dark mode included.

## What it does

Renders a rich diff-preview UI that mimics GitHub's PR file-diff view:

- **Unified diff view** with green/red line highlighting for added/removed lines
- **Expandable hunks** — collapsed context sections expand up/down on click, just like GitHub
- **Line numbers** for both old and new files, with per-line copy buttons
- **File header** with path, change summary, and action menu (⋯)
- **Expand/collapse controls** per file to jump between changed sections
- **Dark/light mode** via `next-themes` (GitHub-dark styled by default)
- Fully responsive — works on mobile and desktop

## Features

- ✅ Unified diff rendering with syntax-neutral line coloring
- ✅ Collapsible/expandable diff hunks (context expansion)
- ✅ Per-line copy-to-clipboard
- ✅ Old/new line number gutters
- ✅ Dark mode toggle with GitHub-accurate colors
- ✅ Built with reusable, typed React components (`diff-preview.tsx`, `improved-diff-preview.tsx`)
- ✅ Static-site friendly — exports to pure HTML/CSS/JS with `next export`

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18, shadcn/ui (Radix primitives), Tailwind CSS v4 |
| Icons | lucide-react |
| Theming | next-themes |
| Language | TypeScript |

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev
# open http://localhost:3000
```

```bash
# Production build (static export)
npm run build
# output lands in ./out — serve it with any static host
npx serve out
```

## Project structure

```
github-diff-preview/
├── app/
│   ├── page.tsx          # Home page — renders <ImprovedDiffPreview />
│   ├── layout.tsx        # Root layout + theme provider
│   └── globals.css       # Tailwind + theme tokens
├── components/
│   ├── diff-preview.tsx            # Core diff renderer (lines, hunks, gutters)
│   ├── improved-diff-preview.tsx   # Enhanced version used on the page
│   ├── theme-provider.tsx          # next-themes wrapper
│   └── ui/                         # shadcn/ui primitives (button, tooltip, …)
├── lib/
│   └── utils.ts          # cn() class merger
├── public/               # Static assets
├── next.config.mjs       # output: 'export' for static hosting
└── package.json
```

## Environment variables

None required. Everything runs client-side.

## Deployment

- **GitHub Pages:** a static build is published from the `gh-pages` branch —
  https://girishlade111.github.io/github-diff-preview/
- **Any static host** (Vercel, Netlify, Cloudflare Pages): run `npm run build` and serve the `out/` directory.

> Note: this repo is deployed at the `/github-diff-preview/` subpath, so `next.config.mjs`
> sets `basePath: '/github-diff-preview'`. If you deploy it at a domain root (e.g. Vercel),
> remove the `basePath` line.

## Credits

Built by Girish Lade — https://ladestack.in

Originally generated with [v0.app](https://v0.app) and refined into a standalone static project.
