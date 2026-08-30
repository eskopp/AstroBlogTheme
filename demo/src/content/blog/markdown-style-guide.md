---
title: "Markdown style guide"
description: "A reference post to check styling after changing the design tokens."
pubDate: 2026-08-24
updatedDate: 2026-08-28
tags: ["reference"]
---

Use this post to check that headings, code, quotes and lists look right.

## Headings

The heading above is an `h2`. Below is an `h3`.

### A third-level heading

## Text formatting

You can write **bold text**, _italic text_ and `inline code`, plus
[links](https://astro.build).

> Blockquotes get a colored left border and muted text.

## Lists

- First item
- Second item
- Third item with more text so the line wraps on narrow screens

1. Clone the repository
2. Run `npm install`
3. Run `npm run dev`

## Code

```ts
type Post = { title: string; pubDate: Date; draft?: boolean };
const isPublished = (post: Post): boolean => !post.draft;
```

## Table

| Element | Tag          | Styled |
| ------- | ------------ | ------ |
| Heading | `h2`         | yes    |
| Code    | `pre`        | yes    |
| Quote   | `blockquote` | yes    |

---

End of guide.
