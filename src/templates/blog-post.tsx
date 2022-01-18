import * as React from 'react';
import { Link, graphql } from 'gatsby';
import { MDXProvider } from '@mdx-js/react';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import PrismWrapper from '../components/prism-wrapper';

import Bio from '../components/bio';
import Layout from '../components/layout';
import Seo from '../components/seo';

const shortcodes = { Link, pre: PrismWrapper };

const BlogPostTemplate = ({ data, location }) => {
  const { post, previous, next } = data;

  return (
    <Layout
      location={location}
      title={data.site.siteMetadata?.title || `Title`}
    >
      <Seo
        title={post.frontmatter.title}
        description={post.frontmatter.description || post.excerpt}
      />
      <MDXProvider components={shortcodes}>
        <MDXRenderer frontmatter={post.frontmatter}>{post.body}</MDXRenderer>
      </MDXProvider>
      <footer>
        <Bio />
      </footer>
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
              <Link to={`/blog/${previous.slug}`} rel="prev">
                ← {previous.frontmatter.title}
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link to={`/blog/${next.slug}`} rel="next">
                {next.frontmatter.title} →
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
      }
    }
  }
`;
