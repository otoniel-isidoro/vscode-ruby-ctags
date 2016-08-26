# VSCODE Ruby-Ctags
## This is the [Visual Studio Code](https://code.visualstudio.com/) extension to use [CTAGS](http://ctags.sourceforge.net/) with Ruby language through of [Ripper-Tags](https://github.com/tmm1/ripper-tags) 
![Icon](images/icon.png)

## Prerequisites:
* OS : Windows / Linux (Test OK) / OSX
* [Ripper-Tags](https://github.com/tmm1/ripper-tags)

## Howto:
* Install ripper-tags "`gem install ripper-tags`" and open the user settings (File > Preferences > User Settings) and set the executable path of ripper-tags and the options to be used like the example below:
```
"ctags": {
    "executePath": "/home/username/.rbenv/shims/ripper-tags",
    "options": "--tag-file=.tags --recursive --force --exclude=/assets/ --exclude=.bundle --exclude=.git/ --exclude=coverage/ --exclude=.arcanist-extensions/ --exclude=log/ --exclude=tmp/ --exclude=bin/",
    "fileName": ".tags"
}
```
* Open a source code directory using 'Open Folder'
* Generate the ctag file for ruby using 'CTAGS:Generate Ruby tags' command. (Press 'F1' key and type 'CTAGS:Generate Ruby tags' or the keybinding `ctrl+alt+g`)
* After the ctag file was generated, search the symbol by select it on editor and use 'CTAGS:Search Ruby code' command. (Press 'F1' key and type 'CTAGS:Search Ruby code' or the keybinding `ctrl+alt+t`);

## Keybindings
### 1. Generate ctags
Press `ctrl+alt+g` (`cmd+alt+g` on mac)  
![IDE](http://i.giphy.com/l0MYD3PYsZgkAkvEQ.gif)

### 2. Search ctags
Select the words in the vscode and press `ctrl+alt+t` (`cmd+alt+t` on mac)  
![IDE](http://i.giphy.com/l0MYQ3blbA8UDD0w8.gif) 

## Etc
* Source : [otoniel-isidoro/vscode-ruby-ctags](https://github.com/otoniel-isidoro/vscode-ruby-ctags)

## Release Notes
* 2016.08.23 1.4.0 : Fix runtime dependencies 
* 2016.08.22 1.3.1 : Update README 
* 2016.08.22 1.3.0 : Add new keywords 
* 2016.08.22 1.2.0 : Change command description
* 2016.08.21 1.1.0 : Fix npm `hashmap` dependency 
* 2016.08.21 1.0.0 : First release

## TODO
* Integration with VSCODE Go To Definition [vscode-api#DefinitionProvider.provideDefinition](https://code.visualstudio.com/Docs/extensionAPI/vscode-api#DefinitionProvider.provideDefinition)
* Integration with VSCODE Go to Symbol [vscode-api#languages.registerDocumentSymbolProvider](https://code.visualstudio.com/Docs/extensionAPI/vscode-api#languages.registerDocumentSymbolProvider)
* Go To Definition with mouse click   

## Credits
#### This is a fork of [hcyang1012/vscode_ctags](https://github.com/hcyang1012/vscode_ctags) that was adapted to work better with ruby language.
#### Thanks to hcyang1012!

#### Thanks to [Ripper-Tags](https://github.com/tmm1/ripper-tags) for the faster and accurate ctags generator! :) 
