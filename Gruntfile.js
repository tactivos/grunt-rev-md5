module.exports = function (grunt) {
	grunt.initConfig({
		pkg: '<json:package.json>',
		revmd5: {
			dist: {
				src: ['./static/*.html', './static/*.css', './static/*.soy'],
				dest: './dist/static/',
				relativePath: './',
				safe: true
			}
		}
	});

	grunt.loadTasks('tasks');
};
