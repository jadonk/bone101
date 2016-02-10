#!/usr/bin/env ruby
require 'beaglebone'
include Beaglebone

# Create an led object for each LED
led1 = GPIOPin.new(:USR0, :OUT)
led2 = GPIOPin.new(:USR1, :OUT)
led3 = GPIOPin.new(:USR2, :OUT)
led4 = GPIOPin.new(:USR3, :OUT)

# Run the following block 5 times
5.times do
  # Iterate over each LED
  [led1,led2,led3,led4].each do |led|
    # Turn on the LED
    led.digital_write(:HIGH)
    # Delay 0.25 seconds
    sleep 0.25
    # Turn off the LED
    led.digital_write(:LOW)
  end
end