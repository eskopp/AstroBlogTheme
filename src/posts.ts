import { getCollection, type CollectionEntry } from "astro:content";
import {
  postLocale,
  postSlug,
  translationKey,
  defaultLocale,
  type Locale,
} from "./i18n";

export type Post = CollectionEntry<"blog">;

const byDate = (a: Post, b: Post) =>
  b.data.pubDate.getTime() - a.data.pubDate.getTime();

/** Published posts for one locale, newest first. */
export async function getPosts(locale: Locale = defaultLocale): Promise<Post[]> {
  const all = await getCollection("blog", ({ data }) => !data.draft);
  return all.filter((p) => postLocale(p.id) === locale).sort(byDate);
}

/** All published posts of every locale, newest first. */
export async function getAllPosts(): Promise<Post[]> {
  return (await getCollection("blog", ({ data }) => !data.draft)).sort(byDate);
}

/** The same post in the other available locales. */
export async function getTranslations(post: Post) {
  const key = translationKey(post);
  const all = await getCollection("blog", ({ data }) => !data.draft);
  return all
    .filter((p) => translationKey(p) === key && p.id !== post.id)
    .map((p) => ({ locale: postLocale(p.id), slug: postSlug(p) }));
}

/** Up to `limit` posts of the same locale sharing the most tags. */
export async function getRelated(post: Post, limit = 3): Promise<Post[]> {
  const locale = postLocale(post.id);
  const key = translationKey(post);
  const tags = new Set(post.data.tags);
  if (tags.size === 0) return [];
  const others = (await getPosts(locale)).filter(
    (p) => p.id !== post.id && translationKey(p) !== key,
  );
  return others
    .map((p) => ({
      p,
      score: p.data.tags.filter((tag) => tags.has(tag)).length,
    }))
    .filter((x) => x.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.p.data.pubDate.getTime() - a.p.data.pubDate.getTime(),
    )
    .slice(0, limit)
    .map((x) => x.p);
}

/** Rough reading time in minutes (≈ 200 words/min), at least 1. */
export function readingTimeMinutes(post: Post): number {
  const words = (post.body ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export { postLocale, postSlug };
