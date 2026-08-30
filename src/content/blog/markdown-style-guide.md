---
title: "Markdown style guide"
description: "A reference post showing how each Markdown element is styled by the theme."
pubDate: 2026-08-24
updatedDate: 2026-08-28
tags: ["meta", "reference"]
---

Use this post to check that your styling looks right after changing the design
tokens.

## Headings

The heading above is an `h2`. Below is an `h3`.

### A third-level heading

## Text formatting

You can write **bold text**, _italic text_, and `inline code`. You can also
create [links](https://astro.build) that open documentation.

> Blockquotes are useful for pulling out a key idea or quoting a source. They
> get a colored left border and muted text.

## Lists

An unordered list:

- First item
- Second item
- Third item with a bit more text so the line wraps on smaller screens

An ordered list:

1. Clone the repository
2. Run `npm install`
3. Run `npm run dev`

## Code blocks

```ts
type Post = {
  title: string;
  pubDate: Date;
  draft?: boolean;
};

const isPublished = (post: Post): boolean => !post.draft;
```

## Tables

| Element | Tag    | Styled |
| ------- | ------ | ------ |
| Heading | `h2`   | yes    |
| Code    | `pre`  | yes    |
| Quote   | `blockquote` | yes |

---

That horizontal rule marks the end of the guide.
