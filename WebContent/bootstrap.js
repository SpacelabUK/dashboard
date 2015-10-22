/**
 * Style guide: https://github.com/johnpapa/angular-styleguide
 */

var app = angular.module('Dashboard', [
		'ngSanitize', 'ui.bootstrap', 'ngCookies', 'ui.router',
		'angularFileUpload', 'flow', 'ui.select'
// 'gridster'
], [
		'$provide',
		'$httpProvider',
		function($provide, $httpProvider) {
			$provide.factory('requestInterceptor', [
					'$q',
					'$window',
					function($q, $window) {
						return {
							'response' : function(response) {
								// check if we have been logged out,
								if (typeof response.data === "string" &&
										startsWith(response.data, '<!-- login')) {
									// in that case redirect to login
									// response.config.headers["urlAfterLogin"] =
									// $window.location.href;
									$window.location.href = 'login.html';
								}
								// console.log(response);
								return response;
							},
						};
					}
			]);
			$httpProvider.interceptors.push('requestInterceptor');
		}
]);

angular
		.module('Dashboard')
		.directive(
				'loading',
				function() {
					return {
						restrict : 'AE',
						replace : 'false',
						template : '<div class="loading"><div class="double-bounce1"></div><div class="double-bounce2"></div></div>'
					};
				});
angular.module('Dashboard').directive('mainpage', [
	function() {
		return {
			restrict : 'E',
			replace : 'true',
			templateUrl : 'main.html'
		};
	}
]);
angular.module('Dashboard').factory(
		'projectFactory',
		[
				'$q',
				'$http',
				'HTTPFactory',
				function($q, $http, HTTPFactory) {
					"use strict";
					var projects = [];
					var functions = [];
					var openStudies = [];

					var fetch = function(url) {
						var deferred = $q.defer(), httpPromise = $http.get(url);

						httpPromise.then(function(response) {
							deferred.resolve(response);
						}, function(error) {
							console.error(error);
						});
						return httpPromise;
					};
					var updateStudies = function(project, studies) {
						if (!project.studies)
							project.studies = [];
						while (project.studies.length > 0)
							project.studies.pop();
						for (var i = 0; i < studies.length; i++)
							project.studies.push(studies[i]);
					};
					var updateStudyParts = function(study, parts) {
						if (!study.parts)
							study.parts = [];
						while (study.parts.length > 0)
							study.parts.pop();
						for (var i = 0; i < parts.length; i++) {
							parts[i].type = 'observation';
							study.parts.push(parts[i]);
						}
					};
					var pushNewStudyPart = function(study, type) {
						if (!study.parts)
							study.parts = [];
						var data = {
							'study_id' : study.id,
							'type' : type
						};
						var deferred = $q.defer(), httpPromise = $http.post(HTTPFactory
								.getBackend() +
								'Insert?t=study_part', data);
						httpPromise.then(function(response) {
							deferred.resolve(response);
						}, function(error) {
							console.error(error);
						});

						return deferred.promise;
					};
					var pub = {
						
					};
					return pub;
				}
		]);

angular.module('Dashboard').factory('studyFactory', [
		'$q', '$http', function($q, $http) {
			"use strict";
			var study;
			var pub = {

			};
			return pub;
		}
]);
angular.module('Dashboard').controller(
		'prjCtrl',
		[
				'$scope', '$modal', 'projectFactory',
				function($scope, $modal, projectFactory) {
					"use strict";
					$scope.projects = projectFactory.getProjects();
					// $scope.projects.displayStudies = false;
					$scope.predicate = 'id';
					projectFactory.refreshProjects();
					// $scope.$watch('projects', function() {
					// alert('hey, projects has changed!');
					// });
					$scope.addProject = function() {
						$modal.open({
							templateUrl : 'addProject.html',
							controller : 'addProjectInstance'
						});
					};
					$scope.addStudy = function(project) {
						projectFactory.addStudy(project);
					};

				}
		]);

angular.module('Dashboard').config([
		'$tooltipProvider', function($tooltipProvider) {
			$tooltipProvider.setTriggers({
				'mouseenter' : 'mouseleave click'
			});
		}
]);

angular.module('Dashboard').factory('fetching', [
		'$q', '$http', function($q, $http) {
			"use strict";
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
			};
			return pub;
		}
]);

angular.module('Dashboard').controller('StdCtrlr', [
		'$scope', '$stateParams', '$http', function($scope, $stateParams, $http) {
			"use strict";

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
			};
		}
]);

angular.module('Dashboard')
		.controller(
				"addProjectInstance",
				[
						'$scope',
						'$modalInstance',
						'projectFactory',
						function($scope, $modalInstance, projectFactory) {
							"use strict";
							$scope.project = {};
							var date = new Date().getFullYear();
							$scope.project.id = date.toString().substring(2);
							$scope.project.name = '';
							$scope.add = function() {
								if ($scope.project.name.length > 0 &&
										$scope.project.id.length > 3) {
									// $modalInstance.close($scope.selected.item);
									projectFactory.addProject($scope.project.id,
											$scope.project.name).then(function(response) {
										// console.log(response);
										projectFactory.refreshProjects();
										$modalInstance.close({
											id : $scope.project.id,
											name : $scope.project.name,
											result : response
										});
									}, function(error) {
										console.error(error);
										$modalInstance.close({
											id : $scope.project.id,
											name : $scope.project.name,
											result : error
										});
									});
								}
								// $modalInstance.dismiss('cancel');
							};

							$scope.validateID = function(value) {
								return value.length > 3;
							};
							$scope.cancel = function() {
								$modalInstance.dismiss('cancel');
							};
						}
				]);

/**
 * Master Controller
 */
angular.module('Dashboard').controller('MasterCtrl', [
		'$scope', '$cookieStore', function($scope, $cookieStore) {
			"use strict";

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
						if ($cookieStore.get('toggle') === false) {
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
		}
]);

/**
 * Alerts Controller
 */
angular.module('Dashboard').controller('AlertsCtrl', [
		'$scope', function($scope) {
			"use strict";
			$scope.alerts = [
			// {
			// type : 'success',
			// msg : 'Thanks for visiting! Feel free to create pull requests to
			// improve
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
		}
]);
