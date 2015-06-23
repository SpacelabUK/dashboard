"use strict";
app.controller('MainStudyCtrl', [
		'$scope',
		'$stateParams',
		'StudyFactory',
		'HTTPFactory',
		function($scope, $stateParams, StudyFactory, HTTPFactory) {

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
			HTTPFactory.backendGet('GetAll?t=study_parts&studyid=' + $scope.id).then(
					function(response) {
						$scope.observation_id = response.data[0]['id'];
						HTTPFactory.backendGet(
								'Occupancy?t=project_name&obsid=' + $scope.observation_id)
								.then(function(response) {
									$scope.projectname = response.data;
								}, function(error) {
								});
						HTTPFactory.backendGet(
								'Occupancy?t=no_of_desks&obsid=' + $scope.observation_id).then(
								function(response) {
									$scope.desks = response.data;
									calcOccupancy();
								}, function(error) {
								});
						HTTPFactory.backendGet(
								'Occupancy?t=no_of_rounds&obsid=' + $scope.observation_id)
								.then(function(response) {
									$scope.rounds = response.data;
									calcOccupancy();
								}, function(error) {
								});
						HTTPFactory.backendGet(
								'Occupancy?t=gross_occupancy&obsid=' + $scope.observation_id)
								.then(function(response) {
									$scope.occupancy = response.data;
									calcOccupancy();
								}, function(error) {
								});
						HTTPFactory.backendGet(
								'Occupancy?t=min_occupancy&obsid=' + $scope.observation_id)
								.then(function(response) {
									$scope.minoccupancy = response.data;
									calcOccupancy();
								}, function(error) {
								});
						HTTPFactory.backendGet(
								'Occupancy?t=max_occupancy&obsid=' + $scope.observation_id)
								.then(function(response) {
									$scope.maxoccupancy = response.data;
									calcOccupancy();
								}, function(error) {
								});
						HTTPFactory.backendGet('GetAll?t=spaces&studyid=' + $scope.id)
								.then(function(response) {
									$scope.spaces = response.data.length;
								}, function(error) {
								});
						HTTPFactory.backendGet(
								'Occupancy?t=no_of_buildings&obsid=' + $scope.observation_id)
								.then(function(response) {
									$scope.buildings = response.data;
								}, function(error) {
								});
						HTTPFactory.backendGet('Occupancy?t=get_quotes&obsid=' + $scope.id)
								.then(
										function(response) {
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
											for (var i = 0; i < response.data.length; i++) {
												if (response.data[i].size > max) {
													max = response.data[i].size;
												}
											}
											for (var i = 0; i < response.data.length; i++) {
												response.data[i].size = response.data[i].size * 100.0
														/ max;
												// $scope.wordleData.push(response.data[i]);
											}
											$scope.wordleData = response.data;
											// console
											// .log(response.data);
										}, function(error) {
										});
						HTTPFactory.backendGet(
								'Occupancy?t=total_occ_per_round&obsid='
										+ $scope.observation_id).then(function(response) {
							var data = response.data;
							// console.log(data);
							var collated = {};
							var sortable = [];
							for (var i = 0; i < data.length; i++) {
								var id = data[i].day_id * 100 + data[i].round_id;
								sortable.push(id);
								collated[id] = data[i].count;
							}
							sortable.sort();
							$scope.occPerRound = [];
							for (var i = 0; i < sortable.length; i++) {
								$scope.occPerRound.push(collated[sortable[i]]);
							}
							// console.log($scope.occ_per_round);
						}, function(error) {
						});
						HTTPFactory
								.backendGet(
										'Occupancy?t=desk_occ_frequency&obsid='
												+ $scope.observation_id).then(function(response) {
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
						HTTPFactory
								.backendGet('Occupancy?t=no_of_staff&obsid=' + $scope.id).then(
										function(response) {
											$scope.staff = response.data;
										}, function(error) {
										});
					}, function(error) {
					});
			$scope.words = [
					"Hallo", "Test", "Lorem", "Ipsum", "Lorem", "ipsum", "dolor", "sit",
					"amet", "consetetur", "sadipscing", "elitr,", "sed", "diam",
					"nonumy", "eirmod", "tempor", "invidunt", "ut", "labore", "et",
					"dolore", "magna", "aliquyam", "erat,", "sed", "diam"
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
				]
				$scope.avgOccupancyLabels = [
						(($scope.avgOccupancyValues[0] * 100) | 0) + '%',
						(($scope.avgOccupancyValues[1] * 100) | 0) + '%'
				];

				$scope.minOccupancyValues = [
						$scope.minoccupancy / $scope.desks,
						1 - $scope.minoccupancy / $scope.desks
				]
				$scope.minOccupancyLabels = [
						(($scope.minOccupancyValues[0] * 100) | 0) + '%',
						(($scope.minOccupancyValues[1] * 100) | 0) + '%'
				];

				$scope.maxOccupancyValues = [
						$scope.maxoccupancy / $scope.desks,
						1 - $scope.maxoccupancy / $scope.desks
				]
				$scope.maxOccupancyLabels = [
						(($scope.maxOccupancyValues[0] * 100) | 0) + '%',
						(($scope.maxOccupancyValues[1] * 100) | 0) + '%'
				];

			}
		}
]);
app
		.controller(
				'StudyIssuesCtrl',
				[
						'$scope',
						'$stateParams',
						'$modal',
						'StudyFactory',
						'HTTPFactory',
						function($scope, $stateParams, $modal, StudyFactory, HTTPFactory) {
							$scope.id = $stateParams.studyid;
							$scope.viewAlias = $stateParams.viewAlias;
							$scope.activityValues = [];
							$scope.activityLabels = [
									'walking', 'standing', 'sitting'
							];
							StudyFactory
									.fetchStudy(
											$scope.id,
											[
													'project_name', 'avg_moving_total',
													'movement_density_total', 'avg_moving_spaces',
													'movement_density_spaces', 'activities_split',
													'study_accessibility_mean',
													'printer_accessibility_mean_depth'
											])
									.then(
											function(response) {
												$scope.study = response;
												console.log($scope.study.activities_split);
												for (var i = 0; i < $scope.activityLabels.length; i++) {
													$scope.activityValues
															.push($scope.study.activities_split[$scope.activityLabels[i]]);
												}
												HTTPFactory
														.backendGet(
																'Occupancy?t=occ_per_space_and_round_prc&obsid='
																		+ $scope.study.first_observation_id.content)
														.then(
																function(response) {
																	$scope.spaces = response.data;
																	var spaceMap = {};
																	for (var i = 0; i < $scope.spaces.length; i++) {
																		spaceMap[$scope.spaces[i].id] = $scope.spaces[i];
																	}
																	if ($scope.study.movement_density_spaces) {
																		for (var i = 0; i < $scope.study.movement_density_spaces.length; i++) {
																			var spaceID = parseInt($scope.study.movement_density_spaces[i].content.space_id);
																			spaceMap[spaceID].sqm_per_walker = {
																				content : parseFloat($scope.study.movement_density_spaces[i].content.sqm_per_walker)
																			}
																		}
																	}
																}, function(error) {
																	console.log(error);
																});

												// console.log(response);
											}, function(error) {
												console.log(error);
											});
							$scope.getSQM = function(number) {
								return number.toFixed(1) + 'm' + '\xB2';
							}
							$scope.getDepthmapMeasure = function(space, analysis_type) {
								HTTPFactory.backendGet(
										"GetDepthmapData?spaceid=" + space.id + "&measure=" + 9
												+ "&analysis_type=" + analysis_type).then(
										function(response) {
											// console.log(response.data);
											var promise = $modal.open({
												templateUrl : 'studies/dpmView.html',
												controller : 'dpmViewController',
												windowClass : 'planView',
												resolve : {
													img : function() {
														return space.img;
													},
													dpmData : function() {
														return response.data;
													}
												}
											});
										}, function(error) {
											console.log(error);
										});
							}
							HTTPFactory.backendGet(
									'GetAll?t=study_parts&studyid=' + $scope.id).then(
									function(response) {
										$scope.observation_id = response.data[0]['id'];
										// HTTPFactory.backendGet(
										// Occupancy?t=avg_moving_total&obsid=' +
										// $scope.observation_id)
										// .then(function(response) {
										// $scope.avg_moving_total = response.data;
										// }, function(error) {
										// console.log(error);
										// });
										// HTTPFactory.backendGet(
										// 'Occupancy?t=avg_moving_building&obsid='
										// + $scope.observation_id).then(function(response) {
										// $scope.avg_moving_building = response.data;
										// }, function(error) {
										// console.log(error);
										// });
										// HTTPFactory.backendGet(
										// 'Occupancy?t=avg_moving_floor&obsid=' +
										// $scope.observation_id)
										// .then(function(response) {
										// $scope.avg_moving_floor = response.data;
										// }, function(error) {
										// console.log(error);
										// });
										// HTTPFactory.backendGet(
										// 'Occupancy?t=movement_density_total&obsid='
										// + $scope.observation_id).then(function(response) {
										// $scope.movement_density_total = response.data;
										// }, function(error) {
										// });
										// HTTPFactory.backendGet(
										// 'Occupancy?t=movement_density_building&obsid='
										// + $scope.observation_id).then(function(response) {
										// $scope.movement_density_building = response.data;
										// }, function(error) {
										// });
										// HTTPFactory.backendGet(
										// 'Occupancy?t=movement_density_floor&obsid='
										// + $scope.observation_id).then(function(response) {
										// $scope.movement_density_floor = response.data;
										// }, function(error) {
										// });
									}, function(error) {
									});
						}
				]);

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
						function($scope, $stateParams, $modal, $timeout, StudyFactory,
								HTTPFactory) {
							$scope.id = $stateParams.studyid;
							// $scope.viewAlias = $stateParams.viewAlias;
							$scope.issue = $stateParams.issue;
							$scope.activityValues = [];
							$scope.activityLabels = [
									'walking', 'standing', 'sitting'
							];
							$scope.isNumber = function(metric) {
								return !metric.measure || !metric.measure.type
										|| metric.measure.type == 'number';
							}
							$scope.isTable = function(metric) {
								return metric.measure && metric.measure.type
										&& metric.measure.type == 'table';
							}
							$scope.isList = function(metric) {
								return metric.measure && metric.measure.type
										&& metric.measure.type == 'list';
							}
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
							}
							$scope.copyToClipboard = function(metric, id) {
								if (metric.no_of_decimals || metric.no_of_decimals === 0)
									metric.no_of_decimals = 'i' + metric.no_of_decimals;
								console.log(metric.no_of_decimals);
								$timeout(function() {
									var nid = $scope.toAliasString(id);
									var tbl = document.getElementById(nid);
									var el = tbl.getElementsByTagName('table')[0];
									var inliner = function(element) {
										if (element.nodeType !== 1)
											return;
										var style = window.getComputedStyle(element);
										for (var i = 0; i < requiredStyles.length; i++) {
											element.style[requiredStyles[i]] = style
													.getPropertyValue(requiredStyles[i]);
										}
										var children = element.childNodes;
										for (var i = 0; i < children.length; i++) {
											inliner(children[i]);
										}
									}
									inliner(el);
									window.prompt("Copy to clipboard: Ctrl+C, Enter",
											el.outerHTML);
									if (metric.no_of_decimals
											&& metric.no_of_decimals.slice(0, 1) === 'i')
										metric.no_of_decimals = metric.no_of_decimals.slice(1);
									console.log(metric.no_of_decimals);
								}, 200);

								// return defer.promise;
							}
							$scope.getNameOrAlias = function(e) {
								if (e.name)
									// return e.name + '(' + e.alias + ')';
									return e.name;
								return e.alias;
							}
							$scope.getSorterOrNameOrAlias = function(e) {
								if (e.sortby || e.sortby === 0)
									// return e.name + '(' + e.alias + ')';
									return e.sortby;
								if (e.name)
									// return e.name + '(' + e.alias + ')';
									return e.name;
								return e.alias;
							}
							$scope.getCellContent = function(e, key, property) {
								if (e.measure.content.data[key.alias][property.alias]) {
									if ((e.no_of_decimals || e.no_of_decimals === 0)
											&& !isNaN(e.no_of_decimals))
										return e.measure.content.data[key.alias][property.alias]
												.toFixed(e.no_of_decimals);
									// .toFixed(2);
									else
										return e.measure.content.data[key.alias][property.alias];
								}
								return '';
							}
							$scope.getContent = function(e) {
								if (e.measure.content) {
									if ((e.no_of_decimals || e.no_of_decimals === 0)
											&& e.no_of_decimals != 'all')
										return e.measure.content.toFixed(e.no_of_decimals);
									// .toFixed(2);
									else
										return e.measure.content;
								}
								return 'fetching...';
							}
							$scope.issueNames = [
									{
										name : 'G0',
										title : 'General project info',

									},
									{
										name : 'S1',
										title : 'Space planned to suit occupancy levels',

									}, //
									{
										name : 'S2',
										title : 'Efficient desk occupation',

									},
									{
										name : 'S3',
										title : 'Appropriate workspace densities',

									},
									{
										name : 'S4',
										title : 'Efficient primary circulation',

									},
									{
										name : 'S5',
										title : 'Spatial efficiency of bookable meeting rooms',

									},
									{
										name : 'S6',
										title : 'Spatial efficiency of alternative spaces',

									},
									// s7
									{
										name : 'S7',
										title : 'Suitability of storage',

									}, //
									{
										name : 'O1',
										title : 'Space suits future organisation structure',

									},
									{
										name : 'O2',
										title : 'Hierarchy suitably reinforced by space',

									},
									{
										name : 'O3',
										title : 'Team locations',

									},
									{
										name : 'O4',
										title : 'Spatial suitability for key business processes',

									},
									{
										name : 'O5',
										title : 'Location of specialist shared facilities',

									},
									{
										name : 'O6',
										title : 'Space reflects organisational identity',

									},
									{
										name : 'O7',
										title : 'Visitor experience',
									},
									{
										name : 'B1',
										title : 'Appropriate movement levels in the right places',
									},
									{
										name : 'B2',
										title : 'People can have visible contact of whole business',
									}, {
										name : 'B3',
										title : 'Collaboration supported by space',
									}, {
										name : 'B4',
										title : 'Opportunities for unplanned interaction',
									}, {
										name : 'B5',
										title : 'Balance between local and global interaction',

									}, {
										name : 'E1',
										title : 'IT supports desired working practices',
									}, {
										name : 'CR1',
										title : 'Awareness and willingness to change',

									}, {
										name : 'CR2',
										title : 'Staff drivers for change',

									}, {
										name : 'CR3',
										title : 'Attitude to open plan and flexible working',
									}
							];
							$scope.wantedMetrics = [
									{
										name : 'G0',
										title : 'General project info',
										metrics : [
												'project_name', //
												'nia_total', //
												'nia_total_sqft', //
												'no_of_buildings', 'nia_total_per_building' //
										]
									},
									{
										name : 'S1',
										title : 'Space planned to suit occupancy levels',
										metrics : [
												// 'desk_occupancy_total', //
												// 'total_expected_headcount',//
												// 'no_of_seats_canteen',//
												'no_of_people_per_round_sum',
												'no_of_people_per_round_max', //
												'no_of_people_per_round_avg', //
												'no_of_desks', //
												'no_of_staff', //
												'no_of_desks_per_building', //
												// 'tbl_no_of_desks_wrksp_per_building', //
												'avg_working_hours',//
												'avg_out_of_office_hours', //
												'avg_away_from_desk_hours', //
												'perceived_hours_in_office', //
												'nia_per_desk_at_max_occupancy', //
												// 'q_avg_mark_hoursofworking',//
												'avg_time_in_office', //
												'avg_hours_work_from_home',//
												'desired_avg_hours_work_from_home', //
												// 'avg_visitor_numbers', //
												// 'avg_on_leave_or_sick', //
												'Space planned to suit occupancy levels',
												'no_of_people_per_round' //
										]
									}, //
									{
										name : 'S2',
										title : 'Efficient desk occupation',
										metrics : [
												'avg_desk_occupancy_total_prc', //
												// 'max_desk_occupancy', //
												'max_desk_occupancy_prc', //
												'max_desk_occupancy_not_empty_prc',
												'min_desk_occupancy_prc', //
												'min_desk_occupancy_not_empty_prc',
												'avg_not_empty_desk_occupancy_prc',//
												'no_of_desks', //
												'no_of_desks_open_plan', //
												'no_of_desks_cellular',//
												'no_of_staff', //
												'no_of_staff_per_building', //
												'no_of_desks_more_than_staff',
												'no_of_desks_more_than_staff_prc',
												'no_of_desks_empty', //
												// 'q_mark_over_3_imp2workatdesk_over_no_of_staff',
												'perceived_desk_occupancy',
												'prc_of_responders_desk_space_is_quite_or_very_important',
												'quotes_under_efficient_desk_occupation',
												'no_of_desks_per_team', //
												'nia_per_team', //
												'avg_desk_occupancy_per_team', //
												'max_desk_occupancy_per_team_prc',
												'occupancy_frequency_grouped', //
												'choices_of_activities_questions'
										]
									},
									{
										name : 'S3',
										title : 'Appropriate workspace densities',
										metrics : [
												'nia_prim_circ',//
												'nia_prim_circ_sqft',//
												'nia_prim_circ_to_total_prc', //
												'nia_shared_facilities', //
												'nia_shared_facilities_sqft', //
												'nia_shared_facilities_to_total_prc', //
												'nia_wrksp_per_building',//
												'nia_wrksp_opn_per_building',//
												'nia_wrksp_cel_per_building',//
												'no_of_desks_cellular_per_building',
												'no_of_desks_open_plan_per_building', 'nia_wrksp', //
												'nia_wrksp_sqft', //
												'nia_wrksp_to_total_prc', //
												'nia_wrksp_open', //
												'nia_wrksp_open_sqft', //
												'nia_wrksp_open_to_total_prc', //
												'nia_wrksp_cel', //
												'nia_wrksp_cel_sqft', //
												'nia_wrksp_cel_to_total_prc', //

												'desk_occupancy_wrksp_open_prc',
												'desk_occupancy_wrksp_cell_prc',

												'nia_total_per_desk', //
												'nia_wrksp_per_desk', //
												'nia_wrksp_open_per_desk', //
												'nia_wrksp_cel_per_desk', //

												'nia_per_desk_per_team', //
												'nia_wrksp_per_desk_per_space', //
												'nia_wrksp_per_desk_per_building', //
												'nia_wrksp_opn_per_desk_per_building',
												'nia_wrksp_cel_per_desk_per_building',
												'nia_wrksp_per_person_per_building',
												'no_of_replies_amount_of_space', //
												'Appropriate workspace densities'
										]
									},
									{
										name : 'S4',
										title : 'Efficient primary circulation',
										metrics : [
												'nia_prim_circ',//
												'nia_prim_circ_sqft',//
												'nia_prim_circ_to_total_prc', //
												'nia_prim_circ_per_building', //
												'nia_prim_circ_to_total_per_building',
												'nia_prim_circ_to_total_per_space',
												'Efficient primary circulation',
												'nia_wrksp_to_total_per_space',
												'nia_wrksp_to_total_per_building',
												'nia_shared_facilities_per_building',
												'nia_shared_facilities_to_total_per_space',
												'nia_shared_facilities_to_total_per_building'
										]
									},
									{
										name : 'S5',
										title : 'Spatial efficiency of bookable meeting rooms',
										metrics : [
												'occupancy_of_bookable_meeting_rooms_prc',//
												'max_occupancy_of_bookable_meeting_rooms_prc', //
												'min_occupancy_of_bookable_meeting_rooms_prc', //
												'no_of_meeting_rooms',//
												'nia_meeting_room_bkb',//
												'nia_meeting_room_to_total_prc', //
												'avg_utilisation_when_used_meeting_rooms',//
												'no_of_replies_can_get_meeting_room',
												'no_of_replies_important_confidential_mtg',
												'no_of_replies_important_bookable_mtg',
												'Spatial efficiency of bookable meeting rooms',
												'meeting_room_groups_avg', //
												'meeting_room_groups_max', //
												'avg_meeting_size', //
												'occupancy_of_bookable_meeting_rooms_avg',
												'max_occupancy_of_bookable_meeting_rooms',
										]
									},
									{
										name : 'S6',
										title : 'Spatial efficiency of alternative spaces',
										metrics : [
												'nia_alternative_spaces', //
												'nia_alternative_spaces_sqft', //
												'nia_alternative_spaces_prc', //
												'nia_per_alternative_space_type', //
												'no_of_alternative_spaces', //
												'max_utilisation_of_alternative_spaces',
												'occupancy_of_alternative_spaces_prc',
												'choices_of_informal_facilities_questions',
												'no_of_replies_concentration_spaces_exist',
												'Spatial efficiency of alternative spaces',
												'activity_in_alternative_spaces_per_round',
												'activity_in_canteen_per_round'
										]
									},
									// s7
									{
										name : 'S7',
										title : 'Suitability of storage',
										metrics : [
												'nia_storage_to_total_prc',
												'choices_of_storage_facilities_questions',
												'Suitability of storage',
												'stakeholder_cultural_preferences_organised_chaos_current',
												'stakeholder_cultural_preferences_organised_chaos_future'
										]
									}, //
									{
										name : 'O1',
										title : 'Space suits future organisation structure',
										metrics : [
												'Space suits future organisation structure',

												'avg_accessibility_mean_depth_per_building', //
												'avg_visibility_mean_depth_per_building', //
												'avg_essence_mean_depth_per_building', //
												'step_depth_essence_to_visibility',
												'step_depth_essence_to_accessibility'
										]
									},
									{
										name : 'O2',
										title : 'Hierarchy suitably reinforced by space',
										metrics : [
												'no_of_replies_some_people_better_environment',
												'quotes_under_hierarchy_suitably_reinforced_by_space',
												'stakeholder_cultural_preferences_formal_informal_current',
												'stakeholder_cultural_preferences_formal_informal_future',
												'nia_wrksp_open_per_desk', //
												'nia_wrksp_cel_per_desk', //
												'nia_per_desk_per_team', //
												'team_with_max_nia_per_desk', //
												'team_with_min_nia_per_desk', //
												'nia_wrksp_per_desk_per_space', //
												'nia_wrksp_per_desk_per_building', //
										]
									},
									{
										name : 'O3',
										title : 'Team locations',
										metrics : [
												'no_of_replies_needed_teams_close',
												'in_degree_teams_extreme_usefulness', //
												'in_degree_teams_current_collaboration',//
												'in_degree_teams_future_interaction', //
												'Team locations', //
												'avg_accessibility_mean_depth_per_team' //
										]
									},
									{
										name : 'O4',
										title : 'Spatial suitability for key business processes',
										metrics : [
												'prc_on_the_phone',
												'avg_no_of_people_on_the_phone_per_team_prc',
												'choices_of_activities_questions',
												'choices_of_facilities_importance_questions',
												'no_of_tagged_quotes_improvements',
												'Spatial suitability for key business processes',
												'prc_of_responders_uninterrupted_work_is_quite_or_very_important'
										]
									},
									{
										name : 'O5',
										title : 'Location of specialist shared facilities',
										metrics : [
											'Location of specialist shared facilities'
										]
									},
									{
										name : 'O6',
										title : 'Space reflects organisational identity',
										metrics : [
												'no_of_replies_brand_reflects_identity',
												'Space reflects organisational identity'
										]
									},
									{
										name : 'O7',
										title : 'Visitor experience',
										metrics : [
												'no_of_replies_proud_of_environment',
												'no_of_replies_meetings_with_externals',
												'no_of_replies_visitors_like_office',
												'Visitor experience',
												'prc_of_responders_in_pre_planned_meetings_with_externals',
												'prc_of_responders_in_pre_planned_meetings_with_externals_over_10_prc'
										]
									},
									{
										name : 'B1',
										title : 'Appropriate movement levels in the right places',
										metrics : [
												// //'people_moving_total', //
												// //'people_any_activity_total', //
												'avg_moving_total', //
												'avg_standing_total', //
												'avg_sitting_total', //
												'avg_moving_per_building', //
												'avg_moving_per_space', //
												'nia_total_per_space', //
												'people_moving_avg', //
												'people_moving_avg_per_building',
												'people_moving_avg_per_space',
												'people_moving_to_nia_prim_circ',
												'people_moving_to_nia_prim_circ_per_building',
												'people_moving_to_nia_prim_circ_per_space',
												'people_moving_to_nia_total',
												'people_moving_to_nia_total_per_building',
												'people_moving_to_nia_total_per_space',
												'no_of_replies_dynamic_environment',
												'no_of_replies_free_access', //
												'no_of_replies_noisy_environment', //
												'no_of_staff_per_tea_point',
												'Appropriate movement levels in the right places',
												'avg_accessibility_mean_depth', //
												'avg_visibility_mean_depth', //
												'avg_essence_mean_depth', //
												'avg_accessibility_mean_depth_of_printers',
												'avg_accessibility_mean_depth_of_teapoints',
												'people_any_activity_total_breakdown',
										]
									},
									{
										name : 'B2',
										title : 'People can have visible contact of whole business',
										metrics : [
												'no_of_staff', //
												'avg_accessibility_mean_depth_of_canteens',
												'avg_accessibility_mean_depth_of_social_hubs',
												'max_accessibility_mean_depth', //
												'min_accessibility_mean_depth',
												// 'study_visibility_mean', //
												// 'study_accessibility_mean', //
												// 'study_essence_mean', //
												'no_of_replies_community_environment', //
												'People can have visible contact of whole business'
										]
									},
									{
										name : 'B3',
										title : 'Collaboration supported by space',
										metrics : [
												'people_any_activity_interacting_prc',
												'people_any_activity_interacting_prc_verdict',
												'people_any_activity_interacting_prc_per_building',
												'people_any_activity_interacting_prc_per_space',
												'avg_utlisation_per_sqm', //
												'avg_utlisation_per_sqm_per_building',
												'avg_utlisation_per_sqm_per_space',
												'avg_no_of_contacts_per_person', //

												'nia_total_per_desk', //
												'nia_total_per_desk_per_building', //
												'nia_total_per_person_per_building',
												'nia_total_per_desk_per_space', //

												'avg_no_of_contacts_per_person_seen_over_5',
												'avg_no_of_contacts_per_person_useful_4',
												'avg_no_of_contacts_per_person_useful_3',
												'avg_no_of_contacts_per_person_useful_2',
												'Collaboration supported by space',
												'stakeholder_cultural_preferences_alone_together_current',
												'stakeholder_cultural_preferences_alone_together_future',
												'avg_visibility_mean_depth', //
										]
									}, //
									{
										name : 'B4',
										title : 'Opportunities for unplanned interaction',
										metrics : [
												'no_of_replies_env_allows_unplanned_mtg', //
												'visiting_ratio',
												'Opportunities for unplanned interaction',
												'no_of_planned_contacts_per_score',
												'no_of_unplanned_contacts_per_score',
												'avg_accessibility_mean_depth', //
										]
									},
									{
										name : 'B5',
										title : 'Balance between local and global interaction',
										metrics : [
												'avg_no_of_contacts_per_person', //
												'avg_ties_in_team', //
												'avg_ties_outside_team', //
												'avg_possible_ties_in_team', //
												'avg_possible_ties_outside_team', //
												'yules_q_team', //
												'avg_ties_in_floor', //
												'avg_ties_outside_floor', //
												'avg_possible_ties_in_floor', //
												'avg_possible_ties_outside_floor',
												'avg_ties_in_building', //
												'avg_ties_outside_building', //
												'avg_possible_ties_in_building', //
												'avg_possible_ties_outside_building',
												'people_workspace_any_activity_interacting_total_per_activity',
												'Balance between local and global interaction',
												'no_of_planned_and_unplanned_contacts_per_score_within_team',
												'no_of_planned_and_unplanned_contacts_per_score_outside_team',
												'no_of_planned_and_unplanned_contacts_per_score_within_floor',
												'no_of_planned_and_unplanned_contacts_per_score_outside_floor',
												'no_of_planned_and_unplanned_contacts_per_score_within_building',
												'no_of_planned_and_unplanned_contacts_per_score_outside_building',
												'no_of_replies_face_to_face_spaces_exist_within_team',
												'no_of_replies_face_to_face_spaces_exist_outside_team'

										// 'no_of_staff_ties_outside_team_per_team',
										// 'no_of_staff_ties_within_team_per_team',
										// 'no_of_possible_staff_ties_outside_team_per_team',
										// 'no_of_possible_staff_ties_within_team_per_team'
										]
									},
									{
										name : 'E1',
										title : 'IT supports desired working practices',
										metrics : [
												'no_of_replies_printer_importance',
												'no_of_tagged_quotes_improvements',
												'no_of_tagged_quotes_best_feature',
												'choices_of_it_facilities_questions',
												'IT supports desired working practices'
										]
									},
									{
										name : 'CR1',
										title : 'Awareness and willingness to change',
										metrics : [
												'choices_of_facilities_importance_questions',
												'Awareness and willingness to change',
												'stakeholder_cultural_preferences_risky_cautious_current',
												'stakeholder_cultural_preferences_risky_cautious_future'

										]
									},
									{
										name : 'CR2',
										title : 'Staff drivers for change',
										metrics : [
												'no_of_replies_community_environment',
												'no_of_replies_enjoyable_environment',
												'no_of_replies_proud_of_environment',
												'Staff drivers for change'
										]
									},
									{
										name : 'CR3',
										title : 'Attitude to open plan and flexible working',
										metrics : [
												'no_of_replies_own_desk_important',
												'no_of_replies_variety_of_spaces',
												'no_of_tagged_quotes_improvements',
												'no_of_tagged_quotes_best_feature',
												'Attitude to open plan and flexible working',
												'stakeholder_cultural_preferences_static_flexible_working_current',
												'stakeholder_cultural_preferences_static_flexible_working_future'
										]
									}
							];
							var allMetrics = [
									'projsect_name', 'activities_split'
							];
							// for (var i = 0; i < $scope.wantedMetrics.length; i++)
							// allMetrics =
							// allMetrics.concat($scope.wantedMetrics[i].metrics);
							// StudyFactory
							// .fetchStudy($scope.id, allMetrics)
							// .then(
							// function(response) {
							// $scope.study = response;
							// // console.log($scope.study.activities_split);
							// for (var i = 0; i < $scope.activityLabels.length; i++) {
							// $scope.activityValues
							// .push($scope.study.activities_split[$scope.activityLabels[i]]);
							// }
							// HTTPFactory
							// .backendGet(
							// 'Occupancy?t=occ_per_space_and_round_prc&obsid='
							// + $scope.study.first_observation_id.content)
							// .then(
							// function(response) {
							// $scope.spaces = response.data;
							// var spaceMap = {};
							// for (var i = 0; i < $scope.spaces.length; i++) {
							// spaceMap[$scope.spaces[i].id] = $scope.spaces[i];
							// }
							// if ($scope.study.movement_density_spaces) {
							// for (var i = 0; i <
							// $scope.study.movement_density_spaces.content.length; i++) {
							// var spaceID =
							// parseInt($scope.study.movement_density_spaces.content[i].space_id);
							// spaceMap[spaceID].sqm_per_walker = {
							// content :
							// parseFloat($scope.study.movement_density_spaces.content[i].sqm_per_walker)
							// };
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
							$scope.pageTitle = 'Issues';
							if (!$scope.issue)
								$scope.wantedMetrics = [];
							if ($scope.issue && $scope.issue !== 'all') {
								var issues = $scope.issue.split(',');
								var all = false;
								for (var j = 0; j < issues.length; j++) {
									if ($scope.issue === 'all') {
										all = true;
										break;
									}
								}
								if (!all) {
									var newMetrics = [];
									for (var j = 0; j < issues.length; j++) {
										for (var i = 0; i < $scope.wantedMetrics.length; i++) {
											if ($scope.wantedMetrics[i].name.slice(0,
													issues[j].length) === issues[j]
													&& newMetrics.indexOf($scope.wantedMetrics[i]) === -1) {
												newMetrics.push($scope.wantedMetrics[i]);
											}
										}
									}
									$scope.wantedMetrics = newMetrics;
								}
							}
							if (newMetrics && newMetrics.length == 1)
								$scope.pageTitle = 'Issue ' + newMetrics[0].name + ": "
										+ newMetrics[0].title;

							for (var i = 0; i < $scope.wantedMetrics.length; i++)
								allMetrics = allMetrics.concat($scope.wantedMetrics[i].metrics);

							$scope.study = StudyFactory.fetchStudy($scope.id, allMetrics);
							console.log($scope.study);
							// .then(
							// function(response) {
							// $scope.study = response;
							// // console.log($scope.study.activities_split);
							// // for (var i = 0; i < $scope.activityLabels.length; i++) {
							// // $scope.activityValues
							// //
							// .push($scope.study.activities_split[$scope.activityLabels[i]]);
							// // }
							// // HTTPFactory
							// // .backendGet(
							// // 'Occupancy?t=occ_per_space_and_round_prc&obsid='
							// // + $scope.study.first_observation_id.content)
							// // .then(
							// // function(response) {
							// // $scope.spaces = response.data;
							// // var spaceMap = {};
							// // for (var i = 0; i < $scope.spaces.length; i++) {
							// // spaceMap[$scope.spaces[i].id] = $scope.spaces[i];
							// // }
							// // if ($scope.study.movement_density_spaces) {
							// // for (var i = 0; i <
							// $scope.study.movement_density_spaces.content.length; i++) {
							// // var spaceID =
							// parseInt($scope.study.movement_density_spaces.content[i].space_id);
							// // spaceMap[spaceID].sqm_per_walker = {
							// // content :
							// parseFloat($scope.study.movement_density_spaces.content[i].sqm_per_walker)
							// // };
							// // }
							// // }
							// // }, function(error) {
							// // console.log(error);
							// // });
							//
							// // console.log(response);
							// }, function(error) {
							// console.log(error);
							// })
							;
							$scope.getSQM = function(number) {
								return number.toFixed(1) + 'm' + '\xB2';
							}
							$scope.getDepthmapMeasure = function(space, analysis_type) {
								HTTPFactory.backendGet(
										"GetDepthmapData?spaceid=" + space.id + "&measure=" + 9
												+ "&analysis_type=" + analysis_type).then(
										function(response) {
											// console.log(response.data);
											var promise = $modal.open({
												templateUrl : 'studies/dpmView.html',
												controller : 'dpmViewController',
												windowClass : 'planView',
												resolve : {
													img : function() {
														return space.img;
													},
													dpmData : function() {
														return response.data;
													}
												}
											});
										}, function(error) {
											console.log(error);
										});
							}
							HTTPFactory.backendGet(
									'GetAll?t=study_parts&studyid=' + $scope.id).then(
									function(response) {
										$scope.observation_id = response.data[0]['id'];
									}, function(error) {
									});
						}
				]);
