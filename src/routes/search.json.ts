import { getCollection } from "astro:content";

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

export async function GET() {
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );

  const index = posts.map((post) => ({
    title: post.data.title,
    description: post.data.description,
    tags: post.data.tags,
    date: post.data.pubDate.toISOString(),
    url: `/blog/${post.id}/`,
    body: plain(post.body),
  }));

  return new Response(JSON.stringify(index), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
