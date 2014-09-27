'use strict';
module.exports = function (grunt) {

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-ngdocs');

	// Project configuration.
	grunt.util.linefeed = '\n';

	grunt.initConfig(
		{
			ngversion: '1.2.21',
			modules  : [],//to be filled in by buildScript task
			lessPaths: [],//to be filled in by buildLess task
			pkg      : grunt.file.readJSON('package.json'),
			dist     : 'dist',
			dir      : {
				test: '<%= dist %>/test result/',
				temp: '<%= dist %>/tmp'
			},
			filename : 'angular-directives-utils',
			meta     : {
				modules: 'angular.module(\'ng-directives-utils\', [<%= srcModules %>]);',
				banner : ['/*',
				          ' * <%= pkg.name %>',
				          ' * Version: <%= pkg.version %> - <%= grunt.template.today(\'yyyy-mm-dd\') %>',
				          ' */\n'].join('\n'),
				wrapFun: '(function(){\'use strict\';\n'
			},
			concat   : {
				script: {
					options: {
						banner : '<%= meta.banner %>\n<%= meta.wrapFun %><%= meta.modules %>\n<%= meta.templateModules %>\n',
						footer : '}());',
						process: function (src, filepath) {
							return '// Source: ' + filepath + '\n' +
							       src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
						}
					},
					src    : [], //src filled in by buildScript task
					dest   : '<%= dist %>/<%= filename %>-<%= pkg.version %>.js'
				}
			},
			uglify   : {
				options: {
					banner: '<%= meta.banner %>'
				},
				dist   : {
					src : ['<%= concat.script.dest %>'],
					dest: '<%= dist %>/<%= filename %>-<%= pkg.version %>.min.js'
				}
			},
			jshint   : {
				files  : ['Gruntfile.js', 'src/**/*.js', 'assets/**/*.js'],
				options: {
					jshintrc: '.jshintrc'
				}
			},
			ngdocs   : {
				options: {
					dest       : 'dist/docs',
					scripts    : [
						'lib/jQuery/1.11.1/jquery.js',
						'lib/angularJs/<%=ngversion %>/angular.js',
						'lib/angularJs/<%=ngversion %>/angular-animate.js',
						'assets/docs/app.js',
						'<%= concat.script.dest %>'
					],
					styles     : [
						'assets/docs/demo.css'
					],
					editExample: true,
					title      : 'angular-directives-utils',
					html5Mode  : false
				},
				api    : {
					src  : ['src/**/*.js', 'src/**/*.ngdoc'],
					title: 'API'
				}
			},
			karma    : {
				relase: {
					configFile: 'karma.conf.js',
					options   : {
						singleRun       : true,
						htmlReporter    : {
							outputFile: '<%= dir.test %>/units.html'
						},
						coverageReporter: {
							type: 'html',
							dir : '<%= dir.test %>/coverage/'
						},
						reporters       : ['dots', 'html', 'coverage'],
						preprocessors   : {
							'src/**/*.js': 'coverage'
						}
					}
				}
			},
			clean    : {
				all : ['<%= dist%>'],
				doc : ['<%= dist%>/docs'],
				test: ['<%= dist%>/test result'],
				temp: ['<%= dir.temp%>']
			}
		});

	// custom
	var buildScript = require('./assets/grunt/buildScript');
	grunt.registerTask('buildScript', 'Create bootstrap build script', buildScript);

	// tasks
	grunt.registerTask('build', ['buildScript']);
	grunt.registerTask('doc', ['clean:doc', 'build', 'ngdocs']);
	grunt.registerTask('test', ['karma']);
	grunt.registerTask('release', ['jshint', 'test', 'build', 'clean:doc', 'ngdocs']);

	// default
	grunt.registerTask('default', ['release']);

	return grunt;
}
;
