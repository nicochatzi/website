import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { MDXFrontMatter } from "@/lib/types";
import assert from "assert";
import { serialize } from "next-mdx-remote/serialize";
import rehypePrism from "rehype-prism-plus";
import remarkGfm from "remark-gfm";
import rehypeSlug from 'rehype-slug';
import { GetStaticProps } from "next";

const root = process.cwd();
export const contentPath = path.join(root, "content");
export const postsPath = path.join(contentPath, "posts");

const getMdx = (fullPath: string) => {
  const { data, content } = matter(fs.readFileSync(fullPath, "utf-8"));
  return {
    frontMatter: {
      ...data,
      slug: path.basename(fullPath).replace(".mdx", ""),
    } as MDXFrontMatter,
    content,
  };
};

export const getMdxContent = (fileName: string) => {
  const mdx = fs.readdirSync(contentPath)
    .filter((file) => fileName === file)
    .map((file) => path.join(contentPath, file))
    .map((file) => getMdx(file));
  assert(mdx.length === 1, `could not find mdx content file: ${fileName} in ${fs.readdirSync(contentPath)}`);
  return mdx[0];
};

export const getAllMdxPosts = () => {
  return fs.readdirSync(postsPath)
    .map((file) => path.join(postsPath, file))
    .map((file) => getMdx(file)).sort(
      (a, b) =>
        new Date(b.frontMatter.date).getTime() -
        new Date(a.frontMatter.date).getTime()
    );
}

export interface MdxProps {
  frontMatter: MDXFrontMatter;
  mdx: any;
};

export const makeGetMdxStaticProps = (fileName: string): GetStaticProps => {
  return async (context) => {
    const { frontMatter, content } = getMdxContent(fileName);
    const mdxContent = await serialize(content, {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypePrism, rehypeSlug],
      },
      scope: frontMatter,
    });
    return {
      props: {
        frontMatter,
        mdx: mdxContent,
      },
    };
  };
};
