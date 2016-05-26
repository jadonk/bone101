import smbus
import time

bus = smbus.SMBus(1)


class MMA7660():
    def __init__(self):
       self.MMA7660_ADDR  = 0x4c

       self.MMA7660_X     = 0x00
       self.MMA7660_Y     = 0x01
       self.MMA7660_Z     = 0x02
       self.MMA7660_TILT  = 0x03
       self.MMA7660_SRST  = 0x04
       self.MMA7660_SPCNT = 0x05
       self.MMA7660_INTSU = 0x06
       self.MMA7660_MODE  = 0x07
       self.MMA7660_STAND_BY = 0x00
       self.MMA7660_ACTIVE   = 0x01   
       self.MMA7660_SR    = 0x08        #sample rate register
       self.AUTO_SLEEP_120  = 0X00      #120 sample per second
       self.AUTO_SLEEP_64   = 0X01
       self.AUTO_SLEEP_32   = 0X02
       self.AUTO_SLEEP_16   = 0X03
       self.AUTO_SLEEP_8    = 0X04
       self.AUTO_SLEEP_4    = 0X05
       self.AUTO_SLEEP_2    = 0X06
       self.AUTO_SLEEP_1    = 0X07
       self.MMA7660_PDET  = 0x09
       self.MMA7660_PD    = 0x0A
        
       self.setMode(self.MMA7660_STAND_BY)
       self.setSample(self.AUTO_SLEEP_32)
       self.setMode(self.MMA7660_ACTIVE)
       
    def setMode(self, mode):
        bus.write_byte_data(self.MMA7660_ADDR, self.MMA7660_MODE, mode)
    
    def setSample(self, rate):
        bus.write_byte_data(self.MMA7660_ADDR, self.MMA7660_SR, rate)
        
    def getXYZ(self):
        val = [0 for i in range(3)]
        val[0] = val[1] = val[2] = 64
        count = 0
        #while i2c avaliable
#        while True:
#            if count < 3:
#                while val[count] > 63:
#                    val[count] = bus.read_byte(self.MMA7660_ADDR)
#                count += 1
#            else:
#               break               
        val = bus.read_i2c_block_data(self.MMA7660_ADDR,0x00)        
#        print val
        return val
    
    def getAccelerometer(self):
        x,y,z = self.getXYZ()[:3]              
        x, y, z = x*4,y*4,z*4
        if x>127:
            x = x-256
        if y>127:
            y=y-256
        if z>127:
            z=z-256        
        return x/4/21.0, y/4/21.0, z/4/21.0
        
        
if __name__=="__main__":
    acc = MMA7660()
    while True:
        ax,ay,az = acc.getAccelerometer()
        print 'ax=%.2f'%(ax),'ay=%.2f'%(ay),'az=%.2f'%(az)
        time.sleep(.1)
        
        
                
                
                
                