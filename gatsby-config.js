require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
});

// =================================================================================================
const siteMetadata = {
  title: `htz`,
  author: {
    name: `Nico Chatzigianis`,
    summary: `who lives and works in London and France.`,
  },
  description: `blogs and apps`,
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
            url: site.siteMetadata.siteUrl + '/blog' + edge.node.slug,
            guid: site.siteMetadata.siteUrl + '/blog' + edge.node.slug,
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
                slug
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
    {
      resolve: `gatsby-plugin-ts`,
      options: {
        typeCheck: true,
        codegen: true,
        codegenDelay: 5000,
        documentPaths: [`./src/**/*.{ts,tsx}`],
      },
    },
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
        path: `${__dirname}/posts`,
      },
    },
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [`.mdx`, `.md`],
        gatsbyRemarkPlugins: [
          {
            resolve: `gatsby-remark-autolink-headers`,
            options: {
              // icon: `<svg aria-hidden="true" height="20" version="1.1" viewBox="0 0 16 16" width="20"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>`,
              elements: [`h1`, `h2`, `h3`, `h4`],
            },
          },
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 590,
            },
          },
        ],
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
      resolve: `gatsby-plugin-google-gtag`,
      options: {
        trackingIds: [process.env.GOOGLE_ANALYTICS_ID],
        gtagConfig: {
          optimize_id: 'OPT_CONTAINER_ID',
          anonymize_ip: true,
          cookie_expires: 1000,
        },
        pluginConfig: {
          head: false,
          respectDNT: true,
        },
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
