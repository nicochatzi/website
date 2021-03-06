/**
 * SEO component that queries for data with
 *  Gatsby's useStaticQuery React hook
 *
 * See: https://www.gatsbyjs.com/docs/use-static-query/
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import { useStaticQuery, graphql } from 'gatsby';
import { SeoQuery } from '../../graphql-types';

interface MetaTag {
  property: string;
  content: string;
}

interface SeoProps {
  title: string;
  lang?: string;
  meta?: MetaTag[];
  description?: string;
}

const Seo: React.FC<SeoProps> = ({ title, lang, meta, description }) => {
  const { site }: SeoQuery = useStaticQuery(
    graphql`
      query Seo {
        site {
          siteMetadata {
            title
            description
            social {
              github
            }
          }
        }
      }
    `
  );

  const metaDescription = description || site?.siteMetadata?.description;
  const defaultTitle = site?.siteMetadata?.title;

  return (
    <Helmet
      htmlAttributes={{
        lang,
      }}
      title={title}
      titleTemplate={defaultTitle ? `%s | ${defaultTitle}` : null}
      meta={[
        {
          name: `description`,
          content: metaDescription,
        },
        {
          property: `og:title`,
          content: title,
        },
        {
          property: `og:description`,
          content: metaDescription,
        },
        {
          property: `og:type`,
          content: `website`,
        },
        {
          name: `github:card`,
          content: `summary`,
        },
        {
          name: `github:creator`,
          content: site?.siteMetadata?.social?.github || ``,
        },
        {
          name: `github:title`,
          content: title,
        },
        {
          name: `github:description`,
          content: metaDescription,
        },
      ].concat(meta || [])}
    />
  );
};

Seo.defaultProps = {
  lang: `en`,
  meta: [],
  description: ``,
};

export default Seo;
