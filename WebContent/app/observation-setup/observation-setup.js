(function () {
    "use strict";
    angular.module('app.observation-setup').controller('ObservationSetupController', ObservationSetupController);

    ObservationSetupController.$inject = ['$stateParams', 'HTTPFactory', 'modalFactory'];

    function ObservationSetupController($stateParams, HTTPFactory, modalFactory) {

        var study_id = $stateParams['study_id'];

        this.observationRounds = {rounds: []};

        this.defaultDurations = [
            60, 30, 15
        ];

        this.defaultRounds = [
            '09:00', '10:00', '11:30', '12:30', '13:30', '15:00',
            '16:00', '17:00'
        ];

        //Nasty but works.
        var ob = this;
        HTTPFactory.propulsionGet('/studies/' + study_id + '/observation/rounds?sort=day&sort=round')
            .then(function (response) {
                var data = response.data;
                if (data.length) {
                    ob.observationRounds.startdate = new Date(data[0].observation_start);
                    ob.observationRounds.enddate = new Date(data[data.length - 1].observation_end);
                    var date1 = new Date(data[0].observation_start);
                    var date2 = new Date(data[1].observation_start);
                    ob.observationRounds.duration = (Math.abs(date2.getTime() - date1.getTime())) / (1000 * 60);
                    data.forEach(function (datum) {
                        if (datum.day == 0) {
                            ob.observationRounds.rounds.push(new Date(datum.observation_start));
                        }
                    });
                }
            }, function (error) {
                console.log(error);
            });

        this.firstDayNextMonday = function () {
            var today = new Date();
            if (this.observationRounds.startdate)
                today = new Date(this.observationRounds.startdate);
            this.observationRounds.startdate = new Date(today.getFullYear(),
                today.getMonth(), today.getDate() + 8 - today.getDay());
            this.checkEndDate();
        };

        this.lastDayNextFriday = function () {
            var today = new Date();
            if (this.observationRounds.startdate)
                today = new Date(this.observationRounds.startdate);
            this.observationRounds.enddate = new Date(today.getFullYear(), today
                .getMonth(), today.getDate() + 5 - today.getDay());
        };

        this.checkEndDate = function () {
            if (this.observationRounds.enddate < this.observationRounds.startdate)
                this.observationRounds.enddate = this.observationRounds.startdate
        };

        this.setDefaultRounds = function () {
            this.observationRounds.rounds = [];
            var vm = this;
            angular.forEach(this.defaultRounds, function (round) {
                vm.addRound(round);
            });
        };

        this.addRound = function (time) {
            var timeParts = time.split(':');
            var dt = new Date();
            dt.setHours(timeParts[0]);
            dt.setMinutes(timeParts[1]);
            this.observationRounds.rounds.push(dt);
        };

        this.deleteRound = function (round) {
            var index = ob.observationRounds.rounds.indexOf(round);
            if (index > -1) {
                ob.observationRounds.rounds.splice(index, 1);
            }
        };

        this.deleteAllRounds = function () {
            HTTPFactory.propulsionDelete('/observation/rounds').then(function (response) {
                observationSetup.observationRounds.rounds = [];
            }, function (error) {
                console.log(error);
            });
        };

        this.clear = function () {
            this.observationRounds.duration = null;
            this.observationRounds.rounds = [];
            this.observationRounds.startdate = new Date();
            this.observationRounds.enddate = new Date();
        };

        this.save = function () {
            modalFactory.openWaitModal('Deleting Existing Observation Rounds..');
            HTTPFactory.propulsionDelete('/studies/' + study_id + '/observation/rounds').then(function (response) {
                modalFactory.modifyWaitMessage('Saving New Observation Rounds');
                doCreate();
                modalFactory.modifyWaitMessage('Success');
                setTimeout(function() {
                    modalFactory.closeWaitModal();
                }, 2000);
            }, function (error) {
                modalFactory.closeWaitModal();
                modalFactory.openErrorModal(error);
            });
        };

        var doCreate = function () {
            var duration = ob.observationRounds.duration;
            var round_no = 0;
            var day = 0;
            for (var start_date = new Date(ob.observationRounds.startdate);
                 start_date <= ob.observationRounds.enddate; start_date.setDate(start_date.getDate() + 1)) {
                ob.observationRounds.rounds.forEach(
                    function (round) {
                        var start = new Date(start_date);
                        start.setHours(round.getHours());
                        start.setMinutes(round.getMinutes());
                        var end = new Date(start_date);
                        end.setHours(round.getHours());
                        end.setMinutes(round.getMinutes());
                        var units = duration * 60000;
                        end.setTime(end.getTime() + units);
                        var data = {
                            study_id: study_id,
                            observation_start: start.toISOString(),
                            observation_end: end.toISOString(),
                            day: day,
                            round: round_no
                        };
                        HTTPFactory.propulsionPost('/observation/rounds', data).then(function (response) {
                        }, function (error) {
                            modalFactory.closeWaitModal();
                            modalFactory.openErrorModal(error);
                        });
                        round_no++;
                    }
                );
                day++;
                round_no = 0;
            }
        };
    }
})();
