import * as React from 'react';
import { Link } from 'gatsby';
import styled from 'styled-components';
import Theme from '../../theme/theme';

const { fontSizes, lineHeights, fontWeights } = Theme;

export interface HeaderProps {
  color: string;
  title: string;
}

const Header: React.FC<HeaderProps> = ({ color, title }) => (
  <HeaderStyle>
    <Link className="header-link-home" to="/" style={{ color }}>
      {title}
    </Link>
  </HeaderStyle>
);

const HeaderStyle = styled.div`
  .main-heading,
  .header-link-home {
    display: flex;
    flex-wrap: wrap;
    font-size: ${fontSizes[11]};
    line-height: ${lineHeights.loose};
    font-weight: ${fontWeights.black};
  }
`;

export default Header;
