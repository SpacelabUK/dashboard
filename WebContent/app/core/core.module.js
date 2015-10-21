(function() {
	'use strict';

	angular.module('app.core', [
			/*
			 * Angular modules
			 */
			'ngSanitize', 'ngCookies',
			/*
			 * Our reusable cross app code modules
			 */
			'blocks.exception', 'blocks.logger', 'blocks.router',
			/*
			 * 3rd Party modules
			 */
			'angularFileUpload', 'flow', 'ui.bootstrap', 'ui.select', 'ui.router',
			'colorpicker.module'

	]);
	angular.module('app.core').filter('capitalize', capitalize);
	function capitalize() {
		return function(input, all) {
			return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			}) : '';
		}
	}

	angular.module('app.core').directive('autoFocus', [
			'$timeout', function($timeout) {
				return {
					restrict : 'AC',
					link : function(_scope, _element) {
						$timeout(function() {
							_element[0].focus();
						}, 0);
					}
				};
			}
	]);
	/**
	 * Filter to search whether all the words in a search field match the relevant
	 * property
	 * 
	 * example usage:
	 * 
	 * repeat="metric in availableMetrics | anyWordFilter: {title:$select.search}"
	 */
	angular.module('app.core').filter('anyWordFilter', anyWordFilter);
	function anyWordFilter() {
		return function(items, props) {
			var out = [];
			if (angular.isArray(items) && typeof props == 'object') {
				items.forEach(function(item) {
					var itemMatches = false;
					var keys = Object.keys(props);
					for (var i = 0; i < keys.length; i++) {
						var prop = keys[i];
						if (!props[prop]) {
							itemMatches = true;
							break;
						}
						if (!item[prop])
							continue;
						var text = props[prop].toLowerCase().trim().split(' ');
						var wordsNotFound = text.length;
						for (var j = 0; j < text.length; j++) {
							if (item[prop].toString().toLowerCase().indexOf(text[j]) !== -1) {
								wordsNotFound--;
							}
						}
						if (wordsNotFound == 0) {
							itemMatches = true;
							break;
						}
					}
					if (itemMatches) {
						out.push(item);
					}
				});
			} else {
				// Let the output be the input untouched
				out = items;
			}

			return out;
		}
	}
})();