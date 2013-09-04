/*
 * grunt-rev-md5
 * https://github.com/tactivos/grunt-rev-md5
 *
 * Copyright (c) 2012 Johnny G. Halife & Mural.ly Dev Team
 */
module.exports = function (grunt) {

	var fs = require('fs');
	var url = require('url');
	var path = require('path');
	var crypto = require('crypto');

	var supportedTypes = {
		html: 'html',
		css: 'css',
		soy: 'html',
		ejs: 'html'
	};

	var reghtml = new RegExp(/<(?:img|link|source|script).*\b(?:href|src)\b.*['"]([\/]\w[^'"]+)['"].*\/?>/ig);
	var regcss = new RegExp(/url\(([^)]+)\)/ig);

	var writeln = grunt.log.writeln;

	grunt.registerMultiTask('revmd5', 'Appends a cache busting ?v={MD5} hash to the file reference', function () {
		var self = this;

		var options = this.options({
			encoding: 'utf8',
			safe: false
		});

		var relativeTo = path.resolve(options.relativePath);
		var dest = this.files[0].dest;
		// if we decide we want safe mode (off by default)
		// it will throw warnings (that can be ignored with --force)
		if (options.safe) { writeln = grunt.log.warn; }

        this.files.forEach(function(file, i) {
            var contents = file.src.filter(function(filepath) {
                if (!grunt.file.exists(filepath)) {
                    writeln('Source file "' + filepath + '" not found.');
                    return false;
                } else {
                    return true;
                }
            }).map(function(filepath, aaa) {
				var filename = filepath;
				var type = path.extname(filepath).replace(/^\./, '');
				var content = grunt.file.read(filepath).toString(); // sometimes css is interpreted as object

				if(!supportedTypes[type]) { //next
					var message = grunt.template.process('unrecognized extension: <%= type %> - <%= filename %>', { data: { type: type, filename: filename } });
					return writeln(message);
				}

				if (supportedTypes[type] === 'html') {
					content = html.call(self, content, filename, relativeTo, options);
				} else if (supportedTypes[type] === 'css') {
					content = css.call(self, content, filename, relativeTo, options);
				}

				// write the contents to destination
				var filePath = dest ? path.join(path.resolve(dest), path.basename(filename)) : filename;
				grunt.file.write(filePath, content);
            });
        });

		function html(content, filename, relativeTo, options) {
			return content.replace(reghtml, function (match, resource) {
				return match.replace(resource, stampUrl(resource, filename, relativeTo, options));
			});
		}

		function css(content, filename, relativeTo, options) {
			return content.replace(regcss, function (attr, resource) {
				resource = resource.replace(/^['"]/, '').replace(/['"]$/, '');
				var url = stampUrl(resource, filename, relativeTo, options);

				if(!url) return attr;

				return grunt.template.process('url(<%= url %>)', {
					url: url
				});
			});
		}

		function stampUrl(resource, filename, relativeTo, options) {
			// skip those absolute urls
			if(resource.match(/^https?:\/\//i) || resource.match(/^\/\//) || resource.match(/^data:/i)) {
				grunt.verbose.writeln('skipping \'' + resource + '\' it\'s an absolute (or data) URL');
				return;
			}

			var resourceUrl = url.parse(resource.split('#')[0]);
			var src = path.join(relativeTo, resourceUrl.pathname);

			// if path is relative make it relative to where
			// it's coming from.
			if(!grunt.file.isPathAbsolute(resourceUrl.pathname)) {
				basePath = path.dirname(filename);
				src = path.join(basePath, resourceUrl.pathname);
			}

			if(!fs.existsSync(src)) {
				return writeln('skipping \'' + resource + '\' file not found!');
			}

			if(fs.lstatSync(src).isDirectory()) { return; }

			var hash = md5(grunt.file.read(src), options.encoding);
			var obj = {
				data: {
					pathname: resourceUrl.pathname,
					hash: hash
				}
			};
			return grunt.template.process("<%= pathname %>?v=<%= hash %>", obj);
		}

		function md5(content, encoding) {
			return crypto.createHash('md5').update(content, encoding).digest('hex');
		}
	});
};
