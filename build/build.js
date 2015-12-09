var NwBuilder = require('nw-builder');
var nw = new NwBuilder({
  files: '../src/**', // use the glob format
  platforms: ['osx32', 'win32', 'linux32', 'linux64'],
  version: 'v0.12.3',
  cacheDir: './nw-builder/cache',
  buildDir: './nw-builder',
  buildType: 'default',
  macPlist: {CFBundleIdentifier: 'net.jhekasoft.insteadman.app'},
  macIcns: '../src/resources/images/logo.icns',
  winIco: '../src/resources/images/logo.ico'
});

nw.on('log', console.log);

// Build returns a promise
nw.build().then(function () {
  console.log('all done!');
}).catch(function (error) {
  console.error(error);
});
