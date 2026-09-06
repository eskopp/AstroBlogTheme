import type { APIContext } from "astro";
import config from "virtual:astro-blog-theme/config";
import { getPosts } from "../posts";
import { postSlug, defaultLocale } from "../i18n";

/**
 * https://llmstxt.org — like `/llms.txt`, but with every post's full text
 * inlined so a model has the whole site in one request.
 */
export async function GET(context: APIContext) {
  const base = context.site ?? new URL("https://example.com");
  const abs = (path: string) => new URL(path, base).href;
  const posts = await getPosts(defaultLocale);

  const lines: string[] = [
    `# ${config.title}`,
    "",
    `> ${config.description}`,
    "",
  ];

  for (const post of posts) {
    const url = abs(`/blog/${postSlug(post)}/`);
    const date = post.data.pubDate.toISOString().slice(0, 10);
    lines.push(
      "---",
      "",
      `## ${post.data.title}`,
      "",
      `${url} · ${date}`,
      "",
      (post.body ?? "").trim(),
      "",
    );
  }

  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
