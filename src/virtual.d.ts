declare module "virtual:astro-blog-theme/config" {
  interface ThemeNavLink {
    href: string;
    label: string;
  }
  interface ThemeConfig {
    title: string;
    description: string;
    author: string;
    locale: string;
    locales: string[];
    defaultLocale: string;
    localeMeta: Record<string, string>;
    localeLabels: Record<string, string>;
    localeHome: Record<string, string>;
    errorLocale: string | null;
    ui: Record<string, Record<string, string>>;
    nav: ThemeNavLink[];
    social: ThemeNavLink[];
    legal: ThemeNavLink[];
    license: { label: string; href: string } | null;
    postsPerPage: number;
    search: boolean;
    toc: boolean;
    mermaid: boolean;
  }
  const config: ThemeConfig;
  export default config;
}
