# AstroBlogTheme

A clean, minimal, content-first blog theme built with [Astro](https://astro.build).

- Markdown content collection (`src/content/blog/`)
- Light / dark mode with a no-flash toggle
- RSS feed (`/rss.xml`) and sitemap (`@astrojs/sitemap`)
- Open Graph and Twitter Card metadata
- No client JavaScript except the theme toggle
- TypeScript strict, zero UI framework

## Getting started

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in ./dist
npm run preview
```

## Configuration

| What | Where |
| ---- | ----- |
| Site title, description, nav, social links | `src/consts.ts` |
| Canonical site URL (`site:`) | `src/consts.ts` → `SITE.url` |
| Colors, fonts, spacing | `src/styles/global.css` (`:root` tokens) |
| Layouts | `src/layouts/` |
| Components | `src/components/` |

## Writing posts

Add `.md` or `.mdx` files to `src/content/blog/`. Frontmatter:

```yaml
---
title: "Post title" # required
description: "One line for previews and meta tags" # required
pubDate: 2026-08-30 # required
updatedDate: 2026-09-01 # optional
heroImage: ./cover.jpg # optional, relative to the post file
heroAlt: "Alt text for the hero image" # optional
tags: ["astro", "notes"] # optional
draft: false # optional, hides the post when true
---
```

The post URL is `/blog/<filename-without-extension>/`.

## Deployment

`npm run build` produces a fully static site in `dist/`. Set `SITE.url` to the
real domain first so canonical URLs, the sitemap and the RSS feed are correct.

## License

MIT
