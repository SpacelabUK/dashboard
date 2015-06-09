app.factory('HTTPFactory', [
		'$http',
		'$q',
		function($http, $q) {
			var backend = "/tomcutter/";
			var public = {
				backendGet : function(url) {

					var deferred = $q.defer(), httpPromise = $http.get(backend + url);

					httpPromise.then(function(response) {
						deferred.resolve(response);

					}, function(error) {
						console.log(error);
					});
					return httpPromise;
				},
				backendPost : function(url, data) {

					var deferred = $q.defer(), httpPromise = $http.post(backend + url,
							data);

					httpPromise.then(function(response) {
						deferred.resolve(response);

					}, function(error) {
						console.error(error);
					});
					return httpPromise;
				},
				all : function(promises) {
					return $q.all(promises);
				}
			}
			return public;
		}
]);