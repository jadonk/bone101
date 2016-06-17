#!/usr/bin/env python
import Adafruit_BBIO.GPIO as GPIO
import time

pin = "P9_14"

GPIO.setup(pin, GPIO.OUT)

while True:
    GPIO.output(pin, GPIO.HIGH)
    time.sleep(0.5)
    GPIO.output(pin, GPIO.LOW)
    time.sleep(0.5)