app
		.factory(
				'StudyFactory',
				[
						'HTTPFactory',
						'$q',
						function(HTTPFactory, $q) {
							var loadedStudies = {};
							var knownFunctions = function() {
								var that = this;
								return {
									'id_of_poly_types' : function(data) {
										var type_group = data[0];
										var type_alias = data[1];
										return {
											name : 'ID of type',
											proc : 'id_of_poly_types',
											params : function(study) {
												return {
													type_group : type_group,
													type_alias : type_alias,
												};
											},
											callback : function(response) {
												return {
													content : response.data.map(function(d) {
														return parseInt(d);
													}),
												};
											}
										};
									},
									'project_name' : function(data) {
										var study_id = data[0];
										return {
											name : 'Project Name',
											proc : 'get_project_name',
											params : function() {
												return {
													study_id : study_id,
												}
											},
											callback : function(response) {
												return {
													content : response.data[0]
												}
											}
										};
									},
									'observation_ids' : function(data) {
										var study_id = data[0];
										return {
											name : 'All Observation IDs',
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
									'first_observation_id' : function(data) {
										var all = this['observation_ids'](data);
										all.name = 'First Observation';
										var allCallBack = all['callback'];
										all.callback = function(response) {
											var result = allCallBack(response);
											result.name = 'First Observation';
											result.content = result.content[0];
											return result;
										}
										return all;
									},
									'no_of_desks_in_poly_types' : function(data) {
										var observation_id = data[0];
										var type_ids = data[1];
										return {
											name : 'No. of desks in polygon type',
											proc : 'no_of_desks_in_poly_types',
											params : function() {
												return {
													observation_id : observation_id,
													type_ids : type_ids
												};
											},
											callback : function(response) {
												return {
													content : parseInt(response.data),
													units : 'desks'
												};
											}
										};
									},
									'no_of_desks_in_poly_types_per_building' : function(data) {
										var observation_id = data[0];
										var type_ids = data[1];
										return {
											name : 'No. of desks in polygon type',
											proc : 'no_of_desks_in_poly_types_per_building',
											params : function() {
												return {
													observation_id : observation_id,
													type_ids : type_ids
												};
											},
											callback : function(response) {
												var content;
												if (response.data && response.data.length > 0)
													content = unpack(JSON.parse(response.data[0]));
												return {
													type : 'table',
													content : content,
													units : 'desks'
												};
											}
										};
									},
									'no_of_desks_per_polygon_type' : function(data) {
										var observation_id = data[0];
										var type_ids = data[1];
										var type_names;
										if (data[2])
											type_names = data[2];
										return {
											name : 'No. of desks per polygon type',
											proc : 'no_of_desks_per_polygon_type',
											params : function() {
												return {
													observation_id : observation_id,
													type_ids : type_ids
												};
											},
											callback : function(response) {
												var content;
												if (response.data && response.data.length > 0)
													content = unpack(JSON.parse(response.data[0]));
												if (type_names && type_names.content) {
													setKeyData(content, type_names.content, "id");
												}
												return {
													type : 'table',
													content : content,
													units : 'desks'
												};
											}
										};
									},
									'occupancy_of_poly_types' : function(data) {
										var observation_id = data[0];
										var type_ids = data[1];
										return {
											name : 'Occupancy of polygon type',
											proc : 'occupancy_of_poly_types',
											params : function() {
												return {
													observation_id : observation_id,
													type_ids : type_ids
												};
											},
											callback : function(response) {
												return {
													content : parseInt(response.data),
													units : 'times occupied'
												};
											}
										};
									},
									'occupancy_of_poly_types_per_round' : function(data) {
										var observation_id = data[0];
										var type_ids = data[1];
										var key_names;
										if (data[2])
											key_names = data[2];
										return {
											name : 'Occupancy of polygon type per round',
											proc : 'occupancy_of_poly_types_per_round',
											params : function() {
												return {
													observation_id : observation_id,
													type_ids : type_ids
												};
											},
											callback : function(response) {
												var content;
												if (response.data)
													content = unpack(JSON.parse(response.data[0]));
												if (key_names && key_names.content) {
													// setPropertyData(content, team_names, "id");
													setKeyData(content, key_names.content, "id");
												}
												return {
													type : 'table',
													content : content,
													units : 'times occupied'
												};
											}
										};
									},
									'utilisation_of_poly_types' : function(data) {
										var observation_id = data[0];
										var type_ids = data[1];
										return {
											name : 'Utilisation of polygon type',
											proc : 'utilisation_of_poly_types',
											params : function() {
												return {
													observation_id : observation_id,
													type_ids : type_ids
												};
											},
											callback : function(response) {
												return {
													content : parseInt(response.data),
													units : 'people'
												};
											}
										};
									},
									'utilisation_activity_of_poly_types' : function(data) {
										var observation_id = data[0];
										var type_ids = data[1];
										var states = data[2];
										return {
											name : 'Activity of polygon type',
											proc : 'utilisation_activity_of_poly_types',
											params : function() {
												return {
													observation_id : observation_id,
													type_ids : type_ids,
													states : states
												};
											},
											callback : function(response) {
												return {
													content : parseInt(response.data),
													units : 'people'
												};
											}
										};
									},
									'nia_of_poly_types' : function(data) {
										var study_id = data[0];
										var type_ids = data[1];
										return {
											name : 'NIA of polygon type(s)',
											proc : 'nia_of_poly_types',
											params : function() {
												return {
													study_id : study_id,
													type_ids : type_ids
												};
											},
											callback : function(response) {
												return {
													content : parseFloat(response.data),
													units : 'm\xB2'
												};
											}
										};
									},
									'no_of_desks' : function(data) {
										var observation_id = data[0];
										return {
											name : 'No. of desks observed',
											proc : 'no_of_desks',
											params : function() {
												return {
													observation_id : observation_id
												};
											},
											callback : function(response) {
												return {
													content : response.data[0],
													units : 'desks'
												};
											}
										};
									},
									'no_of_rounds' : function(data) {
										var observation_id = data[0];
										return {
											name : 'Number of desks',
											proc : 'no_of_rounds',
											params : function() {
												return {
													observation_id : observation_id
												};
											},
											callback : function(response) {
												return {
													content : response.data
												};
											}
										};
									},
									'no_of_people_activity' : function(data) {
										var observation_id = data[0];
										var states = data[1];
										var types = data[2];
										var flag_bits = data[3];
										return {
											name : 'Number of people in Activity',
											proc : 'no_of_people_activity',
											params : function() {
												return {
													observation_id : observation_id,
													states : states,
													types : types,
													flag_bits : flag_bits
												};
											},
											callback : function(response) {
												return {
													content : response.data[0]
												};
											}
										};
									},
									'no_of_people_activity_breakdown' : function(data) {
										var observation_id = data[0];
										var activity_ids = data[1];
										var state_names;
										if (data[2])
											state_names = data[2];
										return {
											name : 'Number of people in Activity breakdown',
											proc : 'no_of_people_activity_breakdown',
											params : function() {
												return {
													observation_id : observation_id,
													activity_ids : activity_ids,
												};
											},
											callback : function(response) {
												var content;
												if (response.data)
													content = unpack(JSON.parse(response.data[0]));
												if (state_names && state_names.content)
													setKeyData(content, state_names.content, "id");

												return {
													type : 'table',
													content : content
												};
											}
										};
									},
									'no_of_people_activity_per_building' : function(data) {
										var observation_id = data[0];
										var activity_ids = data[1];
										return {
											name : 'Number of people in Activity per building',
											proc : 'no_of_people_activity_per_building',
											params : function() {
												return {
													observation_id : observation_id,
													activity_ids : activity_ids,
												};
											},
											callback : function(response) {
												var content;
												if (response.data)
													content = unpack(JSON.parse(response.data[0]));
												return {
													type : 'table',
													content : content
												};
											}
										};
									},
									'no_of_people_activity_per_space' : function(data) {
										var observation_id = data[0];
										var activity_ids = data[1];
										return {
											name : 'Number of people in Activity per space',
											proc : 'no_of_people_activity_per_space',
											params : function() {
												return {
													observation_id : observation_id,
													activity_ids : activity_ids,
												};
											},
											callback : function(response) {
												var content;
												if (response.data)
													content = unpack(JSON.parse(response.data[0]));
												return {
													type : 'table',
													content : content
												};
											}
										};
									},
									'no_of_people_activity_interacting' : function(data) {
										var observation_id = data[0];
										var activity_ids = data[1];
										return {
											name : 'Number of people in Activity and Interacting',
											proc : 'no_of_people_activity_interacting',
											params : function() {
												return {
													observation_id : observation_id,
													activity_ids : activity_ids,
												};
											},
											callback : function(response) {
												return {
													content : response.data
												};
											}
										};
									},
									'no_of_people_activity_interacting' : function(data) {
										var observation_id = data[0];
										var activity_ids = data[1];
										return {
											name : 'Number of people in Activity and Interacting',
											proc : 'no_of_people_activity_interacting',
											params : function() {
												return {
													observation_id : observation_id,
													activity_ids : activity_ids,
												};
											},
											callback : function(response) {
												return {
													content : response.data
												};
											}
										};
									},
									'no_of_people_activity_interacting_per_activity' : function(
											data) {
										var observation_id = data[0];
										var activity_ids = data[1];
										var state_names;
										if (data[2])
											state_names = data[2];
										return {
											name : 'Number of people in Activity and Interacting per activity',
											proc : 'no_of_people_activity_interacting_per_activity',
											params : function() {
												return {
													observation_id : observation_id,
													activity_ids : activity_ids,
												};
											},
											callback : function(response) {
												var content;
												if (response.data)
													content = unpack(JSON.parse(response.data[0]));
												if (state_names && state_names.content) {
													setKeyData(content, state_names.content, "id");
												}
												return {
													type : 'table',
													content : content
												};
											}
										};
									},
									'no_of_people_activity_interacting_per_building' : function(
											data) {
										var observation_id = data[0];
										var activity_ids = data[1];
										return {
											name : 'Number of people in Activity and Interacting per building',
											proc : 'no_of_people_activity_interacting_per_building',
											params : function() {
												return {
													observation_id : observation_id,
													activity_ids : activity_ids,
												};
											},
											callback : function(response) {
												var content;
												if (response.data)
													content = unpack(JSON.parse(response.data[0]));
												return {
													type : 'table',
													content : content
												};
											}
										};
									},
									'no_of_people_activity_interacting_per_space' : function(data) {
										var observation_id = data[0];
										var activity_ids = data[1];
										return {
											name : 'Number of people in Activity and Interacting per space',
											proc : 'no_of_people_activity_interacting_per_space',
											params : function() {
												return {
													observation_id : observation_id,
													activity_ids : activity_ids,
												};
											},
											callback : function(response) {
												var content;
												if (response.data)
													content = unpack(JSON.parse(response.data[0]));
												return {
													type : 'table',
													content : content
												};
											}
										};
									},
									'no_of_buildings' : function(data) {
										var study_id = data[0];
										return {
											name : 'Number of buildings',
											proc : 'no_of_buildings',
											params : function() {
												return {
													study_id : study_id
												};
											},
											callback : function(response) {
												return {
													content : response.data[0]
												};
											}
										};
									},
									'no_of_staff' : function(data) {
										var study_id = data[0];
										return {
											name : 'Number of staff',
											proc : 'no_of_staff',
											params : function() {
												return {
													study_id : study_id
												};
											},
											callback : function(response) {
												return {
													content : response.data[0]
												};
											}
										};
									},
									'no_of_staff_per_building' : function(data) {
										var study_id = data[0];
										return {
											name : 'Number of staff per building',
											proc : 'no_of_staff_per_building',
											params : function() {
												return {
													study_id : study_id
												};
											},
											callback : function(response) {
												var content;
												if (response.data)
													content = unpack(JSON.parse(response.data[0]));
												return {
													type : 'table',
													content : content
												};
											}
										};
									},
									'no_of_desks_not_empty' : function(data) {
										var observation_id = data[0];
										return {
											name : 'Number of non empty desks',
											proc : 'no_of_desks_not_empty',
											params : function() {
												return {
													observation_id : observation_id
												};
											},
											callback : function(response) {
												return {
													content : response.data
												};
											}
										};
									},
									'no_of_polys_in_func' : function(data) {
										var study_id = data[0];
										var func_alias = data[1];
										return {
											name : 'No. of Polygons in Function',
											proc : 'no_of_polys_in_func',
											params : function(study) {
												return {
													study_id : study_id,
													func_alias : func_alias
												};
											},
											callback : function(response) {
												return {
													content : parseInt(response.data)
												};
											}
										};
									},
									'no_of_polys_in_poly_types' : function(data) {
										var study_id = data[0];
										var type_ids = data[1];
										return {
											name : 'No. of Polygons in Polygon Type',
											proc : 'no_of_polys_in_poly_types',
											params : function(study) {
												return {
													study_id : study_id,
													type_ids : type_ids
												};
											},
											callback : function(response) {
												return {
													content : parseInt(response.data)
												};
											}
										};
									},
									'nia_of_poly_type_group' : function(data) {
										var study_id = data[0];
										var poly_type_group = data[1];
										return {
											name : 'Nia of Polygon Type Group',
											proc : 'nia_of_poly_type_group',
											params : function(study) {
												return {
													study_id : study_id,
													poly_type_group : poly_type_group
												};
											},
											callback : function(response) {
												return {
													content : parseFloat(response.data)
												};
											}
										};
									},
									'nia_of_poly_type_group_per_building' : function(data) {
										var study_id = data[0];
										var poly_type_group = data[1];
										return {
											name : 'Nia of Polygon Type Group per building',
											proc : 'nia_of_poly_type_group_per_building',
											params : function(study) {
												return {
													study_id : study_id,
													poly_type_group : poly_type_group
												};
											},
											callback : function(response) {
												var content;
												if (response.data)
													content = unpack(JSON.parse(response.data[0]));
												return {
													type : 'table',
													content : content
												};
											}
										};
									},
									'nia_of_poly_type_group_per_space' : function(data) {
										var study_id = data[0];
										var poly_type_group = data[1];
										return {
											name : 'Nia of Polygon Type Group per space',
											proc : 'nia_of_poly_type_group_per_space',
											params : function(study) {
												return {
													study_id : study_id,
													poly_type_group : poly_type_group
												};
											},
											callback : function(response) {
												var content;
												if (response.data)
													content = unpack(JSON.parse(response.data[0]));
												return {
													type : 'table',
													content : content
												};
											}
										};
									},

									'gross_occupancy' : function(data) {
										var observation_id = data[0];
										return {
											name : 'Total desk occupancy',
											proc : 'gross_occupancy',
											params : function(study) {
												return {
													observation_id : observation_id,
												};
											},
											callback : function(response) {
												// console.log(response);
												return {
													content : parseInt(response.data),
													description : 'Total number of times desks were found occupied across all the observation',
													units : "desks"
												};
											}
										};
									},
									'max_desk_occupancy' : function(data) {
										var observation_id = data[0];
										return {
											name : 'Maximum desk occupancy',
											proc : 'max_desk_occupancy',
											params : function(study) {
												return {
													observation_id : observation_id,
												};
											},
											callback : function(response) {
												// console.log(response);
												return {
													content : parseInt(response.data),
													description : 'Maximum number of times desks were found occupied across all the observation',
													units : "desks"
												};
											}
										};
									},
									'min_desk_occupancy' : function(data) {
										var observation_id = data[0];
										return {
											name : 'Minimum desk occupancy',
											proc : 'min_desk_occupancy',
											params : function(study) {
												return {
													observation_id : observation_id,
												};
											},
											callback : function(response) {
												// console.log(response);
												return {
													content : parseInt(response.data),
													description : 'Minimum number of times desks were found occupied across all the observation',
													units : "desks"
												};
											}
										};
									},
									'id_of_staff_question' : function(data) {
										var question_alias = data[0];
										return {
											name : 'ID of question',
											proc : 'id_of_staff_question',
											params : function() {
												return {
													question_alias : question_alias
												};
											},
											callback : function(response) {
												return {
													content : (response.data ? parseInt(response.data)
															: "")
												};
											}
										};
									},
									'id_of_interview_issue' : function(data) {
										var issue_alias = data[0];
										return {
											name : 'ID of interview issue',
											proc : 'id_of_interview_issue',
											params : function() {
												return {
													issue_alias : issue_alias
												};
											},
											callback : function(response) {
												// console.log(response.data);
												return {
													content : (response.data ? parseInt(response.data)
															: "")
												};
											}
										};
									},
									'id_of_interview_question' : function(data) {
										var parent_alias = data[0];
										var question_alias = data[1];
										return {
											name : 'ID of question',
											proc : 'id_of_interview_question',
											params : function() {
												return {
													parent_alias : parent_alias,
													question_alias : question_alias
												};
											},
											callback : function(response) {
												// console.log(response.data);
												return {
													content : (response.data ? parseInt(response.data)
															: "")
												};
											}
										};
									},
									'id_of_staff_questions' : function(data) {
										var question_aliases = data[0];
										return {
											name : 'ID of questions',
											proc : 'id_of_staff_questions',
											params : function() {
												return {
													question_aliases : question_aliases
												};
											},
											callback : function(response) {
												response.data = response.data.map(function(e) {
													return parseInt(e);
												})
												return {
													content : response.data
												};
											}
										};
									},
									'ids_of_questions_in_group' : function(data) {
										var question_group = data[0];
										return {
											name : 'IDs of questions in group',
											proc : 'ids_of_questions_in_group',
											params : function() {
												return {
													question_group : question_group
												};
											},
											callback : function(response) {
												response.data = response.data.map(function(e) {
													return parseInt(e);
												})
												return {
													content : response.data
												};
											}
										};
									},
									'no_of_staff_ties_outside_team' : function(data) {
										var study_id = data[0];
										var question_id = data[1];
										return {
											name : 'Number of ties outside team',
											proc : 'no_of_staff_ties_outside_team',
											params : function(study) {
												return {
													study_id : study_id,
													question_id : question_id
												};
											},
											callback : function(response) {
												// console.log(response);
												return {
													content : parseFloat(response.data),
													units : "ties"
												};
											}
										};
									},
									'no_of_responders_with_ties_outside_team' : function(data) {
										var study_id = data[0];
										var question_id = data[1];
										return {
											name : 'Number of responders with ties outside team',
											proc : 'no_of_responders_with_ties_outside_team',
											params : function(study) {
												return {
													study_id : study_id,
													question_id : question_id
												};
											},
											callback : function(response) {
												// console.log(response);
												return {
													content : parseFloat(response.data),
													units : "people"
												};
											}
										};
									},
									'no_of_staff_ties_per_question' : function(data) {
										var study_id = data[0];
										var question_id = data[1];
										return {
											name : 'Total number of ties per question',
											proc : 'no_of_staff_ties_per_question',
											params : function(study) {
												return {
													study_id : study_id,
													question_id : question_id
												};
											},
											callback : function(response) {
												// console.log(response);
												return {
													content : parseInt(response.data),
													units : "ties"
												};
											}
										};
									},
									'no_of_staff_ties_of_question_and_scores' : function(data) {
										var study_id = data[0];
										var question_id = data[1];
										var scores = data[2];
										return {
											name : 'Total number of ties per question with scores',
											proc : 'no_of_staff_ties_of_question_and_scores',
											params : function(study) {
												return {
													study_id : study_id,
													question_id : question_id,
													scores : scores
												};
											},
											callback : function(response) {
												// console.log(response);
												return {
													content : parseInt(response.data),
													units : "ties"
												};
											}
										};
									},
									'no_of_staff_ties_of_question_per_score' : function(data) {
										var study_id = data[0];
										var question_id = data[1];
										return {
											name : 'Total number of ties of question per score',
											proc : 'no_of_staff_ties_of_question_per_score',
											params : function(study) {
												return {
													study_id : study_id,
													question_id : question_id,
												};
											},
											callback : function(response) {
												var content;
												if (response.data)
													content = unpack(JSON.parse(response.data[0]));
												return {
													type : 'table',
													content : content,
													units : "ties"
												};
											}
										};
									},
									'no_of_staff_ties_within_team_per_score' : function(data) {
										var study_id = data[0];
										var question_ids = data[1];
										return {
											name : 'Total number of ties within team of question per score',
											proc : 'no_of_staff_ties_within_team_per_score',
											params : function(study) {
												return {
													study_id : study_id,
													question_ids : question_ids,
												};
											},
											callback : function(response) {
												var content;
												if (response.data)
													content = unpack(JSON.parse(response.data[0]));
												return {
													type : 'table',
													content : content,
													units : "ties"
												};
											}
										};
									},
									'no_of_staff_ties_outside_team_per_score' : function(data) {
										var study_id = data[0];
										var question_ids = data[1];
										return {
											name : 'Total number of ties outside team of question per score',
											proc : 'no_of_staff_ties_outside_team_per_score',
											params : function(study) {
												return {
													study_id : study_id,
													question_ids : question_ids,
												};
											},
											callback : function(response) {
												var content;
												if (response.data)
													content = unpack(JSON.parse(response.data[0]));
												return {
													type : 'table',
													content : content,
													units : "ties"
												};
											}
										};
									},
									'no_of_staff_ties_within_building_per_score' : function(data) {
										var study_id = data[0];
										var question_ids = data[1];
										return {
											name : 'Total number of ties within building of question per score',
											proc : 'no_of_staff_ties_within_building_per_score',
											params : function(study) {
												return {
													study_id : study_id,
													question_ids : question_ids,
												};
											},
											callback : function(response) {
												var content;
												if (response.data)
													content = unpack(JSON.parse(response.data[0]));
												return {
													type : 'table',
													content : content,
													units : "ties"
												};
											}
										};
									},
									'no_of_staff_ties_outside_building_per_score' : function(data) {
										var study_id = data[0];
										var question_ids = data[1];
										return {
											name : 'Total number of ties outside building of question per score',
											proc : 'no_of_staff_ties_outside_building_per_score',
											params : function(study) {
												return {
													study_id : study_id,
													question_ids : question_ids,
												};
											},
											callback : function(response) {
												var content;
												if (response.data)
													content = unpack(JSON.parse(response.data[0]));
												return {
													type : 'table',
													content : content,
													units : "ties"
												};
											}
										};
									},
									'no_of_staff_ties_within_floor_per_score' : function(data) {
										var study_id = data[0];
										var question_ids = data[1];
										return {
											name : 'Total number of ties within floor of question per score',
											proc : 'no_of_staff_ties_within_floor_per_score',
											params : function(study) {
												return {
													study_id : study_id,
													question_ids : question_ids,
												};
											},
											callback : function(response) {
												var content;
												if (response.data)
													content = unpack(JSON.parse(response.data[0]));
												return {
													type : 'table',
													content : content,
													units : "ties"
												};
											}
										};
									},
									'no_of_staff_ties_outside_floor_per_score' : function(data) {
										var study_id = data[0];
										var question_ids = data[1];
										return {
											name : 'Total number of ties outside floor of question per score',
											proc : 'no_of_staff_ties_outside_floor_per_score',
											params : function(study) {
												return {
													study_id : study_id,
													question_ids : question_ids,
												};
											},
											callback : function(response) {
												var content;
												if (response.data)
													content = unpack(JSON.parse(response.data[0]));
												return {
													type : 'table',
													content : content,
													units : "ties"
												};
											}
										};
									},
									'no_of_staff_ties_within_team_per_team' : function(data) {
										var study_id = data[0];
										var question_id = data[1];
										return {
											name : 'Total number of ties within team of question per team',
											proc : 'no_of_staff_ties_within_team_per_team',
											params : function(study) {
												return {
													study_id : study_id,
													question_id : question_id,
												};
											},
											callback : function(response) {
												var content;
												if (response.data)
													content = unpack(JSON.parse(response.data[0]));
												return {
													type : 'table',
													content : content,
													units : "ties"
												};
											}
										};
									},
									'no_of_staff_ties_outside_team_per_team' : function(data) {
										var study_id = data[0];
										var question_id = data[1];
										return {
											name : 'Total number of ties outside team of question per team',
											proc : 'no_of_staff_ties_outside_team_per_team',
											params : function(study) {
												return {
													study_id : study_id,
													question_id : question_id,
												};
											},
											callback : function(response) {
												var content;
												if (response.data)
													content = unpack(JSON.parse(response.data[0]));
												return {
													type : 'table',
													content : content,
													units : "ties"
												};
											}
										};
									},
									'no_of_possible_staff_ties_within_team_per_team' : function(
											data) {
										var study_id = data[0];
										return {
											name : 'Total possible number of ties within team of question per team',
											proc : 'no_of_possible_staff_ties_within_team_per_team',
											params : function(study) {
												return {
													study_id : study_id
												};
											},
											callback : function(response) {
												var content;
												if (response.data)
													content = unpack(JSON.parse(response.data[0]));
												return {
													type : 'table',
													content : content,
													units : "ties"
												};
											}
										};
									},
									'no_of_possible_staff_ties_outside_team_per_team' : function(
											data) {
										var study_id = data[0];
										return {
											name : 'Total possible number of ties outside team of question per team',
											proc : 'no_of_possible_staff_ties_outside_team_per_team',
											params : function(study) {
												return {
													study_id : study_id
												};
											},
											callback : function(response) {
												var content;
												if (response.data)
													content = unpack(JSON.parse(response.data[0]));
												return {
													type : 'table',
													content : content,
													units : "ties"
												};
											}
										};
									},
									'no_of_possible_staff_ties_within_team' : function(data) {
										var study_id = data[0];
										return {
											name : 'Number of possible ties within team',
											proc : 'no_of_possible_staff_ties_within_team',
											params : function(study) {
												return {
													study_id : study_id,
												};
											},
											callback : function(response) {
												// console.log(response);
												return {
													content : parseInt(response.data),
													units : "no_of_ties"
												};
											}
										};
									},
									'no_of_possible_staff_ties_outside_team' : function(data) {
										var study_id = data[0];
										return {
											name : 'Number of possible ties outside team',
											proc : 'no_of_possible_staff_ties_outside_team',
											params : function(study) {
												return {
													study_id : study_id,
												};
											},
											callback : function(response) {
												// console.log(response);
												return {
													content : parseInt(response.data),
													units : "no_of_ties"
												};
											}
										};
									},
									'no_of_unique_undir_staff_ties_outside_team_of_score' : function(
											data) {
										var study_id = data[0];
										var question_id = data[1];
										var lower_limit = data[2];
										var upper_limit = data[3];
										return {
											name : 'Number of unique undirected staff ties outside team',
											proc : 'no_of_unique_undir_staff_ties_outside_team_of_score',
											params : function(study) {
												return {
													study_id : study_id,
													question_id : question_id,
													lower_limit : lower_limit,
													upper_limit : upper_limit
												};
											},
											callback : function(response) {
												// console.log(response);
												return {
													content : parseInt(response.data),
													units : "ties"
												};
											}
										};
									},
									'no_of_unique_undir_staff_ties_within_team_of_score' : function(
											data) {
										var study_id = data[0];
										var question_id = data[1];
										var lower_limit = data[2];
										var upper_limit = data[3];
										return {
											name : 'Number of unique undirected staff ties within team',
											proc : 'no_of_unique_undir_staff_ties_within_team_of_score',
											params : function(study) {
												return {
													study_id : study_id,
													question_id : question_id,
													lower_limit : lower_limit,
													upper_limit : upper_limit
												};
											},
											callback : function(response) {
												// console.log(response);
												return {
													content : parseInt(response.data),
													units : "ties"
												};
											}
										};
									},
									'no_of_responders_per_tie_question' : function(data) {
										var study_id = data[0];
										var question_id = data[1];
										return {
											name : 'Total number of responders per question',
											proc : 'no_of_responders_per_tie_question',
											params : function(study) {
												return {
													study_id : study_id,
													question_id : question_id
												};
											},
											callback : function(response) {
												// console.log(response);
												return {
													content : parseInt(response.data),
													units : "people"
												};
											}
										};
									},
									'no_of_unique_contacts_per_question' : function(data) {
										var study_id = data[0];
										var question_id = data[1];
										return {
											name : 'Total number of contacts per question',
											proc : 'no_of_unique_contacts_per_question',
											params : function(study) {
												return {
													study_id : study_id,
													question_id : question_id
												};
											},
											callback : function(response) {
												// console.log(response);
												return {
													content : parseInt(response.data),
													units : "people"
												};
											}
										};
									},
									'avg_question_mark' : function(data) {
										var study_id = data[0];
										var question_id = data[1];
										return {
											name : 'Average Question Mark',
											proc : 'avg_question_mark',
											params : function(study) {
												return {
													study_id : study_id,
													question_id : question_id
												};
											},
											callback : function(response) {
												if (!response.data.length)
													return {
														type : 'error',
														content : 'Question does not have numeric answers'
													}
												return {
													content : parseFloat(response.data)
												};
											}
										};
									},
									'no_of_desks_per_building' : function(data) {
										var observation_id = data[0];
										return {
											name : 'Number of desks per building',
											proc : 'no_of_desks_per_building',
											params : function(study) {
												return {
													observation_id : observation_id,
												};
											},
											callback : function(response) {
												var content;
												if (response.data)
													content = unpack(JSON.parse(response.data[0]));
												return {
													type : 'table',
													content : content,
													units : "desks"
												};
											}
										};
									},
									'nia_of_poly_types_per_building' : function(data) {
										var type_ids = data[0];
										var study_id = data[1];
										return {
											name : 'NIA of polygon types per building',
											proc : 'nia_of_poly_types_per_building',
											params : function(study) {
												return {
													type_ids : type_ids,
													study_id : study_id,
												};
											},
											callback : function(response) {
												var content;
												if (response.data)
													content = unpack(JSON.parse(response.data[0]));
												return {
													type : 'table',
													content : content,
													units : "m\xB2"
												};
											}
										};
									},
									'no_of_desks_per_space' : function(data) {
										var observation_id = data[0];
										return {
											name : 'Number of desks per space',
											proc : 'no_of_desks_per_space',
											params : function(study) {
												return {
													observation_id : observation_id,
												};
											},
											callback : function(response) {
												var content;
												if (response.data)
													content = unpack(JSON.parse(response.data[0]));
												return {
													type : 'table',
													content : content,
													units : "desks"
												};
											}
										};
									},
									'nia_of_poly_types_per_space' : function(data) {
										var type_ids = data[0];
										var study_id = data[1];
										return {
											name : 'NIA of polygon types per space',
											proc : 'nia_of_poly_types_per_space',
											params : function(study) {
												return {
													type_ids : type_ids,
													study_id : study_id,
												};
											},
											callback : function(response) {
												var content;
												if (response.data)
													content = unpack(JSON.parse(response.data[0]));
												return {
													type : 'table',
													content : content,
													units : "m\xB2"
												};
											}
										};
									},
									'nia_per_poly_type' : function(data) {
										var study_id = data[0];
										var type_ids = data[1];
										return {
											name : 'NIA per polygon type',
											proc : 'nia_per_poly_type',
											params : function(study) {
												return {
													study_id : study_id,
													type_ids : type_ids,
												};
											},
											callback : function(response) {
												var content;
												if (response.data && response.data.length > 0)
													content = unpack(JSON.parse(response.data[0]));
												return {
													type : 'table',
													content : content,
													units : "m\xB2"
												};
											}
										};
									},
									'no_of_staff_replies_within_marks' : function(data) {
										var study_id = data[0];
										var question_id = data[1];
										var mark_over = data[2];
										var mark_under = data[3];
										return {
											name : 'Number of staff replies within marks',
											proc : 'no_of_staff_replies_within_marks',
											params : function(study) {
												return {
													study_id : study_id,
													question_id : question_id,
													mark_over : mark_over,
													mark_under : mark_under
												};
											},
											callback : function(response) {
												return {
													content : parseInt(response.data[0]),
													units : "replies"
												};
											}
										};
									},
									'no_of_staff_replies_per_choice' : function(data) {
										var study_id = data[0];
										var question_id = data[1];
										return {
											name : 'Number of staff replies per choice',
											proc : 'no_of_staff_replies_per_choice',
											params : function(study) {
												return {
													study_id : study_id,
													question_id : question_id,
												};
											},
											callback : function(response) {
												var content;
												if (response.data && response.data.length > 0)
													content = unpack(JSON.parse(response.data[0]));
												return {
													type : 'table',
													content : content,
													units : "replies"
												};
											}
										};
									},
									'no_of_staff_quotes_per_tag' : function(data) {
										var study_id = data[0];
										var question_id = data[1];
										return {
											name : 'Number of staff quotes per tag',
											proc : 'no_of_staff_quotes_per_tag',
											params : function(study) {
												return {
													study_id : study_id,
													question_id : question_id,
												};
											},
											callback : function(response) {
												var content;
												if (response.data && response.data.length > 0)
													content = unpack(JSON.parse(response.data[0]));
												return {
													type : 'table',
													content : content,
													units : "quotes"
												};
											}
										};
									},
									'question_names' : function(data) {
										var question_ids = data[0];
										return {
											name : 'Question Names',
											proc : 'question_names',
											params : function() {
												return {
													question_ids : question_ids
												};
											},
											callback : function(response) {
												return {
													content : JSON.parse(response.data)
												};
											}
										};
									},
									'no_of_staff_replies_per_choice_multi_q' : function(data) {
										var study_id = data[0];
										var question_ids = data[1];
										var question_key_names;
										if (data[2])
											question_key_names = data[2];
										return {
											name : 'Number of staff replies per choice multiple question',
											proc : 'no_of_staff_replies_per_choice_multi_q',
											params : function(study) {
												return {
													study_id : study_id,
													question_ids : question_ids,
												};
											},
											callback : function(response) {
												var content;
												if (response.data && response.data.length > 0
														&& response.data[0]) {
													content = unpack(JSON.parse(response.data[0]), true);
													if (question_key_names && question_key_names.content)
														setPropertyData(content, question_key_names.content);
												}
												return {
													type : 'table',
													content : content,
													units : "replies"
												};
											}
										};
									},
									'no_of_staff_ties_directional_team_to_team' : function(data) {
										var study_id = data[0];
										var question_id = data[1];
										// var question_key_names;
										// if (data[2])
										// question_key_names = data[2];
										return {
											name : 'Number of staff replies per choice multiple question',
											proc : 'no_of_staff_ties_directional_team_to_team',
											params : function(study) {
												return {
													study_id : study_id,
													question_id : question_id,
												};
											},
											callback : function(response) {
												// console.log(response.data);
												var content;
												if (response.data && response.data.length > 0)
													content = unpack(JSON.parse(response.data[0]), true);
												// if (question_key_names)
												// setPropertyData(content, question_key_names);
												return {
													type : 'table',
													content : content,
													units : "replies"
												};
											}
										};
									},
									'no_of_interview_ties_directional_team_to_team' : function(
											data) {
										var study_id = data[0];
										var question_id = data[1];
										var team_names;
										if (data[2])
											team_names = data[2];
										return {
											name : 'Number of staff replies per choice multiple question',
											proc : 'no_of_interview_ties_directional_team_to_team',
											params : function(study) {
												return {
													study_id : study_id,
													question_id : question_id,
												};
											},
											callback : function(response) {
												// console.log(response.data);
												var content;
												if (response.data && response.data.length > 0)
													content = unpack(JSON.parse(response.data[0]), true);
												if (team_names && team_names.content) {
													setPropertyData(content, team_names.content, "id");
													setKeyData(content, team_names.content, "id");
												}
												return {
													type : 'table',
													content : content,
													units : "replies"
												};
											}
										};
									},
									'no_of_staff_ties_directional_team_to_team_scored' : function(
											data) {
										var study_id = data[0];
										var question_id = data[1];
										var score_over = data[2];
										var score_under = data[3];
										var team_names;
										if (data[4])
											team_names = data[4];
										return {
											name : 'Number of staff replies per choice multiple question (scored)',
											proc : 'no_of_staff_ties_directional_team_to_team_scored',
											params : function(study) {
												return {
													study_id : study_id,
													question_id : question_id,
													score_over : score_over,
													score_under : score_under
												};
											},
											callback : function(response) {
												// console.log(team_names);
												var content;
												if (response.data && response.data.length > 0)
													content = unpack(JSON.parse(response.data[0]), true);
												if (team_names && team_names.content) {
													setPropertyData(content, team_names.content, "id");
													setKeyData(content, team_names.content, "id");
												}
												return {
													type : 'table',
													content : content,
													units : "replies"
												};
											}
										};
									},
									'all_team_ids' : function(data) {
										var study_id = data[0];
										return {
											name : 'All team ids in a study',
											proc : 'all_team_ids',
											params : function(study) {
												return {
													study_id : study_id
												};
											},
											callback : function(response) {
												var content = response.data.map(function(d) {
													return parseInt(d);
												});
												return {
													content : content,
												};
											}
										};
									},
									'team_names' : function(data) {
										var team_ids = data[0];
										return {
											name : 'Names of teams',
											proc : 'team_names',
											params : function(study) {
												return {
													team_ids : team_ids
												};
											},
											callback : function(response) {
												return {
													content : JSON.parse(response.data)
												};
											}
										};
									},
									'quotes_under_issue' : function(data) {
										var study_id = data[0];
										var issue_id = data[1];
										return {
											name : 'Quotes under issue',
											proc : 'quotes_under_issue',
											params : function(study) {
												return {
													study_id : study_id,
													issue_id : issue_id
												};
											},
											callback : function(response) {
												var content = response.data.map(function(d) {
													return {
														name : d
													}
												});
												return {
													type : 'list',
													content : content
												};
											}
										};
									},
									'quotes_under_issue_flagged' : function(data) {
										var study_id = data[0];
										var issue_id = data[1];
										return {
											name : 'Quotes under issue (flagged)',
											proc : 'quotes_under_issue_flagged',
											params : function(study) {
												return {
													study_id : study_id,
													issue_id : issue_id
												};
											},
											callback : function(response) {
												var content = response.data.map(function(d) {
													return {
														name : d
													}
												});
												return {
													type : 'list',
													content : content
												};
											}
										};
									},
									'possible_choices_in_question' : function(data) {
										var question_id = data[0];
										return {
											name : 'Possible choices in Question',
											proc : 'possible_choices_in_question',
											params : function(study) {
												return {
													question_id : question_id
												};
											},
											callback : function(response) {
												return {
													content : response.data
												};
											}
										};
									},
									'no_of_responders_for_choice_question_and_choices' : function(
											data) {
										var study_id = data[0];
										var question_id = data[1];
										var choice_ids = data[2];
										return {
											name : 'Number of responders for question and choices',
											proc : 'no_of_responders_for_choice_question_and_choices',
											params : function(study) {
												return {
													study_id : study_id,
													question_id : question_id,
													choice_ids : choice_ids
												};
											},
											callback : function(response) {
												return {
													content : parseInt(response.data[0])
												};
											}
										};
									},
									'avg_ties_in_team' : function(data) {
										var study_id = data[0];
										var question_id = data[1];
										return {
											name : 'Average number of ties within team',
											proc : 'avg_ties_in_team',
											params : function(study) {
												return {
													study_id : study_id,
													question_id : question_id
												};
											},
											callback : function(response) {
												return {
													content : parseFloat(response.data[0])
												};
											}
										};
									},
									'avg_ties_outside_team' : function(data) {
										var study_id = data[0];
										var question_id = data[1];
										return {
											name : 'Average number of ties outside team',
											proc : 'avg_ties_outside_team',
											params : function(study) {
												return {
													study_id : study_id,
													question_id : question_id
												};
											},
											callback : function(response) {
												return {
													content : parseFloat(response.data[0])
												};
											}
										};
									},
									'avg_possible_ties_in_team' : function(data) {
										var study_id = data[0];
										return {
											name : 'Average possible number of ties within team',
											proc : 'avg_possible_ties_in_team',
											params : function(study) {
												return {
													study_id : study_id
												};
											},
											callback : function(response) {
												return {
													content : parseFloat(response.data[0])
												};
											}
										};
									},
									'avg_possible_ties_outside_team' : function(data) {
										var study_id = data[0];
										return {
											name : 'Average possible number of ties outside team',
											proc : 'avg_possible_ties_outside_team',
											params : function(study) {
												return {
													study_id : study_id
												};
											},
											callback : function(response) {
												return {
													content : parseFloat(response.data[0])
												};
											}
										};
									},
									'avg_ties_in_floor' : function(data) {
										var study_id = data[0];
										var question_id = data[1];
										return {
											name : 'Average number of ties within floor',
											proc : 'avg_ties_in_floor',
											params : function(study) {
												return {
													study_id : study_id,
													question_id : question_id
												};
											},
											callback : function(response) {
												return {
													content : parseFloat(response.data[0])
												};
											}
										};
									},
									'avg_ties_outside_floor' : function(data) {
										var study_id = data[0];
										var question_id = data[1];
										return {
											name : 'Average number of ties outside floor',
											proc : 'avg_ties_outside_floor',
											params : function(study) {
												return {
													study_id : study_id,
													question_id : question_id
												};
											},
											callback : function(response) {
												return {
													content : parseFloat(response.data[0])
												};
											}
										};
									},
									'avg_possible_ties_in_floor' : function(data) {
										var study_id = data[0];
										return {
											name : 'Average possible number of ties within floor',
											proc : 'avg_possible_ties_in_floor',
											params : function(study) {
												return {
													study_id : study_id
												};
											},
											callback : function(response) {
												return {
													content : parseFloat(response.data[0])
												};
											}
										};
									},
									'avg_possible_ties_outside_floor' : function(data) {
										var study_id = data[0];
										return {
											name : 'Average possible number of ties outside floor',
											proc : 'avg_possible_ties_outside_floor',
											params : function(study) {
												return {
													study_id : study_id
												};
											},
											callback : function(response) {
												return {
													content : parseFloat(response.data[0])
												};
											}
										};
									},
									'avg_ties_in_building' : function(data) {
										var study_id = data[0];
										var question_id = data[1];
										return {
											name : 'Average number of ties within building',
											proc : 'avg_ties_in_building',
											params : function(study) {
												return {
													study_id : study_id,
													question_id : question_id
												};
											},
											callback : function(response) {
												return {
													content : parseFloat(response.data[0])
												};
											}
										};
									},
									'avg_ties_outside_building' : function(data) {
										var study_id = data[0];
										var question_id = data[1];
										return {
											name : 'Average number of ties outside building',
											proc : 'avg_ties_outside_building',
											params : function(study) {
												return {
													study_id : study_id,
													question_id : question_id
												};
											},
											callback : function(response) {
												return {
													content : parseFloat(response.data[0])
												};
											}
										};
									},
									'avg_possible_ties_in_building' : function(data) {
										var study_id = data[0];
										return {
											name : 'Average possible number of ties within building',
											proc : 'avg_possible_ties_in_building',
											params : function(study) {
												return {
													study_id : study_id
												};
											},
											callback : function(response) {
												return {
													content : parseFloat(response.data[0])
												};
											}
										};
									},
									'avg_possible_ties_outside_building' : function(data) {
										var study_id = data[0];
										return {
											name : 'Average possible number of ties outside building',
											proc : 'avg_possible_ties_outside_building',
											params : function(study) {
												return {
													study_id : study_id
												};
											},
											callback : function(response) {
												return {
													content : parseFloat(response.data[0])
												};
											}
										};
									},
									'sum_of_interview_choice_scores' : function(data) {
										var study_id = data[0];
										var question_id = data[1];
										return {
											name : 'Sum of interview choice scores',
											proc : 'sum_of_interview_choice_scores',
											params : function(study) {
												return {
													study_id : study_id,
													question_id : question_id
												};
											},
											callback : function(response) {
												var content;
												if (response.data && response.data.length > 0)
													content = unpack(JSON.parse(response.data[0]));
												return {
													type : 'table',
													content : content,
													units : "score"
												};
											}
										};
									},
									'avg_depthmap_value_of_poly_type' : function(data) {
										var type_ids = data[0];
										var depthmap_ids = data[1];
										var band_alias = data[2];
										return {
											name : 'Average depthmap value of polygon types',
											proc : 'avg_depthmap_value_of_poly_type',
											params : function(study) {
												return {
													type_ids : type_ids,
													depthmap_ids : depthmap_ids,
													band_alias : band_alias
												};
											},
											callback : function(response) {
												return {
													content : parseFloat(response.data[0])
												};
											}
										};
									},
									'avg_depthmap_value_per_poly_type' : function(data) {
										var type_ids = data[0];
										var depthmap_ids = data[1];
										var band_alias = data[2];
										var type_names;
										if (data[3])
											type_names = data[3];
										return {
											name : 'Average depthmap value of polygon types',
											proc : 'avg_depthmap_value_per_poly_type',
											params : function(study) {
												return {
													type_ids : type_ids,
													depthmap_ids : depthmap_ids,
													band_alias : band_alias
												};
											},
											callback : function(response) {
												console.log(response.data);
												var content;
												if (response.data && response.data.length > 0) {
													content = unpack(JSON.parse(response.data[0]));
													if (type_names && type_names.content) {
														// setPropertyData(content, team_names, "id");
														setKeyData(content, type_names.content, "id");
													}
												}
												return {
													type : 'table',
													content : content
												};
											}
										};
									},
									'avg_depthmap_value' : function(data) {
										var depthmap_ids = data[0];
										var band_alias = data[1];
										return {
											name : 'Average depthmap value',
											proc : 'avg_depthmap_value',
											params : function(study) {
												return {
													depthmap_ids : depthmap_ids,
													band_alias : band_alias
												};
											},
											callback : function(response) {
												return {
													content : parseFloat(response.data[0])
												};
											}
										};
									},
									'max_depthmap_value' : function(data) {
										var depthmap_ids = data[0];
										var band_alias = data[1];
										return {
											name : 'Maximum depthmap value',
											proc : 'max_depthmap_value',
											params : function(study) {
												return {
													depthmap_ids : depthmap_ids,
													band_alias : band_alias
												};
											},
											callback : function(response) {
												return {
													content : parseFloat(response.data[0])
												};
											}
										};
									},
									'min_depthmap_value' : function(data) {
										var depthmap_ids = data[0];
										var band_alias = data[1];
										return {
											name : 'Minimum depthmap value',
											proc : 'min_depthmap_value',
											params : function(study) {
												return {
													depthmap_ids : depthmap_ids,
													band_alias : band_alias
												};
											},
											callback : function(response) {
												return {
													content : parseFloat(response.data[0])
												};
											}
										};
									},
									'avg_depthmap_value_per_building' : function(data) {
										var depthmap_ids = data[0];
										var band_alias = data[1];
										return {
											name : 'Average depthmap value per building',
											proc : 'avg_depthmap_value_per_building',
											params : function(study) {
												return {
													depthmap_ids : depthmap_ids,
													band_alias : band_alias
												};
											},
											callback : function(response) {
												var content;
												if (response.data && response.data.length > 0)
													content = unpack(JSON.parse(response.data[0]));
												return {
													type : 'table',
													content : content
												};
											}

										};
									},
									'id_of_depthmaps' : function(data) {
										var study_id = data[0];
										var depthmap_type = data[1];
										return {
											name : 'ID of depthmaps',
											proc : 'id_of_depthmaps',
											params : function(study) {
												return {
													study_id : study_id,
													depthmap_type : depthmap_type
												};
											},
											callback : function(response) {
												var content;
												if (response.data && response.data.length > 0)
													content = response.data.map(function(d) {
														return parseInt(d);
													});
												return {
													content : content
												};
											}
										};
									},
									'poly_types_names' : function(data) {
										var poly_type_ids = data[0];
										return {
											name : 'Polygon type names',
											proc : 'poly_types_names',
											params : function(study) {
												return {
													poly_type_ids : poly_type_ids
												};
											},
											callback : function(response) {
												return {
													content : JSON.parse(response.data)
												};
											}
										};
									},
									'round_times' : function(data) {
										var observation_id = data[0];
										return {
											name : 'Round times',
											proc : 'round_times',
											params : function(study) {
												return {
													observation_id : observation_id
												};
											},
											callback : function(response) {
												return {
													content : JSON.parse(response.data)
												};
											}
										};
									},

									'no_of_people_per_round' : function(data) {
										var observation_id = data[0];
										var states = data[1];
										var key_names;
										if (data[2])
											key_names = data[2];
										return {
											name : 'Average depthmap value per building',
											proc : 'no_of_people_per_round',
											params : function(study) {
												return {
													observation_id : observation_id,
													states : states
												};
											},
											callback : function(response) {

												var content;
												if (response.data && response.data.length > 0)
													content = unpack(JSON.parse(response.data[0]));
												if (key_names && key_names.content) {
													// setPropertyData(content, team_names, "id");
													setKeyData(content, key_names.content, "id");
												}
												return {
													type : 'table',
													content : content
												};
											}

										};
									},
									'activity_in_polygon_types' : function(data) {
										var observation_id = data[0];
										var polygon_type_ids = data[1];
										var entity_states = data[2];
										var entity_types = data[3];
										var entity_flag_bits = data[4];
										return {
											name : 'Activity in polygon types',
											proc : 'activity_in_polygon_types',
											params : function(study) {
												return {
													observation_id : observation_id,
													polygon_type_ids : polygon_type_ids,
													entity_states : entity_states,
													entity_types : entity_types,
													entity_flag_bits : entity_flag_bits
												};
											},
											callback : function(response) {
												var content;
												if (response.data && response.data.length > 0)
													content = response.data[0];
												return {
													content : response.data[0]
												};
											}
										};
									},
									'activity_in_polygon_types_per_type' : function(data) {
										var observation_id = data[0];
										var polygon_type_ids = data[1];
										var entity_states = data[2];
										var entity_types = data[3];
										var entity_flag_bits = data[4];
										var type_names;
										if (data[5])
											type_names = data[5];
										return {
											name : 'Activity in polygon types per type',
											proc : 'activity_in_polygon_types_per_type',
											params : function(study) {
												return {
													observation_id : observation_id,
													polygon_type_ids : polygon_type_ids,
													entity_states : entity_states,
													entity_types : entity_types,
													entity_flag_bits : entity_flag_bits
												};
											},
											callback : function(response) {
												var content;
												if (response.data && response.data.length > 0)
													content = unpack(JSON.parse(response.data[0]));
												if (type_names && type_names.content) {
													setKeyData(content, type_names.content, "id");
												}
												return {
													type : 'table',
													content : content
												};
											}
										};
									},
									'activity_interacting_in_polygon_types_per_activity' : function(
											data) {
										var observation_id = data[0];
										var polygon_type_ids = data[1];
										var entity_states = data[2];
										var entity_types = data[3];
										var entity_flag_bits = data[4];
										var state_names;
										if (data[5])
											state_names = data[5];
										return {
											name : 'Activity (interacting) in polygon types per activity',
											proc : 'activity_interacting_in_polygon_types_per_activity',
											params : function(study) {
												return {
													observation_id : observation_id,
													polygon_type_ids : polygon_type_ids,
													entity_states : entity_states,
													entity_types : entity_types,
													entity_flag_bits : entity_flag_bits
												};
											},
											callback : function(response) {
												var content;
												if (response.data && response.data.length > 0)
													content = unpack(JSON.parse(response.data[0]));
												if (state_names && state_names.content) {
													setKeyData(content, state_names.content, "id");
												}
												return {
													type : 'table',
													content : content
												};
											}
										};
									},
									'activity_max_in_polygon_types_per_type' : function(data) {
										var observation_id = data[0];
										var polygon_type_ids = data[1];
										var entity_states = data[2];
										var entity_types = data[3];
										var entity_flag_bits = data[4];
										var type_names;
										if (data[5])
											type_names = data[5];
										return {
											name : 'Max activity in polygon types per type',
											proc : 'activity_max_in_polygon_types_per_type',
											params : function(study) {
												return {
													observation_id : observation_id,
													polygon_type_ids : polygon_type_ids,
													entity_states : entity_states,
													entity_types : entity_types,
													entity_flag_bits : entity_flag_bits
												};
											},
											callback : function(response) {
												var content;
												if (response.data && response.data.length > 0)
													content = unpack(JSON.parse(response.data[0]));
												// if (type_names && type_names.content) {
												// setKeyData(content, type_names.content, "id");
												// }
												return {
													type : 'table',
													content : content
												};
											}
										};
									},
									'activity_min_in_polygon_types_per_type' : function(data) {
										var observation_id = data[0];
										var polygon_type_ids = data[1];
										var entity_states = data[2];
										var entity_types = data[3];
										var entity_flag_bits = data[4];
										var type_names;
										if (data[5])
											type_names = data[5];
										return {
											name : 'Min activity in polygon types per type',
											proc : 'activity_min_in_polygon_types_per_type',
											params : function(study) {
												return {
													observation_id : observation_id,
													polygon_type_ids : polygon_type_ids,
													entity_states : entity_states,
													entity_types : entity_types,
													entity_flag_bits : entity_flag_bits
												};
											},
											callback : function(response) {
												var content;
												if (response.data && response.data.length > 0)
													content = unpack(JSON.parse(response.data[0]));
												// if (type_names && type_names.content) {
												// setKeyData(content, type_names.content, "id");
												// }
												return {
													type : 'table',
													content : content
												};
											}
										};
									},
									'groups_of_people_in_poly_types_avg' : function(data) {
										var observation_id = data[0];
										var polygon_type_ids = data[1];
										var entity_states = data[2];
										var entity_types = data[3];
										var entity_flag_bits = data[4];
										var groups = data[5];
										var group_names;
										if (data[6])
											group_names = data[6];
										return {
											name : 'Groups of people in polygon types (average number of groups)',
											proc : 'groups_of_people_in_poly_types_avg',
											params : function(study) {
												return {
													observation_id : observation_id,
													polygon_type_ids : polygon_type_ids,
													entity_states : entity_states,
													entity_types : entity_types,
													entity_flag_bits : entity_flag_bits,
													groups : groups
												};
											},
											callback : function(response) {
												console.log(response.data);
												var content;
												if (response.data && response.data.length > 0)
													content = unpack(JSON.parse(response.data[0]));
												// if (type_names && type_names.content) {
												// setKeyData(content, type_names.content, "id");
												// }
												return {
													type : 'table',
													content : content
												};
											}
										};
									},
									'groups_of_people_in_poly_types_sum' : function(data) {
										var observation_id = data[0];
										var polygon_type_ids = data[1];
										var entity_states = data[2];
										var entity_types = data[3];
										var entity_flag_bits = data[4];
										var groups = data[5];
										var group_names;
										if (data[6])
											group_names = data[6];
										return {
											name : 'Groups of people in polygon types (sum number of groups)',
											proc : 'groups_of_people_in_poly_types_sum',
											params : function(study) {
												return {
													observation_id : observation_id,
													polygon_type_ids : polygon_type_ids,
													entity_states : entity_states,
													entity_types : entity_types,
													entity_flag_bits : entity_flag_bits,
													groups : groups
												};
											},
											callback : function(response) {
												console.log(response.data);
												var content;
												if (response.data && response.data.length > 0)
													content = unpack(JSON.parse(response.data[0]));
												// if (type_names && type_names.content) {
												// setKeyData(content, type_names.content, "id");
												// }
												return {
													type : 'table',
													content : content
												};
											}
										};
									},
									'groups_of_people_in_poly_types_max' : function(data) {
										var observation_id = data[0];
										var polygon_type_ids = data[1];
										var entity_states = data[2];
										var entity_types = data[3];
										var entity_flag_bits = data[4];
										var groups = data[5];
										var group_names;
										if (data[6])
											group_names = data[6];
										return {
											name : 'Groups of people in polygon types (maximum number of groups)',
											proc : 'groups_of_people_in_poly_types_max',
											params : function(study) {
												return {
													observation_id : observation_id,
													polygon_type_ids : polygon_type_ids,
													entity_states : entity_states,
													entity_types : entity_types,
													entity_flag_bits : entity_flag_bits,
													groups : groups
												};
											},
											callback : function(response) {
												var content;
												if (response.data && response.data.length > 0)
													content = unpack(JSON.parse(response.data[0]));
												// if (type_names && type_names.content) {
												// setKeyData(content, type_names.content, "id");
												// }
												return {
													type : 'table',
													content : content
												};
											}
										};
									},
									'groups_of_people_in_poly_types_min' : function(data) {
										var observation_id = data[0];
										var polygon_type_ids = data[1];
										var entity_states = data[2];
										var entity_types = data[3];
										var entity_flag_bits = data[4];
										var groups = data[5];
										var group_names;
										if (data[6])
											group_names = data[6];
										return {
											name : 'Groups of people in polygon types (minimum number of groups)',
											proc : 'groups_of_people_in_poly_types_min',
											params : function(study) {
												return {
													observation_id : observation_id,
													polygon_type_ids : polygon_type_ids,
													entity_states : entity_states,
													entity_types : entity_types,
													entity_flag_bits : entity_flag_bits,
													groups : groups
												};
											},
											callback : function(response) {
												var content;
												if (response.data && response.data.length > 0)
													content = unpack(JSON.parse(response.data[0]));
												// if (type_names && type_names.content) {
												// setKeyData(content, type_names.content, "id");
												// }
												return {
													type : 'table',
													content : content
												};
											}
										};
									},
									'occupancy_frequency_grouped' : function(data) {
										var observation_id = data[0];
										var groups = data[1];
										var group_names;
										if (data[2])
											group_names = data[2];
										return {
											name : 'Distribution of average occupancy',
											proc : 'occupancy_frequency_grouped',
											params : function(study) {
												return {
													observation_id : observation_id,
													groups : groups
												};
											},
											callback : function(response) {
												var content;
												if (response.data && response.data.length > 0)
													content = unpack(JSON.parse(response.data[0]));
												if (group_names && group_names.content) {
													setKeyData(content, group_names.content, "alias");
												}
												return {
													type : 'table',
													content : content
												};
											}
										};
									},
									'activity_in_poly_types_per_round' : function(data) {
										var observation_id = data[0];
										var polygon_type_ids = data[1];
										var entity_states = data[2];
										var entity_types = data[3];
										var entity_flag_bits = data[4];
										var key_names;
										if (data[5])
											key_names = data[5];
										return {
											name : 'Distribution of activity in polygon types',
											proc : 'activity_in_poly_types_per_round',
											params : function(study) {
												return {
													observation_id : observation_id,
													polygon_type_ids : polygon_type_ids,
													entity_states : entity_states,
													entity_types : entity_types,
													entity_flag_bits : entity_flag_bits
												};
											},
											callback : function(response) {
												var content;
												if (response.data && response.data.length > 0)
													content = unpack(JSON.parse(response.data[0]));
												if (key_names && key_names.content) {
													setKeyData(content, key_names.content, "id");
												}
												return {
													type : 'table',
													content : content
												};
											}
										};
									},
									'construct_ranges' : function(data) {
										var cats = data[0].content;
										return {
											name : 'Construct Ranges',
											get : function() {
												return {
													then : function(success, error) {
														var result = cats.map(function(d) {
															if (!d)
																return;
															var catname = d.split(':');
															var startend;
															if (catname[0]) {
																if (catname[0].indexOf('+') != -1)
																	startend = [
																		parseFloat(catname[0].split('+')[0])
																	];
																else if (catname[0].indexOf('-') != -1)
																	startend = catname[0].split("-").map(
																			function(d) {
																				return parseFloat(d)
																			});
																else
																	startend = [
																			parseFloat(catname[0]),
																			parseFloat(catname[0])
																	];
															}
															var rr = {
																start : 0
															}
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
														}
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
											name : 'Get range array',
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
														}
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
											name : 'Get range array (flat)',
											get : function() {
												return {
													then : function(success, error) {
														var result = rr.map(function(d) {
															return d[property].replace('+', '%2B');
														});
														var response = {
															data : result
														}
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
											name : 'Label switch',
											get : function() {
												return {
													then : function(success, error) {
														var result = '';
														for (var i = 0; i < cats.length; i++) {
															if (cats[i] && cats[i].end && cats[i].name
																	&& din >= cats[i].start && din <= cats[i].end) {
																result = cats[i].name;
																break;
															} else if (cats[i] && !cats[i].end
																	&& cats[i].name && din >= cats[i].start) {
																result = cats[i].name;
																break;
															}
														}
														var response = {
															data : result
														}
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
											name : 'Division',
											get : function() {
												return {
													then : function(success, error) {
														if (status === 201) {
															success(data[0]);
															return;
														}
														var response = {};
														if (!numType && !denomType) {
															if (denom === 0) {
																response.type = 'error';
																response.status = 201;
																response.data = "Division by zero (" + num
																		+ " / " + denom + ")";
															} else
																response.data = num / denom;
														} else if (numType == 'table'
																&& denomType != 'table') {
															response.type = 'table';
															response.data = {};
															response.data.keyType = num.keyType;
															response.data.keys = num.keys;
															response.data.properties = num.properties
																	.map(function(d) {
																		return {
																			alias : d.alias + "_div_" + denom
																		}
																	});

															response.data.data = {};
															for (var i = 0; i < num.keys.length; i++) {
																var nobj = {};
																for (var j = 0; j < num.properties.length; j++)
																	nobj[response.data.properties[j].alias] = num.data[num.keys[i].alias][num.properties[j].alias]
																			/ denom;
																response.data.data[num.keys[i].alias] = nobj;
															}
														} else if (numType != 'table'
																&& denomType == 'table') {
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
															for (var i = 0; i < denom.keys.length; i++) {
																var nobj = {};
																// nobj[num.type] = num.keys[i];
																for (var j = 0; j < denom.properties.length; j++)
																	nobj[response.data.properties[j].alias] = num
																			/ denom.data[denom.keys[i].alias][denom.properties[j].alias];
																response.data.data[denom.keys[i].alias] = nobj;
															}
														} else if (numType == 'table'
																&& denomType == 'table'
																&& denom.keyType == num.keyType) {
															if (num.properties.length == 1
																	&& denom.properties.length == 1) {
																response.type = 'table';
																response.data = {};
																response.data.keyType = denom.keyType;
																response.data.properties = [
																	{
																		alias : num.properties[0].alias + "_div_"
																				+ denom.properties[0].alias
																	}
																];
																response.data.keys = [];
																response.data.data = {};
																for (var i = 0; i < denom.keys.length; i++) {
																	var key = denom.keys[i];
																	var found = false;
																	// if (num.keys.indexOf(key) == -1)

																	for (var j = 0; j < num.keys.length; j++) {
																		if (num.keys[j].alias == key.alias) {
																			found = true;
																			break;
																		}
																	}
																	if (!found)
																		continue;
																	response.data.keys.push(key);
																	var nobj = {};
																	// nobj[num.type] = num.keys[i];
																	// for (var j = 0; j <
																	// denom.properties.length; j++)
																	nobj[response.data.properties[0].alias] = num.data[key.alias][num.properties[0].alias]
																			/ denom.data[key.alias][denom.properties[0].alias];
																	response.data.data[key.alias] = nobj;
																}
																// response.data.data = [];
																// for (var i = 0; i < denom.data.length; i++) {
																// var nobj = {};
																// nobj[denom.type] = denom.data[i][denom.type];
																// // for (var j = 0; j <
																// // denom.properties.length; j++)
																// nobj[response.data.properties[0]] =
																// num.data[i][num.properties[0]]
																// / denom.data[i][denom.properties[0]];
																// response.data.data.push(nobj);
																// }
																// console.log(num);
																// console.log(denom);
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
										// var params = data.map(function(e) {
										// return e.content;
										// });
										var responseType = '';
										var properties = [];
										for (var k = 0; k < data.length; k++) {
											if (data[k].type === 'table') {
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
										var rangeIndex = -1;
										if (!responseType)
											for (var k = 0; k < data.length; k++) {
												if (data[k].type === 'ranges') {
													responseType = 'ranges';
													rangeIndex = k;
													break;
												}
											}
										return {
											name : 'Multiplication',
											get : function() {
												return {
													then : function(success, error) {
														var response = {};
														if (responseType === 'table'
																&& properties.length === 1) {
															response.data = {};
															response.type = responseType;
															response.data.data = {};
															response.data.keys = [];
															response.data.properties = properties;
															for (var k = 0; k < data.length; k++) {
																if (!('keyType' in response.data)
																		&& data[k].content.keyType) {
																	response.data.keyType = data[k].content.keyType;
																} else if (response.data.keyType !== data[k].keyType) {
																	// TODO: dont allow adding data of different
																	// types, throw exception
																	break;
																}
																for (var i = 0; i < data[k].content.keys.length; i++) {
																	var key = data[k].content.keys[i];
																	var found = false;
																	for (var j = 0; j < response.data.keys.length; j++) {
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
															for (var i = 0; i < response.data.keys.length; i++) {
																var key = response.data.keys[i];
																var nobj = 1;
																for (var k = 0; k < data.length; k++) {
																	if (data[k].type === 'table'
																			&& key.alias in data[k].content.data) {
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
															for (var i = 0; i < data.length; i++) {
																if (i === rangeIndex)
																	continue;
																if (!data[i].type)
																	for (var j = 0; j < response.data.length; j++) {
																		response.data[j].start *= data[i].content;
																		if (response.data[j].end)
																			response.data[j].end *= data[i].content;
																	}
															}
														} else {
															response.data = 1;
															for (var i = 0; i < data.length; i++) {
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
									// 'mult' : function(data) {
									// var params = data.map(function(e) {
									// return e.content;
									// });
									// return {
									// name : 'Multiplication',
									// get : function() {
									// return {
									// then : function(success, error) {
									// var result = 1;
									// for (var i = 0; i < params.length; i++) {
									// result *= params[i];
									// }
									// var response = {
									// data : result
									// }
									// success(response);
									// }
									// };
									// },
									// callback : function(response) {
									// return {
									// content : response.data
									// };
									// }
									// };
									// },
									'add' : function(data) {
										// var params = data.map(function(e) {
										// return e.content;
										// });
										var responseType = '';
										var properties = [];
										for (var k = 0; k < data.length; k++) {
											if (data[k].type === 'table') {
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
										return {
											name : 'Addition',
											get : function() {
												return {
													then : function(success, error) {
														var response = {};
														if (responseType === 'table'
																&& properties.length === 1) {
															response.data = {};
															response.type = responseType;
															response.data.data = {};
															response.data.keys = [];
															response.data.properties = properties;
															for (var k = 0; k < data.length; k++) {
																if (!('keyType' in response.data)
																		&& 'keyType' in data[k].content) {
																	response.data.keyType = data[k].content.keyType;
																} else if (response.data.keyType !== data[k].content.keyType) {
																	// TODO: dont allow adding data of different
																	// types, throw exception
																	break;
																}
																for (var i = 0; i < data[k].content.keys.length; i++) {
																	var key = data[k].content.keys[i];
																	var found = false;
																	for (var j = 0; j < response.data.keys.length; j++) {
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
															for (var i = 0; i < response.data.keys.length; i++) {
																var key = response.data.keys[i];
																var nobj = 0;
																for (var k = 0; k < data.length; k++) {
																	if (data[k].type === 'table'
																			&& key.alias in data[k].content.data) {
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
															for (var i = 0; i < data.length; i++) {
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
										// var params = data.map(function(e) {
										// return e.content;
										// });
										var responseType = '';
										var properties = [];
										for (var k = 0; k < data.length; k++) {
											if (data[k].type === 'table') {
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
										return {
											name : 'Subtraction',
											get : function() {
												return {
													then : function(success, error) {
														var response = {};
														if (responseType === 'table'
																&& properties.length === 1) {
															response.data = {};
															response.type = responseType;
															response.data.data = {};
															response.data.keys = [];
															response.data.properties = properties;
															for (var k = 0; k < data.length; k++) {
																if (!('keyType' in response.data)) {
																	response.data.keyType = data[k].content.keyType;
																} else if (response.data.keyType !== data[k].keyType) {
																	// TODO: dont allow adding data of different
																	// types, throw exception
																	break;
																}
																for (var i = 0; i < data[k].content.keys.length; i++) {
																	var key = data[k].content.keys[i];
																	var found = false;
																	for (var j = 0; j < response.data.keys.length; j++) {
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
															for (var i = 0; i < response.data.keys.length; i++) {
																var key = response.data.keys[i];
																var nobj = 0;
																for (var k = 0; k < data.length; k++) {
																	if (data[k].type === 'table'
																			&& key.alias in data[k].content.data) {
																		var prop = data[k].content.properties[0];
																		if (k == 0)
																			nobj = data[k].content.data[key.alias][prop.alias];
																		else
																			nobj -= data[k].content.data[key.alias][prop.alias];
																	} else {
																		if (k == 0)
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
															for (var i = 1; i < data.length; i++) {
																response.data -= data[i].content;
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
									// 'sub' : function(data) {
									// var params = data.map(function(e) {
									// return e.content;
									// });
									// return {
									// name : 'Subtraction',
									// get : function() {
									// return {
									// then : function(success, error) {
									// var result = 0;
									// for (var i = 0; i < params.length; i++) {
									// if (i == 0)
									// result += params[i];
									// else
									// result -= params[i];
									// }
									// var response = {
									// data : result
									// }
									// success(response);
									// }
									// };
									// },
									// callback : function(response) {
									// return {
									// content : response.data
									// };
									// }
									// };
									// },
									'prc' : function(data) {
										var param1 = data[0].content;
										return {
											name : 'Percent',
											get : function() {
												return {
													then : function(success, error) {
														var response = {
															data : param1 * 100
														}
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
											name : 'Percent',
											get : function() {
												return {
													then : function(success, error) {
														if (status === 201) {
															success(data[0]);
															return;
														}
														var keys = param1.keys;
														var prop = param1.properties;
														var propTotals = {};
														for (var k = 0; k < prop.length; k++) {
															propTotals[prop[k].alias] = 0;
														}
														for (var j = 0; j < keys.length; j++) {
															for (var k = 0; k < prop.length; k++) {
																if (param1.data[keys[j].alias][prop[k].alias])
																	propTotals[prop[k].alias] += param1.data[keys[j].alias][prop[k].alias];
															}
														}
														var newData = {};
														for (var j = 0; j < keys.length; j++) {
															var dt = {};
															for (var k = 0; k < prop.length; k++) {
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
														}
														// console.log(result);
														var response = {
															data : result
														}
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
									'table_sum' : function(data) {
										var table = data[0].content;
										var property;
										if (data[1])
											property = data[1].content;
										return {
											name : 'Get average value(s)',
											get : function() {
												return {
													then : function(success, error) {
														if (status === 201) {
															success(data[0]);
															return;
														}
														var response = {
															data : {}
														}
														response.data.properties = angular
																.copy(table.properties);
														response.data.keyType = table.keyType;
														var comparePropIndex = 0;
														if (property)
															for (var i = 0; i < table.properties.length; i++) {
																if (table.properties[i].alias === property) {
																	comparePropIndex = i;
																	break;
																}
															}
														var sumVal = 0;
														for (var i = 0; i < table.keys.length; i++) {
															sumVal += table.data[table.keys[i].alias][table.properties[comparePropIndex].alias];

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
														response.data.data['sum'][table.properties[comparePropIndex].alias] = sumVal;
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
									'table_avg' : function(data) {
										var table = data[0].content;
										var property;
										if (data[1])
											property = data[1].content;
										return {
											name : 'Get average value(s)',
											get : function() {
												return {
													then : function(success, error) {
														if (status === 201) {
															success(data[0]);
															return;
														}
														var response = {
															data : {}
														}
														response.data.properties = angular
																.copy(table.properties);
														response.data.keyType = table.keyType;
														var comparePropIndex = 0;
														if (property)
															for (var i = 0; i < table.properties.length; i++) {
																if (table.properties[i].alias === property) {
																	comparePropIndex = i;
																	break;
																}
															}
														var avgVal = 0;
														for (var i = 0; i < table.keys.length; i++) {
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
														response.data.data['avg'][table.properties[comparePropIndex].alias] = avgVal;
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
											name : 'Get maximum value(s)',
											get : function() {
												return {
													then : function(success, error) {
														if (status === 201) {
															success(data[0]);
															return;
														}
														var response = {
															data : {}
														}
														response.data.properties = angular
																.copy(table.properties);
														response.data.keyType = table.keyType;
														var comparePropIndex = 0;
														if (property)
															for (var i = 0; i < table.properties.length; i++) {
																if (table.properties[i].alias === property) {
																	comparePropIndex = i;
																	break;
																}
															}
														var maxKeys = [
															table.keys[0]
														];
														var maxVal = table.data[table.keys[0].alias][table.properties[comparePropIndex].alias];
														for (var i = 0; i < table.keys.length; i++) {
															var newVal = table.data[table.keys[i].alias][table.properties[comparePropIndex].alias];
															if (newVal > maxVal) {
																maxVal = newVal;
																maxKeys = [
																	table.keys[i]
																];
																continue;
															}
															var found = false;
															for (var j = 0; j < maxKeys.length; j++)
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
														for (var i = 0; i < maxKeys.length; i++)
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
											name : 'Get minumum value(s)',
											get : function() {
												return {
													then : function(success, error) {
														if (status === 201) {
															success(data[0]);
															return;
														}
														var response = {
															data : {}
														}
														response.data.properties = angular
																.copy(table.properties);
														response.data.keyType = table.keyType;
														var comparePropIndex = 0;
														if (property)
															for (var i = 0; i < table.properties.length; i++) {
																if (table.properties[i].alias === property) {
																	comparePropIndex = i;
																	break;
																}
															}
														var minKeys = [
															table.keys[0]
														];
														var minVal = table.data[table.keys[0].alias][table.properties[comparePropIndex].alias];
														for (var i = 0; i < table.keys.length; i++) {
															var newVal = table.data[table.keys[i].alias][table.properties[comparePropIndex].alias];
															if (newVal < minVal) {
																minVal = newVal;
																minKeys = [
																	table.keys[i]
																];
																continue;
															}
															var found = false;
															for (var j = 0; j < minKeys.length; j++)
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
														for (var i = 0; i < minKeys.length; i++)
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
							}
							// var reKey = function(data, keyIn, keyOut) {
							// return data.map(function(d) {
							// d[keyOut] = d[keyIn];
							// delete d[keyIn];
							// return d;
							// });
							// }

							var setPropertyData = function(unpacked, data, dataMatchKey) {
								for (var i = 0; i < unpacked.properties.length; i++) {
									var matchKey = unpacked.properties[i].matchKey;
									if (!dataMatchKey)
										dataMatchKey = matchKey;
									for (var j = 0; j < data.length; j++) {
										if (dataMatchKey in data[j]
												&& unpacked.properties[i][matchKey] == data[j][dataMatchKey]) {
											var keys = Object.keys(data[j]);
											for (var k = 0; k < keys.length; k++) {
												if (keys[k] != dataMatchKey)
													unpacked.properties[i][keys[k]] = data[j][keys[k]];
											}
											break;
										}
									}
								}
							}
							var setKeyData = function(unpacked, data, dataMatchKey) {
								for (var i = 0; i < unpacked.keys.length; i++) {
									var matchKey = unpacked.keys[i].matchKey;
									if (!dataMatchKey)
										dataMatchKey = matchKey;
									for (var j = 0; j < data.length; j++) {
										if (dataMatchKey in data[j]
												&& unpacked.keys[i][matchKey] == data[j][dataMatchKey]) {
											var keys = Object.keys(data[j]);
											for (var k = 0; k < keys.length; k++) {
												if (keys[k] != dataMatchKey)
													unpacked.keys[i][keys[k]] = data[j][keys[k]];
											}
											break;
										}
									}
								}
							}
							var unpack = function(packed, mega) {
								var result = {};
								var keys = Object.keys(packed[0]);
								if (mega) {
									var unpacked = [];
									for (var i = 0; i < packed.length; i++) {
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
									for (var i = 0; i < unpacked.length; i++) {
										var o = unpacked[i];
										for (var j = 0; j < o.keys.length; j++) {
											// if (result.keys.indexOf(o.keys[j]) == -1)

											var found = false;
											// if (num.keys.indexOf(key) == -1)

											for (var k = 0; k < result.keys.length; k++) {
												if (result.keys[k].alias == o.keys[j].alias) {
													found = true;
													break;
												}
											}
											if (found)
												continue;
											result.keys.push(o.keys[j]);
										}
										for (var j = 0; j < o.properties.length; j++)
											if (uniqueProperties.indexOf(o.properties[j].alias) == -1)
												uniqueProperties.push(o.properties[j].alias);
									}
									if (uniqueProperties.length == 1) {
										result.keyType = uniqueProperties[0];
									}
									for (var i = 0; i < unpacked.length; i++) {
										var o = unpacked[i];
										// console.log(o);
										for (var j = 0; j < o.properties.length; j++) {
											var newProp = o.properties[j].alias + "_" + o.matchKey
													+ "_" + o[o.matchKey];
											var np = {
												alias : newProp
											};
											np.matchKey = o.matchKey;
											np[o.matchKey] = o[o.matchKey];
											result.properties.push(np);
											for (var k = 0; k < o.keys.length; k++) {
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
									for (var i = 0; i < packed.length; i++) {
										var packelm = packed[i];
										var unpackedVal = {};

										var resultKey = {
											matchKey : result.keyType,
											alias : packelm[result.keyType]
										};
										resultKey[result.keyType] = packelm[result.keyType];
										if (packelm.sortby || packelm.sortby === 0)
											resultKey.sortby = packelm.sortby;
										result.keys.push(resultKey);

										angular.forEach(packelm, function(val, key) {
											// if (p != d[result.keyType])
											if (key !== result.keyType && key !== 'sortby')
												unpackedVal[key] = val;
										});
										var res = {};
										result.data[packelm[result.keyType]] = unpackedVal;
									}
								}
								// result.data = packed.map(function(d) {
								// var ps = [];
								// angular.forEach(d, function(p) {
								// if (p != d[result.type])
								// ps.push(p);
								// });
								// var res = {};
								// res[d[result.type]] = ps;
								// return res;
								// });

								// for (var i = 0; i < packed.length; i++) {
								// var d = packed[i];
								// var ps = [];
								// angular.forEach(d, function(p) {
								// if (p != d[result.type])
								// ps.push(p);
								// });
								// var res = {};
								// result.data[d[result.type]] = ps;
								// }

								return result;
							}

							var fetchA = function(measure) {
								var deferred = $q.defer();
								var getter;
								if (measure.proc) {
									var paramString = "";
									var params = measure.params();
									if (params) {
										angular.forEach(params, function(value, key) {
											// console.log(measure.name, value, key);
											paramString += "&";
											if (value.content && typeof value.content === 'string')
												paramString += key + "=" + value.content;
											else if (value.content && value.content.length)
												paramString += key + "=[" + value.content + "]";
											else
												paramString += key + "=" + value.content;
										});
									}
									getter = HTTPFactory.backendGet('Occupancy?t=' + measure.proc
											+ paramString);
								} else
									getter = measure.get();
								getter.then(function(response) {
									if (response.status === 201) {
										// var body = response.data;
										// // body.
										deferred.resolve({
											name : measure.name,
											content : response.data[0].error,
											status : 201,
											type : 'error'
										});
									} else
										deferred.resolve(measure.callback(response));
								}, function(error) {
									// console.log(error);
								});
								return deferred.promise;
							}
							var createMeasure = function(funcName) {
								var promises = [];
								for (var i = 1; i < arguments.length; i++) {
									if (arguments[i].promise)
										promises.push(arguments[i].promise);
									else {
										var arg = arguments[i];
										promises.push($q.when(arg));
									}
								}
								var result = {
									funcName : funcName,
									promises : promises
								}
								return result;
							}
							var resolveMeasure = function(measure) {
								if (measure.solveObj)
									return measure.solveObj;
								var promiseOut = $q.defer();
								measure.solveObj = promiseOut.promise;
								var solveObj = $q.all(measure.promises);
								solveObj.then(function(result) {
									var internalPromises = [];
									for (var i = 0; i < result.length; i++) {
										if (result[i].promises) {
											internalPromises.push(resolveMeasure(result[i]));
										} else
											internalPromises.push($q.when(result[i]));
									}
									$q.all(internalPromises).then(
											function(solvedMeasures) {
												for (var i = 0; i < solvedMeasures.length; i++) {
													if (solvedMeasures[i].status === 201) {
														var result = angular.copy(solvedMeasures[i]);
														result.request = measure;
														// result.content += ' (error getting \"'
														// + solvedMeasures[i].name + '\")';
														promiseOut.resolve(result);
														return;
													}
												}
												var mes = knownFunctions()[measure.funcName]
														(solvedMeasures);
												fetchA(mes).then(function(result) {
													result.request = measure;
													promiseOut.resolve(result);
												});
											});
								});
								return promiseOut.promise;
							}
							// var lal = createMeasure('first_observation_id', {
							// content : 39
							// });
							// resolveMeasure(lal).then(function(result) {
							// console.log(result);
							// });
							//
							// var nel = createMeasure('no_of_desks_in_poly_types', lal,
							// createMeasure('id_of_poly_types', {
							// content : 'func'
							// }, {
							// content : 'WRKSP-CEL'
							// }));
							//
							// resolveMeasure(nel).then(function(result) {
							// console.log(result);
							// });
							var newMeasures = function(study) {
								var that = this;
								var measures = {
									'project_name' : function() {
										return {
											name : "Project Name",
											measure : createMeasure('project_name', {
												content : study.id
											})
										}
									},
									// BMARK first_observation_id : First observation ID
									'first_observation_id' : function() {
										return {
											name : 'First observation ID',
											measure : createMeasure('first_observation_id', {
												content : study.id
											})
										}
									},
									// BMARK no_of_desks_per_building : Number of desks per
									// building
									'no_of_desks_per_building' : function() {
										return {
											name : 'Number of desks per building',
											measure : createMeasure('no_of_desks_per_building',
													measures['first_observation_id']().measure)

										}
									},
									// BMARK ids_of_team_polygons : Id of poly types
									'ids_of_team_polygons' : function() {
										return {
											name : 'Id of poly types',
											measure : createMeasure('id_of_poly_types', {
												content : 'team'
											}, {
												content : ''
											})
										}
									},
									// BMARK no_of_desks_per_team : Number of desks per team
									'no_of_desks_per_team' : function() {
										return {
											name : 'Number of desks per team',
											measure : createMeasure('no_of_desks_per_polygon_type',
													measures['first_observation_id']().measure,
													measures['ids_of_team_polygons']().measure,
													measures['names_of_teams_polygons']().measure)
										}
									},
									// BMARK nia_per_team : Area per team
									'nia_per_team' : function() {
										return {
											name : 'NIA per team',
											measure : createMeasure('nia_per_poly_type', {
												content : study.id
											}, createMeasure('id_of_poly_types', {
												content : 'team'
											}, {
												content : ''
											}))
										}
									},
									// BMARK nia_per_alternative_space_type : Area per alternative
									// space type
									'nia_per_alternative_space_type' : function() {
										return {
											name : 'Area per alternative space type',
											measure : createMeasure('nia_per_poly_type', {
												content : study.id
											}, createMeasure('id_of_poly_types', {
												content : 'func'
											}, {
												content : 'ALT-'
											})),
										}
									},
									// BMARK nia_per_desk_per_team : NIA per desk per team
									'nia_per_desk_per_team' : function() {
										return {
											name : 'Workspace NIA per desk per team',
											measure : createMeasure('div',
													measures['nia_per_team']().measure,
													measures['no_of_desks_per_team']().measure)
										}
									},
									// BMARK team_with_max_nia_per_desk : Team with maximum NIA
									// per desk
									'team_with_max_nia_per_desk' : function() {
										return {
											name : 'Team with maximum NIA per desk',
											measure : createMeasure('table_max',
													measures['nia_per_desk_per_team']().measure)
										}
									},
									// BMARK team_with_min_nia_per_desk : Team with minimum NIA
									// per desk
									'team_with_min_nia_per_desk' : function() {
										return {
											name : 'Team with minimum NIA per desk',
											measure : createMeasure('table_min',
													measures['nia_per_desk_per_team']().measure)
										}
									},
									// BMARK nia_alt_spaces_per_building : NIA of alternative
									// spaces per building
									'nia_alt_spaces_per_building' : function() {
										return {
											name : 'NIA of alternative spaces per building',
											measure : createMeasure('nia_of_poly_types_per_building',
													createMeasure('id_of_poly_types', {
														content : 'func'
													}, {
														content : 'ALT'
													}), {
														content : study.id
													})
										}
									},
									// BMARK nia_other_facilities_per_building : NIA of other
									// facilities per building
									'nia_other_facilities_per_building' : function() {
										return {
											name : 'NIA of other facilities per building',
											measure : createMeasure('nia_of_poly_types_per_building',
													createMeasure('id_of_poly_types', {
														content : 'func'
													}, {
														content : 'OTHFCL'
													}), {
														content : study.id
													})
										}
									},
									// BMARK nia_shared_facilities_per_building : NIA of shared
									// facilities per building
									'nia_shared_facilities_per_building' : function() {
										return {
											name : 'NIA of shared facilities per building',
											measure : createMeasure(
													'add',
													measures['nia_meeting_rooms_per_building']().measure,
													measures['nia_alt_spaces_per_building']().measure,
													measures['nia_other_facilities_per_building']().measure)
										}
									},
									'nia_shared_facilities_to_total_per_building' : function() {
										return {
											name : 'Shared Facilities as a % NIA of building',
											measure : createMeasure(
													'div',
													measures['nia_shared_facilities_per_building']().measure,
													measures['nia_total_per_building']().measure)
										}
									},
									// BMARK nia_alt_spaces_per_space : NIA of alternative spaces
									// per building
									'nia_alt_spaces_per_space' : function() {
										return {
											name : 'NIA of alternative spaces per space',
											measure : createMeasure('nia_of_poly_types_per_space',
													createMeasure('id_of_poly_types', {
														content : 'func'
													}, {
														content : 'ALT'
													}), {
														content : study.id
													})
										}
									},
									// BMARK nia_other_facilities_per_space : NIA of other
									// facilities per building
									'nia_other_facilities_per_space' : function() {
										return {
											name : 'NIA of other facilities per building',
											measure : createMeasure('nia_of_poly_types_per_space',
													createMeasure('id_of_poly_types', {
														content : 'func'
													}, {
														content : 'OTHFCL'
													}), {
														content : study.id
													})
										}
									},
									// BMARK nia_shared_facilities_per_space : NIA of shared
									// facilities per building
									'nia_shared_facilities_per_space' : function() {
										return {
											name : 'NIA of shared facilities per space',
											measure : createMeasure('add',
													measures['nia_meeting_rooms_per_space']().measure,
													measures['nia_alt_spaces_per_space']().measure,
													measures['nia_other_facilities_per_space']().measure)
										}
									},
									// BMARK nia_shared_facilities_to_total_per_space : Shared
									// Facilities as a % NIA of space
									'nia_shared_facilities_to_total_per_space' : function() {
										return {
											name : 'Shared Facilities as a % NIA of space',
											measure : createMeasure(
													'div',
													measures['nia_shared_facilities_per_space']().measure,
													measures['nia_total_per_space']().measure)
										}
									},
									// BMARK nia_wrksp_cel_per_building : NIA of Cellular
									// workspace per building
									'nia_wrksp_cel_per_building' : function() {
										return {
											name : 'NIA of Cellular workspace per building',
											measure : createMeasure('nia_of_poly_types_per_building',
													createMeasure('id_of_poly_types', {
														content : 'func'
													}, {
														content : 'WRKSP-CEL'
													}), {
														content : study.id
													})
										}
									},
									// BMARK nia_wrksp_opn_per_building : NIA of Open workspace
									// per building
									'nia_wrksp_opn_per_building' : function() {
										return {
											name : 'NIA of Open workspace per building',
											measure : createMeasure('nia_of_poly_types_per_building',
													createMeasure('id_of_poly_types', {
														content : 'func'
													}, {
														content : 'WRKSP-OPN'
													}), {
														content : study.id
													})
										}
									},
									// BMARK nia_wrksp_per_building : NIA of workspace per
									// building
									'nia_wrksp_per_building' : function() {
										return {
											name : 'NIA of workspace per building',
											measure : createMeasure('nia_of_poly_types_per_building',
													createMeasure('id_of_poly_types', {
														content : 'func'
													}, {
														content : 'WRKSP'
													}), {
														content : study.id
													})
										}
									},
									// BMARK nia_wrksp_to_total_per_building : Workspace as a %
									// NIA of building
									'nia_wrksp_to_total_per_building' : function() {
										return {
											name : 'Workspace as a % NIA of building',
											measure : createMeasure('div',
													measures['nia_wrksp_per_building']().measure,
													measures['nia_total_per_building']().measure)
										}
									},
									// BMARK nia_prim_circ_per_building : NIA of primary
									// circulation per building
									'nia_prim_circ_per_building' : function() {
										return {
											name : 'NIA of primary circulation per building',
											measure : createMeasure('nia_of_poly_types_per_building',
													createMeasure('id_of_poly_types', {
														content : 'func'
													}, {
														content : 'CIRC-PRI'
													}), {
														content : study.id
													})
										}
									},
									// BMARK nia_prim_circ_to_total_per_building : Primary
									// Circulation as a % NIA of building
									'nia_prim_circ_to_total_per_building' : function() {
										return {
											name : 'Primary Circulation as a % NIA of building',
											measure : createMeasure('div',
													measures['nia_prim_circ_per_building']().measure,
													measures['nia_total_per_building']().measure)
										}
									},
									// BMARK nia_prim_circ_per_space : NIA of primary circulation
									// per space
									'nia_prim_circ_per_space' : function() {
										return {
											name : 'NIA of primary circulation per space',
											measure : createMeasure('nia_of_poly_types_per_space',
													createMeasure('id_of_poly_types', {
														content : 'func'
													}, {
														content : 'CIRC-PRI'
													}), {
														content : study.id
													})
										}
									},
									// BMARK nia_prim_circ_to_total_per_space : Primary
									// Circulation as a % NIA of space
									'nia_prim_circ_to_total_per_space' : function() {
										return {
											name : 'Primary Circulation as a % NIA of space',
											measure : createMeasure('div',
													measures['nia_prim_circ_per_space']().measure,
													measures['nia_total_per_space']().measure)
										}
									},
									// BMARK no_of_desks_per_space : Number of desks per space
									'no_of_desks_per_space' : function() {
										return {
											name : 'Number of desks per space',
											measure : createMeasure('no_of_desks_per_space',
													measures['first_observation_id']().measure)

										}
									},
									// BMARK nia_wrksp_per_space : NIA of workspace per space
									'nia_wrksp_per_space' : function() {
										return {
											name : 'NIA of workspace per space',
											measure : createMeasure('nia_of_poly_types_per_space',
													createMeasure('id_of_poly_types', {
														content : 'func'
													}, {
														content : 'WRKSP'
													}), {
														content : study.id
													})
										}
									},
									// BMARK nia_wrksp_to_total_per_space : Workspace as a % NIA
									// of space
									'nia_wrksp_to_total_per_space' : function() {
										return {
											name : 'Workspace as a % NIA of space',
											measure : createMeasure('div',
													measures['nia_wrksp_per_space']().measure,
													measures['nia_total_per_space']().measure)
										}
									},
									// BMARK no_of_desks_per_building_div_2 : Number of desks per
									// building div 2
									'no_of_desks_per_building_div_2' : function() {
										return {
											name : 'Number of desks per building div 2',
											measure : createMeasure('div', createMeasure(
													'no_of_desks_per_building',
													measures['first_observation_id']().measure), {
												content : 2
											})
										}
									},
									// BMARK 2_no_of_desks_per_building_div : Number of desks per
									// building div 2
									'2_no_of_desks_per_building_div' : function() {
										return {
											name : 'Number of desks per building div 2',
											measure : createMeasure('div', {
												content : 2
											}, createMeasure('no_of_desks_per_building',
													measures['first_observation_id']().measure))
										}
									},
									// BMARK nia_wrksp_per_desk_per_building : Workspace per desk
									// per building
									'nia_wrksp_per_desk_per_building' : function() {
										return {
											name : 'Workspace per desk per building',
											measure : createMeasure('div',
													measures['nia_wrksp_per_building']().measure,
													measures['no_of_desks_per_building']().measure)
										}
									},
									// BMARK nia_wrksp_per_person_per_building : Workspace per
									// staff member per building
									'nia_wrksp_per_person_per_building' : function() {
										return {
											name : 'Workspace per staff member per building',
											measure : createMeasure('div',
													measures['nia_wrksp_per_building']().measure,
													measures['no_of_staff_per_building']().measure)
										}
									},
									// BMARK nia_wrksp_per_desk_per_space : Workspace per desk per
									// floor
									'nia_wrksp_per_desk_per_space' : function() {
										return {
											name : 'Workspace per desk per floor',
											measure : createMeasure('div',
													measures['nia_wrksp_per_space']().measure,
													measures['no_of_desks_per_space']().measure)
										}
									},

									'desk_occupancy_total' : function() {
										return {
											name : 'Average desk occupancy (all desks)',
											measure : createMeasure('gross_occupancy',
													measures['first_observation_id']().measure)

										}
									},
									// BMARK avg_desk_occupancy_total_prc : Average desk occupancy
									// (all desks)
									'avg_desk_occupancy_total_prc' : function() {
										return {
											name : 'Average desk occupancy (all desks)',
											no_of_decimals : 0,
											measure : createMeasure('prc', createMeasure('div',
													measures['desk_occupancy_total']().measure,
													createMeasure('mult',
															measures['no_of_desks']().measure,
															measures['no_of_rounds']().measure)))
										}
									},
									// BMARK max_desk_occupancy : Maximum desk occupancy (all
									// desks)
									'max_desk_occupancy' : function() {
										return {
											name : 'Maximum desk occupancy (all desks)',
											measure : createMeasure('max_desk_occupancy',
													measures['first_observation_id']().measure)
										}
									},
									// BMARK max_desk_occupancy_prc : Maximum desk occupancy (all
									// desks)
									'max_desk_occupancy_prc' : function() {
										return {
											name : 'Maximum desk occupancy (all desks)',
											no_of_decimals : 0,
											measure : createMeasure('prc', createMeasure('div',
													measures['max_desk_occupancy']().measure,
													measures['no_of_desks']().measure))
										}
									},
									// BMARK max_desk_occupancy_not_empty_prc : Maximum desk
									// occupancy (excluding empty)
									'max_desk_occupancy_not_empty_prc' : function() {
										return {
											name : 'Maximum desk occupancy (excluding empty)',
											no_of_decimals : 0,
											measure : createMeasure('prc', createMeasure('div',
													measures['max_desk_occupancy']().measure,
													measures['no_of_desks_not_empty']().measure))
										}
									},
									// BMARK nia_per_desk_at_max_occupancy : NIA per desk at max
									// occupancy
									'nia_per_desk_at_max_occupancy' : function() {
										return {
											name : 'NIA per desk at max occupancy',
											measure : createMeasure('prc', createMeasure('div',
													measures['nia_total']().measure,
													measures['max_desk_occupancy']().measure))
										}
									},
									// BMARK nia_per_desk_at_max_occupancy : NIA per desk at max
									// occupancy
									'nia_per_head_at_max_occupancy' : function() {
										return {
											name : 'NIA per head at max occupancy',
											measure : createMeasure('prc', createMeasure('div',
													measures['nia_total']().measure,
													measures['max_desk_occupancy']().measure))
										}
									},
									// BMARK min_desk_occupancy : Minimum desk occupancy (all
									// desks)
									'min_desk_occupancy' : function() {
										return {
											name : 'Minimum desk occupancy (all desks)',
											no_of_decimals : 2,
											measure : createMeasure('min_desk_occupancy',
													measures['first_observation_id']().measure)
										}
									},
									// BMARK min_desk_occupancy_prc : Minimum desk occupancy (all
									// desks)
									'min_desk_occupancy_prc' : function() {
										return {
											name : 'Minimum desk occupancy (all desks)',
											no_of_decimals : 2,
											measure : createMeasure('prc', createMeasure('div',
													measures['min_desk_occupancy']().measure,
													measures['no_of_desks']().measure))
										}
									},
									// BMARK min_desk_occupancy_not_empty_prc : Minimum desk
									// occupancy (excluding empty)
									'min_desk_occupancy_not_empty_prc' : function() {
										return {
											name : 'Minimum desk occupancy (excluding empty)',
											no_of_decimals : 2,
											measure : createMeasure('prc', createMeasure('div',
													measures['min_desk_occupancy']().measure,
													measures['no_of_desks_not_empty']().measure))
										}
									},
									// BMARK no_of_buildings : Number of buildings
									'no_of_buildings' : function() {
										return {
											name : 'Number of buildings',
											measure : createMeasure('no_of_buildings', {
												content : study.id
											})
										}
									},
									// BMARK no_of_desks : Number of desks
									'no_of_desks' : function() {
										return {
											name : 'Number of desks',
											measure : createMeasure('no_of_desks',
													measures['first_observation_id']().measure)
										}
									},
									// BMARK no_of_staff : Number of staff
									'no_of_staff' : function() {
										return {
											name : 'Number of staff',
											description : 'Number of people in the staff survey',
											measure : createMeasure('no_of_staff', {
												content : study.id
											})
										}
									},
									// BMARK no_of_staff_per_building : Number of staff per
									// building
									'no_of_staff_per_building' : function() {
										return {
											name : 'Number of staff per building',
											measure : createMeasure('no_of_staff_per_building', {
												content : study.id
											})
										}
									},
									// BMARK no_of_rounds : Number of Rounds
									'no_of_rounds' : function() {
										return {
											name : 'Number of Rounds',
											measure : createMeasure('no_of_rounds',
													measures['first_observation_id']().measure)
										}
									},
									// BMARK no_of_desks_not_empty : Number of non-empty desks
									'no_of_desks_not_empty' : function() {
										return {
											name : 'Number of non-empty desks',
											measure : createMeasure('no_of_desks_not_empty',
													measures['first_observation_id']().measure)
										}
									},
									// BMARK no_of_meeting_rooms : Number of Meeting Rooms
									'no_of_meeting_rooms' : function() {
										return {
											name : 'Number of Meeting Rooms',
											measure : createMeasure('no_of_polys_in_poly_types', {
												content : study.id
											}, createMeasure('id_of_poly_types', {
												content : 'func'
											}, {
												content : 'MTG-BKB'
											}))
										}
									},
									// BMARK no_of_tea_points : Number of Tea Points
									'no_of_tea_points' : function() {
										return {
											name : 'Number of Tea Points',
											measure : createMeasure('no_of_polys_in_poly_types', {
												content : study.id
											}, createMeasure('id_of_poly_types', {
												content : 'func'
											}, {
												content : 'OTHFCL-TEA'
											}))
										}
									},
									// BMARK ids_of_alternative_space_types : Number of
									// Alternative Spaces
									'ids_of_alternative_space_types' : function() {
										return {
											measure : createMeasure('id_of_poly_types', {
												content : 'func'
											}, {
												content : 'ALT'
											})
										}
									},
									// BMARK no_of_alternative_spaces : Number of Alternative
									// Spaces
									'no_of_alternative_spaces' : function() {
										return {
											name : 'Number of Alternative Spaces',
											measure : createMeasure('no_of_polys_in_poly_types', {
												content : study.id
											}, measures['ids_of_alternative_space_types']().measure)
										}
									},
									// BMARK no_of_desks_cellular : No of Desks in Cellular
									// Workspace
									'no_of_desks_cellular' : function() {
										return {
											name : 'No of Desks in Cellular Workspace',
											measure : createMeasure('no_of_desks_in_poly_types',
													measures['first_observation_id']().measure,
													createMeasure('id_of_poly_types', {
														content : 'func'
													}, {
														content : 'WRKSP-CEL'
													}))
										}
									},
									// BMARK no_of_desks_cellular_per_building : No of Desks in
									// Cellular Workspace per building
									'no_of_desks_cellular_per_building' : function() {
										return {
											name : 'No of Desks in Cellular Workspace per building',
											measure : createMeasure(
													'no_of_desks_in_poly_types_per_building',
													measures['first_observation_id']().measure,
													createMeasure('id_of_poly_types', {
														content : 'func'
													}, {
														content : 'WRKSP-CEL'
													}))
										}
									},
									// BMARK no_of_desks_open_plan : No of Desks in Open Workspace
									'no_of_desks_open_plan' : function() {
										return {
											name : 'No of Desks in Open Workspace',
											measure : createMeasure('no_of_desks_in_poly_types',
													measures['first_observation_id']().measure,
													createMeasure('id_of_poly_types', {
														content : 'func'
													}, {
														content : 'WRKSP-OPN'
													}))
										}
									},
									// BMARK no_of_desks_open_plan_per_building : No of Desks in
									// Open Workspace per building
									'no_of_desks_open_plan_per_building' : function() {
										return {
											name : 'No of Desks in Open Workspace per building',
											measure : createMeasure(
													'no_of_desks_in_poly_types_per_building',
													measures['first_observation_id']().measure,
													createMeasure('id_of_poly_types', {
														content : 'func'
													}, {
														content : 'WRKSP-OPN'
													}))
										}
									},
									// BMARK desk_occupancy_wrksp_open : Desk occupancy of desks
									// in Open Workspace
									'desk_occupancy_wrksp_open' : function() {
										return {
											name : 'Desk occupancy of desks in Open Workspace',
											measure : createMeasure('activity_in_polygon_types',
													measures['first_observation_id']().measure,
													createMeasure('id_of_poly_types', {
														content : 'func'
													}, {
														content : 'WRKSP-OPN'
													}), {
														content : [
															1
														]
													}, {
														content : [
															1
														]
													}, {
														content : [
																0, 1
														]
													})
										}
									},
									// BMARK desk_occupancy_wrksp_open_prc : Desk occupancy of
									// desks in Open Workspace
									'desk_occupancy_wrksp_open_prc' : function() {
										return {
											name : 'Desk occupancy of desks in Open Workspace',
											measure : createMeasure('prc', createMeasure('div',
													measures['desk_occupancy_wrksp_open']().measure,
													createMeasure('mult',
															measures['no_of_desks_open_plan']().measure,
															measures['no_of_rounds']().measure)))
										}
									},
									// BMARK desk_occupancy_wrksp_cell : Desk occupancy of desks
									// in Cellular Workspace
									'desk_occupancy_wrksp_cell' : function() {
										return {
											name : 'Desk occupancy of desks in Cellular Workspace',
											measure : createMeasure('activity_in_polygon_types',
													measures['first_observation_id']().measure,
													createMeasure('id_of_poly_types', {
														content : 'func'
													}, {
														content : 'WRKSP-CEL'
													}), {
														content : [
															1
														]
													}, {
														content : [
															1
														]
													}, {
														content : [
																0, 1
														]
													})
										}
									},
									// BMARK desk_occupancy_wrksp_cell_prc : Desk occupancy of
									// desks in Cellular Workspace
									'desk_occupancy_wrksp_cell_prc' : function() {
										return {
											name : 'Desk occupancy of desks in Cellular Workspace',
											measure : createMeasure('prc', createMeasure('div',
													measures['desk_occupancy_wrksp_cell']().measure,
													createMeasure('mult',
															measures['no_of_desks_cellular']().measure,
															measures['no_of_rounds']().measure)))
										}
									},
									// BMARK nia_prim_circ : NIA of Primary Circulation
									'nia_prim_circ' : function() {
										return {
											name : 'NIA of Primary Circulation',
											measure : createMeasure('nia_of_poly_types', {
												content : study.id
											}, createMeasure('id_of_poly_types', {
												content : 'func'
											}, {
												content : 'CIRC-PRI'
											}))
										}
									},
									// BMARK nia_prim_circ_sqft : NIA of Primary Circulation
									// (ft\xB2)
									'nia_prim_circ_sqft' : function() {
										return {
											name : 'NIA of Primary Circulation (ft\xB2)',
											measure : createMeasure('mult', measures['nia_prim_circ']
													().measure, {
												content : 10.7639104
											}),
											units : 'ft\xB2'
										}
									},
									// BMARK nia_prim_circ_to_total_prc : NIA Primary Circulation
									// to total
									'nia_prim_circ_to_total_prc' : function() {
										return {
											name : 'NIA Primary Circulation to total',
											measure : createMeasure('prc', createMeasure('div',
													measures['nia_prim_circ']().measure,
													measures['nia_total']().measure)),
										}
									},
									// BMARK nia_total_per_desk : Total NIA per desk
									'nia_total_per_desk' : function() {
										return {
											name : 'Total NIA per desk',
											measure : createMeasure('div',
													measures['nia_total']().measure,
													measures['no_of_desks']().measure),
											units : 'm\xB2/desk'
										}
									},
									// BMARK nia_wrksp : NIA of Workspace
									'nia_wrksp' : function() {
										return {
											name : 'NIA of Workspace',
											measure : createMeasure('nia_of_poly_types', {
												content : study.id
											}, createMeasure('id_of_poly_types', {
												content : 'func'
											}, {
												content : 'WRKSP'
											}))
										}
									},
									// BMARK nia_wrksp_sqft : NIA of Workspace (ft\xB2)
									'nia_wrksp_sqft' : function() {
										return {
											name : 'NIA of Workspace (ft\xB2)',
											measure : createMeasure('mult',
													measures['nia_wrksp']().measure, {
														content : 10.7639104
													}),
											units : 'ft\xB2'
										}
									},
									// BMARK nia_wrksp_to_total_prc : NIA of Workspace to total
									'nia_wrksp_to_total_prc' : function() {
										return {
											name : 'NIA of Workspace to total',
											measure : createMeasure('prc', createMeasure('div',
													measures['nia_wrksp']().measure,
													measures['nia_total']().measure)),
										}
									},
									// BMARK nia_wrksp_per_desk : Workspace per desk
									'nia_wrksp_per_desk' : function() {
										return {
											name : 'Workspace per desk',
											measure : createMeasure('div',
													measures['nia_wrksp']().measure,
													measures['no_of_desks']().measure),
											units : 'm\xB2/desk'
										}
									},
									// BMARK nia_wrksp_open : NIA of Open Workspace
									'nia_wrksp_open' : function() {
										return {
											name : 'NIA of Open Workspace',
											measure : createMeasure('nia_of_poly_types', {
												content : study.id
											}, createMeasure('id_of_poly_types', {
												content : 'func'
											}, {
												content : 'WRKSP-OPN'
											}))
										}
									},
									// BMARK nia_wrksp_open_sqft : NIA of Open Workspace (ft\xB2)
									'nia_wrksp_open_sqft' : function() {
										return {
											name : 'NIA of Open Workspace (ft\xB2)',
											measure : createMeasure('mult',
													measures['nia_wrksp_open']().measure, {
														content : 10.7639104
													}),
											units : 'ft\xB2'
										}
									},
									// BMARK nia_wrksp_open_to_total_prc : NIA of Open Workspace
									// to total
									'nia_wrksp_open_to_total_prc' : function() {
										return {
											name : 'NIA of Open Workspace to total',
											measure : createMeasure('prc', createMeasure('div',
													measures['nia_wrksp_open']().measure,
													measures['nia_total']().measure)),
										}
									},
									// BMARK nia_wrksp_open_per_desk : Workspace per desk (Open
									// plan)
									'nia_wrksp_open_per_desk' : function() {
										return {
											name : 'Workspace per desk (Open plan)',
											measure : createMeasure('div', measures['nia_wrksp_open']
													().measure,
													measures['no_of_desks_open_plan']().measure),
											units : 'm\xB2/desk'
										}
									},
									// BMARK nia_wrksp_opn_per_desk_per_building : Workspace per
									// desk (Open plan) per building
									'nia_wrksp_opn_per_desk_per_building' : function() {
										return {
											name : 'Workspace per desk (Open plan) per building',
											measure : createMeasure(
													'div',
													measures['nia_wrksp_opn_per_building']().measure,
													measures['no_of_desks_open_plan_per_building']().measure),
											units : 'm\xB2/desk'
										}
									},
									// BMARK nia_wrksp_cel : NIA of Cellular Workspace
									'nia_wrksp_cel' : function() {
										return {
											name : 'NIA of Cellular Workspace',
											measure : createMeasure('nia_of_poly_types', {
												content : study.id
											}, createMeasure('id_of_poly_types', {
												content : 'func'
											}, {
												content : 'WRKSP-CEL'
											}))
										}
									},
									// BMARK nia_wrksp_cel_sqft : NIA of Cellular Workspace
									// (ft\xB2)
									'nia_wrksp_cel_sqft' : function() {
										return {
											name : 'NIA of Cellular Workspace  (ft\xB2)',
											measure : createMeasure('mult', measures['nia_wrksp_cel']
													().measure, {
												content : 10.7639104
											}),
											units : 'ft\xB2'
										}
									},
									// BMARK nia_wrksp_cel_to_total_prc : NIA of Cellular
									// Workspace to total
									'nia_wrksp_cel_to_total_prc' : function() {
										return {
											name : 'NIA of Cellular Workspace  to total',
											measure : createMeasure('prc', createMeasure('div',
													measures['nia_wrksp_cel']().measure,
													measures['nia_total']().measure)),
										}
									},
									// BMARK nia_wrksp_cel_per_desk : Workspace per desk
									// (Cellular)
									'nia_wrksp_cel_per_desk' : function() {
										return {
											name : 'Workspace per desk (Cellular)',
											measure : createMeasure('div', measures['nia_wrksp_cel']
													().measure,
													measures['no_of_desks_cellular']().measure),
											units : 'm\xB2/desk'
										}
									},
									// BMARK nia_wrksp_cel_per_desk_per_building : Workspace per
									// desk (Cellular) per building
									'nia_wrksp_cel_per_desk_per_building' : function() {
										return {
											name : 'Workspace per desk (Cellular) per building',
											measure : createMeasure(
													'div',
													measures['nia_wrksp_cel_per_building']().measure,
													measures['no_of_desks_cellular_per_building']().measure),
											units : 'm\xB2/desk'
										}
									},
									// BMARK nia_storage : NIA of Storage
									'nia_storage' : function() {
										return {
											name : 'NIA of Storage',
											measure : createMeasure('nia_of_poly_types', {
												content : study.id
											}, createMeasure('id_of_poly_types', {
												content : 'func'
											}, {
												content : 'OTHFCL-STO'
											}))
										}
									},
									// BMARK nia_storage_to_total_prc : NIA Storage to total
									'nia_storage_to_total_prc' : function() {
										return {
											name : 'NIA Storage to total',
											measure : createMeasure('prc', createMeasure('div',
													measures['nia_storage']().measure,
													measures['nia_total']().measure)),
										}
									},
									// BMARK nia_meeting_room_bkb : NIA of bookable meeting rooms
									'nia_meeting_room_bkb' : function() {
										return {
											name : 'NIA of bookable meeting rooms',
											measure : createMeasure('nia_of_poly_types', {
												content : study.id
											}, createMeasure('id_of_poly_types', {
												content : 'func'
											}, {
												content : 'MTG-BKB'
											}))
										}
									},
									// BMARK nia_alternative_spaces : NIA of Alternative Spaces
									'nia_alternative_spaces' : function() {
										return {
											name : 'NIA of Alternative Spaces',
											measure : createMeasure('nia_of_poly_types', {
												content : study.id
											}, createMeasure('id_of_poly_types', {
												content : 'func'
											}, {
												content : 'ALT'
											}))
										}
									},
									'nia_alternative_spaces_sqft' : function() {
										return {
											name : 'NIA of Alternative spaces (ft\xB2)',
											measure : createMeasure('mult',
													measures['nia_alternative_spaces']().measure, {
														content : 10.7639104
													}),
											units : 'ft\xB2'
										}
									},
									'nia_alternative_spaces_prc' : function() {
										return {
											name : 'NIA of Alternative spaces to total',
											measure : createMeasure('prc', createMeasure('div',
													measures['nia_alternative_spaces']().measure,
													measures['nia_total']().measure)),
											units : '%'
										}
									},
									// BMARK nia_meeting_room : NIA of Meeting rooms
									'nia_meeting_room' : function() {
										return {
											name : 'NIA of Meeting rooms',
											measure : createMeasure('nia_of_poly_types', {
												content : study.id
											}, createMeasure('id_of_poly_types', {
												content : 'func'
											}, {
												content : 'MTG'
											}))
										}
									},
									// BMARK nia_meeting_room_to_total_prc : NIA Meeting rooms to
									// total
									'nia_meeting_room_to_total_prc' : function() {
										return {
											name : 'NIA Meeting rooms to total',
											measure : createMeasure('prc', createMeasure('div',
													measures['nia_meeting_room']().measure,
													measures['nia_total']().measure)),
										}
									},
									// BMARK nia_meeting_rooms_per_building : NIA of Meeting rooms
									// per building
									'nia_meeting_rooms_per_building' : function() {
										return {
											name : 'NIA of Meeting rooms per building',
											measure : createMeasure('nia_of_poly_types_per_building',
													createMeasure('id_of_poly_types', {
														content : 'func'
													}, {
														content : 'MTG'
													}), {
														content : study.id
													})
										}
									},
									// BMARK nia_meeting_rooms_per_space : NIA of Meeting rooms
									// per space
									'nia_meeting_rooms_per_space' : function() {
										return {
											name : 'NIA of Meeting rooms per space',
											measure : createMeasure('nia_of_poly_types_per_space',
													createMeasure('id_of_poly_types', {
														content : 'func'
													}, {
														content : 'MTG'
													}), {
														content : study.id
													})
										}
									},
									// BMARK nia_other_facilities : NIA of Other Facilities
									'nia_other_facilities' : function() {
										return {
											name : 'NIA of Other Facilities',
											measure : createMeasure('nia_of_poly_types', {
												content : study.id
											}, createMeasure('id_of_poly_types', {
												content : 'func'
											}, {
												content : 'OTHFCL'
											}))
										}
									},
									// BMARK nia_shared_facilities : NIA of Shared Facilities
									'nia_shared_facilities' : function() {
										return {
											name : 'NIA of Shared Facilities',
											measure : createMeasure('add',
													measures['nia_alternative_spaces']().measure,
													measures['nia_meeting_room']().measure,
													measures['nia_other_facilities']().measure)
										}
									},
									// BMARK nia_shared_facilities_sqft : NIA of Shared Facilities
									// (ft\xB2)
									'nia_shared_facilities_sqft' : function() {
										return {
											name : 'NIA of Shared Facilities (ft\xB2)',
											measure : createMeasure('mult',
													measures['nia_shared_facilities']().measure, {
														content : 10.7639104
													}),
											units : 'ft\xB2'
										}
									},
									// BMARK nia_shared_facilities_to_total_prc : NIA Shared
									// Facilities to total
									'nia_shared_facilities_to_total_prc' : function() {
										return {
											name : 'NIA Shared Facilities to total',
											measure : createMeasure('prc', createMeasure('div',
													measures['nia_shared_facilities']().measure,
													measures['nia_total']().measure)),
										}
									},
									// BMARK no_of_desks_wrksp : No. of desks in workspace
									'no_of_desks_wrksp' : function() {
										return {
											name : 'No. of desks in workspace',
											measure : createMeasure('add',
													measures['no_of_desks_cellular']().measure,
													measures['no_of_desks_open_plan']().measure)
										}
									},
									// BMARK no_of_desks_more_than_staff : No. of desks over
									// capacity
									'no_of_desks_more_than_staff' : function() {
										return {
											name : 'No. of desks over capacity',
											measure : createMeasure('sub',
													measures['no_of_desks']().measure,
													measures['no_of_staff']().measure)
										}
									},
									// BMARK no_of_desks_more_than_staff_prc : No. of desks over
									// capacity
									'no_of_desks_more_than_staff_prc' : function() {
										return {
											name : 'No. of desks over capacity',
											measure : createMeasure('prc', createMeasure('div',
													measures['no_of_desks_more_than_staff']().measure,
													measures['no_of_staff']().measure))
										}
									},
									// BMARK no_of_desks_empty : No. of desks empty all
									// observation
									'no_of_desks_empty' : function() {
										return {
											name : 'No. of desks empty all observation',
											measure : createMeasure('sub',
													measures['no_of_desks']().measure,
													measures['no_of_desks_not_empty']().measure)
										}
									},
									// BMARK avg_not_empty_desk_occupancy_prc : Average desk
									// occupancy (excluding empty)
									'avg_not_empty_desk_occupancy_prc' : function() {
										return {
											name : 'Average desk occupancy (excluding empty)',
											no_of_decimals : 0,
											measure : createMeasure('prc', createMeasure('div',
													measures['desk_occupancy_total']().measure,
													createMeasure('mult',
															measures['no_of_desks_not_empty']().measure,
															measures['no_of_rounds']().measure))),
											description : 'Average occupied desks to total number of desks excluding the ones that were empty for all the observation',
											units_full : '% people walking',
											units : "%"
										}
									},
									// BMARK nia_total : Total NIA
									'nia_total' : function() {
										return {
											name : 'Total NIA',
											measure : createMeasure('nia_of_poly_type_group', {
												content : study.id
											}, {
												content : 'func'
											}),
											units : 'm\xB2'
										}
									},
									// BMARK nia_total_sqft : Total NIA (ft\xB2)
									'nia_total_sqft' : function() {
										return {
											name : 'Total NIA (ft\xB2)',
											measure : createMeasure('mult',
													measures['nia_total']().measure, {
														content : 10.7639104
													}),
											units : 'ft\xB2'
										}
									},
									// BMARK nia_total_per_building : Total NIA per building
									'nia_total_per_building' : function() {
										return {
											name : 'Total NIA per building',
											measure : createMeasure(
													'nia_of_poly_type_group_per_building', {
														content : study.id
													}, {
														content : 'func'
													}),
											units : 'm\xB2'
										}
									},
									// BMARK nia_total_per_space : Total NIA per space
									'nia_total_per_space' : function() {
										return {
											name : 'Total NIA per space',
											measure : createMeasure(
													'nia_of_poly_type_group_per_space', {
														content : study.id
													}, {
														content : 'func'
													}),
											units : 'm\xB2'
										}
									},
									// BMARK people_moving_total : Number of people walking
									'people_moving_total' : function() {
										return {
											name : 'Number of people walking',
											measure : createMeasure('no_of_people_activity',
													measures['first_observation_id']().measure, {
														content : [
															3
														]
													}, {
														content : [
																0, 1
														]
													}, {
														content : [
																0, 1
														]
													}),
											units : 'people'
										}
									},
									// BMARK people_standing_total : Number of people standing
									'people_standing_total' : function() {
										return {
											name : 'Number of people standing',
											measure : createMeasure('no_of_people_activity',
													measures['first_observation_id']().measure, {
														content : [
															2
														]
													}, {
														content : [
																0, 1
														]
													}, {
														content : [
																0, 1
														]
													}),
											units : 'people'
										}
									},
									// BMARK people_sitting_total : Number of people sitting
									'people_sitting_total' : function() {
										return {
											name : 'Number of people sitting',
											measure : createMeasure('no_of_people_activity',
													measures['first_observation_id']().measure, {
														content : [
															1
														]
													}, {
														content : [
																0, 1
														]
													}, {
														content : [
																0, 1
														]
													}),
											units : 'people'
										}
									},
									// BMARK people_on_the_phone_total : Number of people on the
									// phone
									'people_on_the_phone_total' : function() {
										return {
											name : 'Number of people on the phone',
											measure : createMeasure('no_of_people_activity',
													measures['first_observation_id']().measure, {
														content : [
																1, 2, 3
														]
													}, {
														content : [
																0, 1
														]
													}, {
														content : [
															1
														]
													}),
											units : 'people'
										}
									},
									// BMARK people_any_activity_total : Number of people in space
									'people_any_activity_total' : function() {
										return {
											name : 'Number of people in space',
											measure : createMeasure('no_of_people_activity',
													measures['first_observation_id']().measure, {
														content : [
																1, 2, 3
														]
													}, {
														content : [
																0, 1
														]
													}, {
														content : [
																0, 1
														]
													}),
											units : 'people'
										}
									},
									// BMARK people_any_activity_total_breakdown : Number of
									// people in space (broken down by activity)
									'people_any_activity_total_breakdown' : function() {
										return {
											name : 'Number of people in space (broken down by activity)',
											measure : createMeasure(
													'no_of_people_activity_breakdown',
													measures['first_observation_id']().measure, {
														content : [
																1, 2, 3
														]
													}, {
														content : [
																{
																	id : 1,
																	name : 'Sitting'
																}, {
																	id : 2,
																	name : 'Standing'
																}, {
																	id : 3,
																	name : 'Walking'
																}
														]
													}),
											units : 'people'
										}
									},
									// BMARK people_any_activity_total_per_building : Number of
									// people in building
									'people_any_activity_total_per_building' : function() {
										return {
											name : 'Number of people in building',
											measure : createMeasure(
													'no_of_people_activity_per_building',
													measures['first_observation_id']().measure, {
														content : [
																1, 2, 3
														]
													}),
											units : 'people'
										}
									},
									// BMARK people_any_activity_total_per_space : Number of
									// people in space
									'people_any_activity_total_per_space' : function() {
										return {
											name : 'Number of people in space',
											measure : createMeasure(
													'no_of_people_activity_per_space',
													measures['first_observation_id']().measure, {
														content : [
																1, 2, 3
														]
													}),
											units : 'people'
										}
									},
									// BMARK no_of_people_walking_per_building : Number of people
									// in building
									'no_of_people_walking_per_building' : function() {
										return {
											name : 'Number of people in building',
											measure : createMeasure(
													'no_of_people_activity_per_building',
													measures['first_observation_id']().measure, {
														content : [
															3
														]
													}),
											units : 'people'
										}
									},
									// BMARK no_of_people_walking_per_space : Number of people in
									// space
									'no_of_people_walking_per_space' : function() {
										return {
											name : 'Number of people in space',
											measure : createMeasure(
													'no_of_people_activity_per_space',
													measures['first_observation_id']().measure, {
														content : [
															3
														]
													}),
											units : 'people'
										}
									},
									// BMARK avg_utlisation_per_sqm : Avg utilisation per m\xB2
									'avg_utlisation_per_sqm' : function() {
										return {
											name : 'Avg utilisation per m\xB2',
											measure : createMeasure('div',
													measures['people_any_activity_total']().measure,
													measures['nia_total']().measure),
											units : 'people/m\xB2'
										}
									},
									// BMARK avg_utlisation_per_sqm_per_building : Avg utilisation
									// per m\xB2 per building
									'avg_utlisation_per_sqm_per_building' : function() {
										return {
											name : 'Avg utilisation per m\xB2 per building',
											measure : createMeasure(
													'div',
													measures['people_any_activity_total_per_building']().measure,
													measures['nia_total_per_building']().measure),
											units : 'people/m\xB2'
										}
									},
									// BMARK avg_utlisation_per_sqm_per_space : Avg utilisation
									// per m\xB2 per floor
									'avg_utlisation_per_sqm_per_space' : function() {
										return {
											name : 'Avg utilisation per m\xB2 per floor',
											measure : createMeasure(
													'div',
													measures['people_any_activity_total_per_space']().measure,
													measures['nia_total_per_space']().measure),
											units : 'people/m\xB2'
										}
									},
									// BMARK people_any_activity_interacting_total : Number of
									// people in space interacting
									'people_any_activity_interacting_total' : function() {
										return {
											name : 'Number of people in space interacting',
											measure : createMeasure(
													'no_of_people_activity_interacting',
													measures['first_observation_id']().measure, {
														content : [
																1, 2, 3
														]
													}),
											units : 'people'
										}
									},
									// BMARK
									// people_workspace_any_activity_interacting_total_per_activity
									// : Number of people in workspace interacting
									'people_workspace_any_activity_interacting_total_per_activity' : function() {
										return {
											name : 'Number of people in workspace interacting',
											no_of_decimals : 0,
											measure : createMeasure('table_prc', createMeasure(
													'activity_interacting_in_polygon_types_per_activity',
													measures['first_observation_id']().measure,
													createMeasure('id_of_poly_types', {
														content : 'func'
													}, {
														content : 'WRKSP'
													}), {
														content : [
																1, 2, 3
														]
													}, {
														content : [
																0, 1
														]
													}, {
														content : [
																0, 1
														]
													}, {
														content : [
																{
																	id : 1,
																	name : 'Sitting'
																}, {
																	id : 2,
																	name : 'Standing'
																}, {
																	id : 3,
																	name : 'Walking'
																}
														]
													})),
											units : 'people'
										}
									},
									// BMARK people_any_activity_interacting_total_per_building :
									// Number of people in space interacting per building
									'people_any_activity_interacting_total_per_building' : function() {
										return {
											name : 'Number of people in space interacting per building',
											measure : createMeasure(
													'no_of_people_activity_interacting_per_building',
													measures['first_observation_id']().measure, {
														content : [
																1, 2, 3
														]
													}),
											units : 'people'
										}
									},
									// BMARK people_any_activity_interacting_total_per_space :
									// Number of people in space interacting per space
									'people_any_activity_interacting_total_per_space' : function() {
										return {
											name : 'Number of people in space interacting per space',
											measure : createMeasure(
													'no_of_people_activity_interacting_per_space',
													measures['first_observation_id']().measure, {
														content : [
																1, 2, 3
														]
													}),
											units : 'people'
										}
									},
									// BMARK people_any_activity_interacting_prc : Proportion of
									// people interacting
									'people_any_activity_interacting_prc' : function() {
										return {
											name : 'Proportion of people interacting',
											measure : createMeasure('prc',
													createMeasure('div',
															measures['people_any_activity_interacting_total']
																	().measure,
															measures['people_any_activity_total']().measure)),
											units : '%'
										}
									},
									// BMARK people_any_activity_interacting_prc_verdict :
									// Proportion of people interacting (Verdict)
									'people_any_activity_interacting_prc_verdict' : function() {
										return {
											name : 'Proportion of people interacting (Verdict)',
											measure : createMeasure(
													'labelswitch',
													measures['people_any_activity_interacting_prc']().measure,
													createMeasure('construct_ranges', {
														content : [
																'0-31:LOW', '31-37:MEDIUM', '37+:HIGH'
														]
													})),
										}
									},
									// BMARK people_any_activity_interacting_prc_per_building :
									// Proportion of people interacting per building
									'people_any_activity_interacting_prc_per_building' : function() {
										return {
											name : 'Proportion of people interacting per building',
											measure : createMeasure(
													'mult',
													createMeasure(
															'div',
															measures['people_any_activity_interacting_total_per_building']
																	().measure,
															measures['people_any_activity_total_per_building']
																	().measure), {
														content : 100
													}),
											units : '%'
										}
									},
									// BMARK people_any_activity_interacting_prc_per_space :
									// Proportion of people interacting per space
									'people_any_activity_interacting_prc_per_space' : function() {
										return {
											name : 'Proportion of people interacting per space',
											measure : createMeasure(
													'mult',
													createMeasure(
															'div',
															measures['people_any_activity_interacting_total_per_space']
																	().measure,
															measures['people_any_activity_total_per_space']().measure),
													{
														content : 100
													}),
											units : '%'
										}
									},
									// BMARK avg_sitting_total : Proportion of people sitting to
									// total observed
									'avg_sitting_total' : function() {
										return {
											name : 'Proportion of people sitting to total observed',
											measure : createMeasure('prc', createMeasure('div',
													measures['people_sitting_total']().measure,
													measures['people_any_activity_total']().measure)),
											description : 'Average number of people sitting as a percentage of total in space',
											units_full : '% people walking',
											units : "%",
										}
									},
									// BMARK avg_standing_total : Proportion of people standing to
									// total observed
									'avg_standing_total' : function() {
										return {
											name : 'Proportion of people standing to total observed',
											measure : createMeasure('prc', createMeasure('div',
													measures['people_standing_total']().measure,
													measures['people_any_activity_total']().measure)),
											description : 'Average number of people standing as a percentage of total in space',
											units_full : '% people walking',
											units : "%",
										}
									},
									// BMARK avg_moving_total : Proportion of people walking to
									// total observed
									'avg_moving_total' : function() {
										return {
											name : 'Proportion of people walking to total observed',
											measure : createMeasure('prc', createMeasure('div',
													measures['people_moving_total']().measure,
													measures['people_any_activity_total']().measure)),
											description : 'Average number of people walking as a percentage of total in space',
											units_full : '% people walking',
											units : "%",
										}
									},
									// BMARK prc_on_the_phone : Proportion of people on the phone
									// to total observed
									'prc_on_the_phone' : function() {
										return {
											name : 'Proportion of people on the phone to total observed',
											measure : createMeasure('prc', createMeasure('div',
													measures['people_on_the_phone_total']().measure,
													measures['people_any_activity_total']().measure)),
											description : 'Average number of people on the phone as a percentage of total in space',
											units_full : '% people walking',
											units : "%",
										}
									},
									// BMARK avg_moving_per_building : Proportion of people
									// walking to total observed per building
									'avg_moving_per_building' : function() {
										return {
											name : 'Proportion of people walking to total observed per building',
											measure : createMeasure(
													'mult',
													createMeasure(
															'div',
															measures['no_of_people_walking_per_building']().measure,
															measures['people_any_activity_total_per_building']
																	().measure), {
														content : 100
													}),
											description : 'Average number of people walking as a percentage of total in space',
											units_full : '% people walking',
											units : "%",
										}
									},
									// BMARK avg_moving_per_space : Proportion of people walking
									// to total observed per space
									'avg_moving_per_space' : function() {
										return {
											name : 'Proportion of people walking to total observed per space',
											measure : createMeasure(
													'mult',
													createMeasure(
															'div',
															measures['no_of_people_walking_per_space']().measure,
															measures['people_any_activity_total_per_space']().measure),
													{
														content : 100
													}),
											description : 'Average number of people walking as a percentage of total in space',
											units_full : '% people walking',
											units : "%",
										}
									},
									// BMARK occupancy_of_bookable_meeting_rooms : Overall
									// occupancy of Bookable Meeting Rooms
									'occupancy_of_bookable_meeting_rooms' : function() {
										return {
											name : 'Overall occupancy of Bookable Meeting Rooms',
											measure : createMeasure('occupancy_of_poly_types',
													measures['first_observation_id']().measure,
													createMeasure('id_of_poly_types', {
														content : 'func'
													}, {
														content : 'MTG-BKB'
													}))
										}
									},
									// BMARK occupancy_of_bookable_meeting_rooms : Overall
									// occupancy of Bookable Meeting Rooms
									'occupancy_of_bookable_meeting_rooms_per_round' : function() {
										return {
											name : 'Overall occupancy of Bookable Meeting Rooms (per round)',
											measure : createMeasure(
													'occupancy_of_poly_types_per_round',
													measures['first_observation_id']().measure,
													createMeasure('id_of_poly_types', {
														content : 'func'
													}, {
														content : 'MTG-BKB'
													}), createMeasure('round_times',
															measures['first_observation_id']().measure))
										}
									},
									// BMARK max_occupancy_of_bookable_meeting_rooms_prc : Maximum
									// occupancy of Bookable Meeting Rooms (%)
									'max_occupancy_of_bookable_meeting_rooms_prc' : function() {
										return {
											name : 'Maximum occupancy of Bookable Meeting Rooms (%)',
											measure : createMeasure(
													'table_max',
													measures['occupancy_of_bookable_meeting_rooms_per_round_prc']
															().measure)
										}
									},
									// BMARK min_occupancy_of_bookable_meeting_rooms_prc : Minimum
									// occupancy of Bookable Meeting Rooms (%)
									'min_occupancy_of_bookable_meeting_rooms_prc' : function() {
										return {
											name : 'Minimum occupancy of Bookable Meeting Rooms (%)',
											measure : createMeasure(
													'table_min',
													measures['occupancy_of_bookable_meeting_rooms_per_round_prc']
															().measure)
										}
									},
									// BMARK max_occupancy_of_bookable_meeting_rooms : Maximum
									// occupancy of Bookable Meeting Rooms
									'max_occupancy_of_bookable_meeting_rooms' : function() {
										return {
											name : 'Maximum occupancy of Bookable Meeting Rooms [Overall maximum number of meetings]',
											measure : createMeasure(
													'table_max',
													measures['occupancy_of_bookable_meeting_rooms_per_round']
															().measure)
										}
									},
									// BMARK min_occupancy_of_bookable_meeting_rooms : Minimum
									// occupancy of Bookable Meeting Rooms
									'min_occupancy_of_bookable_meeting_rooms' : function() {
										return {
											name : 'Minimum occupancy of Bookable Meeting Rooms',
											measure : createMeasure(
													'table_min',
													measures['occupancy_of_bookable_meeting_rooms_per_round']
															().measure)
										}
									},
									// BMARK utilisation_of_bookable_meeting_rooms : Overall
									// utilisation of Bookable Meeting Rooms
									'utilisation_of_bookable_meeting_rooms' : function() {
										return {
											name : 'Overall utilisation of Bookable Meeting Rooms',
											measure : createMeasure('utilisation_of_poly_types',
													measures['first_observation_id']().measure,
													createMeasure('id_of_poly_types', {
														content : 'func'
													}, {
														content : 'MTG-BKB'
													}))
										}
									},
									// BMARK standing_wrksp : Number of people sitting in
									// workspace
									'standing_wrksp' : function() {
										return {
											name : 'Number of people sitting in workspace',
											measure : createMeasure(
													'utilisation_activity_of_poly_types',
													measures['first_observation_id']().measure,
													createMeasure('id_of_poly_types', {
														content : 'func'
													}, {
														content : 'WRKSP'
													}), {
														content : [
															1
														]
													})
										}
									},
									// BMARK sitting_wrksp : Number of people standing in
									// workspace
									'sitting_wrksp' : function() {
										return {
											name : 'Number of people standing in workspace',
											measure : createMeasure(
													'utilisation_activity_of_poly_types',
													measures['first_observation_id']().measure,
													createMeasure('id_of_poly_types', {
														content : 'func'
													}, {
														content : 'WRKSP'
													}), {
														content : [
															2
														]
													})
										}
									},
									// BMARK visiting_ratio : Visiting Ratio
									'visiting_ratio' : function() {
										return {
											name : 'Visiting Ratio',
											measure : createMeasure('div', measures['standing_wrksp']
													().measure, measures['sitting_wrksp']().measure)
										}
									},
									// BMARK occupancy_of_bookable_meeting_rooms_prc : Overall
									// occupancy of Bookable Meeting Rooms (%)
									'occupancy_of_bookable_meeting_rooms_prc' : function() {
										return {
											name : 'Overall occupancy of Bookable Meeting Rooms (%)',
											measure : createMeasure(
													'prc',
													createMeasure(
															'div',
															measures['occupancy_of_bookable_meeting_rooms']().measure,
															createMeasure('mult',
																	measures['no_of_meeting_rooms']().measure,
																	measures['no_of_rounds']().measure))),
										}
									},
									// BMARK occupancy_of_bookable_meeting_rooms_prc : Overall
									// occupancy of Bookable Meeting Rooms (%)
									'occupancy_of_bookable_meeting_rooms_avg' : function() {
										return {
											name : 'Overall average occupancy of Bookable Meeting Rooms (%) [Overall Average number of meetings at any point]',
											measure : createMeasure(
													'div',
													measures['occupancy_of_bookable_meeting_rooms']().measure,
													measures['no_of_rounds']().measure),
										}
									},
									// BMARK occupancy_of_bookable_meeting_rooms_per_round_prc :
									// Overall
									// occupancy of Bookable Meeting Rooms
									'occupancy_of_bookable_meeting_rooms_per_round_prc' : function() {
										return {
											name : 'Overall occupancy of Bookable Meeting Rooms (% per round)',
											no_of_decimals : 2,
											measure : createMeasure(
													'mult',
													createMeasure(
															'div',
															measures['occupancy_of_bookable_meeting_rooms_per_round']
																	().measure,

															measures['no_of_meeting_rooms']().measure), {
														content : 100
													})
										}
									},
									// BMARK occupancy_of_alternative_spaces : Overall occupancy
									// of Alternative Meeting Spaces
									'occupancy_of_alternative_spaces' : function() {
										return {
											name : 'Overall occupancy of Alternative Meeting Spaces',
											measure : createMeasure('occupancy_of_poly_types',
													measures['first_observation_id']().measure,
													createMeasure('id_of_poly_types', {
														content : 'func'
													}, {
														content : 'ALT'
													}))
										}
									},
									// BMARK occupancy_of_alternative_spaces_prc : Overall
									// occupancy of Alternative Meeting Spaces
									'occupancy_of_alternative_spaces_prc' : function() {
										return {
											name : 'Overall occupancy of Alternative Meeting Spaces',
											measure : createMeasure(
													'prc',
													createMeasure(
															'div',
															measures['occupancy_of_alternative_spaces']().measure,
															createMeasure(
																	'mult',
																	measures['no_of_alternative_spaces']().measure,
																	measures['no_of_rounds']().measure))),
										}
									},
									// BMARK no_of_replies_amount_of_space : Table of responses to
									// question TheSpaceAtAndAroundMyDeskIsAppro
									'no_of_replies_amount_of_space' : function() {
										return {
											name : 'Table of responses to question TheSpaceAtAndAroundMyDeskIsAppro',
											measure : createMeasure('table_prc', createMeasure(
													'no_of_staff_replies_per_choice', {
														content : study.id
													}, createMeasure('id_of_staff_question', {
														content : 'TheSpaceAtAndAroundMyDeskIsAppro'
													}))),
											units : 'replies'
										}
									},
									// BMARK no_of_replies_face_to_face_spaces_exist_within_team :
									// Table of responses to question
									// ThereAreSpacesThatSupportFacetof (within department)
									'no_of_replies_face_to_face_spaces_exist_within_team' : function() {
										return {
											name : 'Table of responses to question ThereAreSpacesThatSupportFacetof (within department)',
											measure : createMeasure('table_prc', createMeasure(
													'no_of_staff_replies_per_choice', {
														content : study.id
													}, createMeasure('id_of_staff_question', {
														content : 'ThereAreSpacesThatSupportFacetof'
													}))),
											units : 'replies'
										}
									},
									// BMARK no_of_replies_face_to_face_spaces_exist_outside_team
									// : Table of responses to question
									// ThereAreSpacesThatSupportFacetof1 (outside department)
									'no_of_replies_face_to_face_spaces_exist_outside_team' : function() {
										return {
											name : 'Table of responses to question ThereAreSpacesThatSupportFacetof1 (outside department)',
											measure : createMeasure('table_prc', createMeasure(
													'no_of_staff_replies_per_choice', {
														content : study.id
													}, createMeasure('id_of_staff_question', {
														content : 'ThereAreSpacesThatSupportFacetof1'
													}))),
											units : 'replies'
										}
									},
									// BMARK no_of_replies_concentration_spaces_exist : Table of
									// responses to question ThereAreSpacesThatSupportConcent
									'no_of_replies_concentration_spaces_exist' : function() {
										return {
											name : 'Table of responses to question ThereAreSpacesThatSupportConcent',
											measure : createMeasure('table_prc', createMeasure(
													'no_of_staff_replies_per_choice', {
														content : study.id
													}, createMeasure('id_of_staff_question', {
														content : 'ThereAreSpacesThatSupportConcent'
													}))),
											units : 'replies'
										}
									},
									// BMARK no_of_tagged_quotes_best_feature : Table of amount of
									// quotes tagged in XBestFeature
									'no_of_tagged_quotes_best_feature' : function() {
										return {
											name : 'Table of amount of quotes tagged in XBestFeature',
											measure : createMeasure('no_of_staff_quotes_per_tag', {
												content : study.id
											}, createMeasure('id_of_staff_question', {
												content : 'XBestFeature'
											})),
											units : 'quotes'
										}
									},
									// BMARK no_of_tagged_quotes_improvements : Table of amount of
									// quotes tagged in XImprovements
									'no_of_tagged_quotes_improvements' : function() {
										return {
											name : 'Table of amount of quotes tagged in XImprovements',
											measure : createMeasure('no_of_staff_quotes_per_tag', {
												content : study.id
											}, createMeasure('id_of_staff_question', {
												content : 'XImprovements'
											})),
											units : 'quotes'
										}
									},
									// BMARK no_of_replies_can_get_meeting_room : Table of
									// responses to question IAmAbleToGetAMeetingSpaceWhenINe
									'no_of_replies_can_get_meeting_room' : function() {
										return {
											name : 'Table of responses to question IAmAbleToGetAMeetingSpaceWhenINe',
											measure : createMeasure('table_prc', createMeasure(
													'no_of_staff_replies_per_choice', {
														content : study.id
													}, createMeasure('id_of_staff_question', {
														content : 'IAmAbleToGetAMeetingSpaceWhenINe'
													}))),
											units : 'replies'
										}
									},
									// BMARK no_of_replies_important_confidential_mtg : Table of
									// responses to question ConfidentialMeetingRooms
									'no_of_replies_important_confidential_mtg' : function() {
										return {
											name : 'Table of responses to question ConfidentialMeetingRooms',
											measure : createMeasure('table_prc', createMeasure(
													'no_of_staff_replies_per_choice', {
														content : study.id
													}, createMeasure('id_of_staff_question', {
														content : 'ConfidentialMeetingRooms'
													}))),
											units : 'replies'
										}
									},
									// BMARK no_of_replies_important_bookable_mtg : bb
									'no_of_replies_important_bookable_mtg' : function() {
										return {
											name : 'Table of responses to question BookableMeetingRooms',
											measure : createMeasure('table_prc', createMeasure(
													'no_of_staff_replies_per_choice', {
														content : study.id
													}, createMeasure('id_of_staff_question', {
														content : 'BookableMeetingRooms'
													}))),
											units : 'replies'
										}
									},
									// BMARK no_of_replies_some_people_better_environment : Table
									// of responses to question SomePeopleHaveAMuchBetterWorking
									'no_of_replies_some_people_better_environment' : function() {
										return {
											name : 'Table of responses to question SomePeopleHaveAMuchBetterWorking',
											measure : createMeasure('table_prc', createMeasure(
													'no_of_staff_replies_per_choice', {
														content : study.id
													}, createMeasure('id_of_staff_question', {
														content : 'SomePeopleHaveAMuchBetterWorking'
													}))),
											units : 'replies'
										}
									},
									// BMARK no_of_replies_proud_of_environment : Table of
									// responses to question ImProudOfMyOfficeEnvironment
									'no_of_replies_proud_of_environment' : function() {
										return {
											name : 'Table of responses to question ImProudOfMyOfficeEnvironment',
											measure : createMeasure('table_prc', createMeasure(
													'no_of_staff_replies_per_choice', {
														content : study.id
													}, createMeasure('id_of_staff_question', {
														content : 'ImProudOfMyOfficeEnvironment'
													}))),
											units : 'replies'
										}
									},
									// BMARK no_of_replies_needed_teams_close : Table of responses
									// to question MyDepartmentIsLocatedCloseToTheO
									'no_of_replies_needed_teams_close' : function() {
										return {
											name : 'Table of responses to question MyDepartmentIsLocatedCloseToTheO',
											measure : createMeasure('table_prc', createMeasure(
													'no_of_staff_replies_per_choice', {
														content : study.id
													}, createMeasure('id_of_staff_question', {
														content : 'MyDepartmentIsLocatedCloseToTheO'
													}))),
											units : 'replies'
										}
									},
									// BMARK no_of_replies_meetings_with_externals : Table of
									// responses to question InPreplannedMeetingsWhichInclude
									'no_of_replies_meetings_with_externals' : function() {
										return {
											name : 'Table of responses to question InPreplannedMeetingsWhichInclude',
											measure : createMeasure('table_prc', createMeasure(
													'no_of_staff_replies_per_choice', {
														content : study.id
													}, createMeasure('id_of_staff_question', {
														content : 'InPreplannedMeetingsWhichInclude'
													}))),
											units : 'replies'
										}
									},
									// BMARK no_of_replies_printer_importance : Table of responses
									// to question PhotocopierPrinterPoints
									'no_of_replies_printer_importance' : function() {
										return {
											name : 'Importance of photocopier and printer facilities',
											measure : createMeasure('table_prc', createMeasure(
													'no_of_staff_replies_per_choice', {
														content : study.id
													}, createMeasure('id_of_staff_question', {
														content : 'PhotocopierPrinterPoints'
													}))),
											units : 'replies'
										}
									},
									// BMARK no_of_replies_env_allows_unplanned_mtg : Table of
									// responses to question ItAllowsUnplannedMeetingsChatsTo
									'no_of_replies_env_allows_unplanned_mtg' : function() {
										return {
											name : 'Table of responses to question ItAllowsUnplannedMeetingsChatsTo',
											measure : createMeasure('table_prc', createMeasure(
													'no_of_staff_replies_per_choice', {
														content : study.id
													}, createMeasure('id_of_staff_question', {
														content : 'ItAllowsUnplannedMeetingsChatsTo'
													}))),
											units : 'replies'
										}
									},
									// BMARK no_of_replies_computer_importance : Table of
									// responses to question DesktopComputer
									'no_of_replies_computer_importance' : function() {
										return {
											name : 'Table of responses to question DesktopComputer',
											measure : createMeasure('table_prc', createMeasure(
													'no_of_staff_replies_per_choice', {
														content : study.id
													}, createMeasure('id_of_staff_question', {
														content : 'DesktopComputer'
													}))),
											units : 'replies'
										}
									},
									// BMARK no_of_replies_own_desk_important : How important is
									// it for staff members to have their own desk? (Table of
									// responses to question XOwnDeskImportance)
									'no_of_replies_own_desk_important' : function() {
										return {
											name : 'How important is it for staff members to have their own desk? (Table of responses to question XOwnDeskImportance)',
											measure : createMeasure('table_prc', createMeasure(
													'no_of_staff_replies_per_choice', {
														content : study.id
													}, createMeasure('id_of_staff_question', {
														content : 'XOwnDeskImportance'
													}))),
											units : 'replies'
										}
									},
									// BMARK no_of_replies_own_desk_important : How open is the
									// staff to using a variety of spaces? (Table of responses to
									// question XVarietyOfSpaces)
									'no_of_replies_variety_of_spaces' : function() {
										return {
											name : 'How open is the staff to using a variety of spaces? (Table of responses to question XVarietyOfSpaces)',
											measure : createMeasure('table_prc', createMeasure(
													'no_of_staff_replies_per_choice', {
														content : study.id
													}, createMeasure('id_of_staff_question', {
														content : 'XVarietyOfSpaces'
													}))),
											units : 'replies'
										}
									},
									// BMARK no_of_replies_visitors_like_office : Does the staff
									// think that visitors like the office? (Table of responses to
									// question VisitorsToOurOfficeLikeWhatTheyS)
									'no_of_replies_visitors_like_office' : function() {
										return {
											name : 'Does the staff think that visitors like the office? (Table of responses to question VisitorsToOurOfficeLikeWhatTheyS)',
											measure : createMeasure('table_prc', createMeasure(
													'no_of_staff_replies_per_choice', {
														content : study.id
													}, createMeasure('id_of_staff_question', {
														content : 'VisitorsToOurOfficeLikeWhatTheyS'
													}))),
											units : 'replies'
										}
									},
									// BMARK no_of_replies_community_environment : Table of
									// responses to question ItContributesToASenseOfCommunity
									'no_of_replies_community_environment' : function() {
										return {
											name : 'Table of responses to question ItContributesToASenseOfCommunity',
											measure : createMeasure('table_prc', createMeasure(
													'no_of_staff_replies_per_choice', {
														content : study.id
													}, createMeasure('id_of_staff_question', {
														content : 'ItContributesToASenseOfCommunity'
													}))),
											units : 'replies'
										}
									},
									// BMARK no_of_replies_enjoyable_environment : Table of
									// responses to question ItsAnEnjoyablePlaceToWork
									'no_of_replies_enjoyable_environment' : function() {
										return {
											name : 'Table of responses to question ItsAnEnjoyablePlaceToWork',
											measure : createMeasure('table_prc', createMeasure(
													'no_of_staff_replies_per_choice', {
														content : study.id
													}, createMeasure('id_of_staff_question', {
														content : 'ItsAnEnjoyablePlaceToWork'
													}))),
											units : 'replies'
										}
									},
									// BMARK no_of_replies_dynamic_environment : Table of
									// responses to question ItIsADynamicAndBuzzyEnvironment
									'no_of_replies_dynamic_environment' : function() {
										return {
											name : 'Table of responses to question ItIsADynamicAndBuzzyEnvironment',
											measure : createMeasure('table_prc', createMeasure(
													'no_of_staff_replies_per_choice', {
														content : study.id
													}, createMeasure('id_of_staff_question', {
														content : 'ItIsADynamicAndBuzzyEnvironment'
													}))),
											units : 'replies'
										}
									},
									// BMARK no_of_replies_free_access : Table of responses to
									// question ICanFreelyAccessAllPartsOfTheOff
									'no_of_replies_free_access' : function() {
										return {
											name : 'Table of responses to question ICanFreelyAccessAllPartsOfTheOff',
											measure : createMeasure('table_prc', createMeasure(
													'no_of_staff_replies_per_choice', {
														content : study.id
													}, createMeasure('id_of_staff_question', {
														content : 'ICanFreelyAccessAllPartsOfTheOff'
													}))),
											units : 'replies'
										}
									},
									// BMARK no_of_replies_noisy_environment : Table of responses
									// to question MyWorkingEnvironmentIsTooNoisyAn
									'no_of_replies_noisy_environment' : function() {
										return {
											name : 'Table of responses to question MyWorkingEnvironmentIsTooNoisyAn',
											measure : createMeasure('table_prc', createMeasure(
													'no_of_staff_replies_per_choice', {
														content : study.id
													}, createMeasure('id_of_staff_question', {
														content : 'MyWorkingEnvironmentIsTooNoisyAn'
													}))),
											units : 'replies'
										}
									},
									// BMARK no_of_replies_brand_reflects_identity : Table of
									// responses to question ItReflectsTheIdentityOfOurOrgani
									'no_of_replies_brand_reflects_identity' : function() {
										return {
											name : 'Table of responses to question ItReflectsTheIdentityOfOurOrgani',
											measure : createMeasure('table_prc', createMeasure(
													'no_of_staff_replies_per_choice', {
														content : study.id
													}, createMeasure('id_of_staff_question', {
														content : 'ItReflectsTheIdentityOfOurOrgani'
													}))),
											units : 'replies'
										}
									},
									// BMARK no_of_replies_understand_why_change : Table of
									// responses to question IUnderstandWhyTheOrganisationIsL
									'no_of_replies_understand_why_change' : function() {
										return {
											name : 'Table of responses to question IUnderstandWhyTheOrganisationIsL',
											measure : createMeasure('table_prc', createMeasure(
													'no_of_staff_replies_per_choice', {
														content : study.id
													}, createMeasure('id_of_staff_question', {
														content : 'IUnderstandWhyTheOrganisationIsL'
													}))),
											units : 'replies'
										}
									},
									// BMARK avg_working_hours : Average working hours
									'avg_working_hours' : function() {
										return {
											name : 'Perceived average working hours',
											measure : createMeasure('avg_question_mark', {
												content : study.id
											}, createMeasure('id_of_staff_question', {
												content : 'XWorkingHours'
											})),
											units : 'hours'
										}
									},
									// BMARK avg_out_of_office_hours : Average number of hours out
									// of office
									'avg_out_of_office_hours' : function() {
										return {
											name : 'Perceived average number of hours out of office',
											measure : createMeasure('avg_question_mark', {
												content : study.id
											}, createMeasure('id_of_staff_question', {
												content : 'XOutOfOffice'
											})),
											units : 'hours'
										}
									},
									// BMARK avg_away_from_desk_hours : Average number of hours
									// away from desk
									'avg_away_from_desk_hours' : function() {
										return {
											name : 'Perceived average number of hours away from desk',
											measure : createMeasure('avg_question_mark', {
												content : study.id
											}, createMeasure('id_of_staff_question', {
												content : 'XAwayFromDesk'
											})),
											units : 'hours'
										}
									},
									// BMARK avg_hours_work_from_home : Average number of hours
									// out of office
									'avg_hours_work_from_home' : function() {
										return {
											name : 'Perceived average number of hours working from home',
											measure : createMeasure('avg_question_mark', {
												content : study.id
											}, createMeasure('id_of_staff_question', {
												content : 'XHomeWorkingActual'
											})),
											units : 'hours'
										}
									},
									// BMARK desired_avg_hours_work_from_home : Average number of
									// hours away from desk
									'desired_avg_hours_work_from_home' : function() {
										return {
											name : 'Desired average number of hours working from home',
											measure : createMeasure('avg_question_mark', {
												content : study.id
											}, createMeasure('id_of_staff_question', {
												content : 'XHomeWorkPreferred'
											})),
											units : 'hours'
										}
									},
									// BMARK perceived_desk_occupancy : Perceived desk occupancy
									'perceived_desk_occupancy' : function() {
										return {
											name : 'Perceived desk occupancy',
											measure : createMeasure('prc', createMeasure('div',
													createMeasure('sub', createMeasure('sub',
															measures['avg_working_hours']().measure,
															measures['avg_out_of_office_hours']().measure),
															measures['avg_away_from_desk_hours']().measure),
													measures['avg_working_hours']().measure))
										}
									},
									// BMARK perceived_hours_in_office : Perceived hours in office
									'perceived_hours_in_office' : function() {
										return {
											name : 'Perceived average hours in office',
											measure : createMeasure('sub',
													measures['avg_working_hours']().measure,
													measures['avg_out_of_office_hours']().measure)
										}
									},
									// BMARK avg_time_in_office : Pie chart of perceived average
									// amount of time spent in office per week as a % of perceived
									// average working hours
									'avg_time_in_office' : function() {
										return {
											name : 'Pie chart of perceived average amount of time spent in office per week as a % of perceived average working hours ',
											measure : createMeasure('prc', createMeasure('div',
													measures['perceived_hours_in_office']().measure,
													measures['avg_working_hours']().measure))
										}
									},
									// BMARK staff_relationship_question_id : ID of relationship
									// question
									'staff_relationship_question_id' : function() {
										return {
											name : 'ID of relationship question',
											measure : createMeasure('id_of_staff_question', {
												content : 'relationship_set_people_you_interact_with'
											})
										}
									},
									// BMARK staff_interaction_frequency_id : ID of relationship
									// question
									'staff_interaction_frequency_id' : function() {
										return {
											name : 'ID of relationship question',
											measure : createMeasure('id_of_staff_question', {
												content : 'XPlannedFrequencyFace'
											})
										}
									},
									// BMARK staff_interaction_usefulness_id : ID of relationship
									// question
									'staff_interaction_usefulness_id' : function() {
										return {
											name : 'ID of relationship question',
											measure : createMeasure('id_of_staff_question', {
												content : 'XUsefulness'
											})
										}
									},
									// BMARK avg_no_of_contacts_per_person : Average number of
									// contacts recorded per person
									'avg_no_of_contacts_per_person' : function() {
										return {
											name : 'Average number of contacts recorded per person',
											measure : createMeasure(
													'div',
													createMeasure(
															'no_of_staff_ties_per_question',
															{
																content : study.id
															},
															measures['staff_relationship_question_id']().measure),
													createMeasure(
															'no_of_responders_per_tie_question',
															{
																content : study.id
															},
															measures['staff_relationship_question_id']().measure))
										}
									},
									// BMARK avg_ties_outside_team : Average connections outside
									// team
									'avg_ties_outside_team' : function() {
										return {
											name : 'Average connections outside team',
											measure : createMeasure(
													'div',
													createMeasure(
															'no_of_staff_ties_outside_team',
															{
																content : study.id
															},
															measures['staff_relationship_question_id']().measure),
													createMeasure(
															'no_of_responders_with_ties_outside_team',
															{
																content : study.id
															},
															measures['staff_relationship_question_id']().measure))
										}
									},
									// BMARK avg_no_of_contacts_per_person_seen_over_5 : Average
									// number of people per person reported as being seen once per
									// day or more
									'avg_no_of_contacts_per_person_seen_over_5' : function() {
										return {
											name : 'Average number of people per person reported as being seen once per day or more',
											measure : createMeasure('div', createMeasure(
													'no_of_staff_ties_of_question_and_scores', {
														content : study.id
													},
													measures['staff_interaction_frequency_id']().measure,
													{
														content : [
																5, 6, 7, 8, 9, 10
														]
													}), createMeasure(
													'no_of_responders_per_tie_question', {
														content : study.id
													},
													measures['staff_interaction_frequency_id']().measure))
										}
									},
									// BMARK avg_no_of_contacts_per_person_useful_4 : Average
									// number of extremely useful contacts per person
									'avg_no_of_contacts_per_person_useful_4' : function() {
										return {
											name : 'Average number of extremely useful contacts per person',
											measure : createMeasure(
													'div',
													createMeasure(
															'no_of_staff_ties_of_question_and_scores',
															{
																content : study.id
															},
															measures['staff_interaction_usefulness_id']().measure,
															{
																content : [
																	4
																]
															}),
													createMeasure(
															'no_of_responders_per_tie_question',
															{
																content : study.id
															},
															measures['staff_interaction_usefulness_id']().measure))
										}
									},
									// BMARK avg_no_of_contacts_per_person_useful_3 : Average
									// number of useful contacts per person
									'avg_no_of_contacts_per_person_useful_3' : function() {
										return {
											name : 'Average number of useful contacts per person',
											measure : createMeasure(
													'div',
													createMeasure(
															'no_of_staff_ties_of_question_and_scores',
															{
																content : study.id
															},
															measures['staff_interaction_usefulness_id']().measure,
															{
																content : [
																	3
																]
															}),
													createMeasure(
															'no_of_responders_per_tie_question',
															{
																content : study.id
															},
															measures['staff_interaction_usefulness_id']().measure))
										}
									},
									// BMARK avg_no_of_contacts_per_person_useful_2 : Average
									// number of quite useful contacts per person
									'avg_no_of_contacts_per_person_useful_2' : function() {
										return {
											name : 'Average number of quite useful contacts per person',
											measure : createMeasure(
													'div',
													createMeasure(
															'no_of_staff_ties_of_question_and_scores',
															{
																content : study.id
															},
															measures['staff_interaction_usefulness_id']().measure,
															{
																content : [
																	2
																]
															}),
													createMeasure(
															'no_of_responders_per_tie_question',
															{
																content : study.id
															},
															measures['staff_interaction_usefulness_id']().measure))
										}
									},
									// BMARK nia_total_per_desk_per_building : Average area per
									// desk (Total NIA of building per desk)
									'nia_total_per_desk_per_building' : function() {
										return {
											name : 'Average area per desk (Total NIA of building per desk)',
											measure : createMeasure('div',
													measures['nia_total_per_building']().measure,
													measures['no_of_desks_per_building']().measure),
											units : 'm\xB2/desk'
										};
									},
									'nia_total_per_person_per_building' : function() {
										return {
											name : 'Average area per staff member (Total NIA of building per staff member)',
											measure : createMeasure('div',
													measures['nia_total_per_building']().measure,
													measures['no_of_staff_per_building']().measure),
											units : 'm\xB2/person'
										};
									},
									'nia_total_per_desk_per_space' : function() {
										return {
											name : 'Average area per desk (Total NIA of space per desk)',
											measure : createMeasure('div',
													measures['nia_total_per_space']().measure,
													measures['no_of_desks_per_space']().measure),
											units : 'm\xB2/desk'
										};
									},
									'ids_of_informal_facilities_questions' : function() {
										return {
											name : 'IDs of questions regarding quiet areas, tea/coffee points, breakout areas, place to eat',
											measure : createMeasure('id_of_staff_questions', {
												content : [
														'QuietAreas', 'CoffeeTeaPoints',
														'BreakoutAreasInformalMeetingSpac', 'PlaceToEat'
												]
											})
										}
									},
									// BMARK choices_of_informal_facilities_questions : Choices of
									// questions regarding quiet areas, tea/coffee points,
									// breakout areas, place to eat
									'choices_of_informal_facilities_questions' : function() {
										return {
											name : 'How important are: quiet areas, tea/coffee points, breakout areas and places to eat',
											measure : createMeasure(
													'table_prc',
													createMeasure(
															'no_of_staff_replies_per_choice_multi_q',
															{
																content : study.id
															},
															measures['ids_of_informal_facilities_questions']
																	().measure,
															createMeasure(
																	'question_names',
																	measures['ids_of_informal_facilities_questions']
																			().measure)))
										}
									},
									// BMARK all_team_names : All team names
									'all_team_names' : function() {
										return {
											name : 'All team names',
											measure : createMeasure('team_names', createMeasure(
													'all_team_ids', {
														content : study.id
													}))
										}
									},
									// BMARK in_degree_teams_extreme_usefulness : In-degree
									// network mapping of teams showing centrality based on
									// extremely useful connection
									'in_degree_teams_extreme_usefulness' : function() {
										return {
											name : 'In-degree network mapping of teams showing centrality based on extremely useful connection',
											measure : createMeasure(
													'no_of_staff_ties_directional_team_to_team_scored', {
														content : study.id
													}, createMeasure('id_of_staff_question', {
														content : 'XUsefulness'
													}), {
														content : 3.999
													}, {
														content : 4.001
													}, measures['all_team_names']().measure
											// ,
											// createMeasure('question_names',
											// measures['ids_of_informal_facilities_questions']
											// ().measure)

											)
										}
									},
									// BMARK in_degree_teams_current_collaboration : In-degree
									// network mapping of teams showing centrality based on
									// current interaction (Stakeholders)
									'in_degree_teams_current_collaboration' : function() {
										return {
											name : 'In-degree network mapping of teams showing centrality based on current interaction (Stakeholders)',
											measure : createMeasure(
													'no_of_interview_ties_directional_team_to_team', {
														content : study.id
													}, createMeasure('id_of_interview_question', {
														content : 'Team relationships'
													}, {
														content : 'Collaboration'
													}), measures['all_team_names']().measure
											// ,
											// createMeasure('question_names',
											// measures['ids_of_informal_facilities_questions']
											// ().measure)

											)
										}
									},
									// BMARK in_degree_teams_future_interaction : In-degree
									// network mapping of teams showing centrality based on future
									// interaction (Stakeholders)
									'in_degree_teams_future_interaction' : function() {
										return {
											name : 'In-degree network mapping of teams showing centrality based on future interaction (Stakeholders)',
											measure : createMeasure(
													'no_of_interview_ties_directional_team_to_team', {
														content : study.id
													}, createMeasure('id_of_interview_question', {
														content : 'Team relationships'
													}, {
														content : 'Future'
													}), measures['all_team_names']().measure
											// ,
											// createMeasure('question_names',
											// measures['ids_of_informal_facilities_questions']
											// ().measure)

											)
										}
									},
									// BMARK ids_of_storage_facilities_questions : IDs of
									// questions regarding departmental, personal and archive
									// storage
									'ids_of_storage_facilities_questions' : function() {
										return {
											name : 'IDs of questions regarding departmental, personal and archive storage',
											measure : createMeasure('id_of_staff_questions', {
												content : [
														'ArchiveStorage', 'DepartmentalStorage',
														'PersonalStorageCloseToYourDesk'
												]
											})
										}
									},
									// BMARK choices_of_storage_facilities_questions : Choices of
									// questions regarding departmental, personal and archive
									// storage
									'choices_of_storage_facilities_questions' : function() {
										return {
											name : 'How important are: departmental, personal and archive storage',
											measure : createMeasure(
													'table_prc',
													createMeasure(
															'no_of_staff_replies_per_choice_multi_q',
															{
																content : study.id
															},
															measures['ids_of_storage_facilities_questions']().measure,
															createMeasure(
																	'question_names',
																	measures['ids_of_storage_facilities_questions']
																			().measure)))
										}
									},
									// BMARK ids_of_it_facilities_questions : IDs of questions
									// regarding IT facilities
									'ids_of_it_facilities_questions' : function() {
										return {
											name : 'IDs of questions regarding IT facilities',
											measure : createMeasure('id_of_staff_questions', {
												content : [
														'DesktopComputer', 'Laptop',
														'VideoConferenceFacilitiesSuite',
														'DesktopTeleconferenceSkype'
												]
											})
										}
									},
									// BMARK choices_of_it_facilities_questions : Choices of
									// questions regarding IT facilities
									'choices_of_it_facilities_questions' : function() {
										return {
											name : 'How important are IT facilities',
											measure : createMeasure(
													'table_prc',
													createMeasure(
															'no_of_staff_replies_per_choice_multi_q',
															{
																content : study.id
															},
															measures['ids_of_it_facilities_questions']().measure,
															createMeasure(
																	'question_names',
																	measures['ids_of_it_facilities_questions']().measure)))
										}
									},
									// BMARK ids_of_activities_questions : IDs of questions under
									// XActivitiesSplit
									'ids_of_activities_questions' : function() {
										return {
											name : 'IDs of questions under XActivitiesSplit',
											measure : createMeasure('ids_of_questions_in_group', {
												content : 'XActivitiesSplit'
											})
										}
									},
									// BMARK choices_of_activities_questions : Choices of
									// questions under XActivitiesSplit
									'choices_of_activities_questions' : function() {
										return {
											name : 'Choices of questions under XActivitiesSplit',
											measure : createMeasure(
													'table_prc',
													createMeasure(
															'no_of_staff_replies_per_choice_multi_q',
															{
																content : study.id
															},
															measures['ids_of_activities_questions']().measure,
															createMeasure(
																	'question_names',
																	measures['ids_of_activities_questions']().measure)))
										}
									},
									// BMARK ids_of_facilities_importance_questions : IDs of
									// questions under XFacilitiesImportance
									'ids_of_facilities_importance_questions' : function() {
										return {
											name : 'IDs of questions under XFacilitiesImportance',
											measure : createMeasure('ids_of_questions_in_group', {
												content : 'XFacilitiesImportance'
											})
										}
									},
									// BMARK choices_of_facilities_importance_questions : Choices
									// of questions under XFacilitiesImportance
									'choices_of_facilities_importance_questions' : function() {
										return {
											name : 'Choices of questions under XFacilitiesImportance',
											measure : createMeasure(
													'table_prc',
													createMeasure(
															'no_of_staff_replies_per_choice_multi_q',
															{
																content : study.id
															},
															measures['ids_of_facilities_importance_questions']
																	().measure,
															createMeasure(
																	'question_names',
																	measures['ids_of_facilities_importance_questions']
																			().measure)))
										}
									},
									// BMARK ids_of_change_readiness_questions : IDs of
									// questions under XChangeReadiness
									'ids_of_change_readiness_questions' : function() {
										return {
											name : 'IDs of questions under XChangeReadiness',
											measure : createMeasure('ids_of_questions_in_group', {
												content : 'XChangeReadiness'
											})
										}
									},
									// BMARK choices_of_facilities_importance_questions : Choices
									// of questions under XChangeReadiness
									'choices_of_facilities_importance_questions' : function() {
										return {
											name : 'Choices of questions under XChangeReadiness',
											measure : createMeasure('table_prc',
													createMeasure(
															'no_of_staff_replies_per_choice_multi_q', {
																content : study.id
															}, measures['ids_of_change_readiness_questions']
																	().measure, createMeasure('question_names',
																	measures['ids_of_change_readiness_questions']
																			().measure)))
										}
									},
									// BMARK id_of_desk_space_question : ID of "DeskSpace"
									// question
									'id_of_desk_space_question' : function() {
										return {
											name : 'ID of "DeskSpace" question',
											measure : createMeasure('id_of_staff_question', {
												content : 'DeskSpace'
											})
										}
									},
									// BMARK no_of_responders_in_desk_space_question : Number of
									// responders in "DeskSpace" question
									'no_of_responders_in_desk_space_question' : function() {
										return {
											name : 'Number of responders in "DeskSpace" question',
											measure : createMeasure(
													'no_of_responders_for_choice_question_and_choices', {
														content : study.id
													}, measures['id_of_desk_space_question']().measure,
													createMeasure('possible_choices_in_question',
															measures['id_of_desk_space_question']().measure))
										}
									},
									// BMARK no_of_responders_quite_important_desk_space_question
									// : Number of responders who chose "Quite Important" in
									// "DeskSpace" question
									'no_of_responders_quite_important_desk_space_question' : function() {
										return {
											name : 'Number of responders who chose "Quite Important" in "DeskSpace" question',
											measure : createMeasure(
													'no_of_responders_for_choice_question_and_choices', {
														content : study.id
													}, measures['id_of_desk_space_question']().measure, {
														content : [
															'Quite important'
														]
													})
										}
									},
									// BMARK no_of_responders_very_important_desk_space_question :
									// Number of responders who chose "Very Important" in
									// "DeskSpace" question
									'no_of_responders_very_important_desk_space_question' : function() {
										return {
											name : 'Number of responders who chose "Very Important" in "DeskSpace" question',
											measure : createMeasure(
													'no_of_responders_for_choice_question_and_choices', {
														content : study.id
													}, measures['id_of_desk_space_question']().measure, {
														content : [
															'Very important'
														]
													})
										}
									},
									// BMARK
									// prc_of_responders_desk_space_is_quite_or_very_important : %
									// staff who think desk space is quite important or very
									// important
									'prc_of_responders_desk_space_is_quite_or_very_important' : function() {
										return {
											name : '% staff who think desk space is quite important or very important',
											no_of_decimals : 0,
											measure : createMeasure(
													'prc',
													createMeasure(
															'div',
															createMeasure(
																	'add',
																	measures['no_of_responders_quite_important_desk_space_question']
																			().measure,
																	measures['no_of_responders_very_important_desk_space_question']
																			().measure),
															measures['no_of_responders_in_desk_space_question']
																	().measure))
										}
									},
									// BMARK id_of_uninterrupted_work_question : ID of
									// "UninterruptedConcentratedWork" question
									'id_of_uninterrupted_work_question' : function() {
										return {
											name : 'ID of "UninterruptedConcentratedWork" question',
											measure : createMeasure('id_of_staff_question', {
												content : 'UninterruptedConcentratedWork'
											})
										}
									},
									// BMARK no_of_responders_in_uninterrupted_work_question :
									// Number of responders in "UninterruptedConcentratedWork"
									// question
									'no_of_responders_in_uninterrupted_work_question' : function() {
										return {
											name : 'Number of responders in "UninterruptedConcentratedWork" question',
											measure : createMeasure(
													'no_of_responders_for_choice_question_and_choices',
													{
														content : study.id
													},
													measures['id_of_uninterrupted_work_question']().measure,
													createMeasure(
															'possible_choices_in_question',
															measures['id_of_uninterrupted_work_question']().measure))
										}
									},
									// BMARK no_of_responders_a_lot_uninterrupted_work_question :
									// Number of responders who chose "A lot" in
									// "UninterruptedConcentratedWork" question
									'no_of_responders_a_lot_uninterrupted_work_question' : function() {
										return {
											name : 'Number of responders who chose "A lot" in "UninterruptedConcentratedWork" question',
											measure : createMeasure(
													'no_of_responders_for_choice_question_and_choices',
													{
														content : study.id
													},
													measures['id_of_uninterrupted_work_question']().measure,
													{
														content : [
															'A lot'
														]
													})
										}
									},
									// BMARK
									// no_of_responders_quite_a_lot_uninterrupted_work_question :
									// Number of responders who chose "Quite a lot" in
									// "UninterruptedConcentratedWork" question
									'no_of_responders_quite_a_lot_uninterrupted_work_question' : function() {
										return {
											name : 'Number of responders who chose "Quite a lot" in "UninterruptedConcentratedWork" question',
											measure : createMeasure(
													'no_of_responders_for_choice_question_and_choices',
													{
														content : study.id
													},
													measures['id_of_uninterrupted_work_question']().measure,
													{
														content : [
															'Quite a lot'
														]
													})
										}
									},
									// BMARK
									// prc_of_responders_uninterrupted_work_is_quite_or_very_important
									// : % respondents who think uninterrupted concentrated work
									// is ‘a lot’ or ‘quite a lot’ a requirement of their job role
									'prc_of_responders_uninterrupted_work_is_quite_or_very_important' : function() {
										return {
											name : '% respondents who think uninterrupted concentrated work is ‘a lot’ or ‘quite a lot’ a requirement of their job role',
											measure : createMeasure(
													'prc',
													createMeasure(
															'div',
															createMeasure(
																	'add',
																	measures['no_of_responders_a_lot_uninterrupted_work_question']
																			().measure,
																	measures['no_of_responders_quite_a_lot_uninterrupted_work_question']
																			().measure),
															measures['no_of_responders_in_uninterrupted_work_question']
																	().measure))
										}
									},
									// BMARK id_of_pre_planned_meetings_question_with_externals :
									// ID of "DeskSpace" question
									'id_of_pre_planned_meetings_question_with_externals' : function() {
										return {
											name : 'ID of "DeskSpace" question',
											measure : createMeasure('id_of_staff_question', {
												content : 'InPreplannedMeetingsWhichInclude'
											})
										}
									},

									'no_of_responders_in_pre_planned_meeting_question' : function() {
										return {
											name : 'Number of responders in "DeskSpace" question',
											measure : createMeasure(
													'no_of_responders_for_choice_question_and_choices',
													{
														content : study.id
													},
													measures['id_of_pre_planned_meetings_question_with_externals']
															().measure,
													createMeasure(
															'possible_choices_in_question',
															measures['id_of_pre_planned_meetings_question_with_externals']
																	().measure))
										}
									},
									// BMARK
									// prc_of_responders_in_pre_planned_meetings_with_externals :
									// % staff (responders) who rate >0% time in pre-planned
									// meetings including external visitors (q:
									// InPreplannedMeetingsWhichInclude)
									'prc_of_responders_in_pre_planned_meetings_with_externals' : function() {
										return {
											name : '% staff (responders) who rate >0% time in pre-planned meetings including external visitors (q: InPreplannedMeetingsWhichInclude)',
											measure : createMeasure(
													'prc',
													createMeasure(
															'div',
															createMeasure(
																	'no_of_staff_replies_within_marks',
																	{
																		content : study.id
																	},
																	measures['id_of_pre_planned_meetings_question_with_externals']
																			().measure, {
																		content : 1
																	}, {
																		content : 101
																	}),
															measures['no_of_responders_in_pre_planned_meeting_question']
																	().measure))
										}
									},
									// BMARK
									// prc_of_responders_in_pre_planned_meetings_with_externals_over_10_prc
									// : % staff (responders) who rate >10% time in pre-planned
									// meetings including external visitors (q:
									// InPreplannedMeetingsWhichInclude)
									'prc_of_responders_in_pre_planned_meetings_with_externals_over_10_prc' : function() {
										return {
											name : '% staff (responders) who rate >10% time in pre-planned meetings including external visitors (q: InPreplannedMeetingsWhichInclude)',
											measure : createMeasure(
													'prc',
													createMeasure(
															'div',
															createMeasure(
																	'no_of_staff_replies_within_marks',
																	{
																		content : study.id
																	},
																	measures['id_of_pre_planned_meetings_question_with_externals']
																			().measure, {
																		content : 9
																	}, {
																		content : 101
																	}),
															measures['no_of_responders_in_pre_planned_meeting_question']
																	().measure))
										}
									},
									// BMARK no_of_staff_per_tea_point : Total headcount per tea
									// point
									'no_of_staff_per_tea_point' : function() {
										return {
											name : 'Total headcount per tea point',
											measure : createMeasure('div',
													measures['no_of_staff']().measure,
													measures['no_of_tea_points']().measure)
										}
									},
									// BMARK avg_ties_in_team : Average number of ties within team
									'avg_ties_in_team' : function() {
										return {
											name : 'Average number of ties within team',
											measure : createMeasure('avg_ties_in_team', {
												content : study.id
											}, measures['staff_relationship_question_id']().measure)
										}
									},
									// BMARK avg_ties_outside_team : Average number of ties
									// outside team
									'avg_ties_outside_team' : function() {
										return {
											name : 'Average number of ties outside team',
											measure : createMeasure('avg_ties_outside_team', {
												content : study.id
											}, measures['staff_relationship_question_id']().measure)
										}
									},
									// BMARK avg_possible_ties_in_team : Average possible number
									// of ties within team
									'avg_possible_ties_in_team' : function() {
										return {
											name : 'Average possible number of ties within team',
											measure : createMeasure('avg_possible_ties_in_team', {
												content : study.id
											})
										}
									},
									// BMARK avg_possible_ties_outside_team : Average possible
									// number of ties outside team
									'avg_possible_ties_outside_team' : function() {
										return {
											name : 'Average possible number of ties outside team',
											measure : createMeasure('avg_possible_ties_outside_team',
													{
														content : study.id
													})
										}
									},

									// 'no_of_unplanned_contacts_per_score' : function() {
									// return {
									// name : "Number of unplanned contacts per frequency of
									// contact",
									// measure : createMeasure(
									// 'no_of_staff_ties_of_question_per_score', {
									// content : study.id
									// }, createMeasure('id_of_staff_question', {
									// content : 'XUnplannedFrequencyFace'
									// }))
									// }
									// },
									// 'no_of_planned_contacts_per_score_within_team' : function()
									// {
									// return {
									// name : "Number of planned contacts per frequency of contact
									// within team",
									// measure : createMeasure(
									// 'no_of_staff_ties_within_team_per_score', {
									// content : study.id
									// }, createMeasure('id_of_staff_question', {
									// content : 'XPlannedFrequencyFace'
									// }))
									// }
									// },

									'no_of_unique_undirected_ties_outside_team' : function() {
										return {
											name : "Number of unique undirected number of ties outside team",
											measure : createMeasure(
													'no_of_unique_undir_staff_ties_outside_team_of_score',
													{
														content : study.id
													}, createMeasure('id_of_staff_questions', {
														content : [
																'XPlannedFrequencyFace',
																'XUnplannedFrequencyFace'
														]
													}), {
														content : 0
													}, {
														content : 4
													})
										}
									},

									'no_of_unique_undirected_ties_within_team' : function() {
										return {
											name : "Number of unique undirected number of ties within team",
											measure : createMeasure(
													'no_of_unique_undir_staff_ties_within_team_of_score',
													{
														content : study.id
													}, createMeasure('id_of_staff_questions', {
														content : [
																'XPlannedFrequencyFace',
																'XUnplannedFrequencyFace'
														]
													}), {
														content : 0
													}, {
														content : 4
													})
										}
									},

									'no_of_possible_ties_outside_team' : function() {
										return {
											name : "Number of possible number of ties outside team",
											measure : createMeasure(
													'no_of_possible_staff_ties_outside_team', {
														content : study.id
													})
										}
									},

									'no_of_possible_ties_within_team' : function() {
										return {
											name : "Number of possible number of ties within team",
											measure : createMeasure(
													'no_of_possible_staff_ties_within_team', {
														content : study.id
													})
										}
									},

									'yules_q_team' : function() {
										return {
											name : 'Yule\'s Q team',
											description : 'Yule’s Q as calculated by the Homophily '
													+ 'routine and derived from the odds ratio, which maps '
													+ 'perfect homophily (+1) and perfect heterophily (-1) '
													+ 'by (𝐼𝐿×𝑁𝐸𝐿−𝐸𝐿×𝑁𝐼𝐿) / (𝐼𝐿×𝑁𝐸𝐿+𝐸𝐿×𝑁𝐼𝐿) , where [in an '
													+ 'undirected graph] IL is the number of internal links,'
													+ ' EL the number of external links, NIL the number of '
													+ 'non-links internally and NEL the number of non-links externally',
											measure : //
											createMeasure(
													'div',
													createMeasure(
															'sub',
															createMeasure(
																	'mult',
																	measures['no_of_unique_undirected_ties_within_team']
																			().measure,
																	createMeasure(
																			'sub',
																			measures['no_of_possible_ties_outside_team']
																					().measure,
																			measures['no_of_unique_undirected_ties_outside_team']
																					().measure)//
															),
															createMeasure(
																	'mult',
																	measures['no_of_unique_undirected_ties_outside_team']
																			().measure,
																	createMeasure(
																			'sub',
																			measures['no_of_possible_ties_within_team']
																					().measure,
																			measures['no_of_unique_undirected_ties_within_team']
																					().measure)//
															)//
													),
													createMeasure(
															'add',
															createMeasure(
																	'mult',
																	measures['no_of_unique_undirected_ties_within_team']
																			().measure,
																	createMeasure(
																			'sub',
																			measures['no_of_possible_ties_outside_team']
																					().measure,
																			measures['no_of_unique_undirected_ties_outside_team']
																					().measure)),
															createMeasure(
																	'mult',
																	measures['no_of_unique_undirected_ties_outside_team']
																			().measure,
																	createMeasure(
																			'sub',
																			measures['no_of_possible_ties_within_team']
																					().measure,
																			measures['no_of_unique_undirected_ties_within_team']
																					().measure))) //
											)
										}
									},
									// BMARK avg_ties_in_floor : Average number of ties within
									// floor
									'avg_ties_in_floor' : function() {
										return {
											name : 'Average number of ties within floor',
											measure : createMeasure('avg_ties_in_floor', {
												content : study.id
											}, measures['staff_relationship_question_id']().measure)
										}
									},
									// BMARK avg_ties_outside_floor : Average number of ties
									// outside floor
									'avg_ties_outside_floor' : function() {
										return {
											name : 'Average number of ties outside floor',
											measure : createMeasure('avg_ties_outside_floor', {
												content : study.id
											}, measures['staff_relationship_question_id']().measure)
										}
									},
									// BMARK avg_possible_ties_in_floor : Average possible number
									// of ties within floor
									'avg_possible_ties_in_floor' : function() {
										return {
											name : 'Average possible number of ties within floor',
											measure : createMeasure('avg_possible_ties_in_floor', {
												content : study.id
											})
										}
									},
									// BMARK avg_possible_ties_outside_floor : Average possible
									// number of ties outside floor
									'avg_possible_ties_outside_floor' : function() {
										return {
											name : 'Average possible number of ties outside floor',
											measure : createMeasure(
													'avg_possible_ties_outside_floor', {
														content : study.id
													})
										}
									},
									// BMARK avg_ties_in_building : Average number of ties within
									// building
									'avg_ties_in_building' : function() {
										return {
											name : 'Average number of ties within building',
											measure : createMeasure('avg_ties_in_building', {
												content : study.id
											}, measures['staff_relationship_question_id']().measure)
										}
									},
									// BMARK avg_ties_outside_building : Average number of ties
									// outside building
									'avg_ties_outside_building' : function() {
										return {
											name : 'Average number of ties outside building',
											measure : createMeasure('avg_ties_outside_building', {
												content : study.id
											}, measures['staff_relationship_question_id']().measure)
										}
									},
									// BMARK avg_possible_ties_in_building : Average possible
									// number of ties within building
									'avg_possible_ties_in_building' : function() {
										return {
											name : 'Average possible number of ties within building',
											measure : createMeasure('avg_possible_ties_in_building',
													{
														content : study.id
													})
										}
									},
									// BMARK avg_possible_ties_outside_building : Average possible
									// number of ties outside building
									'avg_possible_ties_outside_building' : function() {
										return {
											name : 'Average possible number of ties outside building',
											measure : createMeasure(
													'avg_possible_ties_outside_building', {
														content : study.id
													})
										}
									},
									// BMARK quotes_under_hierarchy_suitably_reinforced_by_space :
									// Quotes under issue: Hierarchy suitably reinforced by space
									'quotes_under_hierarchy_suitably_reinforced_by_space' : function() {
										return {
											name : 'Quotes under issue: Hierarchy suitably reinforced by space',
											measure : createMeasure('quotes_under_issue_flagged', {
												content : study.id
											}, createMeasure('id_of_interview_issue', {
												content : 'Hierarchy suitably reinforced by space'
											}))
										}
									},
									// BMARK quotes_under_efficient_desk_occupation : Quotes under
									// issue: Efficient desk occupation
									'quotes_under_efficient_desk_occupation' : function() {
										return {
											name : 'Quotes under issue: Efficient desk occupation',
											measure : createMeasure('quotes_under_issue_flagged', {
												content : study.id
											}, createMeasure('id_of_interview_issue', {
												content : 'Efficient desk occupation'
											}))
										}
									},
									// BMARK Appropriate movement levels in the right places :
									// Quotes under issue: Appropriate movement levels in the
									// right places
									'Appropriate movement levels in the right places' : function() {
										return {
											name : 'Quotes under issue: Appropriate movement levels in the right places',
											measure : createMeasure(
													'quotes_under_issue_flagged',
													{
														content : study.id
													},
													createMeasure(
															'id_of_interview_issue',
															{
																content : 'Appropriate movement levels in the right places'
															}))
										}
									},
									// BMARK Appropriate workspace densities : Quotes under issue:
									// Appropriate workspace densities
									'Appropriate workspace densities' : function() {
										return {
											name : 'Quotes under issue: Appropriate workspace densities',
											measure : createMeasure('quotes_under_issue_flagged', {
												content : study.id
											}, createMeasure('id_of_interview_issue', {
												content : 'Appropriate workspace densities'
											}))
										}
									},
									// BMARK Attitude to open plan and flexible working : Quotes
									// under issue: Attitude to open plan and flexible working
									'Attitude to open plan and flexible working' : function() {
										return {
											name : 'Quotes under issue: Attitude to open plan and flexible working',
											measure : createMeasure('quotes_under_issue_flagged', {
												content : study.id
											}, createMeasure('id_of_interview_issue', {
												content : 'Attitude to open plan and flexible working'
											}))
										}
									},
									// BMARK Awareness and willingness to change : Quotes under
									// issue: Awareness and willingness to change
									'Awareness and willingness to change' : function() {
										return {
											name : 'Quotes under issue: Awareness and willingness to change',
											measure : createMeasure('quotes_under_issue_flagged', {
												content : study.id
											}, createMeasure('id_of_interview_issue', {
												content : 'Awareness and willingness to change'
											}))
										}
									},
									// BMARK Balance between local and global interaction : Quotes
									// under issue: Balance between local and global interaction
									'Balance between local and global interaction' : function() {
										return {
											name : 'Quotes under issue: Balance between local and global interaction',
											measure : createMeasure(
													'quotes_under_issue_flagged',
													{
														content : study.id
													},
													createMeasure(
															'id_of_interview_issue',
															{
																content : 'Balance between local and global interaction'
															}))
										}
									},
									// BMARK Collaboration supported by space : Quotes under
									// issue: Collaboration supported by space
									'Collaboration supported by space' : function() {
										return {
											name : 'Quotes under issue: Collaboration supported by space',
											measure : createMeasure('quotes_under_issue_flagged', {
												content : study.id
											}, createMeasure('id_of_interview_issue', {
												content : 'Collaboration supported by space'
											}))
										}
									},
									// BMARK Staff drivers for change : Quotes under issue: Staff
									// drivers for change
									'Staff drivers for change' : function() {
										return {
											name : 'Quotes under issue: Staff drivers for change',
											measure : createMeasure('quotes_under_issue_flagged', {
												content : study.id
											}, createMeasure('id_of_interview_issue', {
												content : 'Staff drivers for change'
											}))
										}
									},
									// BMARK Space reflects organisational identity : Quotes under
									// issue: Space reflects organisational identity
									'Space reflects organisational identity' : function() {
										return {
											name : 'Quotes under issue: Space reflects organisational identity',
											measure : createMeasure('quotes_under_issue_flagged', {
												content : study.id
											}, createMeasure('id_of_interview_issue', {
												content : 'Space reflects organisational identity'
											}))
										}
									},
									// BMARK Suitability of storage : Quotes under issue:
									// Suitability of storage
									'Suitability of storage' : function() {
										return {
											name : 'Quotes under issue: Suitability of storage',
											measure : createMeasure('quotes_under_issue_flagged', {
												content : study.id
											}, createMeasure('id_of_interview_issue', {
												content : 'Suitability of storage'
											}))
										}
									},
									// BMARK People can have visible contact of whole business :
									// Quotes under issue: People can have visible contact of
									// whole business
									'People can have visible contact of whole business' : function() {
										return {
											name : 'Quotes under issue: People can have visible contact of whole business',
											measure : createMeasure(
													'quotes_under_issue_flagged',
													{
														content : study.id
													},
													createMeasure(
															'id_of_interview_issue',
															{
																content : 'People can have visible contact of whole business'
															}))
										}
									},
									// BMARK Efficient primary circulation : Quotes under issue:
									// Efficient primary circulation
									'Efficient primary circulation' : function() {
										return {
											name : 'Quotes under issue: Efficient primary circulation',
											measure : createMeasure('quotes_under_issue_flagged', {
												content : study.id
											}, createMeasure('id_of_interview_issue', {
												content : 'Efficient primary circulation'
											}))
										}
									},
									// BMARK Opportunities for unplanned interaction : Quotes
									// under issue: Opportunities for unplanned interaction
									'Opportunities for unplanned interaction' : function() {
										return {
											name : 'Quotes under issue: Opportunities for unplanned interaction',
											measure : createMeasure('quotes_under_issue_flagged', {
												content : study.id
											}, createMeasure('id_of_interview_issue', {
												content : 'Opportunities for unplanned interaction'
											}))
										}
									},
									// BMARK Team locations : Quotes under issue: Team locations
									'Team locations' : function() {
										return {
											name : 'Quotes under issue: Team locations',
											measure : createMeasure('quotes_under_issue_flagged', {
												content : study.id
											}, createMeasure('id_of_interview_issue', {
												content : 'Team locations'
											}))
										}
									},
									// BMARK Visitor experience : Quotes under issue: Visitor
									// experience
									'Visitor experience' : function() {
										return {
											name : 'Quotes under issue: Visitor experience',
											measure : createMeasure('quotes_under_issue_flagged', {
												content : study.id
											}, createMeasure('id_of_interview_issue', {
												content : 'Visitor experience'
											}))
										}
									},
									// BMARK IT supports desired working practices : Quotes under
									// issue: IT supports desired working practices
									'IT supports desired working practices' : function() {
										return {
											name : 'Quotes under issue: IT supports desired working practices',
											measure : createMeasure('quotes_under_issue_flagged', {
												content : study.id
											}, createMeasure('id_of_interview_issue', {
												content : 'IT supports desired working practices'
											}))
										}
									},
									// BMARK Spatial efficiency of bookable meeting rooms : Quotes
									// under issue: Spatial efficiency of bookable meeting rooms
									'Spatial efficiency of bookable meeting rooms' : function() {
										return {
											name : 'Quotes under issue: Spatial efficiency of bookable meeting rooms',
											measure : createMeasure(
													'quotes_under_issue_flagged',
													{
														content : study.id
													},
													createMeasure(
															'id_of_interview_issue',
															{
																content : 'Spatial efficiency of bookable meeting rooms'
															}))
										}
									},
									// BMARK Location of specialist shared facilities : Quotes
									// under issue: Location of specialist shared facilities
									'Location of specialist shared facilities' : function() {
										return {
											name : 'Quotes under issue: Location of specialist shared facilities',
											measure : createMeasure('quotes_under_issue_flagged', {
												content : study.id
											}, createMeasure('id_of_interview_issue', {
												content : 'Location of specialist shared facilities'
											}))
										}
									},
									// BMARK Space planned to suit occupancy levels : Quotes under
									// issue: Space planned to suit occupancy levels
									'Space planned to suit occupancy levels' : function() {
										return {
											name : 'Quotes under issue: Space planned to suit occupancy levels',
											measure : createMeasure('quotes_under_issue_flagged', {
												content : study.id
											}, createMeasure('id_of_interview_issue', {
												content : 'Space planned to suit occupancy levels'
											}))
										}
									},
									// BMARK Spatial efficiency of alternative spaces : Quotes
									// under issue: Spatial efficiency of alternative spaces
									'Spatial efficiency of alternative spaces' : function() {
										return {
											name : 'Quotes under issue: Spatial efficiency of alternative spaces',
											measure : createMeasure('quotes_under_issue_flagged', {
												content : study.id
											}, createMeasure('id_of_interview_issue', {
												content : 'Spatial efficiency of alternative spaces'
											}))
										}
									},
									// BMARK Space suits future organisation structure : Quotes
									// under issue: Space suits future organisation structure
									'Space suits future organisation structure' : function() {
										return {
											name : 'Quotes under issue: Space suits future organisation structure',
											measure : createMeasure('quotes_under_issue_flagged', {
												content : study.id
											}, createMeasure('id_of_interview_issue', {
												content : 'Space suits future organisation structure'
											}))
										}
									},
									// BMARK Spatial suitability for key business processes :
									// Quotes under issue: Spatial suitability for key business
									// processes
									'Spatial suitability for key business processes' : function() {
										return {
											name : 'Quotes under issue: Spatial suitability for key business processes',
											measure : createMeasure(
													'quotes_under_issue_flagged',
													{
														content : study.id
													},
													createMeasure(
															'id_of_interview_issue',
															{
																content : 'Spatial suitability for key business processes'
															}))
										}
									},
									// BMARK
									// stakeholder_cultural_preferences_static_flexible_working_current
									// : Stakeholder cultural preferences for static or flexible
									// working (Current)
									'stakeholder_cultural_preferences_static_flexible_working_current' : function() {
										return {
											name : 'Stakeholder cultural preferences for static or flexible working (Current)',
											measure : createMeasure('sum_of_interview_choice_scores',
													{
														content : study.id
													}, createMeasure('id_of_interview_question', {
														content : 'Current'
													}, {
														content : 'Static / Flexible'
													}))
										}
									},
									// BMARK
									// stakeholder_cultural_preferences_static_flexible_working_future
									// : Stakeholder cultural preferences for static or flexible
									// working (Future)
									'stakeholder_cultural_preferences_static_flexible_working_future' : function() {
										return {
											name : 'Stakeholder cultural preferences for static or flexible working (Future)',
											measure : createMeasure('sum_of_interview_choice_scores',
													{
														content : study.id
													}, createMeasure('id_of_interview_question', {
														content : 'Future'
													}, {
														content : 'Static / Flexible'
													}))
										}
									},
									// BMARK
									// stakeholder_cultural_preferences_risky_cautious_current :
									// Stakeholder cultural preferences for risk-taking or caution
									// (Current)
									'stakeholder_cultural_preferences_risky_cautious_current' : function() {
										return {
											name : 'Stakeholder cultural preferences for risk-taking or caution (Current)',
											measure : createMeasure('sum_of_interview_choice_scores',
													{
														content : study.id
													}, createMeasure('id_of_interview_question', {
														content : 'Current'
													}, {
														content : 'Risk / Cautious'
													}))
										}
									},
									// BMARK
									// stakeholder_cultural_preferences_risky_cautious_future :
									// Stakeholder cultural preferences for risk-taking or caution
									// (Future)
									'stakeholder_cultural_preferences_risky_cautious_future' : function() {
										return {
											name : 'Stakeholder cultural preferences for risk-taking or caution (Future)',
											measure : createMeasure('sum_of_interview_choice_scores',
													{
														content : study.id
													}, createMeasure('id_of_interview_question', {
														content : 'Future'
													}, {
														content : 'Risk / Cautious'
													}))
										}
									},
									// BMARK
									// stakeholder_cultural_preferences_alone_together_current :
									// Stakeholder cultural preferences for working alone or
									// together (Current)
									'stakeholder_cultural_preferences_alone_together_current' : function() {
										return {
											name : 'Stakeholder cultural preferences for working alone or together (Current)',
											measure : createMeasure('sum_of_interview_choice_scores',
													{
														content : study.id
													}, createMeasure('id_of_interview_question', {
														content : 'Current'
													}, {
														content : 'Alone / Together'
													}))
										}
									},
									// BMARK
									// stakeholder_cultural_preferences_alone_together_future :
									// Stakeholder cultural preferences for working alone or
									// together (Future)
									'stakeholder_cultural_preferences_alone_together_future' : function() {
										return {
											name : 'Stakeholder cultural preferences for working alone or together (Future)',
											measure : createMeasure('sum_of_interview_choice_scores',
													{
														content : study.id
													}, createMeasure('id_of_interview_question', {
														content : 'Future'
													}, {
														content : 'Alone / Together'
													}))
										}
									},
									// BMARK
									// stakeholder_cultural_preferences_formal_informal_current :
									// Visual of preferences from stakeholder interviews for
									// formality or informality (Current)
									'stakeholder_cultural_preferences_formal_informal_current' : function() {
										return {
											name : 'Visual of preferences from stakeholder interviews for formality or informality (Current)',
											measure : createMeasure('sum_of_interview_choice_scores',
													{
														content : study.id
													}, createMeasure('id_of_interview_question', {
														content : 'Current'
													}, {
														content : 'Formal / Informal'
													}))
										}
									},
									// BMARK
									// stakeholder_cultural_preferences_formal_informal_future :
									// Visual of preferences from stakeholder interviews for
									// formality or informality (Future)
									'stakeholder_cultural_preferences_formal_informal_future' : function() {
										return {
											name : 'Visual of preferences from stakeholder interviews for formality or informality (Future)',
											measure : createMeasure('sum_of_interview_choice_scores',
													{
														content : study.id
													}, createMeasure('id_of_interview_question', {
														content : 'Future'
													}, {
														content : 'Formal / Informal'
													}))
										}
									},
									// BMARK
									// stakeholder_cultural_preferences_organised_chaos_current :
									// Stakeholder cultural preference for organised or organised
									// chaos (Current)
									'stakeholder_cultural_preferences_organised_chaos_current' : function() {
										return {
											name : 'Stakeholder cultural preference for organised or organised chaos (Current)',
											measure : createMeasure('sum_of_interview_choice_scores',
													{
														content : study.id
													}, createMeasure('id_of_interview_question', {
														content : 'Current'
													}, {
														content : 'Organised / Chaos'
													}))
										}
									},
									// BMARK
									// stakeholder_cultural_preferences_organised_chaos_future :
									// Stakeholder cultural preference for organised or organised
									// chaos (Future)
									'stakeholder_cultural_preferences_organised_chaos_future' : function() {
										return {
											name : 'Stakeholder cultural preference for organised or organised chaos (Future)',
											measure : createMeasure('sum_of_interview_choice_scores',
													{
														content : study.id
													}, createMeasure('id_of_interview_question', {
														content : 'Future'
													}, {
														content : 'Organised / Chaos'
													}))
										}
									},
									// BMARK no_of_planned_contacts_per_score : Number of planned
									// contacts per frequency of contact
									'no_of_planned_contacts_per_score' : function() {
										return {
											name : 'Number of planned contacts per frequency of contact',
											measure : createMeasure(
													'no_of_staff_ties_of_question_per_score', {
														content : study.id
													}, createMeasure('id_of_staff_question', {
														content : 'XPlannedFrequencyFace'
													}))
										}
									},
									// BMARK no_of_unplanned_contacts_per_score : Number of
									// unplanned contacts per frequency of contact
									'no_of_unplanned_contacts_per_score' : function() {
										return {
											name : 'Number of unplanned contacts per frequency of contact',
											measure : createMeasure(
													'no_of_staff_ties_of_question_per_score', {
														content : study.id
													}, createMeasure('id_of_staff_question', {
														content : 'XUnplannedFrequencyFace'
													}))
										}
									},
									// BMARK
									// no_of_planned_and_unplanned_contacts_per_score_within_team
									// : Number of planned and unplanned contacts per frequency of
									// contact within team
									'no_of_planned_and_unplanned_contacts_per_score_within_team' : function() {
										return {
											name : 'Number of planned and unplanned contacts per frequency of contact within team',
											measure : createMeasure(
													'no_of_staff_ties_within_team_per_score', {
														content : study.id
													}, createMeasure('id_of_staff_questions', {
														content : [
																'XPlannedFrequencyFace',
																'XUnplannedFrequencyFace'
														]
													}))
										}
									},
									// BMARK
									// no_of_planned_and_unplanned_contacts_per_score_outside_team
									// : Number of planned and unplanned contacts per frequency of
									// contact outside team
									'no_of_planned_and_unplanned_contacts_per_score_outside_team' : function() {
										return {
											name : 'Number of planned and unplanned contacts per frequency of contact outside team',
											measure : createMeasure(
													'no_of_staff_ties_outside_team_per_score', {
														content : study.id
													}, createMeasure('id_of_staff_questions', {
														content : [
																'XPlannedFrequencyFace',
																'XUnplannedFrequencyFace'
														]
													}))
										}
									},
									// BMARK
									// no_of_planned_and_unplanned_contacts_per_score_within_floor
									// : Number of planned and unplanned contacts per frequency of
									// contact within floor
									'no_of_planned_and_unplanned_contacts_per_score_within_floor' : function() {
										return {
											name : 'Number of planned and unplanned contacts per frequency of contact within floor',
											measure : createMeasure(
													'no_of_staff_ties_within_floor_per_score', {
														content : study.id
													}, createMeasure('id_of_staff_questions', {
														content : [
																'XPlannedFrequencyFace',
																'XUnplannedFrequencyFace'
														]
													}))
										}
									},
									// BMARK
									// no_of_planned_and_unplanned_contacts_per_score_outside_floor
									// : Number of planned and unplanned contacts per frequency of
									// contact outside floor
									'no_of_planned_and_unplanned_contacts_per_score_outside_floor' : function() {
										return {
											name : 'Number of planned and unplanned contacts per frequency of contact outside floor',
											measure : createMeasure(
													'no_of_staff_ties_outside_floor_per_score', {
														content : study.id
													}, createMeasure('id_of_staff_questions', {
														content : [
																'XPlannedFrequencyFace',
																'XUnplannedFrequencyFace'
														]
													}))
										}
									},
									// BMARK
									// no_of_planned_and_unplanned_contacts_per_score_within_building
									// : Number of planned and unplanned contacts per frequency of
									// contact within building
									'no_of_planned_and_unplanned_contacts_per_score_within_building' : function() {
										return {
											name : 'Number of planned and unplanned contacts per frequency of contact within building',
											measure : createMeasure(
													'no_of_staff_ties_within_building_per_score', {
														content : study.id
													}, createMeasure('id_of_staff_questions', {
														content : [
																'XPlannedFrequencyFace',
																'XUnplannedFrequencyFace'
														]
													}))
										}
									},
									// BMARK
									// no_of_planned_and_unplanned_contacts_per_score_outside_building
									// : Number of planned and unplanned contacts per frequency of
									// contact outside building
									'no_of_planned_and_unplanned_contacts_per_score_outside_building' : function() {
										return {
											name : 'Number of planned and unplanned contacts per frequency of contact outside building',
											measure : createMeasure(
													'no_of_staff_ties_outside_building_per_score', {
														content : study.id
													}, createMeasure('id_of_staff_questions', {
														content : [
																'XPlannedFrequencyFace',
																'XUnplannedFrequencyFace'
														]
													}))
										}
									},
									// BMARK avg_accessibility_mean_depth_of_printers : Average
									// accessibility mean depth of printer areas
									'avg_accessibility_mean_depth_of_printers' : function() {
										return {
											name : 'Average accessibility mean depth of printer areas',
											measure : createMeasure(
													'avg_depthmap_value_of_poly_type', createMeasure(
															'id_of_poly_types', {
																content : 'func'
															}, {
																content : 'OTHFCL-PRC'
															}), createMeasure('id_of_depthmaps', {
														content : // 39
														study.id
													}, {
														content : 'Accessibility'
													}), {
														content : 'Visual Mean Depth'
													})
										}
									},
									// BMARK avg_accessibility_mean_depth_of_teapoints : Average
									// accessibility mean depth of teapoint areas
									'avg_accessibility_mean_depth_of_teapoints' : function() {
										return {
											name : 'Average accessibility mean depth of teapoint areas',
											measure : createMeasure(
													'avg_depthmap_value_of_poly_type', createMeasure(
															'id_of_poly_types', {
																content : 'func'
															}, {
																content : 'OTHFCL-TEA'
															}), createMeasure('id_of_depthmaps', {
														content : // 39
														study.id
													}, {
														content : 'Accessibility'
													}), {
														content : 'Visual Mean Depth'
													})
										}
									},
									// BMARK avg_accessibility_mean_depth_of_canteens : Average
									// accessibility mean depth of canteen areas
									'avg_accessibility_mean_depth_of_canteens' : function() {
										return {
											name : 'Average accessibility mean depth of canteen areas',
											measure : createMeasure(
													'avg_depthmap_value_of_poly_type', createMeasure(
															'id_of_poly_types', {
																content : 'func'
															}, {
																content : 'OTHFCL-CAN'
															}), createMeasure('id_of_depthmaps', {
														content : // 39
														study.id
													}, {
														content : 'Accessibility'
													}), {
														content : 'Visual Mean Depth'
													})
										}
									},
									// BMARK avg_accessibility_mean_depth_of_social_hubs : Average
									// accessibility mean depth of social hub areas
									'avg_accessibility_mean_depth_of_social_hubs' : function() {
										return {
											name : 'Average accessibility mean depth of social hub areas',
											measure : createMeasure(
													'avg_depthmap_value_of_poly_type', createMeasure(
															'id_of_poly_types', {
																content : 'func'
															}, {
																content : 'OTHFCL-SCH'
															}), createMeasure('id_of_depthmaps', {
														content : // 39
														study.id
													}, {
														content : 'Accessibility'
													}), {
														content : 'Visual Mean Depth'
													})
										}
									},
									// BMARK names_of_teams_polygons : All team polygons
									'names_of_teams_polygons' : function() {
										return {
											name : 'All team polygons',
											measure : createMeasure('poly_types_names',
													measures['ids_of_team_polygons']().measure)
										}
									},
									// BMARK avg_accessibility_mean_depth_per_team : Average
									// accessibility mean depth per team
									'avg_accessibility_mean_depth_per_team' : function() {
										return {
											name : 'Average accessibility mean depth per team',
											measure : createMeasure(
													'avg_depthmap_value_per_poly_type',
													measures['ids_of_team_polygons']().measure,
													createMeasure('id_of_depthmaps', {
														content : // 39
														study.id
													}, {
														content : 'Accessibility'
													}), {
														content : 'Visual Mean Depth'
													}, measures['names_of_teams_polygons']().measure)
										}
									},
									// BMARK avg_accessibility_mean_depth : Average accessibility
									// mean depth
									'avg_accessibility_mean_depth' : function() {
										return {
											name : 'Average accessibility mean depth',
											measure : createMeasure('avg_depthmap_value',
													createMeasure('id_of_depthmaps', {
														content : // 39
														study.id
													}, {
														content : 'Accessibility'
													}), {
														content : 'Visual Mean Depth'
													})
										}
									},
									// BMARK max_accessibility_mean_depth : Maximum accessibility
									// mean depth
									'max_accessibility_mean_depth' : function() {
										return {
											name : 'Maximum accessibility mean depth',
											measure : createMeasure('max_depthmap_value',
													createMeasure('id_of_depthmaps', {
														content : // 39
														study.id
													}, {
														content : 'Accessibility'
													}), {
														content : 'Visual Mean Depth'
													})
										}
									},
									// BMARK min_accessibility_mean_depth : Minimum accessibility
									// mean depth
									'min_accessibility_mean_depth' : function() {
										return {
											name : 'Minimum accessibility mean depth',
											measure : createMeasure('min_depthmap_value',
													createMeasure('id_of_depthmaps', {
														content : // 39
														study.id
													}, {
														content : 'Accessibility'
													}), {
														content : 'Visual Mean Depth'
													})
										}
									},
									// BMARK avg_visibility_mean_depth : Average vibility mean
									// depth
									'avg_visibility_mean_depth' : function() {
										return {
											name : 'Average vibility mean depth',
											measure : createMeasure('avg_depthmap_value',
													createMeasure('id_of_depthmaps', {
														content : // 39
														study.id
													}, {
														content : 'Visibility'
													}), {
														content : 'Visual Mean Depth'
													})
										}
									},
									// BMARK avg_essence_mean_depth : Average essence mean depth
									'avg_essence_mean_depth' : function() {
										return {
											name : 'Average essence mean depth',
											measure : createMeasure('avg_depthmap_value',
													createMeasure('id_of_depthmaps', {
														content : // 39
														study.id
													}, {
														content : 'Essence'
													}), {
														content : 'Visual Mean Depth'
													})
										}
									},
									// BMARK step_depth_essence_to_visibility : Step depth change:
									// Essence to visibility
									'step_depth_essence_to_visibility' : function() {
										return {
											name : 'Step depth change: Essence to visibility',
											measure : createMeasure('sub',
													measures['avg_visibility_mean_depth']().measure,
													measures['avg_essence_mean_depth']().measure)
										}
									},
									// BMARK step_depth_essence_to_accessibility : Step depth
									// change; Essence to Accessibility
									'step_depth_essence_to_accessibility' : function() {
										return {
											name : 'Step depth change; Essence to Accessibility',
											measure : createMeasure('sub',
													measures['avg_accessibility_mean_depth']().measure,
													measures['avg_essence_mean_depth']().measure)
										}
									},
									// BMARK avg_accessibility_mean_depth_per_building : Average
									// accessibility mean depth per building
									'avg_accessibility_mean_depth_per_building' : function() {
										return {
											name : 'Average accessibility mean depth per building',
											measure : createMeasure(
													'avg_depthmap_value_per_building', createMeasure(
															'id_of_depthmaps', {
																content : // 39
																study.id
															}, {
																content : 'Accessibility'
															}), {
														content : 'Visual Mean Depth'
													})
										}
									},
									// BMARK avg_visibility_mean_depth_per_building : Average
									// vibility mean depth per building
									'avg_visibility_mean_depth_per_building' : function() {
										return {
											name : 'Average vibility mean depth per building',
											measure : createMeasure(
													'avg_depthmap_value_per_building', createMeasure(
															'id_of_depthmaps', {
																content : // 39
																study.id
															}, {
																content : 'Visibility'
															}), {
														content : 'Visual Mean Depth'
													})
										}
									},
									// BMARK avg_essence_mean_depth_per_building : Average essence
									// mean depth per building
									'avg_essence_mean_depth_per_building' : function() {
										return {
											name : 'Average essence mean depth per building',
											measure : createMeasure(
													'avg_depthmap_value_per_building', createMeasure(
															'id_of_depthmaps', {
																content : // 39
																study.id
															}, {
																content : 'Essence'
															}), {
														content : 'Visual Mean Depth'
													})
										}
									},
									// BMARK no_of_people_per_round : Number of people per round
									'no_of_people_per_round' : function() {
										return {
											name : 'Number of people per round',
											measure : createMeasure('no_of_people_per_round',
													measures['first_observation_id']().measure, {
														content : [
																1, 2, 3
														]
													}, createMeasure('round_times',
															measures['first_observation_id']().measure))
										}
									},
									// BMARK no_of_people_per_round_max : Maximum number of people
									// in the space
									'no_of_people_per_round_max' : function() {
										return {
											name : 'Maximum number of people in the space',
											measure : createMeasure('table_max',
													measures['no_of_people_per_round']().measure)
										}
									},
									// BMARK no_of_people_per_round_sum : Average number of people
									// in the space
									'no_of_people_per_round_sum' : function() {
										return {
											name : 'Total number of people in the space (all rounds)',
											measure : createMeasure('table_sum',
													measures['no_of_people_per_round']().measure)
										}
									},
									// BMARK no_of_people_per_round_avg : Average number of people
									// in the space
									'no_of_people_per_round_avg' : function() {
										return {
											name : 'Average number of people in the space',
											measure : createMeasure('table_avg',
													measures['no_of_people_per_round']().measure)
										}
									},
									// BMARK people_moving_avg : Average number of people walking
									'people_moving_avg' : function() {
										return {
											name : 'Average number of people walking',
											measure : createMeasure('div',
													measures['people_moving_total']().measure,
													measures['no_of_rounds']().measure),
											units_full : 'people',
											units : "people",
										}
									},
									// BMARK people_moving_avg_per_building : Average number of
									// people walking per building
									'people_moving_avg_per_building' : function() {
										return {
											name : 'Average number of people walking per building',
											measure : createMeasure(
													'div',
													measures['no_of_people_walking_per_building']().measure,
													measures['no_of_rounds']().measure),
											units : "people",
										}
									},
									// BMARK people_moving_avg_per_space : Average number of
									// people walking per floor
									'people_moving_avg_per_space' : function() {
										return {
											name : 'Average number of people walking per floor',
											measure : createMeasure('div',
													measures['no_of_people_walking_per_space']().measure,
													measures['no_of_rounds']().measure),
											units : "people",
										}
									},
									// BMARK people_moving_to_nia_prim_circ : Movement density to
									// primary circulation NIA (x1000)
									'people_moving_to_nia_prim_circ' : function() {
										return {
											name : 'Movement density to primary circulation NIA (x1000)',
											measure : createMeasure('div', createMeasure('mult',
													createMeasure('div', measures['people_moving_total']
															().measure, measures['nia_prim_circ']().measure),
													{
														content : 1000
													}), measures['no_of_rounds']().measure),
											description : 'Number of people walking per sqm of circulation',
											units_full : 'people walking/m\xB2',
											units : "ppl/1000m\xB2",
										}
									},
									// BMARK people_moving_to_nia_prim_circ_per_building :
									// Movement density to primary circulation NIA (x1000) per
									// building
									'people_moving_to_nia_prim_circ_per_building' : function() {
										return {
											name : 'Movement density to primary circulation NIA (x1000) per building',
											measure : createMeasure(
													'div',
													createMeasure(
															'mult',
															createMeasure(
																	'div',
																	measures['no_of_people_walking_per_building']
																			().measure,
																	measures['nia_prim_circ_per_building']().measure),
															{
																content : 1000
															}), measures['no_of_rounds']().measure),
											description : 'Number of people walking per sqm of circulation per building',
											units_full : 'people walking/m\xB2',
											units : "ppl/1000m\xB2",
										}
									},
									// BMARK people_moving_to_nia_prim_circ_per_space : Movement
									// density to primary circulation NIA (x1000) per space
									'people_moving_to_nia_prim_circ_per_space' : function() {
										return {
											name : 'Movement density to primary circulation NIA (x1000) per space',
											measure : createMeasure(
													'div',
													createMeasure(
															'mult',
															createMeasure(
																	'div',
																	measures['no_of_people_walking_per_space']().measure,
																	measures['nia_prim_circ_per_space']().measure),
															{
																content : 1000
															}), measures['no_of_rounds']().measure),
											description : 'Number of people walking per sqm of circulation per floor',
											units_full : 'people walking/m\xB2',
											units : "ppl/1000m\xB2",
										}
									},
									// BMARK people_moving_to_nia_total : Movement density to
									// total NIA (x1000)
									'people_moving_to_nia_total' : function() {
										return {
											name : 'Movement density to total NIA (x1000)',
											measure : createMeasure('div', createMeasure('mult',
													createMeasure('div', measures['people_moving_total']
															().measure, measures['nia_total']().measure), {
														content : 1000
													}), measures['no_of_rounds']().measure),
											description : 'Number of people walking per 1000 sqm of total NIA',
											units_full : 'people walking/m\xB2',
											units : "ppl/1000m\xB2",
										}
									},
									// BMARK people_moving_to_nia_total_per_building : Movement
									// density to total NIA (x1000) per building
									'people_moving_to_nia_total_per_building' : function() {
										return {
											name : 'Movement density to total NIA (x1000) per building',
											measure : createMeasure(
													'div',
													createMeasure(
															'mult',
															createMeasure('div',
																	measures['no_of_people_walking_per_building']
																			().measure,
																	measures['nia_total_per_building']().measure),
															{
																content : 1000
															}), measures['no_of_rounds']().measure),
											description : 'Number of people walking per 1000 sqm of building NIA',
											units_full : 'people walking/m\xB2',
											units : "ppl/1000m\xB2",
										}
									},
									// BMARK people_moving_to_nia_total_per_space : Movement
									// density to total NIA (x1000) per space
									'people_moving_to_nia_total_per_space' : function() {
										return {
											name : 'Movement density to total NIA (x1000) per space',
											measure : createMeasure(
													'div',
													createMeasure(
															'mult',
															createMeasure(
																	'div',
																	measures['no_of_people_walking_per_space']().measure,
																	measures['nia_total_per_space']().measure), {
																content : 1000
															}), measures['no_of_rounds']().measure),
											description : 'Number of people walking per 1000 sqm of space NIA',
											units_full : 'people walking/m\xB2',
											units : "ppl/1000m\xB2",
										}
									},
									// BMARK desk_occupancy_per_team : Desk occupancy per team
									'desk_occupancy_per_team' : function() {
										return {
											name : 'Desk occupancy per team',
											measure : createMeasure(
													'activity_in_polygon_types_per_type',
													measures['first_observation_id']().measure,
													measures['ids_of_team_polygons']().measure, {
														content : [
															1
														]
													}, {
														content : [
															1
														]
													}, {
														content : [
																0, 1
														]
													}, measures['names_of_teams_polygons']().measure)
										}
									},
									// BMARK max_desk_occupancy_per_team : Max desk occupancy per
									// team
									'max_desk_occupancy_per_team' : function() {
										return {
											name : 'Max desk occupancy per team',
											measure : createMeasure(
													'activity_max_in_polygon_types_per_type',
													measures['first_observation_id']().measure,
													measures['ids_of_team_polygons']().measure, {
														content : [
															1
														]
													}, {
														content : [
															1
														]
													}, {
														content : [
																0, 1
														]
													}, measures['names_of_teams_polygons']().measure)
										}
									},
									// BMARK min_desk_occupancy_per_team : Min desk occupancy per
									// team
									'min_desk_occupancy_per_team' : function() {
										return {
											name : 'Min desk occupancy per team',
											measure : createMeasure(
													'activity_min_in_polygon_types_per_type',
													measures['first_observation_id']().measure,
													measures['ids_of_team_polygons']().measure, {
														content : [
															1
														]
													}, {
														content : [
															1
														]
													}, {
														content : [
																0, 1
														]
													}, measures['names_of_teams_polygons']().measure)
										}
									},
									// BMARK no_of_people_on_the_phone_per_team : Number of people
									// on the phone per team
									'no_of_people_on_the_phone_per_team' : function() {
										return {
											name : 'Number of people on the phone per team',
											measure : createMeasure(
													'activity_in_polygon_types_per_type',
													measures['first_observation_id']().measure,
													measures['ids_of_team_polygons']().measure, {
														content : [
																1, 2, 3
														]
													}, {
														content : [
																0, 1
														]
													}, {
														content : [
															1
														]
													}, measures['names_of_teams_polygons']().measure)
										}
									},
									// BMARK total_activity_per_team : Total Activity per team
									'total_activity_per_team' : function() {
										return {
											name : 'Total Activity per team',
											measure : createMeasure(
													'activity_in_polygon_types_per_type',
													measures['first_observation_id']().measure,
													measures['ids_of_team_polygons']().measure, {
														content : [
																1, 2, 3
														]
													}, {
														content : [
																0, 1
														]
													}, {
														content : [
																0, 1
														]
													}, measures['names_of_teams_polygons']().measure)
										}
									},
									// BMARK avg_desk_occupancy_per_team : Average desk occupancy
									// per team
									'avg_desk_occupancy_per_team' : function() {
										return {
											name : 'Average desk occupancy per team',
											no_of_decimals : 0,
											measure : createMeasure('mult', createMeasure('div',
													measures['desk_occupancy_per_team']().measure,
													createMeasure('mult',
															measures['no_of_rounds']().measure,
															measures['no_of_desks_per_team']().measure)), {
												content : 100
											}),
											units : '%'
										}
									},
									// BMARK max_desk_occupancy_per_team_prc : Maximum desk
									// occupancy per team
									'max_desk_occupancy_per_team_prc' : function() {
										return {
											name : 'Maximum desk occupancy per team',
											no_of_decimals : 0,
											measure : createMeasure('mult', createMeasure('div',
													measures['max_desk_occupancy_per_team']().measure,
													measures['no_of_desks_per_team']().measure), {
												content : 100
											}),
											units : '%'

										}
									},
									// BMARK min_desk_occupancy_per_team_prc : Minimum desk
									// occupancy per team
									'min_desk_occupancy_per_team_prc' : function() {
										return {
											name : 'Minimum desk occupancy per team',
											no_of_decimals : 0,
											measure : createMeasure('mult', createMeasure('div',
													measures['min_desk_occupancy_per_team']().measure,
													measures['no_of_desks_per_team']().measure), {
												content : 100
											}),
											units : '%'

										}
									},
									// BMARK avg_no_of_people_on_the_phone_per_team_prc : % of
									// people on the phone
									'avg_no_of_people_on_the_phone_per_team_prc' : function() {
										return {
											name : '% of people on the phone',
											measure : createMeasure(
													'div',
													measures['no_of_people_on_the_phone_per_team']().measure,
													measures['total_activity_per_team']().measure)
										}
									},
									// BMARK meeting_room_groups_avg : Average meeting size
									'meeting_room_groups_avg' : function() {
										return {
											name : 'Average meeting size',
											measure : createMeasure(
													'groups_of_people_in_poly_types_avg',
													measures['first_observation_id']().measure,
													createMeasure('id_of_poly_types', {
														content : 'func'
													}, {
														content : 'MTG'
													}), {
														content : [
																1, 2, 3
														]
													}, {
														content : [
																0, 1
														]
													}, {
														content : [
																0, 1
														]
													}, {
														content : [
																"1", "2", "3-4", "5-6", "7-8", "9-10", "11-14",
																"15-18", "19%2B"
														]
													})
										}
									},
									// BMARK meeting_room_groups_max : Maximum meeting size
									'meeting_room_groups_max' : function() {
										return {
											name : 'Maximum meeting size',
											measure : createMeasure(
													'groups_of_people_in_poly_types_max',
													measures['first_observation_id']().measure,
													createMeasure('id_of_poly_types', {
														content : 'func'
													}, {
														content : 'MTG'
													}), {
														content : [
																1, 2, 3
														]
													}, {
														content : [
																0, 1
														]
													}, {
														content : [
																0, 1
														]
													}, {
														content : [
																"1", "2", "3-4", "5-6", "7-8", "9-10", "11-14",
																"15-18", "19%2B"
														]
													})
										}
									},
									// BMARK meeting_room_groups_min : Minumum bookable meeting
									// size
									'meeting_room_groups_min' : function() {
										return {
											name : 'Minumum bookable meeting size',
											measure : createMeasure(
													'groups_of_people_in_poly_types_min',
													measures['first_observation_id']().measure,
													createMeasure('id_of_poly_types', {
														content : 'func'
													}, {
														content : 'MTG-BKB'
													}), {
														content : [
																1, 2, 3
														]
													}, {
														content : [
																0, 1
														]
													}, {
														content : [
																0, 1
														]
													}, {
														content : [
																"1", "2", "3-4", "5-6", "7-8", "9-10", "11-14",
																"15-18", "19%2B"
														]
													})
										}
									},
									// BMARK no_of_people_in_meeting_rooms : Number of people in
									// bookable meeting rooms
									'no_of_people_in_meeting_rooms' : function() {
										return {
											name : 'Number of people in bookable meeting rooms',
											measure : createMeasure('activity_in_polygon_types',
													measures['first_observation_id']().measure,
													createMeasure('id_of_poly_types', {
														content : 'func'
													}, {
														content : 'MTG-BKB'
													}), {
														content : [
																1, 2, 3
														]
													}, {
														content : [
																0, 1
														]
													}, {
														content : [
																0, 1
														]
													})
										}
									},
									// BMARK avg_meeting_size : Average size of meeting
									'avg_meeting_size' : function() {
										return {
											name : 'Average size of meeting',
											measure : createMeasure(
													'div',
													measures['no_of_people_in_meeting_rooms']().measure,
													measures['occupancy_of_bookable_meeting_rooms']().measure)
										}
									},
									// BMARK round_prc_range_array : Array of round ranges
									'round_prc_range_array' : function() {
										return {
											name : 'Array of round ranges',
											measure : createMeasure('get_range_array', createMeasure(
													'mult', createMeasure('construct_ranges', {
														content : [
																'0-0.5:0 - 50%', '0.5-0.7:50 - 70%', '0.7+:70% - 100%'
														]
													}), measures['no_of_rounds']().measure))
										}
									},
									// BMARK occupancy_frequency_grouped : Distribution of average
									// occupancy (all desks)
									'occupancy_frequency_grouped' : function() {
										return {
											name : 'Distribution of average occupancy (all desks)',
											description : 'Distribution of desk occupancy i.e. what proportion of desks are occupied less than 70% and less than 50% of the time',
											measure : createMeasure('occupancy_frequency_grouped',
													measures['first_observation_id']().measure,
													createMeasure('flatten_range',
															measures['round_prc_range_array']().measure, {
																content : 'alias'
															}), measures['round_prc_range_array']().measure)
										}
									},
									'activity_in_alternative_spaces_per_round' : function() {
										return {
											name : 'Number of people per round in alternative spaces',
											measure : createMeasure(
													'activity_in_poly_types_per_round',
													measures['first_observation_id']().measure,
													measures['ids_of_alternative_space_types']().measure,
													{
														content : [
																1, 2, 3
														]
													}, {
														content : [
																0, 1
														]
													}, {
														content : [
																0, 1
														]
													}, createMeasure('round_times',
															measures['first_observation_id']().measure))
										}
									},
									// BMARK max_utilisation_of_alternative_spaces : Maximum
									// number of people in alternative spaces
									'max_utilisation_of_alternative_spaces' : function() {
										return {
											name : 'Maximum number of people in alternative spaces',
											measure : createMeasure('table_max',
													measures['activity_in_alternative_spaces_per_round']
															().measure)
										}
									},
									// BMARK id_of_canteen_spaces : Number of people per round in
									// alternative spaces
									'id_of_canteen_spaces' : function() {
										return {
											measure : createMeasure('id_of_poly_types', {
												content : 'func'
											}, {
												content : 'OTHFCL-CAN'
											})
										}
									},
									// BMARK activity_in_canteen_per_round : Number of people per
									// round in alternative spaces
									'activity_in_canteen_per_round' : function() {
										return {
											name : 'Number of people per round in canteen',
											measure : createMeasure(
													'activity_in_poly_types_per_round',
													measures['first_observation_id']().measure,
													measures['id_of_canteen_spaces']().measure, {
														content : [
																1, 2, 3
														]
													}, {
														content : [
																0, 1
														]
													}, {
														content : [
																0, 1
														]
													}, createMeasure('round_times',
															measures['first_observation_id']().measure))
										}
									},
									// BMARK no_of_staff_ties_outside_team_per_team : Number of
									// staff ties outside team
									'no_of_staff_ties_outside_team_per_team' : function() {
										return {
											name : 'Number of staff ties outside team',
											measure : createMeasure(
													'no_of_staff_ties_outside_team_per_team', {
														content : study.id
													},
													measures['staff_relationship_question_id']().measure)
										}
									},
									// BMARK no_of_staff_ties_within_team_per_team : Number of
									// staff ties within team
									'no_of_staff_ties_within_team_per_team' : function() {
										return {
											name : 'Number of staff ties within team',
											measure : createMeasure(
													'no_of_staff_ties_within_team_per_team', {
														content : study.id
													},
													measures['staff_relationship_question_id']().measure)
										}
									},
									// BMARK no_of_possible_staff_ties_outside_team_per_team :
									// Number of possible staff ties outside team
									'no_of_possible_staff_ties_outside_team_per_team' : function() {
										return {
											name : 'Number of possible staff ties outside team',
											measure : createMeasure(
													'no_of_possible_staff_ties_outside_team_per_team', {
														content : study.id
													})
										}
									},
									// BMARK no_of_possible_staff_ties_within_team_per_team :
									// Number of possible staff ties within team
									'no_of_possible_staff_ties_within_team_per_team' : function() {
										return {
											name : 'Number of possible staff ties within team',
											measure : createMeasure(
													'no_of_possible_staff_ties_within_team_per_team', {
														content : study.id
													})
										}
									},

								// measures['nia_prim_circ_per_building']().measure,
								// measures['nia_total_per_building']().measure)
								}
								return measures;
							}
							// TODO: Delete stuff below

							// function checkDependencies(study, requires) {
							// for (var i = 0; i < requires.length; i++) {
							// if (study[requires[i]].status
							// && study[requires[i]].status === 201) {
							// return false;
							// }
							// }
							// return true;
							// }
							// var fetchMeasure = function(measureAlias, measure, study) {
							// var deferred = $q.defer();
							// var getter;
							// console.log(measureAlias, measure);
							// console.log(study['id_of_poly_types_func_WRKSP-CEL']);
							// if (measure.proc) {
							// var paramString = "";
							// var params = measure.params(study);
							// if (params) {
							// angular.forEach(params, function(value, key) {
							// console.log(value);
							// paramString += "&";
							// if (typeof value === 'string')
							// paramString += key + "=" + value;
							// else if (value.length)
							// paramString += key + "=[" + value + "]";
							// else
							// paramString += key + "=" + value;
							// });
							// // console.log(paramString);
							// }
							// getter = HTTPFactory.backendGet('Occupancy?t=' + measure.proc
							// + paramString);
							// } else if (!measure.url) {
							// return {
							// then : function(callback, error) {
							// var reqMeasures = {};
							// if (measure.requires
							// && typeof measure.requires === 'function')
							// measure.requires = measure.requires();
							// for (var i = 0; i < measure.requires.length; i++) {
							// reqMeasures[measure.requires[i]] =
							// study[measure.requires[i]].content;
							// }
							// callback([
							// measureAlias, measure.callback(reqMeasures)
							// ]);
							// }
							// }
							// } else
							// getter = measure.get(study);
							// getter.then(function(response) {
							// if (response.status === 201) {
							// var body = response.data;
							// deferred.resolve([
							// measureAlias, {
							// name : measure.name,
							// content : body,
							// status : 201
							// }
							// ]);
							// } else
							// deferred.resolve([
							// measureAlias, measure.callback(response)
							// ]);
							// }, function(error) {
							// console.log(error);
							// });
							// return deferred.promise;
							// }
							// var tricklePromises = function(measureAlias, study) {
							// var measure;
							// if (typeof measureAlias === 'object') {
							// measure = measureAlias;
							// measureAlias = measure.proc + "_" + measure.id;
							// } else
							// measure = knownMeasures[measureAlias];
							// if (!measure) {
							// return;
							// }
							// // if (measure.func) {
							// // console.log(measure);
							// // }
							// if (measure.requires && typeof measure.requires === 'function')
							// measure.requires = measure.requires();
							// if (measure.requires && measure.requires.length > 0) {
							// var promises = [];
							// for (var i = 0; i < measure.requires.length; i++) {
							// // console.log(measure.requires[i]);
							// if (!study[measure.requires[i]]) {
							// // promises[measure.requires[i]] = (tricklePromises(
							// // measure.requires[i], study));
							// // if (typeof measure.requires[i] === 'object')
							// promises
							// .push(tricklePromises(measure.requires[i], study));
							// }
							// }
							// var deferred = $q.defer();
							// HTTPFactory.all(promises).then(
							// function(response) {
							// var found201measure;
							// for (var i = 0; i < response.length; i++) {
							// if (typeof response[i][0] === 'object') {
							// var msr = response[i][0];
							// // console.log(measureAlias);
							// // console.log(msr['proc']);
							// var proc = msr['proc'];
							// if (!study[proc])
							// study[proc] = {};
							// study[proc + "_" + msr.id] = msr;
							// } else
							// study[response[i][0]] = response[i][1];
							// if (response[i][1].status == 201 && !found201measure)
							// found201measure = response[i][1];
							// }
							// if (found201measure) {
							// deferred.resolve([
							// measureAlias,
							// {
							// name : measure.name,
							// content : found201measure.content + "("
							// + found201measure.name + ")",
							// status : 201
							// }
							// ]);
							// } else
							// // for (var i = 0; i < response.length; i++)
							// // study[response[i][0]] = response[i][1];
							// fetchMeasure(measureAlias, measure, study).then(
							// function(response) {
							// deferred.resolve(response);
							// }, function(error) {
							// console.log(error);
							// });
							// }, function(error) {
							// console.log(error);
							// });
							// return deferred.promise;
							// } else {
							// return fetchMeasure(measureAlias, measure, study);
							// }
							// }
							var out = {
								fetchStudy : function(id, measures) {
									var study = loadedStudies[id];
									if (!study) {
										study = {
											id : id
										};
										loadedStudies[id] = study;
									}
									var known = newMeasures(study);

									for (var i = 0; i < measures.length; i++) {
										if (known[measures[i]]) {
											var result = known[measures[i]]();
											resolveMeasure(result.measure).then(
													function(solvedMeasure) {
														angular.copy(solvedMeasure, solvedMeasure.request);
													});
											study[measures[i]] = result;
										} else {
											study[measures[i]] = {
												name : measures[i],
												measure : {
													content : "Unknown measure"
												}
											}
										}
									}
									// var promises = [];
									// for (var i = 0; i < measures.length; i++) {
									// promises.push(tricklePromises(measures[i], study));
									// }
									// var deferred = $q.defer()
									// HTTPFactory.all(promises).then(function(response) {
									// for (var i = 0; i < response.length; i++)
									// study[response[i][0]] = response[i][1];
									// deferred.resolve(study);
									// }, function(error) {
									// console.log(error);
									// });
									// return deferred.promise;
									return study;
								}
							}
							return out;
						}
				]);