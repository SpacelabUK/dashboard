(function() {
	"use strict";
	angular.module('app.study').controller('ViewStudyController',
			ViewStudyController);
	ViewStudyController.$inject = [
			'$stateParams', 'dataService', '$modal'
	];
	function ViewStudyController($stateParams, dataService, $modal) {
		var vm = this;
		vm.id = $stateParams.studyid;
		vm.spacePredicate = "alias";

		dataService.getOccupancyPerSpaceAndRound(vm.id).then(function(response) {
			vm.spaces = response.data;
		}, function(error) {
			console.log(error);
		});
		vm.getFuncs = function(space) {
			dataService.getSpaceFunctionPolygons(space.id).then(function(response) {
				var promise = $modal.open({
					templateUrl : 'app/study/polygon-view-modal.html',
					controller : 'PolygonViewModal',
					controllerAs : 'vm',
					windowClass : 'planView',
					resolve : {
						img : function() {
							return space.img;
						},
						polyData : function() {
							return response.data;
						}
					}
				});
			}, function(error) {
				console.log(error);
			});
		};
		vm.getTeams = function(space) {
			dataService.getSpaceTeamPolygons(space.id);
		};
		vm.getDepthmapMeasure = function(space, measureid) {
			dataService.getDepthmapMeasureRaster(space.id, measureid).then(
					function(response) {
						var promise = $modal.open({
							templateUrl : 'app/study/depthmap-view-modal.html',
							controller : 'DepthmapViewModal',
							controllerAs : 'vm',
							windowClass : 'planView',
							resolve : {
								img : function() {
									return space.img;
								},
								dpmData : function() {
									return response.data;
								}
							}
						});
					}, function(error) {
						console.log(error);
					});
		};
		vm.getSnapshotColour = function(snapshot) {
			return 'rgb(255,' + (255 - ((snapshot.occupancy * 128) | 0)) + ',' +
					(200 - ((snapshot.occupancy * 200) | 0)) + ")";
		};
		vm.empty = function() {

		};
		vm.showSnapshot = function(space, snapshot) {
			dataService.getSnapshotData(snapshot.snapshot_id).then(
					function(response) {
						var promise = $modal.open({
							templateUrl : 'app/study/snapshot-view-modal.html',
							controller : 'SnapshotViewModal',
							controllerAs : 'vm',
							windowClass : 'planView',
							resolve : {
								img : function() {
									return space.img;
								},
								entityData : function() {
									return response.data;
								}
							}
						});
					}, function(error) {
						console.log(error);
					});

		};

		// HTTPFactory.backendGet('GetTeamData?studyid=' + vm.id).then(
		// function(response) {
		// vm.teams = response.data;
		// for (var i = 0; i < vm.teams.length; i++) {
		// vm.teams[i].indx = i;
		// }
		// }, function(error) {
		// console.log(error);
		// });
		// vm.editTeam = function(team) {
		// $modal.open({
		// templateUrl : 'editTeam.html',
		// controller : [
		// '$scope', '$modalInstance', 'team',
		// function($scope, $modalInstance, team) {
		// $scope.team = team;
		// $scope.dismiss = function() {
		// console.log('bbb');
		// $modalInstance.dismiss('cancel');
		// }
		// $scope.ok = function() {
		// console.log('aaa');
		// $modalInstance.close(team);
		// }
		// }
		// ],
		// resolve : {
		// team : function() {
		// return angular.copy(team);
		// }
		// }
		// }).result.then(function(response) {
		// var keys = Object.keys(response);
		// for (var i = 0; i < keys.length; i++)
		// if (response[keys[i]] === null || response[keys[i]] === undefined)
		// delete response[keys[i]];
		// HTTPFactory.backendPost('StoreTeam', {
		// team : response
		// }).then(function(response) {
		// vm.teams[team.indx] = response.data;
		// }, function(error) {
		// console.log(error);
		// });
		// console.log(response);
		// });
		// }
	}
})();