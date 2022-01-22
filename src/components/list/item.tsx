import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'gatsby';
import styled from 'styled-components';
import Theme from '../../theme';

const { colors, fonts, fontSizes, lineHeights } = Theme;

const symbols = {
  root: '.',
  trunk: '│',
  branch: '├──',
  leaf: '└──',
};

export interface TreeListItemProps {
  isRoot?: boolean;
  isLast?: boolean;
  withTrunk?: boolean;
  depth: number;
  url?: string;
  text: string;
}

interface TreeListItemExtendedProps extends TreeListItemProps {
  isTyping: boolean;
}

const getBulletContent = (props: TreeListItemExtendedProps): string => {
  let prefix = props.isRoot
    ? symbols.root
    : props.isLast
    ? symbols.leaf
    : props.isTyping
    ? symbols.leaf
    : symbols.branch;

  for (let i = 0; i < props.depth; i++) {
    prefix = `${props.withTrunk ? symbols.trunk : ' '}   ${prefix}`;
  }

  return prefix;
};

const ItemStyle = styled.li<TreeListItemExtendedProps>`
  margin: 0.5rem;

  ::before {
    font-family: ${fonts.code};
    margin-left: -0.5rem;
    color: ${colors.brown};
    font-size: ${fontSizes[7]};
    line-height: 0;
    white-space: pre;
    content: '${getBulletContent} ';
  }

  a {
    color: ${colors.yellow};
    text-decoration: none;
    font-family: ${fonts.code};
    font-size: ${fontSizes[6]};
    line-height: ${lineHeights.tight};
  }

  a:hover,
  a:focus {
    text-decoration: none;
    color: ${colors.blue};
  }
`;

interface TreeListCallback {
  onReady: () => void;
}

const TreeListItem: React.FC<TreeListItemProps & TreeListCallback> = ({
  children,
  url,
  text,
  onReady,
  ...props
}) => {
  const index = useRef(0);
  const [visibleText, setVisibleText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (index.current < text.length) {
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
    <ItemStyle isTyping={isTyping} {...props}>
      {url ? (
        <Link to={url} itemProp="url">
          {visibleText}
        </Link>
      ) : (
        <>{visibleText}</>
      )}
    </ItemStyle>
  );
};

export default TreeListItem;
