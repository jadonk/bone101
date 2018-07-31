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

The UI provides the user interface drawing and interaction logic, and initializes global positions of BBUI elements. Each element position is related mainly to two variables **`BBposX`** and **`BBposY`**.

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

```javascript
○ button.test = function(event)
```
Use this method to return button object name.

```javascript
○ button.highlight = function(highlightButton)
```
Use to highlight analog, digital, power, ground, led buttons.
if you want to keep the button highlighted, set `highlightButton = true`.

```javascript
○ button.highlightDigital = function(highlightButton)
```
Use to highlight digital menu buttons (input, output, pwm).
if you want to keep the button highlighted, set highlightButton = true.

```javascript
○ button.highlightPlus = function(flag)
```
Used to highlight the zoom-in button, if flag is true, color will change from black to red, otherwise changes from red to black.

```javascript
○ button.highlightMinus = function(flag)
```
Use to highlight the zoom-out button, if flag is true, color will change from black to red, otherwise changes from red to black.
```javascript
○ button.highlightStop = function(flag)
```
Use to highlight the stop button, if flag is true, color will change from black to red, otherwise changes from red to black.
```javascript
○ button.highlightPlay = function(flag)
```
Use to highlight the play button, if flag is true, color will change from black to red, otherwise changes from red to black.
```javascript
○ button.draw = function(b, context, highlight, x, y)
```
Use the draw function to draw the main buttons and probes. make `highlight = true` when dragging a button into graph otherwise the highlight is false.

**arguments**:

- b: button object name.
- context: the drawing context, use `BTN` for probes, `Active` for dragging and highlighting, and `Graph` for (plus, minus, stop, play)
- highlight: true for highlighting (using `offColor`).
- x,y: only defined for custom buttons positions.

```javascript
○ button.createOutput = function()
```
createOutput is used to create output button for input probe, when user drags an input button into graph and selects a pin, this output button is created.

```javascript
○ button.drawGraphbtn = function(b, context)
```
Use drawGraphbtn to draw the buttons of graph; play, stop, zooming buttons.

**arguments**:
- b: the graph button name.
- context: use `Active` context.

```javascript
○ button.push = function(b, output)
```
The function initially creates a new button object referenced by **`probeIndex`**; a local variable initially set to zero and incremented after each push. The push function sets properties to the new object; object name, x&y position of button, and button status. Status property is set to `probe` to uniquefies the button in buttons object in looping.

**arguments**:
- b: button object name.
- output: is set to `true` only for the output button created from input probe. It sets unique position for this output.

```javascript
○ button.pop = function()
```
Use this method to delete the latest button added in buttons object.
the method returns the deleted button object.

```javascript
○   button.get = function()
```
Use this method to return buttons object.

```javascript
ui.bar = (function () {
    var bar = {};
    /*
     * slider bar objects
     * are defined here
    */
  })
```
`ui.bar`, an IIFE provides slider bars used in BBUI with different attributes; starting and ending position of the sliderbar, the color, the text on the side of the slider bar , type(pwm , motor , servo ..etc) and the category of each slider bar.
 `ui.bar` wraps the functions used to draw and interact with slider bars.

 ```javascript
 ○   bar.create = function(probe,pin)
 ```
 **arguments**:
 - probe: the probe object corresponding to which slider is to be created.
 - pin: the pin to be attached to the slider bar.

 Use this method to create a single slider bar corresponding to the pin and probe, the attributes of the sliderbar are determined by the properties of the pin and probe, the properties of pin corresponding to a bar can be accessed using `bars[i].pin`, the category of the slider bar is decided by the pin category, the pin.freq variable is changed corresponding to the slider bar movement

 ```javascript
 ○   bar.createRGBBar = function(probe,pin)
 ```
 **arguments**:
 - probe: the probe object corresponding to which slider is to be created.
 - pin: the pin to be attached to the slider bar.

 Use this method to create a group of three slider bars having similar properties as the above single slider bar, but overrides the color properties of the pin/probe, the rgb slider bars will have red , green and blue colors which will change the properties pin.red , pin.blue , pin. green (between 0 and 1) respectively.

 ```javascript
 ○   bar.draw = function(index)
 ```
 **arguments**:
 - index: the index of the bar to be drawn in bars[] (default = len - 1).

 Use this method to draw the last created slider bar / draw a slider bar with the corresponding index.

 ```javascript
 ○   bar.off = function()
 ```

 changes the `move` state of each bar to off , ie . the bars does not respond to slider changes.

 ```javascript
 ○   bar.move = function(event)
 ```

 This method moves the sliderBar to the event location and changes the pin.freq(or pin.red ,pin. green , pin.blue) value and changes the text on the side of the sliderBar.

 ```javascript
 ○   bar.sliderTest = function(event)
 ```

 This method returns "slider" when event coordinates are inside a black square slider.

 ```javascript
 ○   bar.test = function(event)
 ```

 This method returns "slider" when event coordinates are inside the entire sliderbar.

 ```javascript
 ui.onOff = (function () {
     var onOff = {};
     /*
      * onOff button objects
      * are defined here
     */
   })
 ```
