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
    /**
     * Links this post to its translations. Defaults to the post's folder path,
     * so `blog/autohaus/de.md` and `blog/autohaus/en.md` are linked
     * automatically. Set it only to override that.
     */
    translationKey: z.string().optional(),
  });
