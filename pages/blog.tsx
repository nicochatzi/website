import type { GetStaticProps, NextPage } from "next";
import { getAllMdx } from "@/lib/mdx";
import { MDXFrontMatter } from "@/lib/types";
import { Page } from "@/components/Page";
import { PostList } from "@/components/PostList";

interface HomeProps {
  posts: Array<MDXFrontMatter>;
}

const Blog: NextPage<HomeProps> = ({ posts }) => {
  return (
    <>
      <Page
        title="blog"
        description={""}
      >
        <PostList posts={posts} />
      </Page >
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      posts: getAllMdx().filter(post => post["frontMatter"].published).map((post) => post["frontMatter"]),
    },
  };
};

export default Blog;
