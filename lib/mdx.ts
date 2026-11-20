import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import type { GetStaticProps } from "next";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import rehypePrism from "rehype-prism-plus";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { VFile } from "vfile";
import { matter } from "vfile-matter";
import type { MDXFrontMatter } from "@/lib/types";

const root = process.cwd();
export const contentPath = path.join(root, "content");
export const postsPath = path.join(contentPath, "posts");

const getMdx = (fullPath: string) => {
  const file = new VFile(fs.readFileSync(fullPath, "utf-8"));
  matter(file, { strip: true });
  const metadata = file.data.matter;
  assert(
    metadata && typeof metadata === "object" && !Array.isArray(metadata),
    `Invalid YAML frontmatter in ${fullPath}`,
  );
  return {
    frontMatter: {
      ...metadata,
      slug: path.basename(fullPath).replace(".mdx", ""),
    } as MDXFrontMatter,
    content: String(file),
  };
};

export const getMdxContent = (fileName: string) => {
  const mdx = fs
    .readdirSync(contentPath)
    .filter((file) => fileName === file)
    .map((file) => path.join(contentPath, file))
    .map((file) => getMdx(file));
  assert(
    mdx.length === 1,
    `could not find mdx content file: ${fileName} in ${fs.readdirSync(contentPath)}`,
  );
  return mdx[0];
};

export const getPublishedPosts = () => {
  return fs
    .readdirSync(postsPath)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => path.join(postsPath, file))
    .map((file) => getMdx(file))
    .filter((post) => post.frontMatter.published === true)
    .sort(
      (a, b) =>
        new Date(b.frontMatter.date).getTime() -
        new Date(a.frontMatter.date).getTime(),
    );
};

export interface MdxProps {
  frontMatter: MDXFrontMatter;
  mdx: MDXRemoteSerializeResult;
}

export const makeGetMdxStaticProps = (fileName: string): GetStaticProps => {
  return async (_context) => {
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
