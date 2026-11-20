import fs from "node:fs";
import RSS from "rss";
import type { getPublishedPosts } from "./mdx";

const feedPath = "./public/rss.xml";
const lastBuildDate = /<lastBuildDate>([^<]*)<\/lastBuildDate>/;
type PublishedPosts = ReturnType<typeof getPublishedPosts>;

function renderFeed(posts: PublishedPosts, updated: Date) {
  const site_url = "https://htz.dev";
  const feedOptions = {
    title: "htz.dev | posts",
    description: "news, notes and posts about code",
    site_url: site_url,
    feed_url: `${site_url}/rss.xml`,
    image_url: `${site_url}/images/aud.gif`,
    pubDate: updated,
    copyright: `All rights reserved ${updated.getUTCFullYear()}, nico`,
  };

  const feed = new RSS(feedOptions);

  posts.forEach((post) => {
    feed.item({
      title: post.frontMatter.title,
      description: post.frontMatter.description || "",
      url: `${site_url}/posts/${post.frontMatter.slug}`,
      date: post.frontMatter.date,
    });
  });

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
