var propIdentifier = 'PROPERTIES';
angular
		.module('app.core')
		.controller(
				'addDepthmapInstance',
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
						'MatcherFactory',
						function($scope, $modalInstance, $http, $modal, $q, study,
								FileUploader, PlanFactory, HTTPFactory, modalFactory,
								MatcherFactory) {
							"use strict";
							$scope.study = study;
							$scope.predicate = 'building';
							$scope.layerpredicate = 'name';
							$scope.cancel = function() {
								$modalInstance.dismiss('cancel');
							};
							$scope.depthmapTypes = [
									"Visibility", "Essence", "Accessibility"
							];
							$scope.properties = {};
							HTTPFactory.backendGet(
									'Occupancy?t=depthmap_types&obsid=' + study.id).then(
									function(response) {
										$scope.depthmapTypes = response.data.map(function(element) {
											return element.type;
										});
									}, function(error) {
										console.log(error);
									});

							// function endsWith(str, suffix) {
							// return str.indexOf(suffix, str.length - suffix.length) !== -1;
							// }

							function startsWith(str, prefix) {
								return str.indexOf(prefix) === 0;
							}
							function endsWith(str, suffix) {
								return str.match(suffix + "$") == suffix;
							}

							function startsWithIgnoreCase(str, prefix) {
								return str.toUpperCase().indexOf(prefix.toUpperCase()) === 0;
							}
							function endsWithIgnoreCase(str, suffix) {
								return str.toUpperCase().match(suffix.toUpperCase() + "$") == suffix
										.toUpperCase();
							}
							function eql(str1, str2) {
								return str1.trim().toLowerCase() === str2.toLowerCase();
							}
							var csvuploader = $scope.csvuploader = new FileUploader({
								url : HTTPFactory.getBackend() + 'StoreDepthmap'
							});
							var dxfuploader = $scope.dxfuploader = new FileUploader();
							// FILTERS
							csvuploader.filters.push({
								name : 'customFilter',
								fn : function(item, options) {
									return this.queue.length < 10;
								}
							});
							dxfuploader.filters.push({
								name : 'customFilter',
								fn : function(item, options) {
									return this.queue.length < 10;
								}
							});

							var dxfText = {};
							csvuploader.onAfterAddingFile = function(fileItem) {
								var reader = new FileReader();
								reader.onload = (function(theFile) {
									return function(e) {
										if (!endsWith(theFile.name, 'csv')) {
											alert("oi! that's not a CSV!");
											return;
										}
										$scope.csvValid = true;
										$scope.$apply();
									};
								})(fileItem._file);
								reader.readAsDataURL(fileItem._file);
							};
							dxfuploader.onAfterAddingFile = function(fileItem) {
								console.info(fileItem);
								var reader = new FileReader();
								reader.onload = (function(theFile) {
									return function(e) {
										if (!endsWith(theFile.name, 'dxf')) {
											alert("oi! that's not a DXF!");
											return;
										}
										$scope.dxfValid = true;
										$scope.$apply();
									};
								})(fileItem._file);
								reader.readAsDataURL(fileItem._file);
							};
							$scope.dataInvalid = function() {
								return !($scope.properties.name &&
										$scope.properties.name.trim().length > 0 &&
										$scope.properties.type &&
										$scope.properties.type.trim().length > 0 && $scope.csvValid && $scope.dxfValid);
							};
							$scope.attach = function(study) {
								var csvData, dxfData;
								modalFactory.openWaitModal('Getting Validation data...');
								var promises = [];

								var csvflow = new Flow({
									method : 'octet',
									target : HTTPFactory.getBackend() +
											'GetDepthmapComparableData',
									query : {
										studyid : $scope.study.id
									}
								});
								csvflow.addFile(csvuploader.queue[0]._file);
								csvflow.upload();
								var csvdefer = $q.defer();
								promises.push(csvdefer.promise);
								csvflow.on('fileSuccess', function(file, message) {
									var data = JSON.parse(message);
									csvdefer.resolve(data);
								});
								csvflow.on('fileError', function(file, message) {
									csvdefer.reject(message);
								});

								var dxfflow = new Flow({
									method : 'octet',
									target : HTTPFactory.getBackend() +
											'GetDepthmapComparableData',
									query : {
										studyid : $scope.study.id
									}
								});
								dxfflow.addFile(dxfuploader.queue[0]._file);
								dxfflow.upload();
								var dxfdefer = $q.defer();
								promises.push(dxfdefer.promise);
								dxfflow.on('fileSuccess', function(file, message) {
									var data = JSON.parse(message);
									dxfdefer.resolve(data);
								});
								dxfflow.on('fileError', function(file, message) {
									dxfdefer.reject(message);
								});
								$q.all(promises).then(
										function(response) {
											var csvData = response[0];
											var dxfData = response[1];
											// console.log(response);

											var newData = "SPACES_FILE";
											var dbData = "SPACES_DATABASE";
											modalFactory.closeWaitModal();
											MatcherFactory.openMatcherModal("space", "spaces",
													dxfData[newData], dxfData[dbData]).result.then(
													function(spaces_message) {
														var data = {
															studyid : study.id,
															fileidCSV : csvData.fileid,
															fileidDXF : dxfData.fileid,
															type : $scope.properties.type,
															name : $scope.properties.name,
															datain : {
																spaces : spaces_message,
															}
														};
														modalFactory.openWaitModal('Storing...');
														HTTPFactory.backendPost("StoreDepthmap", data)
																.then(function(response) {
																	modalFactory.modifyWaitMessage("Success!");
																	setTimeout(function() {
																		modalFactory.closeWaitModal();
																		$modalInstance.close();
																	}, 2000);
																}, function(error) {
																	modalFactory.closeWaitModal();
																	modalFactory.openErrorModal(error.data);
																	console.log(error);
																});
													}, function(error) {
													});

										}, function(error) {
											modalFactory.closeWaitModal();
											modalFactory.openErrorModal(error);
											console.log(error);
										});
							};
							csvuploader.onBeforeUploadItem = function(item) {
								item.formData.push({
									studyid : study.id,
									spaces : JSON.stringify($scope.foundspaces)
								});
							};
							csvuploader.onCompleteItem = function(item, response, status,
									headers) {
								console.log(item);
								console.log(response);
								console.log(status);
								console.log(headers);
							};
						}
				]);