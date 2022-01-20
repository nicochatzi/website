import * as React from 'react';
import { withPrefix } from 'gatsby';
import { GlobalStyle } from '../../theme/global-style';
import Header from './header';
import Footer from './footer';

const Layout = ({ location, title, children }) => {
  const isRootPath = location.pathname === withPrefix('/');

  return (
    <>
      <GlobalStyle />
      <div className="global-wrapper" data-is-root-path={isRootPath}>
        <Header isRootPath={isRootPath} title={title} />
        <main>{children}</main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
