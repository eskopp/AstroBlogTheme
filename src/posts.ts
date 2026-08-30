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

/** The same post in the other available locales: `{ locale, href }`. */
export async function getTranslations(post: Post) {
  const key = translationKey(post);
  const all = await getCollection("blog", ({ data }) => !data.draft);
  return all
    .filter((p) => translationKey(p) === key && p.id !== post.id)
    .map((p) => ({
      locale: postLocale(p.id),
      slug: postSlug(p.id),
    }));
}

export { postLocale, postSlug };
