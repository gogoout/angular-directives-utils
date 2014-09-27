'use strict';
/**
 * Created by Gogoout on 14-9-23.
 */
describe('multiTransclude', function () {
	beforeEach(module('ng-directives-utils.multiTransclude'));

	describe('MultiTranscludeManagerController', function () {
		var scope, ctrl, log;
		beforeEach(inject(function ($rootScope, $controller) {
			log = {error: jasmine.createSpy()};
			scope = $rootScope.$new();
			ctrl = $controller('MultiTranscludeManagerController', {$scope: scope, $element: {}, $log: log});
		}));

		it('should currectly register cloneLinking function', function () {
			var testFun1, testFun2, testFun3;
			ctrl.registerCloneLinking('test1', testFun1 = function () {});
			ctrl.registerCloneLinking('test2', testFun2 = function () {});
			ctrl.registerCloneLinking('test3', testFun3 = function () {});

			expect(ctrl.registered.test1[0]).toBe(testFun1);
			expect(ctrl.registered.test2[0]).toBe(testFun2);
			expect(ctrl.registered.test3[0]).toBe(testFun3);
		});

		it('should register cloneLinking function several times with same name', function () {
			var testFun1, testFun2, testFun3;
			ctrl.registerCloneLinking('test1', testFun1 = function () {});
			ctrl.registerCloneLinking('test1', testFun2 = function () {});
			ctrl.registerCloneLinking('test1', testFun3 = function () {});

			expect(ctrl.registered.test1[0]).toBe(testFun1);
			expect(ctrl.registered.test1[1]).toBe(testFun2);
			expect(ctrl.registered.test1[2]).toBe(testFun3);
		});

		it('should not register default cloneLinking function twice', function () {
			var testFun1, testFun2;
			ctrl.registerCloneLinking(testFun1 = function () {});
			expect(ctrl.registered['#DEFAULT'][0]).toBe(testFun1);

			ctrl.registerCloneLinking(testFun2 = function () {});
			expect(log.error).toHaveBeenCalled();
		});

		it('should return unregister after register', function () {
			var testFun1, testFun2, testFun3, unRegFun1, unRegFun2, unRegFun3;
			unRegFun1 = ctrl.registerCloneLinking('test1', testFun1 = function () {});
			unRegFun2 = ctrl.registerCloneLinking('test1', testFun2 = function () {});
			unRegFun3 = ctrl.registerCloneLinking('test1', testFun3 = function () {});

			unRegFun2();
			expect(ctrl.registered.test1[0]).toBe(testFun1);
			expect(ctrl.registered.test1[1]).toBe(testFun3);

			unRegFun1();
			expect(ctrl.registered.test1[0]).toBe(testFun3);
		});

		it('should use supplyTransclude to give the transclude function', function () {
			var testFun1, testFun2, testFun3;
			ctrl.supplyTransclude('test1', testFun1 = function () {});
			ctrl.supplyTransclude('test2', testFun2 = function () {});
			ctrl.supplyTransclude('test3', testFun3 = function () {});

			expect(ctrl.supplied.test1).toBe(testFun1);
			expect(ctrl.supplied.test2).toBe(testFun2);
			expect(ctrl.supplied.test3).toBe(testFun3);
		});

		it('should not use supplyTransclude with repeat names', function () {
			var testFun1, testFun2;
			ctrl.supplyTransclude('test1', testFun1 = function () {});
			ctrl.supplyTransclude('test1', testFun2 = function () {});

			expect(log.error).toHaveBeenCalled();
		});

		it('could supply default transclude by not passing the first param', function () {
			var testFun1, testFun2;
			ctrl.supplyTransclude(testFun1 = function () {});
			expect(ctrl.supplied['#DEFAULT']).toBe(testFun1);

			ctrl.supplyTransclude(testFun2 = function () {});
			expect(log.error).toHaveBeenCalled();
		});

		it('should start trans by executing trans()', function () {
			var suppler1, suppler2, transer1, transer2, transer3;
			// suppler
			ctrl.supplyTransclude(suppler1 = jasmine.createSpy());
			ctrl.supplyTransclude('test1', suppler2 = jasmine.createSpy());
			// transer
			ctrl.registerCloneLinking(transer1 = jasmine.createSpy());
			ctrl.registerCloneLinking('test1', transer2 = jasmine.createSpy());
			ctrl.registerCloneLinking('test1', transer3 = jasmine.createSpy());

			ctrl.trans();

			expect(suppler1).toHaveBeenCalledWith(transer1);
			expect(suppler2).toHaveBeenCalledWith(transer2);
			expect(suppler2).toHaveBeenCalledWith(transer3);
		});
	});

	describe('makeMultiTransclusionDirective service', function () {
		var scope, makeDirective;
		beforeEach(inject(function ($rootScope, makeMultiTransclusionDirective) {
			scope = $rootScope.$new();
			makeDirective = makeMultiTransclusionDirective;
		}));

		it('should genarate directive', function () {
			var directive = makeDirective('test1');
			expect(directive.restrict).toBe('EA');
			expect(directive.transclude).toBeTruthy();
		});

		it('could override the option by passing param', function () {
			var linkFun = jasmine.createSpy();
			var directive = makeDirective('test1', {restrict: 'C', link: linkFun});
			expect(directive.restrict).toBe('C');
			expect(directive.transclude).toBeTruthy();
			expect(directive.link).toBe(linkFun);
		});
	});

	describe('fake directive', function () {
		var scope, $compile, template, element;
		var fakeDirectiveModule = function () {
			angular.module('fakeDirectiveModule', ['testTranscludeDirectiveModule',
			                                       'ng-directives-utils.multiTransclude']).
				directive('labelHere', function (makeMultiTransclusionDirective) {
					          return makeMultiTransclusionDirective('labelHere');
				          }).
				directive('iconHere', function (makeMultiTransclusionDirective) {
					          return makeMultiTransclusionDirective('iconHere');
				          });
			module('fakeDirectiveModule');
		};
		var createElement = function () {
			element = $compile(template)(scope);
			scope.$digest();
			return element;
		};
		describe('no repeat multiTransclude', function () {
			var newTranscludeDirectiveModule = function () {
				angular.module('testTranscludeDirectiveModule', ['ng-directives-utils.multiTransclude']).
					directive('fakeDirective', function () {
						          return {
							          restrict  : 'EA',
							          transclude: true,
							          template  : '<span ng-multi-transclude-manager>' +
							                      '<span class="singleHere" ng-multi-transclude="labelHere"></span>' +
							                      '<span class="singleReplaceHere"><span ng-multi-transclude-replace="iconHere"></span></span>' +
							                      '</span>'
						          };
					          });
				module('testTranscludeDirectiveModule');
			};

			var findSingle = function () {
				return element.find('.singleHere');
			};

			var findSingleReplace = function () {
				return element.find('.singleReplaceHere');
			};
			beforeEach(function () {
				newTranscludeDirectiveModule();
				fakeDirectiveModule();
			});
			beforeEach(inject(function ($rootScope, _$compile_) {
				scope = $rootScope.$new();
				$compile = _$compile_;
				template = '<fake-directive>' +
				           '<label-here>label</label-here>' +
				           '<icon-here>icon</icon-here>' +
				           '</fake-directive>';
				createElement();
			}));

			it('should transclude to the currect dom', function () {
				expect(findSingle().html()).toEqual('<span class="ng-scope">label</span>');
				expect(findSingleReplace().html()).toEqual('<span class="ng-scope">icon</span>');
			});
		});

		describe('repeat multiTransclude', function () {
			var newTranscludeDirectiveModule = function () {
				angular.module('testTranscludeDirectiveModule', ['ng-directives-utils.multiTransclude']).
					directive('fakeDirective', function () {
						          return {
							          restrict  : 'EA',
							          transclude: true,
							          template  : '<span ng-multi-transclude-manager>' +
							                      '<span class="multiHere" >' +
							                      '<span ng-multi-transclude="labelHere"></span>' +
							                      '<span><span ng-multi-transclude-replace="labelHere"></span></span>' +
							                      '<span ng-multi-transclude="labelHere"></span>' +
							                      '<span><span ng-multi-transclude-replace="labelHere"></span></span>' +
							                      '</span>' +
							                      '</span>'
						          };
					          });
				module('testTranscludeDirectiveModule');
			};

			var findMulti = function (idx) {
				return element.find('.multiHere').children().eq(idx);
			};

			beforeEach(function () {
				newTranscludeDirectiveModule();
				fakeDirectiveModule();
			});
			beforeEach(inject(function ($rootScope, _$compile_) {
				scope = $rootScope.$new();
				$compile = _$compile_;
				template = '<span fake-directive>' +
				           '<label-here>label</label-here>' +
				           '</span>';
				createElement();
			}));

			it('should transclude to the currect dom', function () {
				expect(findMulti(0).html()).toEqual('<span class="ng-scope">label</span>');
				expect(findMulti(1).html()).toEqual('<span class="ng-scope">label</span>');
				expect(findMulti(2).html()).toEqual('<span class="ng-scope">label</span>');
				expect(findMulti(3).html()).toEqual('<span class="ng-scope">label</span>');
			});

			it('every scope of the transcludsion should be same', function () {
				expect(findMulti(0).children().scope()).toBe(findMulti(1).children().scope());
				expect(findMulti(1).children().scope()).toBe(findMulti(2).children().scope());
				expect(findMulti(2).children().scope()).toBe(findMulti(3).children().scope());
			});
		});

		describe('default multiTransclude', function () {
			var newTranscludeDirectiveModule = function () {
				angular.module('testTranscludeDirectiveModule', ['ng-directives-utils.multiTransclude']).
					directive('fakeDirective', function () {
						          return {
							          restrict  : 'EA',
							          transclude: true,
							          template  : '<span ng-multi-transclude-manager>' +
							                      '<span class="singleHere" ng-multi-transclude="labelHere"></span>' +
							                      '<span class="singleDefaultHere" ng-multi-transclude></span>' +
							                      '</span>'
						          };
					          });
				module('testTranscludeDirectiveModule');
			};

			var findSingle = function () {
				return element.find('.singleHere');
			};

			var findSingleDefault = function () {
				return element.find('.singleDefaultHere');
			};

			beforeEach(function () {
				newTranscludeDirectiveModule();
				fakeDirectiveModule();
			});
			beforeEach(inject(function ($rootScope, _$compile_) {
				scope = $rootScope.$new();
				$compile = _$compile_;
				template = '<span fake-directive>' +
				           '<label-here>label</label-here>' +
				           '<span class="maybeContent">hello there</span>' +
				           '</span>';
				createElement();
			}));

			it('should transclude to the currect dom', function () {
				expect(findSingle().html()).toEqual('<span class="ng-scope">label</span>');
				expect(findSingleDefault().html()).toEqual('<span class="maybeContent ng-scope">hello there</span>');
			});

			it('the scope of the default transcludsion and named one should be same', function () {
				expect(findSingle().children().scope()).toBe(findSingleDefault().children().scope());
			});
		});

		describe('no default multiTransclude', function () {
			var newTranscludeDirectiveModule = function () {
				angular.module('testTranscludeDirectiveModule', ['ng-directives-utils.multiTransclude']).
					directive('fakeDirective', function () {
						          return {
							          restrict  : 'EA',
							          transclude: true,
							          template  : '<span ng-multi-transclude-manager>' +
							                      '<span class="singleHere" ng-multi-transclude="labelHere"></span>' +
							                      '<span class="singleDefaultHere" ></span>' +
							                      '</span>'
						          };
					          });
				module('testTranscludeDirectiveModule');
			};

			var findSingle = function () {
				return element.find('.singleHere');
			};

			var findSingleDefault = function () {
				return element.find('.singleDefaultHere');
			};

			beforeEach(function () {
				newTranscludeDirectiveModule();
				fakeDirectiveModule();
			});
			beforeEach(inject(function ($rootScope, _$compile_) {
				scope = $rootScope.$new();
				$compile = _$compile_;
				template = '<span fake-directive>' +
				           '<label-here>label</label-here>' +
				           '<span class="maybeContent">hello there</span>' +
				           '</span>';
				createElement();
			}));

			it('should only trans the specific transclusion to the dom with no default transclusion', function () {
				expect(element.children().children().length).toBe(2);
				expect(element.children().children()[0]).toBe(findSingle()[0]);
				expect(element.children().children()[1]).toBe(findSingleDefault()[0]);
				expect(findSingle().html()).toEqual('<span class="ng-scope">label</span>');
				expect(findSingleDefault().html()).toEqual('');
			});
		});
	});
});