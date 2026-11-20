import Link from "next/link";
import type { MDXFrontMatter } from "@/lib/types";
import { slugify } from "@/lib/utils";

interface TagProps {
  href: string;
  children: string;
}

export const Tag: React.FC<TagProps> = ({ href, children }) => {
  return (
    <Link
      href={href}
      className="inline-flex min-h-6 items-center text-sm text-muted underline decoration-current/50 underline-offset-3 hover:text-link"
    >
      #{slugify(children)}
    </Link>
  );
};

export const Tags: React.FC<{ post: MDXFrontMatter }> = ({ post }) =>
  post.tags?.map((tag) => (
    <Tag key={tag} href={`/posts/tagged/${slugify(tag)}`}>
      {tag}
    </Tag>
  ));
