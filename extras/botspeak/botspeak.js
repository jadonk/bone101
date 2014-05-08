var net = require('net');
var b = require('bonescript');

var DIO_SIZE = 12;
var AI_SIZE = 7;
var PWM_SIZE = 8;
var TMR_SIZE = 5;
var AO_SIZE = 0;

var pins = [ "USR0", "USR1", "USR2", "USR3", "P8_15", "P8_14", "P8_12", "P8_11", "P9_13", "P9_15", "P9_17", "P9_23"];
var PinsState = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var AnalogInPins = ["P9_39","P9_40","P9_37","P9_38","P9_33","P9_36","P9_35"];
var PWMPins = ["P9_14","P9_16","P8_19","P8_13", "P8_34", "P8_36", "P8_45", "P8_46"];

var SCRIPT = [];
var TIMER = [];
var VARS = {VER:'0.9', HI:'1', LO:'0', END: '0'};

var server = net.createServer(socketOpen);

function socketOpen(socket) {
    socket.on('end', tcpClose);
    function tcpClose() {
    }
    socket.on('data', tcpData);
    var my_input = "";
    function tcpData(data) {
        my_input = my_input + data;
        if(my_input.match(/\r\n$/)) {
            var command = my_input.split("\r\n");
            var reply = RunBotSpeak(command[0],socket); // don't want \r\n and whatever is after it - assume only one \r\n
            if (reply !== '') socket.write(reply + "\r\n");
            if ((reply !== "close") && (command[0] !== '')) console.log("Got: " + command[0].replace(/\n/g,",") + " Replied: " + reply.replace(/\n/g,","));
            my_input = "";
        }
    }
}

console.log("starting");
server.listen(2012);
Startlights();

function RunBotSpeak (command,socket) {
    var BotCode = command.split('\n');
    //        console.log(BotCode);
    var TotalSize = BotCode.length;
    var reply = "";
    var scripting = -1, ptr = 0,i,j;
    
    for (i = 0;i < TotalSize; i++) {
        //        console.log(GetCommand(BotCode[i]));
        switch (GetCommand(BotCode[i])) {
            case "":console.log("blank"); break;
                
            case "SCRIPT":
                scripting = 0;
                ptr = 0;
                reply += "start script\n";
                break;
                
            case "ENDSCRIPT":
                scripting = -1;
                ptr = 0;
                reply += "end script\n";
                console.log(SCRIPT);
                break;
                
            case "RUN":
                socket.write("Done\r\n");
                
            case "RUN&WAIT":
            case "DEBUG":
                console.log(BotCode[i]);
                j = Retrieve(BotCode[i].slice(BotCode[i].indexOf(' ')));
                VARS["END"] = SCRIPT.length;
                while (j < VARS["END"]) {
                    var reply1 = ExecuteCommand(SCRIPT[j]);
                    //                    console.log('executed '+SCRIPT[j]+' -> ' + reply1);
                    if (command !== 'RUN') socket.write(SCRIPT[j] + ' -> '+ reply1 + '\n');
                    var goto = String(reply1).split(' ');
                    j = (goto[0] == "GOTO") ? Number(goto[1]): j + 1;
                    //                    reply += reply1 + '\n';
                }
                reply += "ran " +VARS["END"] + " lines of script\nDone";
                if (command == 'RUN') reply = '';
                break;
                
            case "Done": break;
            default: {
                if (scripting >= 0) {
                    SCRIPT[ptr] = BotCode[i];
                    reply += SCRIPT[ptr] + '\n';
                    ptr ++;
                }
                else reply += ExecuteCommand(BotCode[i]) + '\n';
            }
        }
    }
    return reply;
}

function ExecuteCommand(Code) {
    if (trim(Code.slice(0,2)) == '//') return " ";  // just a comment
    if (trim(Code) =='') return '';   // blank line
    var command = GetCommand(Code);   // everything before the space
    var args = trim(Code.slice(Code.indexOf(' '))).split(',');  // everything after the space, split by ','
    var dest = trim(args[0]);
    var value = (args.length > 1) ? trim(args[1]):0;
    var waittime = 0;
    
    switch (command) {
        case "SET": return Assign(dest,Retrieve(value));
        case "GET": return Retrieve(dest);
        case "WAIT": waittime = 1000*Retrieve(dest); return delay(waittime);
        case "WAITµs": microdelay(Retrieve(dest)); return Retrieve(dest);
        case "ADD": return VARS[dest] += Retrieve(value);
        case "SUB": return VARS[dest] -= Retrieve(value);
        case "MUL": return VARS[dest] *= Retrieve(value);
        case "DIV": return VARS[dest] /= Retrieve(value);
        case "AND": return VARS[dest] &= Retrieve(value);
        case "OR":  return VARS[dest] |= Retrieve(value);
        case "NOT": return VARS[dest]  = !Retrieve(value);
        case "BSL": return VARS[dest] <<= Retrieve(value);
        case "BSR": return VARS[dest] >>= Retrieve(value);
        case "MOD": return VARS[dest] %= Retrieve(value);
        case "GOTO":return Jump = dest;
        case "LBL": return 0;
        case "IF": {
            var conditional = trim(Code.slice(Code.indexOf('(')+1,Code.indexOf(')')));
            var Jump = trim(Code.slice(Code.indexOf('GOTO')));
            var params = conditional.split(' ');
            switch (trim(params[1])) {
                case '>':   if (Retrieve(trim(params[0])) > Retrieve(trim(params[2])))  return Jump; else return 1;
                case '<':   if (Retrieve(trim(params[0])) < Retrieve(trim(params[2])))  return Jump; else return 1;
                case '<':   if (Retrieve(trim(params[0])) < Retrieve(trim(params[2])))  return Jump; else return 1;
                case '==':  if (Retrieve(trim(params[0])) == Retrieve(trim(params[2]))) return Jump; else return 1;
                case '!=':  if (Retrieve(trim(params[0])) != Retrieve(trim(params[2]))) return Jump; else return 1;
                case '<=':  if (Retrieve(trim(params[0])) <= Retrieve(trim(params[2]))) return Jump; else return 1;
                case '>=':  if (Retrieve(trim(params[0])) >= Retrieve(trim(params[2]))) return Jump; else return 1;
                default: return "unsupported conditional";
            }
            return 1;
        }
        case "SYSTEM": return SystemCall(args);
        case "": return 1;
        case "end": return "end";
        default: return (command + " not yet supported");
    }
}

