var NwBuilder = require('nw-builder');
var fs = require('fs-extra');

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
  console.log('Coping INSTEAD to the MacOS X app...');
  var macInsteadPath = './mac/temp/Instead.app/';
  var macInsteadManPath = './nw-builder/InsteadMan/osx32/InsteadMan.app/Contents/';
  fs.copySync(macInsteadPath + 'Contents/Frameworks/', macInsteadManPath + 'Frameworks/');
  fs.copySync(macInsteadPath + 'Contents/MacOS/', macInsteadManPath + 'MacOS/');
  fs.copySync(macInsteadPath + 'Contents/Resources/', macInsteadManPath + 'Resources/');
  console.log('Coping done.');

  console.log('Coping INSTEAD to the Windows app...');
  var winInsteadPath = './windows/temp/Instead/';
  var winInsteadManPath = './nw-builder/InsteadMan/win32/';
  fs.copySync(winInsteadPath, winInsteadManPath);
  console.log('Coping done.');

  console.log('GNU/Linux changes...');
  var gnulinInsteadManPathes = {
    '32': './nw-builder/InsteadMan/linux32/',
    '64': './nw-builder/InsteadMan/linux64/'
  };
  var gnulinBuildPath = './linux/';

  for (var platform in gnulinInsteadManPathes) {
    fs.renameSync(gnulinInsteadManPathes[platform] + '/InsteadMan', gnulinInsteadManPathes[platform] + 'insteadman');
    fs.copySync(gnulinBuildPath + 'icon.png', gnulinInsteadManPathes[platform] + 'icon.png');
    fs.copySync(gnulinBuildPath + 'createdesktopfile', gnulinInsteadManPathes[platform] + 'createdesktopfile');
    fs.copySync(gnulinBuildPath + 'README', gnulinInsteadManPathes[platform] + 'README');
  }
  console.log('GNU/Linux changes done.');

  console.log('All done!');
}).catch(function (error) {
  console.error(error);
});
