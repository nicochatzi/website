import fs from "node:fs";
import RSS from "rss";
import { apps } from "@/data/apps";
import siteConfig from "@/data/siteConfig";
import type { getPublishedPosts } from "./mdx";

const feedPath = "./public/rss.xml";
const lastBuildDate = /<lastBuildDate>([^<]*)<\/lastBuildDate>/;
type PublishedPosts = ReturnType<typeof getPublishedPosts>;

function renderFeed(posts: PublishedPosts, updated: Date) {
  const site_url = siteConfig.siteUrl;
  const feedOptions = {
    title: "htz.dev | posts and apps",
    description: "posts about code and interactive apps",
    site_url: site_url,
    feed_url: `${site_url}/rss.xml`,
    image_url: `${site_url}/images/aud.gif`,
    pubDate: updated,
    copyright: `All rights reserved ${updated.getUTCFullYear()}, nico`,
  };

  const feed = new RSS(feedOptions);

  const items = [
    ...posts.map(({ frontMatter }) => ({
      title: frontMatter.title,
      description: frontMatter.description || "",
      url: `${site_url}/posts/${frontMatter.slug}`,
      date: frontMatter.date,
    })),
    ...apps.map((app) => ({
      title: app.title,
      description: app.description,
      url: `${site_url}/apps/${app.slug}`,
      date: app.publishedAt,
      categories: ["apps"],
    })),
  ];
  items.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  for (const item of items) feed.item(item);

  // rss always inserts the current clock time here, even with pubDate set.
  return feed
    .xml({ indent: true })
    .replace(
      lastBuildDate,
      `<lastBuildDate>${updated.toUTCString()}</lastBuildDate>`,
    );
}

export default function generateRssFeed(posts: PublishedPosts) {
  const previous = fs.existsSync(feedPath)
    ? fs.readFileSync(feedPath, "utf8")
    : "";
  const lastUpdate = new Date(previous.match(lastBuildDate)?.[1] ?? "");
  if (
    Number.isFinite(lastUpdate.getTime()) &&
    renderFeed(posts, lastUpdate) === previous
  ) {
    return;
  }

  fs.writeFileSync(feedPath, renderFeed(posts, new Date()));
}
