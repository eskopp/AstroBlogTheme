import type { AstroIntegration } from "astro";

export interface NavLink {
  href: string;
  label: string;
}

export interface BlogThemeOptions {
  /** Site title, shown in the header and metadata. */
  title?: string;
  /** Default meta description and RSS description. */
  description?: string;
  /** Author name for metadata and the footer. */
  author?: string;
  /** Open Graph locale fallback, e.g. `"en_US"`. */
  locale?: string;
  /**
   * Content locales. The first is the default and is served without a URL
   * prefix; the others live under `/<locale>/…`. One folder per post holds one
   * file per language, named after the locale (`blog/autohaus/de.md`,
   * `blog/autohaus/en.md`). Default `["en"]` (single language).
   */
  locales?: string[];
  /** Open Graph locale per content locale, e.g. `{ de: "de_DE", en: "en_US" }`. */
  localeMeta?: Record<string, string>;
  /** Language-switcher labels, e.g. `{ de: "DE", en: "EN" }`. */
  localeLabels?: Record<string, string>;
  /** Override built-in UI strings per locale: `{ de: { latestPosts: "…" } }`. */
  ui?: Record<string, Record<string, string>>;
  /** Primary navigation links. */
  nav?: NavLink[];
  /** Footer / social links. */
  social?: NavLink[];
  /** Number of posts on the home page. Default `5`. */
  postsPerPage?: number;
  /** Show the header search box and inject `/search.json`. Default `true`. */
  search?: boolean;
  /** Inject `/blog`, `/blog/[...slug]`, `/rss.xml` and `/404`. Default `true`. */
  injectRoutes?: boolean;
  /** Add `@astrojs/sitemap` unless already present. Default `true`. */
  sitemap?: boolean;
}

export default function blogTheme(options?: BlogThemeOptions): AstroIntegration;