function Assign(dest,value)  {
    var i;
    var param = dest.split('[');
    var param1 = GetArrayIndex(param);
    switch (param[0]) {
        case "DIO":
            param1 = (param1 < DIO_SIZE)?param1:0;
            b.pinMode(pins[param1] , b.OUTPUT);
            b.digitalWrite(pins[param1], value);
            return PinsState[param1] = value;
            
        case "AO":
        case "PWM":
            param1 = (param1 < PWM_SIZE)?param1:0;
            b.pinMode(PWMPins[param1] , b.OUTPUT);
            //            value = value / 100;  // PWM goes from 0 - 100 percent
            value = (value < 1) ? value: 1;
            console.log("param " + param1 + " Pin " +  PWMPins[param1] + " value " + value);
            b.analogWrite(PWMPins[param1], value);
            return PinsState[param1] = value;
            
        case "TMR":
            param1 = (param1 < TMR_SIZE)?param1:0;
            TIMER[param1] = value + new Date().getTime();
            return value;
            
            // Read Only Variables
        case "VER": return VARS["VER"];
        case "AI":
            param1 = (param1 < AI_SIZE)?param1:0;
            return b.analogRead(AnalogInPins[param1]);
            
        default:
            if (param.length == 1) {
                var arrayName=dest.split('_SIZE');  // see if they are defining an array
                if (arrayName.length > 1) {
                    VARS[arrayName[0]] =[];
                    for (i=0;i<value;i++) VARS[arrayName[0]][i]=0;
                    VARS[arrayName[0]+'_COLS']=1;  // assume a 1D array initially
                }
                return VARS[dest] = value;
            }
            //            console.log("Assigning "+param[0]+"__"+param1+" of "+VARS[param[0]+'_SIZE']);
            param1 = (param1 < VARS[param[0]+'_SIZE'])?param1:VARS[param[0]+'_SIZE'] - 1;
            
            return VARS[param[0]][param1] = value;
    }
}

function Retrieve(source)  {
    var param = source.split('[');
    var param1 = GetArrayIndex(param);
    var reply = '';
    
    switch (param[0]) {
        case "DIO": reply = (param1 < DIO_SIZE)?PinsState[param1]:-1; break;
        case "AI":  reply = (param1 < AI_SIZE)?b.analogRead(AnalogInPins[param1]):-1; break;
        case "TMR": reply = (param1 < TMR_SIZE)?(new Date().getTime() - TIMER[param1]):-1; break;
        default: {
            switch(param.length) {
                case 1: {
                    if (VARS[source] === undefined) reply = Number(source);
                    else reply = VARS[source];  // if not declared then probably a number
                    break;
                }
                default:  {
                    //                    console.log("Retrieving "+param[0]+"__"+param1+" of "+VARS[param[0]+'_SIZE']);
                    var ArrayPtr = (param1 < VARS[param[0]+'_SIZE'])? param1 : VARS[param[0]+'_SIZE']-1;
                    reply = VARS[param[0]][ArrayPtr];
                    break;
                }
                    
            }
        }
    }
    return reply;
}

function GetArrayIndex(param)  {
    if (param.length <= 1) return -1;
    var TwoD=param[1].split(':');
    //    console.log(param[1]+' : '+TwoD);  //2D does not work because the comma is used elsewhere
    if (TwoD.length <= 1) return Retrieve(trim(param[1].split(']')[0]));  // recursive to allow variables in the brackets]
    console.log(Retrieve(TwoD[0]*VARS[param[0]+'_COLS'])+Retrieve(trim(TwoD[1].split(']')[0])));
    return Retrieve(TwoD[0]*VARS[param[0]+'_COLS'])+Retrieve(trim(TwoD[1].split(']')[0]));
}

function trim(AnyString) {
    return AnyString.replace(/^\s+|\s+$/g,"");
}
function delay (msec) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > msec) break;
    }
    return msec;
}
function microdelay (msec) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > msec/1000) break;
    }
}
function Startlights() {
    var i;
    for (i = 1; i < 4; i++) {
        b.pinMode(pins[i], 'out');
        b.digitalWrite(pins[i], 1);
        delay (100);
    }
    for (i = 3; i >= 0; i--) {
        b.digitalWrite(pins[i], 0);
        delay (100);
    }
}

function GetCommand(Code) {
    return (Code.indexOf(' ') >= 0) ? trim(Code.slice(0,Code.indexOf(' '))) : Code;
}

function SystemCall(args) {
    var ampl = Retrieve(args[1]);
    var freq = Retrieve(args[2]);
    
    Assign(args[0],ampl);
    
    return freq;
}