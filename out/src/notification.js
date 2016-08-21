'use strict';
var vscode_1 = require('vscode');
function print_error(msg) {
    vscode_1.window.showErrorMessage(msg);
    console.error(msg);
}
exports.print_error = print_error;
function print_info(msg) {
    vscode_1.window.showInformationMessage(msg);
    console.log(msg);
}
exports.print_info = print_info;
//# sourceMappingURL=notification.js.map