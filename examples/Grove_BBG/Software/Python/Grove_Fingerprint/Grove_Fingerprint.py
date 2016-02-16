#!/usr/bin/python

import Adafruit_BBIO.UART as UART
import time
import sys
import serial


UART.setup("UART2")

ser = serial.Serial(port = "/dev/ttyO2", baudrate=57600)
ser.flush()

class Fingerprint():
    def __init__(self):
        self.FINGERPRINT_OK = 0x00
        self.FINGERPRINT_PACKETRECIEVEERR = 0x01
        self.FINGERPRINT_NOFINGER = 0x02
        self.FINGERPRINT_IMAGEFAIL = 0x03
        self.FINGERPRINT_IMAGEMESS = 0x06
        self.FINGERPRINT_FEATUREFAIL = 0x07
        self.FINGERPRINT_NOMATCH = 0x08
        self.FINGERPRINT_NOTFOUND = 0x09
        self.FINGERPRINT_ENROLLMISMATCH = 0x0A
        self.FINGERPRINT_BADLOCATION = 0x0B
        self.FINGERPRINT_DBRANGEFAIL = 0x0C
        self.FINGERPRINT_UPLOADFEATUREFAIL = 0x0D
        self.FINGERPRINT_PACKETRESPONSEFAIL = 0x0E
        self.FINGERPRINT_UPLOADFAIL = 0x0F
        self.FINGERPRINT_DELETEFAIL = 0x10
        self.FINGERPRINT_DBCLEARFAIL = 0x11
        self.FINGERPRINT_PASSFAIL = 0x13
        self.FINGERPRINT_INVALIDIMAGE = 0x15
        self.FINGERPRINT_FLASHERR = 0x18
        self.FINGERPRINT_INVALIDREG = 0x1A
        self.FINGERPRINT_ADDRCODE = 0x20
        self.FINGERPRINT_PASSVERIFY = 0x21

        self.FINGERPRINT_STARTCODE = 0xEF01

        self.FINGERPRINT_COMMANDPACKET = 0x1
        self.FINGERPRINT_DATAPACKET = 0x2
        self.FINGERPRINT_ACKPACKET = 0x7
        self.FINGERPRINT_ENDDATAPACKET = 0x8

        self.FINGERPRINT_TIMEOUT = 0xFF
        self.FINGERPRINT_BADPACKET = 0xFE

        self.FINGERPRINT_GETIMAGE = 0x01
        self.FINGERPRINT_IMAGE2TZ = 0x02
        self.FINGERPRINT_REGMODEL = 0x05
        self.FINGERPRINT_STORE = 0x06
        self.FINGERPRINT_DELETE = 0x0C
        self.FINGERPRINT_EMPTY = 0x0D
        self.FINGERPRINT_VERIFYPASSWORD = 0x13
        self.FINGERPRINT_HISPEEDSEARCH = 0x1B
        self.FINGERPRINT_TEMPLATECOUNT = 0x1D
        self.DEFAULTTIMEOUT = 5000

        self.thePassword = 0
        self.theAddress = 0xffffffff
        self.fingerID, self.confidence, self.templateCount = 0, 0, 0               

    def verifyPassword(self):
        packet = [self.FINGERPRINT_VERIFYPASSWORD, (self.thePassword >> 24), (self.thePassword >> 16),(self.thePassword >> 8), self.thePassword]
        self.writePacket(self.theAddress, self.FINGERPRINT_COMMANDPACKET, 7, packet)
        #print 'send packet done.'
        length = self.getReply(packet, self.DEFAULTTIMEOUT)
        if length == 1 and packet[0] == self.FINGERPRINT_ACKPACKET and packet[1] == self.FINGERPRINT_OK:
            return True
        return False

    def getImage(self):        
        packet = [self.FINGERPRINT_GETIMAGE, 0]
        self.writePacket(self.theAddress, self.FINGERPRINT_COMMANDPACKET, 3, packet)
        length = self.getReply(packet, self.DEFAULTTIMEOUT)
        if length != 1 and packet[0] != self.FINGERPRINT_ACKPACKET:
            return -1
        return packet[1]
        
    def image2Tz(self, slot):
        packet = [self.FINGERPRINT_IMAGE2TZ, slot]
        self.writePacket(self.theAddress, self.FINGERPRINT_COMMANDPACKET, len(packet)+2, packet)
        length = self.getReply(packet, self.DEFAULTTIMEOUT)
        if length != 1 and packet[0] != self.FINGERPRINT_ACKPACKET:
            return -1
        return packet[1]
        
    def createModel(self):
        packet = [self.FINGERPRINT_REGMODEL]
        self.writePacket(self.theAddress, self.FINGERPRINT_COMMANDPACKET, len(packet)+2, packet)
        length = self.getReply(packet, self.DEFAULTTIMEOUT)
        if length != 1 and packet[0] != self.FINGERPRINT_ACKPACKET:
            return -1
        return packet[1]
        
    def storeModel(self, id):
        packet = [self.FINGERPRINT_STORE, 0x01, id >> 8, id & 0xFF]
        self.writePacket(self.theAddress, self.FINGERPRINT_COMMANDPACKET, len(packet)+2, packet)
        length = self.getReply(packet, self.DEFAULTTIMEOUT)
        if length != 1 and packet[0] != self.FINGERPRINT_ACKPACKET:
            return -1
        return packet[1]
        
    def deleteModel(self, id):
        packet = [self.FINGERPRINT_DELETE, id >> 8, id & 0xFF, 0x00, 0x01]
        self.writePacket(self.theAddress, self.FINGERPRINT_COMMANDPACKET, len(packet)+2, packet)
        length = self.getReply(packet, self.DEFAULTTIMEOUT)
        if length != 1 and packet[0] != self.FINGERPRINT_ACKPACKET:
            return -1
        return packet[1]
        
    def emptyDatabase(self):
        packet = [self.FINGERPRINT_EMPTY]
        self.writePacket(self.theAddress, self.FINGERPRINT_COMMANDPACKET, len(packet)+2, packet)
        length = self.getReply(packet, self.DEFAULTTIMEOUT)
        if length != 1 and packet[0] != self.FINGERPRINT_ACKPACKET:
            return -1
        return packet[1]
        
    def fingerFastSearch(self):
        self.fingerID = 0xFFFF
        self.confidence = 0xFFFF
        # high speed search of slot #1 starting at page 0x0000 and page #0x00A3 
        packet = [self.FINGERPRINT_HISPEEDSEARCH, 0x01, 0x00, 0x00, 0x00, 0xA3]
        self.writePacket(self.theAddress, self.FINGERPRINT_COMMANDPACKET, len(packet)+2, packet)
        length = self.getReply(packet, self.DEFAULTTIMEOUT)
        if length != 1  and packet[0] != self.FINGERPRINT_ACKPACKET:
            return -1
        self.fingerID = packet[2]
        self.fingerID <<= 8
        self.fingerID |= packet[3]
        self.confidence = packet[4]
        self.confidence <<= 8
        self.confidence |= packet[5]
        return packet[1]

    def getTemplateCount(self):
        self.templateCount = 0xFFFF
        # get number of templates in memory
        packet = {self.FINGERPRINT_TEMPLATECOUNT}
        self.writePacket(self.theAddress, self.FINGERPRINT_COMMANDPACKET, len(packet)+2, packet)
        length = self.getReply(packet, self.DEFAULTTIMEOUT)
        if length != 1 and packet[0] != self.FINGERPRINT_ACKPACKET:
            return -1
        self.templateCount = packet[2]
        self.templateCount <<= 8
        self.templateCount |= packet[3]
        return packet[1]

    def writePacket(self, addr, packettype, length, packet):
        ser.write( chr(self.FINGERPRINT_STARTCODE >> 8))
        ser.write( chr(self.FINGERPRINT_STARTCODE & 0xff))
        ser.write( chr((addr >> 24) & 0xFF))
        ser.write( chr((addr >> 16) & 0xFF))
        ser.write( chr((addr >> 8 ) & 0xFf))
        ser.write( chr(addr & 0xFF))
        ser.write( chr(packettype))
        ser.write( chr(length >> 8))
        ser.write( chr(length))
        sum = 0x000
        sum = (length>>8) + (length&0xFF) + packettype

        for i in range(0, length - 2):
            ser.write(chr(packet[i]))
            sum += packet[i]
        ser.write(chr( sum>>8 ))
        ser.write(chr( sum ))

    def getReply(self, packet, timeout):
        reply = []
        idx = 0x00
        while ser.readable():
            
