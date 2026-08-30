import type { APIContext } from "astro";
import config from "virtual:astro-blog-theme/config";
import { getPosts } from "../posts";
import { localeFromPath, localeHref, postSlug, defaultLocale } from "../i18n";

/** https://llmstxt.org — a markdown map of the site for language models. */
export async function GET(context: APIContext) {
  const locale = localeFromPath(context.url.pathname);
  const base = context.site ?? new URL("https://example.com");
  const abs = (path: string) => new URL(path, base).href;

  const posts = await getPosts(locale);
  const title =
    locale === defaultLocale ? config.title : `${config.title} (${locale})`;

  const lines: string[] = [
    `# ${title}`,
    "",
    `> ${config.description}`,
    "",
    `## Pages`,
    "",
    `- [Blog](${abs(localeHref(locale, "/blog/"))}): all posts`,
    `- [Tags](${abs(localeHref(locale, "/tags/"))}): posts by tag`,
    `- [RSS feed](${abs(localeHref(locale, "/rss.xml"))})`,
    "",
    `## Posts`,
    "",
  ];

  for (const post of posts) {
    const url = abs(localeHref(locale, `/blog/${postSlug(post.id)}/`));
    const date = post.data.pubDate.toISOString().slice(0, 10);
    lines.push(`- [${post.data.title}](${url}): ${post.data.description} (${date})`);
  }
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
