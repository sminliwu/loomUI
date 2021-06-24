/*
	FILE/MODULE: TC2-sys.js
	keeping a glossary of all of the loom things we know so far
	- things that the computer needs to send the loom
	- things that the loom will send the computer
*/

TC2_sys = {
	/*
		LOOM PARAMETERS
		Things that will not change about the TC2 system unless Tronrud really switches things up in an update
	*/
	tpm: 220,
	port: 62000,

	/*
		COMPUTER --> LOOM
	*/
	// after socket is established, loom needs these 2 bytes to start accepting other commands
	initiateLoomConnection: Buffer.from([0x04, 0x0e]),

	turnVacuumOn: Buffer.from([0x01, 0x01, 0x04]),
	turnVacuumOff: Buffer.from([0x01, 0x01, 0x01]),
	
	// each pick is sent with 7 starting bytes:
	// pickFrontMatter_A (2B) + the pick number (1B) + pickFrontMatter_B (4B)
	pickFrontMatter_A: Buffer.from([0x05, 0x02]),
	pickFrontMatter_B: Buffer.from([0x00, 0x06, 0x01, 0x06]),

	// array for lookup table (reordering bits for a loom pick)
	// DERIVED BY LEA
	lookup: Buffer.from([7, 5, 3, 151, 149, 55, 53, 51, 199, 197, 1, 11, 9, 147, 145, 49, 59, 57, 195, 193, 23, 21, 155, 153, 71, 69, 67, 203, 201, 19, 17, 31, 167, 165, 65, 79, 77, 215, 213, 29, 27, 25, 163, 161, 75, 73, 87, 211, 209, 39, 37, 35, 175, 173, 85, 83, 81, 223, 221, 33, 47, 45, 171, 169, 95, 93, 219, 217, 43, 41, 6, 183, 181, 91, 89, 103, 231, 229, 4, 2, 0, 179, 177, 101, 99, 97, 227, 225, 10, 8, 22, 191, 189, 107, 105, 119, 239, 237, 20, 18, 16, 187, 185, 117, 115, 113, 235, 233, 30, 28, 150, 148, 127, 125, 123, 198, 196, 26, 24, 38, 146, 144, 121, 135, 133, 194, 192, 36, 34, 32, 154, 152, 131, 129, 143, 202, 200, 46, 44, 42, 166, 164, 141, 139, 137, 214, 212, 40, 54, 52, 162, 160, 102, 100, 210, 208, 50, 48, 58, 174, 172, 98, 96, 106, 222, 220, 56, 70, 68, 170, 168, 104, 118, 116, 218, 216, 66, 64, 78, 182, 180, 114, 112, 126, 230, 228, 76, 74, 72, 178, 176, 124, 122, 120, 226, 224, 86, 84, 190, 188, 134, 132, 130, 238, 236, 82, 80, 94, 186, 184, 128, 142, 140, 234, 232, 92, 90, 88, 138, 136]),

	/*
		LOOM --> COMPUTER
	*/
	pickRequestLength: 11,
	pickRequest: Buffer.alloc(11, 0x05), // byte 0 = 0x05

	vacuumConfLength: 4,
	vacuumOnConfirmation: Buffer.alloc(4, 0x04), // byte 2 = 0x04
};

abbv = {
	VAC_ON: TC2_sys.turnVacuumOn,
	VAC_OFF: TC2_sys.turnVacuumOff,
	PICKFM_A: TC2_sys.pickFrontMatter_A,
	PICKFM_B: TC2_sys.pickFrontMatter_B,
};

TC2_sys = {...TC2_sys, ...abbv}

module.exports = TC2_sys;