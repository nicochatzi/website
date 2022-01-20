import * as React from 'react';
import { Link } from 'gatsby';
import { FaGithubSquare, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import { IconContext } from 'react-icons';
import styled from 'styled-components';
import Theme from '../../theme/theme';

const { fontSizes, lineHeights, fontWeights } = Theme;

export interface HeaderProps {
  isRootPath: boolean;
  title: string;
}

const Header: React.FC<HeaderProps> = ({ isRootPath, title }) => {
  if (isRootPath) {
    return (
      <HeaderStyle>
        <h1 className="main-heading">
          <Link to="/">{title}</Link>
        </h1>
      </HeaderStyle>
    );
  } else {
    return (
      <HeaderStyle>
        <Link className="header-link-home" to="/">
          {title}
          {/* <IconContext.Provider value={{ size: fontSizes[5] }}>
            <div>
              <FaGithubSquare />
              <FaLinkedin />
            </div>
          </IconContext.Provider> */}
        </Link>
      </HeaderStyle>
    );
  }
};

const HeaderStyle = styled.div`
  .main-heading,
  .header-link-home {
    display: flex;
    flex-wrap: wrap;
    font-size: ${fontSizes[11]};
    line-height: ${lineHeights.loose};
    font-weight: ${fontWeights.black};
  }

  .react-icons {
  }
`;

export default Header;
