Plucky Pluin Manager
===

**NOTE:** I haven't even started to code this, below is the thought process behind it.

Manages plugins for Plucky-CI.

Thoughts
---

Given:

```javascript
{
  foo1: 'git@github.com:plucky-ci/plucky-mapper.git', // Use the latest available
  foo2: 'git@https://github.com/plucky-ci/plucky-mapper.git', // Use the latest available
  foo4: { // Use the latest version available
    source: 'git@github.com:plucky-ci/plucky-mapper.git'
  },
  foo5: { // Use the tag of v1.0.0 only
    source: 'git@github.com:plucky-ci/plucky-mapper.git',
    tag: 'v1.0.0'
  },
  foo6: { // Use the tag of v1.0.0 only
    source: 'git@github.com:plucky-ci/plucky-mapper.git',
    sha: '2ec5ddc'
  },
}
```

**NOTE:** Name is extracted from source

What happens (basically):

```bash
if [ ! -d $projectPath/plugins/$name ]; then
  git clone $source $projectPath/plugins/$name
  if [ $tag | $sha ] ; then
    cd $projectPath/plugins/$name
    git reset --hard ($tag | $sha)
    cd $projectPath
  fi
fi
```

**NOTE:** Need to have some type of metadata file in there to say what the clone path, name, etc is for when we block load.

Of course, it isn't really that simple, because if it does exist but a new version is available and we haven't specified a version then we need to uprev the version, or if we updated the acceptable version then we need to uprev the version.

Now the plugin loader actually has a library of code that it can work with.  So, internally it can do the following:

```javascript
for(plugin in glob('/plugins/**/*')){
  this.plugins[plugin.name] = require(plugin)
}
```

Then when a process needs a plugin the mapper can return the instance it has cached:

```
return this.plugins[plugin.name]
```

**NOTE:** Of course we have to map it to the name requested by the process.
