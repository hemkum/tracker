# tracker README
This is the README for extension "tracker".

## Features/logged data
1. Coordinates and size ( width, height ) of editor window.
2. Name of active file/tab.
3. Top and bottom line number along with timestamp whenever user scrolls.
4. All this data is saved in *$(homedir)/vscode-tracker/data.xml* file   
where $(homedir) is *C:/Users/username/* in Windows and */home/username/* in Linux.

## Requirements
> For using extension 
1. Vscode IDE
2. Java RunTime : For node-key-sender module

> For modifying extension source code
1. Node.js : For compiling extension source code
2. Python 2 : For node-gyp
4. Git ( optional )

### Nodejs Modules/dependencies
> For running extension   
(Note : these packages are automatically installed on running `npm install`  as    mentioned in [ Installation/Using source code ](#Using-source-code) and are automatically included in .vsix file
1. clipboardy
2. node-key-sender
3. xmlbuilder
4. fs
5. os
6. path

> For modifying/using source code
1. vsce : For packing extension into installable .vsix file.   
Installation : `$ npm install -g vsce`
2. yo, generator-code : Scaffolds project ready for development.   
Installation : `$ npm install -g yo generator-code`
3. node-gyp : for building the node native modules.
Installation : `$ npm install -g node-gyp`

## Installing Extension
### Using installable binary (command line):
```
$ cd tracker                       / Go to source code directory
$ code --install-extension *.vsix  / install .vsix as extension
```
### Using installable binary (GUI):
1. Open vscode
2. Press Ctrl + Shift + X to open Extension Manager
3. Press three dots at the top
4. Choose option : Install from VSIX..
5. Navigate to extension source code directory and choose .vsix file

### Using source code
(Note: Install [requirements](#Requirements) and [dependencies](#Nodejs-Modules/dependencies) before continuing)
```
$ git clone https://                / Download Source code
$ cd tracker                        / Go to source directory
$ npm install                       / Automatically download dependencies defined in package.json
$ code .                            / Open vscode editor in current directory
$ vsce package                      / Create .vsix file
$ code --install-extension *.vsix   / Install .vsix as extension
```

## How to use
1. Open file/files in vscode
2. **Start extension** using shortcut Ctrl + Alt + O
3. Wait for ~5 seconds to allow the script to generate and save window size data   
4. Read files
5. Press Ctrl + Alt + L to **stop extension** and save data to data.xml file.
6. To collect another set of data, follow step 1-5.
7. Previous file is overwritten on starting extension again.  
 Note: It is necessary to stop the extension, once it is started before starting extension again.

## Extension Settings
* `package.json` - this is the manifest file in which you declare your extension and command.   
* This extension contributes the following commands and keybindings through `package.json` file.
```
* extension.starttracker ( Ctrl + Alt + O ) : enable/start this extension
* extension.stoptracker ( Ctrl + Alt + L ) : stop tracker
* editorScroll ( Ctrl + Up ) : Scroll up $(value) lines
* editorScroll ( Ctrl + Down ) : Scroll down $(value) lines

$(value) is the number of lines scrolled at once.
```
```
Activation Events: events upon which extension becomes active.
Currently it is set to -> onCommand:extension.starttracker
```

* `src/extension.ts` - this is the main file where you will provide the implementation of your command.
  * The file exports one function, `activate`, which is called the very first time your extension is activated (in this case by executing the command). Inside the `activate` function we call `registerCommand`.
  * We pass the function containing the implementation of the command as the second parameter to `registerCommand`.

## Extension developement host
One can modify and run extension in developement host mode without the need to compile it into .vsix file and installing .vsix extension.

Steps to run extension in developement host 

* Press `F5` to open a new window with your extension loaded.
* Run your command from the command palette by pressing (`Ctrl+Shift+P`) and typing `extension.starttracker` or by using the shortcut `Ctrl + Alt + O`.
* Set breakpoints in your code inside `src/extension.ts` to debug your extension.
* Find output from your extension in the debug console.
* You can relaunch the extension from the debug toolbar after changing code in `src/extension.ts`.
* You can also reload (`Ctrl+R` ) the VS Code window with your extension to load your changes.

## Known Issues
1. Set npm proxy to successfully install npm modules if you are behind a proxy server.


## Useful Links
[Building extension](https://code.visualstudio.com/api/get-started/your-first-extension) - Create Hello World Extension. Also used to scaffold empty project.

## Release Notes
-----------------------------------------------------------------------------------------------------------
