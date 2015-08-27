app.controller('addStakeholdersInstance', [
		'$scope',
		'$modalInstance',
		'$http',
		'$modal',
		'$q',
		'study',
		'FileUploader',
		'MatcherFactory',
		'HTTPFactory',
		'ModalFactory',
		'TextFactory',
		function($scope, $modalInstance, $http, $modal, $q, study, FileUploader,
				MatcherFactory, HTTPFactory, ModalFactory, TextFactory) {
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
			var uploader = $scope.uploader = new FileUploader({
				url : HTTPFactory.getBackend() + 'GetStakeholderComparableData'
			});
			var dxfText = {};
			uploader.onAfterAddingFile = function(fileItem) {
				if (!endsWith(fileItem._file.name, 'xlsx')) {
					alert("oi! that's not an XLSX!");
					return;
				}
				var reader = new FileReader();
				reader.onload = function(e) {
					var data = e.target.result;
					fileItem.formData.push({
						studyid : study.id
					});
					var workbook = getWorkbook(data);
					getXLSXData(workbook);
					$scope.$apply();
				};
				reader.readAsBinaryString(fileItem._file);
			};
			/**
			 * remove stakeholder names from file (requires js-xlsx library:
			 * https://github.com/SheetJS/js-xlsx/ )
			 */
			function removeStakeholderNames(workbook) {
				var i;
				var peopleSheetName = "Stakeholder List";
				console.log(workbook);
				for (i = 0; i < workbook.SheetNames.length; i++)
					if (eql(peopleSheetName, workbook.SheetNames[i]))
						peopleSheetName = workbook.SheetNames[i];

				var peopleSheet = workbook.Sheets[peopleSheetName];
				console.log(peopleSheet);
				if (peopleSheet) {
					var nameIndex = '';
					// lets only allow 26 cells for the moment...
					var cellLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
					for (i = 0; i < cellLetters.length - 1; i++) {
						var indx = cellLetters.charAt(i);
						var headerCell = peopleSheet[indx + '1'];
						if (headerCell && eql(headerCell.v, "Name of stakeholder")) {
							nameIndex = indx;
							break;
						}
					}
					var emptiesFound = 0;
					var maxEmpties = 20;
					if (nameIndex !== '') {
						for (i = 2; i < 200 && emptiesFound < maxEmpties; i++) {
							var name = peopleSheet[nameIndex + i];
							if (name && name.v !== '') {
								delete peopleSheet[nameIndex + i];
								emptiesFound = 0;
							} else
								emptiesFound++;
						}
					}
				}
				return workbook;
			}
			/**
			 * find stakeholder names in file (requires js-xlsx library:
			 * https://github.com/SheetJS/js-xlsx/ )
			 */
			function findStakeholderNames(workbook) {
				var i;
				var people = [];
				var peopleSheetName = "Stakeholder List";
				console.log(workbook);
				for (i = 0; i < workbook.SheetNames.length; i++)
					if (eql(peopleSheetName, workbook.SheetNames[i]))
						peopleSheetName = workbook.SheetNames[i];

				var peopleSheet = workbook.Sheets[peopleSheetName];
				console.log(peopleSheet);
				if (peopleSheet) {
					var nameIndex = '';
					// lets only allow 26 cells for the moment...
					var cellLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
					for (i = 0; i < cellLetters.length - 1; i++) {
						var indx = cellLetters.charAt(i);
						var headerCell = peopleSheet[indx + '1'];
						if (headerCell && eql(headerCell.v, "Name of stakeholder")) {
							nameIndex = indx;
							break;
						}
					}
					var emptiesFound = 0;
					var maxEmpties = 20;
					if (nameIndex !== '') {
						for (i = 2; i < 200 && emptiesFound < maxEmpties; i++) {
							var name = peopleSheet[nameIndex + i];
							if (name && name.v !== '') {
								people.push(name.v);
								emptiesFound = 0;
							} else
								emptiesFound++;
						}
					}
				}
				return people;
			}
			function getWorkbook(blob) {
				return XLSX.read(blob, {
					type : "binary"
				});
			}
			function getXLSXData(workbook) {
				var i;
				var teamSheet = "Teams";
				var questionSheet = "Questions";
				for (i = 0; i < workbook.SheetNames.length; i++) {
					if (eql(teamSheet, workbook.SheetNames[i]))
						teamSheet = workbook.SheetNames[i];
					else if (eql(questionSheet, workbook.SheetNames[i]))
						questionSheet = workbook.SheetNames[i];
				}

				if (!workbook.Sheets[teamSheet] || !workbook.Sheets[questionSheet])
					$scope.xlsxValid = false;
				$scope.xlsxValid = true;
				return;

			}

			var rounds = 0;
			var days = 0;
			$scope.attach = function(study) {
				ModalFactory.openWaitModal('Getting Validation data...');
				uploader.uploadAll();
			};
			uploader.onCompleteItem = function(item, response, status, headers) {
				// console.log(JSON.stringify(response));
				ModalFactory.closeWaitModal();
				if (status === 400) {
					ModalFactory.openErrorModal(response);
					return;
				}
				var selectStaffFileDescription = "Stakeholder names were found " + //
				"in the file, select a staff list file (vna) to match them to " + //
				"their id on the survey";
				ModalFactory.openSelectFileModal("Select staff list file",
						selectStaffFileDescription, ".vna").result.then(function(
						staffListUploader) {
					var reader = new FileReader();
					reader.onload = function(e) {
						var data = e.target.result;
						var vnadata = TextFactory.getVNAData(data);
						var obj = TextFactory.extractVNARowsUnderHeaders(vnadata.node_data,
								[
										"name", "id"
								]);
						var j;
						for (j = 0; j < obj.length; j++) {
							obj[j].alias = obj[j].name;
							delete obj[j].name;
						}
						var newData = "STAKEHOLDER_LIST";
						MatcherFactory.openMatcherModal("stakeholder", "stakeholders",
								response[newData], obj, {
									prematch : 'ignorecase',
									fromPrematch : 'alias',
									toPrematch : 'alias',
									allowManualEnty : true,
									toMatchProperty : {
										prompt : 'Enter ID on survey',
										name : 'id',
										type : 'int'
									}
								}).result.then(function(stakeholder_message) {
							console.log(stakeholder_message);
							var newData = "DEPARTMENT_LIST";
							var dbData = "DATABASE_TEAMS";
							MatcherFactory.openMatcherModal("team", "teams",
									response[newData], response[dbData]).result.then(function(
									teams_message) {
								var newData = "QUESTION_LIST";
								var dbData = "DATABASE_QUESTIONS";
								MatcherFactory.openMatcherModal("question", "questions",
										response[newData], response[dbData], {
											// preCompare : true,
											fromProperties : [
												'parent'
											],
											toProperties : [
												'parent'
											]
										}).result.then(function(questions_message) {

									var newData = "ISSUE_LIST";
									var dbData = "DATABASE_ISSUES";
									MatcherFactory.openMatcherModal("issue", "issues",
											response[newData], response[dbData]).result.then(
											function(issues_message) {

												console.log("success");
												console.log(teams_message);
												console.log(questions_message);
												console.log(issues_message);
												var clientIssueListKey = "CLIENT_ISSUE_LIST";
												
												var data = {
													studyid : study.id,
													fileid : response.fileid,
													datain : {
														teams : teams_message,
														questions : questions_message,
														issues : issues_message,
														client_issues : response[clientIssueListKey],
														stakeholders : stakeholder_message
													}
												};
												console.log(data);
												ModalFactory.openWaitModal('Storing...');
												HTTPFactory.backendPost('StoreStakeholders', data)
														.then(function(response) {
															ModalFactory.modifyWaitMessage("Success!");
															setTimeout(function() {
																ModalFactory.closeWaitModal();
																$modalInstance.close();
															}, 2000);
														}, function(error) {
															ModalFactory.closeWaitModal();
															ModalFactory.openErrorModal(response);
														});
											}, function(error) {
												console.log(error);
											});
								}, function(error) {
									console.log(error);
								});
							}, function(error) {
								console.log(error);
							});
						}, function(error) {
							console.log(error);
						});
					};
					reader.readAsText(staffListUploader.queue[0]._file);
				}, function(error) {
					console.log(error);
				});
			};
		}
]);
