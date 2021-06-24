/*
	FILE/MODULE: pedals.js
	re-implements some of pedalGPIO.py, expanding the pedals
	to more flexible configurations

	TODO:
	- figure out event handlers for async operation
	- plug into GUI (AdaCAD updates)
*/

const Gpio = require('pigpio').Gpio;

/*
	CLASS: PedalHandler
	Direct re-implementation of pedalHandler, Python -> JS
	Keeps track of pedal inputs, and interprets the user input
	to the rest of the design/loom system
	- if the pedal function involves loading a new pick to the loom,
		make sure to toggle the relay output pin
*/
class PedalHandler {
	pedals; 	// array of PedalContainers
	control;	// PedalController
}

/*
	CLASS: PedalController
	The hardware interface to the pedals, handling the 
	physical GPIO pins and keeping track of how many pedals 
	are connected in what input state for the rest of the 
	system.
*/
class PedalController {
	// output pins (Gpio objects)
	_CLK_SIGNAL;	// Pi generates a clock signal
	_SHIFT_EN; 		// ~WRITE / SHIFT in circuit diagrams
	_LOOM_RELAY; 	// output pin to relay, triggers the loom requesting a new pick

	// input pins (Gpio objects)
	_PEDALS;		// 1 pin = pedal states (1-bit) in series
	_COUNT; 		// 4 pins in parallel = 4-bit number
	
	_COUNT_BITWIDTH = 4; // this shouldn't change for now, but maybe for handling more output/inputs eventually

	// system state variables
	countState;		// array for reading in the _COUNT GPIO pins
	pedalStates; 	// array with length = numPedals (binary, 0/1)
	numPedals;		// countState -> decimal

	// events
	countChanged;
	statesReady;

	/*
		function: constructor
		inputs: the pin numbers that the RPi will be interfacing with
			- clk, shift, pedals, loomRelay: GPIO pin numbers
			- countPins: array of [_COUNT_BITWIDTH] GPIO pin numbers
	*/
	constructor(clk, shift, pedals, loomRelay, countPins) {
		this._CLK_SIGNAL = new Gpio(clk, {mode: Gpio.OUTPUT});
		this._SHIFT_EN = new Gpio(shift, {mode: Gpio.OUTPUT});
		this._PEDALS = new Gpio(pedals, {mode: Gpio.INPUT});
		this._LOOM_RELAY = new Gpio(loomRelay, {mode: Gpio.OUTPUT});
		
		if (countPins.length == this._COUNT_BITWIDTH) {
			this.countState = Buffer.alloc(this._COUNT_BITWIDTH);
			this._COUNT = new Array(this._COUNT_BITWIDTH);
			for (var i=0; i<this._COUNT_BITWIDTH; i++) {
				this._COUNT[i] = new Gpio(countPins[i], {mode: Gpio.INPUT});
			}
		} else {
			console.log("wrong number of pins for count");
			// throw error
		}
	}

	/*
		function: readCycle
		Basically PedalController's loop() function
	*/
	readCycle() {
		readCount();
		waitForPedals();
		readPedals();
	}

	/*
		function: readCount
		reads _COUNT array of pins, converting 
		4-bit binary number to decimal number
		- if pedal count has changed, update the rest of the system
		- when additional pedals are first connected, initialize to state 0
	*/
	readCount() {
		// read pins [_COUNT] as 4-bit binary
		for (var i=0; i < this._COUNT) {
			let pin = this._COUNT[i];
			this.countState[i] = pin.digitalRead();
		}

		// numPedals = _COUNT -> decimal
	}

	/*
		function: waitForPedals
		run clock for [numPedals] cycles to allow for user 
		input on pedals and registers to load
	*/
	waitForPedals() {
		// _SHIFT_EN pin (~ WRITE / SHIFT) = low
		// run clock for [numPedals] cycles (or longer?)
	}

	/*
		function: readPedals
		read in bits from _PEDALS for a duration of
		[numPedals] clock cycles
		- store bits in pedalStates array as booleans
	*/
	readPedals() {
		// _SHIFT_EN pin (~WRITE / SHIFT) = high
		// run clock for [numPedals] cycles
		// for each bit read in from _PEDALS pin, 
			// shift into pedalStates array
	}
}

/*
	CLASS: PedalFunction
	represents what should happen to the draft/weaving system when some pedal event occurs (change in 0/1, rising edge/falling edge, etc.)

	possible types: 
		- edit weave
		- advance/reverse/refresh weave file (fabrication flow)
		- debug (e.g. layer separation)
*/
class PedalFunction {
	name;			// string
	type; 			// string - list of categories kept somewhere else
	relayToggle; 	// boolean - if true, toggle relay on pedal change
}


/*
	CLASS: PedalContainer
	stores a representation of a single pedal (digital input, SPDT switch),
	its associated function (what happens to the draft when its
	state changes), and the most recent state read in by the
	PedalController
*/
class PedalContainer {
	fxn; 	// PedalFunction
	state; 	// boolean
	pos; 	// ??? number representing this pedals ID/position in system

	// events
	fxnChanged;

	/*
		function: constructor
		inputs: all optional, defaults to a placeholder pedal
		- fxn = function to preload (allows for a default config)
		- place = position in a physical array of pedals OR
			maybe if there eventually are "pedals" (inputs) in other places on the loom
	*/
	constructor(fxn=null) {
		this.fxn = fxn;
		this.state = false;
	}
}

module.exports = {
	PedalHandler,
	PedalController,
	PedalFunction,
	PedalContainer
};