LOOM PSEUDOCODE
----------------

# GUI windows/dialogs with buttons/other fields

## DIALOG: Loom connection (dialog hidden uness there is a problem)

	TEXTFIELD: Loom IP address

	BUTTON: Connect (red/highlighted if there is a problem)
	Function:
	- establish TCP connection to loom's IP
	- send init signal (04 0e)
	- confirm ACK signal

## DIALOG: Login

	BUTTON: Start New Project (to entrance menu)

	BUTTON: Continue Project (to scan QR code dialog)

## DIALOG: QR Code scanning

## WINDOW: Entrance menu
Details: Loom does not have to be on or connected to create design or edit design.
	
	DISPLAY/READONLY FIELD: Weaving Progress
	Function/Appearance:
	- blank if new project
	- view previously woven rows (scroll option?)
	- number of rows in design/where the weaver left off

	BUTTON: Create Design from Template (if new project, replaced with edit design after first click)
	Function: go to template menu dialog
	Advanced Option: create custom project

	BUTTON: Edit Design (if design exists, replaces "Create Design from Template" button)
	Function: go to edit window

	BUTTON: Start/Resume (disabled if design does not exist OR if loom is disconnected)
	Options:
	- START (with a newly generated row) - for a new project, start at row 0; for a continuing project, start at last row + 1
	- (continuing project) RESUME at a specified previously-woven row
	Function: go to weaving window

## WINDOW: During weaving
Details/state description: vacuum is on, threads are raised, weaver should have shuttles ready and does not have hands available except for simple button presses

	BUTTON: Pause

	DISPLAY: Row number

	DISPLAY: Pattern repeat tracker
	Function/Appearance:
	- shows drawdown for the woven structure
	- marker that shows place in the structure

	DISPLAY: Yarn for this row (solid color or short code)

	DISPLAY: Weaving Progress/History (similar to entrance menu's)
	Function/Appearance:
	- the current row being woven (highlighted/boxed?)
	- below the current row, the previous rows that had been woven this session (grayed out?)

	DISPLAY (or buttons?): pedals (reverse, refresh, advance)
	Function/Appearance:
	- ALL: highlight/change color when physical pedal pressed
	- Reverse: send loom the previously woven row
	- Refresh: send loom the current row again
	- Advance: send loom the next row in design

## WINDOW: Editing
Entry ways:
- entrance menu
- paused during weaving

	BUTTON: Resume

	BUTTON: Stop
	Options: 
	- go to entrance menu
	- (quit) go to exit menu

	DISPLAY: row number, pattern tracker, yarn, weaving progress all from "During Weaving" window

	BUTTON: Edit (options?)

## WINDOW: Exit menu

	BUTTON: Save work
	Function: 
	- prompt user to name file
	- (if new project) generate QR code before quitting
	- option: send QR code to user (email or text) -> call back end function for AWS SNS
	- save all work to AWS
	- clean Pi files
	- quit program

	BUTTON: Discard work
	Function:
	- clean Pi files
	- quit program

# Back end

FUNCTION: maintain loom connection
- sense a long pause (no signals in ___ seconds)
- resend connect signal 
- ensure ACK signal is returned

FUNCTION: send weaving row to AWS

FUNCTION: send project info to AWS

FUNCTION: call AWS SNS to send QR code to user