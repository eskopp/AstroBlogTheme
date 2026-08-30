import { getCollection } from "astro:content";

/** Hugo-style urlize: lowercase, spaces to hyphens, strip other punctuation. */
export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export function tagUrl(tag: string): string {
  return `/tags/${tagSlug(tag)}/`;
}

export interface TagEntry {
  name: string;
  slug: string;
  count: number;
}

/** All tags used by published posts, most-used first, then alphabetical. */
export async function getTags(): Promise<TagEntry[]> {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  const map = new Map<string, TagEntry>();
  for (const post of posts) {
    for (const name of post.data.tags) {
      const slug = tagSlug(name);
      const existing = map.get(slug);
      if (existing) existing.count += 1;
      else map.set(slug, { name, slug, count: 1 });
    }
  }
  return [...map.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  );
}
