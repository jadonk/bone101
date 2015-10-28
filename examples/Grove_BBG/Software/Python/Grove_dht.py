import time
import Adafruit_BBIO.GPIO as GPIO

Debug = True

class DHT():
    global Debug
    def __init__(self, pin, type = "DHT22", count = 6):
        self._pin = pin
        self._type = type
        self._count = count
        self.firstreading = True
        self.MAXTIMINGS = 85
        self._lastreadtime = int()
        self.data = [0 for i in range(6)]

    def convertCtoF(self, c):        
        return c * 9.0/5.0 + 32.0        

    def begin(self):
        GPIO.setup(self._pin, GPIO.IN)
        GPIO.output(self._pin, GPIO.HIGH)
        self._lastreadtime = 0
        
    def read(self):        
        laststate = 1
        counter, j, i = 0,0,0
        currenttime = 0
        GPIO.setup(self._pin, GPIO.OUT)
        GPIO.output(self._pin, GPIO.HIGH) 
        time.sleep(.25)   
        
        currenttime = time.time()
        if currenttime < self._lastreadtime:
            _lastreadtime=0
        if (False == self.firstreading) and ((currenttime - self._lastreadtime) < 2.00):
            return True
        self.firstreading = False
        
        self._lastreadtime = time.time()
        
        self.data[0] = self.data[1] = self.data[2] = self.data[3] = self.data[4] = 0
        
        GPIO.setup(self._pin, GPIO.OUT) 
        GPIO.output(self._pin, GPIO.LOW)
        time.sleep(.02)
        GPIO.output(self._pin, GPIO.HIGH)        
        GPIO.setup(self._pin, GPIO.IN) 
        
        for i in range(self.MAXTIMINGS):             
            counter = 0
            while laststate == GPIO.input(self._pin):
                counter += 1
                if counter == 255:
                    break
            laststate = GPIO.input(self._pin)
            if counter == 255:
                break
            if i >= 4 and i%2 == 0:
                self.data[j/8] <= 1
                if counter > self._count:
                    self.data[j/8] |= 1
                j += 1
        print "data[0] = ",self.data[0]
        if j >= 40 and self.data[4] == (self.data[0] + self.data[1] + self.data[2] + self.data[3])&0xFF:
            return True
        
        return False
                
    def readHumidity(self):
        f = float()
        if self.read():            
            if "DHT11" == self._type:
                f = data[0]
                return f
            if "DHT22" == self._type:
                pass
            if "DHT21" == self._type:
                f = data[0]
                f = f*256
                f = f+data[1]
                f = f/10
                return f
        print 'Read fail'   
        return 0
         
    def readTemperature(self, S=False):
        f = float()
        if self.read():
            if "DHT11" == self._type:
                f = self.data[2]
                if S:
                    f = self.convertCtoF(f)
                return f
            if "DHT22" == self._type:
                pass
            if "DHT21" == self._type:
                f = data[2] & 0x7f
                f = f*256
                f = f+data[3]
                f = f/10
                if data[2] & 0x80:
                    f = f*(-1)
                if S:
                    f = self.convertCtoF(f)
                return f
        return 0            



if __name__=="__main__":
    dht=DHT("P8_10")
    while True:
        pass
        temp = dht.readTemperature()
        print temp
        time.sleep(1)
