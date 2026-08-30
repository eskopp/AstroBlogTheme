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
  postsPerPage: 5,
  search: true,
};

function resolveConfig(options) {
  const merged = {
    ...DEFAULTS,
    ...options,
    nav: options.nav ?? DEFAULTS.nav,
    social: options.social ?? DEFAULTS.social,
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
  const { locales, defaultLocale } = config;
  const multilang = locales.length > 1;

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

        if (multilang && !astroConfig.i18n) {
          updateConfig({
            i18n: {
              defaultLocale,
              locales: [...locales],
              routing: { prefixDefaultLocale: false },
            },
          });
        }

        if (
          withSitemap &&
          !astroConfig.integrations.some((i) => i.name === "@astrojs/sitemap")
        ) {
          updateConfig({ integrations: [sitemap()] });
        }

        if (injectRoutes) {
          const at = (name) => `astro-blog-theme/routes/${name}`;

          // routes without params: one per locale, locale inferred from the URL
          for (const loc of locales) {
            const p = loc === defaultLocale ? "" : `/${loc}`;
            injectRoute({ pattern: `${p}/blog`, entrypoint: at("blog-index.astro") });
            injectRoute({ pattern: `${p}/tags`, entrypoint: at("tags-index.astro") });
            injectRoute({ pattern: `${p}/rss.xml`, entrypoint: at("rss.xml.ts") });
            injectRoute({ pattern: `${p}/llms.txt`, entrypoint: at("llms.txt.ts") });
            if (config.search) {
              injectRoute({
                pattern: `${p}/search.json`,
                entrypoint: at("search.json.ts"),
              });
            }
          }

          // parameterised routes: default locale unprefixed, others under [locale]
          injectRoute({
            pattern: "/blog/[...slug]",
            entrypoint: at("blog-post.astro"),
          });
          injectRoute({ pattern: "/tags/[tag]", entrypoint: at("tag.astro") });
          if (multilang) {
            injectRoute({
              pattern: "/[locale]/blog/[...slug]",
              entrypoint: at("blog-post-loc.astro"),
            });
            injectRoute({
              pattern: "/[locale]/tags/[tag]",
              entrypoint: at("tag-loc.astro"),
            });
          }

          injectRoute({ pattern: "/404", entrypoint: at("404.astro") });
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
