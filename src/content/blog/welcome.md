---
title: "Welcome to the Astro Blog Theme"
description: "How this theme is structured and how to make it your own."
pubDate: 2026-08-30
tags: ["meta", "astro"]
---

This is a starter post. It exists so the theme has something to render on a
fresh clone. Delete it whenever you like.

## What you get

- A Markdown content collection at `src/content/blog/`
- Light and dark mode with a no-flash theme toggle
- RSS feed at `/rss.xml` and a sitemap via `@astrojs/sitemap`
- Sensible Open Graph and Twitter Card metadata
- Zero client JavaScript beyond the theme toggle

## Making it yours

1. Edit `src/consts.ts` for the site title, description, navigation and social links.
2. Adjust the design tokens at the top of `src/styles/global.css`.
3. Drop your posts into `src/content/blog/` as `.md` or `.mdx` files.

Every post needs `title`, `description` and `pubDate` in its frontmatter.
`tags`, `heroImage`, `updatedDate` and `draft` are optional.
