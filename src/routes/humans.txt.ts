import type { APIContext } from "astro";
import config from "virtual:astro-blog-theme/config";

/** https://humanstxt.org — the people and tools behind the site. */
export async function GET(context: APIContext) {
  const site = (context.site ?? new URL("https://example.com")).origin;
  const today = new Date().toISOString().slice(0, 10);

  const lines = ["/* TEAM */"];
  if (config.author) lines.push(`  Name: ${config.author}`);
  lines.push(
    `  Site: ${site}`,
    "",
    "/* SITE */",
    `  Last update: ${today}`,
    `  Language: ${config.locales.join(", ")}`,
    "  Built with: Astro, astro-blog-theme",
    "",
  );

  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
