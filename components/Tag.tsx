import Link from "next/link";
import { MDXFrontMatter } from "@/lib/types";
import { cx, slugify } from "@/lib/utils";

interface TagProps {
  href: string;
  children: string;
}

export const Tag: React.FC<TagProps> = ({ href, children }) => {
  return (
    <Link
      href={href}
      style={{ boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' }}
      className={cx(
        "inline-block text-sm py-0.5 px-2.5 rounded-full border box-shadow",
        "bg-gray-200 border-none text-gray-900 hover:bg-gray-800 hover:text-gray-100",
        "dark:bg-gray-900 dark:border-none dark:text-gray-200 dark:hover:bg-gray-300  dark:hover:text-gray-950"
      )}
    >
      #{slugify(children)}
    </Link>
  );
};

export const Tags: React.FC<{ post: MDXFrontMatter }> = ({ post }) =>
  post.tags?.map((tag, i) => (<Tag key={i} href={`/posts/tagged/${slugify(tag)}`}>{tag}</Tag>));
