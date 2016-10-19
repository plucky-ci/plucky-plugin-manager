const {
  PluginManager
} = require('./lib/pluginmanager');

const plugins = new PluginManager({
  basePath: process.cwd()
});

module.exports = {
  PluginManager,
  plugins
};
