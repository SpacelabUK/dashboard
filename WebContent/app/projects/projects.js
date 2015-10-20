(function() {
	"use strict";
	angular.module('app.projects').controller('Projects', projectsController);
	projectsController.$inject = [

			'$scope', '$modal', 'dataService',
	// 'RoundModelFactory', 'fetching'
	];

	function projectsController($scope, $modal, dataService, importFactory) {
		var vm = this;
		fetchInitialData();
		function fetchInitialData() {
			dataService.getProjects().then(function(response) {
				vm.projects = response.data;
			}, function(error) {
				console.log(error);
			});
		}
		vm.predicate = 'id';

		vm.addProject = function() {
			$modal.open({
				templateUrl : 'app/projects/add-project.modal.html',
				controller : 'addProject',
				controllerAs : 'vm'
			}).result.then(function(response) {
				console.log(response);
				$scope.search = response.name;
				fetchInitialData();
			});
		};
		vm.addStudy = function(project) {
			console.log(project);
			projectFactory.addStudy(project);
			$scope.fetchInitialData();
		};

		// =========

		$scope.addObservation = function(study) {
			projectFactory.addStudyPart(study, 'observation');
		};
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
					observation.roundModel.startdate = Date.parse(data.start_date);
					observation.roundModel.enddate = Date.parse(data.end_date);
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
		};
		$scope.addPlans = function(study) {
			importFactory.addPlan(study);
		};
		$scope.addObservationData = function(study) {
			importFactory.addObservation(study);
		};
		$scope.addDepthmap = function(study) {
			importFactory.addObservation(study);
		};
		$scope.addStaffSurvey = function(study) {
			importFactory.addStaffSurvey(study);
		};
		$scope.addStakeholders = function(study) {
			importFactory.addStakeholders(study);

		};
	}
})();
angular.module('app.projects').controller(
		'MainStudyCtrl',
		[
				'$scope',
				'$stateParams',
				'StudyFactory',
				'HTTPFactory',
				function($scope, $stateParams, StudyFactory, HTTPFactory) {
					"use strict";
					// fetch(backend + 'Get?t=study&studyid=' +
					// study.id).then(
					// function(response) {
					// $scope.desks = response.data;
					// calcAvgOccupancy();
					// }, function(error) {
					// });
					$scope.id = $stateParams.studyid;
					// $scope.study = {};
					StudyFactory.fetchStudy($scope.id, [
						'project_name'
					]).then(function(response) {
						// for (var i = 0; i < response.length;
						// i++)
						// $scope.study[response[i][0]] =
						// response[i][1];
						$scope.study = response;
						// console.log(response);
					}, function(error) {
						console.log(error);
					});
					HTTPFactory.backendGet('GetAll?t=study_parts&studyid=' + $scope.id)
							.then(
									function(response) {
										// $scope.observation_id = response.data[0]['id'];
										$scope.observation_id = response.data[0].id;
										HTTPFactory.backendGet(
												'Occupancy?t=project_name&obsid=' +
														$scope.observation_id).then(function(response) {
											$scope.projectname = response.data;
										}, function(error) {
										});
										HTTPFactory.backendGet(
												'Occupancy?t=no_of_desks&obsid=' +
														$scope.observation_id).then(function(response) {
											$scope.desks = response.data;
											calcOccupancy();
										}, function(error) {
										});
										HTTPFactory.backendGet(
												'Occupancy?t=no_of_rounds&obsid=' +
														$scope.observation_id).then(function(response) {
											$scope.rounds = response.data;
											calcOccupancy();
										}, function(error) {
										});
										HTTPFactory.backendGet(
												'Occupancy?t=gross_occupancy&obsid=' +
														$scope.observation_id).then(function(response) {
											$scope.occupancy = response.data;
											calcOccupancy();
										}, function(error) {
										});
										HTTPFactory.backendGet(
												'Occupancy?t=min_occupancy&obsid=' +
														$scope.observation_id).then(function(response) {
											$scope.minoccupancy = response.data;
											calcOccupancy();
										}, function(error) {
										});
										HTTPFactory.backendGet(
												'Occupancy?t=max_occupancy&obsid=' +
														$scope.observation_id).then(function(response) {
											$scope.maxoccupancy = response.data;
											calcOccupancy();
										}, function(error) {
										});
										HTTPFactory.backendGet(
												'GetAll?t=spaces&studyid=' + $scope.id).then(
												function(response) {
													$scope.spaces = response.data.length;
												}, function(error) {
												});
										HTTPFactory.backendGet(
												'Occupancy?t=no_of_buildings&obsid=' +
														$scope.observation_id).then(function(response) {
											$scope.buildings = response.data;
										}, function(error) {
										});
										HTTPFactory.backendGet(
												'Occupancy?t=get_quotes&obsid=' + $scope.id).then(
												function(response) {
													var i;
													// if($scope.wordleData)
													// {
													// for (var
													// i = 0; i
													// <
													// $scope.wordleData.length;
													// i++) {
													// $scope.wordleData.pop();
													// }
													// } else {
													$scope.wordleData = [];
													// }
													var max = 0;
													for (i = 0; i < response.data.length; i++) {
														if (response.data[i].size > max) {
															max = response.data[i].size;
														}
													}
													for (i = 0; i < response.data.length; i++) {
														response.data[i].size = response.data[i].size *
																100.0 / max;
														// $scope.wordleData.push(response.data[i]);
													}
													$scope.wordleData = response.data;
													// console
													// .log(response.data);
												}, function(error) {
												});
										HTTPFactory.backendGet(
												'Occupancy?t=total_occ_per_round&obsid=' +
														$scope.observation_id).then(function(response) {
											var i;
											var data = response.data;
											// console.log(data);
											var collated = {};
											var sortable = [];
											for (i = 0; i < data.length; i++) {
												var id = data[i].day_id * 100 + data[i].round_id;
												sortable.push(id);
												collated[id] = data[i].count;
											}
											sortable.sort();
											$scope.occPerRound = [];
											for (i = 0; i < sortable.length; i++) {
												$scope.occPerRound.push(collated[sortable[i]]);
											}
											// console.log($scope.occ_per_round);
										}, function(error) {
										});
										HTTPFactory.backendGet(
												'Occupancy?t=desk_occ_frequency&obsid=' +
														$scope.observation_id).then(function(response) {
											var data = response.data;
											// //
											// console.log(data);
											// var
											// collated
											// = {};
											// for (var
											// i = 0; i
											// <
											// data.length;
											// i++) {
											// var id =
											// data[i].times_found;
											// collated[id]
											// = ;
											// }
											$scope.deskOccFreq = [];
											for (var i = 0; i < data.length; i++) {
												$scope.deskOccFreq.push(data[i].frequency);
											}
											// console.log($scope.occ_per_round);
										}, function(error) {
										});
										HTTPFactory.backendGet(
												'Occupancy?t=no_of_staff&obsid=' + $scope.id).then(
												function(response) {
													$scope.staff = response.data;
												}, function(error) {
												});
									}, function(error) {
									});
					$scope.words = [
							"Hallo", "Test", "Lorem", "Ipsum", "Lorem", "ipsum", "dolor",
							"sit", "amet", "consetetur", "sadipscing", "elitr,", "sed",
							"diam", "nonumy", "eirmod", "tempor", "invidunt", "ut", "labore",
							"et", "dolore", "magna", "aliquyam", "erat,", "sed", "diam"
					];
					// console.log($scope.words);

					// $scope.myOnClickFunction = function(element) {
					// console.log("click", element);
					// }
					//
					// $scope.myOnHoverFunction = function(element) {
					// console.log("hover", element);
					// }
					// $scope.occPerRound = [ 3, 6, 2, 7, 5, 2, 0, 3, 8,
					// 9, 2, 5, 9, 3,
					// 6,
					// 3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 2, 7 ];
					$scope.occPerRound = [
						0
					];
					$scope.deskOccFreq = [
						0
					];
					// $scope.wordleData = [ "Hello", "world",
					// "normally", "you", "want",
					// "more", "words", "than", "this" ].map(function(d)
					// {
					// return {
					// text : d,
					// size : 10 + Math.random() * 90
					// };
					// });
					$scope.minOccupancyValues = [
							0, 1
					];
					$scope.avgOccupancyValues = [
							0, 1
					];
					$scope.maxOccupancyValues = [
							0, 1
					];
					$scope.minOccupancyLabels = [
							'0%', '100%'
					];
					$scope.avgOccupancyLabels = [
							'0%', '100%'
					];
					$scope.maxOccupancyLabels = [
							'0%', '100%'
					];
					function calcOccupancy() {
						$scope.avgOccupancyValues = [
								$scope.occupancy / ($scope.desks * $scope.rounds),
								1 - $scope.occupancy / ($scope.desks * $scope.rounds)
						];
						$scope.avgOccupancyLabels = [
								(($scope.avgOccupancyValues[0] * 100) | 0) + '%',
								(($scope.avgOccupancyValues[1] * 100) | 0) + '%'
						];

						$scope.minOccupancyValues = [
								$scope.minoccupancy / $scope.desks,
								1 - $scope.minoccupancy / $scope.desks
						];
						$scope.minOccupancyLabels = [
								(($scope.minOccupancyValues[0] * 100) | 0) + '%',
								(($scope.minOccupancyValues[1] * 100) | 0) + '%'
						];

						$scope.maxOccupancyValues = [
								$scope.maxoccupancy / $scope.desks,
								1 - $scope.maxoccupancy / $scope.desks
						];
						$scope.maxOccupancyLabels = [
								(($scope.maxOccupancyValues[0] * 100) | 0) + '%',
								(($scope.maxOccupancyValues[1] * 100) | 0) + '%'
						];

					}
				}
		]);
