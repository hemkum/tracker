import * as vscode from 'vscode';
var fs = require('fs');
var os = require('os');
var path = require('path');
var builder = require('xmlbuilder');
var ks = require('node-key-sender');
var clipboardy = require('clipboardy');

// declare global variables
var vscode_dir = path.join(os.homedir(), 'vscode-tracker');		//  path of vscode-tracker directory
var data_path = path.join(vscode_dir, 'data.xml');		// path of vscode-tracker/data.xml file
var winsize_path = path.join(vscode_dir, 'winsize.txt'); //path of vscode-tracker/winsize.txt file
let query_number = 0;
var feed: any;
var xorigin: number;
var yorigin: number;
var height: number;
var width: number;

ks.setOption('startDelayMillisec', 2000); //delay (in ms) before first ks call

/** activate() function is executed when registered Activation Event ie. extension.starttracker is executed either via predefined shortcut or via command palette
 *  deactivate() gives a chance to clean up before extension becomes deactivated.
 */
export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('extension.starttracker', () => {
		vscode.window.showInformationMessage('Tracker Started');
		create_vscode_dir();	//create vscode-tracker directory and data.xml file
		generate_winsize_data();	//generate and write winsize data to winsize.txt
		read_winsize_data();	//read data from winsize.txt file 
		collectdata('init_data');	// populate feed variable with initial data
		collectdata('create_static_data');	// append intial static data to feed
		collectdata('create_dynamic_data'); // append intial dynamic data to feed
	});
	context.subscriptions.push(disposable); // disposable will be executed every time extension.starttracker command is executed.
	context.subscriptions.push(vscode.window.onDidChangeTextEditorVisibleRanges(e => collectdata("create_dynamic_data"))); // listens for scrolling events and call collectdata
	/** Following command listens for extension.stoptracker command (which is triggered by Ctrl + Shift + L shortcut ) and calls appropriate functions thereafter */
	context.subscriptions.push(vscode.commands.registerCommand('extension.stoptracker', () => {
		collectdata("save_file");
		vscode.window.showInformationMessage('Tracker stopped');
		query_number = 0;
		deactivate();
	}));
	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(e => { collectdata("create_static_data"); })); // listen for current tab change event
}

export function deactivate() {
	query_number = 0; // to set variable back to 0 before starting new extension again
}

/** generate_winsize_data() function opens developer tools, then uses ks to open console,
 *  It then copies script to clipboard using clipboardy, paste clipboard buffer into the console and press enter and then close devtool.
 * The script writes winsize data ie. xorigin and yorigin of top left vertex of editor, height and width of editor to winsize.txt file
 * setTimeout is used because often devtool takes time to open, it can reduced if you want.
 */
export function generate_winsize_data() {
	vscode.commands.executeCommand('workbench.action.toggleDevTools'); // open devtool
	setTimeout(() => {
		ks.sendCombination(['control', '~']). /** open console in devtool */
			then(clipboardy.write(`try { global.fs = require('fs'); } catch(e){}
		try {  global.os = require('os'); } catch(e){}
		var winsize_array = new Array(document.querySelector('.part.activitybar.left').offsetWidth + document.querySelector('.part.sidebar.left').offsetWidth ,
			document.querySelector('.part.titlebar.inactive').offsetHeight + document.querySelector('.title.tabs.show-file-icons').offsetHeight ,
			document.querySelector('.monaco-scrollable-element.editor-scrollable.vs').offsetWidth
			- document.querySelector('.minimap.slider-mouseover').offsetWidth ,
			document.querySelector('.monaco-scrollable-element.editor-scrollable.vs').offsetHeight, Date.now() );			  
		if(os.platform() === 'win32' && typeof winsize_array !== 'undefined' && winsize_array.length > 0 ) 
		fs.writeFileSync( os.homedir().concat("/vscode-tracker/winsize.txt") ,winsize_array);
		else if(typeof winsize_array !== 'undefined' && winsize_array.length > 0)
		fs.writeFileSync(os.homedir().concat('/vscode-tracker/winsize.txt') ,winsize_array);`));
		ks.sendCombination(['control', 'v'])
			.then(ks.sendKey("@10"))
			.then(ks.sendKey("enter"));
	}, 2000);
	setTimeout(() => {
		vscode.commands.executeCommand('workbench.action.toggleDevTools'); //close devtool
	}, 5000);
}
/** This function reads value of winsize variables from vscode-tracker/winsize.txt file and assigns the value to respective global variables */
export function read_winsize_data() {
	/** Active-win module gives the coordinate of top corner of whole vscode window which is usually offset in *unix based system,
	 * however the coordinates are 0,0 in Windows. So, active-win is redundant in Windows OS 
	 *  If using this extension in *nix system,
	 *  add this line at top of this file : var activeWin = require('active-win');
	 * install active-win module in source directory : $ npm i --save active-win 
	 * Uncomment all three winobject calls below
	 * 
	*/
	//var winobject = activeWin.sync();
	var a = fs.readFileSync(winsize_path, 'utf8').split(",");
	xorigin = parseInt(a[0]);// + winobject.bounds.x;
	yorigin = parseInt(a[1]);// + winobject.bounds.y;
	width = parseInt(a[2]);
	height = parseInt(a[3]);
}


