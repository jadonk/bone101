BeagleBone User Interface
=========================

This is a UI that allows a user to interact with a BeagleBone with minimal to no coding experience. This allows a user to communicate to the board and use the ADC pins, digital (inputs, outputs, pwms) pins, and the user LEDs located at the top of the board. The only requirement is that the desired circuit is correct for the code to function properly. The code assumes that the BoneScript server using socket.io is running on the target board on the default port (80). The main example index.html file contains the user interface and interactions from the user are sent to the js file, which uses socket.io to communicate to the board.

Served locally
--------------
The UI runs on http://yourbeagleboneip/bone101/Support/UI/ as long as this version of the bone101 library is installed to /var/lib/cloud9 and the BoneScript server is running. Changes can be made to the file locations and filenames at the top of the js file.

Served on Github Pages
----------------------
This UI can be run by visiting http://beagleboard.github.io/bone101/Support/bone101/UI/ with a BeagleBone connected locally via USB or on the network. If the board is not automatically discovered, you'll need to type in the IP address of the board

bbui.js
=======
This script renders the UI, reacts to user input and calls the BoneScript functions for hardware interaction. Including this script exposes 1 initialization function called 'bbui' and is built as 4 classes:
* Canvas: fetches the canvas elements from the HTML page and expose them to the rest of BBUI.
* Hardware: modifies, fetches and exposes the hardware status using BoneScript calls.
* UI: renders the user interface and provides methods for updating the rendering.
* Events: reponds to input provided by the user and calls UI methods for updating the display.

Canvas
------
The Canvas class grabs 9 HTML canvas elements each rendered at 1224x600 pixels on top of each other.
* Base: is the canvas with BeagleBone and other unchanging elements and is rendered at z-index 1 (background).
* BTN: is the canvas that draws buttons and corresponding elements and is rendered at z-index 2 (just above the background).
* Active: is the active canvas, constantly being cleared and redrawn by UI and is rendered at z-index 10.
* LED0-LED3: are 4 separate canvases for LEDs so they can redraw at different rates and are rendered at z-indexes 11-14.
* Bar: is the canvas for slider bars and is rendered at z-index 8.
* Graph: is the canvas for the graph controls and is rendered at z-index 9.

Each canvas exposes and element (e) and a context (ctx).

Additional canvases beyond the initial 9 are added using the Canvas 'add' method. It is used to add probes and graphs as will be described in the UI class. The 'add' method takes in z-index as an argument, but today they are all added at z-index 10.
