import { readFile, writeFile, readdir, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import sitemap from "@astrojs/sitemap";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { visit } from "unist-util-visit";
import { renderChessBoard } from "./src/chess.mjs";

const CALLOUT_LABELS = {
  de: {
    note: "Hinweis",
    tip: "Tipp",
    important: "Wichtig",
    warning: "Warnung",
    caution: "Achtung",
    readmore: "Weiterlesen",
  },
  en: {
    note: "Note",
    tip: "Tip",
    important: "Important",
    warning: "Warning",
    caution: "Caution",
    readmore: "Read more",
  },
};

/** Locale of a content file from its name (`de.md` -> `"de"`), falling back to the default. */
function localeFromFile(file, config) {
  const seg = (file.path || "").split("/").pop() || "";
  const loc = seg.replace(/\.(md|mdx)$/, "");
  return config.locales.includes(loc) ? loc : config.defaultLocale;
}

/** GitHub-style callouts: a blockquote starting with `[!TYPE]` becomes <aside class="callout callout--type">. */
function remarkCallouts(config) {
  return (tree, file) => {
    const locale = localeFromFile(file, config);
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

const CHESS_ENGINE_LABELS = {
  de: {
    load: "Engine laden",
    loading: "Lädt Engine…",
    stop: "Stoppen",
    stopping: "Stoppt…",
    reanalyze: "Erneut analysieren",
    hide: "Engine ausblenden",
    error: "Engine konnte nicht geladen werden.",
    reset: "Zurück zur Grundstellung",
    openInLichess: "In Lichess öffnen",
    copy: "Kopieren",
    copied: "Kopiert!",
    check: "Schach!",
    checkmateWhite: "Schachmatt – Weiß gewinnt",
    checkmateBlack: "Schachmatt – Schwarz gewinnt",
    stalemate: "Patt – Remis",
    draw: "Remis",
  },
  en: {
    load: "Load engine",
    loading: "Loading engine…",
    stop: "Stop",
    stopping: "Stopping…",
    reanalyze: "Analyze again",
    hide: "Hide engine",
    error: "Could not load the engine.",
    reset: "Back to starting position",
    copy: "Copy",
    copied: "Copied!",
    check: "Check!",
    checkmateWhite: "Checkmate – White wins",
    checkmateBlack: "Checkmate – Black wins",
    stalemate: "Stalemate – draw",
    draw: "Draw",
    openInLichess: "Open in Lichess",
  },
};

/** Turn ```fen fenced blocks into a static inline SVG chessboard at build time. */
function remarkChessPassthrough(config) {
  return (tree, file) => {
    visit(tree, "code", (node, index, parent) => {
      if (node.lang !== "fen" || !parent || index === undefined) return;
      // No meta: the side to move sits at the bottom. `white`/`black` pins it.
      // `noengine` drops the eval bar, arrows and engine for this one board
      // even when `chessEngine` is on globally.
      const metaTokens = (node.meta || "").trim().split(/\s+/).filter(Boolean);
      const orientation = metaTokens.find((t) => t === "white" || t === "black");
      const noEngine = metaTokens.includes("noengine");
      const boardEngine = config.chessEngine && !noEngine;
      const locale = localeFromFile(file, config);
      const l = { ...CHESS_ENGINE_LABELS.en, ...(CHESS_ENGINE_LABELS[locale] || {}) };

      let board;
      try {
        board = renderChessBoard(node.value, {
          orientation,
          evalBar: boardEngine,
          lichessLabel: l.openInLichess,
        });
      } catch (err) {
        const seg = (file.path || "").split("/").pop() || "unknown";
        throw new Error(`${seg}: invalid \`\`\`fen block: ${err.message}`);
      }

      const fen = node.value.trim().replace(/"/g, "&quot;");
      const fenFields = node.value.trim().split(/\s+/);
      const resolvedOrientation =
        orientation ?? (fenFields[1] === "b" ? "black" : "white");

      let engine = "";
      let controls = "";
      if (boardEngine) {
        engine =
          `<div class="chess-engine" hidden>` +
          `<button type="button" class="chess-engine__toggle" ` +
          `data-label-load="${l.load}" data-label-loading="${l.loading}" ` +
          `data-label-stop="${l.stop}" data-label-stopping="${l.stopping}" ` +
          `data-label-reanalyze="${l.reanalyze}" data-label-error="${l.error}">${l.load}</button>` +
          `<button type="button" class="chess-engine__hide" hidden>${l.hide}</button>` +
          `<div class="chess-engine__lines" hidden></div>` +
          `</div>`;
        controls =
          `<div class="chess-controls" hidden>` +
          `<p class="chess-controls__status" hidden ` +
          `data-check="${l.check}" data-checkmate-white="${l.checkmateWhite}" ` +
          `data-checkmate-black="${l.checkmateBlack}" data-stalemate="${l.stalemate}" ` +
          `data-draw="${l.draw}"></p>` +
          `<div class="chess-controls__buttons">` +
          `<button type="button" class="chess-controls__reset" disabled>${l.reset}</button>` +
          `<button type="button" class="chess-controls__copy" ` +
          `data-label-copy="${l.copy}" data-label-copied="${l.copied}">${l.copy}</button>` +
          `</div>` +
          `<div class="chess-controls__moves"></div>` +
          `</div>`;
      }

      parent.children[index] = {
        type: "html",
        value:
          `<div class="chess-board" data-fen="${fen}" data-orientation="${resolvedOrientation}" ` +
          (boardEngine ? "" : `data-no-engine `) +
          `data-lichess-label="${l.openInLichess}">` +
          `${board}${controls}${engine}</div>`,
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
  postList: "cards",
  search: true,
  toc: true,
  mermaid: false,
  math: false,
  chess: false,
  chessEngine: false,
  colorScheme: "system",
  security: null,
  pwa: null,
};

/** `pwa: true | {…}` -> a filled-in object, or null when disabled. */
function normalizePwa(pwa, options) {
  if (!pwa) return null;
  const p = pwa === true ? {} : { ...pwa };
  p.name ??= options.title ?? DEFAULTS.title;
  p.shortName ??= p.name;
  p.themeColor ??= "#ffffff";
  p.backgroundColor ??= p.themeColor;
  p.icon ??= "/favicon.svg";
  return p;
}

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
    mermaid: (options.mermaid ?? DEFAULTS.mermaid) ? true : false,
    mermaidPrerender: options.mermaid === "prerender",
    math: options.math ?? DEFAULTS.math,
    chess: options.chess ?? DEFAULTS.chess,
    chessEngine: (options.chess ?? DEFAULTS.chess) && (options.chessEngine ?? DEFAULTS.chessEngine),
    colorScheme: options.colorScheme ?? DEFAULTS.colorScheme,
    postList: options.postList === "rows" ? "rows" : DEFAULTS.postList,
    security: options.security ?? DEFAULTS.security,
    pwa: normalizePwa(options.pwa, options),
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
        if (config.chess) remarkPlugins.push([remarkChessPassthrough, config]);
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
          injectRoute({
            pattern: "/blog/[...page]",
            entrypoint: at("blog-index.astro"),
          });
          injectRoute({
            pattern: "/blog/[...slug]",
            entrypoint: at("blog-post.astro"),
          });
          injectRoute({ pattern: "/tags", entrypoint: at("tags-index.astro") });
          injectRoute({ pattern: "/tags/[tag]", entrypoint: at("tag.astro") });
          injectRoute({
            pattern: "/series",
            entrypoint: at("series-index.astro"),
          });
          injectRoute({
            pattern: "/series/[slug]",
            entrypoint: at("series.astro"),
          });
          injectRoute({ pattern: "/rss.xml", entrypoint: at("rss.xml.ts") });
          if (config.locales.length > 1) {
            injectRoute({
              pattern: "/rss/[locale].xml",
              entrypoint: at("rss/[locale].xml.ts"),
            });
          }
          injectRoute({ pattern: "/feed.json", entrypoint: at("feed.json.ts") });
          injectRoute({ pattern: "/llms.txt", entrypoint: at("llms.txt.ts") });
          injectRoute({
            pattern: "/llms-full.txt",
            entrypoint: at("llms-full.txt.ts"),
          });
          injectRoute({ pattern: "/humans.txt", entrypoint: at("humans.txt.ts") });
          if (config.pwa) {
            injectRoute({
              pattern: "/manifest.webmanifest",
              entrypoint: at("manifest.webmanifest.ts"),
            });
          }
          if (config.security?.contact) {
            injectRoute({
              pattern: "/.well-known/security.txt",
              entrypoint: at("security.txt.ts"),
            });
            injectRoute({
              pattern: "/security.txt",
              entrypoint: at("security.txt.ts"),
            });
          }
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
          if (config.chessEngine) {
            injectRoute({
              pattern: "/stockfish/engine.js",
              entrypoint: at("stockfish-engine.js.ts"),
            });
            injectRoute({
              pattern: "/stockfish/engine.wasm",
              entrypoint: at("stockfish-engine.wasm.ts"),
            });
            injectRoute({
              pattern: "/stockfish/engine-mt.js",
              entrypoint: at("stockfish-engine-mt.js.ts"),
            });
            injectRoute({
              pattern: "/stockfish/engine-mt.wasm",
              entrypoint: at("stockfish-engine-mt.wasm.ts"),
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

      "astro:config:done": ({ config: astroConfig }) => {
        pwaBuild.publicDir = astroConfig.publicDir;
        pwaBuild.base = astroConfig.base || "/";
        pwaBuild.root = astroConfig.root;
      },

      "astro:build:done": async ({ dir, logger }) => {
        // Mermaid first, so the PWA precache picks up the rendered HTML.
        if (config.mermaidPrerender) {
          try {
            await prerenderMermaid({ dir, config, logger });
          } catch (err) {
            logger.warn(
              `mermaid: prerender failed (${err.message}). Diagrams fall back to client-side rendering.`,
            );
          }
        }

        if (config.pwa) {
          try {
            await emitPwaAssets({ dir, config, pwaBuild, logger });
          } catch (err) {
            logger.warn(
              `pwa: could not generate the service worker / icons (${err.message}). Skipping.`,
            );
          }
        }
      },
    },
  };
}

/** Set in astro:config:done, read in astro:build:done. */
const pwaBuild = { publicDir: null, base: "/" };

const PWA_MAX_PRECACHE_BYTES = 600_000;
const PWA_SKIP = [
  /\.map$/,
  /\.xml$/,
  /^\/stockfish\//,
  /^\/sw\.js$/,
  /^\/service-worker\.js$/,
];

/** Walk `dist/`, write hashed PNG icons and a service worker with a precache list. */
async function emitPwaAssets({ dir, config, pwaBuild, logger }) {
  const sharp = (await import("sharp")).default;
  const outDir = fileURLToPath(dir);

  // --- icons, rendered from the configured source image ---
  const iconRel = config.pwa.icon.replace(/^\//, "");
  const iconPath = fileURLToPath(new URL(iconRel, pwaBuild.publicDir));
  const src = await readFile(iconPath);
  const svg = iconRel.toLowerCase().endsWith(".svg");
  const load = () => sharp(src, svg ? { density: 384 } : {});
  const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

  const icon192 = await load()
    .resize(192, 192, { fit: "contain", background: transparent })
    .png()
    .toBuffer();
  const icon512 = await load()
    .resize(512, 512, { fit: "contain", background: transparent })
    .png()
    .toBuffer();
  // maskable: the icon at ~86% on a filled background, leaving the mask's safe zone
  const inner = await load()
    .resize(440, 440, { fit: "contain", background: transparent })
    .png()
    .toBuffer();
  const maskable = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: config.pwa.backgroundColor,
    },
  })
    .composite([{ input: inner, gravity: "center" }])
    .png()
    .toBuffer();

  await writeFile(new URL("pwa-icon-192.png", dir), icon192);
  await writeFile(new URL("pwa-icon-512.png", dir), icon512);
  await writeFile(new URL("pwa-icon-maskable.png", dir), maskable);

  // --- precache list from the built output ---
  const precache = new Set(["/"]);
  async function walk(absDir, urlPrefix) {
    for (const entry of await readdir(absDir, { withFileTypes: true })) {
      const abs = `${absDir}/${entry.name}`;
      const rel = `${urlPrefix}${entry.name}`;
      if (entry.isDirectory()) {
        await walk(abs, `${rel}/`);
        continue;
      }
      const url = entry.name === "index.html" ? `/${urlPrefix}` : `/${rel}`;
      if (PWA_SKIP.some((re) => re.test(url))) continue;
      const { size } = await stat(abs);
      if (size > PWA_MAX_PRECACHE_BYTES) continue;
      precache.add(url);
    }
  }
  await walk(outDir.replace(/\/$/, ""), "");

  const buildId = Date.now().toString(36);
  const template = await readFile(
    new URL("./src/pwa/service-worker.js", import.meta.url),
    "utf8",
  );
  const sw = template
    .replaceAll("__BUILD_ID__", buildId)
    .replaceAll(
      '"__PRECACHE__"',
      JSON.stringify(JSON.stringify([...precache].sort())),
    );
  await writeFile(new URL("sw.js", dir), sw);
  logger.info(`pwa: service worker + icons written (${precache.size} URLs precached)`);
}

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".xml": "application/xml",
};

/** Collect every built HTML file that still has an un-rendered mermaid block. */
async function findMermaidPages(absDir) {
  const hits = [];
  async function walk(d) {
    for (const e of await readdir(d, { withFileTypes: true })) {
      const p = `${d}/${e.name}`;
      if (e.isDirectory()) await walk(p);
      else if (e.name.endsWith(".html")) {
        const html = await readFile(p, "utf8");
        if (html.includes('<pre class="mermaid">')) hits.push({ path: p, html });
      }
    }
  }
  await walk(absDir);
  return hits;
}

async function launchBrowser(chromium) {
  const attempts = [];
  for (const env of [
    "MERMAID_PRERENDER_BROWSER",
    "CHROME_PATH",
    "PUPPETEER_EXECUTABLE_PATH",
    "PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH",
  ]) {
    if (process.env[env]) attempts.push({ executablePath: process.env[env] });
  }
  attempts.push(
    { channel: "chromium" },
    { channel: "chrome" },
    { channel: "msedge" },
    {},
  );
  for (const opt of attempts) {
    try {
      return await chromium.launch({ headless: true, ...opt });
    } catch {
      /* try the next candidate */
    }
  }
  return null;
}

/**
 * Replace `<pre class="mermaid">` blocks in the built HTML with inline SVG,
 * rendered by loading each page in a real browser and letting the theme's own
 * client runtime draw the diagram — once per colour scheme. Pages that render
 * cleanly also drop the now-unused MermaidRuntime script. Any failure leaves
 * the page untouched (it still renders client-side).
 */
async function prerenderMermaid({ dir, config, logger }) {
  const absDir = fileURLToPath(dir).replace(/\/$/, "");
  const pages = await findMermaidPages(absDir);
  if (pages.length === 0) return;

  let chromium;
  try {
    ({ chromium } = await import("playwright-core"));
  } catch {
    logger.warn(
      'mermaid: `mermaid: "prerender"` needs `playwright-core`. Run `npm i -D playwright-core`. Falling back to client-side rendering.',
    );
    return;
  }

  const browser = await launchBrowser(chromium);
  if (!browser) {
    logger.warn(
      "mermaid: no Chromium/Chrome found for prerendering (set MERMAID_PRERENDER_BROWSER). Falling back to client-side rendering.",
    );
    return;
  }

  const server = createServer(async (req, res) => {
    try {
      let rel = decodeURIComponent((req.url || "/").split("?")[0]);
      if (rel.endsWith("/")) rel += "index.html";
      const file = `${absDir}${rel}`;
      if (!file.startsWith(absDir)) {
        res.statusCode = 403;
        return res.end();
      }
      const body = await readFile(file);
      const ext = rel.slice(rel.lastIndexOf("."));
      res.setHeader("content-type", MIME[ext] || "application/octet-stream");
      res.end(body);
    } catch {
      res.statusCode = 404;
      res.end();
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const port = server.address().port;
  const origin = `http://127.0.0.1:${port}`;

  const blockRe = /<pre class="mermaid">[\s\S]*?<\/pre>/g;
  const runtimeRe =
    /\s*<script[^>]*src="[^"]*MermaidRuntime[^"]*"[^>]*><\/script>/g;

  let rendered = 0;
  try {
    for (const { path: filePath, html } of pages) {
      const rel = filePath.slice(absDir.length).replace(/index\.html$/, "");
      const url = origin + rel;
      const count = (html.match(blockRe) || []).length;

      const grab = async (scheme) => {
        const page = await browser.newPage();
        await page.addInitScript((s) => {
          try {
            localStorage.setItem("theme", s);
          } catch {}
        }, scheme);
        await page.emulateMedia({ colorScheme: scheme });
        await page.goto(url, { waitUntil: "load", timeout: 20000 });
        await page.waitForFunction(
          (n) =>
            document.querySelectorAll(".mermaid[data-processed]").length >= n,
          count,
          { timeout: 20000 },
        );
        const svgs = await page.$$eval(".mermaid", (els) =>
          els.map((el) => el.innerHTML),
        );
        await page.close();
        return svgs;
      };

      let light, dark;
      try {
        light = await grab("light");
        dark = await grab("dark");
      } catch (err) {
        logger.warn(
          `mermaid: ${rel || "/"} did not render in time, left for the client (${err.message}).`,
        );
        continue;
      }
      if (light.length !== count || dark.length !== count) continue;

      let i = 0;
      const out = html.replace(blockRe, () => {
        const l = light[i];
        const d = dark[i];
        i += 1;
        return (
          `<div class="mermaid-prerendered">` +
          `<div class="mermaid-prerendered__light">${l}</div>` +
          `<div class="mermaid-prerendered__dark">${d}</div>` +
          `</div>`
        );
      });
      await writeFile(filePath, out.replace(runtimeRe, ""));
      rendered += count;
    }
  } finally {
    await browser.close();
    server.close();
  }

  logger.info(
    `mermaid: prerendered ${rendered} diagram${rendered === 1 ? "" : "s"} to inline SVG`,
  );
}
