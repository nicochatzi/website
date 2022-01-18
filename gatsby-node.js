const path = require(`path`);

exports.createPages = async ({
  graphql,
  actions: { createPage },
  reporter,
}) => {
  const result = await graphql(
    `
      {
        allMdx {
          nodes {
            id
            slug
            frontmatter {
              published
            }
          }
        }
      }
    `
  );

  if (result.errors) {
    reporter.panicOnBuild(
      `There was an error loading your blog posts`,
      result.errors
    );
    return;
  }

  const posts = result.data.allMdx.nodes;

  posts.forEach((post, index) => {
    const previousPostId = index === 0 ? null : posts[index - 1].id;
    const nextPostId = index === posts.length - 1 ? null : posts[index + 1].id;

    if (post.frontmatter.published || process.env.NODE_ENV === 'development') {
      createPage({
        path: `/blog/${post.slug}`,
        component: path.resolve(`./src/templates/blog-post.tsx`),
        context: {
          id: post.id,
          previousPostId,
          nextPostId,
        },
      });
    }
  });
};
