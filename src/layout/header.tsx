import React from 'react';
import { Link } from 'gatsby';
import styled from 'styled-components';
import Theme from '../theme';
import { isDarkThemeLoaded, ThemeDef } from '../theme/themes';
import { IconContext } from 'react-icons';
import { BiMoon } from 'react-icons/bi';
import { BsSun } from 'react-icons/bs';

const { fonts, fontSizes, lineHeights, fontWeights } = Theme;

export enum HeaderVariant {
  MAIN,
  BLOG,
  INFO,
  ALT,
}

interface HeaderVariantStyle {
  color: string;
  hoverColor: string;
}

interface HeaderProps {
  title: string;
  variant: HeaderVariant;
  isSolid?: boolean;
  theme: ThemeDef;
  toggleTheme: () => void;
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

const Header: React.FC<HeaderProps> = ({
  title,
  variant,
  isSolid,
  theme,
  toggleTheme,
}) => {
  const v: HeaderVariantStyle = new Map<HeaderVariant, HeaderVariantStyle>([
    [
      HeaderVariant.MAIN,
      { color: theme.heading, hoverColor: theme.heading_light },
    ],
    [
      HeaderVariant.INFO,
      { color: theme.text_light, hoverColor: theme.primary_light },
    ],
    [
      HeaderVariant.BLOG,
      { color: theme.primary_light, hoverColor: theme.text_light },
    ],
    [
      HeaderVariant.ALT,
      { color: theme.heading_light, hoverColor: theme.heading },
    ],
  ]).get(variant)!;

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
      <IconContext.Provider
        value={{ size: fontSizes[6], style: { marginTop: '0.7rem' } }}
      >
        <button onClick={toggleTheme}>
          {isDarkThemeLoaded() ? <BsSun /> : <BiMoon />}
        </button>
      </IconContext.Provider>
    </HeaderStyle>
  );
};

const HeaderStyle = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  .main-heading,
  .header-link-home {
    display: flex;
    flex-wrap: wrap;
    font-size: ${fontSizes[11]};
    line-height: ${lineHeights.loose};
    font-weight: ${fontWeights.black};
  }

  button {
    color: ${Theme.global.highlight};
    border-color: ${Theme.global.background};
    background: ${Theme.global.background};
    text-shadow: none;

    border-style: none;
  }
`;

export default Header;
