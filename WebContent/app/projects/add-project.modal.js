(function () {
    "use strict";
    angular.module('app.projects').controller("AddProjectModal", AddProjectModal);
    AddProjectModal.$inject = [
        '$modalInstance', 'HTTPFactory', 'modalFactory'
    ];
    function AddProjectModal($modalInstance, HTTPFactory, modalFactory) {
        var vm = this;
        vm.project = {
            name: '',
            alsoCreateStudy: true
        };
        vm.add = function () {
            var data = {
                name: vm.project.name,
                id: vm.project.id
            };

            HTTPFactory.propulsionPost('/projects', data).then(function (response) {
                $modalInstance.close(vm.project);
            }, function (error) {
                modalFactory.openErrorModal(error);
            });
        };

        vm.validateID = function (value) {
            return value.length > 3;
        };
        vm.cancel = function () {
            $modalInstance.dismiss('cancel');
        }
    }
})();