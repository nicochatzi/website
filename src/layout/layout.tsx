import React from 'react';
import { withPrefix } from 'gatsby';
import { GlobalStyle } from '../theme';
import Header from './header';
import { HeaderVariant } from '.';
import { ThemeProvider } from 'styled-components';
import { useTheme } from '../hooks/useTheme';

interface LayoutProps {
  title?: string | null;
  headerVariant: HeaderVariant;
  solidHeader?: boolean;
  location: Location;
}

const Layout: React.FC<LayoutProps> = ({
  location,
  children,
  title,
  headerVariant,
  solidHeader,
}) => {
  const [theme, toggleTheme] = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <div
        className="global-wrapper"
        data-is-root-path={location.pathname === withPrefix('/')}
      >
        <Header
          variant={headerVariant}
          title={title ?? 'Title'}
          isSolid={solidHeader}
          toggleTheme={toggleTheme}
          theme={theme}
        />
        <main>{children}</main>
      </div>
    </ThemeProvider>
  );
};

export default Layout;
