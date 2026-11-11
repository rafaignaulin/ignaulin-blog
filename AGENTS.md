# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Antigravity, Codex) when working with code in this repository.

## Project Overview

Personal blog for Rafael Ignaulin (ignaulin.blog), built with Next.js 14 (App Router), React 18, TypeScript, and Tailwind CSS. Content is written in Markdown. Language is pt-BR. Deployed on Vercel at blog.ignaulin.com. Part of the ignaulin.com ecosystem alongside rafa.ignaulin.com (portfolio) and istech.ignaulin.com (consultancy).

## Commands

- `npm run dev` — start dev server at http://localhost:3000
- `npm run build` — production build (static generation)
- `npm run start` — run production build
- `npm run lint` — run ESLint (`next/core-web-vitals` config)
- `npm run sync` — sync notes from external source (`scripts/sync-notes.mjs`)

There is no test suite configured.

## Architecture

### Content pipeline

Blog posts live in `content/blog/` as Markdown files organized by date path (e.g. `content/blog/2026/06/25/slug/index.md`). Frontmatter is validated with Zod in `lib/posts.ts` — required fields: `title`, `slug`, `date`, `draft`, `tags`. Optional: `description`, `image`.

`lib/posts.ts` exports `getAllPosts()` and `getPostBySlug(slug)`. It recursively finds all `.md` files, parses with `gray-matter`, validates frontmatter, renders Markdown to HTML with `remark` + `remark-html`, filters drafts, and sorts by date descending.

### App structure

- `app/layout.tsx` — root layout with Inter font via `next/font/google`, site-wide metadata, WebSite JSON-LD, header/footer
- `app/page.tsx` — homepage listing all posts (title + date links)
- `app/blog/[slug]/page.tsx` — individual post page with `generateStaticParams`, per-post `generateMetadata`, BlogPosting JSON-LD
- `app/globals.css` — Tailwind directives, CSS variables (`--bg`, `--fg`, `--muted`, `--accent`), `.prose` class for blog content styling

### SEO

The blog is optimized for Google search visibility. Key elements:

- **Metadata API** — title template (`%s | ignaulin`; titles over 50 chars use `absolute`), OG images from `app/opengraph-image.tsx` and `app/blog/[slug]/opengraph-image.tsx`, Cloudflare Web Analytics beacon in the layout, meta description fallback = `excerpt()` of the post body, md `# ` demoted to `## ` (page template owns the single h1); verify with `~/www/sites/seo-check.mjs`; title template (previously `%s — ignaulin.blog`), OG/Twitter cards, canonical URLs, googleBot directives (`max-image-preview: large`, `max-snippet: -1`)
- **JSON-LD** — WebSite schema on homepage, BlogPosting schema on each post (headline, datePublished, author Person, keywords)
- **`app/sitemap.ts`** — dynamic sitemap with homepage + all blog posts
- **`app/robots.ts`** — allow all, disallow `/api/`, sitemap URL
- **`app/rss.xml/route.ts`** — RSS 2.0 feed via manual XML generation
- **Security headers** in `next.config.mjs` — HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy

When adding new SEO features, maintain consistency with portfolio-website and istech_landingpage.

### Content sync

`scripts/sync-notes.mjs` syncs Markdown posts from an external notes source into `content/blog/`. Destination is set by `DEST_DIR` at the top of the script.

### Path aliases

`@/*` maps to the project root (e.g. `@/lib/posts`).

### Theme

Dark-only design. Colors defined as CSS variables in `globals.css`: background `#0a0a0a`, foreground `#f5f5f5`, muted `#a3a3a3`, accent `#f59e0b` (amber). Tailwind extends these in `tailwind.config.ts`.
