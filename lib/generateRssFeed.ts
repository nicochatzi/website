import fs from 'fs';
import RSS from 'rss';
import { getAllMdxPosts } from './mdx';

export default async function generateRssFeed() {
  const site_url = 'https://htz.dev';
  const feedOptions = {
    title: 'htz.dev | posts',
    description: 'news, notes and posts about code',
    site_url: site_url,
    feed_url: `${site_url}/rss.xml`,
    image_url: `${site_url}/images/aud.gif`,
    pubDate: new Date(),
    copyright: `All rights reserved ${new Date().getFullYear()}, nico`,
  };

  const feed = new RSS(feedOptions);

  getAllMdxPosts()
    .filter(post => post.frontMatter.published)
    .map(post => {
      feed.item({
        title: post.frontMatter.title,
        description: post.frontMatter.description || '',
        url: `${site_url}/posts/${post.frontMatter.slug}`,
        date: post.frontMatter.date,
      });
    });

  fs.writeFileSync('./public/rss.xml', feed.xml({ indent: true }));
}
