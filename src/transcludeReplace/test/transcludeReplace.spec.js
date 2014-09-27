'use strict';
describe('transcludeReplace', function () {

	//	beforeEach(module('template here'));
	beforeEach(module('ng-directives-utils.transcludeReplace'));

	describe('ngTranscludeReplace', function () {
		var template, element, $compile, scope;
		var createElement = function () {
			element = $compile(template)(scope);
			scope.$digest();
			return element;
		};
		var findTranscludeElement = function (element) {
			return element.children().children();
		};
		var fakeDirectiveModule = function () {
			angular.module('fakeDirectiveModule', ['ng-directives-utils.transcludeReplace']).
				directive('fakeDirective', function () {
					          return {
						          restrict  : 'EA',
						          transclude: true,
						          template  : '<span>' +
						                      '<span class="should-not-exist-in-output" ng-transclude-replace ></span>' +
						                      '</span>'
					          };
				          });
			module('fakeDirectiveModule');
		};
		beforeEach(function () {
			fakeDirectiveModule();
		});
		beforeEach(inject(function ($rootScope, _$compile_) {
			scope = $rootScope.$new();
			$compile = _$compile_;
			template = '<span fake-directive>' +
			           '<div class="i-shall-survive"></div>' +
			           '</span>';
			createElement();
		}));

		it('should replace with the transclusion', function () {
			expect(findTranscludeElement(element)).toHaveClass('i-shall-survive');
		});

		it('should has the children scope of the outer scope', function () {
			expect(findTranscludeElement(element).scope().$parent).toBe(scope);
		});

		it('should compatible with ng-repeat', function () {
			scope.data = [1, 2, 3, 4, 5];
			template = '<span>' +
			           '<span fake-directive ng-repeat="value in data">' +
			           '<div class="i-shall-survive{{value}}"></div>' +
			           '</span>' +
			           '</span>';
			createElement();

			for (var i = element.children().length; i--;) {
				var currentElement = element.children().eq(i);
				expect(findTranscludeElement(currentElement)).toHaveClass('i-shall-survive' + (i + 1));
			}
		});
	});
});