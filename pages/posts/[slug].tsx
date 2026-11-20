import type { ParsedUrlQuery } from "node:querystring";
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Link from "next/link";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import rehypePrism from "rehype-prism-plus";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { MDX } from "@/components/MDX";
import { Page } from "@/components/Page";
import { Prose } from "@/components/Prose";
import Socials from "@/components/Socials";
import { Tags } from "@/components/Tag";
import { formatDate } from "@/lib/formatDate";
import { getPublishedPosts } from "@/lib/mdx";
import type { MDXFrontMatter } from "@/lib/types";
import { cx } from "@/lib/utils";

interface ContextProps extends ParsedUrlQuery {
  slug: string;
}

interface PostProps {
  frontMatter: MDXFrontMatter;
  mdx: MDXRemoteSerializeResult;
  previous: MDXFrontMatter | null;
  next: MDXFrontMatter | null;
}

const FollowPost: React.FC<{
  post: MDXFrontMatter;
  direction: "left" | "right";
}> = ({ post, direction }) => {
  return (
    <div
      className={
        direction === "left"
          ? "col-start-1 text-left"
          : "col-start-2 text-right"
      }
    >
      <p className={cx("mb-2 uppercase tracking-wider text-m", "text-muted")}>
        {direction === "left" ? "←-----" : "-----→"}
      </p>
      <Link
        href={`/posts/${post.slug}`}
        className="font-bold text-link hover:text-heading"
      >
        {post.title}
      </Link>
      <time dateTime={post.date} className="block mb-4 text-muted">
        {"∟ "}
        {formatDate(post.date)}
      </time>
      {post.tags ? (
        <div
          className={cx(
            "flex flex-wrap gap-x-3",
            direction === "right" && "justify-end",
          )}
        >
          <Tags post={post} />
        </div>
      ) : null}
    </div>
  );
};

const Post: NextPage<PostProps> = ({ frontMatter, mdx, previous, next }) => {
  return (
    <>
      <Page {...frontMatter}>
        <div className="mb-8 flex flex-wrap justify-end gap-x-3 border-b border-gray-300/50 pb-2 dark:border-gray-700">
          <Tags post={frontMatter} />
        </div>
        <Prose>
          <MDX mdx={mdx} />
        </Prose>
        {previous || next ? (
          <nav
            className={cx(
              "mt-8 pt-8 grid grid-cols-2 gap-8 border-t",
              "border-gray-200",
              "dark:border-gray-700",
            )}
          >
            {previous ? (
              <FollowPost post={previous} direction={"left"} />
            ) : null}
            {next ? <FollowPost post={next} direction={"right"} /> : null}
          </nav>
        ) : null}
      </Page>
      <Socials />
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: getPublishedPosts().map((post) => ({
      params: { slug: post.frontMatter.slug },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { slug } = context.params as ContextProps;
  const mdxFiles = getPublishedPosts();
  const postIndex = mdxFiles.findIndex(
    (post) => post.frontMatter.slug === slug,
  );
  if (postIndex === -1) return { notFound: true };
  const post = mdxFiles[postIndex];
  const { frontMatter, content } = post;
  const mdxContent = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypePrism, rehypeSlug],
    },
    scope: frontMatter,
  });
  const getPostLink = (i: number) => {
    return mdxFiles[i]?.frontMatter ?? null;
  };
  return {
    props: {
      frontMatter,
      mdx: mdxContent,
      previous: getPostLink(postIndex + 1),
      next: getPostLink(postIndex - 1),
    },
  };
};

export default Post;
