import React from 'react';
import { graphql, Link, PageProps } from 'gatsby';
import Layout, { HeaderVariant } from '../layout';
import Seo from '../components/seo';
import { BlogPostBySlugQuery } from '../types/queries';
import Mdx from '../components/mdx';
import Spacer from '../components/spacer';

const BlogPostTemplate: React.FC<PageProps<BlogPostBySlugQuery>> = ({
  data,
  location,
}) => {
  const { site, post, previous, next } = data;

  return (
    <Layout
      location={location}
      title={site?.siteMetadata?.title || `Title`}
      headerVariant={HeaderVariant.BLOG}
    >
      <Seo
        title={post?.frontmatter?.title || `Post`}
        description={post?.frontmatter?.description || post?.excerpt}
      />
      <Spacer />
      <Mdx>{post}</Mdx>
      <Spacer />
      <Spacer />
      <nav className="blog-post-nav">
        <ul
          style={{
            display: `flex`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
            listStyle: `none`,
            padding: 0,
          }}
        >
          <li>
            {previous && (
              <Link
                style={{ textDecoration: 'none' }}
                to={`/blog/${previous.slug}`}
                rel="prev"
              >
                ← {previous?.frontmatter?.title}
              </Link>
            )}
          </li>
          <li>
            {next &&
              (next.frontmatter?.published ||
                process.env.NODE_ENV === 'development') && (
                <Link
                  style={{ textDecoration: 'none' }}
                  to={`/blog/${next.slug}`}
                  rel="next"
                >
                  {next?.frontmatter?.title} →
                </Link>
              )}
          </li>
        </ul>
      </nav>
    </Layout>
  );
};

export default BlogPostTemplate;

export const pageQuery = graphql`
  query BlogPostBySlug(
    $id: String!
    $previousPostId: String
    $nextPostId: String
  ) {
    site {
      siteMetadata {
        title
      }
    }
    post: mdx(id: { eq: $id }) {
      id
      slug
      timeToRead
      frontmatter {
        title
        date(formatString: "DD/MM/YY")
        description
        published
      }
      excerpt(pruneLength: 50)
      body
    }
    previous: mdx(id: { eq: $previousPostId }) {
      slug
      frontmatter {
        title
      }
    }
    next: mdx(id: { eq: $nextPostId }) {
      slug
      frontmatter {
        title
        published
      }
    }
  }
`;