// app
// .controller(
// 'StudyIssuesCtrl',
// [
// '$scope',
// '$stateParams',
// '$modal',
// 'StudyFactory',
// 'HTTPFactory',
// function($scope, $stateParams, $modal, StudyFactory, HTTPFactory) {
// $scope.id = $stateParams.studyid;
// $scope.viewAlias = $stateParams.viewAlias;
// $scope.activityValues = [];
// $scope.activityLabels = [
// 'walking', 'standing', 'sitting'
// ];
// StudyFactory
// .fetchStudy(
// $scope.id,
// [
// 'project_name', 'avg_moving_total',
// 'movement_density_total', 'avg_moving_spaces',
// 'movement_density_spaces', 'activities_split',
// 'study_accessibility_mean',
// 'printer_accessibility_mean_depth'
// ])
// .then(
// function(response) {
// $scope.study = response;
// console.log($scope.study.activities_split);
// for (var i = 0; i < $scope.activityLabels.length; i++) {
// $scope.activityValues
// .push($scope.study.activities_split[$scope.activityLabels[i]]);
// }
// HTTPFactory
// .backendGet(
// 'Occupancy?t=occ_per_space_and_round_prc&obsid=' +
// $scope.study.first_observation_id.content)
// .then(
// function(response) {
// $scope.spaces = response.data;
// var spaceMap = {};
// for (var i = 0; i < $scope.spaces.length; i++) {
// spaceMap[$scope.spaces[i].id] = $scope.spaces[i];
// }
// if ($scope.study.movement_density_spaces) {
// for (var i = 0; i < $scope.study.movement_density_spaces.length; i++) {
// var spaceID =
// parseInt($scope.study.movement_density_spaces[i].content.space_id);
// spaceMap[spaceID].sqm_per_walker = {
// content :
// parseFloat($scope.study.movement_density_spaces[i].content.sqm_per_walker)
// }
// }
// }
// }, function(error) {
// console.log(error);
// });
//
// // console.log(response);
// }, function(error) {
// console.log(error);
// });
// $scope.getSQM = function(number) {
// return number.toFixed(1) + 'm' + '\xB2';
// }
// $scope.getDepthmapMeasure = function(space, analysis_type) {
// HTTPFactory.backendGet(
// "GetDepthmapData?spaceid=" + space.id + "&measure=" + 9 +
// "&analysis_type=" + analysis_type).then(
// function(response) {
// // console.log(response.data);
// var promise = $modal.open({
// templateUrl : 'studies/dpmView.html',
// controller : 'dpmViewController',
// windowClass : 'planView',
// resolve : {
// img : function() {
// return space.img;
// },
// dpmData : function() {
// return response.data;
// }
// }
// });
// }, function(error) {
// console.log(error);
// });
// }
// HTTPFactory.backendGet(
// 'GetAll?t=study_parts&studyid=' + $scope.id).then(
// function(response) {
// $scope.observation_id = response.data[0]['id'];
// // HTTPFactory.backendGet(
// // Occupancy?t=avg_moving_total&obsid=' +
// // $scope.observation_id)
// // .then(function(response) {
// // $scope.avg_moving_total = response.data;
// // }, function(error) {
// // console.log(error);
// // });
// // HTTPFactory.backendGet(
// // 'Occupancy?t=avg_moving_building&obsid='
// // + $scope.observation_id).then(function(response) {
// // $scope.avg_moving_building = response.data;
// // }, function(error) {
// // console.log(error);
// // });
// // HTTPFactory.backendGet(
// // 'Occupancy?t=avg_moving_floor&obsid=' +
// // $scope.observation_id)
// // .then(function(response) {
// // $scope.avg_moving_floor = response.data;
// // }, function(error) {
// // console.log(error);
// // });
// // HTTPFactory.backendGet(
// // 'Occupancy?t=movement_density_total&obsid='
// // + $scope.observation_id).then(function(response) {
// // $scope.movement_density_total = response.data;
// // }, function(error) {
// // });
// // HTTPFactory.backendGet(
// // 'Occupancy?t=movement_density_building&obsid='
// // + $scope.observation_id).then(function(response) {
// // $scope.movement_density_building = response.data;
// // }, function(error) {
// // });
// // HTTPFactory.backendGet(
// // 'Occupancy?t=movement_density_floor&obsid='
// // + $scope.observation_id).then(function(response) {
// // $scope.movement_density_floor = response.data;
// // }, function(error) {
// // });
// }, function(error) {
// });
// }
// ]);

