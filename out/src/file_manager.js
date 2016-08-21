'use strict';
function test_file_size(file_path, max_size) {
    var fs = require("fs");
    try {
        var stat_result = fs.statSync(file_path);
        if (stat_result.size < max_size) {
            return true;
        }
    }
    catch (e) {
        return false;
    }
    return false;
}
exports.test_file_size = test_file_size;
function file_exists(file_path) {
    var fs = require("fs");
    try {
        fs.accessSync(file_path, fs.R_OK);
    }
    catch (e) {
        return false;
    }
    return true;
}
exports.file_exists = file_exists;
function parse_file_line(file_path, parse, error, success) {
    var fs = require('fs');
    var es = require('event-stream');
    var stream = fs.createReadStream(file_path).pipe(es.split()).pipe(es.mapSync(function (line) {
        stream.pause();
        parse(line);
        stream.resume();
    }).on('error', function () {
        error();
    }).on('end', function () {
        success();
    }));
}
exports.parse_file_line = parse_file_line;
//# sourceMappingURL=file_manager.js.map