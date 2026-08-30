import { z, type SchemaContext } from "astro:content";

/**
 * Frontmatter schema for the `blog` collection.
 *
 * Usage in the consuming project's `src/content.config.ts`:
 *
 * ```ts
 * import { defineCollection } from "astro:content";
 * import { glob } from "astro/loaders";
 * import { blogSchema } from "astro-blog-theme/content";
 *
 * const blog = defineCollection({
 *   loader: glob({ base: "./src/content/blog", pattern: "**\/*.{md,mdx}" }),
 *   schema: blogSchema,
 * });
 *
 * export const collections = { blog };
 * ```
 */
export const blogSchema = ({ image }: SchemaContext) =>
  z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: image().optional(),
    heroAlt: z.string().default(""),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    /** Whether AI was used while writing this post. */
    ai: z.boolean().default(false),
    /** Show the table of contents for this post. Overrides the theme's `toc` option. */
    toc: z.boolean().optional(),
    /**
     * URL slug for this post. Defaults to the folder name. Carries the language.
     * Not called `slug` on purpose — Astro's glob loader would treat that as the
     * entry id and break the folder/locale layout.
     */
    urlSlug: z.string().optional(),
    /**
     * Links this post to its translations. Defaults to the post's folder path,
     * so `blog/hello-world/de.md` and `blog/hello-world/en.md` are linked
     * automatically. Set it only to override that.
     */
    translationKey: z.string().optional(),
  });
