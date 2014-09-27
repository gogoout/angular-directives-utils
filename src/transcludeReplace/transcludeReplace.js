'use strict';
/**
 * Created by Gogoout on 14-8-26.
 */
angular.module('ng-directives-utils.transcludeReplace', []).

/**
 * @ngdoc directive
 * @name ng-directives-utils.transcludeReplace.directive:ngTranscludeReplace
 * @restrict EA
 * @description
 * same use as the `ng-transclude`.
 */
	directive('ngTranscludeReplace', ['$log', function ($log) {
		          return {
			          terminal: true,
			          restrict: 'EA',

			          link: function ($scope, $element, $attr, ctrl, transclude) {
				          if (!transclude) {
					          $log.error('orphan',
					                     'Illegal use of lgTranscludeReplace directive in the template! ' +
					                     'No parent directive that requires a transclusion found. ');
					          return;
				          }
				          transclude(function (clone) {
					          if (clone.length) {
						          $element.replaceWith(clone);
					          }
					          else {
						          $element.remove();
					          }
				          });
			          }
		          };
	          }]);