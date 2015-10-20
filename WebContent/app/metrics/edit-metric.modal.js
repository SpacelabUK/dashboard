(function() {
	"use strict";
	angular.module('app.metrics').controller("editMetric", editMetric);
	editMetric.$inject = [
			'$modalInstance', 'metric'
	];
	function editMetric($modalInstance, metric) {
		var vm = this;
		vm.metric = metric;
		vm.cancel = function() {
			$modalInstance.dismiss('cancel');
		}
		vm.ok = function() {
			$modalInstance.close(metric);
		}
		vm.addCharacter = function(char) {
			if (!vm.metric[vm.currentModel])
				vm.metric[vm.currentModel] = char;
			vm.metric[vm.currentModel] += char;
		}
		vm.currentModel;
		vm.setCurrentModel = function(model) {
			vm.currentModel = model;
			return true;
		}
	}
})();