var sensortag = require('sensortag');
var bonescript = require('bonescript');
var winston = require('winston');
var socketio = require('bonescript/node_modules/socket.io');

var leds = ['USR0', 'USR1', 'USR2', 'USR3'];
var LED_ST = 'USR0';
var LED_IO = 'USR1';
var LED_DATA = 'USR2';
for(var i in leds) {
    bonescript.pinMode(leds[i], bonescript.OUTPUT);
    bonescript.digitalWrite(leds[i], bonescript.LOW);
}

var port = 5001;
var client = null;
var io = socketio.listen(port);
io.set('log level', 1);
io.on('error', onioerr);
io.sockets.on('connection', onio);

sensortag.discover(ondiscover);

function onio(socket) {
    bonescript.digitalWrite(LED_IO, bonescript.HIGH);
    client = socket;
    socket.on('disconnect', oniodisconnect);
}

function onioerr() {
    winston.error('socket.io error');
}

function oniodisconnect() {
    bonescript.digitalWrite(LED_IO, bonescript.LOW);
    client = null;
}

function ondiscover(sensorTag) {
    winston.debug('Sensor Tag discovered');
	sensorTag.on('disconnect', ondisconnect);
	sensorTag.on('irTemperatureChange', ontemp);
	sensorTag.on('accelerometerChange', onaccel);
	sensorTag.on('humidityChange', onhum);
	sensorTag.on('magnetometerChange', onmag);
	sensorTag.on('barometricPressureChange', onbar);
	sensorTag.on('gyroscopeChange', ongyro);
	sensorTag.on('simpleKeyChange', onkey);
	sensorTag.connect(onconnect);
	
    function onconnect() {
        winston.info('Sensor Tag connected');
        bonescript.digitalWrite(LED_ST, bonescript.HIGH);
        if(client) {
            client.emit('connect', {'connected': true});
        }
        sensorTag.discoverServicesAndCharacteristics(onservices);    
    }
    
    function onservices() {
        sensorTag.readDeviceName(onname);
    }
    
    function onname(deviceName) {
		winston.debug('\tdevice name = ' + deviceName);
		sensorTag.readSystemId(onid);
    }
    
    function onid(systemId) {
		winston.debug('\tsystem id = ' + systemId);
		sensorTag.readSerialNumber(onsn);
    }
    
    function onsn(serialNumber) {
		winston.debug('\tserial number = ' + serialNumber);
		sensorTag.enableIrTemperature();
		sensorTag.notifyIrTemperature(dummycb);
		sensorTag.enableAccelerometer(onaccelen);
		sensorTag.enableHumidity(onhumen);
		sensorTag.enableMagnetometer(onmagen);
		sensorTag.enableBarometricPressure();
		sensorTag.notifyBarometricPressure(dummycb);
		sensorTag.enableGyroscope();
		sensorTag.notifyGyroscope(dummycb);
		sensorTag.notifySimpleKey(dummycb);
		//setInterval(dopoll, 1000);
    }

    function onaccelen() {
        winston.debug('Enabled accelerometer')
        sensorTag.setAccelerometerPeriod(1000);
        sensorTag.notifyAccelerometer(dummycb);
    }

    function onmagen() {
        winston.debug('Enabled magnetometer')
        sensorTag.setMagnetometerPeriod(1000);
        sensorTag.notifyMagnetometer(dummycb);
    }
    
    function onhumen() {
        sensorTag.notifyHumidity(dummycb);
    }
    
    function dopoll() {
        winston.debug('Performing poll');
        sensorTag.readIrTemperature(ontemp);
        sensorTag.readMagnetometer(onmag);
    }
}

function ondisconnect() {
	winston.info('Sensor Tag disconnected');
	bonescript.digitalWrite(LED_ST, bonescript.LOW);
    if(client) {
        client.emit('connect', {'connected': false});
    }
	if(1) {
    	sensortag.discover(ondiscover);
	} else {
	    process.exit(0);
	}
}

function ontemp(objectTemperature, ambientTemperature) {
    ondata();
    winston.debug('objectTemperature = ' + objectTemperature);
    winston.debug('ambientTemperature = ' + ambientTemperature);
    if(client) {
        client.emit('temp', {
            'objectTemperature': objectTemperature,
            'ambientTemperature': ambientTemperature
        });
    }
}

function onaccel(x, y, z) {
    ondata();
    winston.debug('accel x = ' + x);
    winston.debug('accel y = ' + y);
    winston.debug('accel z = ' + z);
    if(client) {
        client.emit('accel', {
            'x': x,
            'y': y,
            'z': z
        });
    }
}

function onhum(temperature, humidity) {
    ondata();
    winston.debug('temperature = ' + temperature);
    winston.debug('humidity = ' + humidity);
    if(client) {
        client.emit('hum', {
            'temperature': temperature,
            'humidity': humidity
        });
    }
}

function onmag(x, y, z) {
    ondata();
    winston.debug('mag x = ' + x);
    winston.debug('mag y = ' + y);
    winston.debug('mag z = ' + z);
    if(client) {
        client.emit('mag', {
            'x': x,
            'y': y,
            'z': z
        });
    }
}

function onbar(pressure) {
    ondata();
    winston.debug('pressure = ' + pressure);
    if(client) {
        client.emit('pressure', {
            'pressure': pressure
        });
    }
}

function ongyro(x, y, z) {
    ondata();
    winston.debug('gyro x = ' + x);
    winston.debug('gyro y = ' + y);
    winston.debug('gyro z = ' + z);
    if(client) {
        client.emit('gyro', {
            'x': x,
            'y': y,
            'z': z
        });
    }
}

function onkey(left, right) {
    ondata();
    winston.debug('left = ' + left);
    winston.debug('right = ' + right);
    if(client) {
        client.emit('key', {
            'left': left,
            'right': right
        });
    }
}

function dummycb() {
    winston.debug('dummy callback called');
}

function ondata() {
    bonescript.digitalWrite(LED_DATA, bonescript.HIGH, onledon);
}

function onledon() {
    bonescript.digitalWrite(LED_DATA, bonescript.LOW, dummycb);
}