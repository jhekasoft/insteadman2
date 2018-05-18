![InsteadMan](https://raw.githubusercontent.com/jhekasoft/insteadman/master/src/resources/images/logo32x32.png "InsteadMan") InsteadMan
==============

Manager for INSTEAD interpreter. Version 2. Official site is here: http://jhekasoft.github.io/insteadman/en/.

New version is [here](https://github.com/jhekasoft/insteadman3).

Old version is [here](https://github.com/jhekasoft/instead-manager).

Download
---------

Please download releases here: https://github.com/jhekasoft/insteadman2/releases.

![InsteadMan GUI](https://github.com/jhekasoft/insteadman2/raw/master/src/resources/images/screenshot.png "InsteadMan GUI")

![InsteadMan GUI GNU/Linux](https://github.com/jhekasoft/insteadman2/raw/master/src/resources/images/screenshot_gnulinux.png "InsteadMan GUI GNU/Linux")


Development run
----------------
In `src` dir:

```
npm install
```

Run in `src` dir:

```
path/to/nwjs .
```

Building and distribution
--------------------------

On any OS. Go to the `src` directory in console and install npm packages:

```
npm install
```

Download, extract and copy MacOS X INSTEAD interpreter to the `../build/mac/temp/Instead.app/` directory,

Windows INSTEAD interpreter files to the `../build/windows/temp/INSTEAD/` (`sdl-instead.exe`, `stead`, `themes`, etc.)

Then build for all the OS:

```
node build.js
```

We have built results in `../build/dist/`.

### GNU/Linux

UNIX-like OS or OS with GNU utils.
Compress `../build/dist/InsteadMan-linux-x86` and `../build/dist/InsteadMan-linux-x64` to the tar.gz like:

```
tar -zcvf insteadman_2.1.0-x64.tar.gz dir
```

### Mac OS X

Only on MacOS X. Build `dmg`-package

```
npm install -g appdmg
```

At the `../build/mac` directory:

```
appdmg dmg.json InsteadMan-2.1.0.dmg
```

### Windows

All OS. Zip `../build/nw-builder/InsteadMan/win32`.

Only on Windows. Create installer in the InnoSetup (32 bit, multilingual) with script
`build/windows/setup.iss` (you should have complete `insteadman` directory with built
results).

![InsteadMan](https://github.com/jhekasoft/insteadman2/raw/master/src/resources/images/logo.png "InsteadMan")

Changelog
----------
See https://github.com/jhekasoft/insteadman2/releases.
