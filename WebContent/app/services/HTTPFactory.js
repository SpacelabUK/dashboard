angular.module('app.core').factory('HTTPFactory', [
		'$http', '$q', function($http, $q) {
			var backend = "/dashboard/";
			var pub = {
				backendGet : function(url) {
					return $http.get(backend + url);
				},
				backendPost : function(url, data) {
					return $http.post(backend + url, data);
				},
				all : function(promises) {
					return $q.all(promises);
				},
				getBackend : function() {
					return backend;
				},
			};
			return pub;
		}
]);