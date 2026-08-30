import type { APIContext } from "astro";
import config from "virtual:astro-blog-theme/config";
import { getAllPosts, type Post } from "../../posts";
import { postSlug } from "../../i18n";

export async function getStaticPaths() {
  const all = await getAllPosts();
  return all.map((post) => ({ params: { slug: postSlug(post) }, props: { post } }));
}

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/** Naive word wrap into at most `maxLines` lines of ~`maxChars` characters. */
function wrap(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > maxChars && line) {
      lines.push(line);
      line = w;
    } else {
      line = (line + " " + w).trim();
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, "") + "…";
  }
  return lines;
}

export function GET({ props }: APIContext) {
  const post = props.post as Post;
  const lines = wrap(post.data.title, 24, 3);
  const startY = 300 - (lines.length - 1) * 39;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#08090a"/>
  <path d="M96 96l40 130-40-24-40 24z" fill="#7c8aff"/>
  <text x="96" y="${startY}" fill="#f7f8f8" font-family="Inter, system-ui, sans-serif" font-size="64" font-weight="600" letter-spacing="-2">${lines
    .map((l, i) => `<tspan x="96" dy="${i === 0 ? 0 : 78}">${esc(l)}</tspan>`)
    .join("")}</text>
  <text x="96" y="560" fill="#8a8f98" font-family="Inter, system-ui, sans-serif" font-size="30" font-weight="500">${esc(
    config.title,
  )}</text>
</svg>`;

  return new Response(svg, {
    headers: { "content-type": "image/svg+xml; charset=utf-8" },
  });
}
