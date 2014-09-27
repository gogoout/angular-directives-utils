module.exports = function (config) {
	config.set({
		           basePath: '.',

		           files    : [
			           'lib/jQuery/1.11.1/jquery.js',
			           'lib/angularJs/1.2.21/angular.js',
			           'lib/angularJs/1.2.21/angular-mocks.js',
			           'assets/test/helpers.js',
			           'src/**/*.js'
		           ],
		           exclude  : [
			           'src/**/docs/*'
		           ],
		           autoWatch: false,

		           frameworks   : ['jasmine'],

		           // Start these browsers, currently available:
		           // - Chrome
		           // - ChromeCanary
		           // - Firefox
		           // - Opera
		           // - Safari
		           // - PhantomJS
		           browsers     : ['Chrome'],
		           preprocessors: {
			           'src/*/*.js': 'coverage'
		           },
		           reporters    : ['dots'],
		           plugins      : [
			           'karma-chrome-launcher',
			           'karma-jasmine',
			           'karma-coverage',
			           'karma-htmlfile-reporter'
		           ]
	           });
};
