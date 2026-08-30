import sitemap from "@astrojs/sitemap";

const DEFAULTS = {
  title: "Astro Blog Theme",
  description: "A blog built with Astro.",
  author: "",
  lang: "en",
  locale: "en_US",
  nav: [
    { href: "/", label: "Home" },
    { href: "/blog", label: "Blog" },
  ],
  social: [{ href: "/rss.xml", label: "RSS" }],
  postsPerPage: 5,
  search: true,
};

function resolveConfig(options) {
  return {
    ...DEFAULTS,
    ...options,
    nav: options.nav ?? DEFAULTS.nav,
    social: options.social ?? DEFAULTS.social,
  };
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
          injectRoute({
            pattern: "/blog",
            entrypoint: "astro-blog-theme/routes/blog-index.astro",
          });
          injectRoute({
            pattern: "/blog/[...slug]",
            entrypoint: "astro-blog-theme/routes/blog-post.astro",
          });
          injectRoute({
            pattern: "/rss.xml",
            entrypoint: "astro-blog-theme/routes/rss.xml.ts",
          });
          injectRoute({
            pattern: "/404",
            entrypoint: "astro-blog-theme/routes/404.astro",
          });
          injectRoute({
            pattern: "/tags",
            entrypoint: "astro-blog-theme/routes/tags-index.astro",
          });
          injectRoute({
            pattern: "/tags/[tag]",
            entrypoint: "astro-blog-theme/routes/tag.astro",
          });
          if (config.search) {
            injectRoute({
              pattern: "/search.json",
              entrypoint: "astro-blog-theme/routes/search.json.ts",
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
