const npm = require('npm');
const async = require('async');

class PluginManager{
  constructor({basePath = ''}){
    this.basePath = basePath;
  }

  getPackageDetails(fromName){
    const sections = fromName.split('@');
    if(sections.length === 1){
      return {name: fromName};
    }
    if(fromName[0] === '@'){
      return {
        name: `@${sections[1]}`,
        version: sections[2]
      };
    }
    return {
      name: sections[0],
      version: sections[1]
    };
  }

  get(plugins, callback){
    const loadPlugin = (name, next)=>{
      const details = plugins[name];
      const packageName = this.getPackageDetails(details).name;
      try{
        return next(null, {
          name,
          plugin: require(packageName)
        });
      }catch(e){
        const args = this.basePath?{prefix: basePath}:{};
        npm.load(args, ()=>{
          npm.commands.install([details], (error)=>{
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
    return async.map(Object.keys(plugins), loadPlugin, done);
  }
}

module.exports = {
  PluginManager
};
