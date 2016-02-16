#!/usr/bin/python
# This is only a demo by Kevin Lee
import time
import Adafruit_BMP.BMP085 as BMP085
import Adafruit_BBIO.ADC as ADC 
from Adafruit_I2C import Adafruit_I2C

# this device has two I2C addresses


DisplayRGB = Adafruit_I2C(0x62)
DisplayText = Adafruit_I2C(0x3e)

sensor = BMP085.BMP085()
dot = [0b00111,\
       0b00101,\
       0b00111,\
       0b00000,\
       0b00000,\
       0b00000,\
       0b00000,\
       0b00000]
# set backlight to (R,G,B) (values from 0..255 for each)
def setRGB(r,g,b):
	DisplayRGB.write8(0,0)
	DisplayRGB.write8(1,0)
	DisplayRGB.write8(0x08,0xaa)
	DisplayRGB.write8(4,r)
	DisplayRGB.write8(3,g)
	DisplayRGB.write8(2,b)
	
# send command to display (no need for external use)    
def textCommand(cmd):
	DisplayText.write8(0x80,cmd)
#    bus.write_byte_data(DISPLAY_TEXT_ADDR,0x80,cmd)

# set display text \n for second line(or auto wrap)     
def setText(text):
    textCommand(0x01) # clear display
    time.sleep(.05)
    textCommand(0x08 | 0x04) # display on, no cursor
    textCommand(0x28) # 2 lines
    time.sleep(.05)
    count = 0
    row = 0
    for c in text:
        if c == '\n' or count == 16:
            count = 0
            row += 1
            if row == 2:
                break
            textCommand(0xc0)
            if c == '\n':
                continue
        count += 1
        DisplayText.write8(0x40,ord(c))

def createChar(location, charmap):
    data = [0 for i in range(10)];
    for i in range(0,8):
        data[i] = charmap[i]
    data.insert(0,(0x40|(location<<4)))
    data.insert(1,0x40)
    DisplayText.writeList(0x80,data)
  
        
def myloop():
    setText("Hello world\nIt is a BBG Demo")
    temp = sensor.read_temperature()    
    if temp > 30:
	    for c in range(0,255):
	        setRGB(c,255-c,0)
            time.sleep(0.02)
    elif temp < 25:
        for c in range(0,255):
            setRGB(0,255-c,c)
            time.sleep(0.02)
    else :
        for c in range(0,255):
            setRGB(0,255,0)
            time.sleep(0.02)
    
    temper = 'Temper: \n {0:0.2f}'.format(sensor.read_temperature()) + chr(0) + 'C'
    setText(temper)
    for c in range(0,255):
        time.sleep(0.02)
    pressure = 'Pressure: \n {0:0.2f} KPa'.format(sensor.read_pressure()/1000)
    setText(pressure)
    for c in range(0,255):
        time.sleep(0.02)
	
    Altitude = 'Altitude: \n {0:0.2f} m'.format(sensor.read_altitude())
    setText(Altitude)
    for c in range(0,255):
        time.sleep(0.02)
	
    print 'Temp \n {0:0.2f} *C'.format(sensor.read_temperature())
    print 'Pressure \n {0:0.2f} Pa'.format(sensor.read_pressure())
    print 'Altitude \n {0:0.2f} m'.format(sensor.read_altitude())
    print 'Sealevel Pressure = {0:0.2f} Pa'.format(sensor.read_sealevel_pressure())
    myloop()
# example code
if __name__=="__main__":
    ADC.setup()
    createChar(0,dot)
#     setText("Hello world\nIt is a BBG Demo")
#     setRGB(0,255,0)
#     for c in range(0,255):
#         setRGB(c,255-c,0)
#         time.sleep(0.02)
# 	setRGB(0,255,0)
	
#     temper = 'Temp = {0:0.2f} *C'.format(sensor.read_temperature())
#     setText(temper)
#     for c in range(0,255):
#         setRGB(c,255-c,0)
#         time.sleep(0.02)
# 	setRGB(0,255,0)
	
#     pressure = 'Pressure = {0:0.2f} KPa'.format(sensor.read_pressure()/1000)
#     setText(pressure)
#     for c in range(0,255):
#         setRGB(c,255-c,0)
#         time.sleep(0.02)
# 	setRGB(0,255,0)
	
#     Altitude = 'Altitude = {0:0.2f} m'.format(sensor.read_altitude())
#     setText(Altitude)
#     for c in range(0,255):
#         setRGB(c,255-c,0)
#         time.sleep(0.02)
# 	setRGB(0,255,0)
	
#     print 'Temp = {0:0.2f} *C'.format(sensor.read_temperature())
#     print 'Pressure = {0:0.2f} Pa'.format(sensor.read_pressure())
#     print 'Altitude = {0:0.2f} m'.format(sensor.read_altitude())
#     print 'Sealevel Pressure = {0:0.2f} Pa'.format(sensor.read_sealevel_pressure())
    myloop()
