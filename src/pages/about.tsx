import * as React from 'react';
import { Link, graphql, PageProps } from 'gatsby';
import Bio from '../components/bio';
import Layout from '../components/layout';
import Seo from '../components/seo';
import { AboutPageQuery } from '../../graphql-types';
import { FaGithubSquare, FaLinkedin, FaRssSquare } from 'react-icons/fa';
import { IconContext } from 'react-icons';
import Theme from '../theme/theme';
import Footer from '../components/layout/footer';
import { OutboundLink } from 'gatsby-plugin-google-gtag';
import { wrap } from 'cypress/types/lodash';

const {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  sizes,
  spaces,
} = Theme;

const AboutPage: React.FC<PageProps<AboutPageQuery>> = ({ data, location }) => {
  const site = data.site?.siteMetadata;

  return (
    <Layout location={location} title={site?.title} color={colors.yellow}>
      <Seo title="home" description={site?.description || 'htz'} />
      <Bio />
      <IconContext.Provider value={{ size: fontSizes[6] }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
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
      <Footer />
    </Layout>
  );
};

export default AboutPage;

export const pageQuery = graphql`
  query AboutPage {
    site {
      siteMetadata {
        title
        description
      }
    }
  }
`;
