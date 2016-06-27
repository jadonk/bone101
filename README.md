[![Build Status](https://travis-ci.org/beagleboard/bone101.svg?branch=gh-pages)](https://travis-ci.org/beagleboard/bone101)

bone101
=======

Getting started information for [BeagleBone and BeagleBone Black](http://beagleboard.org) written in
[BoneScript](http://beagleboard.org/bonescript)

The content here is presented by the default web server running with the demonstration Linux distributions
provided on BeagleBone and BeagleBone Black. It is written in HTML and makes use of the BoneScript server running
on the board and BoneScript JavaScript library running in these HTML pages.

Directory structure
===================

* autorun - Directory to drop scripts in to run automatically on every reboot 
* examples - Directory with scripts and demos you can run on your board
* favicon.ico - The icon for the bone101 web pages (shows up in browser tabs)
* index.html - The starting bone101 page that redirects to Support/bone101/index.html
* static - Directory with non-HTML bone101 web content (javascript, css, images, etc.)
* Support - Directory with HTML bone101 web content (directory structure matches URLs) 

Style
=====

To simplify style conflicts, please use the following tools to clean-up the styles:
* JS/CSS/HTML: https://www.npmjs.com/package/js-beautify version 1.5.10
