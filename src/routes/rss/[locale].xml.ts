import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import config from "virtual:astro-blog-theme/config";
import { getPosts } from "../../posts";
import { postSlug, locales } from "../../i18n";

export function getStaticPaths() {
  return locales.map((locale: string) => ({ params: { locale } }));
}

export async function GET(context: APIContext) {
  const locale = context.params.locale as string;
  if (!locales.includes(locale)) return new Response(null, { status: 404 });

  const posts = await getPosts(locale);
  const label = config.localeLabels?.[locale] ?? locale.toUpperCase();
  const lang = (config.localeMeta?.[locale] ?? locale).replace("_", "-");

  return rss({
    title: `${config.title} (${label})`,
    description: config.description,
    site: context.site ?? "https://example.com",
    customData: `<language>${lang}</language>`,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${postSlug(post)}/`,
      categories: post.data.tags,
    })),
  });
}
