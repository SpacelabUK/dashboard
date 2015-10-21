(function() {
	"use strict";
	angular.module('app.spatialFunctions').controller('AddSpatialFunctionModal',
			AddSpatialFunctionModal);
	AddSpatialFunctionModal.$inject = [
			'$modalInstance', 'dataService'
	];

	function AddSpatialFunctionModal($modalInstance, dataService) {
		var vm = this;
		vm.func = {
			alias : '',
			name : ''
		};
		vm.add = function() {
			if (vm.func.name.length > 0) {
				dataService.addSpatialFunction(vm.func.alias, vm.func.name).then(
						function(response) {
						}, function(error) {
							console.error(error);
						});
				$modalInstance.close(vm.func);
			}
		};

		vm.validateID = function(value) {
			return value.length > 3;
		};
		vm.cancel = function() {
			console.log("aaa");
			$modalInstance.dismiss('cancel');
		};
	}

})();
