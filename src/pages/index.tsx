import * as React from 'react';
import { Link, graphql, PageProps } from 'gatsby';
import Bio from '../components/bio';
import Layout from '../components/layout';
import Seo from '../components/seo';
import { IndexPageQuery } from '../../graphql-types';
import Theme from '../theme/theme';

const {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  sizes,
  spaces,
} = Theme;

const BlogIndex: React.FC<PageProps<IndexPageQuery>> = ({ data, location }) => {
  const site = data.site?.siteMetadata;
  const { edges: posts } = data.allMdx;

  if (posts.length === 0) {
    return (
      <Layout location={location} title={site?.title}>
        <Seo title="home" />
        <Bio />
        <p>
          No blog posts found. Add markdown posts to "content/blog" (or the
          directory you specified for the "gatsby-source-filesystem" plugin in
          gatsby-config.js).
        </p>
      </Layout>
    );
  }

  return (
    <Layout location={location} title={site?.title}>
      <Seo title="home" description={site?.description || 'htz'} />
      <Bio />
      <ol style={{ listStyle: `none` }}>
        {posts.map(({ node: post }) => (
          <li key={post.slug}>
            <article
              className="post-list-item"
              itemScope
              itemType="http://schema.org/Article"
            >
              <header>
                <h2>
                  <Link to={`/blog/${post.slug}`} itemProp="url">
                    <span
                      itemProp="headline"
                      style={{ fontSize: fontSizes[6] }}
                    >
                      {post.frontmatter?.title || post.slug}
                    </span>
                  </Link>
                </h2>
                <small style={{ color: colors.grey }}>
                  {post.frontmatter?.date}
                </small>
              </header>
              <section>
                <p
                  dangerouslySetInnerHTML={{
                    __html: post.frontmatter?.description || post.excerpt,
                  }}
                  itemProp="description"
                />
              </section>
            </article>
          </li>
        ))}
      </ol>
    </Layout>
  );
};

export default BlogIndex;

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
          }
        }
      }
    }
  }
`;
