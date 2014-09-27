/**
 * Created by Gogoout on 14-8-12.
 */
var grunt = require('grunt');

//Common lpromis.ui module containing all modules for src and templates
//findModule: Adds a given module to config
var foundModules = {};
var findModule = function (name) {
	if (foundModules[name]) {
		return;
	}
	foundModules[name] = true;

	var breakup = function (text, separator) {
		return text.replace(/[A-Z]/g, function (match) {
			return separator + match;
		});
	};

	var upperCase = function (text) {
		return text.replace(/^([a-z])|\s+([a-z])/g, function ($1) {
			return $1.toUpperCase();
		});
	};

	var enquote = function (str) {
		return '\'' + str + '\'';
	};

	var module = {
		name           : name,
		moduleName     : enquote('ng-directives-utils.' + name),
		displayName    : upperCase(breakup(name, ' ')),
		srcFiles       : grunt.file.expand('src/' + name + '/*.js'),
		templateFiles  : grunt.file.expand('template/' + name + '/*.html'),
		templateJsFiles: grunt.file.expand(grunt.config('dir.temp') + '/template/' + name + '/*.html.js'),
		templateModules: grunt.file.expand('template/' + name + '/*.html').map(enquote),
		dependencies   : dependenciesForModule(name)
	};
	module.dependencies.forEach(findModule);
	grunt.config('modules', grunt.config('modules').concat(module));
};

var dependenciesForModule = function (name) {
	var deps = [];
	grunt.file.expand('src/' + name + '/*.js')
		.map(grunt.file.read)
		.forEach(function (contents) {
			         //Strategy: find where module is declared,
			         //and from there get everything inside the [] and split them by comma
			         var moduleDeclIndex = contents.indexOf('angular.module(');
			         var depArrayStart = contents.indexOf('[', moduleDeclIndex);
			         var depArrayEnd = contents.indexOf(']', depArrayStart);
			         var dependencies = contents.substring(depArrayStart + 1, depArrayEnd);
			         dependencies.split(',').forEach(function (dep) {
				         if (dep.indexOf('ng-directives-utils.') > -1) {
					         var depName = dep.trim().replace('ng-directives-utils.', '').replace(/['"]/g, '');
					         if (deps.indexOf(depName) < 0) {
						         deps.push(depName);
						         //Get dependencies for this new dependency
						         deps = deps.concat(dependenciesForModule(depName));
					         }
				         }
			         });
		         });
	return deps;
};

module.exports = function () {
	var _ = grunt.util._;
	//If arguments define what modules to build, build those. Else, everything
	if (this.args.length) {
		this.args.forEach(findModule);
		grunt.config('filename', grunt.config('filenamecustom'));
	}
	else {
		grunt.file.expand({
			                  filter: 'isDirectory', cwd: '.'
		                  }, 'src/*').forEach(function (dir) {
			findModule(dir.split('/')[1]);
		});
	}
	var modules = grunt.config('modules');
	grunt.config('srcModules', _.pluck(modules, 'moduleName'));
	grunt.config('templateModules', _.pluck(modules, 'templateModules').filter(function (templates) {
		return templates.length > 0;
	}));

	var srcFiles = _.pluck(modules, 'srcFiles');
	var templateJsFiles = _.pluck(modules, 'templateJsFiles');
	//Set the concat task to concatenate the given src modules
	grunt.config('concat.script.src', grunt.config('concat.script.src')
		.concat(srcFiles).concat(templateJsFiles));

	grunt.task.run(['concat:script', 'uglify']);
};