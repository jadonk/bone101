import Adafruit_BBIO.ADC as ADC
import time

#Connect Grove UV Sensor to P9_40

ADC.setup()

while True:
    value = ADC.read("P9_40")
    voltage = value * 1.8 #1.8V
    print "method_1:",voltage,"V"
    print "method_2:", ADC.read_raw("AIN1"),"mV"
    time.sleep(0.5)

