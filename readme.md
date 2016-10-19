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

###Plugins.get(pluginMap, callback)

 * pluginMap - is a JavaScript object (or hash) representing what NPM modules need to be installed and used
 * callback(err, pluginsHash) - err is present if there is an error, pluginsHash is a JavaScript object where each key maps to the plugin as loaded by require.

####Example:

```javascript
const {
  plugins
} = require('plucky-plugin-manager');

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
  // Here you can do something with async or ssh now
});
```
