BeagleBone User Interface
=========================

This is a UI that allows a user to interact with a BeagleBone with minimal to no coding experience. This allows a user to communicate to the board and use the ADC pins, digital (inputs, outputs, pwms) pins, and the user LEDs located at the top of the board. The only requirement is that the desired circuit is correct for the code to function properly. The code assumes that the BoneScript server using socket.io is running on the target board on the default port (80). The main example index.html file contains the user interface and interactions from the user are sent to the js file, which uses socket.io to communicate to the board.

Served locally
--------------

The UI runs on http://yourbeagleboneip/bone101/Support/UI/ as long as this version of the bone101 library is installed to /var/lib/clou9 and the BoneScript server is running. Changes can be made to the file locations and filenames at the top of the js file.

Served on Github Pages
----------------------

This UI can be run by visiting http://beagleboard.github.io/bone101/Support/bone101/UI/ with a BeagleBone connected locally via USB or on the network. If the board is not automatically discovered, you'll need to type in the IP address of the board
