(function() {
	"use strict";
	angular.module('app.spatialFunctions').controller(
			'SpatialFunctionsController', SpatialFunctionsController);
	SpatialFunctionsController.$inject = [
			'$modal', 'dataService'
	];

	function SpatialFunctionsController($modal, dataService) {
		var vm = this;
		fetchInitialData();
		function fetchInitialData() {
			dataService.getSpatialFunctions().then(function(response) {
				if (response) {
					vm.functions = response.data;
				}
			}, function(error) {
				console.error(error);
			});
		}
		vm.predicate = 'id';
		vm.add = function() {
			$modal.open({
				templateUrl : 'app/spatial-functions/add-spatial-function.modal.html',
				controller : 'AddSpatialFunctionModal',
				controllerAs : 'vm'
			}).result.then(function(response) {
				vm.search = response.name;
				fetchInitialData();
			});
		};
		vm.edit = function(func) {
			$modal.open({
				templateUrl : 'app/spatial-functions/edit-spatial-function.modal.html',
				controller : 'EditSpatialFunctionModal',
				controllerAs : 'vm',
				resolve : {
					func : function() {
						return func;
					}
				}
			});
		};
	}

})();
