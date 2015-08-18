app.controller('observationController', [
		'$scope',
		'$stateParams',
		'HTTPFactory',
		'$modal',
		function($scope, $stateParams, HTTPFactory, $modal) {
			"use strict";
			$scope.id = $stateParams.part_id;
			$scope.spacePredicate = "alias";

			HTTPFactory.backendGet(
					'Occupancy?t=occ_per_space_and_round_prc&obsid=' + $scope.id).then(
					function(response) {
						console.log(response.data);
						$scope.spaces = response.data;
					}, function(error) {
						console.log(error);
					});
			$scope.getFuncs = function(space) {
				HTTPFactory.backendGet(
						"GetSpaceData?spaceid=" + space.id + "&functeam=func").then(
						function(response) {
							console.log(response.data);
							var promise = $modal.open({
								templateUrl : 'studies/polyView.html',
								controller : 'polyViewController',
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
			$scope.getDepthmapMeasure = function(space, measureid) {
				HTTPFactory.backendGet(
						"GetDepthmapData?spaceid=" + space.id + "&measure=" + measureid +
								"&analysis_type=" + 'Accessibility').then(function(response) {
					console.log(response.data);
					var promise = $modal.open({
						templateUrl : 'studies/dpmView.html',
						controller : 'dpmViewController',
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
			$scope.getTeams = function(space) {
				HTTPFactory.backendGet("GetSpaceData?spaceid=" + space.id +
						"&functeam=team");
			};
			$scope.getSnapshotColour = function(snapshot) {
				return 'rgb(255,' + (255 - ((snapshot.occupancy * 128) | 0)) + ',' +
						(200 - ((snapshot.occupancy * 200) | 0)) + ")";
			};
			$scope.empty = function() {

			};
			$scope.showSnapshot = function(space, snapshot) {
				console.log(space);
				HTTPFactory.backendGet(
						"GetObservationData?snapshotid=" + snapshot.snapshot_id).then(
						function(response) {
							console.log(response.data);
							var promise = $modal.open({
								templateUrl : 'studies/planView.html',
								controller : 'planViewController',
								windowClass : 'planView',
								resolve : {
									img : function() {
										return space.img;
									},
									snapshot : function() {
										return snapshot;
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
		}
]);
app.controller('planViewController', [
		'$scope',
		'$stateParams',
		'HTTPFactory',
		'$modalInstance',
		'img',
		'snapshot',
		'entityData',
		function($scope, $stateParams, HTTPFactory, $modalInstance, img, snapshot,
				entityData) {
			$scope.imagesource = "/tomcutter/data/plans/" + img;
			$scope.entityData = entityData;
		}
]);
app.controller('polyViewController', [
		'$scope', '$stateParams', 'HTTPFactory', '$modalInstance', 'img',
		'polyData',
		function($scope, $stateParams, HTTPFactory, $modalInstance, img, polyData) {
			$scope.imagesource = "/tomcutter/data/plans/" + img;
			$scope.polyData = polyData;
		}
]);
app.controller('dpmViewController', [
		'$scope', '$stateParams', 'HTTPFactory', '$modalInstance', 'img',
		'dpmData',
		function($scope, $stateParams, HTTPFactory, $modalInstance, img, dpmData) {
			$scope.imagesource = "/tomcutter/data/plans/" + img;
			$scope.dpmData = dpmData;
		}
]);