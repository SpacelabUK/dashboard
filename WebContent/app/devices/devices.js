(function() {
	angular.module('app.devices').controller('Devices', devicesController);
	devicesController.$inject = [
			'$modal', 'dataService'
	];
	function devicesController($modal, dataService) {
		"use strict";
		var vm = this;
		vm.devices = [];
		dataService.getDevices().then(function(response) {
			var result = response.data;
			if (result) {
				while (vm.devices.length > 0)
					vm.devices.pop();
				for (var i = 0; i < result.length; i++) {
					vm.devices.push(result[i]);
				}
			}
		}, function(error) {
			console.error(error);
		});

		vm.predicate = 'id';
		vm.addDevice = function() {
			$modal.open({
				templateUrl : 'app/devices/addDeviceModal.html',
				controller : 'addDevice'
			});
		};
	}
})();