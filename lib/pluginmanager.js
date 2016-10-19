const npm = require('npm');
const async = require('async');
const path = require('path');

class PluginManager{
  constructor({pluginsFolder = false}){
    this.pluginsFolder = pluginsFolder || path.join(process.cwd() + 'plugins');
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
      const packageName = plugins[name];
      const pluginLocation = path.resolve(this.pluginsFolder, packageName);
      try{
        return next(null, {
          name,
          plugin: require(pluginLocation)
        });
      }catch(e){
        return next({
          name,
          location: pluginLocation,
          error: e
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

  // This doesn't work
  /*
  plugins.get({
    'async', 'async',
    'ssh', 'plucky-ssh'
  }, (err, plugins)=>{
    if(err){
      console.error(err);
      return;
    }
    const {
      async,
      ssh
    } = plugins;
    // Here you can do something with async and ssh now
  });
  */
  getNpm(plugins, callback){
    const loadPlugin = (name, next)=>{
      const details = plugins[name];
      const packageName = this.getPackageDetails(details).name;
      try{
        return next(null, {
          name,
          plugin: require(packageName)
        });
      }catch(e){
        const args = this.pluginsFolder?{prefix: pluginsFolder}:{};
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
