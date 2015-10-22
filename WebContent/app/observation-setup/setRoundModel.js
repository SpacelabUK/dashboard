angular.module('app.observation-setup').factory('RoundModelFactory', [
    '$q',
    '$http',
    'HTTPFactory',
    function ($q, $http, HTTPFactory) {
        fetch = function (url) {
            var deferred = $q.defer(), httpPromise = $http.get(url);

            httpPromise.then(function (response) {
                deferred.resolve(response);
            }, function (error) {
                console.error(error);
            });
            return httpPromise;
        }
        updateSpaces = function (study, spaces) {
            if (!study.existingSpaces)
                study.existingSpaces = [];
            while (study.existingSpaces.length > 0)
                study.existingSpaces.pop();
            for (var i = 0; i < spaces.length; i++)
                study.existingSpaces.push(spaces[i]);
        }
        getDateString = function (date) {
            var dd = date.getDate();
            var mm = date.getMonth() + 1; // January is 0!

            var yyyy = date.getFullYear();
            if (dd < 10) {
                dd = '0' + dd
            }
            if (mm < 10) {
                mm = '0' + mm
            }
            return dd + '/' + mm + '/' + yyyy;
        }
        pushRoundModel = function (roundModel) {
            var rounds = [];
            angular.forEach(roundModel.rounds, function (round) {
                var hours = round.getHours();
                if (hours < 10)
                    hours = '0' + hours;
                var minutes = round.getMinutes();
                if (minutes < 10)
                    minutes = '0' + minutes;
                rounds.push(hours + ":" + minutes);
            });
            var model = {
                'duration': roundModel.duration + ' minutes',
                'startdate': getDateString(roundModel.startdate),
                'enddate': getDateString(roundModel.enddate),
                'rounds': rounds
            };
            var data = {
                'observationid': roundModel.observationid,
                'type': roundModel.type,
                'model': model

            };
            var deferred = $q.defer(), httpPromise = $http.post(
                // 'studies/observation/setRoundModel.php', data);
                HTTPFactory.getBackend() + 'SetRoundModel', data);

            httpPromise.then(function (response) {
                deferred.resolve(response);
            }, function (error) {
                console.error(error);
            });

            return deferred.promise;
        }
        var public = {
            setRoundModel: function (roundModel) {
                console.log(roundModel);
                pushRoundModel(roundModel).then(function (response) {
                }, function (error) {
                    console.log(error);
                });
            },
            getRoundModel: function (studyid) {
                // return fetch('studies/observation/getRoundModel.php?observationid='
                return fetch(HTTPFactory.getBackend() +
                    'GetAll?t=round_model&observationid=' + studyid);
            }
        }
        return public;
    }
]);
angular.module('app.observation-setup')
    .controller(
    'setRoundModel',
    [
        '$scope',
        '$modalInstance',
        'observation',
        'RoundModelFactory',
        function ($scope, $modalInstance, observation, RoundModelFactory) {
            var roundModel = {};
            $scope.today = function () {
                roundModel.startdate = new Date();
                roundModel.enddate = new Date();
            };
            if (!observation.roundModel) {
                observation.roundModel = {
                    observationid: observation.id,
                    type: 'date_round_matrices'
                };
                $scope.today(observation.roundModel);
            }
            $scope.roundModel = observation.roundModel;

            $scope.clear = function () {
                $scope.roundModel.startdate = null;
                $scope.roundModel.enddate = null;
            };

            // Disable weekend selection
            $scope.disabled = function (date, mode) {
                return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6));
            };

            $scope.toggleMin = function () {
                $scope.minDate = $scope.minDate ? null : new Date();
            };
            $scope.toggleMin();

            $scope.open = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();

                $scope.opened = true;
            };

            $scope.dateOptions = {
                formatYear: 'yy',
                startingDay: 1
            };

            $scope.initDate = new Date('2016-15-20');
            $scope.formats = [
                'dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'
            ];
            $scope.format = $scope.formats[0];
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };

            $scope.checkEndDate = function () {
                if ($scope.roundModel.enddate < $scope.roundModel.startdate)
                    $scope.roundModel.enddate = $scope.roundModel.startdate
            };
            $scope.firstDayNextMonday = function () {
                var today = new Date();
                if ($scope.roundModel.startdate)
                    today = new Date($scope.roundModel.startdate);
                $scope.roundModel.startdate = new Date(today.getFullYear(),
                    today.getMonth(), today.getDate() + 8 - today.getDay());
                $scope.checkEndDate();
            }
            $scope.hstep = 1;
            $scope.mstep = 15;
            $scope.lastDayNextFriday = function () {
                var today = new Date();
                if ($scope.roundModel.startdate)
                    today = new Date($scope.roundModel.startdate);
                $scope.roundModel.enddate = new Date(today.getFullYear(), today
                    .getMonth(), today.getDate() + 5 - today.getDay());
            }
            var defaultRounds = [
                '09:00', '10:00', '11:30', '12:30', '13:30', '15:00',
                '16:00', '17:00'
            ];
            $scope.setDefaultRounds = function () {
                $scope.roundModel.rounds = null;
                angular.forEach(defaultRounds, function (round) {
                    $scope.addRound(round);
                });
            }
            $scope.deleteAllRounds = function () {
            }
            $scope.defaultDurations = [
                60, 30, 15
            ];

            $scope.deleteRound = function (round) {
                var index = $scope.roundModel.rounds.indexOf(round);
                if (index > -1) {
                    $scope.roundModel.rounds.splice(index, 1);
                }
            }
            $scope.addRound = function (time) {
                if (!$scope.roundModel.rounds)
                    $scope.roundModel.rounds = [];
                if (!time)
                    time = defaultRounds[0];
                var timeParts = time.split(':');
                var dt = new Date();
                dt.setHours(timeParts[0]);
                dt.setMinutes(timeParts[1]);
                $scope.roundModel.rounds.push(dt);
            }
            $scope.clear = function () {
                $scope.roundModel = {};
                $scope.roundModel.rounds = [];
                $scope.roundModel.startdate = new Date();
                $scope.roundModel.enddate = new Date();
            }
            $scope.save = function () {
                RoundModelFactory.setRoundModel($scope.roundModel);
                // $modalInstance.close();
            }
        }
    ]);