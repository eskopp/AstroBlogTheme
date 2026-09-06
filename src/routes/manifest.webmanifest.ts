import type { APIContext } from "astro";
import config from "virtual:astro-blog-theme/config";
import { defaultLocale } from "../i18n";

/** Web App Manifest, emitted only when `pwa` is enabled. */
export async function GET(_context: APIContext) {
  const pwa = config.pwa!;

  const manifest = {
    name: pwa.name,
    short_name: pwa.shortName,
    description: config.description,
    lang: defaultLocale,
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    theme_color: pwa.themeColor,
    background_color: pwa.backgroundColor,
    icons: [
      { src: "/pwa-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/pwa-icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/pwa-icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { "content-type": "application/manifest+json; charset=utf-8" },
  });
}
