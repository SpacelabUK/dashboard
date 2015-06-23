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
		function($scope, $modalInstance, $http, $modal, $q, study, FileUploader,
				MatcherFactory, HTTPFactory) {
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
				url : backend + 'StoreStakeholders'
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
						// console.log(e.target);
						// };

					};
				})(fileItem._file);
				// Closure to capture the file information.
				// Read in the image file as a data URL.
				reader.readAsBinaryString(fileItem._file);
			};
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

			function getXLSXData(blob) {
				var workbook = XLSX.read(blob, {
					type : "binary"
				});
				console.log(workbook);
				if (!workbook.SheetNames["Teams"] || !workbook.SheetNames["Questions"])
					$scope.xlsxValid = false;
				$scope.xlsxValid = true;
				return;

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

			function eql(str1, str2) {
				return str1.trim().toLowerCase() == str2.toLowerCase()
			}
			var rounds = 0;
			var days = 0;
			$scope.addDXF = function(study) {

				uploader.uploadAll();
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
			uploader.onCompleteItem = function(item, response, status, headers) {
				// console.log(JSON.stringify(response));
				MatcherFactory.openMatcherModal("team", "teams",
						response["DEPARTMENT_LIST"], response["DATABASE_TEAMS"]).result
						.then(function(teams_message) {
							MatcherFactory.openMatcherModal("question", "questions",
									response["QUESTION_LIST"], response["DATABASE_QUESTIONS"], {
										// preCompare : true,
										fromProperties : [
											'parent'
										],
										toProperties : [
											'parent'
										]
									}).result.then(function(questions_message) {

								MatcherFactory.openMatcherModal("issue", "issues",
										response["ISSUE_LIST"], response["DATABASE_ISSUES"]).result
										.then(function(issues_message) {

											console.log("success");
											console.log(teams_message);
											console.log(questions_message);
											console.log(issues_message);
											var data = {
												studyid : study.id,
												fileid : response.fileid,
												datain : {
													teams : teams_message,
													questions : questions_message,
													issues : issues_message,
													client_issues : response["CLIENT_ISSUE_LIST"],
												}
											}
											console.log(data);
											HTTPFactory.backendPost('StoreStakeholders', data);
										}, function(error) {
											console.log(error);
										});
							}, function(error) {
								console.log(error);
							});
						}, function(error) {
							console.log(error);
						});
			}
		}
]);