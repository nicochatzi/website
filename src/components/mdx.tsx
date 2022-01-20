import React from 'react';
import { MDXProvider } from '@mdx-js/react';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import { Link } from 'gatsby';
import PrismComponent from './prism';

const components = {
  Link,
  pre: PrismComponent,
};

const Mdx: React.FC = (props: any) => (
  <MDXProvider components={components}>
    <MDXRenderer frontmatter={props.children.frontmatter}>
      {props.children.body}
    </MDXRenderer>
  </MDXProvider>
);

export default Mdx;
