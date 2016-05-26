#

import time
import smbus
import sys
import serial
from visualscope import *

bus = smbus.SMBus(1)
ser = serial.Serial(port = "/dev/ttyO2", baudrate=19200)

class MPU9250():
    MPU9250_I2C_ADDR = 0x68
    accX = 0
    accY = 0
    accZ = 0
    gyroX = 0
    gyroY = 0
    gyroZ = 0  
    tempOut = 0    
    #the offset of gyro
    gyrXoffs = 0
    gyrYoffs = 0
    gyrZoffs = 0
    FREQ = 30   #sample freq in Hz
    def __init__(self):                
        bus.write_byte_data(self.MPU9250_I2C_ADDR, 0x6b, 0x00)    #PWR_MGMT_1: wake up
        bus.write_byte_data(self.MPU9250_I2C_ADDR, 0x1a, 0x01)    #CONFIG:  Low pass filter samples, 1khz sample rate
        bus.write_byte_data(self.MPU9250_I2C_ADDR, 0x1b, 0x08)    #GYRO_CONFIG: 500 deg/s, FS_SEL=1, This means 65.5 LSBs/deg/s 
        
        #CONFIG: set sample rate, sample rate FREQ=Gyro sample rate / (sample_div + 1)
        #1KHz / (div + 1) = FREQ
        #reg_calue = 1KHz/FREQ - 1      
        #sample_div = 1000 / self.FREQ - 1
        #bus.write_byte_data(self.MPU9250_I2C_ADDR, 0x19, chr(sample_div))           
        bus.write_byte_data(self.MPU9250_I2C_ADDR, 0x19, 32)         
        
        self.calibrate_gyro()        
        
    def read_sensor_data(self): 
        try:
            Data = bus.read_i2c_block_data(self.MPU9250_I2C_ADDR,0x3B)            
            self.accX = Data[0]<<8 | Data[1]
            self.accY = Data[2]<<8 | Data[3]
            self.accZ = Data[4]<<8 | Data[5]
            
            self.tempOut = Data[6]<<8 | Data[7] 
            
            self.gyroX = Data[8]<<8 | Data[9] - self.gyrXoffs
            self.gyroY = Data[10]<<8 | Data[11] - self.gyrYoffs
            self.gyroZ = Data[12]<<8 | Data[13] - self.gyrZoffs                          
        except:
            print 'Error'
            time.sleep(1)
    def calibrate_gyro(self):
        xSum = 0
        ySum = 0
        zSum = 0
        cnt = 500
        try:
            for i in range(cnt):            
                Data = bus.read_i2c_block_data(self.MPU9250_I2C_ADDR,0x43)
                xSum = xSum + (Data[0]<<8 | Data[1])
                ySum = xSum + (Data[2]<<8 | Data[3])
                zSum = xSum + (Data[4]<<8 | Data[5])
            self.gyrXoffs = xSum / cnt
            self.gyrYoffs = ySum / cnt
            self.gyrZoffs = zSum / cnt 
            print "gyrXoffs", "gyrYoffs", "gyrZoffs = ",gyrXoffs,gyrYoffs,gyrZoffs
        except:
            print 'calirate error'
            sys.exit(0)
                
if __name__=="__main__":
    mpu=MPU9250()
    vs = VISUALSCOPE()
    num = 50    
    while True:
        mpu.read_sensor_data()
        print mpu.tempOut
        #print format(mpu.accX,"#0{}x".format(4))
#        tmp = 0
#        for i in range(num):                
#            mpu.read_sensor_data()
#            tmp = tmp + mpu.accX
#        tmp = tmp / num            
#        print format(tmp,"#0{}x".format(4))
        #vs.Data_acquisiton(mpu.accX,mpu.accY,mpu.accZ,mpu.gyroX)            
#        print self.gyroX
#        vs.Data_acquisiton(mpu.accX,mpu.accY,mpu.accZ,0)
        time.sleep(.2)
    
        
        