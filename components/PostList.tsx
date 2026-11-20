import Link from "next/link";
import { Tags } from "@/components/Tag";
import { formatDate } from "@/lib/formatDate";
import type { MDXFrontMatter } from "@/lib/types";

interface PostListProps {
  posts: Array<MDXFrontMatter>;
}

export const PostList: React.FC<PostListProps> = ({ posts }) => (
  <ul>
    {posts.map((post) => (
      <li
        key={post.slug}
        className="border-t border-gray-300/50 py-4 dark:border-gray-700"
      >
        <article className="flex flex-col items-start gap-1.5 sm:flex-row sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <h2 className="text-xl leading-snug font-bold text-link hover:text-heading">
              <Link href={`/posts/${post.slug}`}>{post.title}</Link>
            </h2>
            <time
              dateTime={post.date}
              className="mt-1 block text-sm text-muted"
            >
              {"∟ "}
              {formatDate(post.date)}
            </time>
          </div>
          {post.tags?.length ? (
            <div className="flex flex-wrap gap-x-3 sm:max-w-2/5 sm:shrink-0 sm:justify-end">
              <Tags post={post} />
            </div>
          ) : null}
        </article>
      </li>
    ))}
  </ul>
);
