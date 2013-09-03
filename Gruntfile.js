module.exports = function (grunt) {
	grunt.initConfig({
		pkg: '<json:package.json>',
		revmd5: {
			options: {
				relativePath: './',
				safe: true
			},
			dist: {
				src: ['./static/*.html', './static/*.css', './static/*.soy'],
				dest: './dist/static/'
			}
		}
	});

	grunt.loadTasks('tasks');
};
