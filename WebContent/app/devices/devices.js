(function() {
	angular.module('app.devices').controller('Devices', devicesController);
	devicesController.$inject = [
			'$modal', 'dataService'
	];
	function devicesController($modal, dataService) {
		"use strict";
		var vm = this;
		vm.devices = [];
		fetchInitialData();
		function fetchInitialData() {
			dataService.getDevices().then(function(response) {
				vm.devices = response.data;
			}, function(error) {
				console.error(error);
			});
		}
		vm.predicate = 'id';
		vm.addDevice = function() {
			$modal.open({
				templateUrl : 'app/devices/add-device.modal.html',
				controller : 'AddDeviceModal',
				controllerAs : 'vm'
			}).result.then(function(response) {
				vm.search = response.name;
				fetchInitialData();
			});
		};
	}
})();