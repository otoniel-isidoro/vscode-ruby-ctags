'use strict';
var vscode_1 = require('vscode');
var HashMap = require('hashmap');
var notification = require("./notification");
var file_manager = require("./file_manager");
var CTAG_COMMAND = "ripper-tags";
var CTAG_OPTION = "--tag-file=.tags --recursive --force --exclude=/assets/ --exclude=.bundle --exclude=.git/ --exclude=coverage/ --exclude=.arcanist-extensions/ --exclude=log/ --exclude=tmp/ --exclude=bin/";
var CTAGS_TAG_FILE_NAME = "tags";
var LARGE_FILE_SIZE_BYTE = (50 * 1024 * 1024); // 50MB
var Status;
(function (Status) {
    Status[Status["NONE"] = 0] = "NONE";
    Status[Status["GENERATING"] = 1] = "GENERATING";
    Status[Status["GENERATED"] = 2] = "GENERATED";
    Status[Status["LOADING"] = 3] = "LOADING";
    Status[Status["LOADED"] = 4] = "LOADED";
})(Status || (Status = {}));
;
var CTAG_Manager = (function () {
    function CTAG_Manager() {
        this._ctags_tagpath = "";
        this._current_path = "";
        this._tags = new HashMap();
        this._configuration = null; 
        this._reset_if_need();
    }
    CTAG_Manager.prototype._reset_if_need = function () {
        if (this._current_path != vscode_1.workspace.rootPath) {
            this._current_path = vscode_1.workspace.rootPath;
            this._configuration = vscode_1.workspace.getConfiguration('ctags')
            this._set_tagpath();
            this._status = Status.NONE;
            this._tags.clear();
        }
    };
    CTAG_Manager.prototype._set_tagpath = function () {
        var tagsFileName = this._configuration.get("fileName", CTAGS_TAG_FILE_NAME)
        this._ctags_tagpath = require('path').join(this._current_path, tagsFileName);
    };
    CTAG_Manager.prototype._get_tagpath = function () {
        return this._ctags_tagpath;
    };
    CTAG_Manager.prototype._load_tags = function () {
        if (this._status == Status.LOADING) {
            /* Already in loading, do not run again.*/
            return;
        }
        var manager = this;
        this._status = Status.LOADING;
        if (!file_manager.test_file_size(this._ctags_tagpath, LARGE_FILE_SIZE_BYTE)) {
            notification.print_error("Can't load large ctag file larger than " + LARGE_FILE_SIZE_BYTE / 1024 / 1024 + "MB. Loading has been cancelled");
            return;
        }
        file_manager.parse_file_line(this._ctags_tagpath, function (line) {
            if (line[0] != '!') {
                var tag = manager._extract_tag(line);
                if (tag != null) {
                    if (!manager._tags.has(tag.symbol)) {
                        manager._tags.set(tag.symbol, [ tag ]);
                    } else {
                        manager._tags.get(tag.symbol).push(tag);
                    }
                }
            }
        }, function () {
            notification.print_error("Error on loading ctag info.");
            manager._status = Status.NONE;
        }, function () {
            notification.print_info("Tag information has been loaded. You can search tag now");
            manager._status = Status.LOADED;
        });
    };
    CTAG_Manager.prototype._extract_tag = function (line) {
        var info_array = line.split('\t');
        if (info_array.length < 3) {
            return null;
        }
        var info = {
            symbol: info_array[0],
            file: require('path').join(this._current_path, info_array[1]),
            pattern: info_array[2].substr(info_array[2].indexOf('^') + 1, info_array[2].indexOf('$') - info_array[2].indexOf('^') - 1),
            type: info_array[3],
            class: info_array[4] ? (info_array[4].substr(info_array[4].indexOf('class:') + 6, info_array[4].lengh).replace(/\./g, "::") + ((info_array[3]=="c" || info_array[3]=="m") ? "::" + info_array[0] : "")) :  info_array[0]
        };
        var prev = "";
        var replaced = info.pattern;
        do {
            prev = replaced;
            replaced = prev.replace(/\\(\$|\/|\^|\\)/, "$1");
        } while (prev != replaced);
        info.pattern = replaced;
        return info;
    };
    CTAG_Manager.prototype._search_tag_on_doc = function (tag_info) {
        var parent = this;
        vscode_1.workspace.openTextDocument(tag_info.file).then(function (doc) {
            vscode_1.window.showTextDocument(doc).then(function (editor) {
                var text = doc.getText();
                var start = doc.positionAt(text.indexOf(tag_info.pattern));
                var end = doc.positionAt(text.indexOf(tag_info.pattern) + tag_info.pattern.length);
                var range = new vscode_1.Range(start, end);
                var selection = new vscode_1.Selection(start, end);
                parent._go_to_line(editor, selection.anchor.line)
                editor.selection = selection;
            });
        }, function (error) {
            vscode_1.window.showErrorMessage("Cannot find the symbol : " + tag_info.symbol);
        });
    };
    CTAG_Manager.prototype._go_to_line = function (editor, line) {
        var reviewType = vscode_1.TextEditorRevealType.InCenter;
        if (line == editor.selection.active.line) {
            reviewType = vscode_1.TextEditorRevealType.InCenterIfOutsideViewport;
        }
        var newSe = new vscode_1.Selection(line, 0, line, 0);
        editor.selection = newSe;
        editor.revealRange(newSe, reviewType);
    };
    CTAG_Manager.prototype._tag_search = function (targetSymbol) {
        var info = this._tags.get(targetSymbol);
        var parent = this;
        if (info) {
            var classes = this._extract_class(info);
            if (classes.length > 1){
                vscode_1.window.showQuickPick(classes).then(function (val) {
                    parent._search_tag_on_doc(parent._get_info_from_class(info, val));
                });
            } else {
                this._search_tag_on_doc(info[0]);
            }
        } else {
            var foundByClass = [];
            this._tags.forEach(function(value, key) {
                for (var i = 0; i < value.length; i++) {
                    if (value[i].class=="") break;
                    if (value[i].class.indexOf(targetSymbol)!=-1) {
                        if(value[i].type=="c" || value[i].type=="m" || value[i].type=="C"){
                            foundByClass.push(value[i]);
                        }
                    }
                }
            });
            if (foundByClass.length > 0){
                var classes = this._extract_class(foundByClass);
                if(classes.length > 1){
                    vscode_1.window.showQuickPick(classes).then(function (val) {
                        parent._search_tag_on_doc(parent._get_info_from_class(foundByClass, val));
                    }); 
                } else {
                    this._search_tag_on_doc(foundByClass[0]);
                }
            } else {
                notification.print_error("Cannot find the symbol:" + targetSymbol);
            }
        }
    };
    CTAG_Manager.prototype._get_info_from_class = function (infos, sclass) {
        for (var i = 0; i < infos.length; i++) {
            if(infos[i].class==sclass){
                return infos[i];
            }
        }
    };
    CTAG_Manager.prototype._extract_class = function (infos) {
        var classes = [];
        for (var i = 0; i < infos.length; i++) {
            classes.push(infos[i].class);
        }
        classes = classes.filter(function(elem, pos) {
            return classes.indexOf(elem) == pos;
        });
        return classes;
    };
    CTAG_Manager.prototype._is_large_file = function (file_path) {
        return false;
    };
    CTAG_Manager.prototype.search = function (targetSymbol, error) {
        this._reset_if_need();
        var fs = require("fs");
        if (!file_manager.file_exists(this._get_tagpath())) {
            error("Cannot read ctag file. Please run CTAGS:Generate command first.");
        }
        else {
            if (this._status != Status.LOADED) {
                error("Loading tag info.. Please wait for a while and try again");
                this._load_tags();
                return;
            }
            else {
                this._tag_search(targetSymbol);
            }
        }
    };
    CTAG_Manager.prototype.generate_tag = function () {
        this._reset_if_need();
        var parent = this;
        switch (this._status) {
            /* In doing something, do not run again. just return */
            case Status.GENERATING:
            case Status.LOADING:
                return;
        }
        this._status = Status.LOADING;
        var conf = vscode_1.workspace.getConfiguration('ctags');
        var exec = require('child_process').exec;
        var ctag_command = this._configuration.get('executePath', CTAG_COMMAND);
        var ctag_options = this._configuration.get('options', CTAG_OPTION);
        var command = ctag_command + ' ' + ctag_options;
        //Run ctag;
        notification.print_info("Generating ctag file...");
        exec(command, { cwd: parent._current_path }, function (err, stdout, stderr) {
            if(stderr != null && stderr != ""){
                parent._status = Status.NONE;
                notification.print_error("Error on generate tags:" + stderr);
            } else {
                notification.print_info("Ctag generation has been completed. Loading the tag file low..");
                parent._status = Status.GENERATED;
                parent._load_tags();
            }
        });
    };
    return CTAG_Manager;
}());
exports.CTAG_Manager = CTAG_Manager;
//# sourceMappingURL=ctag_manager.js.map