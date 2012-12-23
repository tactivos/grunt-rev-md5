/*
 * grunt-rev-md5
 * https://github.com/tactivos/grunt-rev-md5
 *
 * Copyright (c) 2012 Johnny G. Halife & Mural.ly Dev Team
 */
module.exports = function (grunt) {

	var fs = require('fs');
	var url = require('url');
	var util = require('util');
	var path = require('path');
	var crypto = require('crypto');

	var supportedTypes = {
		html: 'html',
		css: 'css',
		soy: 'html'
	};

	var reghtml = new RegExp(/(src|href)=['"]([^'"]+)['"]/ig);

	var regcss = new RegExp(/url\(([^)]+)\)/ig);

	var writeln = grunt.log.writeln;

	grunt.registerMultiTask('revmd5', "Appends a cache busting ?v={MD5} hash to the file reference", function () {
		var relativeTo = path.resolve(this.data.relativePath);
		var files = grunt.file.expandFiles(this.file.src);
		var dest = this.file.dest;

		// if we decide we want safe mode (off by default)
		// it will throw warnings (that can be ignored with --force)
		if (this.data.safe) writeln = grunt.fail.warn;

		files.map(grunt.file.read).forEach(function (content, i) {
			var filename = files[i];
			var type = path.extname(filename).replace(/^\./, '');
			content = content.toString(); // sometimes css is interpreted as object

			if(!supportedTypes[type]) { //next
				console.warn(util.format("unrecognized extension: %s - %s", type, filename));
				return;
			}

			content = grunt.helper('revmd5:' + supportedTypes[type], content, filename, relativeTo);

			// write the contents to destination
			var filePath = dest ? path.join(dest, path.basename(filename)) : filename;
			grunt.file.write(filePath, content);
		});
	});

	grunt.registerHelper('revmd5:html', function (content, filename, relativeTo) {
		return content.replace(reghtml, function (attribute, type, resource) {
			return grunt.template.process("<%= type %>=\"<%= url %>\"", {
				type: type,
				url: (stampUrl(resource, filename, relativeTo) || resource)
			});
		});
	});

	grunt.registerHelper('revmd5:css', function (content, filename, relativeTo) {
		return content.replace(regcss, function (attr, resource) {
			resource = resource.replace(/^['"]/, '').replace(/['"]$/, '');
			var url = stampUrl(resource, filename, relativeTo);

			if(!url) return attr;

			return grunt.template.process("url(<%= url %>)", {
				url: url
			});
		});
	});

	function stampUrl(resource, filename, relativeTo) {
		// skip those absolute urls
		if(resource.match(/^https?:\/\//i) || resource.match(/^\/\//) || resource.match(/^data:/i)) {
			grunt.verbose.writeln("skipping " + resource + " it's an absolute (or data) URL");
			return;
		}

		var resourceUrl = url.parse(resource);
		var src = path.join(relativeTo, resourceUrl.pathname);

		// if path is relative make it relative to where
		// it's coming from.
		if(!grunt.file.isPathAbsolute(resourceUrl.pathname)) {
			basePath = path.resolve(filename);
			src = path.join(basePath, resourceUrl.pathname);
		}

		if(!fs.existsSync(src)) {
			return writeln("skipping " + resource + " file not found!");
		}

		var hash = md5(grunt.file.read(src));
		return grunt.template.process("<%= pathname %>?v=<%= hash %>", {
			hash: hash,
			pathname: resourceUrl.pathname
		});
	}

	function md5(content) {
		return crypto.createHash('md5').update(content).digest('hex');
	}
};
