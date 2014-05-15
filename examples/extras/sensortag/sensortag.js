var sensortag = require('sensortag');
var bonescript = require('bonescript');
var winston = require('winston');

sensortag.discover(ondiscover);

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
	if(1) {
    	sensortag.discover(ondiscover);
	} else {
	    process.exit(0);
	}
}

function ontemp(objectTemperature, ambientTemperature) {
    winston.debug('objectTemperature = ' + objectTemperature);
    winston.debug('ambientTemperature = ' + ambientTemperature);
}

function onaccel(x, y, z) {
    winston.debug('accel x = ' + x);
    winston.debug('accel y = ' + y);
    winston.debug('accel z = ' + z);
}

function onhum(temperature, humidity) {
    winston.debug('temperature = ' + temperature);
    winston.debug('humidity = ' + humidity);
}

function onmag(x, y, z) {
    winston.debug('mag x = ' + x);
    winston.debug('mag y = ' + y);
    winston.debug('mag z = ' + z);
}

function onbar(pressure) {
    winston.debug('pressure = ' + pressure);
}

function ongyro(x, y, z) {
    winston.debug('gyro x = ' + x);
    winston.debug('gyro y = ' + y);
    winston.debug('gyro z = ' + z);
}

function onkey(left, right) {
    winston.debug('left = ' + left);
    winston.debug('right = ' + right);
}

function dummycb() {
    winston.debug('dummy callback called');
}


