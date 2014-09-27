// jasmine matcher for expecting an element to have a css class
// https://github.com/angular/angular.js/blob/master/test/matchers.js
beforeEach(function () {
	jasmine.addMatchers({
		                    toHaveClass          : function () {
			                    return{
				                    compare: function (actual, expected) {
					                    var passed = actual.hasClass(expected);
					                    return {
						                    pass   : passed,
						                    message: 'Expected "' + actual + '"' + (actual ? ' don\'t ' : ' ') + 'have class "' + expected + '".'
					                    };
				                    }
			                    };
		                    },
		                    toHaveBeenCalledCountTo: function () {
			                    return {
				                    compare: function (actual, expected) {
					                    if (!jasmine.isSpy(actual)) {
						                    throw new Error('Expected a spy, but got ' + jasmine.pp(actual) + '.');
					                    }
					                    var passed = (actual.calls.count() === expected);
					                    return {
						                    pass   : passed,
						                    message: 'Spy ' + actual.identity + ' have been called count to ' + actual.calls.count() + ', expected ' + expected
					                    };
				                    }
			                    };
		                    },
		                    toBeHidden           : function () {
			                    return{
				                    compare: function (actual, expected) {
					                    var element = angular.element(actual);
					                    var passed = element.hasClass('ng-hide') ||
					                                 element.css('display') === 'none';
					                    return {
						                    pass: passed
					                    };
				                    }
			                    };
		                    }
	                    });
})
;
