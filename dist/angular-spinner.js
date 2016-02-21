/**
 * angular-spinner version 0.8.1
 * License: MIT.
 * Copyright (C) 2016, Uri Shaked and contributors
 */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'angular', 'spin.js'], factory);
	} else if (typeof module === 'object' && typeof module.exports === 'object') {
		factory(module.exports, require('angular'), require('spin.js'));
	} else if (typeof angular !== 'undefined') {
		root = (typeof root !== 'undefined') ? root : {};
		factory((root.exports || (root.exports = {})), angular, Spinner);
	} else {
		throw new Error('Unable to initialize angular-spinner');
	}
})(function(exports, angular, Spinner) {
'use strict';
angular
	.module('angularSpinner', [])

	.constant('SpinJSSpinner', Spinner)

	.provider('usSpinnerConfig', function () {
		var _config = {}, _themes = {};

		return {
			setDefaults: function (config) {
				_config = config || _config;
			},
			setTheme: function(name, config) {
				_themes[name] = config;
			},
			$get: function () {
				return {
					config: _config,
					themes: _themes
				};
			}
		};
	})

	.factory('usSpinnerService', ['$rootScope', function ($rootScope) {
		var config = {};

		config.spin = function (key) {
			$rootScope.$broadcast('us-spinner:spin', key);
		};

		config.stop = function (key) {
			$rootScope.$broadcast('us-spinner:stop', key);
		};

		return config;
	}])

	.directive('usSpinner', ['SpinJSSpinner', 'usSpinnerConfig', function (SpinJSSpinner, usSpinnerConfig) {
		return {
			scope: true,
			link: function (scope, element, attr) {
				scope.spinner = null;

				scope.key = angular.isDefined(attr.spinnerKey) ? attr.spinnerKey : false;

				scope.startActive = angular.isDefined(attr.spinnerStartActive) ?
					scope.$eval(attr.spinnerStartActive) : scope.key ?
					false : true;

				function stopSpinner() {
					if (scope.spinner) {
						scope.spinner.stop();
					}
				}

				scope.spin = function () {
					if (scope.spinner) {
						scope.spinner.spin(element[0]);
					}
				};

				scope.stop = function () {
					scope.startActive = false;
					stopSpinner();
				};

				scope.$watch(attr.usSpinner, function (options) {
					stopSpinner();

					// order of precedence: element options, theme, defaults.
					options = angular.extend(
						{},
						usSpinnerConfig.config,
						usSpinnerConfig.themes[attr.spinnerTheme],
						options);

					scope.spinner = new SpinJSSpinner(options);
					if ((!scope.key || scope.startActive) && !attr.spinnerOn) {
						scope.spinner.spin(element[0]);
					}
				}, true);

				if (attr.spinnerOn) {
					scope.$watch(attr.spinnerOn, function (spin) {
						if (spin) {
							scope.spin();
						} else {
							scope.stop();
						}
					});
				}

				scope.$on('us-spinner:spin', function (event, key) {
					if (key === scope.key) {
						scope.spin();
					}
				});

				scope.$on('us-spinner:stop', function (event, key) {
					if (key === scope.key) {
						scope.stop();
					}
				});

				scope.$on('$destroy', function () {
					scope.stop();
					scope.spinner = null;
				});
			}
		};
	}]);
});