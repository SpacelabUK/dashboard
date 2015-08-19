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
						'ModalFactory',
						function($scope, $modalInstance, $http, $modal, $q, study,
								FileUploader, PlanFactory, HTTPFactory, MatcherFactory,
								ModalFactory) {
							"use strict";
							$scope.study = study;
							$scope.predicate = 'building';
							$scope.project = {};
							var date = new Date().getFullYear();
							$scope.project.id = date.toString().substring(2);
							$scope.project.name = '';
							$scope.cancel = function() {
								$modalInstance.dismiss('cancel');
							};
							$scope.layerpredicate = 'name';

							var vnauploader = $scope.vnauploader = new FileUploader({
								url : backend + 'GetStaffSurveyComparableData'
							});
							vnauploader.filters.push({
								name : 'customFilter',
								fn : function(item /* {File|FileLikeObject} */, options) {
									return this.queue.length < 10;
								}
							});

							var dxfText = {};
							vnauploader.onAfterAddingFile = function(fileItem) {
								var reader = new FileReader();
								reader.onload = (function(theFile) {
									return function(e) {
										if (!endsWith(theFile.name, 'vna')) {
											alert("oi! that's not a VNA!");
											return;
										}
										reader.readAsText(theFile);
										// fileItem.formData.push({
										// studyid : study.id
										// });
										reader.onload = function(e) {
											var vna = e.target.result;
											getVNAData(vna, false);

										};
									};
								})(fileItem._file);
								reader.readAsDataURL(fileItem._file);
							};
							$scope.searchcomment = '';
							$scope.foundspaces = [];

							/**
							 * Parses the vna file to display its contents on the modal. If
							 * splitFile is true it will also split the file in two, sensitive
							 * (name, email) and clear data (the rest)
							 */
							function getVNAData(text, splitFile) {
								var i, j;
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
								for (i = 0; i < lines.length; i++) {
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
								headers = node_data.headers.split(' ');
								var nameColumn = -1;
								var emailColumn = -1;
								var idColumn = -1;
								var completedColumn = -1;
								var departmentColumn = -1;
								var positionColumn = -1;
								$scope.questions = [];
								var clearHeaders = [];
								var sensHeaders = [];
								for (i = 0; i < headers.length; i++) {
									if (headers[i].toUpperCase() == 'NAME') {
										nameColumn = i;
										sensHeaders.push(i);
									} else if (headers[i].toUpperCase() == 'COMPLETED') {
										completedColumn = i;
										clearHeaders.push(i);
									} else if (headers[i].toUpperCase() == 'DEPARTMENT') {
										departmentColumn = i;
										clearHeaders.push(i);
									} else if (headers[i].toUpperCase() == 'POSITION') {
										positionColumn = i;
										clearHeaders.push(i);
									} else if (headers[i].toUpperCase() == 'EMAIL') {
										emailColumn = i;
										sensHeaders.push(i);
									} else if (headers[i].toUpperCase() == 'ID') {
										idColumn = i;
										clearHeaders.push(i);
										sensHeaders.push(i);
									} else {
										$scope.questions.push({
											name : headers[i],
											id : i,
											answered : 0
										});
										clearHeaders.push(i);
									}
								}
								$scope.staff = [];
								$scope.completed = 0;
								var clearRowData = [];
								var sensRowData = [];
								var clearLine, sensLine;
								if (splitFile) {
									clearRowData.push('*node data\n');
									clearLine = '';
									for (j = 0; j < clearHeaders.length; j++)
										clearLine += headers[clearHeaders[j]] + ' ';
									clearLine = clearLine.trim();
									clearLine += '\n';
									clearRowData.push(clearLine);
									sensLine = '';
									for (j = 0; j < sensHeaders.length; j++)
										sensLine += headers[sensHeaders[j]] + '\t';
									sensLine = sensLine.trim();
									sensLine += '\n';
									sensRowData.push(sensLine);
								}
								for (i = 0; i < node_data.rows.length; i++) {
									var line = node_data.rows[i].slice(1,
											node_data.rows[i].length - 1).split("\" \"");
									var completed = line[completedColumn].toUpperCase() == 'COMPLETE';
									if (completed)
										$scope.completed++;
									for (j = 0; j < $scope.questions.length; j++) {
										if (line[$scope.questions[j].id].trim().length > 0)
											$scope.questions[j].answered++;
									}
									var pp = {
										id : line[idColumn]
									};
									if (nameColumn != -1)
										pp.name = line[nameColumn];
									if (departmentColumn != -1)
										pp.department = line[departmentColumn];
									if (positionColumn != -1)
										pp.position = line[positionColumn];
									if (completedColumn != -1)
										pp.completed = line[completedColumn];
									$scope.staff.push(pp);
									for (j = 0; j < $scope.questions.length; j++) {
										if (line[$scope.questions[j].id].trim().length > 0)
											$scope.questions[j].answered = (($scope.questions[j].answered / $scope.staff.length) * 100) | 0;
									}
									if (splitFile) {
										// heavy operation, do only if it is requested
										if (nameColumn != -1)
											// skip *dummy people
											if (line[nameColumn].slice(0, 1) === '*')
												continue;
										clearLine = '';
										for (j = 0; j < clearHeaders.length; j++)
											clearLine += '"' + line[clearHeaders[j]] + '" ';
										clearLine = clearLine.trim();
										clearLine += '\n';
										clearRowData.push(clearLine);
										sensLine = '';
										for (j = 0; j < sensHeaders.length; j++)
											sensLine += '"' + line[sensHeaders[j]] + '"\t';
										sensLine = sensLine.trim();
										sensLine += '\n';
										sensRowData.push(sensLine);
									}
								}

								if (splitFile) {
									clearRowData.push('*tie data\n');
									clearRowData.push(tie_data.headers + '\n');
									for (i = 0; i < tie_data.rows.length; i++)
										clearRowData.push(tie_data.rows[i] + '\n');
								}
								$scope.$apply();
								if (splitFile)
									return {
										clearRowData : clearRowData,
										sensRowData : sensRowData
									};
								return;

							}
							$scope.getCompleted = function() {
								if ($scope.completed && $scope.staff && $scope.staff.length > 0)
									return (($scope.completed / $scope.staff.length) * 100) | 0;
								else
									return 0;
							};
							$scope.dataInvalid = function() {
								return !$scope.staff || $scope.staff.length < 1 ||
										!$scope.questions || $scope.questions.length < 1;
							};
							$scope.selectAllSpaces = function() {
								for (var i = 0; i < $scope.foundspaces.length; i++)
									$scope.foundspaces[i].selected = true;
							};
							$scope.getSpaceValidityTooltip = function(space) {
								if (!space.valid)
									return 'Space "' + space.alias +
											'" does not exist in the database!';
							};
							$scope.noSelectedSpaces = function() {
								return $scope.foundspaces.length === 0;
							};
							function openConfirmModal(message, okText, cancelText) {
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
							var breakStaffFile = function(fileItem) {
								var deferred = $q.defer();
								var reader = new FileReader();
								reader.onload = (function(theFile) {
									return function(e) {
										reader.readAsText(theFile);
										reader.onload = function(e) {
											var vna = e.target.result;
											var newFileData = getVNAData(vna, true);
											deferred.resolve(newFileData);
										};
									};
								})(fileItem._file);
								reader.readAsDataURL(fileItem._file);
								return deferred.promise;
							};
							$scope.attach = function(study) {
								ModalFactory.openWaitModal('Getting Validation data...');
								vnauploader.queue[0].formData.push({
									studyid : study.id
								});
								breakStaffFile(vnauploader.queue[0]).then(
										function(newFileData) {
											var clear = new Blob(newFileData.clearRowData, {
												type : vnauploader.queue[0]._file.type
											});
											vnauploader.queue[0]._file = clear;
											vnauploader.queue[0].file.size = clear.size;
											$scope.sensData = newFileData.sensRowData;
											vnauploader.uploadAll();
										});
							};
							function sleep(milliseconds) {
								var start = new Date().getTime();
								for (var i = 0; i < 1e7; i++) {
									if ((new Date().getTime() - start) > milliseconds) {
										break;
									}
								}
							}
							vnauploader.onCompleteItem = function(item, response, status,
									headers) {
								ModalFactory.closeWaitModal();
								var newData = "DEPARTMENT_LIST";
								var dbData = "DATABASE_TEAMS";
								if (!(newData in response) || !(dbData in response))
									return;
								MatcherFactory.openMatcherModal("team", "teams",
										response[newData], response[dbData]).result.then(function(
										teams_message) {
									var newData = "DEPARTMENT_LIST";
									var dbData = "DATABASE_TEAMS";
									if (!(newData in response) || !(dbData in response))
										return;
									MatcherFactory.openMatcherModal("floor", "floors",
											response[newData], response[dbData]
									// , {
									// // preCompare : true,
									// fromProperties : [
									// 'parent'
									// ],
									// toProperties : [
									// 'parent'
									// ]
									// }
									).result.then(function(floors_message) {
										ModalFactory.openWaitModal("Storing to database...");
										var data = {
											studyid : study.id,
											fileid : response.fileid,
											datain : {
												teams : teams_message,
												floors : floors_message,
											// questions : questions_message,
											// issues : response["ISSUE_LIST"],
											// client_issues :
											// response["CLIENT_ISSUE_LIST"]
											}
										};
										// console.log(data);
										var promise = HTTPFactory.backendPost('StoreStaffSurvey',
												data);

										var breakPoint = 100;
										var updateInterval = 500; // milliseconds
										var update = function(depth) {
											$http.get(HTTPFactory.getBackend() + "StoreStaffSurvey")
													.then(
															function(response) {
																if (response.status === 202 &&
																		depth < breakPoint && response.data) {
																	ModalFactory.modifyWaitMessage(
																			response.data.text,
																			response.data.progress);
																	sleep(updateInterval);
																	update(depth + 1);
																}
															}, function(error) {
																// exit the recursion
															});
										};
										setTimeout(function() {
											update(0);
										}, updateInterval * 0.5);
										promise.then(function(response) {
											console.log(response);
											ModalFactory.closeWaitModal();
											var modalInstance = $modal.open({
												templateUrl : //
												'studies/afterStaffSurveyUpload.html',
												backdrop : 'static',
												keyboard : 'false',
												size : 'sm',
												controller : 'AfterStaffSurveyUploadModalCtrl',
												resolve : {
													"sensData" : function() {
														return $scope.sensData;
													}
												}
											});
											modalInstance.result.then(function() {
												$modalInstance.close('done');
											});

										}, function(error) {
											console.log(response);
										});
									}, function(error) {
										console.log(error);
									});
								}, function(error) {
									console.log(error);
								});
							};
						}
				]);

app.controller('AfterStaffSurveyUploadModalCtrl', [
		'$scope', '$modalInstance', 'sensData',
		function($scope, $modalInstance, sensData) {
			var blob = new Blob(sensData, {
				type : "octet/stream"
			});
			$scope.save = function() {
				saveAs(blob, "sensData.tsv");
			};

			$scope.ok = function() {
				$modalInstance.close('ok');
			};
		}
]);
