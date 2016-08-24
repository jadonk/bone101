# BeagleBone User Interface
This is a UI that allows a user to interact with a BeagleBone with minimal to no coding experience. This allows a user to communicate to the board and use the ADC pins, digital (inputs, outputs, pwms) pins, and the user LEDs located at the top of the board. The only requirement is that the desired circuit is correct for the code to function properly. The code assumes that the BoneScript server using socket.io is running on the target board on the default port (80). The main example index.html file contains the user interface and interactions from the user are sent to the js file, which uses socket.io to communicate to the board.

## Served locally
The UI runs on http://yourbeagleboneip/bone101/Support/UI/ as long as this version of the bone101 library is installed to /var/lib/cloud9 and the BoneScript server is running. Changes can be made to the file locations and filenames at the top of the js file.

## Served on Github Pages
This UI can be run by visiting http://beagleboard.github.io/bone101/Support/bone101/UI/ with a BeagleBone connected locally via USB or on the network. If the board is not automatically discovered, you'll need to type in the IP address of the board.

## BBUI Code Guide

  1. [BBUI](#bbui)
  1. [IIFE](#iife)
  1. [Canvas](#canvas)
  1. [Hardware](#hardware)
  1. [UI](#ui)
  1. [Events](#events)
  
## BBUI
This script renders the UI, reacts to user input and calls the BoneScript functions for hardware interaction. Including this script exposes 1 initialization function called 'bbui' and is built as 4 classes:
 * Canvas: fetches the canvas elements from the HTML page and expose them to the rest of BBUI.
 * Hardware: modifies, fetches and exposes the hardware status using BoneScript calls.
 * UI: renders the user interface and provides methods for updating the rendering.
 * Events: reponds to input provided by the user and calls UI methods for updating the display.

## IIFE
  - BBUI components is wraped in an Immediately Invoked Function Expression (IIFE).
  
  *Why?* : An IIFE removes variables from the global scope. This helps prevent variables and function declarations from living longer than expected in the global scope, which also helps avoid variable collisions.

  *Why?* : The code is minified and bundled into a single file for convienient access. An IIFE protects BBUI components against collisions of variables and many global variables by providing variable scope for each class.

<p align="center">
  <img src="http://i1064.photobucket.com/albums/u367/Amr_Ragaey/iiefe2_zps1nkgcl5e.png?raw=true" alt="IIEFE Style in BBUI"/>
</p>

## Canvas
The Canvas class grabs 9 HTML canvas elements each rendered at 1224x600 pixels on top of each other.
* Base: is the canvas with BeagleBone and other unchanging elements and is rendered at z-index 1 (background).
* BTN: is the canvas that draws buttons and corresponding elements and is rendered at z-index 2 (just above the background).
* Active: is the active canvas, constantly being cleared and redrawn by UI and is rendered at z-index 10.
* LED0-LED3: are 4 separate canvases for LEDs so they can redraw at different rates and are rendered at z-indexes 11-14.
* Bar: is the canvas for slider bars and is rendered at z-index 8.
* Graph: is the canvas for the graph controls and is rendered at z-index 9.

```javascript
• function init()
```
initializes different canvas layers of bbui, and returns the canvas object. Each canvas exposes and element (e) and a context (ctx).

- use `var canvas = Canvas.get();` to fetch the canvas.
- use `canvas[layer].e` to get a layer element.
- use `canvas[layer].ctx` is used to get a layer context


```javascript
• function add(id, zIndex)
```
It is used to add additional canvases beyond the initial 9 with new z-index value. It is used to add probes and graphs as will be described in the UI class. The created canvas is attached to the html div element of id = 'canvasdiv'.

**arguments**:

- id:  element id that creates the canvas.
- z-index: normally uses value 10, or above.

_example_: Canvas.add(pin.id + ' Graph', 10); 'creates a canvas for specific pin'

## UI

The UI provides the user interface drawing and interaction logic, and initializes global positions of BBUI elements. Each element position is related mainly to two variables BBposX and BBposY.

```javascript
• function init()
```
The init function defines all the methods used to draw different elements/objects in the Bonecard. Each method is an IIEFE, we will go for each one explaining its functionality and sub-methods.

- use `var ui = UI.get();` to fetch the user interface object.

```javascript
 ui.button = (function() {
    var button = {};
    /* 
     * button objects
     * are defined here
    */
  })
```
`ui.button`, an IIFE provides major buttons used in BBUI with different attributes; starting and ending position of the button, the color, the text on the button, the offColor, the graph line colors, and the category of each group of buttons. The major buttons objects are: analog, digital, ground, power, led, input, output, pwm, onOff, plus, minus, stop, play, exit, digitalMenu. `ui.button` wraps the functions used to draw and interact with buttons.

