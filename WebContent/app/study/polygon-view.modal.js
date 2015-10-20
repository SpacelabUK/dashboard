(function() {
	"use strict";
	angular.module('app.study').controller("PolygonViewModal", PolygonViewModal);
	PolygonViewModal.$inject = [
			'$stateParams', 'dataService', '$modalInstance', 'img', 'polyData'
	];
	function PolygonViewModal($stateParams, dataService, $modalInstance, img,
			polyData) {
		var vm = this;
		vm.imagesource = dataService.getPlanImageURL(img);
		vm.polyData = polyData;
	}

})();