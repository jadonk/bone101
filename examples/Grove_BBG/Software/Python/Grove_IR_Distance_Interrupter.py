#!/usr/bin/env python
import Adafruit_BBIO.GPIO as GPIO
import time
import os

if __name__ == "__main__":
   GPIO.setup("P9_19",GPIO.IN)

   while True:
      try:
         if GPIO.input("P9_19") == GPIO.LOW:
             print "found something"
         else:
            print "nothing"
         time.sleep(0.5)
      except IOError:
         print "Error"
