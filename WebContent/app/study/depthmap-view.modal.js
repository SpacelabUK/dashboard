(function() {
	"use strict";
	angular.module('app.study')
			.controller("DepthmapViewModal", DepthmapViewModal);
	DepthmapViewModal.$inject = [
			'$stateParams', 'dataService', '$modalInstance', 'img', 'dpmData'
	];
	function DepthmapViewModal($stateParams, dataService, $modalInstance, img,
			dpmData) {
		var vm = this;
		vm.imagesource = dataService.getPlanImageURL(img);
		vm.dpmData = dpmData;
	}
})();