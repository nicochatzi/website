import React from 'react';
import { graphql, PageProps } from 'gatsby';
import Bio from '../components/bio';
import Layout, { HeaderVariant } from '../layout';
import Seo from '../components/seo';
import { AboutPageQuery } from '../../graphql-types';
import Footer from '../layout/footer';

const AboutPage: React.FC<PageProps<AboutPageQuery>> = ({ data, location }) => {
  const site = data.site?.siteMetadata;

  return (
    <Layout
      location={location}
      title={site?.title}
      headerVariant={HeaderVariant.INFO}
    >
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
