(function() {
	"use strict";
	angular.module('app.study').controller("PlanViewModal", PlanViewModal);
	PlanViewModal.$inject = [
			'$stateParams', 'dataService', '$modalInstance', 'img', 'entityData'
	];
	function PlanViewModal($stateParams, dataService, $modalInstance, img,
			entityData) {
		var vm = this;
		vm.imagesource = dataService.getPlanImageURL(img);
		vm.entityData = entityData;
	}
})();