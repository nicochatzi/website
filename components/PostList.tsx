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
    <ul
      className={cx(
        "my-0",
        "divide-gray-200",
        "dark:divide-gray-800"
      )}
    >
      {posts.map((post, index) => (
        <li className="py-4" key={index}>
          <article className="flex justify-between items-center py-0" >
            <div>
              <h2 className={cx(
                "font-bold text-xl",
                "text-purple hover:text-red-pale",
                "dark:text-teal dark:hover:text-yellow"
              )} >
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>

              <time
                className={cx(
                  "block mb-4",
                  "text-gray-500",
                  "dark:text-gray-500"
                )}
              >
                {"∟ "}{formatDate(post.date)}
              </time>
            </div>

            {post.description ? (
              <div className="mt-1">
                <Prose>
                  <p>{post.description}</p>
                </Prose>
              </div>
            ) : null}

            {post.tags ? (
              <div className="mb-8 flex gap-2">
                {post.tags.map((tag) => {
                  return (
                    <div>
                      <Tag href={`/blog/tagged/${slugify(tag)}`}>{tag}</Tag>
                    </div>
                  );
                })}
              </div>
            ) : null}

          </article>
        </li>
      ))}
    </ul>
  );
};
