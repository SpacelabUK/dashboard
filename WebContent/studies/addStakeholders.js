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
		function($scope, $modalInstance, $http, $modal, $q, study, FileUploader,
				MatcherFactory, HTTPFactory, ModalFactory) {
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
				url : HTTPFactory.getBackend() + 'StoreStakeholders'
			});
			// FILTERS
			uploader.filters.push({
				name : 'customFilter',
				fn : function(item /* {File|FileLikeObject} */, options) {
					return this.queue.length < 10;
				}
			});

			function endsWith(str, suffix) {
				return str.indexOf(suffix, str.length - suffix.length) !== -1;
			}
			var dxfText = {};
			uploader.onAfterAddingFile = function(fileItem) {
				console.info(fileItem);
				// };
				// $scope.$watch('dxfFile', function(value) {
				// console.log(value);
				// console.log($scope.dxfFile);
				var reader = new FileReader();
				reader.onload = (function(theFile) {
					return function(e) {
						// Render thumbnail.
						if (!endsWith(theFile.name, 'xlsx')) {
							alert("oi! that's not an XLSX!");
							return;
						}

						// var start = 0;
						// var stop = theFile.size - 1;
						//
						// var blob = theFile.slice(start,
						// stop);
						// reader.readAsText(blob);

						// reader.onload = function(e) {
						// var lines =
						// text.split(/[\r\n]+/g);
						var data = e.target.result;

						fileItem.formData.push({
							studyid : study.id
						});
						getXLSXData(data);
						$scope.$apply();
						// console.log(e.target);
						// };

					};
				})(fileItem._file);
				// Closure to capture the file information.
				// Read in the image file as a data URL.
				reader.readAsBinaryString(fileItem._file);
			};
			function getXLSXData(blob) {
				var teamSheet = "Teams";
				var questionSheet = "Questions";
				var workbook = XLSX.read(blob, {
					type : "binary"
				});
				console.log(workbook);
				if (!workbook.SheetNames[teamSheet] ||
						!workbook.SheetNames[questionSheet])
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
				var newData = "DEPARTMENT_LIST";
				var dbData = "DATABASE_TEAMS";
				MatcherFactory.openMatcherModal("team", "teams", response[newData],
						response[dbData]).result.then(function(teams_message) {
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
								response[newData], response[dbData]).result.then(function(
								issues_message) {

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
								}
							};
							console.log(data);
							ModalFactory.openWaitModal('Storing...');
							HTTPFactory.backendPost('StoreStakeholders', data).then(
									function(response) {
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
			};
		}
]);
