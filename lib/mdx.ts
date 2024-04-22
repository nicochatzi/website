import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { MDXFrontMatter } from "@/lib/types";

const root = process.cwd();
export const contentPath = path.join(root, "content");
export const postsPath = path.join(contentPath, "posts");

export const getMdx = (fullPath: string) => {
  const { data, content } = matter(fs.readFileSync(fullPath, "utf-8"));
  return {
    frontMatter: {
      ...data,
      slug: path.basename(fullPath).replace(".mdx", ""),
    } as MDXFrontMatter,
    content,
  };
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
