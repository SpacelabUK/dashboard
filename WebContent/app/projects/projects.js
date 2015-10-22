(function () {
    "use strict";
    angular.module('app.projects').controller('Projects', projectsController);
    projectsController.$inject = [

        '$modal', 'dataService', 'importFactory'
        // 'RoundModelFactory', 'fetching'
    ];

    function projectsController($modal, dataService, importFactory) {
        var vm = this;
        fetchInitialData();
        function fetchInitialData() {
            dataService.getProjects().then(function (response) {
                vm.projects = response.data;
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
            dataService.createNewOpenStudy(project.id).then(function () {
                fetchInitialData();
            });
        };

        // =========

        vm.addObservation = function (study) {
            projectFactory.addStudyPart(study, 'observation');
        };
        // $scope.fetchingObservationRounds = function(id) {
        // return fetching.is('obs', id);
        // }
        vm.setRoundModel = function (observation) {
            fetching.set('obs', observation.id);
            RoundModelFactory.getRoundModel(observation).then(function (response) {
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
                // console.log(observation);
                fetching.unset('obs', observation.id);
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
            });
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
    }
})();
angular.module('app.projects').controller(
    'MainStudyCtrl',
    [
        '$scope',
        '$stateParams',
        'StudyFactory',
        'HTTPFactory',
        function ($scope, $stateParams, StudyFactory, HTTPFactory) {
            "use strict";
            // fetch(backend + 'Get?t=study&studyid=' +
            // study.id).then(
            // function(response) {
            // $scope.desks = response.data;
            // calcAvgOccupancy();
            // }, function(error) {
            // });
            $scope.id = $stateParams.studyid;
            // $scope.study = {};
            StudyFactory.fetchStudy($scope.id, [
                'project_name'
            ]).then(function (response) {
                // for (var i = 0; i < response.length;
                // i++)
                // $scope.study[response[i][0]] =
                // response[i][1];
                $scope.study = response;
                // console.log(response);
            }, function (error) {
                console.log(error);
            });
            HTTPFactory.backendGet('GetAll?t=study_parts&studyid=' + $scope.id)
                .then(
                function (response) {
                    // $scope.observation_id = response.data[0]['id'];
                    $scope.observation_id = response.data[0].id;
                    HTTPFactory.backendGet(
                        'Occupancy?t=project_name&obsid=' +
                        $scope.observation_id).then(function (response) {
                            $scope.projectname = response.data;
                        }, function (error) {
                        });
                    HTTPFactory.backendGet(
                        'Occupancy?t=no_of_desks&obsid=' +
                        $scope.observation_id).then(function (response) {
                            $scope.desks = response.data;
                            calcOccupancy();
                        }, function (error) {
                        });
                    HTTPFactory.backendGet(
                        'Occupancy?t=no_of_rounds&obsid=' +
                        $scope.observation_id).then(function (response) {
                            $scope.rounds = response.data;
                            calcOccupancy();
                        }, function (error) {
                        });
                    HTTPFactory.backendGet(
                        'Occupancy?t=gross_occupancy&obsid=' +
                        $scope.observation_id).then(function (response) {
                            $scope.occupancy = response.data;
                            calcOccupancy();
                        }, function (error) {
                        });
                    HTTPFactory.backendGet(
                        'Occupancy?t=min_occupancy&obsid=' +
                        $scope.observation_id).then(function (response) {
                            $scope.minoccupancy = response.data;
                            calcOccupancy();
                        }, function (error) {
                        });
                    HTTPFactory.backendGet(
                        'Occupancy?t=max_occupancy&obsid=' +
                        $scope.observation_id).then(function (response) {
                            $scope.maxoccupancy = response.data;
                            calcOccupancy();
                        }, function (error) {
                        });
                    HTTPFactory.backendGet(
                        'GetAll?t=spaces&studyid=' + $scope.id).then(
                        function (response) {
                            $scope.spaces = response.data.length;
                        }, function (error) {
                        });
                    HTTPFactory.backendGet(
                        'Occupancy?t=no_of_buildings&obsid=' +
                        $scope.observation_id).then(function (response) {
                            $scope.buildings = response.data;
                        }, function (error) {
                        });
                    HTTPFactory.backendGet(
                        'Occupancy?t=get_quotes&obsid=' + $scope.id).then(
                        function (response) {
                            var i;
                            // if($scope.wordleData)
                            // {
                            // for (var
                            // i = 0; i
                            // <
                            // $scope.wordleData.length;
                            // i++) {
                            // $scope.wordleData.pop();
                            // }
                            // } else {
                            $scope.wordleData = [];
                            // }
                            var max = 0;
                            for (i = 0; i < response.data.length; i++) {
                                if (response.data[i].size > max) {
                                    max = response.data[i].size;
                                }
                            }
                            for (i = 0; i < response.data.length; i++) {
                                response.data[i].size = response.data[i].size *
                                    100.0 / max;
                                // $scope.wordleData.push(response.data[i]);
                            }
                            $scope.wordleData = response.data;
                            // console
                            // .log(response.data);
                        }, function (error) {
                        });
                    HTTPFactory.backendGet(
                        'Occupancy?t=total_occ_per_round&obsid=' +
                        $scope.observation_id).then(function (response) {
                            var i;
                            var data = response.data;
                            // console.log(data);
                            var collated = {};
                            var sortable = [];
                            for (i = 0; i < data.length; i++) {
                                var id = data[i].day_id * 100 + data[i].round_id;
                                sortable.push(id);
                                collated[id] = data[i].count;
                            }
                            sortable.sort();
                            $scope.occPerRound = [];
                            for (i = 0; i < sortable.length; i++) {
                                $scope.occPerRound.push(collated[sortable[i]]);
                            }
                            // console.log($scope.occ_per_round);
                        }, function (error) {
                        });
                    HTTPFactory.backendGet(
                        'Occupancy?t=desk_occ_frequency&obsid=' +
                        $scope.observation_id).then(function (response) {
                            var data = response.data;
                            // //
                            // console.log(data);
                            // var
                            // collated
                            // = {};
                            // for (var
                            // i = 0; i
                            // <
                            // data.length;
                            // i++) {
                            // var id =
                            // data[i].times_found;
                            // collated[id]
                            // = ;
                            // }
                            $scope.deskOccFreq = [];
                            for (var i = 0; i < data.length; i++) {
                                $scope.deskOccFreq.push(data[i].frequency);
                            }
                            // console.log($scope.occ_per_round);
                        }, function (error) {
                        });
                    HTTPFactory.backendGet(
                        'Occupancy?t=no_of_staff&obsid=' + $scope.id).then(
                        function (response) {
                            $scope.staff = response.data;
                        }, function (error) {
                        });
                }, function (error) {
                });
            $scope.words = [
                "Hallo", "Test", "Lorem", "Ipsum", "Lorem", "ipsum", "dolor",
                "sit", "amet", "consetetur", "sadipscing", "elitr,", "sed",
                "diam", "nonumy", "eirmod", "tempor", "invidunt", "ut", "labore",
                "et", "dolore", "magna", "aliquyam", "erat,", "sed", "diam"
            ];
            // console.log($scope.words);

            // $scope.myOnClickFunction = function(element) {
            // console.log("click", element);
            // }
            //
            // $scope.myOnHoverFunction = function(element) {
            // console.log("hover", element);
            // }
            // $scope.occPerRound = [ 3, 6, 2, 7, 5, 2, 0, 3, 8,
            // 9, 2, 5, 9, 3,
            // 6,
            // 3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 2, 7 ];
            $scope.occPerRound = [
                0
            ];
            $scope.deskOccFreq = [
                0
            ];
            // $scope.wordleData = [ "Hello", "world",
            // "normally", "you", "want",
            // "more", "words", "than", "this" ].map(function(d)
            // {
            // return {
            // text : d,
            // size : 10 + Math.random() * 90
            // };
            // });
            $scope.minOccupancyValues = [
                0, 1
            ];
            $scope.avgOccupancyValues = [
                0, 1
            ];
            $scope.maxOccupancyValues = [
                0, 1
            ];
            $scope.minOccupancyLabels = [
                '0%', '100%'
            ];
            $scope.avgOccupancyLabels = [
                '0%', '100%'
            ];
            $scope.maxOccupancyLabels = [
                '0%', '100%'
            ];
            function calcOccupancy() {
                $scope.avgOccupancyValues = [
                    $scope.occupancy / ($scope.desks * $scope.rounds),
                    1 - $scope.occupancy / ($scope.desks * $scope.rounds)
                ];
                $scope.avgOccupancyLabels = [
                    (($scope.avgOccupancyValues[0] * 100) | 0) + '%',
                    (($scope.avgOccupancyValues[1] * 100) | 0) + '%'
                ];

                $scope.minOccupancyValues = [
                    $scope.minoccupancy / $scope.desks,
                    1 - $scope.minoccupancy / $scope.desks
                ];
                $scope.minOccupancyLabels = [
                    (($scope.minOccupancyValues[0] * 100) | 0) + '%',
                    (($scope.minOccupancyValues[1] * 100) | 0) + '%'
                ];

                $scope.maxOccupancyValues = [
                    $scope.maxoccupancy / $scope.desks,
                    1 - $scope.maxoccupancy / $scope.desks
                ];
                $scope.maxOccupancyLabels = [
                    (($scope.maxOccupancyValues[0] * 100) | 0) + '%',
                    (($scope.maxOccupancyValues[1] * 100) | 0) + '%'
                ];

            }
        }
    ]);