'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
//import { LanguageClient, LanguageClientOptions, SettingMonitor, ServerOptions, TransportKind } from 'vscode-languageclient';
var CTAG_Manager = require("./ctag_manager");
var notification = require('./notification');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "ctags" is now active!');
    var extension = new Extension(context);
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    // Options to control the language client
    /*let clientOptions: LanguageClientOptions = {
        // Register the server for C source codes
        documentSelector: ['C'],
    }   */
    var disposable = vscode.commands.registerCommand('extension.sayHello', function () {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World!');
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
var Extension = (function () {
    function getEditor() {
        var editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        return editor;
    }
    function getSelectedText(editor) {
        var selection = editor.selection;
        var text = editor.document.getText(selection).trim();
        if (!text) {
            var range = editor.document.getWordRangeAtPosition(selection.active);
            text = editor.document.getText(range);
        }
        return text;
    }
    function Extension(context) {
        var _this = this;
        var disposable = vscode.commands.registerCommand('extension.ctag_generate', function () {
            _this.generate_tag();
        });
        context.subscriptions.push(disposable);
        disposable = vscode.commands.registerCommand('extension.ctag_search', function () {
            _this.search();
        });
        context.subscriptions.push(disposable);
        this.ctag_manager = new CTAG_Manager.CTAG_Manager();
        console.log("CTag Extension has been initialized");
    }
    Extension.prototype.search = function () {
        var parent = this;
        var editor = getEditor();
        var query = getSelectedText(editor);
        console.log(query);
        vscode.window.showInputBox({prompt: "Input the symbol name", value: query}).then(function (targetSymbol) {
            parent.ctag_manager.search(targetSymbol, function (msg) {
                notification.print_info(msg);
            });
        });
    };
    Extension.prototype.generate_tag = function () {
        this.ctag_manager.generate_tag();
    };
    return Extension;
}());
//# sourceMappingURL=extension.js.map