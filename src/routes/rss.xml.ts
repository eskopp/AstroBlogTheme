import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import config from "virtual:astro-blog-theme/config";
import { getPosts } from "../posts";
import { localeFromPath, localeHref, defaultLocale, postSlug } from "../i18n";

export async function GET(context: APIContext) {
  const locale = localeFromPath(context.url.pathname);
  const posts = await getPosts(locale);
  const title =
    locale === defaultLocale ? config.title : `${config.title} (${locale})`;

  return rss({
    title,
    description: config.description,
    site: context.site ?? "https://example.com",
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: localeHref(locale, `/blog/${postSlug(post.id)}/`),
    })),
  });
}
