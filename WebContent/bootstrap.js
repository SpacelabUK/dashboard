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

/*
 * Some basic String functions used throughout
 */
function eql(str1, str2) {
	return str1.trim().toLowerCase() === str2.toLowerCase();
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
app.filter('capitalize', function() {
	return function(input, all) {
		return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		}) : '';
	}
});
/**
 * Filter to search whether all the words in a search field match the relevant
 * property
 * 
 * example usage:
 * 
 * repeat="metric in availableMetrics | anyWordFilter: {title:$select.search}"
 */
app.filter('anyWordFilter', function() {
	return function(items, props) {
		var out = [];
		if (angular.isArray(items) && typeof props == 'object') {
			items.forEach(function(item) {
				var itemMatches = false;
				var keys = Object.keys(props);
				for (var i = 0; i < keys.length; i++) {
					var prop = keys[i];
					if (!props[prop]) {
						itemMatches = true;
						break;
					}
					if (!item[prop])
						continue;
					var text = props[prop].toLowerCase().trim().split(' ');
					var wordsNotFound = text.length;
					for (var j = 0; j < text.length; j++) {
						if (item[prop].toString().toLowerCase().indexOf(text[j]) !== -1) {
							wordsNotFound--;
						}
					}
					if (wordsNotFound == 0) {
						itemMatches = true;
						break;
					}
				}
				if (itemMatches) {
					out.push(item);
				}
			});
		} else {
			// Let the output be the input untouched
			out = items;
		}

		return out;
	}
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
					};
				});
