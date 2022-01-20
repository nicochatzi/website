import * as React from 'react';
import { Link, graphql, PageProps } from 'gatsby';
import Bio from '../components/bio';
import Layout from '../components/layout';
import Seo from '../components/seo';
import { AboutPageQuery } from '../../graphql-types';
import Theme from '../theme/theme';
import Footer from '../components/layout/footer';

const { colors } = Theme;

const AboutPage: React.FC<PageProps<AboutPageQuery>> = ({ data, location }) => {
  const site = data.site?.siteMetadata;

  return (
    <Layout location={location} title={site?.title} color={colors.yellow}>
      <Seo title="home" description={site?.description || 'htz'} />
      <Bio />
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
