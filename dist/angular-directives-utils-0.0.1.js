/*
 * angular-directives-utils
 * Version: 0.0.1 - 2014-09-28
 */

(function(){'use strict';
angular.module('ng-directives-utils', ['ng-directives-utils.multiTransclude','ng-directives-utils.transcludeReplace']);

// Source: src/multiTransclude/multiTransclude.js
/**
 * Created by Gogoout on 14-9-23.
 */
angular.module('ng-directives-utils.multiTransclude', []).

/**
 * @ngdoc service
 * @name ng-directives-utils.multiTransclude.service:makeMultiTransclusionDirective
 * @param {string} name directive name
 * @param {object=} override override property, currently support `restrict`和`link`
 * @return {object} directive object
 * @description
 * genarate default directive which could transclude to the ngMultiTranscludeManager
 */
	service('makeMultiTransclusionDirective', function () {
		        var DefaultDirective = function (name) {
			        return {
				        transclude: true,
				        require   : '^ngMultiTranscludeManager',
				        link      : function ($scope, $element, $attr, managerCtrl, transclude) {
					        // bind scope, the scope of this transclusion should be same as the default one
					        managerCtrl.supplyTransclude(name, transclude.bind(null, $scope));
					        $element.remove();
				        }
			        };
		        };

		        return function (name, directive) {
			        var override = directive || {};

			        var newDirective = new DefaultDirective(name);
			        newDirective.restrict = override.restrict || 'EA';
			        if (override.link) {
				        newDirective.link = override.link;
			        }

			        return newDirective;
		        };
	        }).

/**
 * @ngdoc controller
 * @name ng-directives-utils.multiTransclude.controller:MultiTranscludeManagerController
 * @requires $log
 * @description
 * Manage the *transclusion producer* and *transclude consumer*
 *
 * - used by `ng-multi-transclude-manager`
 */
	controller('MultiTranscludeManagerController', ['$scope', '$element', '$log', function ($scope, $element, $log) {
		           var DEFAULT_TRANSCLUSION_ID = '#DEFAULT',
			           registered = this.registered = {},
			           supplied = this.supplied = {};

		           /**
		            * @ngdoc method
		            * @name registerCloneLinking
		            * @methodOf ng-directives-utils.multiTransclude.controller:MultiTranscludeManagerController
		            * @param {string=} name directive name, if not passing will treat as the root cloneLinking. Multi root will cause an error.
		            * @param {function} fun the cloneLinking function
		            * @returns {function} unRegister() unRegister function.
		            * @description
		            * register cloneLinking to the manager
		            */
		           this.registerCloneLinking = function (name, fun) {
			           if (arguments.length < 2) {
				           fun = name;
				           name = DEFAULT_TRANSCLUSION_ID;
			           }
			           var regList = registered[name] || (registered[name] = []);
			           if (name === DEFAULT_TRANSCLUSION_ID && regList.length > 0) {
				           $log.error('Default cloneLinking function has already registered');
				           return null;
			           }
			           regList.push(fun);
			           return function unRegister() {
				           regList.splice(regList.lastIndexOf(fun), 1);
			           };
		           };

		           /**
		            * @ngdoc method
		            * @name supplyTransclude
		            * @methodOf ng-directives-utils.multiTransclude.controller:MultiTranscludeManagerController
		            * @param {string=} name directive name, if not passing will treat as the root transclude. Multi root will cause an error.
		            * @param {function} transclude transclude function
		            * @description
		            * supply transclude, root transclude will only execute once. Others may execute several times due to the number of the cloneLinking registration
		            */
		           this.supplyTransclude = function (name, transclude) {
			           if (arguments.length < 2) {
				           transclude = name;
				           name = DEFAULT_TRANSCLUSION_ID;
			           }
			           if (supplied[name]) {
				           $log.error('transclude is already suoolied, id:' + name === DEFAULT_TRANSCLUSION_ID ? 'DEFAULT' : name);
				           return;
			           }
			           supplied[name] = transclude;
		           };

		           /**
		            * @ngdoc method
		            * @name trans
		            * @methodOf ng-directives-utils.multiTransclude.controller:MultiTranscludeManagerController
		            * @description
		            * execute the root transclude function and others
		            */
		           this.trans = function () {

			           var toRemove,//used to save the our own cloneLinking function is there is no default cloneLinking.and it will be removed at last
				           defaultTransclude = supplied[DEFAULT_TRANSCLUSION_ID] || angular.noop,
				           defaultCloneLinking = (registered[DEFAULT_TRANSCLUSION_ID] && registered[DEFAULT_TRANSCLUSION_ID][0]) ||
					           // our own cloneLinking function
					                             function (clone) {
						                             toRemove = clone;
						                             $element.append(clone);
					                             };

			           defaultTransclude(defaultCloneLinking);

			           // iterates not the supplied but the registered, as the ngMultiTranscludeReplace needs to remove itself when there is no transclusion
			           angular.forEach(registered, function (regList, id) {
				           if (id !== DEFAULT_TRANSCLUSION_ID) {
					           angular.forEach(regList, function (cloneLinking) {
						           var transclude = supplied[id] || angular.noop;
						           transclude(cloneLinking);
					           });
				           }
			           });

			           // remove the root transclusion when there is no default one
			           if (toRemove) {
				           toRemove.remove();
			           }
		           };
	           }]).

/**
 * @ngdoc directive
 * @name ng-directives-utils.multiTransclude.directive:ngMultiTranscludeManager
 * @restrict EA
 * @description
 * use controller `MultiTranscludeManagerController`，
 * execute{@link ng-directives-utils.multiTransclude.controller:MultiTranscludeManagerController#methods_trans `controller.trans()`} in the linking
 *
 * the compile flow is ngMultiTransclude(`registerCloneLinking`)->this(`supplyTransclude`)->this(`trans`)->custom directive(`supplyTransclude`)
 * all in the linking function
 */
	directive('ngMultiTranscludeManager', function () {
		          return {
			          scope       : true,
			          restrict    : 'EA',
			          controller  : 'MultiTranscludeManagerController',
			          controllerAs: 'ctrl',
			          link        : function ($scope, $element, $attr, requireCtrl, transclude) {
				          $scope.ctrl.supplyTransclude(transclude);
				          $scope.ctrl.trans();
			          }
		          };
	          }).

/**
 * @ngdoc directive
 * @name ng-directives-utils.multiTransclude.directive:ngMultiTransclude
 * @restrict EA
 * @param {string=} ng-multi-transclude directive name, if not passing will treat as the default one
 * @description
 * register `cloneLinking(clone)` to the manager.
 * This will append the passing transclude element to the current element.
 * If there is no transclude passing, nothing happens.
 */
	directive('ngMultiTransclude', function () {
		          return {
			          restrict: 'EA',
			          require : '^ngMultiTranscludeManager',
			          link    : function ($scope, $element, $attrs, managerCtrl) {
				          var name = $attrs.ngMultiTransclude;
				          var transcluder = function (clone) {
					          if (clone.length) {
						          $element.empty();
						          $element.append(clone);
					          }
				          };

				          if (name) {
					          managerCtrl.registerCloneLinking(name, transcluder);
				          }
				          else {
					          managerCtrl.registerCloneLinking(transcluder);
				          }
			          }
		          };
	          }).


/**
 * @ngdoc directive
 * @name ng-directives-utils.multiTransclude.directive:ngMultiTranscludeReplace
 * @restrict EA
 * @param {string=} ng-multi-transclude-replace ng-multi-transclude directive name, if not passing will treat as the default one
 * @description
 * register `cloneLinking(clone)` to the manager.
 * This will replace the current element with the passing transclude element.
 * If there is no transclude passing, current element will be removed.
 */
	directive('ngMultiTranscludeReplace', function () {
		          return {
			          restrict: 'EA',
			          require : '^ngMultiTranscludeManager',
			          link    : function ($scope, $element, $attrs, managerCtrl) {
				          var name = $attrs.ngMultiTranscludeReplace;
				          var transcluder = function (clone) {
					          if (clone.length) {
						          $element.replaceWith(clone);
					          }
					          else {
						          $element.remove();
					          }
				          };

				          if (name) {
					          managerCtrl.registerCloneLinking(name, transcluder);
				          }
				          else {
					          managerCtrl.registerCloneLinking(transcluder);
				          }
			          }
		          };
	          });
// Source: src/transcludeReplace/transcludeReplace.js
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
	          }]);}());