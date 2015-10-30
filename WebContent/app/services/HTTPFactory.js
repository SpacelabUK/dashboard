angular.module('app.core').factory('HTTPFactory', ['$http', '$q', function ($http, $q) {
    var backend = "/dashboard/";
    var propulsion = "/propulsion";
    return {
        propulsionGet: function (url) {
            return $http.get(propulsion + url);
        },
        propulsionPost: function (url, data) {
            return $http.post(propulsion + url, data);
        },
        propulsionPut: function (url, data) {
            return $http.put(propulsion + url, data);
        },
        propulsionDelete: function (url, data) {
            return $http.delete(propulsion + url, data);
        },
        backendGet: function (url) {
            return $http.get(backend + url);
        },
        backendPost: function (url, data) {
            return $http.post(backend + url, data);
        },
        all: function (promises) {
            return $q.all(promises);
        },
        getBackend: function () {
            return backend;
        }
    };
}
]);