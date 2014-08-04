var fs = require('fs');
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
process.on('exit', onexit);
process.on('SIGINT', onexit);

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
    if(__filename.match(/autorun/)) {
        onexit();
    }
}

function ondiscover(sensorTag) {
    winston.debug('SensorTag discovered');
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
        winston.info('SensorTag connected');
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
        sensorTag.setAccelerometerPeriod(1000/15);
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
    if(__filename.match(/autorun/)) {
        onexit();
    } else {
    	sensortag.discover(ondiscover);
    }
}

function ontemp(objectTemperature, ambientTemperature) {
    ondata('temp', {
        'objectTemperature': objectTemperature,
        'ambientTemperature': ambientTemperature
    });
}

function onaccel(x, y, z) {
    ondata('accel', {
        'x': x,
        'y': y,
        'z': z
    });
}

function onhum(temperature, humidity) {
    ondata('hum', {
        'temperature': temperature,
        'humidity': humidity
    });
}

function onmag(x, y, z) {
    ondata('mag', {
        'x': x,
        'y': y,
        'z': z
    });
}

function onbar(pressure) {
    ondata('pressure', {
        'pressure': pressure
    });
}

function ongyro(x, y, z) {
    ondata('gyro', {
        'x': x,
        'y': y,
        'z': z
    });
}

function onkey(left, right) {
    ondata('key', {
        'left': left,
        'right': right
    });
}

function dummycb() {
    winston.debug('dummy callback called');
}

function ondata(type, data) {
    bonescript.digitalWrite(LED_DATA, bonescript.HIGH, onledon);
    winston.debug('type = ' + type);
    winston.debug('data = ' + JSON.stringify(data));
    if(client) client.emit('data', {'type': type, 'data': data});
}

function onledon() {
    bonescript.digitalWrite(LED_DATA, bonescript.LOW, dummycb);
}

function onexit() {
    var ledpath = '/sys/class/leds/beaglebone:green:usr';
    fs.writeFileSync(ledpath+'0/trigger', 'heartbeat');
    fs.writeFileSync(ledpath+'1/trigger', 'mmc0');
    fs.writeFileSync(ledpath+'2/trigger', 'cpu0');
    fs.writeFileSync(ledpath+'3/trigger', 'mmc1');
    if(__filename.match(/autorun/)) {
        fs.unlinkSync(__filename);
    }
    process.exit(0);
}