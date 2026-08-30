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
  /** `<html lang>` value. Default `"en"`. */
  lang?: string;
  /** Open Graph locale, e.g. `"en_US"`. */
  locale?: string;
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
