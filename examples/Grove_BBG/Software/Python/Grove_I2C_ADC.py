from Adafruit_I2C import Adafruit_I2C
import time

ADDR_ADC121 = 0x50

REG_ADDR_RESULT = 0x00
REG_ADDR_ALERT = 0x01
REG_ADDR_CONFIG = 0x02
REG_ADDR_LIMITL = 0x03
REG_ADDR_LIMITH = 0x04
REG_ADDR_HYST = 0x05
REG_ADDR_CONVL = 0x06
REG_ADDR_CONVH = 0x07

getData = int()
analogVal = int()

i2c = Adafruit_I2C(ADDR_ADC121)        

class I2C_ADC():
    def __init__(self):
        i2c.write8(REG_ADDR_CONFIG, 0x20)
        
    def read_adc(self):     
        data = i2c.readS16(REG_ADDR_RESULT)      
        return data
        
if __name__=="__main__":
    adc = I2C_ADC()
    while True:
        print 'sensor value ', adc.read_adc()
        time.sleep(.2)        
