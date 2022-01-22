import React from 'react';
import { graphql, PageProps, useStaticQuery } from 'gatsby';
import { NotFoundQuery } from '../types/queries';
import Layout, { HeaderVariant } from '../layout';
import Seo from '../components/seo';
import Theme from '../theme';
import Spacer from '../components/spacer';

const { colors } = Theme;

const NotFoundPage: React.FC<PageProps> = ({ location }) => {
  const { site }: NotFoundQuery = useStaticQuery(graphql`
    query NotFound {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);

  return (
    <Layout
      location={location}
      title={site?.siteMetadata?.title}
      headerVariant={HeaderVariant.ALT}
    >
      <Seo title="404: Not Found" />
      <h1>404: Not Found</h1>
      <Spacer />
      <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
    </Layout>
  );
};

export default NotFoundPage;
