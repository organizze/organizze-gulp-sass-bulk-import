/**
 * Takes the incomming stream of files and outputs a new file containing a list of @imports rule in sass.
 */
var slash = require('slash');
var path = require('path');
var fs = require('fs');
var through = require('through2');
var glob = require('glob');

module.exports = function() {
    var transform = function(file, env, cb) {
        // find all instances matching
        var contents = file.contents.toString('utf-8');

        // regex to match an @import that contains glob pattern
        var reg = /@import\s+\S([^"']*\*(\.scss)?)["'];?/;
        var result;

        while((result = reg.exec(contents)) !== null) {
            var index = result.index;
            var importRule = result[0];
            var globPattern = result[1];
            var imports = [];


            var files = glob.sync(path.join(path.dirname(file.path), globPattern), {
                cwd: file.base
            });

            files.forEach(function(filename) {
                if ((file.path != filename) && (path.extname(filename).toLowerCase() == '.scss')) {
                    filename = path.normalize(filename);
                    var base = path.join(path.normalize(path.dirname(file.path)), '/');

                    filename = filename.replace(base, '');
                    imports.push('@import "' + slash(filename) + '";');
                }
            });

            var replaceString = imports.join('\n');
            contents = contents.replace(importRule, replaceString);
            file.contents = new Buffer(contents);
        }

        cb(null, file);
    };
    return through.obj(transform);
};
