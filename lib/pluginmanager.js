const npm = require('npm');
const async = require('async');
const path = require('path');
const EventEmitter = require('events');
const fs = require('fs');

class PluginManager extends EventEmitter{
  constructor({pluginsFolder = false}){
    super();
    this.pluginsFolder = pluginsFolder || path.join(process.cwd() + 'plugins');
    this.emit('ready');
  }

  npmLoad(callback){
    const args = this.pluginsFolder?{
      prefix: this.pluginsFolder,
      loglevel: 'silent'
    }:{loglevel: 'silent'};
    npm.load(args, callback);
  }

  getDetailsFromName(fromName){
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

  isLocal(fromName){
    try{
      const stat = fs.lstatSync(fromName);
      if(stat.isDirectory()){
        const packagePath = path.join(fromName, 'package.json');
        if(fs.lstatSync(packagePath).isFile()){
          return true;
        }
      }
      if(stat.isFile()){
        if(fromName.match(/package.json$/)){
          return true;
        }
      }
      return false;
    }catch(e){
      return false;
    }
  }

  getPackageDetails(fromName, callback){
    const fromNpm = ()=>{
      this.npmLoad(()=>{
        npm.commands.view([fromName], (error, other)=>{
          if(error){
            this.emit('error', error);
            return callback(error);
          }
          const version = Object.keys(other).shift();
          const name = other[version].name;
          return callback(null, {
            name,
            version
          });
        });
      });
    };
    const fromLocal = ()=>{
      const isDir = fs.lstatSync(fromName).isDirectory();
      const packagePath = isDir?path.join(fromName, 'package.json'):fromName;
      try{
        const pkg = require(packagePath);
        return callback(null, {
          name: pkg.name,
          version: pkg.version
        });
      }catch(e){
        return callback(e);
      }
    };
    if(this.isLocal(fromName)){
      return fromLocal();
    }
    return fromNpm();
  }

  getStatic(plugins, callback){
    const loadPlugin = (name, next)=>{
      const packageName = plugins[name];
      const pluginLocation = path.resolve(this.pluginsFolder, packageName);
      try{
        return next(null, {
          name,
          plugin: require(pluginLocation)
        });
      }catch(e){
        const error = {
          name,
          location: pluginLocation,
          error: e
        };
        this.emit('error', error);
        return next(error);
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

  loadOrInstallPlugin(plugin, callback){
    this.getPackageDetails(plugin, (err, {name: packageName}={})=>{
      if(err){
        const error = {
          name: plugin,
          error: err
        };
        this.emit('error', error);
        return callback(error);
      }
      const packageLocation = this.pluginsFolder?path.join(this.pluginsFolder, 'node_modules', packageName):packageName;
      try{
        return callback(null, {
          name: packageName,
          plugin: require(packageLocation)
        });
      }catch(e){
        this.npmLoad(()=>{
          npm.commands.install([plugin], (err, other)=>{
            if(err){
              const error = {
                name: plugin,
                error: err
              };
              this.emit('error', error);
              return callback(error);
            }
            const installInfo = other.shift();
            const [
              info,
              installLocation
            ] = installInfo;
            this.getPackageDetails(info, (err, {name, version})=>{
              if(err){
                const error = {
                  name: plugin,
                  error: err
                };
                this.emit('error', error);
                return callback(error);
              }

              const pkg = {
                name,
                version,
                location: installLocation,
                plugin: require(packageLocation)
              };
              this.emit('installed', pkg);
              return callback(null, pkg);
            });
          });
        });
      }
    });
  }

  get(plugins, callback){
    const done = (error, plugins = [])=>{
      if(error){
        this.emit('error', error);
        return callback(error);
      }
      const pluginsObj = plugins.reduce((plugins, {name, plugin})=>{
        plugins[name] = plugin;
        return plugins;
      }, {});
      return callback(null, pluginsObj);
    };
    const installPlugin = (key, next)=>{
      const details = plugins[key];
      return this.loadOrInstallPlugin(details, next);
    };
    return async.mapSeries(Object.keys(plugins), installPlugin, done);
  }
}

module.exports = {
  PluginManager
};
