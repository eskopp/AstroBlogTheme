import type { APIContext } from "astro";
import config from "virtual:astro-blog-theme/config";

/**
 * RFC 9116 security.txt. Served at `/.well-known/security.txt` (and mirrored
 * at `/security.txt`). Only injected when `security.contact` is configured.
 */
export async function GET(context: APIContext) {
  const base = context.site ?? new URL("https://example.com");
  const abs = (path: string) => new URL(path, base).href;
  const sec = config.security ?? {};

  const contacts = Array.isArray(sec.contact)
    ? sec.contact
    : sec.contact
      ? [sec.contact]
      : [];

  // Expires is required by the spec; default to one year out.
  const expires =
    sec.expires ??
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  const langs = sec.preferredLanguages ?? config.locales;

  const lines: string[] = [];
  for (const c of contacts) lines.push(`Contact: ${c}`);
  lines.push(`Expires: ${expires}`);
  if (langs.length) lines.push(`Preferred-Languages: ${langs.join(", ")}`);
  if (sec.encryption) lines.push(`Encryption: ${sec.encryption}`);
  if (sec.policy) lines.push(`Policy: ${sec.policy}`);
  if (sec.acknowledgments)
    lines.push(`Acknowledgments: ${sec.acknowledgments}`);
  lines.push(`Canonical: ${abs("/.well-known/security.txt")}`);
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
