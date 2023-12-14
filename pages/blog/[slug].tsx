import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { ParsedUrlQuery } from "querystring";
import Link from "next/link";
import { serialize } from "next-mdx-remote/serialize";
import { MDXRemote } from "next-mdx-remote";
import rehypePrism from "rehype-prism-plus";
import { getAllMdx } from "@/lib/mdx";
import { MDXFrontMatter } from "@/lib/types";
import { Page } from "@/components/Page";
import { components } from "@/components/MDX";
import { Prose } from "@/components/Prose";
import { cx, slugify } from "@/lib/utils";
import remarkGfm from "remark-gfm";
import { formatDate } from "@/lib/formatDate";
import { Tags } from "@/components/Tag";
import Socials from "@/components/Socials";
interface ContextProps extends ParsedUrlQuery {
  slug: string;
}

interface PostProps {
  frontMatter: MDXFrontMatter;
  mdx: any;
  previous: MDXFrontMatter | null;
  next: MDXFrontMatter | null;
}

const FollowPost: React.FC<{ post: MDXFrontMatter, direction: "left" | "right" }> = ({ post, direction }) => {
  return (
    <div className={direction === "left" ? "col-start-1 text-left" : "col-start-2 text-right"}>
      <p className={cx(
        "mb-2 uppercase tracking-wider text-m",
        "text-gray-300",
        "dark:text-gray-500"
      )}>
        {direction === "left" ? "←-----" : "-----→"}
      </p>
      <Link href={`/blog/${post.slug}`} className={cx(
        "font-bold",
        "text-purple hover:text-red-pale",
        "dark:text-teal-deep dark:hover:text-yellow"
      )}>
        {post.title}
      </Link>
      <time className={cx(
        "block mb-4",
        "text-gray-500",
        "dark:text-gray-500"
      )}>
        {"∟ "}{formatDate(post.date)}
      </time>
      {post.tags ? (
        <div className="">
          <Tags post={post} />
        </div>
      ) : null}
    </div >
  );
};

const Post: NextPage<PostProps> = ({ frontMatter, mdx, previous, next }) => {
  return (
    <>
      <Page {...frontMatter}>
        <div className="-mt-12 mb-12 flex gap-1 flex-row-reverse">
          <Tags post={frontMatter} />
        </div>
        <Prose>
          <MDXRemote {...mdx} components={components} />
        </Prose>
        {previous || next ? (
          <nav
            className={cx(
              "mt-8 pt-8 grid grid-cols-2 gap-8 border-t",
              "border-gray-200",
              "dark:border-gray-700"
            )}
          >
            {previous ? (
              <FollowPost post={previous!} direction={"left"} />
            ) : null}
            {next ? (
              <FollowPost post={next!} direction={"right"} />
            ) : null}
          </nav>
        ) : null}
      </Page>
      <Socials />
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const mdxFiles = getAllMdx();
  return {
    paths: mdxFiles.map((file) => ({
      params: { slug: file.frontMatter.slug },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { slug } = context.params as ContextProps;
  const mdxFiles = getAllMdx();
  const postIndex = mdxFiles.findIndex((p) => p.frontMatter.slug === slug);
  const post = mdxFiles[postIndex];
  const { frontMatter, content } = post;
  const mdxContent = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypePrism],
    },
    scope: frontMatter,
  });
  return {
    props: {
      frontMatter,
      mdx: mdxContent,
      previous: mdxFiles[postIndex + 1]?.frontMatter || null,
      next: mdxFiles[postIndex - 1]?.frontMatter || null,
    },
  };
};

export default Post;
