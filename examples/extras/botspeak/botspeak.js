/**
 * BotSpeak JS - BotSpeak Chrome Extension
 * @author Rafi Yagudin
 * @version 1.0
 */

var socketio;


var BOTSPEAK_DEVICES = {
	'BEAGLEBONE_BLACK' : {
		'name' : 'Beaglebone Black',
		'img'  : 'images/beaglebone.jpg',
		'ip'   : '',
		'connection_id' : -1
	},
	'BEAGLEBONE_BLACK_TCP' : {
		'name' : 'Beaglebone Black (TCP)',
		'img'  : 'images/beaglebone.jpg',
		'ip'   : '',
		'connection_id' : -1
	},
	'ARDUINO_UNO' : {
		'name' : 'Arduino Uno',
		'img'  : 'images/arduino.jpg',
		'port' : '',
		'connection_id' : -1
	},
	'LILLY_PAD' : {
		'name' : 'Lily Pad',
		'img'  : 'images/lillypad.jpg',
		'port' : '',
		'connection_id' : -1
	},
	'PROTO_SNAP' : {
		'name' : 'ProtoSnap',
		'img'  : 'images/protosnap.png',
		'port' : '',
		'connection_id' : -1
	},
	'RASPBERRY_PI' : {
		'name' : 'Raspberry Pi',
		'img'  : 'images/rpi.jpg',
		'ip'   : '',
		'connection_id' : -1
	},
	'GENERIC_TCPIP' : {
		'name' : 'Generic TCPIP Device',
		'img'  : 'images/generic_tcpip.jpg',
		'ip'   : '',
		'connection_id' : -1
	}
};
var DEBUG_BOTSPEAK = false;
var SOCKETIO_DEVICE_SELECTED = true;
var TCP_DEVICE_SELECTED    = false; 
var SERIAL_DEVICE_SELECTED = false;
var SOCKETIO_DEVICES    = ['BEAGLEBONE_BLACK'];
var TCP_DEVICES    = ['BEAGLEBONE_BLACK_TCP', 'RASPBERRY_PI', 'GENERIC_TCPIP'];
var SERIAL_DEVICES = ['ARDUINO_UNO', 'LILLY_PAD', 'PROTO_SNAP'];
var CONNECTION_ID  = -1;
var SOCKET_ID      = -1;
var BOTSPEAK_VERSION = ['1.0', '9'];
var SERIAL_PORTS = '';

