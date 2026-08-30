import sitemap from "@astrojs/sitemap";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { visit } from "unist-util-visit";

const CALLOUT_LABELS = {
  de: {
    note: "Hinweis",
    tip: "Tipp",
    important: "Wichtig",
    warning: "Warnung",
    caution: "Achtung",
  },
  en: {
    note: "Note",
    tip: "Tip",
    important: "Important",
    warning: "Warning",
    caution: "Caution",
  },
};

/** GitHub-style callouts: a blockquote starting with `[!TYPE]` becomes <aside class="callout callout--type">. */
function remarkCallouts(config) {
  return (tree, file) => {
    const seg = (file.path || "").split("/").pop() || "";
    const loc = seg.replace(/\.(md|mdx)$/, "");
    const locale = config.locales.includes(loc) ? loc : config.defaultLocale;
    const labels = { ...(CALLOUT_LABELS.en), ...(CALLOUT_LABELS[locale] || {}) };

    visit(tree, "blockquote", (node) => {
      const first = node.children[0];
      if (!first || first.type !== "paragraph" || !first.children.length) return;
      const lead = first.children[0];
      if (!lead || lead.type !== "text") return;
      const m = lead.value.match(/^\[!(\w+)\]([ \t]+.*)?(\r?\n|$)/);
      if (!m) return;
      const type = m[1].toLowerCase();
      if (!labels[type]) return;

      const customTitle = (m[2] || "").trim();
      // strip the marker line from the first paragraph
      lead.value = lead.value.slice(m[0].length);
      if (!lead.value) first.children.shift();
      if (!first.children.length) node.children.shift();

      const uiTitle = config.ui?.[locale]?.[`callout_${type}`];
      node.data = node.data || {};
      node.data.hName = "aside";
      node.data.hProperties = {
        className: ["callout", `callout--${type}`],
      };
      node.children.unshift({
        type: "paragraph",
        data: { hProperties: { className: ["callout__title"] } },
        children: [
          { type: "text", value: customTitle || uiTitle || labels[type] },
        ],
      });
    });
  };
}

/** Turn ```mermaid fenced blocks into <pre class="mermaid"> for client rendering. */
function remarkMermaidPassthrough() {
  return (tree) => {
    visit(tree, "code", (node, index, parent) => {
      if (node.lang !== "mermaid" || !parent || index === undefined) return;
      // only < and & need escaping inside <pre> text; leaving --> intact
      const escaped = node.value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;");
      parent.children[index] = {
        type: "html",
        value: `<pre class="mermaid">\n${escaped}\n</pre>`,
      };
    });
  };
}

const DEFAULTS = {
  title: "Astro Blog Theme",
  description: "A blog built with Astro.",
  author: "",
  locale: "en_US",
  locales: ["en"],
  localeMeta: { en: "en_US", de: "de_DE" },
  localeLabels: { en: "EN", de: "DE" },
  localeHome: {},
  errorLocale: null,
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
  toc: true,
  mermaid: false,
  math: false,
  colorScheme: "system",
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
    localeHome: { ...DEFAULTS.localeHome, ...(options.localeHome ?? {}) },
    errorLocale: options.errorLocale ?? DEFAULTS.errorLocale,
    ui: options.ui ?? {},
    toc: options.toc ?? DEFAULTS.toc,
    mermaid: options.mermaid ?? DEFAULTS.mermaid,
    math: options.math ?? DEFAULTS.math,
    colorScheme: options.colorScheme ?? DEFAULTS.colorScheme,
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
      "astro:config:setup": async ({
        config: astroConfig,
        injectRoute,
        updateConfig,
        logger,
      }) => {
        const remarkPlugins = [[remarkCallouts, config]];
        const mathRehype = [];
        if (config.mermaid) remarkPlugins.push(remarkMermaidPassthrough);
        if (config.math) {
          try {
            await import("katex/contrib/mhchem"); // registers \ce{} for chemistry
            const remarkMath = (await import("remark-math")).default;
            const rehypeKatex = (await import("rehype-katex")).default;
            remarkPlugins.push(remarkMath);
            mathRehype.push([rehypeKatex, { throwOnError: false }]);
          } catch (e) {
            logger.warn(
              "math: true but remark-math / rehype-katex / katex are not installed. Run `npm i remark-math rehype-katex katex`.",
            );
          }
        }

        updateConfig({
          vite: { plugins: [virtualConfigPlugin(config)] },
          markdown: {
            shikiConfig: {
              themes: { light: "github-light", dark: "github-dark" },
              wrap: true,
            },
            remarkPlugins,
            rehypePlugins: [
              ...mathRehype,
              [
                rehypeAutolinkHeadings,
                {
                  behavior: "append",
                  properties: {
                    className: ["heading-anchor"],
                    ariaHidden: "true",
                    tabIndex: -1,
                  },
                  content: { type: "text", value: "#" },
                },
              ],
            ],
          },
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
          injectRoute({ pattern: "/feed.json", entrypoint: at("feed.json.ts") });
          injectRoute({ pattern: "/llms.txt", entrypoint: at("llms.txt.ts") });
          injectRoute({
            pattern: "/og/[slug].svg",
            entrypoint: at("og/[slug].svg.ts"),
          });
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
