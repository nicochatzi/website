import React from 'react';
import styled from 'styled-components';
import Theme from '../theme';
import { OutboundLink } from 'gatsby-plugin-google-analytics';
import { FaGithubSquare, FaLinkedin, FaRssSquare } from 'react-icons/fa';
import { IconContext } from 'react-icons';

const { colors, fontSizes } = Theme;

const Footer: React.FC = () => (
  <StyledFooter>
    <IconContext.Provider value={{ size: fontSizes[6] }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          width: '5.8rem',
          marginLeft: '0.2rem',
        }}
      >
        <div>
          <OutboundLink href={`https://www.github.com/nicochatzi/`}>
            <FaGithubSquare />
          </OutboundLink>
        </div>
        <div>
          <OutboundLink
            href={`https://www.linkedin.com/in/nicolas-chatzigianis/`}
          >
            <FaLinkedin />
          </OutboundLink>
        </div>
        <div>
          <OutboundLink href={`https://htz.dev/rss.xml`}>
            <FaRssSquare />
          </OutboundLink>
        </div>
      </div>
    </IconContext.Provider>
  </StyledFooter>
);

const StyledFooter = styled.footer`
  color: ${colors.blue};
  font-size: ${fontSizes[1]};

  a {
    text-decoration: none;
  }

  a:hover {
    color: ${colors.yellow};
  }
`;

export default Footer;
