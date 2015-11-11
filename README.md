InsteadMan
===========

Manager for INSTEAD interpreter. Version 2.0. There is beta version.
First version is [here](https://github.com/jhekasoft/instead-manager).

![alt text](https://github.com/jhekasoft/insteadman/raw/master/src/resources/images/screenshot.png "InsteadMan GUI")

Development run
----------------
In `src` dir:

```
npm install
```

Run in `src` dir:

```
path\to\nwjs .
```

Distribution
-------------

### Mac OS X

**1. Create InsteadMan.app in the `build` directory.**

**2. Build `dmg`-package**

```
npm install -g appdmg
```

At the `build` directory:

```
appdmg dmg.json InsteadMan-2.0.1.dmg
```

### Windows

**1. Pack `src` content to the `app.nw`.

**2. Run in directory witn nw.exe:

```
copy /b nw.exe+app.nw instead.exe
```

![alt text](https://github.com/jhekasoft/insteadman/raw/master/src/resources/images/logo.png "InsteadMan")
