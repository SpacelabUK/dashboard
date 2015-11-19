(function () {
    "use strict";
    angular.module('app.study.view').controller('ViewStudyController', ViewStudyController);
    ViewStudyController.$inject = ['$stateParams', 'HTTPFactory', '$modal'];

    function ViewStudyController($stateParams, HTTPFactory, $modal) {
        var vm = this;
        vm.id = $stateParams.studyid;
        vm.spacePredicate = "alias";
        vm.counts = {};

        HTTPFactory.propulsionGet('/studies/' + vm.id + '/spaces').then(function(response) {
            vm.spaces = response.data.content;
            HTTPFactory.propulsionGet('/studies/'+vm.id+'/observation/rounds?sort=day&sort=round').then(function(response) {
                vm.rounds = response.data;
                vm.spaces.forEach(function(space){
                    vm.counts[space.id] = {};
                    vm.rounds.forEach(function(round){
                        HTTPFactory.propulsionGet("/spaces/" + space.id + "/observation/rounds/" + round.id + "/items/count").then(
                            function(response){
                                vm.counts[space.id][round.id] = response.data.observation_items_count;
                            }, function(error){
                                console.log(error)
                            }
                        );
                    });
                });
            }, function(error){
                console.log(error);
            });
        }, function (error){
            console.log(error);
        });

        vm.getFuncs = function (space) {
            dataService.getSpaceFunctionPolygons(space.id).then(function (response) {
                var promise = $modal.open({
                    templateUrl: 'app/study/polygon-view.modal.html',
                    controller: 'PolygonViewModal',
                    controllerAs: 'vm',
                    windowClass: 'planView',
                    resolve: {
                        img: function () {
                            return space.img;
                        },
                        polyData: function () {
                            return response.data;
                        }
                    }
                });
            }, function (error) {
                console.log(error);
            });
        };
        vm.getTeams = function (space) {
            dataService.getSpaceTeamPolygons(space.id);
        };
        vm.getDepthmapMeasure = function (space, measureid) {
            dataService.getDepthmapMeasureRaster(space.id, measureid).then(
                function (response) {
                    var promise = $modal.open({
                        templateUrl: 'app/study/depthmap-view.modal.html',
                        controller: 'DepthmapViewModal',
                        controllerAs: 'vm',
                        windowClass: 'planView',
                        resolve: {
                            img: function () {
                                return space.img;
                            },
                            dpmData: function () {
                                return response.data;
                            }
                        }
                    });
                }, function (error) {
                    console.log(error);
                });
        };
        vm.calculateColour = function (spaceId, roundId) {
            return 'rgb(255,' + (255 - ((vm.counts[spaceId][roundId] * 128) | 0)) + ',' +
                (200 - ((vm.counts[spaceId][roundId] * 200) | 0)) + ")";
        };
        vm.empty = function () {

        };
        vm.showObservationRound = function (space, snapshot) {
            dataService.getSnapshotData(snapshot.snapshot_id).then(
                function (response) {
                    var promise = $modal.open({
                        templateUrl: 'app/study/snapshot-view.modal.html',
                        controller: 'SnapshotViewModal',
                        controllerAs: 'vm',
                        windowClass: 'planView',
                        resolve: {
                            img: function () {
                                return space.img;
                            },
                            entityData: function () {
                                return response.data;
                            }
                        }
                    });
                }, function (error) {
                    console.log(error);
                });

        };
    }
})();