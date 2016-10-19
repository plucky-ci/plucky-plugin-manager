const npm = require('npm');
const async = require('async');

class PluginManager{
  constructor({basePath = ''}){
    this.basePath = basePath;
  }

  get(plugins, callback){
    const loadPlugin = (name, next)=>{
      const packageName = plugins[name];
      try{
        return next(null, {
          name,
          plugin: require(packageName)
        });
      }catch(e){
        const args = this.basePath?['--prefix', basePath, packageName]:[packageName];
        npm.commands.install(args, (error)=>{
          if(error){
            return next({
              name,
              error
            });
          }
          return next(null, {
            name,
            plugin: require(packageName)
          });
        });
      }
    };
    const done = (err, plugins = [])=>{
      const pluginsObj = plugins.reduce((plugins, {name, plugin})=>{
        plugins[name] = plugin;
        return plugins;
      }, {});
      return callback(err, pluginsObj);
    };
    return async.map(Object.keys(plugin), loadPlugin, done);
  }
}

module.exports = {
  PluginManager
};
