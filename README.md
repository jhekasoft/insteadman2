![InsteadMan](https://raw.githubusercontent.com/jhekasoft/insteadman/master/src/resources/images/logo32x32.png "InsteadMan") InsteadMan
===========

Manager for INSTEAD interpreter. Version 2.
Old version is [here](https://github.com/jhekasoft/instead-manager).

Download
---------

Please download releases here: [http://instead.club](http://instead.club) .

![InsteadMan GUI](https://github.com/jhekasoft/insteadman/raw/master/src/resources/images/screenshot.png "InsteadMan GUI")

![InsteadMan GUI GNU/Linux](https://github.com/jhekasoft/insteadman/raw/master/src/resources/images/screenshot_gnulinux.png "InsteadMan GUI GNU/Linux")


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

Distribution
-------------

### GNU/Linux

**1. Pack `src` content to the ZIP archive with name `app.nw`**

```
zip -r app.nw .
```

**2. Run in directory with nw**

```
cat nw app.nw > insteadman && chmod +x insteadman
```

**3. Compress it**

```
tar -zcvf insteadman_2.0.1.tar.gz insteadman
```

### Mac OS X

**1. Create InsteadMan.app in the `build/mac` directory.**

**2. Build `dmg`-package**

```
npm install -g appdmg
```

At the `build/mac` directory:

```
appdmg dmg.json InsteadMan-2.0.1.dmg
```

### Windows

**1. Pack `src` content to the ZIP archive with name `app.nw`**

**2. Run in directory witn `nw.exe`**

```
copy /b nw.exe+app.nw instead.exe
```

![InsteadMan](https://github.com/jhekasoft/insteadman/raw/master/src/resources/images/logo.png "InsteadMan")
