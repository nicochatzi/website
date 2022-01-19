import * as React from 'react';
import { Link, PageProps, withPrefix } from 'gatsby';
import { GlobalStyle } from '../theme/global-style';

const Layout = ({ location, title, children }) => {
  const isRootPath = location.pathname === withPrefix('/');

  const header = (() => {
    if (isRootPath) {
      return (
        <h1 className="main-heading">
          <Link to="/">{title}</Link>
        </h1>
      );
    } else {
      return (
        <Link className="header-link-home" to="/">
          {title}
        </Link>
      );
    }
  })();

  return (
    <>
      <GlobalStyle />
      <div className="global-wrapper" data-is-root-path={isRootPath}>
        <header className="global-header">{header}</header>
        <main>{children}</main>
        <footer>
          © {new Date().getFullYear()}, Built with
          {` `}
          <a href="https://www.gatsbyjs.com">Gatsby</a>
        </footer>
      </div>
    </>
  );
};

export default Layout;
