import React from 'react';
import { Link, graphql, PageProps } from 'gatsby';
import Layout, { HeaderVariant } from '../layout';
import Seo from '../components/seo';
import { BlogPageQuery } from '../../graphql-types';
import Theme from '../theme';
import styled from 'styled-components';

const { colors, fontSizes } = Theme;

const LinkStyleWrapper = styled.a`
  a {
    color: ${colors.yellow};
    text-decoration: none;
    font-size: ${fontSizes[6]};

  a:hover,
  a:focus {
    color: ${colors.blue};
  }
`;

const BlogPage: React.FC<PageProps<BlogPageQuery>> = ({ data, location }) => {
  const site = data.site?.siteMetadata;
  const { edges } = data.allMdx;
  const posts = edges.filter(
    (edge) =>
      edge.node.frontmatter?.published || process.env.NODE_ENV === 'development'
  );

  return (
    <Layout
      location={location}
      title={site?.title}
      headerVariant={HeaderVariant.BLUE}
    >
      <Seo title="home" description={site?.description || 'htz'} />
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
                  <LinkStyleWrapper>
                    <Link to={`/blog/${post.slug}`} itemProp="url">
                      <span
                        itemProp="headline"
                        style={{ fontSize: fontSizes[6] }}
                      >
                        {post.frontmatter?.title || post.slug}
                      </span>
                    </Link>
                  </LinkStyleWrapper>
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

export default BlogPage;

export const pageQuery = graphql`
  query BlogPage {
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
