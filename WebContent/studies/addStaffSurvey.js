app
		.controller(
				'addStaffSurveyInstance',
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
						'MatcherFactory',
						function($scope, $modalInstance, $http, $modal, $q, study,
								FileUploader, PlanFactory, HTTPFactory, MatcherFactory) {
							$scope.study = study;
							$scope.predicate = 'building';
							$scope.project = {};
							var date = new Date().getFullYear();
							$scope.project.id = date.toString().substring(2);
							$scope.project.name = '';
							// PlanFactory.refreshSpaces(study);
							console.log(study);
							$scope.add = function() {
								if ($scope.project.name.length > 0
										&& $scope.project.id.length > 3) {
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
							}
							$scope.cancel = function() {
								$modalInstance.dismiss('cancel');
							};
							$scope.layerpredicate = 'name';
							$scope.selectedSpaceLayers = [];
							$scope.selectOnlySpace = function(clickedSpace) {
								angular.forEach($scope.foundspaces, function(space) {
									if (space === clickedSpace) {
										// console.log(space);
										space.selected = true;
										// for (var i = 0; i <
										// $scope.selectedSpaceLayers.length;
										// i++) {
										// $scope.selectedSpaceLayers
										// .pop();
										// }
										$scope.selectedSpaceLayers = [];
										var keyz = Object.keys(space.f);
										for (var i = 0; i < keyz.length; i++) {
											$scope.selectedSpaceLayers.push(space.f[keyz[i]]);
										}

										// console.log('selected');
										// console
										// .log($scope.selectedSpaceLayers);
									} else
										space.selected = false;
									var keyz = Object.keys(space.f);
									for (var i = 0; i < keyz.length; i++) {
										space.f[keyz[i]].selected = false;
									}
								});

							}
							$scope.selectLayer = function(layer) {
								layer.selected = !layer.selected;
								// for (var i = 0; i < $scope.data.length; i++)
								// {
								// $scope.data.pop();
								// }
								$scope.data = [];
								angular.forEach($scope.selectedSpaceLayers, function(layr) {
									if (layr.selected)
										for (var i = 0; i < layr.polys.length; i++)
											$scope.data.push(layr.polys[i]);
								});

							}
							// $scope.getSelectedSpaceLayers = function() {
							// console.log('a');
							// angular.forEach($scope.foundspaces, function(
							// space) {
							// if (space.selected)
							// return space.f;
							// });
							// }
							// if (window.File && window.FileReader
							// && window.FileList && window.Blob) {
							// // Great success! All the File APIs are
							// // supported.
							// } else {
							// alert('The File APIs are not fully supported in
							// this browser.');
							// }

							var vnauploader = $scope.vnauploader = new FileUploader({
								url : backend + 'StoreStaffSurvey'
							// formData : [
							// {
							// studyid : 39,
							// }
							// ]
							});
							// FILTERS
							vnauploader.filters.push({
								name : 'customFilter',
								fn : function(item /* {File|FileLikeObject} */, options) {
									return this.queue.length < 10;
								}
							});

							function endsWith(str, suffix) {
								return str.indexOf(suffix, str.length - suffix.length) !== -1;
							}
							var dxfText = {};
							vnauploader.onAfterAddingFile = function(fileItem) {
								console.info(fileItem);
								// };
								// $scope.$watch('dxfFile', function(value) {
								// console.log(value);
								// console.log($scope.dxfFile);
								var reader = new FileReader();
								reader.onload = (function(theFile) {
									return function(e) {
										// Render thumbnail.
										if (!endsWith(theFile.name, 'vna')) {
											alert("oi! that's not a VNA!");
											return;
										}

										// var start = 0;
										// var stop = theFile.size - 1;
										//																				
										// var blob = theFile.slice(start, stop);
										reader.readAsText(theFile);

										fileItem.formData.push({
											studyid : study.id
										});
										reader.onload = function(e) {
											// var lines =
											// text.split(/[\r\n]+/g);
											var vna = e.target.result;
											getVNAData(vna);
											// console.log(e.target);
										};

										// var data = e.target.result;
										//
										// fileItem.formData.push({
										// studyid : study.id
										// });
										// getVNAData(data);

									};
								})(fileItem._file);
								// Closure to capture the file information.
								// Read in the image file as a data URL.
								reader.readAsDataURL(fileItem._file);
							};
							$scope.searchcomment = '';
							$scope.foundspaces = [];
							function getFlatObjectArray(dxfObject) {
								var parts = [];
								parts.push(getBareObject(dxfObject));
								getBareChildren(parts, dxfObject);
								return parts;
							}
							function getBareChildren(parts, dxfObject) {
								angular.forEach(dxfObject.c, function(child) {
									parts.push(getBareObject(child));
									getBareChildren(parts, child);
								});
							}
							function getBareObject(dxfObject) {
								return {
									id : dxfObject.id,
									type : dxfObject.type,
									p : JSON.stringify(dxfObject.p)
								}
							}

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

							function getVNAData(text) {

								text = text.replace('\r', '\n');
								text = text.replace(/ {1,}/g, ' ');
								var lines = text.split('\n');
								var headers = null;
								var node_data = {
									headers : '',
									rows : []
								};
								var tie_data = {
									headers : '',
									rows : []
								};
								var currentRows = null;
								for (var i = 0; i < lines.length; i++) {
									if (lines[i].trim().toUpperCase() == '*NODE DATA') {
										currentRows = node_data.rows;
										node_data.headers = lines[i + 1].trim();
										i++;
									} else if (lines[i].trim().toUpperCase() == '*TIE DATA') {
										currentRows = tie_data.rows;
										tie_data.headers = lines[i + 1].trim();
										i++;
									} else if (currentRows) {
										currentRows.push(lines[i].trim());
									}
								}
								var headers = node_data.headers.split(' ');
								var nameColumn = 0;
								var completedColumn = 0;
								var departmentColumn = 0;
								var positionColumn = 0;
								$scope.questions = [];
								for (var i = 0; i < headers.length; i++) {
									if (headers[i].toUpperCase() == 'NAME') {
										nameColumn = i;
									} else if (headers[i].toUpperCase() == 'COMPLETED') {
										completedColumn = i;
									} else if (headers[i].toUpperCase() == 'DEPARTMENT') {
										departmentColumn = i;
									} else if (headers[i].toUpperCase() == 'POSITION') {
										positionColumn = i;
									} else if (headers[i].toUpperCase() != 'EMAIL'
											&& headers[i].toUpperCase() != 'ID') {
										$scope.questions.push({
											name : headers[i],
											id : i,
											answered : 0
										});
									}
								}
								$scope.staff = [];

								$scope.completed = 0;
								for (var i = 0; i < node_data.rows.length; i++) {
									var line = node_data.rows[i].slice(1,
											node_data.rows[i].length - 1).split("\" \"");
									var completed = line[completedColumn].toUpperCase() == 'COMPLETE';
									if (completed)
										$scope.completed++;
									for (var j = 0; j < $scope.questions.length; j++) {
										if (line[$scope.questions[j].id].trim().length > 0)
											$scope.questions[j].answered++;
									}
									$scope.staff.push({
										name : line[nameColumn],
										department : line[departmentColumn],
										position : line[positionColumn],
										completed : completed
									});
								}
								for (var j = 0; j < $scope.questions.length; j++) {
									if (line[$scope.questions[j].id].trim().length > 0)
										$scope.questions[j].answered = (($scope.questions[j].answered / $scope.staff.length) * 100) | 0;
								}
								$scope.$apply();
								return;

							}
							$scope.getCompleted = function() {
								if ($scope.completed && $scope.staff && $scope.staff.length > 0)
									return (($scope.completed / $scope.staff.length) * 100) | 0;
								else
									return 0;
							}
							function clearObj(o) {
								var newC = [];
								for (var i = 0; i < o.c.length; i++) {
									if (!clearObj(o.c[i]))
										newC.push(o.c[i])
								}
								o.c = newC;
								if (o.c.length == 0
										&& ((o.type != 'TEXT' && o.type != 'MTEXT') || o.p['8']
												.toUpperCase() != genIdentifier + propIdentifier)) {
									return true;
								} else
									return false;
							}
							$scope.dataInvalid = function() {
								return !$scope.staff || $scope.staff.length < 1
										|| !$scope.questions || $scope.questions.length < 1;
							}
							$scope.selectAllSpaces = function() {
								for (var i = 0; i < $scope.foundspaces.length; i++)
									$scope.foundspaces[i].selected = true;
							};
							$scope.getSpaceValidityTooltip = function(space) {
								if (!space.valid)
									return 'Space "' + space.alias
											+ '" does not exist in the database!';
							}
							$scope.noSelectedSpaces = function() {
								return $scope.foundspaces.length == 0;
							};
							openConfirmModal = function(message, okText, cancelText) {
								var promise = $modal.open({
									templateUrl : 'confirmModal.html',
									controller : 'confirmDialog',
									resolve : {
										message : function() {
											return message;
										},
										okText : function() {
											return okText;
										},
										cancelText : function() {
											return cancelText;
										}
									}
								});
								return promise;
							}

							function eql(str1, str2) {
								return str1.trim().toLowerCase() == str2.toLowerCase()
							}
							var rounds = 0;
							var days = 0;
							$scope.addDXF = function(study) {

								vnauploader.uploadAll();
								// var deferred = $q.defer(), httpPromise =
								// $http
								// .post(backend + 'ValidateDepthmap',
								// data);
								//
								// httpPromise.then(function(response) {
								// deferred.resolve(response);
								// }, function(error) {
								// console.error(error);
								// });
								//
								// return deferred.promise;
							}
							vnauploader.onCompleteItem = function(item, response, status,
									headers) {
								// console.log(item);
								// console.log(JSON.stringify(response));
								// console.log(status);
								// console.log(headers);
								MatcherFactory.openMatcherModal("team", "teams",
										response["DEPARTMENT_LIST"], response["DATABASE_TEAMS"]).result
										.then(function(teams_message) {
											// MatcherFactory.openMatcherModal("question",
											// "questions",
											// // response["QUESTION_LIST"],
											// response["DATABASE_QUESTIONS"], {
											// // preCompare : true,
											// fromProperties : [
											// 'parent'
											// ],
											// toProperties : [
											// 'parent'
											// ]
											// }).result.then(function(questions_message) {
											console.log("success");
											console.log(teams_message);
											// console.log(questions_message);
											var data = {
												studyid : study.id,
												fileid : response.fileid,
												datain : {
													teams : teams_message,
												// questions : questions_message,
												// issues : response["ISSUE_LIST"],
												// client_issues : response["CLIENT_ISSUE_LIST"]
												}
											}
											console.log(data);
											HTTPFactory.backendPost('StoreStaffSurvey', data);
											// }, function(error) {
											// console.log(error);
											// });
										}, function(error) {
											console.log(error);
										});
							}
						}
				]);
