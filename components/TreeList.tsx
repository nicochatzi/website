import React, { useEffect, useRef, useState } from 'react';
import Link from "next/link";
import styled from 'styled-components';
import { cx } from '@/lib/utils';

export interface TreeListInfo {
  url: string;
  text: string;
}

interface TreeListItemProps {
  info: TreeListInfo;
  isLast: boolean;
}

interface ListItemProps {
  $isTyping: boolean;
  $isLast: boolean;
}

const ListItem = styled.li<ListItemProps>`
  ::before {
    content: '${props => (props.$isLast || props.$isTyping) ? '└──' : '├──'} ';
  }
`;

export const TreeListItem: React.FC<TreeListItemProps & { onReady: () => void; }> = ({ info: { url, text }, onReady, isLast }) => {
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
    }, 30);
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, visibleText]);

  return (
    <ListItem
      $isTyping={isTyping}
      $isLast={isLast!}
      className={cx(
        "text-2xl my-1",
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

export interface TreeListProps {
  items: TreeListInfo[];
}

export const TreeList: React.FC<TreeListProps> = ({ items }) => {
  const index = useRef(1);
  const leafs = [{ url: '', text: '.' }, ...items];
  const [visibleLeafs, setVisibleLeafs] = useState<TreeListInfo[]>(
    leafs.slice(0, index.current)
  );

  return (
    <ul>
      {visibleLeafs.map((props, i) => (
        <TreeListItem
          key={i}
          info={props}
          isLast={i === visibleLeafs.length - 1}
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
