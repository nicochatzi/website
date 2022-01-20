import * as React from 'react';
import { Link, graphql, PageProps } from 'gatsby';
import Bio from '../components/bio';
import Layout from '../components/layout';
import Seo from '../components/seo';
import { IndexPageQuery } from '../../graphql-types';
import Theme from '../theme/theme';
import { TreeList, TreeListItem } from '../components/list';

const { colors, fonts, fontSizes, lineHeights } = Theme;

interface StyledLinkProps {
  url: string;
}

const StyledLink: React.FC<StyledLinkProps> = ({ children, url }) => (
  <Link
    to={url}
    itemProp="url"
    style={{
      textDecoration: 'none',
      fontFamily: fonts.code,
      fontSize: fontSizes[6],
      color: colors.yellow,
      lineHeight: lineHeights.tight,
    }}
  >
    {children}
  </Link>
);

const Index: React.FC<PageProps<IndexPageQuery>> = ({ data, location }) => {
  const site = data.site?.siteMetadata;
  const { edges: posts } = data.allMdx;

  return (
    <Layout location={location} title={site?.title} color={colors.red}>
      <Seo title="home" description={site?.description || 'htz'} />
      <span>
        <TreeList>
          <TreeListItem depth={0} isRoot></TreeListItem>
          <TreeListItem depth={0}>
            <StyledLink url={'/about'}>{'about'}</StyledLink>
          </TreeListItem>
          <TreeListItem depth={0}>
            <StyledLink url={'/apps'}>{'apps'}</StyledLink>
          </TreeListItem>
          <TreeListItem depth={1} withTrunk isLast>
            <StyledLink url={'/apps/dummy'}>{'fm_synth'}</StyledLink>
          </TreeListItem>
          <TreeListItem depth={0} isLast>
            <StyledLink url={'/blog'}>{'blog'}</StyledLink>
          </TreeListItem>
          <>
            {posts.map(({ node: post }, index) => (
              <TreeListItem
                key={post.slug}
                isLast={index == posts.length - 1}
                depth={1}
              >
                <StyledLink url={`/blog/${post.slug}`}>
                  {(post.frontmatter?.title || post.slug)?.toLowerCase()}
                </StyledLink>
              </TreeListItem>
            ))}
          </>
        </TreeList>
      </span>
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
          }
        }
      }
    }
  }
`;