(function($){

	$( document ).ready(function(){
		
		var loadsio = $.getScript('http://' + window.location.host + ':2013/socket.io/socket.io.js');
		loadsio.done(function(script, textStatus) {
			try {
				if(io) socketio = io.connect(':2013');
				else console.log('Unable to make socket.io connection');
			} catch(ex) {
				console.log('Unable to make socket.io connection: ' + ex);
			}
  		});

		function showError(error_msg){
			$('#error_msg').append(error_msg);
		}

		//Append each device to the device_selection dropdown
		var option_html = '';
		$.each(BOTSPEAK_DEVICES, function(key, val){
			option_html += '<option value="' + key + '">' + val.name + '</option>';
		});
		$('#device_selection').append(option_html);

		//Get the serial ports every 5 seconds in case thing get attached
		function getDevices(){
			if(chrome && chrome.serial) chrome.serial.getDevices(function(ports){
				SERIAL_PORTS = ports;
				if( SERIAL_PORTS ){
					var port_options = '';
					SERIAL_PORTS.forEach(function(port){
						port_options += '<option value="' + port.path + '">' + port.path + '</div>';
					});
					$('#serial_ports').html(port_options);
				}
			})
		}
		
		getDevices();

		$('#get_ports').click(function(){
			getDevices();
		});


		/**
		 * Converts a string to an array buffer
		 * @see http://stackoverflow.com/questions/6965107/converting-between-strings-and-arraybuffers
		 * @param str
		 * @returns {ArrayBuffer}
		 */
		function str2ab(str) {
			var buf = new ArrayBuffer(str.length); // 1 byte for each char
			var bufView = new Uint8Array(buf);
			for (var i=0, strLen=str.length; i<strLen; i++) {
				bufView[i] = str.charCodeAt(i);
			}
			return buf;
		}

		/**
		 * Converts array buffer to string
		 * @see http://updates.html5rocks.com/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
		 * @param buf
		 * @returns {string}
		 */
		function ab2str(buf) {
			return String.fromCharCode.apply(null, new Uint8Array(buf));
		}

		/**
		 * Send a command over Socket.IO
		 * 
		 * @string hostname - IP address or hostname of the device to connect to. Default: 127.0.0.1 (localhost)
		 * @int port   - The port to connect on. Default is 9999.
		 * @string cmd - The command to send over Socket.IO
		 * @callback   - callback of the form callback(message) where message is the data read back via Socket.IO
		 */
		var send_socketio_msg = function(hostname, port, cmd, callback){
			if(socketio) {
				socketio.once('message', stripData);
				socketio.emit('data', cmd);
			}
			
			function stripData(message) {
				message = message.replace(/\n$/, "");
				callback(message);
			}
		};

		/**
		 * Send a command over TCP/IP
		 * 
		 * @string hostname - IP address or hostname of the device to connect to. Default: 127.0.0.1 (localhost)
		 * @int port   - The port to connect on. Default is 9999.
		 * @string cmd - The command to send over TCP/IP
		 * @callback   - callback of the form callback(arrayBufferResult) where ArrayBufferResult is an arrayBuffer of the data read back via TCP/IP
		 */
		var send_tcp_msg = function(hostname, port, cmd, callback){
			if(chrome && chrome.socket) chrome.socket.create("tcp", null, function(createInfo){

				SOCKET_ID = createInfo.socketId;
				
				if(SOCKET_ID == -1){
					showError('<p>Error: could not connect over TCP to host: ' + hostname +'.</p>');
					return;
				}

				if(typeof hostname !== 'string'){
					showError('Hostname argument is not of type string in send_tcp_msg().')
				}

				if(typeof port !== 'number'){
					showError('Port argument is not of type string in send_tcp_msg().')
				}

				if(hostname == undefined || hostname == ''){
					hostname = '127.0.0.1';
				}

				if(port == undefined || port == ''){
					port = 9999;
				}

				console.log('Command:' + cmd);

				chrome.socket.connect(SOCKET_ID, hostname, port, function(result) {
					// console.log('tcp_result: ');
					// console.log(result);

					var str2ab_arrayBuffer = str2ab(cmd + '\r\n');
					var str2ab_bufView = new Uint8Array(str2ab_arrayBuffer);
					console.log('using str2ab:');
					console.log(str2ab_bufView);


					 chrome.socket.write(SOCKET_ID, str2ab_arrayBuffer, function(writeInfo) {

						 console.log('TCP socket writeInfo:');
						 console.log(writeInfo);

						 if(writeInfo.bytesWritten  < 0){
							 console.log('TCP socket error, no bytes written to TCP socket.');
						 }

						 chrome.socket.read(SOCKET_ID, null, function(readInfo) {
							 console.log('TCP readInfo:');
							 console.log(readInfo);
							 var labview_bufView = new Uint8Array(readInfo.data);
							 console.log('TinySpeak Server result:');
							 console.log(labview_bufView);
							 callback(readInfo.data);
						 });
					 });

					/*
					_stringToArrayBuffer(cmd + '\r\n', function(arrayBuffer) {

						var bufView = new Uint8Array(arrayBuffer);
						console.log('using _stringToArrayBuffer:');
						console.log(bufView);

					}); // end _stringToArrayBuffer
					*/

				});
			});
			if(chrome && chrome.socket) chrome.socket.destroy(SOCKET_ID);
		};

		//Test the Socket.IO connection by sending "GET VER" over Socket.IO
		$('#test_socketio_button').click(function(){
			var device_ip    = $('#device_ip').val();
			var device_port  = $('#device_port').val(); // note, this is never assigned!
			var botspeak_cmd = 'GET VER';
			send_socketio_msg(device_ip, device_port, botspeak_cmd, function(version){
				console.log('version: ')
				console.log(version)
				if(  $.inArray(version, BOTSPEAK_VERSION) != -1 ){
					$('#socketio_devices').append('<p style="color: green;">Connection successful! BotSpeak Version: ' + version + '</p>')
				}else{
					$('#socketio_devices').append('<p style="color: red;"> Connection Error: ' + version + '</p>')
				}
			});
		});

		//Test the TCP connection by sending "GET VER" over TCP/IP
		$('#test_tcp_button').click(function(){
			var device_ip    = $('#device_ip').val()
			var device_port  = $('#device_port').val()
			var botspeak_cmd = 'GET VER';
			send_tcp_msg(device_ip, device_port, botspeak_cmd, function(arrayBufferResult){
				_arrayBufferToString(arrayBufferResult, function(version){
					console.log('version: ')
					console.log(version)
					if(  $.inArray(version, BOTSPEAK_VERSION) != -1 ){
						$('#tcp_devices').append('<p style="color: green;">Connection successful! BotSpeak Version: ' + version + '</p>')
					}else{
						$('#tcp_devices').append('<p style="color: red;"> Connection Error: ' + version + '</p>')
					}
				});
			});
		});

		/**
		 * Send a serial comand
		 * @param connection_id
		 * @param serial_cmd
		 * @param callback
		 */
		var send_serial_cmd = function(connection_id, serial_cmd) {
			console.log('Sending serial on connection id:' + connection_id + ' with command: ' + serial_cmd);

			if(chrome && chrome.serial) chrome.serial.send(connection_id, serial_cmd, function(sendInfo){
				console.log('Serial send info:');
				console.log(sendInfo);
				if(sendInfo.bytesWritten == -1){
					console.log("Error: could not write to serial.");
					return;
				}
			});
		};

		/**
		 * Register onReceive event
		 */
		if(chrome && chrome.serial) chrome.serial.onReceive.addListener(function(responseInfo){

			console.log('Serial response info:');
			console.log(responseInfo);

			var responseArrayBufferView = new Uint8Array( responseInfo.data );

			console.log( 'Response array buffer view:' );
			console.log( responseArrayBufferView );

			var string_response = ab2str( responseInfo.data );

			console.log( 'Response string:' + string_response );

			terminal_obj.echo( 'Response:' + string_response );

		});

		//Tests and sets the serial connection for each serial device
		$('#test_serial_button').click(function(){

			var device_id = $('#device_selection').val();
			var port_id   = $('#serial_ports').val();
			var device = BOTSPEAK_DEVICES[device_id];

			//Get TinySpeak from LabView TCP server
			send_tcp_msg('127.0.0.1', 9999, 'GET VER', function(labview_result){

				// console.log('Labview result:');
				// console.log(labview_result);

				if( device.port != port_id ){
					device.port = port_id;

					chrome.serial.connect(device.port, null, function(connectionInfo){

						console.log('Serial connection info:');
						console.log(connectionInfo);

						device.connection_id = connectionInfo.connectionId;
						if (device.connection_id === -1) {
							console.log('Could not connect to serial');
							return;
						}
					});
				}

				send_serial_cmd(device.connection_id, labview_result, function(arrayBufferResponse){
					var stringResponse = ab2str( arrayBufferResponse );
					console.log(stringResponse);
					$('#connection_status').html('<p>' + stringResponse + '</p>');
				});

			});

		});

		//Show device info
		$('#device_selection').change(function(){
			var device  = $( this ).val();
			var img_src = BOTSPEAK_DEVICES[device].img;
			
			//Show device image
			$('#device_image').html('<img src="' + img_src + '" />');
			
			//Show/hide tcp/ip serial inputs
			if( $.inArray(device, TCP_DEVICES) != -1 ){
				TCP_DEVICE_SELECTED = true;
				$('#tcp_devices').show();
			}else{
				TCP_DEVICE_SELECTED = false;
				$('#tcp_devices').hide();
			}

			if( $.inArray(device, SERIAL_DEVICES) != -1 ){
				SERIAL_DEVICE_SELECTED = true;
				$('#serial_devices').show();
			}else{
				SERIAL_DEVICE_SELECTED = false;
				$('#serial_devices').hide();
			}

			if( $.inArray(device, SOCKETIO_DEVICES) != -1 ){
				SOCKETIO_DEVICE_SELECTED = true;
				$('#socketio_devices').show();
			}else{
				SOCKETIO_DEVICE_SELECTED = false;
				$('#socketio_devices').hide();
			}
		});

		var terminal_obj = {};

		//Setup the terminal interface
		$('#terminal').terminal(function(command, term) {

			terminal_obj = term;

			try {
				var device_id = $('#device_selection').val();
				var device = BOTSPEAK_DEVICES[device_id];
				
				if(SOCKETIO_DEVICE_SELECTED){
					send_socketio_msg(device.ip, 2013, command, function(cmd_result){
						term.echo(cmd_result);
					});
				}

				if(TCP_DEVICE_SELECTED){
					//send_tcp_msg(device.ip, 9999, command, function(arrayBufferResult){
					send_tcp_msg(device.ip, 2012, command, function(arrayBufferResult){
						_arrayBufferToString(arrayBufferResult, function(cmd_result){
							term.echo(new String(cmd_result));
						});
					});
				}

				if(SERIAL_DEVICE_SELECTED){

					device.port = $('#serial_ports').val();

					if( device.connection_id === -1 ){
						chrome.serial.connect(device.port, null, function(connectionInfo){

							if( DEBUG_BOTSPEAK ){
								console.log( 'Serial connection info:' );
								console.log(connectionInfo);
							}

							device.connection_id = connectionInfo.connectionId;
							if (device.connection_id === -1) {
								showError('Error: could not connect to serial.');
								return;
							}
						});
					}

					if( command == "FLUSH" && device.connection_id !== -1 ){
						chrome.serial.flush( device.connection_id, function(result){
						   term.echo('Flush status:' + result);
						});
						return;
					}

					//Get TinySpeak from LabView TCP server and convert it to ArrayBuffer
					send_tcp_msg('127.0.0.1', 9999, command, function(arrayBufferResult){

						var uint8View  = new Uint8Array(arrayBufferResult);
						var bufferTruncated = new ArrayBuffer(uint8View.length - 1);
						var uint8truncated  = new Uint8Array(bufferTruncated);
						var sentString = '';

						//Strip off the last byte
						for(var i = 0; i < uint8View.length - 1; i++){
							uint8truncated[i] = uint8View[i];
							sentString = sentString + uint8View[i].toString(16);
						}

						console.log('serial command: ');
						console.log(uint8truncated);

						term.echo('Hex: ' + sentString);

						send_serial_cmd(device.connection_id, bufferTruncated);
					});
				}

			} catch(e) {
					term.error(new String(e));
				}
				if (command !== '') {
			} else {
			   term.echo('');
			}
		}, {
			enabled: false,
			greetings: 'BotSpeak Terminal',
			name: 'botspeak_demo',
			height: 300,
			width: 400,
			prompt: '> '
			}
		);
	})

})(jQuery)

