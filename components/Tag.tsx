import Link from "next/link";
import { cx, slugify } from "@/lib/utils";

interface TagProps {
  href: string;
  children: string;
}

export const Tag: React.FC<TagProps> = ({ href, children }) => {
  return (
    <Link
      href={href}
      className={cx(
        "inline-block text-sm py-0.5 px-1.5 rounded-full border",
        "bg-gray-200 border-none text-gray-900 hover:bg-gray-800 hover:text-gray-100",
        "dark:bg-gray-900 dark:border-none dark:text-gray-200 dark:hover:bg-gray-300  dark:hover:text-gray-950"
      )}
    >
      #{slugify(children)}
    </Link>
  );
};
