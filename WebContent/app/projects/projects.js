(function () {
    "use strict";
    angular.module('app.projects').controller('Projects', projectsController);
    projectsController.$inject = ['$modal', 'HTTPFactory'];

    function projectsController($modal, HTTPFactory) {
        var vm = this;
        fetchInitialData();
        function fetchInitialData() {
            HTTPFactory.propulsionGet('/projects').then(function (response) {
                vm.projects = response.data.content;
            }, function (error) {
                console.log(error);
            });
        }

        vm.predicate = 'id';

        vm.addProject = function () {
            $modal.open({
                templateUrl: 'app/projects/add-project.modal.html',
                controller: 'AddProjectModal',
                controllerAs: 'vm'
            }).result.then(function (response) {
                vm.search = response.name;
                fetchInitialData();
            });
        };
        vm.addStudy = function (project) {
            var data = {
                project_id: project.id,
                status: 'open'
            };
            HTTPFactory.propulsionPost('/studies', data).then(function () {
                fetchInitialData();
            });
        };

        // =========
        vm.triggerObservation = function (study) {
            $modal.open({
                templateUrl: 'app/devices-setup/devices-setup.modal.html',
                controller: 'triggerObservation',
                controllerAs: 'triggerObservation',
                resolve: {
                    study: function () {
                        return study;
                    }
                }
            })
        };
    }
})();