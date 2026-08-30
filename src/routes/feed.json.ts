import type { APIContext } from "astro";
import config from "virtual:astro-blog-theme/config";
import { getPosts } from "../posts";
import { postSlug, defaultLocale } from "../i18n";

/** https://jsonfeed.org — JSON Feed 1.1, default-locale posts. */
export async function GET(context: APIContext) {
  const base = context.site ?? new URL("https://example.com");
  const posts = await getPosts(defaultLocale);

  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: config.title,
    description: config.description,
    home_page_url: new URL("/", base).href,
    feed_url: new URL("/feed.json", base).href,
    language: defaultLocale,
    ...(config.author ? { authors: [{ name: config.author }] } : {}),
    items: posts.map((post) => {
      const url = new URL(`/blog/${postSlug(post)}/`, base).href;
      return {
        id: url,
        url,
        title: post.data.title,
        summary: post.data.description,
        date_published: post.data.pubDate.toISOString(),
        ...(post.data.updatedDate
          ? { date_modified: post.data.updatedDate.toISOString() }
          : {}),
        ...(post.data.tags.length ? { tags: post.data.tags } : {}),
      };
    }),
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: { "content-type": "application/feed+json; charset=utf-8" },
  });
}
