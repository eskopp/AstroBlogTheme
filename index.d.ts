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
  /** Home path per locale, used by the switcher on pages without a translation. Default `/` for the default locale, `/<locale>/` otherwise. */
  localeHome?: Record<string, string>;
  /** Language for the error pages (404, 403, …). Default: the default locale. */
  errorLocale?: string;
  /** Override built-in UI strings per locale: `{ de: { latestPosts: "…" } }`. */
  ui?: Record<string, Record<string, string>>;
  /** Primary navigation links. */
  nav?: NavLink[];
  /** Footer / social links. */
  social?: NavLink[];
  /** Footer legal links (Impressum, Datenschutz, …), shown on a second line. */
  legal?: NavLink[];
  /** Content licence shown in the footer next to the copyright, e.g. `{ label: "CC BY-ND 4.0", href: "https://creativecommons.org/licenses/by-nd/4.0/deed.de" }`. */
  license?: { label: string; href: string } | null;
  /** Number of posts on the home page. Default `5`. */
  postsPerPage?: number;
  /** How post lists (home, /blog, /tags) render: "cards" (default) or "rows" (minimal date + title lines). */
  postList?: "cards" | "rows";
  /** Show the header search box and inject `/search.json`. Default `true`. */
  search?: boolean;
  /** Show the table of contents on posts. Per-post `toc` frontmatter overrides. Default `true`. */
  toc?: boolean;
  /** Render ```mermaid code blocks as diagrams client-side. Requires `mermaid` installed in the consumer. Default `false`. */
  mermaid?: boolean;
  /** Render $...$ / $$...$$ math (and \ce{} chemistry) at build time with KaTeX. Requires remark-math, rehype-katex, katex in the consumer. Default `false`. */
  math?: boolean;
  /** Render ```fen code blocks (a FEN string) as a static inline SVG chessboard at build time. No client-side JS. The board orients to put the side to move at the bottom; add `white` or `black` after the language to pin it instead. Default `false`. */
  chess?: boolean;
  /** Add an opt-in "Load engine" button under each chess board that runs Stockfish (WASM, single-threaded) in a Web Worker to show an evaluation and the top lines; clicking a move inside a line jumps the board to exactly that point in the variation. Only takes effect together with `chess: true`. Requires `stockfish` and `chess.js` installed in the consumer. The button (and all engine code) only appears once client-side JS has run — with JS disabled, nothing is shown. Once loaded, a "Hide engine" button tears the analysis back down to a plain board (eval bar, arrows and lines removed). Add `noengine` after the ```fen language (alongside an optional `white`/`black`) to drop the eval bar, arrows, engine and move controls for that one board. Default `false`. */
  chessEngine?: boolean;
  /** Default colour scheme before the visitor picks one: "system" (default), "light" or "dark". */
  colorScheme?: "system" | "light" | "dark";
  /**
   * RFC 9116 `security.txt`. Set `contact` (a `mailto:`, `https:` or `tel:` URI,
   * or a list) to serve it at `/.well-known/security.txt` and `/security.txt`.
   * `expires` defaults to one year from build time; `preferredLanguages`
   * defaults to `locales`. Omit the whole option to serve nothing.
   */
  security?: {
    contact: string | string[];
    expires?: string;
    preferredLanguages?: string[];
    encryption?: string;
    policy?: string;
    acknowledgments?: string;
  };
  /**
   * Turn the site into an installable PWA: a generated `/manifest.webmanifest`,
   * PNG icons rendered from `icon` (192, 512 and a maskable 512) via `sharp`,
   * and a `/sw.js` that precaches every page and hashed asset for offline use
   * (large files like the Stockfish WASM are cached on first use instead).
   * Pass `true` for defaults, or an object to override. Requires `sharp`
   * (bundled with Astro). Only takes effect for `astro build`, not `astro dev`.
   */
  pwa?:
    | boolean
    | {
        /** App name. Default: `title`. */
        name?: string;
        /** Home-screen label. Default: `name`. */
        shortName?: string;
        /** `theme_color` and the `theme-color` meta. Default `"#ffffff"`. */
        themeColor?: string;
        /** Splash background and the maskable icon's padding. Default: `themeColor`. */
        backgroundColor?: string;
        /** Source image in `public/` for the icons. Default `"/favicon.svg"`. */
        icon?: string;
      };
  /** Inject `/blog`, `/blog/[...slug]`, `/rss.xml` and `/404`. Default `true`. */
  injectRoutes?: boolean;
  /** Add `@astrojs/sitemap` unless already present. Default `true`. */
  sitemap?: boolean;
}

export default function blogTheme(options?: BlogThemeOptions): AstroIntegration;