`ui.onOff`, an IIFE provides onOff buttons for probes used in BBUI with different attributes; starting and ending position of the button, the color, the text inside the buttons.
`ui.onOff` wraps the functions used to draw and interact with On-Off buttons.

```javascript
○   onOff.create = function(probe,pin)
```
**arguments**:
- probe: the probe object corresponding to which button is to be created.
- pin: the pin to be attached to the buttons.

Use this method to create a onOff button attached to the pin and probe, the attributes of the buttons are determined by the properties of the pin and probe, the properties of pin corresponding to a onOff button can be accessed using `onoffs[i].pin`,the pin.state variable is changed corresponding to the OnOff button state.

```javascript
○   onOff.on = function(index)
```
**arguments**:
- index: the index of the button to be drawn in onOffs[] (default = len - 1)s.

Use this method to draw a onOff button attached to the pin with default On position, this also changes the pin.state value to 1.

```javascript
○   onOff.off = function(index)
```
**arguments**:
- index: the index of the button to be drawn in onOffs[] (default = len - 1)s.

Use this method to draw a onOff button attached to the pin with default Off position, this also changes the pin.state value to 0.

_PS. each of the following two functions draws a layer, one for the on switch and another for off switch. The two layers overlap each other to make the on/off switch._
```javascript
○   onOff.test = function(event)
```

This method returns "probeon" or "probeoff" when event coordinates are inside the on or off regions of the button respectively.

`ui.pin`, an IIFE provides pin defintions for boards used in BBUI with different attributes: name, position, size, category of pins corresponding to each board.
`ui.pin` wraps the functions used to highlight and interact with the board pins.

```javascript
○   pin.highlight = function(button, digitalHighlight)
```
**arguments**:
- button: the selected or hovered button object.
- digitalHighlight: boolean value whether the selected button is a digital button.

Use this method to highlight the pins corresponding to a selected button category, the highlight color is determined accorinding to the board color.

```javascript
○   pin.getVoltage = function(pn)
```
**arguments**:
- pin: the selected pin object for which the voltage state is to be read and plotted to the graph.

Use this method to retrieve the current voltage status of the corresponding pin , the Hardware.read() method and graph plotting methods are called by this method


```javascript
○   pin.blink = function(pn)
```
**arguments**:
- pin: the selected pin object for which the state is to be written and is to be reflected to the UI.

Use this method to write a corresponding value to the pin , also if the pin supports blinking(w.r.t BBUI : leds,DigitalOutputs), the pin is set to blinking state with the corresponding frequency, this method also updates the UI elements(draws blinking leds) according to the change made.

```javascript
○   pin.test = function(event)
```

This method returns the pin object corresponding to the event coordinates.

`ui.wire`, an IIFE provides different wires used in BBUI corresponding to join each category of buttons with the corresponding pins and to the graph.
`ui.wire` wraps the different styles of wire drawing functions corresonding to each category of buttons.

```javascript
 ui.probe = (function() {
    var probe = {};
    /*
     * probe objects
     * are defined here
    */
  })
```
`ui.probe`, an IIFE provides the probes used in BBUI with different attributes; each element inserted into the UI is termed as a probe.
`ui.probe` wraps the functions used to draw and interact with UI probes.


```javascript
○ probe.push = function(button)
```
This function pushes the button to the probes variable, which defines the button to be used as a probe in future.

**arguments**:
- button: button object to be pushed.

```javascript
○ probe.dragButton= function(event)
```
This function draws the button around the event coordinates while it is being dragged into the container.

```javascript
○ probe.clearDrag= function(event)
```
This function clears the duplicate buttons while dragging it to the container.

```javascript
○ probe.selectText= function()
```
This function display the user prompt to select the pin corresponding to the button and also the warning for the selected category of button(if any).

```javascript
○ probe.addTest= function(event)
```
This function returns "hoverpin" when the button is dragged into the container(white rectangle) or "cancelled" otherwise.
