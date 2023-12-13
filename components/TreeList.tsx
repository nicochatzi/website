import React, { useEffect, useRef, useState } from 'react';
import Link from "next/link";
import styled from 'styled-components';
import { cx } from '@/lib/utils';

export interface TreeListItemProps {
  isRoot?: boolean;
  isLast?: boolean;
  withTrunk?: boolean;
  depth: number;
  url?: string;
  text: string;
  children?: React.ReactNode;
}

interface TreeListItemExtendedProps extends TreeListItemProps {
  isTyping: boolean;
}

const getBulletContent = (props: TreeListItemExtendedProps): string =>
  [...Array(props.depth)].reduce(
    (prefix) => `${props.withTrunk ? '│' : ' '}   ${prefix}`,
    props.isRoot ? '.' : props.isLast ? '└──' : props.isTyping ? '└──' : '├──'
  );

const ListItem = styled.li<TreeListItemExtendedProps>`
  ::before {
    content: '${getBulletContent} ';
  }
`;

export const TreeListItem: React.FC<TreeListItemProps & { onReady: () => void; }> = ({ children, url, text, onReady, ...props }) => {
  const index = useRef(0);
  const [visibleText, setVisibleText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (index.current < text?.length) {
        const cursor = index.current < text.length - 1 ? '|' : '';
        setVisibleText(text.slice(0, index.current + 1) + cursor);
        index.current += 1;
      } else {
        setIsTyping(false);
        onReady();
      }
    }, 50);

    return () => clearTimeout(timeout);
  }, [visibleText]);

  return (
    <ListItem isTyping={isTyping} text={text} {...props} className={cx(
      "text-4xl my-6",
      "text-purple hover:text-red-pale",
      "dark:text-teal-deep dark:hover:text-gray-200"
    )}>
      {url ? (
        <Link href={url} itemProp="url">
          {visibleText}
        </Link>
      ) : (
        <>{visibleText}</>
      )}
    </ListItem>
  );
};

export const TreeList: React.FC<{ items: TreeListItemProps[] }> = ({ items }) => {
  const index = useRef(1);
  const leafs = [{ isRoot: true, text: '.', depth: 0 }, ...items];
  const [visibleLeafs, setVisibleLeafs] = useState<TreeListItemProps[]>(
    leafs.slice(0, index.current)
  );

  return (
    <ul>
      {visibleLeafs.map((leafProps) => (
        <TreeListItem
          {...leafProps}
          onReady={() => {
            if (index.current < leafs.length) {
              setVisibleLeafs(leafs.slice(0, index.current + 1));
              index.current += 1;
            }
          }}
        />
      ))}
    </ul>
  );
};
