import config from "virtual:astro-blog-theme/config";
import type { CollectionEntry } from "astro:content";

export const locales = config.locales;
export const defaultLocale = config.locales[0];

export type Locale = string;

/**
 * Layout: one folder per post, one file per language inside it, named after the
 * locale — e.g. `blog/autohaus/de.md`, `blog/autohaus/en.md`. The folder path is
 * the slug and the translation key; the filename is the locale.
 */

/** Locale of a post from its filename (`autohaus/de` -> `"de"`). */
export function postLocale(id: string): Locale {
  const seg = id.split("/").pop() ?? "";
  return locales.includes(seg) ? seg : defaultLocale;
}

/** Slug of a post = its folder path (`cars/autohaus/de` -> `"cars/autohaus"`). */
export function postSlug(id: string): string {
  const parts = id.split("/");
  return locales.includes(parts.at(-1) ?? "")
    ? parts.slice(0, -1).join("/")
    : id;
}

/** Key two posts share when they are translations of each other. */
export function translationKey(post: CollectionEntry<"blog">): string {
  return post.data.translationKey ?? postSlug(post.id);
}

/** Prefix a root-relative path with the locale unless it is the default. */
export function localeHref(locale: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return locale === defaultLocale ? clean : `/${locale}${clean}`;
}

export function blogPostHref(post: CollectionEntry<"blog">): string {
  return localeHref(postLocale(post.id), `/blog/${postSlug(post.id)}/`);
}

/** Detect the active locale from a request pathname. */
export function localeFromPath(pathname: string): Locale {
  const seg = pathname.replace(/^\/+/, "").split("/")[0];
  return locales.includes(seg) && seg !== defaultLocale ? seg : defaultLocale;
}

const STRINGS: Record<string, Record<string, string>> = {
  de: {
    skipToContent: "Zum Inhalt springen",
    latestPosts: "Neueste Beiträge",
    allPosts: "Alle {count} Beiträge",
    blog: "Blog",
    tags: "Tags",
    allTags: "Alle Tags",
    searchPlaceholder: "Suchen…",
    noResults: "Keine passenden Beiträge.",
    updated: "aktualisiert",
    postNav: "Beitragsnavigation",
    noPosts: "Noch keine Beiträge.",
    noTags: "Noch keine Tags.",
    backHome: "Zurück zur Startseite",
    notFound: "Seite nicht gefunden",
    notFoundBody: "Diese Seite konnte nicht gefunden werden.",
    postsTagged: "Beiträge mit dem Tag „{tag}“.",
    aiFlag: "Für diesen Beitrag wurde KI verwendet",
  },
  en: {
    skipToContent: "Skip to content",
    latestPosts: "Latest posts",
    allPosts: "All {count} posts",
    blog: "Blog",
    tags: "Tags",
    allTags: "All tags",
    searchPlaceholder: "Search…",
    noResults: "No matching posts.",
    updated: "updated",
    postNav: "Post navigation",
    noPosts: "No posts yet.",
    noTags: "No tags yet.",
    backHome: "Back to home",
    notFound: "Page not found",
    notFoundBody: "This page could not be found.",
    postsTagged: "Posts tagged “{tag}”.",
    aiFlag: "AI was used while writing this post",
  },
};

export function t(
  key: string,
  locale: Locale = defaultLocale,
  vars: Record<string, string | number> = {},
): string {
  const override = config.ui?.[locale]?.[key];
  const base = STRINGS[locale]?.[key] ?? STRINGS.en[key] ?? key;
  let out = override ?? base;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replace(`{${k}}`, String(v));
  }
  return out;
}
