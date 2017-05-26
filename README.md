[![Build Status](https://travis-ci.org/beagleboard/bone101.svg?branch=gh-pages)](https://travis-ci.org/beagleboard/bone101)

bone101
=======

Getting started information for [BeagleBone and BeagleBone Black](http://beagleboard.org) written in
[BoneScript](http://beagleboard.org/bonescript)

The content here is presented by the default web server running with the demonstration Linux distributions
provided on BeagleBone and BeagleBone Black. It is written in HTML and makes use of the BoneScript server running
on the board and BoneScript JavaScript library running in these HTML pages.

Installed directory structure (/var/lib/cloud9)
===============================================

* README.md - This file
* LICENSE - Licenses for various components used in 'bone101'
* autorun - Directory to drop scripts in to run automatically on every reboot 
* examples - Directory with scripts and demos you can run on your board
* .c9 - Directory with configurations for Cloud9 IDE

Other places where bone101 gets installed
-----------------------------------------

* /usr/share/bone101 - The built files for serving via the default web server
* /usr/share/applications/bone101.desktop - Icon for opening a browser to 'bone101'
* /usr/local/lib/node\_modules - Libraries required by the examples other than bonescript

Building from source
====================

```sh
git clone https://github.com/beagleboard/bone101
cd bone101
sudo apt-get update
sudo apt-get install jekyll
make
sudo make install PREFIX=/usr
```

Style
=====

To simplify style conflicts, please use the following tools to clean-up the styles:
* JS/CSS/HTML: https://www.npmjs.com/package/js-beautify version 1.5.10
