app
		.controller(
				'StdCompareCtrl',
				[
						'$scope',
						'$stateParams',
						'StudyFactory',
						'HTTPFactory',
						function($scope, $stateParams, StudyFactory,
								HTTPFactory) {
							$scope.gridsterOpts = {
							        columns: 12, // the width of the grid, in columns
//							        pushing: true, // whether to push other items out of the way on move or resize
//							        floating: true, // whether to automatically float items up so they stack (you can temporarily disable if you are adding unsorted items with ng-repeat)
//							        width: 'auto', // can be an integer or 'auto'. 'auto' scales gridster to be the full width of its containing element
//							        colWidth: 'auto', // can be an integer or 'auto'.  'auto' uses the pixel width of the element divided by 'columns'
//							        rowHeight: 'match', // can be an integer or 'match'.  Match uses the colWidth, giving you square widgets.
							        margins: [15, 15], // the pixel distance between each widget
							        outerMargin: true, // whether margins apply to outer edges of the grid
//							        isMobile: false, // stacks the grid items if true
//							        mobileBreakPoint: 600, // if the screen is not wider that this, remove the grid layout and stack the items
//							        mobileModeEnabled: true, // whether or not to toggle mobile mode when screen width is less than mobileBreakPoint
//							        minColumns: 1, // the minimum columns the grid must have
//							        minRows: 2, // the minimum height of the grid, in rows
//							        maxRows: 100,
//							        defaultSizeX: 2, // the default width of a gridster item, if not specifed
//							        defaultSizeY: 1, // the default height of a gridster item, if not specified
//							        resizable: {
//							           enabled: true,
//							           handles: ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'],
//							           start: function(event, $element, widget) {}, // optional callback fired when resize is started,
//							           resize: function(event, $element, widget) {}, // optional callback fired when item is resized,
//							           stop: function(event, $element, widget) {} // optional callback fired when item is finished resizing
//							        },
//							        draggable: {
//							           enabled: true, // whether dragging items is supported
//							           handle: '.my-class', // optional selector for resize handle
//							           start: function(event, $element, widget) {}, // optional callback fired when drag is started,
//							           drag: function(event, $element, widget) {}, // optional callback fired when item is moved,
//							           stop: function(event, $element, widget) {} // optional callback fired when item is finished dragging
//							        }
							    };
							$scope.lel = { sizeX: 3, sizeY: 1, row: 0, col: 0 };
							$scope.lel1 = { sizeX: 3, sizeY: 1, row: 0, col: 3 };
							$scope.lel2 = { sizeX: 3, sizeY: 1, row: 0, col: 6 };
							$scope.lel3 = { sizeX: 3, sizeY: 1, row: 0, col: 9 };
							$scope.lal = { sizeX: 4, sizeY: 4, row: 1, col: 0 };
							$scope.lal1 = { sizeX: 4, sizeY: 4, row: 1, col: 4 };
							$scope.lal2 = { sizeX: 4, sizeY: 4, row: 1, col: 9 };
							$scope.lil = { sizeX: 8, sizeY: 4, row: 6, col: 2 };
							$scope.standardItems = [
							                        { sizeX: 4, sizeY: 2, row: 10, col: 0 },
							                        { sizeX: 4, sizeY: 4, row: 10, col: 4 },
							                        { sizeX: 2, sizeY: 2, row: 10, col: 8 },
							                        { sizeX: 2, sizeY: 2, row: 10, col: 10 },
							                        { sizeX: 2, sizeY: 2, row: 12, col: 8 },
							                        { sizeX: 2, sizeY: 4, row: 12, col: 10 },
							                        { sizeX: 2, sizeY: 2, row: 14, col: 0 },
							                        
							                        { sizeX: 2, sizeY: 2, row: 14, col: 6 }
//							                        ,
//							                        { sizeX: 2, sizeY: 2, row: 4, col: 8 }
							                      ];
							// fetch(backend + 'Get?t=study&studyid=' +
							// study.id).then(
							// function(response) {
							// $scope.desks = response.data;
							// calcAvgOccupancy();
							// }, function(error) {
							// });
							$scope.id = $stateParams.studyid;
							// $scope.study = {};
							StudyFactory.fetchStudy($scope.id,
									[ 'project_name' ]).then(
									function(response) {
										// for (var i = 0; i < response.length;
										// i++)
										// $scope.study[response[i][0]] =
										// response[i][1];
										$scope.study = response;
										console.log(response);
									}, function(error) {
										console.log(error);
									});
							HTTPFactory
									.backendGet(
											'GetAll?t=study_parts&studyid='
													+ $scope.id)
									.then(
											function(response) {
												$scope.observation_id = response.data[0]['id'];
												HTTPFactory
														.backendGet(
																'Occupancy?t=project_name&obsid='
																		+ $scope.observation_id)
														.then(
																function(
																		response) {
																	$scope.projectname = response.data;
																},
																function(error) {
																});
												HTTPFactory
														.backendGet(
																'Occupancy?t=no_of_desks&obsid='
																		+ $scope.observation_id)
														.then(
																function(
																		response) {
																	$scope.desks = response.data;
																	calcOccupancy();
																},
																function(error) {
																});
												HTTPFactory
														.backendGet(
																'Occupancy?t=no_of_rounds&obsid='
																		+ $scope.observation_id)
														.then(
																function(
																		response) {
																	$scope.rounds = response.data;
																	calcOccupancy();
																},
																function(error) {
																});
												HTTPFactory
														.backendGet(
																'Occupancy?t=gross_occupancy&obsid='
																		+ $scope.observation_id)
														.then(
																function(
																		response) {
																	$scope.occupancy = response.data;
																	calcOccupancy();
																},
																function(error) {
																});
												HTTPFactory
														.backendGet(
																'Occupancy?t=min_occupancy&obsid='
																		+ $scope.observation_id)
														.then(
																function(
																		response) {
																	$scope.minoccupancy = response.data;
																	calcOccupancy();
																},
																function(error) {
																});
												HTTPFactory
														.backendGet(
																'Occupancy?t=max_occupancy&obsid='
																		+ $scope.observation_id)
														.then(
																function(
																		response) {
																	$scope.maxoccupancy = response.data;
																	calcOccupancy();
																},
																function(error) {
																});
												HTTPFactory
														.backendGet(
																'GetAll?t=spaces&studyid='
																		+ $scope.id)
														.then(
																function(
																		response) {
																	$scope.spaces = response.data.length;
																},
																function(error) {
																});
												HTTPFactory
														.backendGet(
																'Occupancy?t=no_of_buildings&obsid='
																		+ $scope.observation_id)
														.then(
																function(
																		response) {
																	$scope.buildings = response.data;
																},
																function(error) {
																});
												HTTPFactory
														.backendGet(
																'Occupancy?t=get_quotes&obsid='
																		+ $scope.id)
														.then(
																function(
																		response) {
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
																		response.data[i].size = response.data[i].size
																				* 100.0
																				/ max;
																		// $scope.wordleData.push(response.data[i]);
																	}
																	$scope.wordleData = response.data;
																	// console
																	// .log(response.data);
																},
																function(error) {
																});
												HTTPFactory
														.backendGet(
																'Occupancy?t=total_occ_per_round&obsid='
																		+ $scope.observation_id)
														.then(
																function(
																		response) {
																	var data = response.data;
																	// console.log(data);
																	var collated = {};
																	var sortable = [];
																	for (var i = 0; i < data.length; i++) {
																		var id = data[i].day_id
																				* 100
																				+ data[i].round_id;
																		sortable
																				.push(id);
																		collated[id] = data[i].count;
																	}
																	sortable
																			.sort();
																	$scope.occPerRound = [];
																	for (var i = 0; i < sortable.length; i++) {
																		$scope.occPerRound
																				.push(collated[sortable[i]]);
																	}
																	// console.log($scope.occ_per_round);
																},
																function(error) {
																});
												HTTPFactory
														.backendGet(
																'Occupancy?t=desk_occ_frequency&obsid='
																		+ $scope.observation_id)
														.then(
																function(
																		response) {
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
																		$scope.deskOccFreq
																				.push(data[i].frequency);
																	}
																	// console.log($scope.occ_per_round);
																},
																function(error) {
																});
												HTTPFactory
														.backendGet(
																'Occupancy?t=no_of_staff&obsid='
																		+ $scope.id)
														.then(
																function(
																		response) {
																	$scope.staff = response.data;
																},
																function(error) {
																});
											}, function(error) {
											});
							$scope.words = [ "Hallo", "Test", "Lorem", "Ipsum",
									"Lorem", "ipsum", "dolor", "sit", "amet",
									"consetetur", "sadipscing", "elitr,",
									"sed", "diam", "nonumy", "eirmod",
									"tempor", "invidunt", "ut", "labore", "et",
									"dolore", "magna", "aliquyam", "erat,",
									"sed", "diam" ];
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
							$scope.occPerRound = [ 0 ];
							$scope.deskOccFreq = [ 0 ];
							// $scope.wordleData = [ "Hello", "world",
							// "normally", "you", "want",
							// "more", "words", "than", "this" ].map(function(d)
							// {
							// return {
							// text : d,
							// size : 10 + Math.random() * 90
							// };
							// });
							$scope.minOccupancyValues = [ 0, 1 ];
							$scope.avgOccupancyValues = [ 0, 1 ];
							$scope.maxOccupancyValues = [ 0, 1 ];
							$scope.minOccupancyLabels = [ '0%', '100%' ];
							$scope.avgOccupancyLabels = [ '0%', '100%' ];
							$scope.maxOccupancyLabels = [ '0%', '100%' ];
							function calcOccupancy() {
								$scope.avgOccupancyValues = [
										$scope.occupancy
												/ ($scope.desks * $scope.rounds),
										1
												- $scope.occupancy
												/ ($scope.desks * $scope.rounds) ]
								$scope.avgOccupancyLabels = [
										(($scope.avgOccupancyValues[0] * 100) | 0)
												+ '%',
										(($scope.avgOccupancyValues[1] * 100) | 0)
												+ '%' ];

								$scope.minOccupancyValues = [
										$scope.minoccupancy / $scope.desks,
										1 - $scope.minoccupancy / $scope.desks ]
								$scope.minOccupancyLabels = [
										(($scope.minOccupancyValues[0] * 100) | 0)
												+ '%',
										(($scope.minOccupancyValues[1] * 100) | 0)
												+ '%' ];

								$scope.maxOccupancyValues = [
										$scope.maxoccupancy / $scope.desks,
										1 - $scope.maxoccupancy / $scope.desks ]
								$scope.maxOccupancyLabels = [
										(($scope.maxOccupancyValues[0] * 100) | 0)
												+ '%',
										(($scope.maxOccupancyValues[1] * 100) | 0)
												+ '%' ];

							}
						} ]);