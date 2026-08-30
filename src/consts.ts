export const SITE = {
  title: "Astro Blog Theme",
  description:
    "A clean, minimal, content-first blog theme built with Astro. Fork it and make it yours.",
  url: "https://example.com",
  author: "Erik Skopp",
  lang: "en",
  locale: "en_US",
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
] as const;

export const SOCIAL_LINKS = [
  { href: "https://github.com/eskopp/AstroBlogTheme", label: "GitHub" },
  { href: "/rss.xml", label: "RSS" },
] as const;

export const POSTS_PER_PAGE = 5;
