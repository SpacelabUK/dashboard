(function() {
	"use strict";
	angular.module('app.spatialFunctions').controller(
			'SpatialFunctionsController', SpatialFunctionsController);
	SpatialFunctionsController.$inject = [
			'$modal', 'dataService'
	];

	function SpatialFunctionsController($modal, dataService) {
		var vm = this;
		dataService.getSpatialFunctions().then(function(response) {
			if (response) {
				vm.functions = response.data;
			}
		}, function(error) {
			console.error(error);
		});

		vm.predicate = 'id';
		vm.add = function() {
			$modal.open({
				templateUrl : 'app/spatial-functions/add-spatial-function.modal.html',
				controller : 'AddSpatialFunctionModal',
				controllerAs : 'vm'
			});
		};
	}

})();