'''        
        timer = 0         
        while True:
            while False == ser.readable():                
                time.sleep(.001)
                timer += 1
                if(timer >= timeout):
                    print 'timeout.'
                    return self.FINGERPRINT_TIMEOUT
            print idx       
            # something to read!
            reply[idx] = ser.readline()
            #print '%c'%(reply[idx])
            if idx == 0 and reply[0] != self.FINGERPRINT_STARTCODE >> 8:
                continue
            idx += 1
            # check packet!
            if idx >= 9:
                if reply[0] != self.FINGERPRINT_STARTCODE >> 8 or reply[1] != self.FINGERPRINT_STARTCODE & 0xFF:
                    return self.FINGERPRINT_BADPACKET
            packettype = reply[6]
            length = reply[7]
            length <<= 8
            length |= reply[8]            
            length -= 2
            print"Packet length", length
            if idx <= length + 10:
                continue
            packet[0] = packettype
            for i in range(length):
                packet[1+i] = reply[9+i]
            return length
'''            

if __name__=="__main__":
    print 'start'
    fp = Fingerprint()
    while True:
        if 0 != fp.verifyPassword():
            print 'Found device'
        else:
            print 'Device not found'
            sys.exit(0)
        ser.write( chr(0x00 ))
        time.sleep(1) 
        

