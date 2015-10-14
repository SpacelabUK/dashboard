(function() {
	"use strict";
	angular.module('app.devices').controller("addDevice", addDevice);
	addDevice.$inject = [
			'$modalInstance', 'dataService'
	];
	function addDevice($modalInstance, dataService) {
		var vm = this;
		vm.data = {
			name : ''
		};
		vm.add = function() {
			if (vm.data.name.length > 0) {
				dataService.addDevice(vm.data).then(function(response) {
				}, function(error) {
					console.error(error);
				});
				$modalInstance.close();
			}
		};

		vm.validateID = function(value) {
			return value.length > 3;
		};
		vm.cancel = function() {
			$modalInstance.dismiss('cancel');
		}
	}
})();