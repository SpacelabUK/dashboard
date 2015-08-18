"use strict";

/*
 * Some basic String functions used throughout
 */
function eql(str1, str2) {
	return str1.trim().toLowerCase() == str2.toLowerCase()
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

var backend = "/tomcutter/"
var app = angular.module('Dashboard', [
		'ui.bootstrap', 'ngCookies', 'ui.router', 'angularFileUpload', 'flow',
		'gridster'
], function($httpProvider) {
});
// // hack to allow downloading js-generated blob objects
// app
// .config([
// '$compileProvider',
// function($compileProvider) {
// var oldWhiteList = $compileProvider.imgSrcSanitizationWhitelist();
// $compileProvider
// .imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:image\//);
// }
// ]);
app
		.directive(
				'loading',
				function() {
					return {
						restrict : 'AE',
						replace : 'false',
						template : '<div class="loading"><div class="double-bounce1"></div><div class="double-bounce2"></div></div>'
					}
				});
app.directive('mainpage', function() {
	return {
		restrict : 'E',
		replace : 'true',
		templateUrl : 'main.html'
	}
});
app.controller('AlertsCtrl', function($scope) {

});
app.factory('projectFactory',
		function($q, $http) {
			var projects = [];
			var devices = [];
			var functions = [];
			var openStudies = [];

			fetch = function(url) {
				var deferred = $q.defer(), httpPromise = $http.get(url);

				httpPromise.then(function(response) {
					deferred.resolve(response);
				}, function(error) {
					console.error(error);
				});
				return httpPromise;
			}
			var updateStudies = function(project, studies) {
				if (!project.studies)
					project.studies = [];
				while (project.studies.length > 0)
					project.studies.pop();
				for (var i = 0; i < studies.length; i++)
					project.studies.push(studies[i]);
			}
			var updateStudyParts = function(study, parts) {
				if (!study.parts)
					study.parts = [];
				while (study.parts.length > 0)
					study.parts.pop();
				for (var i = 0; i < parts.length; i++) {
					parts[i].type = 'observation';
					study.parts.push(parts[i]);
				}
			}
			var pushNewStudy = function(project) {
				if (!project.studies)
					project.studies = [];
				// for (var i = 0; i < project.studies.length; i++) {
				// if (project.studies[i]['id'] >= largestID)
				// largestID = project.studies[i]['id'] + 1;
				// }

				var data = {
					'project_id' : project.id,
					'status' : 'open'
				};
				var deferred = $q.defer(), httpPromise = $http.post(backend +
						'Insert?t=study', data);

				httpPromise.then(function(response) {
					// console.log(response);
					deferred.resolve(response);
				}, function(error) {
					console.error(error);
				});

				return deferred.promise;
			}
			var pushNewStudyPart = function(study, type) {
				if (!study.parts)
					study.parts = [];
				var data = {
					'study_id' : study.id,
					'type' : type
				};
				var deferred = $q.defer(), httpPromise = $http.post(backend +
						'Insert?t=study_part', data);
				httpPromise.then(function(response) {
					deferred.resolve(response);
				}, function(error) {
					console.error(error);
				});

				return deferred.promise;
			}
			var pub = {
				refreshProjects : function() {
					fetch(backend + 'GetAll?t=projects').then(function(response) {
						var result = response.data;
						if (result) {
							while (projects.length > 0)
								projects.pop();
							for (var i = 0; i < result.length; i++) {
								projects.push(result[i]);
								pub.refreshStudies(result[i]);
							}
						}
					}, function(error) {
						console.error(error);
					});
				},
				refreshDevices : function() {
					fetch(backend + 'GetAll?t=devices').then(function(response) {
						var result = response.data;
						if (result) {
							while (devices.length > 0)
								devices.pop();
							for (var i = 0; i < result.length; i++) {
								devices.push(result[i]);
							}
						}
					}, function(error) {
						console.error(error);
					});
				},
				refreshSpatialFunctions : function() {
					fetch(backend + 'GetAll?t=spatial_functions').then(
							function(response) {
								var result = response.data;
								if (result) {
									while (functions.length > 0)
										functions.pop();
									for (var i = 0; i < result.length; i++) {
										functions.push(result[i]);
									}
								}
							}, function(error) {
								console.error(error);
							});
				},
				refreshStudies : function(project) {
					fetch(backend + 'GetAll?t=studies&projectid=' + project.id).then(
							function(response) {
								if (response.data)
									updateStudies(project, response.data);
							}, function(error) {
								console.error(error);
							});
				},
				refreshOpenStudies : function() {
					var promise = fetch(backend + 'GetAll?t=openstudies');
					promise.then(function(response) {
						var result = response.data;
						if (result) {
							while (openStudies.length > 0)
								openStudies.pop();
							for (var i = 0; i < result.length; i++) {
								result[i].parts = [];
								openStudies.push(result[i]);
							}
						}
					}, function(error) {
						console.error(error);
					});
					return promise;
				},
				refreshStudyParts : function(study) {
					var promise = fetch(backend + 'GetAll?t=study_parts&studyid=' +
							study.id);
					promise.then(function(response) {
						if (response.data)
							updateStudyParts(study, response.data);
					}, function(error) {
						console.error(error);
					});
					return promise;
				},
				getProjects : function() {
					return projects;
				},
				getDevices : function() {
					return devices;
				},
				getSpatialFunctions : function() {
					return functions;
				},
				getOpenStudies : function() {
					return openStudies;
				},
				addProject : function(id, name) {
					var data = {
						'id' : id,
						'name' : name
					};
					var deferred = $q.defer(), httpPromise = $http.post(backend +
							'Insert?t=project', data);

					httpPromise.then(function(response) {
						deferred.resolve(response);
					}, function(error) {
						console.error(error);
					});

					return deferred.promise;
				},
				addDevice : function(name) {
					var data = {
						'name' : name
					};
					var deferred = $q.defer(), httpPromise = $http.post(backend +
							'Insert?t=device', data);

					httpPromise.then(function(response) {
						deferred.resolve(response);
					}, function(error) {
						console.error(error);
					});

					return deferred.promise;
				},
				addSpatialFunction : function(alias, name) {
					var data = {
						'alias' : alias,
						'name' : name
					};
					var deferred = $q.defer(), httpPromise = $http.post(backend +
							'Insert?t=spatial_function', data);
					httpPromise.then(function(response) {
						deferred.resolve(response);
					}, function(error) {
						console.error(error);
					});

					return deferred.promise;
				},
				addStudy : function(project) {
					fetch(backend + 'GetAll?t=studies&projectid=' + project.id).then(
							function(response) {
								if (response.data) {
									// updateStudies(project, response.data);
									pushNewStudy(project).then(function(response) {
										console.log(response);
										pub.refreshStudies(project);
									}, function(error) {
										console.error(error);
									});
								}
							}, function(error) {
								console.error(error);
							});
				},
				addStudyPart : function(study, type) {
					console.log(type);
					fetch(backend + 'GetAll?t=study_parts&studyid=' + study.id).then(
							function(response) {
								if (response) {
									console.log(study);
									// updateStudyParts(study, response.data);
									pushNewStudyPart(study, type).then(function(response) {
										pub.refreshStudyParts(study);
									}, function(error) {
										console.error(error);
									});
								}
							}, function(error) {
								console.error(error);
							});
				}
			};
			return pub;
		});

app.factory('studyFactory', function($q, $http) {
	var study;
	var pub = {

	}
	return pub;
});
app.controller('prjCtrl', function($scope, $modal, projectFactory) {
	$scope.projects = projectFactory.getProjects();
	// $scope.projects.displayStudies = false;
	$scope.predicate = 'id'
	projectFactory.refreshProjects();
	// $scope.$watch('projects', function() {
	// alert('hey, projects has changed!');
	// });
	$scope.addProject = function() {
		$modal.open({
			templateUrl : 'addProject.html',
			controller : 'addProjectInstance'
		});
	}
	$scope.addStudy = function(project) {
		projectFactory.addStudy(project);
	}

});
app.controller('devCtrl', function($scope, $modal, projectFactory) {
	$scope.devices = projectFactory.getDevices();
	// $scope.projects.displayStudies = false;
	$scope.predicate = 'id'
	projectFactory.refreshDevices();
	// $scope.$watch('projects', function() {
	// alert('hey, projects has changed!');
	// });
	$scope.addDevice = function() {
		$modal.open({
			templateUrl : 'addDevice.html',
			controller : 'addDeviceInstance'
		});
	}

});
app.controller('spFuncCtrl', function($scope, $modal, projectFactory) {
	$scope.functions = projectFactory.getSpatialFunctions();
	// $scope.projects.displayStudies = false;
	$scope.predicate = 'id'
	projectFactory.refreshSpatialFunctions();
	// $scope.$watch('projects', function() {
	// alert('hey, projects has changed!');
	// });
	$scope.addDevice = function() {
		$modal.open({
			templateUrl : 'addSpatialFunction.html',
			controller : 'addSpatialFunctionInstance'
		});
	}

});

app.factory('fetching', function($q, $http) {
	var fetching = {};
	var pub = {
		is : function(type, id) {
			return fetching[type] && fetching[type][id];
		},
		set : function(type, id) {
			if (!fetching[type])
				fetching[type] = {};
			fetching[type][id] = 1;
		},
		unset : function(type, id) {
			if (fetching[type] && fetching[type][id]) {
				delete fetching[type][id];
			}
		}
	}
	return pub;
});
app.controller('opnStdCtrl', function($scope, $modal, projectFactory,
		RoundModelFactory, fetching) {
	$scope.fetching = fetching;
	$scope.studies = projectFactory.getOpenStudies();
	// $scope.projects.displayStudies = false;
	$scope.predicate = 'id';
	projectFactory.refreshOpenStudies().then(function() {
		// $scope.fetching.unset();

		angular.forEach($scope.studies, function(study) {

			fetching.set('stps', study.id);
			projectFactory.refreshStudyParts(study).then(function() {
				fetching.unset('stps', study.id);
			});
		});
	});
	$scope.addObservation = function(study) {
		projectFactory.addStudyPart(study, 'observation');
	}

	$scope.addPlans = function(study) {
		$modal.open({
			templateUrl : 'studies/plans/addPlans.html',
			controller : 'addPlansInstance',
			resolve : {
				study : function() {
					return study;
				}
			}
		});
	}
	// $scope.fetchingObservationRounds = function(id) {
	// return fetching.is('obs', id);
	// }
	$scope.setRoundModel = function(observation) {
		fetching.set('obs', observation.id);
		RoundModelFactory.getRoundModel(observation).then(function(response) {
			var data = response.data[0];
			if (data) {
				// var startdate = new Date();
				// startdate.parse(data['startdate']);
				// var enddate = new Date();
				// enddate.parse(data['enddate']);
				if (!observation.roundModel) {
					observation.roundModel = {
						observationid : observation.id,
						type : 'date_round_matrices'
					};
				}
				console.log(response);
				observation.roundModel.startdate = Date.parse(data['start_date']);
				observation.roundModel.enddate = Date.parse(data['end_date']);
				observation.roundModel.duration = 60;// data['roundduration'];
			}
			// console.log(observation);
			fetching.unset('obs', observation.id);
			$modal.open({
				templateUrl : 'studies/observation/setRoundModel.html',
				controller : 'setRoundModel',
				size : 'lg',
				resolve : {
					observation : function() {
						return observation;
					}
				}
			});
		}, function(error) {
			console.log(error);
		});

	}
	$scope.addObservationData = function(study, observation) {
		$modal.open({
			templateUrl : 'studies/observation/addObservationData.html',
			controller : 'addObservationDataInstance',
			resolve : {
				study : function() {
					return study;
				},
				observation : function() {
					return observation;
				}
			}
		});
	}
	$scope.addPolygons = function(study) {
		$modal.open({
			templateUrl : 'studies/addPolygons.html',
			controller : 'addPolygonsInstance',
			windowClass : 'addPolys',
			resolve : {
				study : function() {
					return study;
				}
			}
		});
	}
	$scope.addDepthmap = function(study) {
		$modal.open({
			templateUrl : 'studies/addDepthmap.html',
			controller : 'addDepthmapInstance',
			windowClass : 'addDepthmap',
			resolve : {
				study : function() {
					return study;
				}
			}
		});
	}
	$scope.addStaffSurvey = function(study) {
		$modal.open({
			templateUrl : 'studies/addStaffSurvey.html',
			controller : 'addStaffSurveyInstance',
			windowClass : 'addStaffSurvey',
			resolve : {
				study : function() {
					return study;
				}
			}
		});
	}
	$scope.addStakeholders = function(study) {
		$modal.open({
			templateUrl : 'studies/addStakeholders.html',
			controller : 'addStakeholdersInstance',
			windowClass : 'addStakeholders',
			resolve : {
				study : function() {
					return study;
				}
			}
		});
	}
});

// app.factory('MatcherFactory', function($modal) {
// var pub = {
// openMatcherModal : function(type, types, fromElements, toElements) {
app.controller("addObservationDataInstance", function($scope, $modalInstance,
		FileUploader, study, observation, MatcherFactory, HTTPFactory) {
	console.log('observid ' + observation.id);
	var uploader = $scope.uploader = new FileUploader({
		// url : 'studies/observation/uploadObservationData.php',
		url : '/tomcutter/StoreObservationData',
		formData : [
			{
				studyid : study.id,
				observationid : observation.id
			}
		],
	});

	// FILTERS

	uploader.filters.push({
		name : 'customFilter',
		fn : function(item /* {File|FileLikeObject} */, options) {
			return this.queue.length < 10;
		}
	});

	// CALLBACKS

	// uploader.onWhenAddingFileFailed = function(
	// item /* {File|FileLikeObject} */, filter, options) {
	// console.info('onWhenAddingFileFailed', item, filter, options);
	// };
	// uploader.onAfterAddingFile = function(fileItem) {
	// console.info('onAfterAddingFile', fileItem);
	// };
	// uploader.onAfterAddingAll = function(addedFileItems) {
	// console.info('onAfterAddingAll', addedFileItems);
	// };
	// uploader.onBeforeUploadItem = function(item) {
	// console.info('onBeforeUploadItem', item);
	// };
	// uploader.onProgressItem = function(fileItem, progress) {
	// console.info('onProgressItem', fileItem, progress);
	// };
	// uploader.onProgressAll = function(progress) {
	// console.info('onProgressAll', progress);
	// };
	// uploader.onSuccessItem = function(fileItem, response, status, headers) {
	// console.info('onSuccessItem', fileItem, response, status, headers);
	// };
	// uploader.onErrorItem = function(fileItem, response, status, headers) {
	// console.info('onErrorItem', fileItem, response, status, headers);
	// };
	// uploader.onCancelItem = function(fileItem, response, status, headers) {
	// console.info('onCancelItem', fileItem, response, status, headers);
	// };
	uploader.onCompleteItem = function(fileItem, response, status, headers) {
		// console.info('onCompleteItem', fileItem, response, status, headers);
		console.info(response);
		MatcherFactory.openMatcherModal("space", "spaces", response.spaces,
				response.spacesInDB).result.then(function(dialogResponse) {
			console.log(dialogResponse);
			HTTPFactory.backendPost("StoreObservationData", {
				observationid : observation.id,
				fileid : response.fileid,
				spaces : dialogResponse
			});
		}, function(error) {
			console.log(error);
		});

	};
	// uploader.onCompleteAll = function() {
	// console.info('onCompleteAll');
	// };

	console.info('uploader', uploader);

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
});
// app.controller("addPolygonsInstance", function($scope, $modalInstance,
// FileUploader, study) {
// var uploader = $scope.uploader = new FileUploader({
// url : 'studies/uploadPolygons.php',
// formData : [ {
// studyid : study.id
// } ],
// });
//
// // FILTERS
//
// uploader.filters.push({
// name : 'customFilter',
// fn : function(item /* {File|FileLikeObject} */, options) {
// return this.queue.length < 10;
// }
// });
//
// // CALLBACKS
//
// uploader.onWhenAddingFileFailed = function(
// item /* {File|FileLikeObject} */, filter, options) {
// console.info('onWhenAddingFileFailed', item, filter, options);
// };
// uploader.onAfterAddingFile = function(fileItem) {
// console.info('onAfterAddingFile', fileItem);
// };
// uploader.onAfterAddingAll = function(addedFileItems) {
// console.info('onAfterAddingAll', addedFileItems);
// };
// uploader.onBeforeUploadItem = function(item) {
// console.info('onBeforeUploadItem', item);
// };
// uploader.onProgressItem = function(fileItem, progress) {
// console.info('onProgressItem', fileItem, progress);
// };
// uploader.onProgressAll = function(progress) {
// console.info('onProgressAll', progress);
// };
// uploader.onSuccessItem = function(fileItem, response, status, headers) {
// console.info('onSuccessItem', fileItem, response, status, headers);
// };
// uploader.onErrorItem = function(fileItem, response, status, headers) {
// console.info('onErrorItem', fileItem, response, status, headers);
// };
// uploader.onCancelItem = function(fileItem, response, status, headers) {
// console.info('onCancelItem', fileItem, response, status, headers);
// };
// uploader.onCompleteItem = function(fileItem, response, status, headers) {
// console.info('onCompleteItem', fileItem, response, status, headers);
// };
// uploader.onCompleteAll = function() {
// console.info('onCompleteAll');
// };
//
// console.info('uploader', uploader);
//
// $scope.cancel = function() {
// $modalInstance.dismiss('cancel');
// };
// });
app.controller('StdCtrlr', [
		'$scope', '$stateParams', '$http', function($scope, $stateParams, $http) {

			$scope.id = $stateParams.studyid;
			console.log($scope.id);
			var scope = $rootScope.$new();
			scope.params = {
				studyid : '3'
			};
			$scope.addPlans = function() {
				$modal.open({
					templateUrl : 'addPlans.html',
					controller : 'addPlansInstance',
					// scope: scope
					resolve : {
						studyid : function() {
							return $scope.id;
						}
					}
				});
			}
		}
]);

app.controller("addProjectInstance", function($scope, $modalInstance,
		projectFactory) {
	$scope.project = {};
	var date = new Date().getFullYear();
	$scope.project.id = date.toString().substring(2);
	$scope.project.name = '';
	$scope.add = function() {
		if ($scope.project.name.length > 0 && $scope.project.id.length > 3) {
			// $modalInstance.close($scope.selected.item);
			projectFactory.addProject($scope.project.id, $scope.project.name).then(
					function(response) {
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
});
app.controller("addDeviceInstance", function($scope, $modalInstance,
		projectFactory) {
	$scope.device = {
		name : ''
	};
	$scope.add = function() {
		if ($scope.device.name.length > 0) {
			projectFactory.addDevice($scope.device.name).then(function(response) {
				// console.log(response);
				projectFactory.refreshDevices();
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
});
app.controller("addSpatialFunctionInstance", function($scope, $modalInstance,
		projectFactory) {
	$scope.func = {
		alias : '',
		name : ''
	};
	$scope.add = function() {
		if ($scope.func.name.length > 0) {
			projectFactory.addSpatialFunction($scope.func.alias, $scope.func.name)
					.then(function(response) {
						// console.log(response);
						projectFactory.refreshSpatialFunctions();
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
});
// define(['angular', 'app', 'require', './services/site-definition-service'],
// function (angular, app, requirejs) {
// 
// 'use strict';
// app.service('LazyLoader', ['$cacheFactory', '$http', '$rootScope', '$q',
// 'SiteDefinitionService',
// function (cacheFactory, http, rootScope, q, siteDefService) {
// var self = this;
// 
// this.loadDependencies = function(stateName) {
// 
// var deferred = q.defer();
// http.get('rest/sitedefinition/' + stateName).success(function (data, status,
// headers, config) {
// var deps = data.dependencies; // array
// if(deps && deps instanceof Array) {
// loadDependenciesFromArray(deps, deferred);
// } else {
// deferred.resolve();
// }
// });
// 
// return deferred.promise();
// }
// 
// this.loadDependenciesFromArray = function(depArr, deferred){
// requirejs(depArr, function() {
// deferred.resolve();
// });
// 
// }]);
// });
app.config(function($stateProvider, $urlRouterProvider) {
	//
	// For any unmatched url, redirect to /state1
	$urlRouterProvider.otherwise("/");
	// $urlRouterProvider.when('study',{
	// templateUrl: 'studies/study.html',
	// resolve: resolveController('studies/study.js')
	// });
	//
	// Now set up the states
	$stateProvider.state('main', {
		url : "/",
		templateUrl : "main.html"
	}).state('state1', {
		url : "/state1",
		templateUrl : "../observations/progress/index.php",
		// for urls like this: /state1/:partyID/:partyLocation
		controller : function($scope, $stateParams) {
			// get the id
			$scope.id = $stateParams.partyID;

			// get the location
			$scope.location = $stateParams.partyLocation;
		}
	}).state('observationssetup', {
		url : "/observations/setup",
		templateUrl : "../observations/setup/index.html",
		// for urls like this: /state1/:partyID/:partyLocation
		controller : function($scope, $stateParams) {
			// get the id
			$scope.id = $stateParams.partyID;

			// get the location
			$scope.location = $stateParams.partyLocation;
		}
	}).state('observationsprogress', {
		url : "/observations/progress",
		templateUrl : "../observations/progress/index.php",
		// for urls like this: /state1/:partyID/:partyLocation
		controller : function($scope, $stateParams) {
			// get the id
			$scope.id = $stateParams.partyID;

			// get the location
			$scope.location = $stateParams.partyLocation;
		}
	}).state('projects', {
		url : "/projects",
		templateUrl : "projects.html",
		// for urls like this: /state1/:partyID/:partyLocation
		controller : function($scope, $stateParams) {
			// get the id
			$scope.id = $stateParams.partyID;

			// get the location
			$scope.location = $stateParams.partyLocation;
		}
	}).state('devices', {
		url : "/devices",
		templateUrl : "devices.html",
		// for urls like this: /state1/:partyID/:partyLocation
		controller : 'devCtrl'
	}).state('spatialfunctions', {
		url : "/spatialfunctions",
		templateUrl : "spatialfunctions.html",
		// for urls like this: /state1/:partyID/:partyLocation
		controller : 'spFuncCtrl'
	}).state('studies', {
		url : "/studies", //
		templateUrl : "studies/index.html",
		controller : 'opnStdCtrl'
	}).state('study', {
		url : "/studies/view/{studyid}", //
		templateUrl : "studies/study.html",
		controller : 'MainStudyCtrl'
	}).state('studyissues', {
		url : "/studies/issues/{studyid}/{viewAlias}", //
		templateUrl : "studies/studyIssues.html",
		controller : 'StudyIssuesCtrl'
	}).state('allstudyissues', {
		url : "/studies/issue/{issue}/{studyid}", //
		templateUrl : "studies/allStudyIssues.html",
		controller : 'AllStudyIssuesCtrl'
	}).state('comparestudies', {
		url : "/studies/compare/{studyid}", //
		templateUrl : "studies/study.compare.html",
		controller : 'StdCompareCtrl'
	}).state('observation', {
		url : "/observation/{part_id}",
		templateUrl : "studies/observation/observation.html",
		controller : "observationController"
	}).state('part', {
		url : "/part/:partid",
		templateUrl : "studies/study.html",
		controller : function($scope) {
			$scope.items = [
					"A", "List", "Of", "Items"
			];
		}
	}).state('state1.list', {
		url : "/list",
		templateUrl : "state1.list.html",
		controller : function($scope) {
			$scope.items = [
					"A", "List", "Of", "Items"
			];
		}
	}).state('state2', {
		url : "/state2",
		templateUrl : "state2.html"
	}).state('state2.list', {
		url : "/list",
		templateUrl : "state2.list.html",
		controller : function($scope) {
			$scope.things = [
					"A", "Set", "Of", "Things"
			];
		}
	})
});
// var app = angular.module("app", []);
// app.config(function($routeProvider) {
// $routeProvider.when("/", {
// templateUrl : "main.html",
// controller : "AppCtrl"
// });
// });
// app.controller("AppCtrl", function($scope) {
// $scope.model = {
// message : "This is my app!!!"
// }
// });
/**
 * Master Controller
 */
app.controller('MasterCtrl', function($scope, $cookieStore) {

	/**
	 * Sidebar Toggle & Cookie Control
	 * 
	 */
	var mobileView = 992;

	$scope.getWidth = function() {
		return window.innerWidth;
	};

	$scope.$watch($scope.getWidth, function(newValue, oldValue) {
		if (newValue >= mobileView) {
			if (angular.isDefined($cookieStore.get('toggle'))) {
				if ($cookieStore.get('toggle') == false) {
					$scope.toggle = false;
				} else {
					$scope.toggle = true;
				}
			} else {
				$scope.toggle = true;
			}
		} else {
			$scope.toggle = false;
		}

	});

	$scope.toggleSidebar = function() {
		$scope.toggle = !$scope.toggle;

		$cookieStore.put('toggle', $scope.toggle);
	};

	window.onresize = function() {
		$scope.$apply();
	};
});

/**
 * Alerts Controller
 */
app.controller('AlertsCtrl', function($scope) {
	$scope.alerts = [
	// {
	// type : 'success',
	// msg : 'Thanks for visiting! Feel free to create pull requests to improve
	// the dashboard!'
	// },
	// {
	// type : 'danger',
	// msg : 'Found a bug? Create an issue with as many details as you can.'
	// }
	];

	$scope.addAlert = function() {
		$scope.alerts.push({
			msg : 'Another alert!'
		});
	};

	$scope.closeAlert = function(index) {
		$scope.alerts.splice(index, 1);
	};
});