app.directive('mainpage', [
	function() {
		return {
			restrict : 'E',
			replace : 'true',
			templateUrl : 'main.html'
		};
	}
]);
app.controller('AlertsCtrl', [
		'$scope', function($scope) {

		}
]);
app.factory('projectFactory',
		[
				'$q',
				'$http',
				'HTTPFactory',
				function($q, $http, HTTPFactory) {
					"use strict";
					var projects = [];
					var devices = [];
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
						var deferred = $q.defer(), httpPromise = $http.post(HTTPFactory
								.getBackend() +
								'Insert?t=study', data);

						httpPromise.then(function(response) {
							// console.log(response);
							deferred.resolve(response);
						}, function(error) {
							console.error(error);
						});

						return deferred.promise;
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
						fetchProjects : function() {
							return fetch(HTTPFactory.getBackend() + 'GetAll?t=projects');
						},
						refreshProjects : function() {
							fetch(HTTPFactory.getBackend() + 'GetAll?t=projects').then(
									function(response) {
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
							fetch(HTTPFactory.getBackend() + 'GetAll?t=devices').then(
									function(response) {
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
							fetch(HTTPFactory.getBackend() + 'GetAll?t=spatial_functions')
									.then(function(response) {
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
							fetch(
									HTTPFactory.getBackend() + 'GetAll?t=studies&projectid=' +
											project.id).then(function(response) {
								if (response.data)
									updateStudies(project, response.data);
							}, function(error) {
								console.error(error);
							});
						},
						refreshOpenStudies : function() {
							var promise = fetch(HTTPFactory.getBackend() +
									'GetAll?t=openstudies');
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
							var promise = fetch(HTTPFactory.getBackend() +
									'GetAll?t=study_parts&studyid=' + study.id);
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
							var deferred = $q.defer(), httpPromise = $http.post(HTTPFactory
									.getBackend() +
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
							var deferred = $q.defer(), httpPromise = $http.post(HTTPFactory
									.getBackend() +
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
							var deferred = $q.defer(), httpPromise = $http.post(HTTPFactory
									.getBackend() +
									'Insert?t=spatial_function', data);
							httpPromise.then(function(response) {
								deferred.resolve(response);
							}, function(error) {
								console.error(error);
							});

							return deferred.promise;
						},
						addStudy : function(project) {
							fetch(
									HTTPFactory.getBackend() + 'GetAll?t=studies&projectid=' +
											project.id).then(function(response) {
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
							fetch(
									HTTPFactory.getBackend() + 'GetAll?t=study_parts&studyid=' +
											study.id).then(function(response) {
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
				}
		]);

app.factory('studyFactory', [
		'$q', '$http', function($q, $http) {
			"use strict";
			var study;
			var pub = {

			};
			return pub;
		}
]);
app.controller('prjCtrl', [
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
app.controller('metricsCtrl', [
		'$scope',
		'$modal',
		'HTTPFactory',
		function($scope, $modal, HTTPFactory) {
			"use strict";
			HTTPFactory.backendGet('Metrics').then(function(response) {
				console.log(response.data);
				$scope.metrics = response.data;
				for (var i = 0; i < $scope.metrics.length; i++) {
					$scope.metrics[i].indx = i;
				}
			});
			$scope.setSearch = function(data) {
				$scope.search = data;
			}
			$scope.predicate = 'id';
			$scope.addMetric = function() {
				$modal
						.open({
							size : 'lg',
							templateUrl : 'addMetric.html',
							controller : [
									'$scope',
									'$modalInstance',
									'HTTPFactory',
									'StudyFactory',
									function($scope, $modalInstance, HTTPFactory, StudyFactory) {
										$scope.cancel = function() {
											$modalInstance.dismiss('cancel');
										}
										$scope.ok = function() {
											if ($scope.metricValid && $scope.metricAlias) {
												var data = {
													metric : {}
												};
												data.metric[$scope.metricAlias] = $scope.metricValid;
												console.log(data);
												HTTPFactory.backendPost("StoreMetric", data).then(
														function(response) {
															console.log(response.data);
														}, function(error) {
															console.log(error);
														});
											}
											// $modalInstance.close();
										}
										$scope.metricAlias = undefined;
										$scope.metricValid = false;
										$scope.onCodeChange = function() {
											$scope.codeStyle = "";
											$scope.metricValid = false;
										}
										$scope.testMetric = function() {
											$scope.codeStyle = "color:green";
											$scope.resultStyle = "";
											$scope.result = "";
											var metricTree;
											try {
												metricTree = JSON.parse($scope.metricTree);
												if (metricTree.measure.alias)
													delete metricTree.measure.alias;
												if (metricTree.alias)
													delete metricTree.alias;
												$scope.metricTree = JSON.stringify(metricTree, null,
														"\t");
												$scope.metricTree = $scope.metricTree.replace(/\\n/g,
														"\n");
												$scope.metricTree = $scope.metricTree.replace(/\\t/g,
														"\t");
//												$scope.metricTree = $scope.metricTree.replace(/\\"/g,
//														"\"");
											} catch (err) {
												$scope.codeStyle = "color:red";
												$scope.resultStyle = "color:red";
												$scope.result = err.message;
												$scope.metricValid = false;
												return;
											}
											// .replace(/\\/g,'\\')
											StudyFactory.testMetric(39, metricTree).then(
													function(response) {
														$scope.result = JSON.stringify(response.data, null,
																"\t");
														$scope.codeStyle = "color:green";
														$scope.resultStyle = "color:green";
														$scope.metricValid = JSON.parse($scope.metricTree);
													}, function(error) {
														$scope.result = error;
														$scope.codeStyle = "color:red";
														$scope.resultStyle = "color:red";
														$scope.metricValid = false;
													});
										}
									}
							],
							resolve : {}
						}).result.then();
			}
			$scope.viewMetricDetails = function(metric) {
				$modal.open({
					size : 'lg',
					templateUrl : 'viewMetricDetails.html',
					controller : [
							'$scope',
							'$modalInstance',
							'metric',
							'HTTPFactory',
							function($scope, $modalInstance, metric, HTTPFactory) {
								$scope.metric = metric;

								HTTPFactory.backendPost("Metrics", {
									wanted_metrics : [
										metric.alias
									]
								}).then(
										function(response) {
											if (response && response.data && response.data.metrics)
												$scope.metricTree = JSON.stringify(
														response.data.metrics[metric.alias], null, 2);
										});
								$scope.cancel = function() {
									$modalInstance.dismiss('cancel');
								}
								$scope.ok = function() {
									$modalInstance.close();
								}
							}
					],
					resolve : {
						metric : function() {
							return angular.copy(metric);
						}
					}
				}).result.then();
			}
			$scope.editMetric = function(metric) {
				$modal.open({
					templateUrl : 'editMetric.html',
					controller : [
							'$scope', '$modalInstance', 'metric',
							function($scope, $modalInstance, metric) {
								$scope.metric = metric;
								$scope.cancel = function() {
									$modalInstance.dismiss('cancel');
								}
								$scope.ok = function() {
									$modalInstance.close(metric);
								}
								$scope.addCharacter = function(char) {
									if (!$scope.metric[$scope.currentModel])
										$scope.metric[$scope.currentModel] = char;
									$scope.metric[$scope.currentModel] += char;
								}
								$scope.currentModel;
								$scope.setCurrentModel = function(model) {
									$scope.currentModel = model;
									return true;
								}
							}
					],
					resolve : {
						metric : function() {
							return angular.copy(metric);
						}
					}
				}).result.then(function(response) {
					var keys = Object.keys(response);
					for (var i = 0; i < keys.length; i++)
						if (response[keys[i]] === null || response[keys[i]] === undefined)
							delete response[keys[i]];
					HTTPFactory.backendPost('StoreMetric', {
						metric : response
					}).then(function(response) {
						$scope.metrics[metric.indx] = response.data;
						// var keys = Object.keys(response.data);
						// console.log(response.data);
						// for (var i = 0; i < keys.length; i++)
						// metric[keys[i]] = response.data[keys[i]];
					}, function(error) {
						console.log(error);
					});
					console.log(response);
				});
			}
		}
]);
app.config([
		'$tooltipProvider', function($tooltipProvider) {
			$tooltipProvider.setTriggers({
				'mouseenter' : 'mouseleave click'
			});
		}
]);
app.controller('circleDiagramCtrl', [
		'$scope',
		'$timeout',
		'TextFactory',
		'FileUploader',
		function($scope, $timeout, TextFactory, FileUploader) {
			$scope.removeEdge = function(edge) {
				edge.type = "push";
				$scope.refreshEdges();
			}
			$scope.modifyMultiplier = function(amount) {
				$scope.options.sizeMult += amount;
			}
			$scope.modifyGravity = function(amount) {
				$scope.options.gravMult += amount;
			}
			$scope.modifyRestLength = function(amount) {
				$scope.options.restLength += amount;
			}
			var uploader = $scope.uploader = new FileUploader();

			uploader.onAfterAddingFile = function(fileItem) {
				var reader = new FileReader();
				reader.onload = function(e) {
					if (!endsWith(fileItem._file.name, 'vna')) {
						alert("oi! that's not a VNA!");
						return;
					}
					var vna = TextFactory.getVNAData(e.target.result);
					if (!vna.node_data || !vna.tie_data)
						return;

					var nodes = TextFactory.extractVNARowsUnderHeaders(vna.node_data, [
							"name", "id"
					]);
					var ties = TextFactory.extractVNARowsUnderHeaders(vna.tie_data, [
							"from", "to"
					]);
					var tieObj = {};
					for (var i = 0; i < ties.length; i++) {
						var from = parseInt(ties[i]["from"]);
						var to = parseInt(ties[i]["to"]);
						if (!tieObj[from])
							tieObj[from] = [];
						tieObj[from].push(to);
					}
					var centreNode;
					for (var i = 0; i < $scope.nodes.length; i++)
						if ($scope.nodes[i].type === 'centre') {
							centreNode = $scope.nodes[i];
							break;
						}
					$scope.nodes.splice(0, $scope.nodes.length);
					$scope.edges.splice(0, $scope.edges.length);

					$timeout(function() {
						$scope.refresh();
						$timeout(function() {
							// $scope.nodes.length = 0;
							// $scope.edges.length = 0;
							$scope.nodes.push(centreNode);
							for (var i = 0; i < nodes.length; i++) {
								nodes[i].size = 1;
								$scope.nodes.push(nodes[i]);
							}
							for (var i = 0; i < $scope.nodes.length; i++) {
								// $scope.edges.push({
								// source : centreNode,
								// target : $scope.nodes[i],
								// invisible : true
								// });
								for (var j = 0; j < $scope.nodes.length; j++) {
									if (i == j)
										continue;
									if (tieObj[i] && tieObj[i].indexOf(j) != -1) {
										$scope.edges.push({
											source : $scope.nodes[i],
											target : $scope.nodes[j],
											type : 'edge'
										});
										// $scope.nodes[i].size++;
										$scope.nodes[j].size++;
									} else {
										$scope.edges.push({
											source : $scope.nodes[i],
											target : $scope.nodes[j],
											type : 'push'
										});
									}
								}
							}
							$timeout(function() {
								$scope.refresh();
							}, 100);
						}, 100);
					}, 100);
				}
				reader.readAsText(fileItem._file);
			};
			$scope.addEdge = function() {
				for (var i = 0; i < $scope.edges.length; i++) {
					if ($scope.edges[i].type === 'push') {
						var edge = $scope.edges[i];
						edge.type = "edge";
						$scope.edges[i] = $scope.edges[$scope.edges.length - 1];
						$scope.edges[$scope.edges.length - 1] = edge;
						break;
					}
				}
				$scope.refreshEdges();
			}
			$scope.switchEdge = function(edge) {
				for (var i = 0; i < $scope.edges.length; i++) {
					if ($scope.edges[i].source === edge.target &&
							$scope.edges[i].target === edge.source) {
						var temptype = $scope.edges[i].type;
						$scope.edges[i].type = edge.type;
						edge.type = temptype;
						var eI = $scope.edges.indexOf(edge);
						$scope.edges[eI] = $scope.edges[i];
						$scope.edges[i] = edge;
						break;
					}
				}
				$scope.refreshEdges();
			}
			$scope.downloadSVG = function(id) {
				var svgpar = document.getElementById(id);
				var svg = svgpar.getElementsByTagName("svg")[0];

				svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
				var image_data = '<?xml version="1.0" encoding="utf-8" ' //
						+ 'standalone="no"?>' //
						+ '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ' //
						+ '"http://www.w3.org/Graphics/SVG/1.2/DTD/svg11.dtd">';
				image_data += svg.outerHTML.replace(/#/g, '%23');
				;

				window.open('data:image/svg+xml;utf8,' + image_data, '_blank');

			};

			$scope.pageTitle = "Network-Integration diagram Generator";
			$scope.options = {
				sizeMult : 5,
				gravMult : 1,
				restLength : 200,
				touch : 0
			}
			$scope.refreshEdges = function() {
				var i;
				for (i = 0; i < $scope.nodes.length; i++)
					$scope.nodes[i].size = 1;
				for (i = 0; i < $scope.edges.length; i++)
					if ($scope.edges[i].type === 'edge')
						$scope.edges[i].target.size++;
				$scope.refresh();
			}
			$scope.refresh = function() {
				$scope.options.touch++;
			};
			$scope.addNode = function() {
				$scope.nodes.push({
					name : 'New Node',
					size : 1,
					x : Math.random() * 600,
					y : Math.random() * 600
				});
				$scope.refreshEdges();
			}
			$scope.removeNode = function(node) {
				for (var i = $scope.edges.length - 1; i >= 0; i--) {
					if ($scope.edges[i].source === node ||
							$scope.edges[i].target === node)
						$scope.edges.splice(i, 1);
				}
				$scope.nodes.splice($scope.nodes.indexOf(node), 1);
				$scope.refreshEdges();
			}
			$scope.fromNodes = {};
			$scope.nodes = [
					{
						id : 1,
						name : "Lorem",
						size : 1
					}, {
						id : 2,
						name : "Ipsum",
						size : 1,
					}, {
						id : 3,
						name : "Dolor",
						size : 1
					}, {
						id : 4,
						name : "Sit",
						size : 1
					}, {
						id : 5,
						name : "Amet",
						size : 1
					}, {
						id : 6,
						name : "Consectetur",
						size : 1
					}, {
						id : 7,
						name : "Adipiscing",
						size : 1
					}, {
						id : 8,
						name : "Elit",
						size : 1
					}, {
						id : 9,
						name : "Loremss",
						size : 1
					}, {
						id : 10,
						name : "Ipsumss",
						size : 1,
					}, {
						id : 11,
						name : "Dolorss",
						size : 1
					}, {
						id : 12,
						name : "Sitss",
						size : 1
					}, {
						id : 13,
						name : "Ameaat",
						size : 1
					}, {
						id : 14,
						name : "Conssectetur",
						size : 1
					}, {
						id : 15,
						name : "Adipfiscing",
						size : 1
					}, {
						id : 16,
						name : "Eslit",
						size : 1
					}
			];
			$scope.disks = [
					{
						fill : '#AEBDDE',
						size : 300
					}, {
						fill : '#BED8BA',
						size : 240
					}, {
						fill : '#F6F5BA',
						size : 180
					}, {
						fill : '#F2C6A7',
						size : 120
					}

			];
			$scope.edges = [];
			var maxEdgePrc = 0.2;
			for (var i = 0; i < $scope.nodes.length; i++) {
				$scope.nodes[i].x = Math.random() * 600;
				$scope.nodes[i].y = Math.random() * 600;
			}
			for (var i = 0; i < $scope.nodes.length; i++) {
				for (var j = 0; j < $scope.nodes.length; j++) {
					if (i == j)
						continue;
					if (Math.random() < maxEdgePrc) {
						$scope.edges.push({
							source : $scope.nodes[i],
							target : $scope.nodes[j],
							type : 'edge'
						});
						// $scope.nodes[i].size++;
						$scope.nodes[j].size++;
					} else {
						$scope.edges.push({
							source : $scope.nodes[i],
							target : $scope.nodes[j],
							type : 'push'
						});
					}
				}
			}
		}
]);
app
		.controller(
				'issuesCtrl',
				[
						'$scope',
						'$stateParams',
						'$modal',
						'HTTPFactory',
						'ModalFactory',
						function($scope, $stateParams, $modal, HTTPFactory, ModalFactory) {
							"use strict";
							$scope.issue = $stateParams.issue;
							$scope.issueNames = [];
							$scope.metrics = [];
							$scope.removeMetric = function(issue, metric, issue_metric) {
								ModalFactory.openConfirmModal(
										"Are you sure you want to remove metric \"" + metric.title +
												"\" from issue " + issue.id + "?", "Remove", "Cancel").result
										.then(function(ok) {
											HTTPFactory.backendPost("RemoveMetricFromIssue", {
												metric_group : issue.id,
												metric_id : issue_metric.id
											}).then(
													function(response) {
														$scope.wantedMetrics[0].metrics.splice(
																$scope.wantedMetrics[0].metrics
																		.indexOf(issue_metric), 1);
													}, function(error) {
														console.log(error);
													});
										});
							}
							$scope.addMetric = function(issue, okText) {
								var modalInstance = $modal
										.open({
											templateUrl : 'selectMetricModal.html',
											controller : [
													'$scope',
													'issueID',
													'okText',
													'exceptMetrics',
													function($scope, issueID, okText, exceptMetrics) {
														$scope.okText = okText;

														$scope.refreshMetrics = function() {

														}
														$scope.metricSelector = {};
														HTTPFactory
																.backendGet("Metrics?filter=id, title")
																.then(
																		function(response) {
																			for (var i = 0; i < response.data.length; i++) {
																				if (exceptMetrics
																						.indexOf(response.data[i].id) !== -1)
																					response.data[i].disabled = true;
																			}
																			$scope.availableMetrics = response.data;
																		}, function(error) {
																		})
														$scope.ok = function() {
															modalInstance.close({
																metric_group : issueID,
																metric_id : $scope.metricSelector.selected.id
															});
														}
														$scope.dismiss = function() {
															modalInstance.dismiss();
														}
													}
											],
											resolve : {
												exceptMetrics : function() {
													return issue.metrics.map(function(m) {
														return m.id
													})
												},
												issueID : function() {
													return issue.id
												},
												okText : function() {
													return okText
												}
											}
										});
								modalInstance.result.then(function(modalResponse) {
									console.log(modalResponse);
									if (modalResponse) {
										HTTPFactory.backendPost("AddMetricToIssue", modalResponse)
												.then(function(response) {
													$scope.wantedMetrics[0].metrics.push(response.data);
													$scope.metrics[response.data.alias] = response.data;
												}, function(error) {
													console.log(error);
												});
									}
								});
							}
							HTTPFactory
									.backendGet("Issues")
									.then(
											function(response) {
												var i, j, newMetrics;
												$scope.wantedMetrics = response.data;

												for (j = 0; j < $scope.wantedMetrics.length; j++) {
													var met = {
														id : $scope.wantedMetrics[j].id,
														title : $scope.wantedMetrics[j].title
													};
													$scope.issueNames.push(met);
												}
												$scope.pageTitle = 'Issues';
												if (!$scope.issue) {
													$scope.wantedMetrics = [];
												}
												if ($scope.issue && $scope.issue !== 'all') {
													var issues = $scope.issue.split(',');
													newMetrics = [];
													for (j = 0; j < issues.length; j++) {
														for (i = 0; i < $scope.wantedMetrics.length; i++) {
															if ($scope.wantedMetrics[i].id.slice(0,
																	issues[j].length) === issues[j] &&
																	newMetrics.indexOf($scope.wantedMetrics[i]) === -1) {
																newMetrics.push($scope.wantedMetrics[i]);
															}
														}
														$scope.wantedMetrics = newMetrics;
													}
												}
												if ($scope.wantedMetrics[0]) {
													HTTPFactory
															.backendPost(
																	"Metrics",
																	{
																		wanted_metrics : $scope.wantedMetrics[0].metrics
																				.map(function(m) {
																					return m.alias;
																				})

																	}).then(function(response) {
																console.log(response);
																$scope.metrics = response.data.metrics;
															});
													if (newMetrics && newMetrics.length == 1)
														$scope.pageTitle = 'Issue ' + newMetrics[0].id +
																": " + newMetrics[0].title;
												}
											});
							$scope.setSearch = function(data) {
								$scope.search = data;
							}
							$scope.predicate = 'id';
							$scope.moveMetricUp = function(index) {
								if (index === 0 ||
										$scope.wantedMetrics[0].metrics[index].updating ||
										$scope.wantedMetrics[0].metrics[index - 1].updating)
									return;
								$scope.wantedMetrics[0].metrics[index].updating = true;
								$scope.wantedMetrics[0].metrics[index - 1].updating = true;
								var temp = $scope.wantedMetrics[0].metrics[index - 1];
								$scope.wantedMetrics[0].metrics[index - 1] = $scope.wantedMetrics[0].metrics[index];
								$scope.wantedMetrics[0].metrics[index] = temp;
								var data = {
									order_1 : index,
									order_2 : index - 1,
									metric_group : $scope.wantedMetrics[0].id
								};
								HTTPFactory
										.backendPost("SwitchIssueMetricOrder", data)
										.then(
												function(response) {
													delete $scope.wantedMetrics[0].metrics[index].updating;
													delete $scope.wantedMetrics[0].metrics[index - 1].updating;
												},
												function(error) {
													console.log(error);
													var temp = $scope.wantedMetrics[0].metrics[index - 1];
													$scope.wantedMetrics[0].metrics[index - 1] = $scope.wantedMetrics[0].metrics[index];
													$scope.wantedMetrics[0].metrics[index] = temp;
													delete $scope.wantedMetrics[0].metrics[index].updating;
													delete $scope.wantedMetrics[0].metrics[index - 1].updating;
												});
							}
							$scope.moveMetricDown = function(index) {
								if (index === $scope.wantedMetrics[0].metrics.length - 1 ||
										$scope.wantedMetrics[0].metrics[index].updating ||
										$scope.wantedMetrics[0].metrics[index + 1].updating)
									return;
								$scope.wantedMetrics[0].metrics[index].updating = true;
								$scope.wantedMetrics[0].metrics[index + 1].updating = true;
								var temp = $scope.wantedMetrics[0].metrics[index + 1];
								$scope.wantedMetrics[0].metrics[index + 1] = $scope.wantedMetrics[0].metrics[index];
								$scope.wantedMetrics[0].metrics[index] = temp;
								var data = {
									order_1 : index,
									order_2 : index + 1,
									metric_group : $scope.wantedMetrics[0].id
								};
								HTTPFactory
										.backendPost("SwitchIssueMetricOrder", data)
										.then(
												function(response) {
													delete $scope.wantedMetrics[0].metrics[index].updating;
													delete $scope.wantedMetrics[0].metrics[index + 1].updating;
												},
												function(error) {
													console.log(error);
													var temp = $scope.wantedMetrics[0].metrics[index + 1];
													$scope.wantedMetrics[0].metrics[index + 1] = $scope.wantedMetrics[0].metrics[index];
													$scope.wantedMetrics[0].metrics[index] = temp;
													delete $scope.wantedMetrics[0].metrics[index].updating;
													delete $scope.wantedMetrics[0].metrics[index + 1].updating;
												});
							}
						}
				]);
app.controller('devCtrl', [
		'$scope', '$modal', 'projectFactory',
		function($scope, $modal, projectFactory) {
			"use strict";
			$scope.devices = projectFactory.getDevices();
			// $scope.projects.displayStudies = false;
			$scope.predicate = 'id';
			projectFactory.refreshDevices();
			// $scope.$watch('projects', function() {
			// alert('hey, projects has changed!');
			// });
			$scope.addDevice = function() {
				$modal.open({
					templateUrl : 'addDevice.html',
					controller : 'addDeviceInstance'
				});
			};
		}
]);
app.controller('spFuncCtrl', [
		'$scope', '$modal', 'projectFactory',
		function($scope, $modal, projectFactory) {
			"use strict";
			$scope.functions = projectFactory.getSpatialFunctions();
			// $scope.projects.displayStudies = false;
			$scope.predicate = 'id';
			projectFactory.refreshSpatialFunctions();
			// $scope.$watch('projects', function() {
			// alert('hey, projects has changed!');
			// });
			$scope.addDevice = function() {
				$modal.open({
					templateUrl : 'addSpatialFunction.html',
					controller : 'addSpatialFunctionInstance'
				});
			};
		}
]);

app.factory('fetching', [
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

app.controller('StdCtrlr', [
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

app.controller("addProjectInstance", [
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
				if ($scope.project.name.length > 0 && $scope.project.id.length > 3) {
					// $modalInstance.close($scope.selected.item);
					projectFactory.addProject($scope.project.id, $scope.project.name)
							.then(function(response) {
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
app.controller("addDeviceInstance", [
		'$scope', '$modalInstance', 'projectFactory',
		function($scope, $modalInstance, projectFactory) {
			"use strict";
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
			};
			$scope.cancel = function() {
				$modalInstance.dismiss('cancel');
			};
		}
]);
app.controller("addSpatialFunctionInstance", [
		'$scope',
		'$modalInstance',
		'projectFactory',
		function($scope, $modalInstance, projectFactory) {
			"use strict";
			$scope.func = {
				alias : '',
				name : ''
			};
			$scope.add = function() {
				if ($scope.func.name.length > 0) {
					projectFactory
							.addSpatialFunction($scope.func.alias, $scope.func.name).then(
									function(response) {
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
			};
			$scope.cancel = function() {
				$modalInstance.dismiss('cancel');
			};
		}
]);
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
app.config([
		'$stateProvider', '$urlRouterProvider',
		function($stateProvider, $urlRouterProvider) {
			"use strict";
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
				controller : [
						'$scope', '$stateParams', function($scope, $stateParams) {
							// get the id
							$scope.id = $stateParams.partyID;

							// get the location
							$scope.location = $stateParams.partyLocation;
						}
				]
			}).state('observationssetup', {
				url : "/observations/setup",
				templateUrl : "../observations/setup/index.html",
				// for urls like this: /state1/:partyID/:partyLocation
				controller : [
						'$scope', '$stateParams', function($scope, $stateParams) {
							// get the id
							$scope.id = $stateParams.partyID;

							// get the location
							$scope.location = $stateParams.partyLocation;
						}
				]
			}).state('observationsprogress', {
				url : "/observations/progress",
				templateUrl : "../observations/progress/index.php",
				// for urls like this: /state1/:partyID/:partyLocation
				controller : [
						'$scope', '$stateParams', function($scope, $stateParams) {
							// get the id
							$scope.id = $stateParams.partyID;

							// get the location
							$scope.location = $stateParams.partyLocation;
						}
				]
			}).state('projects', {
				url : "/projects",
				templateUrl : "projects.html",
				// for urls like this: /state1/:partyID/:partyLocation
				controller : [
						'$scope', '$stateParams', function($scope, $stateParams) {
							// get the id
							$scope.id = $stateParams.partyID;

							// get the location
							$scope.location = $stateParams.partyLocation;
						}
				]
			}).state('devices', {
				url : "/devices",
				templateUrl : "devices.html",
				// for urls like this: /state1/:partyID/:partyLocation
				controller : 'devCtrl'
			}).state('metrics', {
				url : "/metrics",
				templateUrl : "metrics.html",
				// for urls like this: /state1/:partyID/:partyLocation
				controller : 'metricsCtrl'
			}).state('issues', {
				url : "/issues/{issue}",
				templateUrl : "issues.html",
				// for urls like this: /state1/:partyID/:partyLocation
				controller : 'issuesCtrl'
			}).state('circlediagram', {
				url : "/circlediagram",
				templateUrl : "circleDiagram.html",
				// for urls like this: /state1/:partyID/:partyLocation
				controller : 'circleDiagramCtrl'
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
				url : "/observation/{studyid}",
				templateUrl : "studies/observation/observation.html",
				controller : "observationController"
			}).state('part', {
				url : "/part/:studyid",
				templateUrl : "studies/study.html",
				controller : [
						'$scope', '$stateParams', function($scope) {
							$scope.items = [
									"A", "List", "Of", "Items"
							];
						}
				]
			}).state('state1.list', {
				url : "/list",
				templateUrl : "state1.list.html",
				controller : [
						'$scope', '$stateParams', function($scope) {
							$scope.items = [
									"A", "List", "Of", "Items"
							];
						}
				]
			}).state('state2', {
				url : "/state2",
				templateUrl : "state2.html"
			}).state('state2.list', {
				url : "/list",
				templateUrl : "state2.list.html",
				controller : [
						'$scope', '$stateParams', function($scope) {
							$scope.things = [
									"A", "Set", "Of", "Things"
							];
						}
				]
			});
		}
]);
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
app.controller('MasterCtrl', [
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
app.controller('AlertsCtrl', [
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
