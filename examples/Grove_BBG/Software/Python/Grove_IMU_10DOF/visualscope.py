import serial
import time

ser = serial.Serial(port = "/dev/ttyO2", baudrate=19200)

class VISUALSCOPE():
    OutData=[0,0,0,0]    
    def __init__(self):
        pass
        
    def CRC_CHECK(self, buf, CRC_CNT):
        CRC_Temp = 0
        CRC_Temp = 0xffff
        
        for i in range(CRC_CNT):
            CRC_Temp = CRC_Temp ^ buf[i]
            for x in range (8):
                if CRC_Temp & 0x01:
                    CRC_Temp = (CRC_Temp >> 1) ^ 0xa001
                else:
                    CRC_Temp = CRC_Temp >> 1
        return CRC_Temp
    
    def OutPut_Data(self):
        tmp = [0,0,0,0]
        tmp1 = [0,0,0,0]
        databuf = [0 for i in range(10)]
        i=0
        CRC16 = 0
        
        for i in range(4):
            tmp[i] = self.OutData[i]
            tmp1[i] = tmp[i] 
        for i in range(4):
            databuf[i*2] = tmp1[i]%256
            databuf[i*2+1] = tmp1[i]/256
            
        CRC16 = self.CRC_CHECK(databuf, 8)
        databuf[8] = CRC16%256
        databuf[9] = CRC16/256
        
        for i in range(10):
            #ser.write("%d"%(databuf[i]))
            ser.write(chr(databuf[i]))
    def Data_acquisiton(self, temp0,temp1,temp2,temp3):
        self.OutData[0] = int(temp0)
        self.OutData[1] = int(temp1)
        self.OutData[2] = int(temp2)
        self.OutData[3] = int(temp3)
        self.OutPut_Data()
            
if __name__=="__main__":
    vs=VISUALSCOPE()
    while True:    
        vs.Data_acquisiton(2,3,4,5)
        #time.sleep(.01)