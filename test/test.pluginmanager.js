const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();

const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;

const {
  PluginManager,
  plugins
} = require('../');

describe('PluginManager', ()=>{
  describe('getPackageDetails', ()=>{
    it('returns the package name for a basic package name', (done)=>{
      const packageInfo = plugins.getPackageDetails('foo');
      expect(packageInfo).to.be.an.object();
      expect(packageInfo.name).to.equal('foo');
      expect(packageInfo.version).to.be.undefined();
      return done();
    });

    it('returns the package name for a basic namespaced package', (done)=>{
      const packageInfo = plugins.getPackageDetails('@foo/foo');
      expect(packageInfo).to.be.an.object();
      expect(packageInfo.name).to.equal('@foo/foo');
      expect(packageInfo.version).to.be.undefined();
      return done();
    });

    it('returns the package name and version for a basic name with version', (done)=>{
      const packageInfo = plugins.getPackageDetails('foo@0.0.1');
      expect(packageInfo).to.be.an.object();
      expect(packageInfo.name).to.equal('foo');
      expect(packageInfo.version).to.equal('0.0.1');
      return done();
    });

    it('returns the package name and version for a basic name with version', (done)=>{
      const packageInfo = plugins.getPackageDetails('@foo/foo@0.0.1');
      expect(packageInfo).to.be.an.object();
      expect(packageInfo.name).to.equal('@foo/foo');
      expect(packageInfo.version).to.equal('0.0.1');
      return done();
    });
  }); // describe('getPackageDetails')

  it('can install and use a package given a baseDir', (done)=>{
    const p = new PluginManager({baseDir: __dirname+'/plugins'});
    p.get({'colors': 'colors'}, (err, packages)=>{
      expect(packages).to.be.an.object();
      expect(packages.colors).to.be.an.object();
      done();
    });
  });
});
