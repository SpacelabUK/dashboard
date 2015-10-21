(function() {
	"use strict";
	angular.module('app.spatialFunctions').controller("EditSpatialFunctionModal",
			EditSpatialFunctionModal);
	EditSpatialFunctionModal.$inject = [
			'$modalInstance', 'func'
	];
	function EditSpatialFunctionModal($modalInstance, func) {
		var vm = this;
		vm.func = angular.copy(func);
		if (!vm.func.colour)
			vm.func.colour = '';
		vm.cancel = function() {
			$modalInstance.dismiss('cancel');
		}
		vm.ok = function() {
			$modalInstance.close(vm.func);
		}
	}
})();