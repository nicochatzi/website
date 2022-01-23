import styled from 'styled-components';
import Theme from '../../theme';

const { fonts, fontSizes } = Theme;

export default styled.pre`
  font-family: ${fonts.code};
  background-color: ${Theme.global.background_deep};
  border-radius: 1rem;
  border-width: 10rem;
  font-size: ${fontSizes[3]};
  text-align: left;
  white-space: pre;
  word-spacing: normal;
  word-break: normal;
  word-wrap: normal;
  line-height: 1.5;

  padding: 1.5em;
  margin: 1.25em 0;
  overflow: auto;

  -moz-tab-size: 4;
  -o-tab-size: 4;
  tab-size: 4;

  -webkit-hyphens: none;
  -moz-hyphens: none;
  -ms-hyphens: none;
  hyphens: none;

  @media print {
    text-shadow: none;
  }

  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: ${Theme.global.code.comment};
  }

  .token.boolean,
  .token.number {
    color: ${Theme.global.heading_light};
  }

  .token.keyword {
    color: ${Theme.global.code.keyword};
  }

  .token.constant {
    color: ${Theme.global.code.keyword};
  }

  .token.function,
  .token.inserted,
  .token.property,
  .token.tag,
  .token.symbol {
    color: ${Theme.global.valid};
  }

  .token.function-definition.function > keyword,
  .token.deleted,
  .token.operator {
    color: ${Theme.global.code.operator};
  }

  .token.regex,
  .token.placeholder,
  .token.important,
  .token.variable,
  .token.selector,
  .token.attr-name,
  .token.string,
  .token.char,
  .token.builtin,
  .token.entity,
  .token.url,
  .language-css .token.string,
  .style .token.string {
    color: ${Theme.global.code.string};
  }

  .token.lifetime-annotation.symbol,
  .token.atrule,
  .token.attr-value,
  .token.type-definition.class-name,
  .token.primitives,
  .token.class-name {
    color: ${Theme.global.code.class};
  }

  .token.important,
  .token.bold {
    font-weight: bold;
  }
  .token.italic {
    font-style: italic;
  }

  .token.entity {
    cursor: help;
  }

  /* Rust overrides */
  .token.closure-punctuation.punctuation {
    color: ${Theme.global.code.operator};
  }

  .token.literals {
    color: ${Theme.global.code.literals};
  }

  .token.braces,
  .token.punctuation,
  .token.namespace.punctuation {
    color: ${Theme.global.code.braces};
  }

  .token.module-declaration,
  .token.decl-keyword {
    color: ${Theme.global.code.operator};
  }
`;
