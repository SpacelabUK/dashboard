(function() {
	"use strict";
	angular.module('app.projects').controller("AddProjectModal", AddProjectModal);
	AddProjectModal.$inject = [
			'$modalInstance', 'dataService', 'modalFactory'
	];
	function AddProjectModal($modalInstance, dataService, modalFactory) {
		var vm = this;
		vm.project = {
			name : '',
			alsoCreateStudy : true
		};
		vm.add = function() {
			var data = {
				name : vm.project.name,
				id : vm.project.id
			}
			dataService.addProject(data).then(function(response) {
				$modalInstance.close(vm.project);
			}, function(error) {
				modalFactory.openErrorModal(error);
			});
		};

		vm.validateID = function(value) {
			return value.length > 3;
		};
		vm.cancel = function() {
			$modalInstance.dismiss('cancel');
		}
	}
})();