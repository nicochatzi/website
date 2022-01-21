import React from 'react';
import { withPrefix } from 'gatsby';
import { GlobalStyle } from '../theme';
import Header from './header';
import { HeaderVariant } from '.';

interface LayoutProps {
  title: string | null | undefined;
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
  const isRootPath = location.pathname === withPrefix('/');

  return (
    <>
      <GlobalStyle />
      <div className="global-wrapper" data-is-root-path={isRootPath}>
        <Header
          variant={headerVariant}
          title={title ?? 'Title'}
          isSolid={solidHeader}
        />
        <main>{children}</main>
      </div>
    </>
  );
};

export default Layout;
