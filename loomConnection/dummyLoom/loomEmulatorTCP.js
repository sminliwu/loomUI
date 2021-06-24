// Run this from the command line with `node loomEmulatorTCP.js`
// echo what is sent from the Processing sketch

var net = require('net');
var fs = require('fs');

var pickRequest = Buffer.alloc(11);
pickRequest[0] = 0x05;

class LoomEmulator {
	constructor() {
		this.vacuumOn = false;
		this.socket = new net.Socket();

		this.server = net.createServer(function(socket) {
			this.socket = socket;
			socket.write('Echo server with some loom functions\r\n');
			//socket.pipe(socket);

			socket.on('data', (data) => {
				console.log("received data length: " + data.length);
				if (data.length == 3) {
					if (data[2] == 0x04) {
						const toWrite = Buffer.concat([Buffer.from(data), Buffer.from([0x01])], data.length + 1);
						//console.log("sending " + toWrite);
						this.vacuumOn = true;
						console.log("vacuum on: " + this.vacuumOn);
						setTimeout(function() {
							socket.write(toWrite)
						}, 1000);
						//socket.write("vacuum on");
					} else if (data[2] == 0x01) {
						console.log("vacuum off");
						this.vacuumOn = false;
						setTimeout(function() {
							socket.write(Buffer.concat([Buffer.from(data), Buffer.from([0x01])], data.length + 1));
						}, 1000);
					}
				} if (data.length > 150) { // software sending pick data
					if (this.vacuumOn) {
						console.log("received loom pick, weaving");
						console.log(data)
						setTimeout(function() {
							socket.write(pickRequest);
						}, 1000);
						console.log("requested next pick");
					}
				} else {
				    console.log("data length: "+ data.length);
				    console.log(data);
				    //fs.writeFileSync("log.txt", data, );
				    socket.write(data + "\n roger that");
				}
			});

			socket.on('connect', (data) => {
				console.log("new connection from " + socket.remoteAddress + ":" + socket.remotePort);
			});

			socket.on('error', (e) => {
				console.log(e.code);
			});

			socket.on('close', (err) => {
			if (err) {
				console.log("socket closed due to transmission error");
			}
		});
		});
	}

	vacuumOn() {
		this.vacuumOn = true;
	}

	vacuumOff() {
		this.vacuumOn = false;
	}
}

locutus = new LoomEmulator()

locutus.server.on('listening', function(data) {
	console.log("listening at ", jeanLuc.server.address());
});

locutus.server.on('connection', function(data) {
	console.log("new connection");
});

locutus.server.on('error', (e) => {
	console.log(e.code);
});

console.log("starting");
locutus.server.listen(1337, '127.0.0.1');
