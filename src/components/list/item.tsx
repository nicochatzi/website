import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'gatsby';
import styled from 'styled-components';
import Theme from '../../theme';

const { fonts, fontSizes, lineHeights } = Theme;

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

const getBulletContent = (props: TreeListItemExtendedProps): string =>
  [...Array(props.depth)].reduce(
    (prefix) => `${props.withTrunk ? '│' : ' '}   ${prefix}`,
    props.isRoot ? '.' : props.isLast ? '└──' : props.isTyping ? '└──' : '├──'
  );

const ItemStyle = styled.li<TreeListItemExtendedProps>`
  margin: 0.5rem;

  ::before {
    font-family: ${fonts.code};
    margin-left: -0.5rem;
    color: ${Theme.global.highlight};
    font-size: ${fontSizes[7]};
    line-height: 0;
    white-space: pre;
    content: '${getBulletContent} ';
  }

  a {
    color: ${Theme.global.sub};
    text-decoration: none;
    font-family: ${fonts.code};
    font-size: ${fontSizes[6]};
    line-height: ${lineHeights.tight};
  }

  a:hover,
  a:focus {
    text-decoration: none;
    color: ${Theme.global.primary_light};
  }
`;

const TreeListItem: React.FC<
  TreeListItemProps & {
    onReady: () => void;
  }
> = ({ children, url, text, onReady, ...props }) => {
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
    }, 30);

    return () => clearTimeout(timeout);
  }, [visibleText]);

  return (
    <ItemStyle isTyping={isTyping} text={text} {...props}>
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
