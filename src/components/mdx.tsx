import { Link } from 'gatsby';
import { MDXProvider } from '@mdx-js/react';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import React from 'react';
import Highlight, { defaultProps } from 'prism-react-renderer';
import styled from 'styled-components';
import theme from '../theme/prism-monokai';

const SyntaxHighlighter: React.FC<any> = (props) =>(
    <Highlight
      {...defaultProps}
      code={props.children.props.children.trim()}
      language={props.children.props.className?.split('-')[1] || ''}
      theme={undefined}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={className} style={{ ...style }}>
          {tokens.map((line, i) => (
            <div {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );

const components = {
  Link,
  pre: SyntaxHighlighter,
};

const Mdx = (props: any) => {
  return (
    <MDXProvider components={components}>
      <MDXRenderer frontmatter={props.frontmatter}>{props.body}</MDXRenderer>
    </MDXProvider>
  );
};

export default Mdx;
