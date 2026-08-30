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
      legal: [
        { href: "/impressum", label: "Impressum" },
        { href: "/datenschutz", label: "Datenschutz" },
      ],
      license: { label: "CC BY-ND 4.0", href: "https://creativecommons.org/licenses/by-nd/4.0/deed.de" },
      social: [
        { href: "https://github.com/eskopp/AstroBlogTheme", label: "GitHub" },
        { href: "/rss.xml", label: "RSS" },
      ],
    }),
  ],
});
