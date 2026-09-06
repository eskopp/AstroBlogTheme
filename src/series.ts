import { getPosts, type Post } from "./posts";
import { postLocale, defaultLocale, type Locale } from "./i18n";

/** One series membership, as authored in a post's `series` frontmatter. */
export interface SeriesRef {
  name: string;
  order?: number;
  title?: string;
}

/** Normalise the `series` frontmatter (string | (string | object)[]) to a list. */
export function postSeriesRefs(post: Post): SeriesRef[] {
  const raw = post.data.series;
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list.map((entry) =>
    typeof entry === "string" ? { name: entry } : entry,
  );
}

/** Hugo-style urlize, matching `tagSlug`: lowercase, punctuation to hyphens. */
export function seriesSlug(key: string): string {
  return key
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export function seriesUrl(key: string): string {
  return `/series/${seriesSlug(key)}/`;
}

/** "endgame-basics" -> "Endgame basics" (only used when no `title` is set). */
function humanise(key: string): string {
  const s = key.replace(/[-_]+/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

interface Member {
  post: Post;
  name: string;
  order?: number;
  title?: string;
}

/** Members sorted: explicit `order` first (ascending), then the rest by date. */
function sortMembers(members: Member[]): Member[] {
  return [...members].sort((a, b) => {
    const ao = a.order ?? Infinity;
    const bo = b.order ?? Infinity;
    if (ao !== bo) return ao - bo;
    return a.post.data.pubDate.getTime() - b.post.data.pubDate.getTime();
  });
}

export interface SeriesEntry {
  key: string;
  slug: string;
  title: string;
  count: number;
  posts: Post[];
}

/** slug -> ordered members, for one locale. */
async function collectSeries(locale: Locale): Promise<Map<string, Member[]>> {
  const posts = await getPosts(locale);
  const groups = new Map<string, Member[]>();
  for (const post of posts) {
    for (const ref of postSeriesRefs(post)) {
      const slug = seriesSlug(ref.name);
      if (!slug) continue;
      if (!groups.has(slug)) groups.set(slug, []);
      groups.get(slug)!.push({
        post,
        name: ref.name,
        order: ref.order,
        title: ref.title,
      });
    }
  }
  for (const [slug, members] of groups) {
    groups.set(slug, sortMembers(members));
  }
  return groups;
}

function titleOf(members: Member[]): string {
  for (const m of members) if (m.title) return m.title;
  return humanise(members[0]?.name ?? "");
}

/** Every series in one locale, alphabetical by title. */
export async function getSeriesList(
  locale: Locale = defaultLocale,
): Promise<SeriesEntry[]> {
  const groups = await collectSeries(locale);
  return [...groups.entries()]
    .map(([slug, members]) => ({
      key: members[0].name,
      slug,
      title: titleOf(members),
      count: members.length,
      posts: members.map((m) => m.post),
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

/** One series by slug, in one locale. */
export async function getSeriesBySlug(
  slug: string,
  locale: Locale = defaultLocale,
): Promise<SeriesEntry | undefined> {
  return (await getSeriesList(locale)).find((s) => s.slug === slug);
}

export interface SeriesContext {
  slug: string;
  title: string;
  parts: Post[];
  /** 1-based position of the current post within this series. */
  index: number;
  total: number;
  prev?: Post;
  next?: Post;
}

/**
 * Every series the post belongs to (2+ parts each), each with its siblings
 * ordered and the post's position resolved.
 */
export async function getSeriesContexts(
  post: Post,
): Promise<SeriesContext[]> {
  const refs = postSeriesRefs(post);
  if (refs.length === 0) return [];
  const locale = postLocale(post.id);
  const groups = await collectSeries(locale);

  const out: SeriesContext[] = [];
  for (const ref of refs) {
    const slug = seriesSlug(ref.name);
    const members = groups.get(slug);
    if (!members || members.length < 2) continue;
    const i = members.findIndex((m) => m.post.id === post.id);
    if (i === -1) continue;
    out.push({
      slug,
      title: titleOf(members),
      parts: members.map((m) => m.post),
      index: i + 1,
      total: members.length,
      prev: members[i - 1]?.post,
      next: members[i + 1]?.post,
    });
  }
  return out;
}
