import Image from "next/image";
import { Note } from "./Note";
import Link from "next/link";
import { cx } from "@/lib/utils";
import { MDXRemote } from "next-mdx-remote";

const createCustomHeader = (Tag: any) => {
  const Header = ({ id, ...rest }: any) => {
    if (id) {
      return (
        <Link href={`#${id}`}>
          <Tag id={id} className={cx(
            "",
            "text-purple hover:text-red-pale",
            "dark:text-teal-deep dark:hover:text-yellow"
          )} {...rest} />
        </Link >
      );
    }
    return <Tag {...rest} />;
  };
  Header.displayName = `CustomHeader(${Tag.displayName || Tag.name || 'Tag'})`;
  return Header;
};

export const components = {
  Image,
  Note,
  h1: createCustomHeader('h1'),
  h2: createCustomHeader('h2'),
  h3: createCustomHeader('h3'),
  h4: createCustomHeader('h4'),
};


export const MDX: React.FC<{ mdx: any }> = ({ mdx }) =>
  <MDXRemote {...mdx} components={components} />;
