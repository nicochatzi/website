import React from 'react';
import { Link } from 'gatsby';
import styled from 'styled-components';
import Theme from '../theme';

const { colors, fonts, fontSizes, lineHeights, fontWeights } = Theme;

export enum HeaderVariant {
  YELLOW,
  RED,
  BLUE,
  PINK,
}

const variants = new Map<HeaderVariant, HeaderVariantStyle>([
  [HeaderVariant.YELLOW, { color: colors.yellow, hoverColor: colors.blue }],
  [HeaderVariant.RED, { color: colors.red, hoverColor: colors.pink }],
  [HeaderVariant.BLUE, { color: colors.blue, hoverColor: colors.yellow }],
  [HeaderVariant.PINK, { color: colors.pink, hoverColor: colors.red }],
]);

interface HeaderVariantStyle {
  color: string;
  hoverColor: string;
}

interface HeaderProps {
  title: string;
  variant: HeaderVariant;
  isSolid?: boolean;
}

const LinkStyleWrapper = styled.a<HeaderVariantStyle>`
  a {
    color: ${({ color }) => color};
    text-decoration: none;
    font-family: ${fonts.sans};
    font-size: ${fontSizes[6]};
    line-height: ${lineHeights.tight};
  }

  a:hover,
  a:focus {
    text-decoration: none;
    color: ${({ hoverColor }) => hoverColor};
  }
`;

const Header: React.FC<HeaderProps> = ({ title, variant, isSolid }) => {
  const v: HeaderVariantStyle =
    variants.get(variant) ?? variants.get(HeaderVariant.RED)!;

  return (
    <HeaderStyle>
      <LinkStyleWrapper
        color={v.color}
        hoverColor={isSolid ? v.color : v.hoverColor}
      >
        <Link className="header-link-home" to="/">
          {title}
        </Link>
      </LinkStyleWrapper>
    </HeaderStyle>
  );
};

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
