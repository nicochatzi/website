import React from 'react';
import Highlight, { defaultProps } from 'prism-react-renderer';
import StyledPre from './style';
import Prism from './prism';

export default (props: any) => (
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
