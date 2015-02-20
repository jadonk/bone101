var app = require('http').createServer(handler);
var io = require('/var/lib/cloud9/node_modules/socket.io').listen(app);
// socket can also be called from /usr/local/lib/node_modules/bonescript/node_modules/socket.io
// if not in cloud9 library or any other location that socket.io is stored on the bb
var fs = require('fs');
var b = require('bonescript');
var htmlPage = '/var/lib/cloud9/BBUI/BBUI.html'; // base on file names and locations this may change
app.listen(8070);

function handler(req,res){
 fs.readFile(htmlPage,
    function(err, data){
        if (err){
            res.writeHead(500);
            return res.end('Error loading file: ' + htmlPage);
        }
        res.writeHead(200);
        res.end(data);
        console.log('connected');
    });
}

var pinBlink = []; var inputRead = [];
var usrText = ['USR0','USR1','USR2','USR3']; var analog = [];
var outputPin; var activePins = [];

io.sockets.on('connection', function (socket) {
socket.on('pin', function (data) {
    var len = activePins.length; var duplicate;
    for (var i=0; i<len; i++){
        if (data.id === activePins[i].id){
            duplicate = true;
        }    
    }
    if (duplicate !== true){
        activePins[len] = {id: data.id, type: data.type, subType: data.subType,
        num: data.num}; 
    }
    if (data.type === 'usr leds' || data.subType != "input" &&
        data.subType != "pwm"){ 
        b.pinMode(data.id,b.OUTPUT);
        if (data.power === "on"){
			if (data.freq !== 0){
              data.state = data.state ? 0 : 1;
              b.digitalWrite(data.id, data.state);
			} 
			else{
				b.digitalWrite(data.id, 1);
			}
		}
		else{
			b.digitalWrite(data.id, 0);
		}
	}
        else if (data.subType === "pwm"){
            if (data.power === "on"){
                b.analogWrite(data.id, data.freq);  
            } 
            else {b.analogWrite(data.id, 0);}
        }
    
});

// analog pin connected
socket.on('getValue', function (data) {
	analog[0] = data.num;
    if (data.power === "on"){
	b.analogRead(data.id,analogValue);}
});

socket.on('getInput', function (data){
    b.pinMode(data.id, b.INPUT);
    b.pinMode(data.output, b.OUTPUT);
    outputPin = data.output;
    b.digitalRead(data.id, checkPin); 
});

socket.on('ledOff', function (data){
	console.log('clearing lights...');
		for (var i = 0; i<4; i++){
             b.pinMode(usrText[i],b.OUTPUT);
			 b.digitalWrite(usrText[i], b.LOW);
		}
});    

 socket.on('disconnect', function(){
		for (var i = 0; i<4; i++){
			 b.digitalWrite(usrText[i], b.LOW);
		}
    var len = activePins.length;
        for (var j=0; j<len; j++){
            console.log(activePins[j].id);
            if (activePins[j].type === "digital"){
                if (activePins[j].subType === "input"){
                    clearInterval(inputRead[activePins[j].num]);
                }
                else if (activePins[j].subType === "pwm"){
                    b.analogWrite(activePins[j].id, 0);
                }
                else{clearInterval(pinBlink[activePins[j].num]);
                b.digitalWrite(activePins[j].id, 0);
                }  
            }
            else{clearInterval(pinBlink[activePins[j].num]);
                b.pinMode(activePins[j].id,b.OUTPUT);
                b.digitalWrite(activePins[j].id, 0);}
        }  
        console.log('Disconnected, turning off lights');
    }); 
});

// check to see if input it pressed, maybe eventually incoporate frequency
function checkPin(x){
  if(x.value == 1){
    b.digitalWrite(outputPin, b.HIGH);
//    io.emit('outputStatus',"on");
  }
  else{
    b.digitalWrite(outputPin, b.LOW);
//    io.emit('outputStatus',"off");
  }
}

// retrieve the analog value and send it back
function analogValue(x){
	var currentValue = x.value*1.8;
    analog[1] = currentValue;
	io.emit('voltageValue',analog);
}


