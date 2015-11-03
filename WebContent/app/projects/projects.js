(function () {
    "use strict";
    angular.module('app.projects').controller('Projects', projectsController);
    projectsController.$inject = [

        '$modal', 'importFactory', 'HTTPFactory'
    ];

    function projectsController($modal, importFactory, HTTPFactory) {
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

        vm.addObservation = function (study) {
            projectFactory.addStudyPart(study, 'observation');
        };
        vm.addPlans = function (study) {
            importFactory.addPlans(study);
        };
        vm.addObservationData = function (study) {
            importFactory.addObservation(study);
        };
        vm.addDepthmap = function (study) {
            importFactory.addDepthmap(study);
        };
        vm.addStaffSurvey = function (study) {
            importFactory.addStaffSurvey(study);
        };
        vm.addStakeholders = function (study) {
            importFactory.addStakeholders(study);
        };
        vm.storePlans = function (study) {
            importFactory.storePlans(study);
        };
        vm.triggerObservation = function (study) {
            $modal.open({
                templateUrl: 'app/observation-trigger/observation-trigger.modal.html',
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