import React from 'react';
import { graphql, PageProps } from 'gatsby';
import Layout, { HeaderVariant } from '../layout';
import Seo from '../components/seo';
import { IndexPageQuery } from '../../graphql-types';
import { TreeList } from '../components/list';

const Index: React.FC<PageProps<IndexPageQuery>> = ({ data, location }) => {
  const site = data.site?.siteMetadata;
  const posts = data.allMdx.edges.filter(
    (edge) =>
      edge.node.frontmatter?.published || process.env.NODE_ENV === 'development'
  );

  return (
    <Layout
      location={location}
      title={site?.title}
      headerVariant={HeaderVariant.RED}
      solidHeader
    >
      <Seo title="home" description={site?.description || 'htz'} />
      <TreeList
        items={[
          {
            url: '/about',
            text: 'about',
            depth: 0,
          },
          {
            url: '/blog',
            text: 'blog',
            depth: 0,
            isLast: true,
          },
          ...posts.map(({ node: post }, index) => ({
            url: `/blog/${post.slug}`,
            text: (post.frontmatter?.title || post.slug)?.toLowerCase()!,
            depth: 1,
            isLast: index == posts.length - 1,
          })),
        ]}
      />
    </Layout>
  );
};

export default Index;

export const pageQuery = graphql`
  query IndexPage {
    site {
      siteMetadata {
        title
        description
      }
    }
    allMdx(sort: { order: DESC, fields: [frontmatter___date] }) {
      edges {
        node {
          excerpt
          slug
          frontmatter {
            date(formatString: "DD/MM/YY")
            title
            description
            published
          }
        }
      }
    }
  }
`;
