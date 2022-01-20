import React from 'react';
import styled from 'styled-components';
import Theme from '../../theme/theme';

const { colors, fonts, fontSizes } = Theme;

const symbols = {
  root: '.',
  trunk: '│',
  branch: '├──',
  leaf: '└──',
};

interface TreeListItemProps {
  isRoot?: boolean;
  isLast?: boolean;
  withTrunk?: boolean;
  depth: number;
}

const getBulletContent = (props: TreeListItemProps): string => {
  let prefix = props.isRoot
    ? symbols.root
    : props.isLast
    ? symbols.leaf
    : symbols.branch;

  for (let i = 0; i < props.depth; i++) {
    prefix = `${props.withTrunk ? symbols.trunk : ' '}   ${prefix}`;
  }

  return prefix;
};

export const TreeListItem = styled.li<TreeListItemProps>`
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
`;

export const TreeList = styled.ul`
  list-style: none;
  padding-left: 0;
`;
