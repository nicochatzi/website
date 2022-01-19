import React from 'react';
import { graphql, PageProps, useStaticQuery } from 'gatsby';
import { NotFoundQuery } from '../types/queries';

import Layout from '../components/layout';
import Seo from '../components/seo';

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
    <Layout location={location} title={site?.siteMetadata?.title}>
      <Seo title="404: Not Found" />
      <h1>404: Not Found</h1>
      <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
    </Layout>
  );
};

export default NotFoundPage;
