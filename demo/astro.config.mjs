import { defineConfig } from "astro/config";
import blogTheme from "astro-blog-theme";

export default defineConfig({
  site: "https://example.com",
  integrations: [
    blogTheme({
      title: "Demo Blog",
      description: "Demo app for astro-blog-theme.",
      author: "Erik Skopp",
      locales: ["en", "de"],
      nav: [
        { href: "/", label: "Home" },
        { href: "/blog", label: "Blog" },
        { href: "/about", label: "About" },
      ],
      social: [
        { href: "https://github.com/eskopp/AstroBlogTheme", label: "GitHub" },
        { href: "/rss.xml", label: "RSS" },
      ],
    }),
  ],
});
