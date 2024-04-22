import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { MDXFrontMatter } from "@/lib/types";

const root = process.cwd();

export const getMdx = (relativePath: string) => {
  const fullPath = path.join(root, relativePath);
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
  const getMdxPost = (file: string) => getMdx(path.join("posts", file));
  return fs.readdirSync(path.join(root, "posts")).map((file) => getMdxPost(file)).sort(
    (a, b) =>
      new Date(b.frontMatter.date).getTime() -
      new Date(a.frontMatter.date).getTime()
  );
}
