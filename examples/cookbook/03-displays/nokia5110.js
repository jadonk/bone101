#!/usr/bin/env node
//
// Copyright (C) 2012 - Cabin Programs, Ken Keller 
//

var lcd = require('nokia5110');
var b = require('bonescript');
var timeout = 0;
var inverseIndex;

//
//  Must define the following outputs
//
lcd.PIN_SDIN = "P9_17";
lcd.PIN_SCLK = "P9_21";
lcd.PIN_SCE  = "P9_11";
lcd.PIN_DC   = "P9_15";
lcd.PIN_RESET= "P9_13";