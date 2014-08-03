var sensortag = require('sensortag');
var bonescript = require('bonescript');

sensortag.discover(ondiscover);

function ondiscover(sensorTag) {
    console.log('Sensor Tag discovered');
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
        console.log('Sensor Tag connected');
        sensorTag.discoverServicesAndCharacteristics(onservices);    
    }
    
    function onservices() {
        sensorTag.readDeviceName(onname);
    }
    
    function onname(deviceName) {
		console.log('\tdevice name = ' + deviceName);
		sensorTag.readSystemId(onid);
    }
    
    function onid(systemId) {
		console.log('\tsystem id = ' + systemId);
		sensorTag.readSerialNumber(onsn);
    }
    
    function onsn(serialNumber) {
		console.log('\tserial number = ' + serialNumber);
		sensorTag.enableIrTemperature();
		sensorTag.enableAccelerometer(onaccelen);
		sensorTag.enableHumidity(onhumen);
		sensorTag.enableMagnetometer(onmagen);
		sensorTag.enableBarometricPressure();
		sensorTag.enableGyroscope();
		sensorTag.notifySimpleKey(dummycb);
    }

    function onaccelen() {
        sensorTag.setAccelerometerPeriod(1000);
    }

    function onmagen() {
        sensorTag.setMagnetometerPeriod(1000);
    }
    
    function onhumen() {
        sensorTag.notifyHumidity(dummycb);
    }
}

function ondisconnect() {
	console.log('Tag Disconnected');
	if(1) {
    	sensortag.discover(ondiscover);
	} else {
	    process.exit(0);
	}
}

function ontemp(objectTemperature, ambientTemperature) {
    console.log('objectTemperature = ' + objectTemperature);
    console.log('ambientTemperature = ' + ambientTemperature);
}

function onaccel(x, y, z) {
    console.log('accel x = ' + x);
    console.log('accel y = ' + y);
    console.log('accel z = ' + z);
}

function onhum(temperature, humidity) {
    console.log('temperature = ' + temperature);
    console.log('humidity = ' + humidity);
}

function onmag(x, y, z) {
    console.log('mag x = ' + x);
    console.log('mag y = ' + y);
    console.log('mag z = ' + z);
}

function onbar(pressure) {
    console.log('pressure = ' + pressure);
}

function ongyro(x, y, z) {
    console.log('gyro x = ' + x);
    console.log('gyro y = ' + y);
    console.log('gyro z = ' + z);
}

function onkey(left, right) {
    console.log('left = ' + left);
    console.log('right = ' + right);
}

function dummycb() {
    console.log('dummy callback called');
}

/*

			function(callback) {
				sensorTag.on('simpleKeyChange', function(left, right) {
					console.log('keys left: ' + left + '  right: ' + right);

					if (left && right) {
						sensorTag.notifySimpleKey(callback);
					}
				});

				sensorTag.notifySimpleKey(function() {

				});
			}, function(callback) {
				console.log('disconnect');
				sensorTag.disconnect(callback);
			} ]);
});
*/

