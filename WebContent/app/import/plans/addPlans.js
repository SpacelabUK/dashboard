angular.module('app.core')
		.controller(
				'addPlansInstance',
				[
						'$scope',
						'$modalInstance',
						'$http',
						'$modal',
						'$q',
						'study',
						'FileUploader',
						'PlanFactory',
						'HTTPFactory',
						'modalFactory',
						function($scope, $modalInstance, $http, $modal, $q, study,
								FileUploader, PlanFactory, HTTPFactory, modalFactory) {
							"use strict";
							$scope.study = study;
							$scope.predicate = 'building';
							$scope.project = {};
							var date = new Date().getFullYear();
							$scope.project.id = date.toString().substring(2);
							$scope.project.name = '';
							PlanFactory.refreshSpaces(study);
							// console.log(study);
							$scope.add = function() {
								if ($scope.project.name.length > 0 &&
										$scope.project.id.length > 3) {
									// $modalInstance.close($scope.selected.item);
									projectFactory.addProject($scope.project.id,
											$scope.project.name).then(function(response) {
										// console.log(response);
										projectFactory.refreshProjects();
									}, function(error) {
										console.error(error);
									});
									$modalInstance.close();
								}
								// $modalInstance.dismiss('cancel');
							};

							$scope.validateID = function(value) {
								return value.length > 3;
							};
							$scope.cancel = function() {
								$modalInstance.dismiss('cancel');
							};
							var uploader = $scope.uploader = new FileUploader(
							// {
							// url : '/tomcutter/FlowUpload'
							// }
							);
							// FILTERS
							uploader.filters.push({
								name : 'customFilter',
								fn : function(item /* {File|FileLikeObject} */, options) {
									return this.queue.length < 10;
								}
							});
							uploader.onAfterAddingFile = function(fileItem) {
								console.info(fileItem);
								var reader = new FileReader();
								reader.onload = (function(theFile) {
									return function(e) {
										// Render thumbnail.
										if (!endsWith(theFile.name.toUpperCase(), 'DXF')) {
											alert("oi! that's not a DXF!");
											return;
										}

									};
								})(fileItem._file);
								reader.readAsDataURL(fileItem._file);
							};
							$scope.attach = function(study) {
								modalFactory.openWaitModal('Getting Validation data...');
								var flow = new Flow({
									method : 'octet',
									target : HTTPFactory.getBackend() + 'GetPlanComparableData',
									query : {
										studyid : $scope.study.id
									}
								});
								flow.addFile(uploader.queue[0]._file);
								flow.upload();
								flow.on('fileSuccess', function(file, message) {
									modalFactory.closeWaitModal();
									var data = JSON.parse(message);
									console.log(data);
									$scope.$apply();
									$scope.fileid = data.fileid;
									openPlanDataModal(data).result.then(function(response) {
										console.log(response);
										modalFactory.openWaitModal('Storing data...');
										HTTPFactory.backendPost('StorePlans', response).then(
												function() {
													modalFactory.modifyWaitMessage("Success!");
													setTimeout(function() {
														modalFactory.closeWaitModal();
														$modalInstance.close();
													}, 2000);
												}, function(error) {
													modalFactory.closeWaitModal();
													modalFactory.openErrorModal(error.data);
												});
									}, function(error) {
										console.log(error);
									});
								});

							};
							var openPlanDataModal = function(planData) {
								var promise = $modal.open({
									templateUrl : 'app/import/plans/planData.html',
									controller : 'planDataSelectorMI',
									resolve : {
										planData : function() {
											return planData;
										}
									}
								});
								return promise;
							};
						}
				]);
angular.module('app.core').controller(
		'planDataSelectorMI',
		[
				'$scope',
				'$modalInstance',
				'MatcherFactory',
				'planData',
				function($scope, $modalInstance, MatcherFactory, planData) {
					"use strict";
					$scope.cancel = function() {
						$modalInstance.dismiss('cancel');
					};
					$scope.attach = function() {
						$modalInstance.close(planData);
					};
					$scope.planData = planData;
					$scope.dataTypes = [];
					if (planData.spaces && planData.spaces.length > 0) {
						$scope.dataTypes.push({
							name : "Plan",
							canBeNew : planData.spacesInDB.length === 0,
							spaces : planData.spaces,
							state : planData.spacesInDB.length === 0 ? 'new' : 'overwrite',
							refine : function() {
								// MatcherFactory.openMatcherModal('space', 'spaces',
								// planData.spaces, planData.spacesInDB);
							}
						});
					}
					if (planData.accSpaces && planData.accSpaces.length > 0) {
						$scope.dataTypes
								.push({
									name : "Function polygons",
									canBeNew : planData.accSpacesInDB.length === 0,
									spaces : planData.accSpaces,
									state : planData.accSpacesInDB.length === 0 ? 'new'
											: 'overwrite',
									refine : function() {
										// MatcherFactory.openMatcherModal('space', 'spaces',
										// planData.accSpaces, planData.accSpacesInDB);
									}
								});
					}
					if (planData.teamSpaces && planData.teamSpaces.length > 0) {
						$scope.dataTypes.push({
							name : "Team polygons",
							canBeNew : planData.teamSpacesInDB.length === 0,
							spaces : planData.teamSpaces,
							state : planData.teamSpacesInDB.length === 0 ? 'new'
									: 'overwrite',
							refine : function() {
								// MatcherFactory.openMatcherModal('space', 'spaces',
								// planData.teamSpaces, planData.teamSpacesInDB);
							}
						});
					}
					$scope.setState = function(dataType, state) {
						dataType.state = state;
					};
					$scope.isState = function(dataType, state) {
						return dataType.state === state;
					};
				}
		]);
// app.controller('planDataSelectorMI', [
