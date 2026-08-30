import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { blogSchema } from "astro-blog-theme/content";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: blogSchema,
});

export const collections = { blog };
