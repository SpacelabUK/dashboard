(function () {
    angular.module('app').factory('importFactory', importFactory);
    importFactory.$inject = [
        '$modal'
    ];
    function importFactory($modal) {
        var factory = {
            addObservation: addObservation,
            addPlans: addPlans,
            addStakeholders: addStakeholders,
            addDepthmap: addDepthmap,
            addStaffSurvey: addStaffSurvey,
            storePlans: storePlans
        };
        return factory;
        function addPlans(study) {
            $modal.open({
                templateUrl: 'app/import/plans/addPlans.html',
                controller: 'addPlansInstance',
                controllerAs: 'vm',
                resolve: {
                    study: function () {
                        return study;
                    }
                }
            });
        }

        function addObservation(study) {
            $modal.open({
                templateUrl: 'app/import/observation/addObservationData.html',
                controller: 'addObservationDataInstance',
                controllerAs: 'vm',
                resolve: {
                    study: function () {
                        return study;
                    }
                }
            });
        }

        function addDepthmap(study) {
            $modal.open({
                templateUrl: 'app/import/depthmap/addDepthmap.html',
                controller: 'addDepthmapInstance',
                controllerAs: 'vm',
                windowClass: 'addDepthmap',
                resolve: {
                    study: function () {
                        return study;
                    }
                }
            });
        }

        function addStaffSurvey(study) {
            $modal.open({
                templateUrl: 'app/import/staffsurvey/addStaffSurvey.html',
                controller: 'addStaffSurveyInstance',
                controllerAs: 'vm',
                windowClass: 'addStaffSurvey',
                resolve: {
                    study: function () {
                        return study;
                    }
                }
            });
        }

        function addStakeholders(study) {
            $modal.open({
                templateUrl: 'app/import/stakeholders/addStakeholders.html',
                controller: 'addStakeholdersInstance',
                controllerAs: 'vm',
                windowClass: 'addStakeholders',
                resolve: {
                    study: function () {
                        return study;
                    }
                }
            });
        }

        function storePlans(study) {
            $modal.open({
                templateUrl: 'app/import/plans/addPlans.html',
                controller: 'storePlans',
                controllerAs: 'mainPlans',
                resolve: {
                    study: function () {
                        return study;
                    }
                }
            });
        }
    }
})();