import Link from "next/link";
import { formatDate } from "@/lib/formatDate";
import type { MDXFrontMatter } from "@/lib/types";
import { Prose } from "@/components/Prose";
import { cx, slugify } from "@/lib/utils";
import { Tag } from "./Tag";

interface PostListProps {
  posts: Array<MDXFrontMatter>;
}

export const PostList: React.FC<PostListProps> = ({ posts }) => {
  return (
    <ul>
      {posts.map((post, index) => (
        <li className="py-4" key={index}>
          <article className="flex justify-between items-center py-0" >
            <div>
              <h2 className={cx(
                "font-bold text-xl",
                "text-purple hover:text-red-pale",
                "dark:text-teal-deep dark:hover:text-yellow"
              )} >
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <time className={cx(
                "block mb-4",
                "text-gray-500",
                "dark:text-gray-500"
              )}
              >
                {"∟ "}{formatDate(post.date)}
              </time>
            </div>
            {post.tags ? (
              <div className="mb-8 flex gap-1">
                {post.tags.map((tag, i) => (<Tag key={i} href={`/blog/tagged/${slugify(tag)}`}>{tag}</Tag>))}
              </div>
            ) : null}
          </article>
        </li>
      ))}
    </ul>
  );
};
