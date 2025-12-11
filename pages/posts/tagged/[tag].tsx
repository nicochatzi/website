import type { ParsedUrlQuery } from "node:querystring";
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { Page } from "@/components/Page";
import { PostList } from "@/components/PostList";
import { getAllMdxPosts } from "@/lib/mdx";
import type { MDXFrontMatter } from "@/lib/types";
import { slugify } from "@/lib/utils";

interface ContextProps extends ParsedUrlQuery {
  tag: string;
}

interface PostsProps {
  tag: string;
  posts: Array<MDXFrontMatter>;
}

const Posts: NextPage<PostsProps> = ({ tag, posts }) => {
  return (
    <Page title={`#${tag}`}>
      <PostList posts={posts} />
    </Page>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const mdxFiles = getAllMdxPosts().map((post) => post.frontMatter);
  return {
    paths: Array.from(new Set(mdxFiles.flatMap((file) => file.tags))).map(
      (tag) => {
        return {
          params: {
            tag: slugify(tag),
          },
        };
      },
    ),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { tag } = context.params as ContextProps;
  const mdxFiles = getAllMdxPosts().map((post) => post.frontMatter);
  return {
    props: {
      tag,
      posts: mdxFiles.filter((file) => {
        return file.tags?.includes(tag);
      }),
    },
  };
};

export default Posts;
