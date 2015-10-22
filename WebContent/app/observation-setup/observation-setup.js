(function () {
    "use strict";
    angular.module('app.observation-setup').controller('ObservationSetupController',
        ObservationSetupController);
    ObservationSetupController.$inject = [
        '$stateParams', 'dataService', '$modal', 'RoundModelFactory'
    ];
    function ObservationSetupController($stateParams, dataService, $modal, RoundModelFactory) {
        var vm = this;
        var studyid = $stateParams['studyid'];
        vm.setRoundModel = function (study) {
            RoundModelFactory.getRoundModel(studyid).then(function (response) {
                var data = response.data[0];
                if (data) {
                    // var startdate = new Date();
                    // startdate.parse(data['startdate']);
                    // var enddate = new Date();
                    // enddate.parse(data['enddate']);
                    if (!observation.roundModel) {
                        observation.roundModel = {
                            observationid: observation.id,
                            type: 'date_round_matrices'
                        };
                    }
                    console.log(response);
                    observation.roundModel.startdate = Date.parse(data.start_date);
                    observation.roundModel.enddate = Date.parse(data.end_date);
                    observation.roundModel.duration = 60;// data['roundduration'];
                }
                $modal.open({
                    templateUrl: 'studies/observation/setRoundModel.html',
                    controller: 'setRoundModel',
                    size: 'lg',
                    resolve: {
                        observation: function () {
                            return observation;
                        }
                    }
                });
            }, function (error) {
                console.log(error);
                $modal.open({
                    templateUrl: 'app/observation-setup/setRoundModel.html',
                    controller: 'setRoundModel',
                    size: 'lg',
                    resolve: {
                        observation: function () {
                            return studyid;
                        }
                    }
                });
            });
        };
    }
})();