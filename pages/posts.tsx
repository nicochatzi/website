import type { GetStaticProps, NextPage } from "next";
import { getAllMdxPosts } from "@/lib/mdx";
import { MDXFrontMatter } from "@/lib/types";
import { Page } from "@/components/Page";
import { PostList } from "@/components/PostList";
import Socials from "@/components/Socials";

interface HomeProps {
  posts: Array<MDXFrontMatter>;
}

const PostsPage: NextPage<HomeProps> = ({ posts }) => {
  return (
    <>
      <Page
        title="posts"
        description={""}
      >
        <PostList posts={posts} />
      </Page >
      <Socials />
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      posts: getAllMdxPosts()
        .filter(post => post.frontMatter.published)
        .map(post => post.frontMatter),
    },
  };
};

export default PostsPage;
