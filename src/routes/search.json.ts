import type { APIContext } from "astro";
import { getPosts } from "../posts";
import { localeFromPath, localeHref, postSlug } from "../i18n";

function plain(markdown: string | undefined): string {
  if (!markdown) return "";
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 2000);
}

export async function GET(context: APIContext) {
  const locale = localeFromPath(context.url.pathname);
  const posts = await getPosts(locale);

  const index = posts.map((post) => ({
    title: post.data.title,
    description: post.data.description,
    tags: post.data.tags,
    date: post.data.pubDate.toISOString(),
    url: localeHref(locale, `/blog/${postSlug(post.id)}/`),
    body: plain(post.body),
  }));

  return new Response(JSON.stringify(index), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
