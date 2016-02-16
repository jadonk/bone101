import sys, smbus, time, signal
import math

# Function: Read a byte with the register address of ITG3200.         
# Parameter:-uint8_t,  _register,the register address  of ITG3200 to read 
# Return:	-int8_t,the byte that is read from the register.		  

bus = smbus.SMBus(1)

class ITG3200():
    global bus
    def __init__(self):
        self.GYRO_ADDRESS=0x68
        # ITG3200 Register Defines
        self.ITG3200_WHO=0x00
        self.ITG3200_SMPL=0x15
        self.ITG3200_DLPF=0x16
        self.ITG3200_INT_C=0x17
        self.ITG3200_INT_S=0x1A
        self.ITG3200_TMP_H=0x1B
        self.ITG3200_TMP_L=0x1C
        self.ITG3200_GX_H=0x1D
        self.ITG3200_GX_L=0x1E
        self.ITG3200_GY_H=0x1F
        self.ITG3200_GY_L=0x20
        self.ITG3200_GZ_H=0x21
        self.ITG3200_GZ_L=0x22
        self.ITG3200_PWR_M=0x3E
        
        self.x_offset = 0
	self.y_offset = 0
	self.z_offset = 0

# ********************************************************************
# Function: Initialization for ITG3200.         					  
    def init(self):  
        bus.write_byte_data(self.GYRO_ADDRESS, self.ITG3200_PWR_M, 0x80)
        bus.write_byte_data(self.GYRO_ADDRESS, self.ITG3200_SMPL, 0x00)
        bus.write_byte_data(self.GYRO_ADDRESS, self.ITG3200_DLPF, 0x18)

    def read(self, addressh, addressl):
        t_data = bus.read_byte_data(self.GYRO_ADDRESS, addressh)
        data = t_data << 8        
        data |= bus.read_byte_data(self.GYRO_ADDRESS, addressl)
        return data

# Function: Get the temperature from ITG3200 that with a on-chip
#            temperature sensor.                                
    def getTemperature(self):	
        temp = self.read(self.ITG3200_TMP_H, self.ITG3200_TMP_L)
        temperature = 35 + (temp + 13200) / 280
        return temperature

# Function: Get the contents of the registers in the ITG3200
#           so as to calculate the angular velocity.        
    def getXYZ(self):
        x = self.read(self.ITG3200_GX_H,self.ITG3200_GX_L) + self.x_offset
        y = self.read(self.ITG3200_GY_H,self.ITG3200_GY_L) + self.y_offset
        z = self.read(self.ITG3200_GZ_H,self.ITG3200_GZ_L) + self.z_offset
        return x, y, z
# Function: Get the angular velocity and its unit is degree per second.
    def getAngularVelocity(self):
        x,y,z = self.getXYZ()        
        ax = x/14.375
        ay = y/14.375
        az = z/14.375
        
        return ax, ay, az

    def zeroCalibrate(self, samples, sampleDelayMS): 
        self.x_offset = 0
        self.y_offset = 0
        self.z_offset = 0
	x_offset_temp = 0
	y_offset_temp = 0
	z_offset_temp = 0
        x,y,z = self.getXYZ()
        for i in range(samples):
	    time.sleep(sampleDelayMS/1000.0)
	    x,y,z = self.getXYZ()
	    x_offset_temp += x
	    y_offset_temp += y
	    z_offset_temp += z
        print "offet_temp ", x_offset_temp, x_offset_temp, x_offset_temp
        self.x_offset = abs(x_offset_temp)/samples
        self.y_offset = abs(y_offset_temp)/samples
        self.z_offset = abs(z_offset_temp)/samples
        if x_offset_temp > 0:
            self.x_offset = -self.x_offset
        if y_offset_temp > 0: 
            self.y_offset = -self.y_offset
        if z_offset_temp > 0:
            self.z_offset = -self.z_offset

if __name__=="__main__":
    gyro = ITG3200()
    gyro.init()
    gyro.zeroCalibrate(5, 5)
    print "offset: ", gyro.x_offset, gyro.y_offset, gyro.z_offset
    time.sleep(2)
    
    while True:
        print 'Temperature = ', gyro.getTemperature()
#        x, y, z = gyro.getXYZ()
#        print "x y z: ", x, y, z
        ax, ay, az = gyro.getAngularVelocity()
        print "ax = ", int(ax),"ay = ", int(ay),"az = ", int(az)
        time.sleep(0.5)
