/*
 	FILE/MODULE: socketClient.js
	re-implementation of Python files in loomConnection	
*/

var net = require('net');
var tc2 = require('./TC2-sys.js');

/*
	Mostly just a wrapper around a TCP socket that maintains connection with the loom
*/
class LoomConnection {
	socket;
	readBuffer;
	writeBuffer;

	// event emitters
	status;
	// readAvailable;
	// readCleared;
	// writeAvailable;
	// writeCleared;

	constructor(loomHandle) {
		this.status = new EventEmitter();

		this.socket = net.createConnection(loomHandle.port, loomHandle.host, (socket) => {
			console.log("connected to host");
		});

		this.socket.on('data', (data) => {
			console.log("received data: " + data);
			console.log(data.length + " bytes");
			this.readBuffer = data;
			this.status.emit('read-available', data);
		});

		this.socket.on('close', (err) => {
			if (err) {
				console.log("socket closed due to transmission error");
			}
		});

		this.socket.on('error', (err) => {
			console.log(err.code);
		});
	}

	send(data) {
		this.writeBuffer = data;
		this.socket.write(data);
	}

	end() {
		this.socket.end();
	}
}

/*
	Wraps the loom connection (TCP socket) and interprets incoming traffic from the socket as data sent from the loom
*/
class LoomHandle {
	realLoom;
	host;
	port;
	connected = false;
	loomConnection;

	// loom config
	modules;
	width;
	depth;
	threads;
	moduleOrder = Buffer.from([1, 4, 2, 5, 3, 6]);
	// for 6 modules and 2W: [1, 3, 5, 2, 4, 6]

	// loom operation state
	vacuum;
	pickNumber = 0; // number of draft rows sent to the loom
	
    constructor(numModules = 6, width = 3, realLoom = false) {
    	this.realLoom = realLoom;
    	if (this.realLoom) {
    		this.host = '192.168.7.20';
    		this.port = tc2.port;
    	} else {
    		this.host = '127.0.0.1';
    		this.port = 1337
    	}
    	this.loomConnection = new LoomConnection(this);
    	
    	this.modules = numModules;
    	this.width = width;
    	this.depth = this.modules/this.width;
    	if (this.modules != 6 || this.width != 3) {
    		this.computeModuleOrder();
    	}
    }

    // fix this, LOW PRIORITY
    computeModuleOrder() {
    	this.moduleOrder = Buffer.alloc(this.modules);
    	for (var i=0; i < this.modules; i++) {
    		// row: i / this.width
    		// col: i % this.width
    		// depth: this.modules / this.width
    		// place = col * depth + row
    		var place = ((i % this.width) * this.modules + i) / this.width;
    		this.moduleOrder[Math.floor(place)] = i+1;
    	}
    }

    send(data) {
    	this.loomConnection.send(data);
    }

    vacuumOn() {
    	this.send(tc2.VAC_ON);
    	this.vacuum = true; // wait for loom confirmation instead?
    }

    vacuumOff() {
    	this.send(tc2.VAC_OFF);
    	this.vacuum = false;
    }

    /*
		input: pick - an array of ints/booleans from a weaving draft
		returns: none
    */
    sendPick(pick) {
    	// turn on the vacuum if necessary
    	if (!this.vacuum) { this.vacuumOn(); }
    	
    	// put together front matter
    	var frontMatter = Buffer.concat([tc2.PICKFM_A, Buffer.from([this.pickNumber]), tc2.PICKFM_B])
    	
    	// convert pick array to bytes
    	var pickBytes = Buffer.concat([frontMatter, this.pickToBytes(pick)]);
    	// send
    	this.send(pickBytes);
    	this.pickNumber++;
    }

    /*
		input: pick - array (same as sendPick function)
		returns: bytes Buffer
    */
    pickToBytes(pick) {
    	var packedBytes = Buffer.alloc(0);

    	for (var i=0; i<this.modules; i++) {
    		// each module takes 240 bits, even though tpm = 220
    		// 240 bits = 30 bytes 
    		// + 1 byte at beginning for module number
    		var moduleBytes = Buffer.alloc(31);
    		var moduleBits = [];

    		m = moduleOrder[i]; // which number module are we dealing with?
    		moduleBytes[0] = m;

    		// modAmount: depends on depth of loom config
    		// 2 deep: front modules handle even, back half handles odds
    		// 3 deep: 
    		var modAmount = (i+1) % this.depth;

    		// find the segment of pick that corresponds to this module
    		var rightEdge = Math.floor(this.threads - (((m-1)%(self.width)) * (tc2.tpm*this.depth)) - 1);

    		var leftEdge = rightEdge - (tc2.tpm*this.depth) + 1;

    		// rearrange bits in pick according to lookup table
    		for (var t=rightEdge; t > leftEdge; t--) {
    			if (t%this.depth == modAmount) {
    				var threadLocationInModule = Math.floor((rightEdge-t)/this.depth);
    				moduleBits[tc2.lookup[threadLocationInModule]] = pick[t];
    			}
    		}

    		// pack bits into bytes
    		for (var b=0; b<30; b++) {
    			var j = b*8;
    			var thisByte = 	moduleBits[j]<<7 | 
    							moduleBits[j+1]<<6 | 
    							moduleBits[j+2]<<5 |
    							moduleBits[j+3]<<4 |
    							moduleBits[j+4]<<3 |
    							moduleBits[j+5]<<2 |
    							moduleBits[j+6]<<1 |
    							moduleBits[j+7]<<0;
    			moduleBytes[b+1] = thisByte;
    		}
    		packedBytes = Buffer.concat([packedBytes, moduleBytes]);
    	}
    	return packedBytes;
    }
}

module.exports = { 
	LoomConnection, 
	LoomHandle 
};

// true if this file is run via command line, but
// false if run by a require statement
if (require.main === module) {
	var realLoom = false;

	jean_luc = new LoomHandle(6,3,realLoom);
	jean_luc.vacuumOn();

	jean_luc.vacuumOff();
}