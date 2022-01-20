import * as React from 'react';
import { PageProps, withPrefix } from 'gatsby';
import { GlobalStyle } from '../../theme/global-style';
import Header from './header';

const Layout = ({ location, title, children, color }) => {
  const isRootPath = location.pathname === withPrefix('/');

  return (
    <>
      <GlobalStyle />
      <div className="global-wrapper" data-is-root-path={isRootPath}>
        <Header color={color} title={title} />
        <main>{children}</main>
      </div>
    </>
  );
};

export default Layout;
