import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import config from "virtual:astro-blog-theme/config";
import { getPosts } from "../posts";
import { postSlug, defaultLocale } from "../i18n";

export async function GET(context: APIContext) {
  const posts = await getPosts(defaultLocale);

  return rss({
    title: config.title,
    description: config.description,
    site: context.site ?? "https://example.com",
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${postSlug(post)}/`,
    })),
  });
}
