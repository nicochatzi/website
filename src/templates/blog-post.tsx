import * as React from 'react';
import { graphql, Link, PageProps } from 'gatsby';
import Bio from '../components/bio';
import Layout from '../components/layout';
import Seo from '../components/seo';
import { BlogPostBySlugQuery } from '../types/queries';
import Mdx from '../components/mdx';

const BlogPostTemplate: React.FC<PageProps<BlogPostBySlugQuery>> = ({
  data,
  location,
}) => {
  const { site, post, previous, next } = data;

  return (
    <Layout location={location} title={site?.siteMetadata?.title || `Title`}>
      <Seo
        title={post?.frontmatter?.title || `Post`}
        description={post?.frontmatter?.description || post?.excerpt}
      />
      <Mdx >{post}</Mdx>
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
                ← {previous?.frontmatter?.title}
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link to={`/blog/${next.slug}`} rel="next">
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
      }
    }
  }
`;
