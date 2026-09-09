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
    /** Caption shown under the hero image. */
    heroCaption: z.string().optional(),
    /** Rights holder / source of the hero image, e.g. "© 2026 Erik Skopp".
     *  The build warns if `heroImage` is set without it. */
    heroCredit: z.string().optional(),
    /** Optional link for the hero credit. */
    heroCreditHref: z.string().optional(),
    /** Whether the hero image was generated with AI. Set it explicitly when
     *  `heroImage` is used; the build warns if it is missing. */
    heroAi: z.boolean().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    /**
     * Series this post belongs to. A post can be part of several series, each
     * with its own position. The series `name` is a stable, language-neutral
     * key shared by every part (e.g. `"endgame-basics"`); give each locale its
     * own display name with `title` (the first part that sets it wins).
     * `order` places the post within that series (1, 2, 3, …); parts without a
     * number sort last, by `pubDate`.
     *
     * ```yaml
     * series:
     *   - { name: endgame-basics, order: 2, title: "Endgame basics" }
     *   - { name: reader-questions, order: 5 }
     * ```
     *
     * A bare string (`series: endgame-basics`) or a list of strings is the
     * shorthand for entries without an explicit order.
     */
    series: z
      .union([
        z.string(),
        z.array(
          z.union([
            z.string(),
            z.object({
              name: z.string(),
              order: z.number().optional(),
              title: z.string().optional(),
            }),
          ]),
        ),
      ])
      .optional(),
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
