import type { InferGetStaticPropsType } from "next";
import { Page } from "@/components/Page";
import { TreeList } from "@/components/TreeList";
import { appLinks } from "@/data/apps";
import { getPublishedPosts } from "@/lib/mdx";
import { getProjectTree } from "@/lib/projectTree";

export async function getStaticProps() {
  const posts = getPublishedPosts().map(({ frontMatter }) => ({
    url: `/posts/${frontMatter.slug}`,
    text: frontMatter.title,
  }));
  return { props: { posts, projects: await getProjectTree() } };
}

export default function Home({
  posts,
  projects,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Page title="htz">
      <TreeList
        speed={2}
        items={[
          { text: "apps/", children: appLinks },
          { text: "posts/", children: posts },
          { text: "projects/", children: projects },
          { url: "/about", text: "about.md" },
          { url: "/rss.xml", text: "rss.xml" },
        ]}
      />
    </Page>
  );
}
