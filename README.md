# Angular directives utils
Just a set of reusable angualr util directives.
Current include:
- `ng-transclude-replace` 
- `ng-multi-transclude`


Only tested on chrome. But with the support of [es5-shim](https://github.com/es-shims/es5-shim ), it shall work fine on the legacy browser.

## Dependencies
- jQuery (for we use `replace` function)

## Install
- load `angular-directives-utils.js`
- add `ng-directives-utils` as a dependency to your angular module.
	```js
	angular.module('yourModule', [
        // other dependencies ...
        'ng-directives-utils'
      ]);
	```
	
## License
MIT