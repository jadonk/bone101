import smbus
import time


addr = 0x50
bus=smbus.SMBus(1)

def get_heartRate():
    try:
        tmp=bus.read_byte(addr)        
        time.sleep(.5)
    except IOError: 
        print 'Error'
        return -1
    return tmp

while True:
    print get_heartRate()
        
