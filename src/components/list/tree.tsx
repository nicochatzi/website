import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { TreeListItem } from '.';
import { TreeListItemProps } from './item';

const StyledList = styled.ul`
  list-style: none;
  padding-left: 0;
`;

interface TreeListProps {
  items: TreeListItemProps[];
}

const TreeList: React.FC<TreeListProps> = ({ items }) => {
  const leafs = [
    {
      isRoot: true,
      text: '',
      depth: 0,
    },
    ...items,
  ];
  const index = useRef(0);
  const [visibleLeafs, setVisibleLeafs] = useState<TreeListItemProps[]>([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (index.current < leafs.length) {
        setVisibleLeafs(leafs.slice(0, index.current + 1));
        index.current += 1;
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [visibleLeafs]);

  return (
    <StyledList>
      {visibleLeafs.map((leafProps) => (
        <TreeListItem {...leafProps} />
      ))}
    </StyledList>
  );
};

export default TreeList;
