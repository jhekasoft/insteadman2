const nwjsBuilder = require('nwjs-builder-phoenix');
const fs = require('fs-extra');

const builder = new nwjsBuilder.Builder({
  // win: true,
  // mac: true,
  // linux: true,
  // x86: true,
  // x64: true,
  tasks: ['win-x86', 'mac-x64', 'linux-x86', 'linux-x64'],
  mute: false
}, ".");

// nw.on('log', console.log);

// Build returns a promise
builder.build().then(function () {
  console.log('Coping INSTEAD to the macOS app...');
  const buildDir = '../build'
  const distDir = buildDir + '/dist';
  const appName = 'InsteadMan';
  const linux = 'linux';
  const macos = 'mac';
  const win = 'win';
  const x86 = 'x86';
  const x64 = 'x64';

  const macInsteadPath = buildDir + '/' + macos + '/temp/Instead.app/';
  const macInsteadManPath = distDir + '/' + appName + '-' + macos + '-' + x64 + '/' + appName + '.app/Contents/';
  fs.copySync(macInsteadPath + 'Contents/Frameworks/', macInsteadManPath + 'Frameworks/');
  fs.copySync(macInsteadPath + 'Contents/MacOS/', macInsteadManPath + 'MacOS/');
  fs.copySync(macInsteadPath + 'Contents/Resources/', macInsteadManPath + 'Resources/');
  console.log('Coping done.');

  console.log('Coping INSTEAD to the Windows app...');
  const winInsteadPath = buildDir + '/' + win + '/temp/INSTEAD/';
  const winInsteadManPath = distDir + '/' + appName + '-' + win + '-' + x86 + '/';
  fs.copySync(winInsteadPath, winInsteadManPath);
  fs.removeSync(winInsteadManPath + "unins000.exe");
  fs.removeSync(winInsteadManPath + "unins000.dat");
  console.log('Coping done.');

  console.log('GNU/Linux changes...');
  const gnulinInsteadManPathes = {
    '32': distDir + '/' + appName + '-' + linux + '-' + x86 + '/',
    '64': distDir + '/' + appName + '-' + linux + '-' + x64 + '/'
  };
  const gnulinBuildPath = buildDir + '/' + linux + '/';

  for (let platform in gnulinInsteadManPathes) {
    fs.renameSync(gnulinInsteadManPathes[platform] + appName, gnulinInsteadManPathes[platform] + appName.toLowerCase());
    fs.copySync(gnulinBuildPath + 'icon.png', gnulinInsteadManPathes[platform] + 'icon.png');
    fs.copySync(gnulinBuildPath + 'createdesktopfile', gnulinInsteadManPathes[platform] + 'createdesktopfile');
    fs.copySync(gnulinBuildPath + 'README', gnulinInsteadManPathes[platform] + 'README');
  }
  console.log('GNU/Linux changes done.');

  console.log('All done!');
}).catch(function (error) {
  console.error(error);
});
