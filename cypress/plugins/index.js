const { startDevServer } = require('@cypress/webpack-dev-server');

module.exports = (on, config) => {
  on('dev-server:start', async (options) => startDevServer({ options }));
  return config;
};
