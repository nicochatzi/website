import * as React from 'react';
import styled from 'styled-components';
import Theme from '../../theme/theme';
import { OutboundLink } from 'gatsby-plugin-google-analytics';

const { colors, fontSizes } = Theme;

const Footer: React.FC = () => (
  <StyledFooter>
    <OutboundLink href={`https://www.github.com/nicochatzi/website`}>
      © {new Date().getFullYear()}, built by 👽 with 🎛
    </OutboundLink>
  </StyledFooter>
);

const StyledFooter = styled.footer`
  color: ${colors.grey};
  font-size: ${fontSizes[1]};

  a {
    text-decoration: none;
    color: ${colors.lightGrey};
  }
`;

export default Footer;
