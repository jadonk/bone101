'''
/*
 * Grove-RTC.py
 * Demo for Raspberry Pi 
 *
 * Copyright (c) 2014 seeed technology inc.
 * Website    : www.seeed.cc
 * Author     : Lambor
 * Create Time: Nov 2014
 * Change Log :
 *
 * The MIT License (MIT)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
'''
#!/usr/bin/python
import time
import smbus


bus = smbus.SMBus(1)    # 0 = /dev/i2c-0 (port I2C0), 1 = /dev/i2c-1 (port I2C1)   

class DS1307():		
	def __init__(self):
		self.MON = 1
		self.TUE = 2
		self.WED = 3
		self.THU = 4
		self.FRI = 5
		self.SAT = 6
		self.SUN = 7
		self.DS1307_I2C_ADDRESS = 0x68
		
		print 'begin' 
		
	def decToBcd(self, val):
		return ( (val/10*16) + (val%10) )
		
	def bcdToDec(self,  val):
		return ( (val/16*10) + (val%16) )
		
	def begin(self, news):
		print news
		
	def startClock(self):	
		bus.write_byte(self.DS1307_I2C_ADDRESS, 0x00)
		self.second = bus.read_byte(self.DS1307_I2C_ADDRESS) & 0x7f
		bus.write_byte_data(self.DS1307_I2C_ADDRESS, 0x00, self.second)
		
		print 'startClock..'
		
	def stopClock(self):						
		bus.write_byte(self.DS1307_I2C_ADDRESS, 0x00)
		self.second = bus.read_byte(self.DS1307_I2C_ADDRESS) | 0x80
		bus.write_byte_data(self.DS1307_I2C_ADDRESS, 0x00, self.second)			
		
		print 'stopClock..'
		
	def setTime(self):
		data = [self.decToBcd(self.second), self.decToBcd(self.minute), \
				self.decToBcd(self.hour), self.decToBcd(self.dayOfWeek), \
				self.decToBcd(self.dayOfMonth), self.decToBcd(self.month), \
				self.decToBcd(self.year)]
		
		bus.write_byte(self.DS1307_I2C_ADDRESS, 0x00)
		bus.write_i2c_block_data(self.DS1307_I2C_ADDRESS,0x00,data)
		
		print 'setTime..'
		
	def getTime(self):
		bus.write_byte(self.DS1307_I2C_ADDRESS, 0x00)
		data = bus.read_i2c_block_data(self.DS1307_I2C_ADDRESS,0x00)
		#A few of these need masks because certain bits are control bits
		self.second = self.bcdToDec(data[0] & 0x7f)
		self.minute = self.bcdToDec(data[1])
		self.hour = self.bcdToDec(data[2] & 0x3f)  #Need to change this if 12 hour am/pm
		self.dayOfWeek = self.bcdToDec(data[3])
		self.dayOfMonth = self.bcdToDec(data[4])
		self.month = self.bcdToDec(data[5])
		self.year = self.bcdToDec(data[6])
		
		print 'getTime..'
		
	def fillByHMS(self, _hour,  _minute,  _second):
		self.hour = _hour
		self.minute = _minute
		self.second = _second
		
		print 'fillByHMS..'
		
	def fillByYMD(self, _year,  _month,  _day):		
		self.year = _year - 2000
		self.month = _month;
		self.dayOfMonth = _day
		
		print 'fillByYMD..'
		
	def fillDayOfWeek(self,  _dow):		
		self.dayOfWeek = _dow
		
		print 'fillDayOfWeek..'
		
if __name__ == "__main__": 
	clock = DS1307()
	clock.fillByYMD(2015,3,5)
	clock.fillByHMS(12,42,30)
	clock.fillDayOfWeek(clock.THU)	
	clock.setTime()
	while True:		
		clock.getTime()
		print clock.hour, ":", clock.minute, ":", \
				clock.second, " ", clock.dayOfMonth, "/", \
				clock.month, "/", clock.year,"  ", "weekday", \
				":", clock.dayOfWeek    		
		time.sleep(1)
		
		

	



	
