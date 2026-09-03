# AstroBlogTheme

![AI-assisted](https://img.shields.io/badge/AI--assisted-Claude-8A63D2?logo=anthropic&logoColor=white)
![Human-reviewed](https://img.shields.io/badge/Human--reviewed-yes-2ea44f)

A reusable Astro blog theme, packaged as an **Astro integration** and imported
straight from GitHub, the way a Hugo theme is pulled in as a module. Your blog
project stays tiny: a config, a content-collection definition, and your posts.


## Install from GitHub

```sh
npm install github:eskopp/AstroBlogTheme
```

Or pin a tag or commit in `package.json`:

```json
{
  "dependencies": {
    "astro-blog-theme": "github:eskopp/AstroBlogTheme#v0.1.0"
  }
}
```

## Wire it up

**`astro.config.mjs`**

```js
import { defineConfig } from "astro/config";
import blogTheme from "astro-blog-theme";

export default defineConfig({
  site: "https://your-domain.example",
  integrations: [
    blogTheme({
      title: "My Blog",
      description: "Notes and longer pieces.",
      author: "Your Name",
      nav: [
        { href: "/", label: "Home" },
        { href: "/blog", label: "Blog" },
      ],
      social: [{ href: "/rss.xml", label: "RSS" }],
    }),
  ],
});
```

**`src/content.config.ts`** — declare a `blog` collection with the theme's schema:

```ts
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { blogSchema } from "astro-blog-theme/content";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: blogSchema,
});

export const collections = { blog };
```

**`src/env.d.ts`** — so the editor knows the virtual config module:

```ts
/// <reference types="astro-blog-theme/virtual.d.ts" />
```

**`src/pages/index.astro`** — you own the home page. Example:

```astro
---
import { getCollection } from "astro:content";
import config from "virtual:astro-blog-theme/config";
import BaseLayout from "astro-blog-theme/layouts/BaseLayout.astro";
import PostCard from "astro-blog-theme/components/PostCard.astro";

const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
  (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
);
---

<BaseLayout>
  <ul class="post-list">
    {posts.map((post) => <li><PostCard post={post} /></li>)}
  </ul>
</BaseLayout>
```

Add posts to `src/content/blog/*.md`. Put `favicon.svg` (and optionally
`og-default.svg`) in `public/`.

## Options

| Option         | Type                            | Default                            |
| -------------- | ------------------------------- | ---------------------------------- |
| `title`        | `string`                        | `"Astro Blog Theme"`               |
| `description`  | `string`                        | `"A blog built with Astro."`       |
| `author`       | `string`                        | `""`                               |
| `lang`         | `string`                        | `"en"`                             |
| `locale`       | `string`                        | `"en_US"`                          |
| `nav`          | `{ href, label }[]`             | Home + Blog                        |
| `social`       | `{ href, label }[]`             | RSS                                |
| `postsPerPage` | `number`                        | `5`                                |
| `postList`     | `"cards" \| "rows"`             | `"cards"`                          |
| `search`       | `boolean`                       | `true`                             |
| `injectRoutes` | `boolean`                       | `true`                             |
| `sitemap`      | `boolean`                       | `true`                             |

## Multi-language

List the languages in `locales` (first entry is the default and drives the
listing pages and RSS):

```js
blogTheme({ locales: ["de", "en"] })
```

**One folder per post, one file per language named after the locale.** Each file
sets its own `urlSlug` (defaults to the folder name) — the slug carries the
language, there is no `/en/` URL prefix:

```
src/content/blog/hello-world/
  de.md   # urlSlug: hallo-welt   ->  /blog/hallo-welt/
  en.md   #                        ->  /blog/hello-world/
```

The folder path links the translations (override with `translationKey`). Posts
of every language live under `/blog/<slug>/`; a post page carries `hreflang`
alternates and a header language switcher that jumps to the translation. The
listing routes (`/blog`, `/tags`, `/rss.xml`, `/llms.txt`, `/search.json`) and
your own pages show the default language.

With more than one locale, each language also gets its own feed at
`/rss/<locale>.xml` (`/rss.xml` stays the default-language feed), and every page
advertises them with `<link rel="alternate" type="application/rss+xml">`.

## Package exports

| Import                                      | What                              |
| ------------------------------------------- | --------------------------------- |
| `astro-blog-theme`                          | the integration (default export)  |
| `astro-blog-theme/content`                  | `blogSchema`                      |
| `astro-blog-theme/layouts/BaseLayout.astro` | page shell (head, header, footer) |
| `astro-blog-theme/layouts/PostLayout.astro` | single-post layout                |
| `astro-blog-theme/components/*.astro`       | `Header`, `Footer`, `PostCard`, … |
| `astro-blog-theme/styles.css`               | the stylesheet (already loaded by the layouts) |
| `virtual:astro-blog-theme/config`           | the resolved options object       |

## Overriding styles

The theme is a single stylesheet of CSS custom properties. Override the tokens
after the theme loads:

```css
:root {
  --accent: #c0392b;
  --content-width: 48rem;
}
```

## Local development

```sh
npm install
cd demo && npm install
npm run dev      # runs the demo app against ../ (the package source)
```

## License

MIT