app
		.controller(
				'AllStudyIssuesCtrl',
				[
						'$scope',
						'$stateParams',
						'$modal',
						'$timeout',
						'StudyFactory',
						'HTTPFactory',
						'$http',
						function($scope, $stateParams, $modal, $timeout, StudyFactory,
								HTTPFactory, $http) {
							"use strict";
							$scope.id = $stateParams.studyid;
							// $scope.viewAlias = $stateParams.viewAlias;
							$scope.issue = $stateParams.issue;
							$scope.activityValues = [];
							$scope.activityLabels = [
									'walking', 'standing', 'sitting'
							];
							$scope.isNumber = function(metric) {
								return !metric.solution || !metric.solution.type ||
										metric.solution.type == 'number';
							};
							$scope.isTable = function(metric) {
								return metric.solution && metric.solution.type &&
										metric.solution.type == 'table';
							};
							$scope.isList = function(metric) {
								return metric.solution && metric.solution.type &&
										metric.solution.type == 'list';
							};
							var requiredStyles = [
									'background-color', 'border-left-color',
									'border-right-color', 'border-top-color',
									'border-bottom-color', 'color', 'font-family'
							];
							$scope.toAliasString = function(name) {
								return name.replace(/[^a-z0-9]/g, function(s) {
									var c = s.charCodeAt(0);
									if (c == 32)
										return '-';
									if (c >= 65 && c <= 90)
										return '_' + s.toLowerCase();
									return '__' + ('000' + c.toString(16)).slice(-4);
								});
							};
							$scope.hoverIn = function(metric) {
								$scope.hovered = metric;
							};

							$scope.hoverOut = function() {
								$scope.hovered = null;
							};
							$scope.isHovered = function(metric) {
								return $scope.hovered && $scope.hovered === metric;
							};
							$scope.toggle_no_of_decimals = function(metric) {
								if (metric.no_of_decimals &&
										typeof metric.no_of_decimals === 'string' &&
										metric.no_of_decimals.slice(0, 1) === 'i') {
									metric.no_of_decimals = metric.no_of_decimals.slice(1);
									return;
								}
								if (metric.no_of_decimals || metric.no_of_decimals === 0)
									metric.no_of_decimals = 'i' + metric.no_of_decimals;
							};
							$scope.downloadSVG = function(id) {
								var nid = $scope.toAliasString(id);
								var svgpar = document.getElementById(nid);

								var svg = svgpar.getElementsByTagName("svg")[0];

								svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
								var image_data = '<?xml version="1.0" encoding="utf-8" ' + //
								'standalone="no"?>' + //
								'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ' + //
								'"http://www.w3.org/Graphics/SVG/1.2/DTD/svg11.dtd">';
								image_data += svg.outerHTML.replace(/#/g, '%23');

								window.open('data:image/svg+xml;utf8,' + image_data, '_blank');

							};
							$scope.downloadEMF = function(id) {
								var nid = $scope.toAliasString(id);
								var svgpar = document.getElementById(nid);

								var svg = svgpar.getElementsByTagName("svg")[0];

								svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
								var image_data = '<?xml version="1.0" encoding="utf-8" ' + //
								'standalone="no"?>' + //
								'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ' + //
								'"http://www.w3.org/Graphics/SVG/1.2/DTD/svg11.dtd">';
								image_data += svg.outerHTML;
								var transform = function(data) {
									return $.param(data);
								};
								$http
										.post(
												HTTPFactory.getBackend() + "ConvertSVGToEMF",
												{
													data : image_data
												},
												{
													headers : {
														'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
													},
													transformRequest : transform
												}).success(function(data, status, headers, config) {
											var file = new Blob([
												data
											], {
												type : 'application/csv'
											});
											// trick to download store a file having its URL
											var fileURL = URL.createObjectURL(file);
											var a = document.createElement('a');
											a.href = fileURL;
											a.target = '_blank';
											a.download = 'chart.emf';
											document.body.appendChild(a);
											a.click();
										}).error(function(data, status, headers, config) {

										});
								// HTTPFactory.backendPost("ConvertSVGToEMF", {
								// data : image_data
								// }).then(function(response) {
								// console.log(response);
								// });

							};
							$scope.copyToClipboard = function(metric, id) {
								$scope.toggle_no_of_decimals(metric);
								$timeout(
										function() {
											var nid = $scope.toAliasString(id);
											var tbl = document.getElementById(nid);
											var el = tbl.getElementsByTagName('table')[0];
											var inliner = function(element, depth) {
												var i;
												if (element.nodeType !== 1 || depth > 100)
													return;
												var style = window.getComputedStyle(element);
												for (i = 0; i < requiredStyles.length; i++) {
													element.style[requiredStyles[i]] = style
															.getPropertyValue(requiredStyles[i]);
												}
												var children = element.childNodes;
												for (i = 0; i < children.length; i++) {
													inliner(children[i], depth + 1);
												}
											};
											inliner(el, 0);
											var data = el.outerHTML.replace(/\n/g, '').replace(
													/\s\s+/g, ' ');
											var template = "<div ng-init=\"func()\" style=\"padding:15px;\" class=\"text-center\">" +
													"<span class=\"text-center\">" +
													"Copy to clipboard: Ctrl+C, Enter" +
													"</span><br /><br />" +
													"<textarea onclick=\"this.focus();this.select()\" id=\"toCopy\" ng-keypress=\"ok();\">" +
													data +
													"</textarea><br /><br />" +
													"<button id=\"toCopyOK\" class=\"btn btn-primary\" ng-click=\"ok()\">OK</button>" +
													"</div>";
											var $modalInstance = $modal.open({
												template : template,
												controller : [
														'$scope', '$modalInstance',
														function($scope, $modalInstance) {
															$scope.func = function() {
																var txar = document.getElementById('toCopy');
																angular.element(txar).ready(function() {
																	txar.focus();
																	txar.select();
																});
															}
															$scope.ok = function() {
																$modalInstance.dismiss();
															}
														}
												],
												size : 'sm'
											});
											// can't use prompt because chromium has 2000 char limit
											// window.prompt("Copy to clipboard: Ctrl+C, Enter",
											// data);
											$scope.toggle_no_of_decimals(metric);
										}, 200);

								// return defer.promise;
							};
							$scope.getNameOrAlias = function(e) {
								if (e.name)
									return e.name;
								if (e.title)
									// return e.name + '(' + e.alias + ')';
									return e.title;
								return e.alias;
							};
							$scope.getSorterOrNameOrAlias = function(e) {
								if (e.sortby || e.sortby === 0)
									// return e.name + '(' + e.alias + ')';
									return e.sortby;
								if (e.name)
									return e.name;
								if (e.title)
									// return e.name + '(' + e.alias + ')';
									return e.title;
								return e.alias;
							};
							$scope.getCellContent = function(e, key, property) {
								if (e.solution.content.data[key.alias][property.alias]) {
									if (e.no_of_decimals !== null && !isNaN(e.no_of_decimals))
										return e.solution.content.data[key.alias][property.alias]
												.toFixed(e.no_of_decimals);
									// .toFixed(2);
									else
										return e.solution.content.data[key.alias][property.alias];
								}
								return '';
							};
							$scope.getContent = function(e) {
								if (e && e.solution && e.solution.content !== null &&
										e.solution.content !== undefined) {
									if (e.solution.content !== 'no data' &&
											e.no_of_decimals !== null &&
											e.no_of_decimals != undefined &&
											e.no_of_decimals != 'all' && e.solution.content.toFixed) {
										return e.solution.content.toFixed(e.no_of_decimals);
									} else
										return e.solution.content;
								}
								return 'fetching...';
							};
							$scope.issueNames = [];
							// read issues from json file
							// $http
							// .get("studies/originalIssues.json")
							// read issues from database

							// StudyFactory.storeOriginalMetrics();
							// return;
							HTTPFactory
									.backendGet("Issues")
									.then(
											function(response) {
												var i, j, newMetrics;
												$scope.wantedMetrics = response.data;
												var allMetrics = [
														'project_name', 'activities_split'
												];
												for (j = 0; j < $scope.wantedMetrics.length; j++) {
													var met = {
														id : $scope.wantedMetrics[j].id,
														title : $scope.wantedMetrics[j].title
													};
													$scope.issueNames.push(met);
												}
												$scope.pageTitle = 'Issues';
												if (!$scope.issue)
													$scope.wantedMetrics = [];
												if ($scope.issue && $scope.issue !== 'all') {
													var issues = $scope.issue.split(',');
													var all = false;
													for (j = 0; j < issues.length; j++) {
														if ($scope.issue === 'all') {
															all = true;
															break;
														}
													}
													if (!all) {
														newMetrics = [];
														for (j = 0; j < issues.length; j++) {
															for (i = 0; i < $scope.wantedMetrics.length; i++) {
																if ($scope.wantedMetrics[i].id.slice(0,
																		issues[j].length) === issues[j] &&
																		newMetrics.indexOf($scope.wantedMetrics[i]) === -1) {
																	newMetrics.push($scope.wantedMetrics[i]);
																}
															}
														}
														$scope.wantedMetrics = newMetrics;
													}
												}
												if (newMetrics && newMetrics.length == 1)
													$scope.pageTitle = 'Issue ' + newMetrics[0].id +
															": " + newMetrics[0].title;

												for (i = 0; i < $scope.wantedMetrics.length; i++) {
													for (j = 0; j < $scope.wantedMetrics[i].metrics.length; j++)
														allMetrics
																.push($scope.wantedMetrics[i].metrics[j].alias);
												}
												$scope.study = StudyFactory.fetchStudy($scope.id,
														allMetrics);
											});
							$scope.getSQM = function(number) {
								return number.toFixed(1) + 'm' + '\xB2';
							};
						}
				]);
app.directive('autoFocus', [
		'$timeout', function($timeout) {
			return {
				restrict : 'AC',
				link : function(_scope, _element) {
					$timeout(function() {
						_element[0].focus();
					}, 0);
				}
			};
		}
]);
app
		.factory(
				'StudyFactory',
				[
						'HTTPFactory',
						'$q',
						'$http',
						function(HTTPFactory, $q, $http) {
							"use strict";
							var loadedStudies = {};
							var getProperValue = function(value, type) {
								if (type) {
									if (type === "int") {
										return parseInt(value);
									} else if (type === "d") {
										return parseFloat(value);
									} else if (type === "json") {
										return JSON.parse(value);
									} else if (type === "mapint") {
										return value.map(function(d) {
											return parseInt(d);
										});
									} else {
										return value;
									}
								} else {
									return value;
								}
							};
							var knownFunctions = function(externalFuncs) {
								var that = this;
								var infuncs = {
									// TODO start funcs
									'observation_ids' : function(data) {
										var study_id = data[0];
										return {
											title : 'All Observation IDs',
											proc : 'get_observation_ids',
											params : function() {
												return {
													study_id : study_id,
												};
											},
											callback : function(response) {
												var ids = [];
												for (var i = 0; i < response.data.length; i++)
													ids.push(parseInt(response.data[i]));
												return {
													content : ids
												};
											}
										};
									},
									// 'first_observation_id' : function(data) {
									// var all = this['observation_ids'](data);
									// all.title = 'First Observation';
									// var allCallBack = all['callback'];
									// all.callback = function(response) {
									// var result = allCallBack(response);
									// result.title = 'First Observation';
									// result.content = result.content[0];
									// return result;
									// }
									// return all;
									// },
									'construct_ranges' : function(data) {
										var cats = data[0].content;
										return {
											title : 'Construct Ranges',
											get : function() {
												return {
													then : function(success, error) {
														var result = cats.map(function(d) {
															if (!d)
																return;
															var catname = d.split(':');
															var startend;
															if (catname[0]) {
																if (catname[0].indexOf('+') !== -1)
																	startend = [
																		parseFloat(catname[0].split('+')[0])
																	];
																else if (catname[0].indexOf('-') !== -1)
																	startend = catname[0].split("-").map(
																			function(d) {
																				return parseFloat(d);
																			});
																else
																	startend = [
																			parseFloat(catname[0]),
																			parseFloat(catname[0])
																	];

															}
															var rr = {
																start : 0
															};
															if (startend[0])
																rr.start = startend[0];
															if (startend[1])
																rr.end = startend[1];
															if (catname[1])
																rr.name = catname[1];
															else
																rr.name = catname[0];
															return rr;
														});
														var response = {
															data : result
														};
														success(response);
													}
												};
											},
											callback : function(response) {
												return {
													content : response.data,
													type : 'ranges'
												};
											}
										};
									},
									'get_range_array' : function(data) {
										var rr = data[0].content;
										return {
											title : 'Get range array',
											get : function() {
												return {
													then : function(success, error) {
														var result = rr.map(function(d) {
															var str = '' + d.start;
															if (d.end)
																str += '-' + d.end;
															else
																str += '+';
															return {
																alias : str,
																name : d.name
															};
														});
														var response = {
															data : result
														};
														success(response);
													}
												};
											},
											callback : function(response) {
												return {
													content : response.data
												};
											}
										};
									},
									'flatten_range' : function(data) {
										var rr = data[0].content;
										var property = data[1].content;
										return {
											title : 'Get range array (flat)',
											get : function() {
												return {
													then : function(success, error) {
														var result = rr.map(function(d) {
															return d[property].replace('+', '%2B');
														});
														var response = {
															data : result
														};
														success(response);
													}
												};
											},
											callback : function(response) {
												return {
													content : response.data
												};
											}
										};
									},
									'labelswitch' : function(data) {
										var din = data[0].content;
										var cats = data[1].content;
										return {
											title : 'Label switch',
											get : function() {
												return {
													then : function(success, error) {
														var result = '';
														for (var i = 0; i < cats.length; i++) {
															if (cats[i] && cats[i].end && cats[i].name &&
																	din >= cats[i].start && din <= cats[i].end) {
																result = cats[i].name;
																break;
															} else if (cats[i] && !cats[i].end &&
																	cats[i].name && din >= cats[i].start) {
																result = cats[i].name;
																break;
															}
														}
														var response = {
															data : result
														};
														success(response);
													}
												};
											},
											callback : function(response) {
												return {
													content : response.data
												};
											}
										};
									},
									'div' : function(data) {
										var num = data[0].content;
										var numType = data[0].type;
										var denom = data[1].content;
										var denomType = data[1].type;
										return {
											title : 'Division',
											get : function() {
												return {
													then : function(success, error) {
														var i, j, nobj;
														if (status === 201) {
															success(data[0]);
															return;
														}
														var response = {};
														if ((!numType || numType === "d" || numType === "int") &&
																(!denomType || denomType === "d" || denomType === "int")) {
															if (denom === 0) {
																response.type = 'error';
																response.status = 201;
																response.data = "Division by zero (" + num +
																		" / " + denom + ")";
															} else
																response.data = num / denom;
														} else if (numType == 'table' &&
																denomType != 'table') {
															response.type = 'table';
															response.data = {};
															response.data.keyType = num.keyType;
															response.data.keys = num.keys;
															response.data.properties = num.properties
																	.map(function(d) {
																		return {
																			alias : d.alias + "_div_" + denom
																		};
																	});
															response.data.data = {};
															for (i = 0; i < num.keys.length; i++) {
																nobj = {};
																for (j = 0; j < num.properties.length; j++)
																	nobj[response.data.properties[j].alias] = num.data[num.keys[i].alias][num.properties[j].alias] /
																			denom;
																response.data.data[num.keys[i].alias] = nobj;
															}
														} else if (numType != 'table' &&
																denomType == 'table') {
															response.type = 'table';
															response.data = {};
															response.data.keyType = denom.keyType;
															response.data.keys = denom.keys;
															response.data.properties = denom.properties
																	.map(function(d) {
																		return {
																			alias : num + "_div_" + d.alias
																		};
																	});
															response.data.data = {};
															for (i = 0; i < denom.keys.length; i++) {
																nobj = {};
																for (j = 0; j < denom.properties.length; j++)
																	nobj[response.data.properties[j].alias] = num /
																			denom.data[denom.keys[i].alias][denom.properties[j].alias];
																response.data.data[denom.keys[i].alias] = nobj;
															}
														} else if (numType == 'table' &&
																denomType == 'table' &&
																denom.keyType == num.keyType) {
															if (num.properties.length == 1 &&
																	denom.properties.length == 1) {
																response.type = 'table';
																response.data = {};
																response.data.keyType = denom.keyType;
																response.data.properties = [
																	{
																		alias : num.properties[0].alias + "_div_" +
																				denom.properties[0].alias
																	}
																];
																response.data.keys = [];
																response.data.data = {};
																for (i = 0; i < denom.keys.length; i++) {
																	var key = denom.keys[i];
																	var found = false;
																	// if (num.keys.indexOf(key) == -1)

																	for (j = 0; j < num.keys.length; j++) {
																		if (num.keys[j].alias == key.alias) {
																			found = true;
																			break;
																		}
																	}
																	if (!found)
																		continue;
																	response.data.keys.push(key);
																	nobj = {};
																	nobj[response.data.properties[0].alias] = num.data[key.alias][num.properties[0].alias] /
																			denom.data[key.alias][denom.properties[0].alias];
																	response.data.data[key.alias] = nobj;
																}
															}
														}
														success(response);
													}
												};
											},
											callback : function(response) {
												var result = {
													content : response.data
												};
												if (response.type)
													result.type = response.type;
												if (response.status)
													result.status = response.status;
												return result;
											}
										};
									},
									'mult' : function(data) {
										var i, j, k, key, nobj;
										var responseType = 'int';
										var properties = [];
										for (k = 0; k < data.length; k++) {
											if (data[k].type) {
												if (responseType !== 'table' && data[k].type === 'd') {
													responseType = 'd';
												} else if (data[k].type === 'table') {
													responseType = 'table';
													for (i = 0; i < data[k].content.properties.length; i++) {
														var prop = data[k].content.properties[i];
														var found = false;
														for (j = 0; j < properties.length; j++) {
															if (properties[j].alias === prop.alias) {
																found = true;
																break;
															}
														}
														if (found)
															continue;
														properties.push(prop);
													}
												}
											}
										}
										var rangeIndex = -1;
										if (responseType !== 'table')
											for (k = 0; k < data.length; k++) {
												if (data[k].type === 'ranges') {
													responseType = 'ranges';
													rangeIndex = k;
													break;
												}
											}
										return {
											title : 'Multiplication',
											get : function() {
												return {
													then : function(success, error) {
														var i, j, k, key, nobj;
														var response = {};
														if (responseType === 'table' &&
																properties.length === 1) {
															response.data = {};
															response.type = responseType;
															response.data.data = {};
															response.data.keys = [];
															response.data.properties = properties;
															for (k = 0; k < data.length; k++) {
																if (!('keyType' in response.data) &&
																		data[k].content.keyType) {
																	response.data.keyType = data[k].content.keyType;
																} else if (!('keyType' in data[k])) {
																	continue;
																} else if (response.data.keyType !== data[k].keyType) {
																	// TODO: dont allow multiplication of data of
																	// different
																	// types, throw exception
																	console
																			.error("can't multiply different types of data (" +
																					response.data.keyType +
																					" and " +
																					data[k].keyType + ")");
																	break;
																}
																for (i = 0; i < data[k].content.keys.length; i++) {
																	key = data[k].content.keys[i];
																	var found = false;
																	for (j = 0; j < response.data.keys.length; j++) {
																		if (response.data.keys[j].alias === key.alias) {
																			found = true;
																			break;
																		}
																	}
																	if (found)
																		continue;
																	response.data.keys.push(key);
																}
															}
															for (i = 0; i < response.data.keys.length; i++) {
																key = response.data.keys[i];
																nobj = 1;
																for (k = 0; k < data.length; k++) {
																	if (data[k].type === 'table' &&
																			key.alias in data[k].content.data) {
																		var prop = data[k].content.properties[0];
																		nobj *= data[k].content.data[key.alias][prop.alias];
																	} else
																		nobj *= data[k].content;
																}
																response.data.data[key.alias] = {};
																response.data.data[key.alias][response.data.properties[0].alias] = nobj;
															}
														} else if (rangeIndex != -1) {
															response.type = responseType;
															response.data = angular
																	.copy(data[rangeIndex].content);
															for (i = 0; i < data.length; i++) {
																if (i === rangeIndex)
																	continue;
																if (!data[i].type || data[i].type === "int" ||
																		data[i].type === "d")
																	for (j = 0; j < response.data.length; j++) {
																		response.data[j].start *= data[i].content;
																		if (response.data[j].end)
																			response.data[j].end *= data[i].content;
																	}
															}
														} else {
															response.data = 1;
															for (i = 0; i < data.length; i++) {
																response.data *= data[i].content;
															}
														}
														success(response);
													}
												};
											},
											callback : function(response) {
												var result = {
													content : response.data
												};
												if (response.type)
													result.type = response.type;
												return result;
											}
										};
									},
									'add' : function(data) {
										var responseType = 'int';
										var properties = [];
										for (var k = 0; k < data.length; k++) {
											if (data[k].type) {
												if (responseType !== 'table' && data[k].type === 'd') {
													responseType = 'd';
												} else if (data[k].type === 'table') {

													responseType = 'table';

													for (var i = 0; i < data[k].content.properties.length; i++) {
														var prop = data[k].content.properties[i];
														var found = false;
														for (var j = 0; j < properties.length; j++) {
															if (properties[j].alias === prop.alias) {
																found = true;
																break;
															}
														}
														if (found)
															continue;
														properties.push(prop);
													}
												}
											}
										}
										return {
											title : 'Addition',
											get : function() {
												return {
													then : function(success, error) {
														var i, j, k, key, response = {};
														if (responseType === 'table' &&
																properties.length === 1) {
															response.data = {};
															response.type = responseType;
															response.data.data = {};
															response.data.keys = [];
															response.data.properties = properties;
															for (k = 0; k < data.length; k++) {
																if (!('keyType' in response.data) &&
																		'keyType' in data[k].content) {
																	response.data.keyType = data[k].content.keyType;
																} else if (response.data.keyType !== data[k].content.keyType) {
																	// TODO: dont allow adding data of different
																	// types, throw exception
																	break;
																}
																for (i = 0; i < data[k].content.keys.length; i++) {
																	key = data[k].content.keys[i];
																	var found = false;
																	for (j = 0; j < response.data.keys.length; j++) {
																		if (response.data.keys[j].alias === key.alias) {
																			found = true;
																			break;
																		}
																	}
																	if (found)
																		continue;
																	response.data.keys.push(key);
																}
															}
															for (i = 0; i < response.data.keys.length; i++) {
																key = response.data.keys[i];
																var nobj = 0;
																for (k = 0; k < data.length; k++) {
																	if (data[k].type === 'table' &&
																			key.alias in data[k].content.data) {
																		var prop = data[k].content.properties[0];
																		nobj += data[k].content.data[key.alias][prop.alias];
																	} else if (data[k].type !== 'table')
																		nobj += data[k].content;
																}
																response.data.data[key.alias] = {};
																response.data.data[key.alias][response.data.properties[0].alias] = nobj;
															}
														} else {
															response.data = 0;
															for (i = 0; i < data.length; i++) {
																response.data += data[i].content;
															}
														}
														success(response);
													}
												};
											},
											callback : function(response) {
												var result = {
													content : response.data
												};
												if (response.type)
													result.type = response.type;
												return result;
											}
										};
									},
									'sub' : function(data) {
										var responseType = 'int';
										var properties = [];
										for (var k = 0; k < data.length; k++) {
											if (data[k].type) {
												if (responseType !== 'table' && data[k].type === 'd') {
													responseType = 'd';
												} else if (data[k].type === 'table') {

													responseType = 'table';

													for (var i = 0; i < data[k].content.properties.length; i++) {
														var prop = data[k].content.properties[i];
														var found = false;
														for (var j = 0; j < properties.length; j++) {
															if (properties[j].alias === prop.alias) {
																found = true;
																break;
															}
														}
														if (found)
															continue;
														properties.push(prop);
													}
												}
											}
										}
										return {
											title : 'Subtraction',
											get : function() {
												return {
													then : function(success, error) {
														var i, j, k, key, nobj;
														var response = {};
														if (responseType === 'table' &&
																properties.length === 1) {
															response.data = {};
															response.type = responseType;
															response.data.data = {};
															response.data.keys = [];
															response.data.properties = properties;
															for (k = 0; k < data.length; k++) {
																if (!('keyType' in response.data)) {
																	response.data.keyType = data[k].content.keyType;
																} else if (response.data.keyType !== data[k].keyType) {
																	// TODO: dont allow adding data of different
																	// types, throw exception
																	break;
																}
																for (i = 0; i < data[k].content.keys.length; i++) {
																	key = data[k].content.keys[i];
																	found = false;
																	for (j = 0; j < response.data.keys.length; j++) {
																		if (response.data.keys[j].alias === key.alias) {
																			found = true;
																			break;
																		}
																	}
																	if (found)
																		continue;
																	response.data.keys.push(key);
																}
															}
															for (i = 0; i < response.data.keys.length; i++) {
																key = response.data.keys[i];
																nobj = 0;
																for (k = 0; k < data.length; k++) {
																	if (data[k].type === 'table' &&
																			key.alias in data[k].content.data) {
																		var prop = data[k].content.properties[0];
																		if (k === 0)
																			nobj = data[k].content.data[key.alias][prop.alias];
																		else
																			nobj -= data[k].content.data[key.alias][prop.alias];
																	} else {
																		if (k === 0)
																			nobj = data[k].content;
																		else
																			nobj -= data[k].content;
																	}
																}
																response.data.data[key.alias] = {};
																response.data.data[key.alias][response.data.properties[0].alias] = nobj;
															}
														} else {
															response.data = data[0].content;
															for (i = 1; i < data.length; i++) {
																response.data -= data[i].content;
															}
															response.type = responseType;
														}
														success(response);
													}
												};
											},
											callback : function(response) {
												var result = {
													content : response.data
												};
												if (response.type)
													result.type = response.type;
												return result;
											}
										};
									},
									'prc' : function(data) {
										var param1 = data[0].content;
										return {
											title : 'Percent',
											get : function() {
												return {
													then : function(success, error) {
														var response = {
															data : param1 * 100
														};
														success(response);
													}
												};
											},
											callback : function(response) {
												return {
													content : parseFloat(response.data),
													units : "%"
												};
											}
										};
									},
									'table_prc' : function(data) {
										var status = data[0].status;
										var param1 = data[0].content;
										return {
											title : 'Percent',
											get : function() {
												return {
													then : function(success, error) {
														var i, j, k;
														if (status === 201) {
															success(data[0]);
															return;
														}
														var keys = param1.keys;
														var prop = param1.properties;
														var propTotals = {};
														for (k = 0; k < prop.length; k++) {
															propTotals[prop[k].alias] = 0;
														}
														for (j = 0; j < keys.length; j++) {
															for (k = 0; k < prop.length; k++) {
																if (param1.data[keys[j].alias][prop[k].alias])
																	propTotals[prop[k].alias] += param1.data[keys[j].alias][prop[k].alias];
															}
														}
														var newData = {};
														for (j = 0; j < keys.length; j++) {
															var dt = {};
															for (k = 0; k < prop.length; k++) {
																if (param1.data[keys[j].alias][prop[k].alias])
																	dt[prop[k].alias + "_prc"] = (100 * param1.data[keys[j].alias][prop[k].alias] / propTotals[prop[k].alias]);// .toFixed(2);
															}
															newData[keys[j].alias] = dt;
														}
														var result = {
															keyType : param1.keyType,
															keys : param1.keys.slice(),
															properties : param1.properties.map(function(d) {
																var n = angular.copy(d);
																// for (var k = 0; k < prop.length; k++) {
																// n[prop[k].alias + "_prc"] = n[prop[k]];
																// delete n[prop[k]];
																n.alias += "_prc";
																// }
																return n;

															}),
															data : newData
														};
														// console.log(result);
														var response = {
															data : result
														};
														success(response);
													}
												};
											},
											callback : function(response) {
												return {
													type : 'table',
													content : response.data,
													units : "%"
												};
											}
										};
									},
									'join_arrays' : function(data) {
										var array1 = data[0].content;
										var array2 = data[1].content;
										return {
											title : 'Join arrays',
											get : function() {
												return {
													then : function(success, error) {
														if (status === 201) {
															success(data[0]);
															return;
														}
														var response = {
															data : array1.concat(array2)
														};
														success(response);
													}
												};
											},
											callback : function(response) {
												var result = {
													content : response.data
												};
												if (response.type)
													result.type = response.type;
												return result;
											}
										};
									},
									'table_transpose' : function(data) {
										var table = data[0].content;
										return {
											title : 'Transpose table',
											get : function() {
												return {
													then : function(success, error) {
														if (status === 201) {
															success(data[0]);
															return;
														}
														var response = {
															data : {}
														};
														response.data.properties = table.keys;
														response.data.keys = table.properties;
														response.data.keyType = table.keyType;
														response.type = 'table';
														response.data.data = {};
														for (var i = 0; i < table.properties.length; i++) {
															var prop = table.properties[i].alias;
															response.data.data[prop] = {};
															for (var j = 0; j < table.keys.length; j++) {
																var key = table.keys[j].alias;
																response.data.data[prop][key] = table.data[key][prop];

															}
														}
														success(response);
													}
												};
											},
											callback : function(response) {
												var result = {
													content : response.data
												};
												if (response.type)
													result.type = response.type;
												return result;
											}
										};
									},
									/*
									 * Appends tables one under the other
									 */
									'table_union' : function(data) {
										var t1info = JSON.parse(data[0].content);
										var table1 = data[1].content;
										var t2info = JSON.parse(data[2].content);
										var table2 = data[3].content;
										return {
											title : 'Union tables',
											get : function() {
												return {
													then : function(success, error) {
														var i, j, prop, key, nkeyAlias, dataVal, kfound, newKey;
														if (status === 201) {
															success(data[0]);
															return;
														}
														var response = {
															data : {}
														};
														response.type = 'table';
														response.data.keyType = table1.keyType;
														response.data.properties = [];
														var setPropFunc = function(val, key) {
															prop[key] = val;
														};
														for (i = 0; i < table1.properties.length; i++) {
															for (j = 0; j < table2.properties.length; j++) {
																if (table1.properties[i].alias === table2.properties[j].alias) {
																	prop = {};
																	angular.forEach(table1.properties[i],
																			setPropFunc);
																	response.data.properties.push(prop);
																	break;
																}
															}
														}
														if (response.data.properties.length > 0) {
															response.data.keys = [];
															response.data.data = {};
															for (i = 0; i < table1.keys.length; i++) {
																key = table1.keys[i].alias;
																nkeyAlias = t1info.alias + table1.keys[i].alias;
																dataVal = table1.data[key];
																kfound = false;
																for (i = 0; i < response.data.properties.length; i++) {
																	prop = response.data.properties[i].alias;
																	if (prop in dataVal) {
																		if (!kfound) {
																			newKey = angular.copy(table1.keys[i]);
																			newKey.alias = nkeyAlias;
																			if (t1info.rename)
																				newKey.name = (t1info.name ? t1info.name
																						: t1info.alias);
																			else
																				newKey.name = newKey.name +
																						" (" +
																						(t1info.name ? t1info.name
																								: t1info.alias) + ")";
																			response.data.keys.push(newKey);
																			response.data.data[nkeyAlias] = {};
																			kfound = true;
																		}
																		response.data.data[nkeyAlias][prop] = dataVal[prop];
																	}
																}
															}
															for (i = 0; i < table2.keys.length; i++) {
																key = table2.keys[i].alias;
																nkeyAlias = t2info.alias + table2.keys[i].alias;
																dataVal = table2.data[key];
																kfound = false;
																for (i = 0; i < response.data.properties.length; i++) {
																	prop = response.data.properties[i].alias;
																	if (prop in dataVal) {
																		if (!kfound) {
																			newKey = angular.copy(table2.keys[i]);
																			newKey.alias = nkeyAlias;
																			if (t2info.rename)
																				newKey.name = (t2info.name ? t2info.name
																						: t2info.alias);
																			else
																				newKey.name = newKey.name +
																						" (" +
																						(t2info.name ? t2info.name
																								: t2info.alias) + ")";
																			response.data.keys.push(newKey);
																			response.data.data[nkeyAlias] = {};
																			kfound = true;
																		}
																		response.data.data[nkeyAlias][prop] = dataVal[prop];
																	}
																}
															}
														}
														success(response);
													}
												};
											},
											callback : function(response) {
												var result = {
													content : response.data
												};
												if (response.type)
													result.type = response.type;
												return result;
											}
										};
									},

									/*
									 * Appends tables as columns. Must have same key type
									 */
									'table_join' : function(data) {
										var tables = data[0].content;
										return {
											title : 'Join tables',
											allowNoData : true,
											get : function() {
												return {
													then : function(success, error) {
														var i, j, k, prop, key, nkeyAlias, dataVal, kfound, newKey;
														if (status === 201) {
															success(data[0]);
															return;
														}
														var response = {
															data : {}
														};
														response.data.keys = [];
														response.data.data = {};
														for (i = 0; i < tables.length; i++) {
															if (!response.data.keyType)
																response.data.keyType = tables[i].content.keyType;
															else if (tables[i].content.keyType !== response.data.keyType) {
																// throw error, key type does not match
																// success({
																// status : 201,
																// data : 'error'
																// });
																// return;
																continue;
															}
															for (j = 0; j < tables[i].content.keys.length; j++) {
																var key = tables[i].content.keys[j];
																var found = false;
																for (k = 0; k < response.data.keys.length; k++) {
																	if (response.data.keys[k].alias === key.alias) {
																		found = true;
																		break;
																	}
																}
																if (!found) {
																	response.data.keys.push(key);
																	response.data.data[key.alias] = {};
																}
															}
														}
														response.type = 'table';
														response.data.properties = [];

														for (i = 0; i < tables.length; i++) {
															if (!tables[i].content.properties) {
																// for (k = 0; k <
																// tables[i].content.keys.length; k++) {
																// var key = tables[i].content.keys[k];
																// response.data.data[key.alias][newProperty.alias]
																// =
																// tables[i].content.data[key.alias][tables[i].content.properties[j].alias]
																// }
																continue;
															}
															for (j = 0; j < tables[i].content.properties.length; j++) {
																var newProperty = {};
																newProperty.alias = tables[i].metricData.alias +
																		'-' + tables[i].content.properties[j].alias;
																newProperty.title = tables[i].metricData.title;
																// tables[i].content.properties[j];
																response.data.properties.push(newProperty);
																// var newPropertyAlias = .alias +
																// "-" + property.alias;
																for (k = 0; k < tables[i].content.keys.length; k++) {
																	var key = tables[i].content.keys[k];
																	response.data.data[key.alias][newProperty.alias] = tables[i].content.data[key.alias][tables[i].content.properties[j].alias]
																}
															}
														}
														success(response);
													}
												};
											},
											callback : function(response) {
												var result = {
													content : response.data
												};
												if (response.type)
													result.type = response.type;
												return result;
											}
										};
									},

									/*
									 * Combines multiple metrics into an array
									 */
									'as_array' : function(data) {
										return {
											title : 'As array',
											allowNoData : true,
											get : function() {
												return {
													then : function(success, error) {
														var i;
														if (status === 201) {
															success(data[0]);
															return;
														}
														var response = {
															data : []
														};
														for (i = 0; i < data.length; i++) {
															response.data.push(data[i]);
														}
														response.type = 'array';
														success(response);
													}
												};
											},
											callback : function(response) {
												var result = {
													content : response.data
												};
												if (response.type)
													result.type = response.type;
												return result;
											}
										};
									},
									'table_sum' : function(data) {
										var table = data[0].content;
										var property;
										var weights;
										if (data[1] && data[1].content)
											property = data[1].content;
										if (data[2] && data[2].content)
											weights = data[2].content;
										// TODO: instead of doing this maybe its better to multiply
										// a table with a list...?
										return {
											title : 'Get average value(s)',
											get : function() {
												return {
													then : function(success, error) {
														var i, j;
														if (status === 201) {
															success(data[0]);
															return;
														}
														var response = {
															data : {}
														};
														response.data.properties = [];
														response.data.keyType = table.keyType;
														var comparePropIndices = [];
														if (property) {
															for (i = 0; i < table.properties.length; i++) {
																if (table.properties[i].alias === property) {
																	comparePropIndices.push(i);
																	response.data.properties.push(property);
																	break;
																}
															}
														} else
															for (i = 0; i < table.properties.length; i++) {
																response.data.properties
																		.push(table.properties[i]);
																comparePropIndices.push(i);
															}
														response.type = 'table';
														response.data.keys = [
															{
																alias : 'sum',
																name : 'Sum'
															}
														];
														response.data.data = {
															'sum' : {}
														};
														var w = {};
														if (weights)
															for (i = 0; i < weights.length; i++) {
																w[weights[i].alias] = weights[i].mark;
															}
														for (j = 0; j < comparePropIndices.length; j++) {
															var sumVal = 0;
															for (i = 0; i < table.keys.length; i++) {
																var dt = table.data[table.keys[i].alias][table.properties[comparePropIndices[j]].alias];
																if (dt) {
																	if (w[table.keys[i].alias])
																		dt *= w[table.keys[i].alias];

																	sumVal += dt;
																}
															}
															var sumKey = 'sum';
															response.data.data[sumKey][table.properties[comparePropIndices[j]].alias] = sumVal;
														}
														success(response);
													}
												};
											},
											callback : function(response) {
												var result = {
													content : response.data
												};
												if (response.type)
													result.type = response.type;
												return result;
											}
										};
									},
									// 'table_right_sum' : function(data) {
									// var table = data[0].content;
									// var key;
									// var weights;
									// if (data[1] && data[1].content)
									// key = data[1].content;
									// if (data[2] && data[2].content)
									// weights = data[2].content;
									// // a table with a list...?
									// return {
									// name : 'Get average value(s)',
									// get : function() {
									// return {
									// then : function(success, error) {
									// if (status === 201) {
									// success(data[0]);
									// return;
									// }
									// var response = {
									// data : {}
									// }
									// response.data.keys = [];
									// response.data.keyType = table.keyType;
									// var comparePropIndices = [];
									// if (key) {
									// for (var i = 0; i < table.keys.length; i++) {
									// if (table.keys[i].alias === key) {
									// comparePropIndices.push(i);
									// response.data.keys.push(key);
									// break;
									// }
									// }
									// } else
									// for (var i = 0; i < table.keys.length; i++) {
									// response.data.keys
									// .push(table.keys[i]);
									// comparePropIndices.push(i);
									// }
									// response.type = 'table';
									// response.data.properties = [
									// {
									// alias : 'sum',
									// name : 'Sum'
									// }
									// ];
									// response.data.data = {
									// 'sum' : {}
									// };
									// // var w = {};
									// // if (weights)
									// // for (var i = 0; i < weights.length; i++) {
									// // w[weights[i].alias] = weights[i].mark;
									// // }
									//
									// for (var j = 0; j < comparePropIndices.length; j++) {
									// var sumVal = 0;
									// for (var i = 0; i < table.properties.length; i++) {
									// var dt =
									// table.data[table.keys[comparePropIndices[j]].alias][table.properties[i].alias];
									// if (dt) {
									// // if (w[table.properties[i].alias])
									// // dt *= w[table.properties[i].alias];
									// sumVal += dt;
									// }
									// }
									// response.data.data[comparePropIndices[j]][table.properties['sum'].alias]
									// = sumVal;
									// }
									// success(response);
									// }
									// };
									// },
									// callback : function(response) {
									// var result = {
									// content : response.data
									// };
									// if (response.type)
									// result.type = response.type;
									// return result;
									// }
									// };
									// },
									'table_avg' : function(data) {
										var table = data[0].content;
										var property;
										if (data[1])
											property = data[1].content;
										return {
											title : 'Get average value(s)',
											get : function() {
												return {
													then : function(success, error) {
														var i;
														if (status === 201) {
															success(data[0]);
															return;
														}
														var response = {
															data : {}
														};
														response.data.properties = angular
																.copy(table.properties);
														response.data.keyType = table.keyType;
														var comparePropIndex = 0;
														if (property)
															for (i = 0; i < table.properties.length; i++) {
																if (table.properties[i].alias === property) {
																	comparePropIndex = i;
																	break;
																}
															}
														var avgVal = 0;
														for (i = 0; i < table.keys.length; i++) {
															avgVal += table.data[table.keys[i].alias][table.properties[comparePropIndex].alias];

														}
														avgVal /= table.keys.length;
														response.type = 'table';
														response.data.keys = [
															{
																alias : 'avg',
																name : 'Average'
															}
														];
														response.data.data = {
															'avg' : {}
														};
														var avgKey = 'avg';
														response.data.data[avgKey][table.properties[comparePropIndex].alias] = avgVal;
														var propTotals = {};
														success(response);
													}
												};
											},
											callback : function(response) {
												var result = {
													content : response.data
												};
												if (response.type)
													result.type = response.type;
												return result;
											}
										};
									},
									'table_max' : function(data) {
										var table = data[0].content;
										var property;
										if (data[1])
											property = data[1].content;
										return {
											title : 'Get maximum value(s)',
											get : function() {
												return {
													then : function(success, error) {
														var i, j;
														if (status === 201) {
															success(data[0]);
															return;
														}
														var response = {
															data : {}
														};
														response.data.properties = angular
																.copy(table.properties);
														response.data.keyType = table.keyType;
														var comparePropIndex = 0;
														if (property)
															for (i = 0; i < table.properties.length; i++) {
																if (table.properties[i].alias === property) {
																	comparePropIndex = i;
																	break;
																}
															}
														var maxKeys = [
															table.keys[0]
														];
														var maxVal = table.data[table.keys[0].alias][table.properties[comparePropIndex].alias];
														for (i = 0; i < table.keys.length; i++) {
															var newVal = table.data[table.keys[i].alias][table.properties[comparePropIndex].alias];
															if (newVal > maxVal) {
																maxVal = newVal;
																maxKeys = [
																	table.keys[i]
																];
																continue;
															}
															var found = false;
															for (j = 0; j < maxKeys.length; j++)
																if (maxKeys[j].alias === table.keys[i].alias) {
																	found = true;
																	break;
																}
															if (newVal === maxVal && !found) {
																maxKeys.push(table.keys[i]);
															}
														}
														response.data.keys = maxKeys;
														response.data.data = {};
														for (i = 0; i < maxKeys.length; i++)
															response.data.data[maxKeys[i].alias] = table.data[maxKeys[i].alias];
														var propTotals = {};
														success(response);
													}
												};
											},
											callback : function(response) {
												return {
													type : 'table',
													content : response.data
												};
											}
										};
									},
									'table_min' : function(data) {
										var table = data[0].content;
										var property;
										if (data[1])
											property = data[1].content;
										return {
											title : 'Get minumum value(s)',
											get : function() {
												return {
													then : function(success, error) {
														var i, j;
														if (status === 201) {
															success(data[0]);
															return;
														}
														var response = {
															data : {}
														};
														response.data.properties = angular
																.copy(table.properties);
														response.data.keyType = table.keyType;
														var comparePropIndex = 0;
														if (property)
															for (i = 0; i < table.properties.length; i++) {
																if (table.properties[i].alias === property) {
																	comparePropIndex = i;
																	break;
																}
															}
														var minKeys = [
															table.keys[0]
														];
														var minVal = table.data[table.keys[0].alias][table.properties[comparePropIndex].alias];
														for (i = 0; i < table.keys.length; i++) {
															var newVal = table.data[table.keys[i].alias][table.properties[comparePropIndex].alias];
															if (newVal < minVal) {
																minVal = newVal;
																minKeys = [
																	table.keys[i]
																];
																continue;
															}
															var found = false;
															for (j = 0; j < minKeys.length; j++)
																if (minKeys[j].alias === table.keys[i].alias) {
																	found = true;
																	break;
																}
															if (newVal === minVal && !found) {
																minKeys.push(table.keys[i]);
															}
														}
														response.data.keys = minKeys;
														response.data.data = {};
														for (i = 0; i < minKeys.length; i++)
															response.data.data[minKeys[i].alias] = table.data[minKeys[i].alias];
														var propTotals = {};
														success(response);
													}
												};
											},
											callback : function(response) {
												return {
													type : 'table',
													content : response.data
												};
											}
										};
									},
								};
								return {
									hasInternalFunction : function(wantedFunc) {
										return typeof infuncs[wantedFunc] === 'function';
									},
									fetchFunction : function(wantedFunc, inputs) {
										var f;
										var extf = externalFuncs[wantedFunc];
										if (extf) {
											var procInputs = [];
											var keyIndex = -1;
											var propertyIndex = -1;
											if (extf.ilk === "proc")
												for (var i = 0; i < extf.inputs.length; i++) {
													if (extf.inputs[i].proc)
														procInputs.push(extf.inputs[i].alias);
													if (extf.key_data &&
															extf.key_data === extf.inputs[i].alias)
														keyIndex = i;
													if (extf.property_data &&
															extf.property_data === extf.inputs[i].alias)
														propertyIndex = i;
												}
											if (procInputs.length > inputs.length)
												console.error("wrong number of inputs");
											f = {};
											if (extf.title)
												f.title = extf.title;
											if (extf.units)
												f.units = extf.units;
											if (extf.units_full)
												f.units_full = extf.units_full;
											if (extf.ilk === "proc") {
												f.proc = wantedFunc;
												f.params = function() {
													var prm = {};
													for (var i = 0; i < procInputs.length; i++)
														prm[procInputs[i]] = inputs[i];
													return prm;
												};
												f.callback = function(response) {
													var result = {};
													if (extf.datum_type === "unpack" ||
															extf.datum_type === "unpack_mega") {
														if (!response.data || !response.data[0])
															return {
																status : 201,
																type : 'error',
																content : 'no data'
															};
														result.content = unpack(JSON
																.parse(response.data[0]),
																extf.datum_type === "unpack_mega");

														if (keyIndex != -1) {
															if (inputs[keyIndex] && inputs[keyIndex].content) {
																setKeyData(result.content,
																		inputs[keyIndex].content,
																		extf.key_data_match);
															}
														}
														if (propertyIndex != -1) {
															if (inputs[propertyIndex] &&
																	inputs[propertyIndex].content) {
																setPropertyData(result.content,
																		inputs[propertyIndex].content,
																		extf.property_data_match);
															}
														}

													} else if (extf.datum_type === "list") {
														if (!response.data)
															return {
																status : 201,
																type : 'error',
																content : 'no data'
															};
														result.content = response.data.map(function(d) {
															return {
																name : d
															};
														});
													} else if (extf.datum_type === "json") {
														if (!response.data)
															return {
																status : 201,
																type : 'error',
																content : 'no data'
															};
														// TODO: exception here needs to be made as the
														// above (essentially wrap the replies with an
														// array) and remove this condition and let
														// getProperValue handle it
														result.content = JSON.parse(response.data);
													} else if (extf.datum_type === "mapint") {
														// TODO same as above
														if (!response.data)
															return {
																status : 201,
																type : 'error',
																content : 'no data'
															};
														result.content = response.data.map(function(d) {
															return parseInt(d);
														});
													} else
														result.content = getProperValue(response.data[0],
																extf.datum_type);
													if (extf.datum_type === "unpack" ||
															extf.datum_type === "unpack_mega")
														result.type = "table";
													else
														result.type = extf.datum_type;
													return result;
												};
											}
											return f;
										}
										f = infuncs[wantedFunc](inputs);
										// console.log(f);
										return f;
									}
								};
							};
							// TODO end of funcs

							var setPropertyData = function(unpacked, data, dataMatchKey) {
								for (var i = 0; i < unpacked.properties.length; i++) {
									var matchKey = unpacked.properties[i].matchKey;
									if (!dataMatchKey)
										dataMatchKey = matchKey;
									for (var j = 0; j < data.length; j++) {
										if (dataMatchKey in data[j] &&
												unpacked.properties[i][matchKey] == data[j][dataMatchKey]) {
											var keys = Object.keys(data[j]);
											for (var k = 0; k < keys.length; k++) {
												if (keys[k] != dataMatchKey)
													unpacked.properties[i][keys[k]] = data[j][keys[k]];
											}
											break;
										}
									}
								}
							};
							var setKeyData = function(unpacked, data, dataMatchKey) {
								for (var i = 0; i < unpacked.keys.length; i++) {
									var matchKey = unpacked.keys[i].matchKey;
									if (!dataMatchKey)
										dataMatchKey = matchKey;
									for (var j = 0; j < data.length; j++) {
										if (dataMatchKey in data[j] &&
												unpacked.keys[i][matchKey] == data[j][dataMatchKey]) {
											var keys = Object.keys(data[j]);
											for (var k = 0; k < keys.length; k++) {
												if (keys[k] != dataMatchKey)
													unpacked.keys[i][keys[k]] = data[j][keys[k]];
											}
											break;
										}
									}
								}
							};
							var unpack = function(packed, mega) {
								var i, j, k, o;
								var result = {};
								var keys = Object.keys(packed[0]);
								if (mega) {
									var unpacked = [];
									for (i = 0; i < packed.length; i++) {
										var pKeys = Object.keys(packed[i]);
										var out = unpack(packed[i].data);
										out.matchKey = pKeys[0];
										out[pKeys[0]] = packed[i][pKeys[0]];
										unpacked.push(out);
									}

									result.keys = [];
									result.properties = [];
									var uniqueProperties = [];
									result.data = {};
									for (i = 0; i < unpacked.length; i++) {
										o = unpacked[i];
										for (j = 0; j < o.keys.length; j++) {
											// if (result.keys.indexOf(o.keys[j]) == -1)

											var found = false;
											// if (num.keys.indexOf(key) == -1)

											for (k = 0; k < result.keys.length; k++) {
												if (result.keys[k].alias == o.keys[j].alias) {
													found = true;
													break;
												}
											}
											if (found)
												continue;
											result.keys.push(o.keys[j]);
										}
										for (j = 0; j < o.properties.length; j++)
											if (uniqueProperties.indexOf(o.properties[j].alias) == -1)
												uniqueProperties.push(o.properties[j].alias);
									}
									if (uniqueProperties.length == 1) {
										result.keyType = uniqueProperties[0];
									}
									for (i = 0; i < unpacked.length; i++) {
										o = unpacked[i];
										// console.log(o);
										for (j = 0; j < o.properties.length; j++) {
											var newProp = o.properties[j].alias + "_" + o.matchKey +
													"_" + o[o.matchKey];
											var np = {
												alias : newProp
											};
											np.matchKey = o.matchKey;
											np[o.matchKey] = o[o.matchKey];
											result.properties.push(np);
											for (k = 0; k < o.keys.length; k++) {
												if (!(o.keys[k].alias in result.data))
													result.data[o.keys[k].alias] = {};
												result.data[o.keys[k].alias][newProp] = o.data[o.keys[k].alias][o.properties[j].alias];
											}
										}
									}
								} else {
									// first key is the keyType
									result.keyType = keys[0];
									result.properties = [];
									angular.forEach(keys, function(p) {
										// ignore 'sortby' key to use for sorting
										if (p != result.keyType && p !== 'sortby')
											result.properties.push({
												alias : p
											});
									});
									result.keys = [];
									result.data = {};
									var unpackFunc = function(val, key) {
										// if (p != d[result.keyType])
										if (key !== result.keyType && key !== 'sortby')
											unpackedVal[key] = val;
									};
									for (i = 0; i < packed.length; i++) {
										var packelm = packed[i];
										var unpackedVal = {};

										var resultKey = {
											matchKey : result.keyType,
											alias : packelm[result.keyType]
										};
										resultKey[result.keyType] = packelm[result.keyType];
										if (packelm.sortby !== null)
											resultKey.sortby = packelm.sortby;
										result.keys.push(resultKey);

										angular.forEach(packelm, unpackFunc);
										var res = {};
										result.data[packelm[result.keyType]] = unpackedVal;
									}
								}

								return result;
							};

							var fetchMetric = function(measureFunc) {
								var deferred = $q.defer();
								var getter;
								if (measureFunc.proc) {
									// procedure-server metric, needs to be fetched
									var paramString = "";
									var params = measureFunc.params();
									if (params) {
										angular.forEach(params, function(value, key) {
											// console.log(measure.proc, value, key);
											paramString += "&";
											if (value.content && typeof value.content === 'string')
												paramString += key + "=" + value.content;
											else if (value.content && value.content.length)
												paramString += key + "=[" + value.content + "]";
											else
												paramString += key + "=" + value.content;
										});
									}
									getter = HTTPFactory.backendGet('Occupancy?t=' +
											measureFunc.proc + paramString);
								} else
									// local metric, just get()
									getter = measureFunc.get();
								getter.then(function(response) {
									if (response.status && response.status === 201) {
										deferred.resolve({
											title : measureFunc.title,
											content : response.data[0].error,
											status : 201,
											type : 'error'
										});
									} else
										deferred.resolve(measureFunc.callback(response));
								}, function(error) {
									// console.log(error);
								});
								return deferred.promise;
							};
							var createMetric = function(knownMeasures, args, measure) {
								if (measure.funcName)
									return measure;
								var promises = [];
								for (var i = 0; i < measure.inputs.length; i++) {
									var input = measure.inputs[i];
									var nobj;
									// if (input.promise)
									// promises.push(input.promise);
									// else
									if (input.ilk === "c") {
										var content;
										nobj = {
											content : getProperValue(input.datum, input.datum_type)
										};

										promises.push($q.when(nobj));
									} else if (input.ilk == "i") {
										nobj = {
											content : getProperValue(args[input.datum],
													input.datum_type)
										};
										promises.push($q.when(nobj));
									} else if (input.ilk === "m") {
										// console.log(input.datum);
										var m = knownMeasures[input.datum].measure;
										// if (m.funcName) {
										// // if (typeof m.solveObj === 'object') {
										// promises.push($q.when(m));
										// } else {
										nobj = createMetric(knownMeasures, args, m);
										if (input.title)
											nobj.metricData.title = input.title;
										knownMeasures[input.datum].measure = nobj;
										promises.push($q.when(nobj));
										// }
									} else if (input.ilk == "f") {
										nobj = createMetric(knownMeasures, args, input);
										promises.push($q.when(nobj));
									} else {
										console.error("METRIC TYPE (" + input.ilk + ") UNKNOWN");
									}
								}
								var result = {
									metricData : measure,
									funcName : measure.datum,
									promises : promises
								};
								return result;
							};
							/**
							 * Fetches dependencies and eventually resolves the metric putting
							 * it into the measure variable. angular.copy(var1,var2) will
							 * erase all fields in var2 and copy over the fields from var1
							 */
							var resolveMetric = function(measure, knownFunctions) {
								if (measure.solveObj)
									return measure.solveObj;
								var promiseOut = $q.defer();
								measure.solveObj = promiseOut.promise;
								var allprom = $q.all(measure.promises);
								allprom.then(function(result) {
									var internalPromises = [];
									for (var i = 0; i < result.length; i++) {
										if (result[i].promises) {
											internalPromises.push(resolveMetric(result[i],
													knownFunctions));
										} else
											internalPromises.push($q.when(result[i]));
									}
									$q.all(internalPromises).then(
											function(solvedMeasures) {
												var measureFunc = knownFunctions.fetchFunction(
														measure.funcName, solvedMeasures);
												if (!measureFunc.allowNoData)
													for (var i = 0; i < solvedMeasures.length; i++) {
														if (solvedMeasures[i].status &&
																solvedMeasures[i].status === 201) {
															var result = angular.copy(solvedMeasures[i]);
															result.metricData = measure.metricData;
															angular.copy(result, measure);
															promiseOut.resolve(result);
															return;
														}
													}
												fetchMetric(measureFunc).then(function(result) {
													result.metricData = measure.metricData;
													angular.copy(result, measure);
													promiseOut.resolve(result);
												});
											});
								});
								return promiseOut.promise;
							};
							var out = {
								storeOriginalMetrics : function() {
									var promises = [];
									promises.push($http.get("studies/originalMetrics.json"));
									promises.push($http.get("studies/originalFunctions.json"));
									promises.push($http.get("studies/originalIssues.json"));
									$q.all(promises).then(function(response) {

										var knownMetrics = response[0].data;
										var knownExtFunctions = response[1].data;
										var knownIssues = response[2].data;

										function sleep(milliseconds) {
											var start = new Date().getTime();
											for (var i = 0; i < 1e7; i++) {
												if ((new Date().getTime() - start) > milliseconds) {
													break;
												}
											}
										}
										var storeMetrics = function() {
											var store = function(metric) {
												return HTTPFactory.backendPost("StoreMetric", {
													metric : metric
												});
											};
											var keyz = Object.keys(knownMetrics);
											keyz = [
											// "avg_moving_total",
											// "avg_standing_total",
											// "avg_sitting_total",
											// "avg_moving_per_building",
											// "avg_moving_per_space",
											// "nia_total_per_space",
											// "people_moving_avg",
											// "people_moving_avg_per_building",
											// "people_moving_avg_per_space",
											// "people_moving_to_nia_prim_circ",
											// "people_moving_to_nia_prim_circ_per_building",
											// "people_moving_to_nia_prim_circ_per_space",
											// "people_moving_to_nia_total",
											// "people_moving_to_nia_total_per_building",
											// "people_moving_to_nia_total_per_space",
											// "no_of_replies_dynamic_environment",
											// "no_of_replies_free_access",
											// "no_of_replies_noisy_environment",
											// "no_of_staff_per_tea_point",
											// "Appropriate movement levels in the right places",
											// "avg_accessibility_mean_depth",
											// "avg_visibility_mean_depth",
											// "avg_essence_mean_depth",
											// "avg_accessibility_mean_depth_of_printers",
											// "avg_accessibility_mean_depth_of_teapoints",
											// "people_any_activity_total_breakdown"
											];
											var breakPoint = 1000;
											var lel = function(lel, i) {
												if (!(keyz[i] in knownMetrics))
													return;
												var m = {};
												m[keyz[i]] = knownMetrics[keyz[i]];
												console.log(i, m);
												store(m).then(function(response) {
													sleep(200);
													if (i < keyz.length && i < breakPoint) {
														lel(lel, i + 1);
													} else
														console.log(response);
												});
											};
											lel(lel, 0);
										};
										storeMetrics();
										var storeIssues = function() {
											var store = function(issue) {
												return HTTPFactory.backendPost("StoreIssue", {
													issue : issue
												});
											};
											var breakPoint = 1000;
											var lel = function(lel, i) {
												var m = {};

												m = knownIssues[i];
												if (!m)
													return;
												console.log(i, m);
												store(m).then(function(response) {

													sleep(200);
													if (i < knownIssues.length && i < breakPoint)
														lel(lel, i + 1);
													else
														console.log(response);
												});
											};
											lel(lel, 0);
										};
										// storeIssues();
										var storeFunctions = function() {
											var store = function(func) {
												return HTTPFactory.backendPost("StoreFunction", {
													func : func
												});
											};
											var keyz = Object.keys(knownExtFunctions);
											// keyz = [
											// "avg_ties_outside_team",
											// // "avg_moving_total",
											// // "avg_standing_total",
											// // "avg_sitting_total",
											// // "avg_moving_per_building",
											// // "avg_moving_per_space",
											// // "nia_total_per_space",
											// // "people_moving_avg",
											// // "people_moving_avg_per_building",
											// // "people_moving_avg_per_space",
											// // "people_moving_to_nia_prim_circ",
											// // "people_moving_to_nia_prim_circ_per_building",
											// // "people_moving_to_nia_prim_circ_per_space",
											// // "people_moving_to_nia_total",
											// // "people_moving_to_nia_total_per_building",
											// // "people_moving_to_nia_total_per_space",
											// // "no_of_replies_dynamic_environment",
											// // "no_of_replies_free_access",
											// // "no_of_replies_noisy_environment",
											// // "no_of_staff_per_tea_point",
											// // "Appropriate movement levels in the right places",
											// // "avg_accessibility_mean_depth",
											// // "avg_visibility_mean_depth",
											// // "avg_essence_mean_depth",
											// // "avg_accessibility_mean_depth_of_printers",
											// // "avg_accessibility_mean_depth_of_teapoints",
											// // "people_any_activity_total_breakdown"
											// ];
											var breakPoint = 1000;
											var lel = function(lel, i) {
												if (!(keyz[i] in knownExtFunctions))
													return;
												var m = {};
												m[keyz[i]] = knownExtFunctions[keyz[i]];
												console.log(i, m);
												store(m).then(function(response) {
													sleep(200);
													if (i < keyz.length && i < breakPoint) {
														lel(lel, i + 1);
													} else
														console.log(response);
												});
											};
											lel(lel, 0);
										};
										storeFunctions();
									});
								},
								fetchStudy : function(id, wantedMetrics) {

									var study = loadedStudies[id];
									if (!study) {
										study = {
											id : id
										};
										loadedStudies[id] = study;
									}
									var args = {
										study_id : study.id
									};
									var promises = [];
									// promises.push($http.get("studies/originalMetrics.json"));
									promises.push(HTTPFactory.backendPost("Metrics", {
										wanted_metrics : wantedMetrics
									}));
									var mKeepProperties = [
											"alias", "units", "units_full", "no_of_decimals",
											'description'
									]
									// promises.push($http.get("studies/originalFunctions.json"));
									$q.all(promises).then(
											function(response) {
												var knownMetrics = response[0].data.metrics;
												// return;
												var knownExtFunctions = response[0].data.functions;
												// var knownExtFunctions = response[1].data;
												var kf = knownFunctions(knownExtFunctions);
												for (var i = 0; i < wantedMetrics.length; i++) {
													if (knownMetrics[wantedMetrics[i]]) {
														var result = knownMetrics[wantedMetrics[i]];
														for (var j = 0; j < mKeepProperties.length; j++) {
															var k = mKeepProperties[j];
															if (result.measure[k] || result.measure[k] === 0)
																result[k] = result.measure[k];
														}
														result.solution = createMetric(knownMetrics, args,
																result.measure);
														// console.log(result.measure);
														resolveMetric(result.solution, kf);
														// console.log(wantedMetrics[i], result);
														study[wantedMetrics[i]] = result;
													} else {
														study[wantedMetrics[i]] = {
															title : wantedMetrics[i],
															measure : {
																content : "Unknown measure"
															}
														};
													}
												}
											});

									return study;
								},
								testMetric : function(id, metricTree) {
									var wantedMetrics = [];
									var wantedFunctions = [];
									var study = {
										id : id
									};
									var args = {
										study_id : study.id
									};
									var testAlias = (Math.random().toString(36) + '00000000000000000')
											.slice(2, 5 + 2);
									var knownInternalFunctions = knownFunctions();
									/**
									 * recursive function to bring out the wanted metrics
									 * ("ilk":"m") and wanted functions ("ilk":"f")
									 */
									function extractMetricInputs(inputs, depth) {
										if (depth > 1000)
											return null;
										for (var i = 0; i < inputs.length; i++) {
											var input = inputs[i];
											if (input.ilk === "i" &&
													!args.hasOwnProperty(input.datum)) {
												return {
													err : "Unknown input " + input.datum
												};
											} else if (input.ilk === "f") {
												if (knownInternalFunctions
														.hasInternalFunction(input.datum)) {
													// function is internal, don't try to download
												} else
													wantedFunctions.push(input.datum);
												extractMetricInputs(input.inputs, depth + 1);
											} else if (input.ilk === "m") {
												wantedMetrics.push(input.datum);
											}
										}
									}
									if (metricTree && metricTree.measure &&
											metricTree.measure.ilk === "f" &&
											metricTree.measure.inputs) {
										if (knownInternalFunctions
												.hasInternalFunction(metricTree.measure.datum)) {
											// function is internal, don't try to download
										} else
											wantedFunctions.push(metricTree.measure.datum);
										var result = extractMetricInputs(metricTree.measure.inputs,
												0);
										if (result == null) {
											// internal error - check depth
										} else if (result.err) {
											return $q.reject(result.err);
										}
									}
									// console.log(wantedMetrics, wantedFunctions);
									var promises = [];
									// promises.push($http.get("studies/originalMetrics.json"));
									promises.push(HTTPFactory.backendPost("Metrics", {
										wanted_metrics : wantedMetrics,
										wanted_functions : wantedFunctions
									}));
									var mKeepProperties = [
											"alias", "units", "units_full", "no_of_decimals",
											'description'
									]
									var deferred = $q.defer();
									$q
											.all(promises)
											.then(
													function(response) {
														var knownMetrics = response[0].data.metrics;
														knownMetrics[testAlias] = metricTree;
														wantedMetrics.push(testAlias);
														// return;
														var knownExtFunctions = response[0].data.functions;

														// console.log(knownMetrics, knownExtFunctions);
														// var knownExtFunctions = response[1].data;
														var kf = knownFunctions(knownExtFunctions);
														var resolvedFunction = function(solvedMeasure) {

															var keys = Object.keys(solvedMeasure.solution);
															for (var i = 0; i < keys.length; i++)
																delete solvedMeasure.solution[keys[i]];
															solvedMeasure.solution.content = solvedMeasure.content;
															// delete solvedMeasure.solution.promises;
															// delete solvedMeasure.solution.funcname;

															// console.log(solvedMeasure);
															// var solution =
															// angular.copy(solvedMeasure.solution);
															// console.log(solvedMeasure.solution);
															// // angular.copy(solvedMeasure,
															// // solvedMeasure.solution);
															// angular.copy(solvedMeasure,
															// solvedMeasure.solution);
															// // solvedMeasure.measure =
															// // solvedMeasure.measure.solveObj;
															// delete solvedMeasure.solution.solution;

														};
														var internalPromises = [];
														for (var i = 0; i < wantedMetrics.length; i++) {
															if (knownMetrics[wantedMetrics[i]]) {
																var metric = knownMetrics[wantedMetrics[i]];
																metric.properties = {};
																for (var j = 0; j < mKeepProperties.length; j++) {
																	var k = mKeepProperties[j];
																	if (metric.measure[k] ||
																			metric.measure[k] === 0)
																		metric.properties[k] = metric.measure[k];
																}
																// console.log(metric.properties);
																metric.solution = createMetric(knownMetrics,
																		args, metric.measure);
																internalPromises.push(resolveMetric(
																		metric.solution, kf));
																// console.log(wantedMetrics[i], result);
																study[wantedMetrics[i]] = metric;
															} else {
																study[wantedMetrics[i]] = {
																	title : wantedMetrics[i],
																	measure : {
																		content : "Unknown measure"
																	}
																};
															}
														}
														$q.all(internalPromises).then(function(response) {
															deferred.resolve({
																data : study[testAlias]
															});
														});

													}, function(error) {
														console.log(error);
														deferred.reject(error.data);
													});
									return deferred.promise;
								}
							};
							return out;
						}
				]);