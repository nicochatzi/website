import React, { FunctionComponent } from 'react';
import { graphql, PageProps, useStaticQuery } from 'gatsby';

import Layout from '../components/layout';
import Seo from '../components/seo';

const NotFoundPage: FunctionComponent<PageProps> = ({ location }) => {
  const { site } = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);

  return (
    <Layout location={location} title={site.siteMetadata.title}>
      <Seo title="404: Not Found" />
      <h1>404: Not Found</h1>
      <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
    </Layout>
  );
};

export default NotFoundPage;
