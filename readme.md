Plucky Pluin Manager
===

Manages plugins for Plucky-CI.  Thin wrapper over the top of the NPM API.

Thoughts
---

Given:

```javascript
{
  'async': 'async',
  'plucky-ssh': 'plucky-ssh@0.0.2'
}
```

Async will be installed and returned.  plucky-ssh will be installed at version 0.0.2 and returned.

API:
---

###Plugins.constructor({pluginsFolder = process.cwd()+'/plugins'})

###Plugins.get(pluginMap, callback)

 * pluginMap - is a JavaScript object (or hash) representing what NPM modules need to be installed and used
 * callback(err, pluginsHash) - err is present if there is an error, pluginsHash is a JavaScript object where each key maps to the plugin as loaded by require.

####Example:

```javascript
const {
  plugins
} = require('plucky-plugin-manager');

// assumes that the plugins folder contains a plucky-ssh folder with the plugin in it
plugins.get({
  'ssh', 'plucky-ssh'
}, (err, plugins)=>{
  if(err){
    console.error(err);
    return;
  }
  const {
    ssh
  } = plugins;
  // Here you can do something with ssh now
});
```

###Plugins.getPackageDetails(fromName) -> PackageDetails

PackageDetails
 * name - The name or scoped name of the package
 * version - Version identifier for the package if specified
