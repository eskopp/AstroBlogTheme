declare module "virtual:astro-blog-theme/config" {
  interface ThemeNavLink {
    href: string;
    label: string;
  }
  interface ThemeConfig {
    title: string;
    description: string;
    author: string;
    lang: string;
    locale: string;
    nav: ThemeNavLink[];
    social: ThemeNavLink[];
    postsPerPage: number;
  }
  const config: ThemeConfig;
  export default config;
}
