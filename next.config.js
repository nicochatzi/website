/** @type {import('next').NextConfig} */
const withMDX = require('@next/mdx')();
module.exports = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  experimental: {
    mdxRs: true,
  },
  output: 'export',
};
