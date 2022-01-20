import React from 'react';
import Highlight, { defaultProps } from 'prism-react-renderer';
import { MDXProvider } from '@mdx-js/react';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import { Link } from 'gatsby';
import Prism, { StyledPre } from './prism';

const SyntaxHighlighter: React.FC<any> = (props) => (
  <Highlight
    {...defaultProps}
    Prism={Prism}
    code={props.children.props.children.trim()}
    language={props.children.props.className?.split('-')[1] || ''}
    theme={undefined}
  >
    {({ className, style, tokens, getLineProps, getTokenProps }) => (
      <StyledPre className={className}>
        {tokens.map((line, i) => (
          <div key={i} {...getLineProps({ line, key: i })}>
            {line.map((token, key) => (
              <span key={key} {...getTokenProps({ token, key })} />
            ))}
          </div>
        ))}
      </StyledPre>
    )}
  </Highlight>
);

const components = {
  Link,
  pre: SyntaxHighlighter,
};

const Mdx = (props: any) => (
  <MDXProvider components={components}>
    <MDXRenderer frontmatter={props.children.frontmatter}>
      {props.children.body}
    </MDXRenderer>
  </MDXProvider>
);

export default Mdx;
