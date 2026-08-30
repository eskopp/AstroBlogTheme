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
    ui: Record<string, Record<string, string>>;
    nav: ThemeNavLink[];
    social: ThemeNavLink[];
    postsPerPage: number;
    search: boolean;
  }
  const config: ThemeConfig;
  export default config;
}