/**
 * This function defines three switch cases. It uses xmlbuilder module to store generated data in xml format and assign it to global variable - feed.
 * Each time this function is called with switch cases: init_data or create_static_data or create_dynamic_data, new data is appended to feed variable.
 * When the function is called with switch case save_file, fs module writes the feed variable (containing the xml data structure) into the data.xml file. 	 
 */

function collectdata(state: string): void {
	switch (state) {
		case "init_data": {
			//console.log("init case started");
			feed = builder.create('IDE_Details', { encoding: 'utf-8' }, { keepNullNodes: true, keepNullAttributes: true })
				.ele('mode', { 'type': 'static' })
				.ele('data', { 'category': 'Text_Editor' })
				.ele('height', height).up()
				.ele('width', width).up()
				.ele('xorigin', xorigin).up()
				.ele('yorigin', yorigin).up()
				.ele('data', { 'category': 'font_size' }, vscode.workspace.getConfiguration('editor').get('fontSize')).up()
				.up()
				.up();
				/** up() function provides a means to return back to the parent node after creating the child node  */
			//console.log('init case finished');
			break;

		}
		case "create_static_data": {

			feed.ele('mode', { 'type': 'static' })
				.ele('data', { 'category': 'active_tab' }, activetab(vscode.window.activeTextEditor)).up()
				.up();
			//console.log('static data generated');
			break;
		}
		case "create_dynamic_data": {
			feed.ele('mode', { 'type': 'dynamic' })
				.ele('data', { 'category': 'query_number' }, query_number).up()
				.ele('data', { 'category': 'time_stamp' }, Date.now()).up()
				.ele('data', { 'category': 'shown_lines' })
				.ele('start_line', gettopline(vscode.window.activeTextEditor)).up()
				.ele('end_line', getbottomline(vscode.window.activeTextEditor)).up()
				.up();
			query_number++;
			//console.log('dynamic data generated');
			break;
		}
		case "save_file": {
			fs.appendFile(data_path, feed.end({ pretty: true }), function (err: any) {
				if (err) { return console.log(err); }
			});
			console.log('file saved');
			query_number = 0;
			console.log(query_number);
			break;

		}
	}
}
/** this function return name of currently open file/tab  */
function activetab(e: any) {
	var currenttab;
	if (vscode.window.state.focused) {
		currenttab = e.document.fileName.replace(/^.*[\\\/]/, '');
	}
	return currenttab;
}
/** this function return line number of topmost visible line, this function is called inside switch case: create_dynamic_data of collectdata() function */
function gettopline(editor: vscode.TextEditor | undefined): number {
	let topline = 0;
	if (editor) {
		topline = editor.visibleRanges[0].start.line;
		topline++;
	}
	return topline;
}
/** this function return line number of bottommost visible line, this function is called inside switch case: create_dynamic_data of collectdata() function */
function getbottomline(editor: vscode.TextEditor | undefined): number {
	let bottomline = 0;
	if (editor) {
		bottomline = editor.visibleRanges[0].end.line;
		bottomline++;
	}
	return bottomline;
}
/** This function create vscode_dir ie vscode-tracker in home directory, if it doesnot exists, and then create empty data.xml file after deleting previous data.xml file  */
function create_vscode_dir() {
	if (!fs.existsSync(vscode_dir)) {
		fs.mkdirSync(vscode_dir);
	}
	fs.closeSync(fs.openSync(data_path, 'w'));
}
