import type { SiteConfig } from "@/lib/types";

const siteConfig: SiteConfig = {
  avatar: "/avatar.png",
  siteUrl: "https://htz.dev",
  siteName: "htz.dev",
  siteDescription: "htz.dev",
  siteThumbnail: "/og-image.png",
  nav: [
    { label: "blog", href: "/" },
    { label: "about", href: "/about" },
  ],
  social: {
    github: "https://github.com/nicochatzi",
    linkedin: "https://www.linkedin.com/in/nicolas-chatzigianis/",
  },
};

export default siteConfig;
