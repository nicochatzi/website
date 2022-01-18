require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
});

// =================================================================================================
const siteMetadata = {
  title: `Gatsby Starter Blog`,
  author: {
    name: `Nico Chatzigianis`,
    summary: `who lives and works in San Francisco building useful things.`,
  },
  description: `A starter blog demonstrating what Gatsby can do.`,
  siteUrl: `https://htz.dev/`,
  social: {
    github: `nicochatzi`,
  },
};

// =================================================================================================
const remarkOptions = {
  plugins: [
    {
      resolve: `gatsby-remark-images`,
      options: {
        maxWidth: 630,
      },
    },
    {
      resolve: `gatsby-remark-responsive-iframe`,
      options: {
        wrapperStyle: `margin-bottom: 1.0725rem`,
      },
    },
    // {
    //   resolve: `gatsby-remark-prismjs`,
    //   options: {
    //     languageExtensions: [
    //       {
    //         extend: 'rust',
    //         definition: {
    //           punctop: /:/,
    //           arrow: /(->)/,
    //         },
    //         insertBefore: {
    //           function: {
    //             punctop: /:/,
    //             arrow: /(->)/,
    //           },
    //         },
    //       },
    //     ],
    //   },
    // },
    `gatsby-remark-copy-linked-files`,
    `gatsby-remark-smartypants`,
  ],
};

// =================================================================================================
const feedOptions = {
  query: `
    {
      site {
        siteMetadata {
          title
          description
          siteUrl
          site_url: siteUrl
        }
      }
    }
  `,
  feeds: [
    {
      title: 'htz.dev blog',
      match: '^/blog/',
      output: '/rss.xml',
      serialize: ({ query: { site, allMdx } }) => {
        return allMdx.edges.map((edge) => {
          return Object.assign({}, edge.node.frontmatter, {
            description: edge.node.excerpt,
            date: edge.node.frontmatter.date,
            url: site.siteMetadata.siteUrl + '/blog' + edge.node.fields.slug,
            guid: site.siteMetadata.siteUrl + '/blog' + edge.node.fields.slug,
            custom_elements: [{ 'content:encoded': edge.node.html }],
          });
        });
      },
      query: `
        {
          allMdx(
            sort: { order: DESC, fields: [frontmatter___date] },
          ) {
            edges {
              node {
                excerpt
                html
                fields { slug }
                frontmatter {
                  title
                  date
                }
              }
            }
          }
        }
      `,
    },
  ],
};

// =================================================================================================
module.exports = {
  siteMetadata,
  plugins: [
    `gatsby-plugin-image`,
    `gatsby-plugin-sitemap`,
    `gatsby-plugin-ts`,
    {
      resolve: `gatsby-plugin-typescript`,
      options: {
        isTSX: true, // defaults to false
        jsxPragma: `jsx`, // defaults to "React"
        allExtensions: true, // defaults to false
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `posts`,
        path: `${__dirname}/src/posts`,
      },
    },
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [`.mdx`, `.md`],
        defaultLayouts: {
          default: require.resolve('./src/templates/blog-post.tsx'),
        },
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: remarkOptions,
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-styled-components`,
      options: {
        displayName: false,
      },
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: process.env.GOOGLE_ANALYTICS_ID,
        allowAdFeatures: false,
        head: true,
        anonymize: true,
      },
    },
    {
      resolve: `gatsby-plugin-feed`,
      options: feedOptions,
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `nicochatzi`,
        short_name: `htz`,
        start_url: `/`,
        background_color: `#21252B`,
        theme_color: `#282C34`,
        display: `minimal-ui`,
        icon: `src/images/manifest-icon.png`,
      },
    },
    `gatsby-plugin-react-helmet`,
  ],
};
