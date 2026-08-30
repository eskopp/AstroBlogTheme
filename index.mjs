import sitemap from "@astrojs/sitemap";

const DEFAULTS = {
  title: "Astro Blog Theme",
  description: "A blog built with Astro.",
  author: "",
  locale: "en_US",
  locales: ["en"],
  localeMeta: { en: "en_US", de: "de_DE" },
  localeLabels: { en: "EN", de: "DE" },
  ui: {},
  nav: [
    { href: "/", label: "Home" },
    { href: "/blog", label: "Blog" },
  ],
  social: [{ href: "/rss.xml", label: "RSS" }],
  legal: [],
  license: null,
  postsPerPage: 5,
  search: true,
};

function resolveConfig(options) {
  const merged = {
    ...DEFAULTS,
    ...options,
    nav: options.nav ?? DEFAULTS.nav,
    social: options.social ?? DEFAULTS.social,
    legal: options.legal ?? DEFAULTS.legal,
    license: options.license ?? DEFAULTS.license,
    locales: options.locales ?? DEFAULTS.locales,
    localeMeta: { ...DEFAULTS.localeMeta, ...(options.localeMeta ?? {}) },
    localeLabels: { ...DEFAULTS.localeLabels, ...(options.localeLabels ?? {}) },
    ui: options.ui ?? {},
  };
  merged.defaultLocale = merged.locales[0];
  return merged;
}

function virtualConfigPlugin(config) {
  const virtualId = "virtual:astro-blog-theme/config";
  const resolvedId = "\0" + virtualId;
  return {
    name: "astro-blog-theme:virtual-config",
    resolveId(id) {
      if (id === virtualId) return resolvedId;
    },
    load(id) {
      if (id === resolvedId) {
        return `export default ${JSON.stringify(config)};`;
      }
    },
  };
}

/**
 * @param {object} [options]
 * @returns {import('astro').AstroIntegration}
 */
export default function blogTheme(options = {}) {
  const config = resolveConfig(options);
  const injectRoutes = options.injectRoutes !== false;
  const withSitemap = options.sitemap !== false;
  return {
    name: "astro-blog-theme",
    hooks: {
      "astro:config:setup": ({
        config: astroConfig,
        injectRoute,
        updateConfig,
        logger,
      }) => {
        updateConfig({
          vite: { plugins: [virtualConfigPlugin(config)] },
        });

        if (
          withSitemap &&
          !astroConfig.integrations.some((i) => i.name === "@astrojs/sitemap")
        ) {
          updateConfig({ integrations: [sitemap()] });
        }

        if (injectRoutes) {
          const at = (name) => `astro-blog-theme/routes/${name}`;
          injectRoute({ pattern: "/blog", entrypoint: at("blog-index.astro") });
          injectRoute({
            pattern: "/blog/[...slug]",
            entrypoint: at("blog-post.astro"),
          });
          injectRoute({ pattern: "/tags", entrypoint: at("tags-index.astro") });
          injectRoute({ pattern: "/tags/[tag]", entrypoint: at("tag.astro") });
          injectRoute({ pattern: "/rss.xml", entrypoint: at("rss.xml.ts") });
          injectRoute({ pattern: "/llms.txt", entrypoint: at("llms.txt.ts") });
          if (config.search) {
            injectRoute({
              pattern: "/search.json",
              entrypoint: at("search.json.ts"),
            });
          }
          // 404 + 500 emit flat .html; 403/503/429 emit <code>/index.html
          for (const code of [404, 403, 500, 503, 429]) {
            injectRoute({
              pattern: `/${code}`,
              entrypoint: at(`${code}.astro`),
            });
          }
        }

        if (!astroConfig.site) {
          logger.warn(
            "No `site` set in astro.config. Canonical URLs, the sitemap and the RSS feed need it.",
          );
        }
      },
    },
  };
}
