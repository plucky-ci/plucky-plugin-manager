const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const mkdirp = require('mkdirp');
const fs = require('fs');

const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const after = lab.after;
const expect = Code.expect;

const path = require('path');

const {
  removeFolder
} = require('../lib/utils');

const {
  PluginManager,
  plugins
} = require('../');

describe('PluginManager', {timeout: 30000}, ()=>{
  const pluginsFolder = __dirname+'/plugins';
  const noop = ()=>{};

  describe('getDetailsFromName', ()=>{
    it('returns the package name for a basic package name', (done)=>{
      const packageInfo = plugins.getDetailsFromName('foo');
      expect(packageInfo).to.be.an.object();
      expect(packageInfo.name).to.equal('foo');
      expect(packageInfo.version).to.be.undefined();
      return done();
    });

    it('returns the package name for a basic namespaced package', (done)=>{
      const packageInfo = plugins.getDetailsFromName('@foo/foo');
      expect(packageInfo).to.be.an.object();
      expect(packageInfo.name).to.equal('@foo/foo');
      expect(packageInfo.version).to.be.undefined();
      return done();
    });

    it('returns the package name and version for a basic name with version', (done)=>{
      const packageInfo = plugins.getDetailsFromName('foo@0.0.1');
      expect(packageInfo).to.be.an.object();
      expect(packageInfo.name).to.equal('foo');
      expect(packageInfo.version).to.equal('0.0.1');
      return done();
    });

    it('returns the package name and version for a basic name with version', (done)=>{
      const packageInfo = plugins.getDetailsFromName('@foo/foo@0.0.1');
      expect(packageInfo).to.be.an.object();
      expect(packageInfo.name).to.equal('@foo/foo');
      expect(packageInfo.version).to.equal('0.0.1');
      return done();
    });
  }); // describe('getDetailsFromName')

  describe('getPackageDetails', ()=>{
    it('can get details from a NPM registry package', (done)=>{
      plugins.getPackageDetails('async', (error, details)=>{
        expect(error).to.be.null();
        expect(details).to.be.an.object();
        expect(details.name).to.be.a.string();
        expect(details.version).to.be.a.string();
        return done();
      });
    });

    it('can get details from local package in a file', (done)=>{
      plugins.getPackageDetails(path.join(__dirname, 'modules', 'foo'), (error, details)=>{
        expect(error).to.be.null();
        expect(details).to.be.an.object();
        expect(details.name).to.be.a.string().and.to.equal('foo');
        expect(details.version).to.be.a.string().and.to.equal('1.0.0');
        return done();
      });
    });
  }); // describe('getPackageDetails')

  it('can install and use a package given a pluginsFolder', (done)=>{
    const p = new PluginManager({pluginsFolder});
    p.get({'colors': 'colors'}, (err, packages)=>{
      expect(packages).to.be.an.object();
      expect(packages.colors).to.be.an.object();
      done();
    });
  });

  it('can install and use multiple packages given a pluginsFolder', (done)=>{
    const p = new PluginManager({pluginsFolder});
    p.get({'fab': 'colors', 'lodash': 'lodash'}, (err, packages)=>{
      expect(packages).to.be.an.object();
      expect(packages.fab).to.be.an.object();
      expect(packages).to.be.an.object();
      expect(packages.lodash).to.be.a.function();
      done();
    });
  });

  it('can install and use a package from a directory', (done)=>{
    const p = new PluginManager({pluginsFolder});
    p.get({'foo': path.join(__dirname, 'modules', 'foo')}, (err, packages)=>{
      expect(packages).to.be.an.object();
      expect(packages.foo).to.equal('FOO');
      done();
    });
  });

  it('can use a package from the plugins folder', (done)=>{
    const pluginPath = path.join(pluginsFolder, 'bar');
    mkdirp(pluginPath, ()=>{
      fs.writeFileSync(path.join(pluginPath, 'package.json'), '{"name": "bar", "version": "1.0.0", "main": "index.js", "license": "ISC"}');
      fs.writeFileSync(path.join(pluginPath, 'index.js'), 'module.exports = "BAR";');
      const p = new PluginManager({pluginsFolder});
      p.get({'foo': 'bar'}, (err, packages)=>{
        expect(packages).to.be.an.object();
        expect(packages.foo).to.equal('BAR');
        done();
      });
    });
  });

  before((done)=>{
    removeFolder(pluginsFolder, done);
  });

  after((done)=>{
    removeFolder(pluginsFolder, done);
  });
});
