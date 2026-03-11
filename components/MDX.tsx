import Image from "next/image";
import Link from "next/link";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import { MDXRemote } from "next-mdx-remote";
import type React from "react";
import { cx } from "@/lib/utils";
import ExpandingSection from "./ExpandingSection";
import { Note } from "./Note";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

const createCustomHeader = (Tag: HeadingTag) => {
  const Header = ({
    id,
    ...rest
  }: React.HTMLAttributes<HTMLHeadingElement> & { id?: string }) => {
    if (id) {
      return (
        <Link href={`#${id}`}>
          <Tag
            id={id}
            className={cx(
              "",
              "text-purple hover:text-red-pale",
              "dark:text-teal-deep dark:hover:text-yellow",
            )}
            {...rest}
          />
        </Link>
      );
    }
    return <Tag {...rest} />;
  };
  Header.displayName = `CustomHeader(${Tag})`;
  return Header;
};

export const components = {
  Image,
  Note,
  h1: createCustomHeader("h1"),
  h2: createCustomHeader("h2"),
  h3: createCustomHeader("h3"),
  h4: createCustomHeader("h4"),
  ExpandingSection,
};

export const MDX: React.FC<{ mdx: MDXRemoteSerializeResult }> = ({ mdx }) => (
  <MDXRemote {...mdx} components={components} />
);
