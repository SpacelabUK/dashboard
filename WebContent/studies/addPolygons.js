var genIdentifier = '@_';
var funcIdentifier = 'ACC';
var teamIdentifier = 'TEAM';
app.factory('PolyFactory', function() {
	var polys = [];
	var public = {
		getPolys : function() {
			return polys;
		},
		addPoly : function(poly) {
			polys.push(poly);
		}
	}
	return public;
});
app
		.controller(
				'addPolygonsInstance',
				[
						'$scope',
						'$modalInstance',
						'$http',
						'$modal',
						'$q',
						'study',
						'FileUploader',
						'PlanFactory',
						'PolyFactory',
						function($scope, $modalInstance, $http, $modal, $q,
								study, FileUploader, PlanFactory, PolyFactory) {
							$scope.study = study;
							$scope.predicate = 'building';
							$scope.project = {};
							var date = new Date().getFullYear();
							$scope.project.id = date.toString().substring(2);
							$scope.project.name = '';
							PlanFactory.refreshSpaces(study);
							console.log(study);
							$scope.data = PolyFactory.getPolys();
							$scope.add = function() {
								if ($scope.project.name.length > 0
										&& $scope.project.id.length > 3) {
									// $modalInstance.close($scope.selected.item);
									projectFactory.addProject(
											$scope.project.id,
											$scope.project.name).then(
											function(response) {
												// console.log(response);
												projectFactory
														.refreshProjects();
											}, function(error) {
												console.error(error);
											});
									$modalInstance.close();
								}
								// $modalInstance.dismiss('cancel');
							};
							// $scope.polys = [ [ 10, 20 ], [ 30, 40 ],
							// [ 60, 80 ], [ 20, 50 ] ];

							PolyFactory.addPoly([ {
								"x" : 0.0,
								"y" : 25.0
							}, {
								"x" : 8.5,
								"y" : 23.4
							}, {
								"x" : 13.0,
								"y" : 21.0
							}, {
								"x" : 19.0,
								"y" : 15.5
							} ]);
							// $scope.polys = [[ {
							// "x" : 0.0,
							// "y" : 25.0
							// }, {
							// "x" : 8.5,
							// "y" : 23.4
							// }, {
							// "x" : 13.0,
							// "y" : 21.0
							// }, {
							// "x" : 19.0,
							// "y" : 15.5
							// } ]];

							// var map =
							// d3.select("#polyview").append("svg:svg")
							// // .attr("width", '100%')
							// .attr("height", 200);
							// console.log(d3.select("#polyview"));
							$scope.validateID = function(value) {
								return value.length > 3;
							}
							$scope.cancel = function() {
								$modalInstance.dismiss('cancel');
							};
							$scope.layerpredicate = 'name';
							$scope.selectedSpaceLayers = [];
							$scope.selectOnlySpace = function(clickedSpace) {
								angular.forEach($scope.foundspaces, function(
										space) {
									if (space === clickedSpace) {
										// console.log(space);
										space.selected = true;
										// for (var i = 0; i <
										// $scope.selectedSpaceLayers.length;
										// i++) {
										// $scope.selectedSpaceLayers
										// .pop();
										// }
										$scope.selectedSpaceLayers = [];
										var keyz = Object.keys(space.f);
										for (var i = 0; i < keyz.length; i++) {
											$scope.selectedSpaceLayers
													.push(space.f[keyz[i]]);
										}

										// console.log('selected');
										// console
										// .log($scope.selectedSpaceLayers);
									} else
										space.selected = false;
									var keyz = Object.keys(space.f);
									for (var i = 0; i < keyz.length; i++) {
										space.f[keyz[i]].selected = false;
									}
								});

							}
							$scope.selectLayer = function(layer) {
								layer.selected = !layer.selected;
								// for (var i = 0; i < $scope.data.length; i++)
								// {
								// $scope.data.pop();
								// }
								$scope.data = [];
								angular
										.forEach(
												$scope.selectedSpaceLayers,
												function(layr) {
													if (layr.selected)
														for (var i = 0; i < layr.polys.length; i++)
															$scope.data
																	.push(layr.polys[i]);
												});

							}
							// $scope.getSelectedSpaceLayers = function() {
							// console.log('a');
							// angular.forEach($scope.foundspaces, function(
							// space) {
							// if (space.selected)
							// return space.f;
							// });
							// }
							// if (window.File && window.FileReader
							// && window.FileList && window.Blob) {
							// // Great success! All the File APIs are
							// // supported.
							// } else {
							// alert('The File APIs are not fully supported in
							// this browser.');
							// }

							var uploader = $scope.uploader = new FileUploader({
								url : 'upload.php'
							});
							// FILTERS
							uploader.filters.push({
								name : 'customFilter',
								fn : function(
										item /* {File|FileLikeObject} */,
										options) {
									return this.queue.length < 10;
								}
							});

							function endsWith(str, suffix) {
								return str.indexOf(suffix, str.length
										- suffix.length) !== -1;
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
										if (!endsWith(theFile.name, 'dxf')) {
											alert("oi! that's not a DXF!");
											return;
										}

										var start = 0;
										var stop = theFile.size - 1;

										var blob = theFile.slice(start, stop);
										reader.readAsText(blob);

										reader.onload = function(e) {
											// var lines =
											// text.split(/[\r\n]+/g);
											dxfText = e.target.result;

											getData(dxfText);
											// console.log(e.target);
										};

									};
								})(fileItem._file);
								// Closure to capture the file information.
								// Read in the image file as a data URL.
								reader.readAsDataURL(fileItem._file);
							};
							$scope.searchcomment = '';
							$scope.foundspaces = [];
							function getFlatObjectArray(dxfObject) {
								var parts = [];
								parts.push(getBareObject(dxfObject));
								getBareChildren(parts, dxfObject);
								return parts;
							}
							function getBareChildren(parts, dxfObject) {
								angular.forEach(dxfObject.c, function(child) {
									parts.push(getBareObject(child));
									getBareChildren(parts, child);
								});
							}
							function getBareObject(dxfObject) {
								return {
									id : dxfObject.id,
									type : dxfObject.type,
									p : JSON.stringify(dxfObject.p)
								}
							}

							function startsWith(str, prefix) {
								return str.indexOf(prefix) === 0;
							}
							function endsWith(str, suffix) {
								return str.match(suffix + "$") == suffix;
							}

							function startsWithIgnoreCase(str, prefix) {
								return str.toUpperCase().indexOf(
										prefix.toUpperCase()) === 0;
							}
							function endsWithIgnoreCase(str, suffix) {
								return str.toUpperCase().match(
										suffix.toUpperCase() + "$") == suffix
										.toUpperCase();
							}

							function getData(text) {
								$scope.data.push([ {
									// console.log([ {
									"x" : 120.0,
									"y" : 225.0
								}, {
									"x" : 83.5,
									"y" : 233.4
								}, {
									"x" : 123.0,
									"y" : 211.0
								}, {
									"x" : 139.0,
									"y" : 125.5
								} ]);
								var l = PlanFactory.getSpaceTypePoly(text).layers;
								// var p =
								// console.log(o);
								// var l = restructureSpaceTypePoly(o).layers;
								// console.log(l);
								$scope.foundspaces = l;
								var newPolys = l[0].f['MTG-BKB'].polys;
								// console.log(newPolys[0]);
								// for (var i = 0; $scope.data.length; i++)
								// $scope.data.pop();
								$scope.data = [];
								for (var i = 0; i < newPolys.length; i++)
									$scope.data.push(newPolys[i]);

								// $scope.polys = l[0].f['OTHFCL-STO-CLD'];
								// var h = PlanFactory.hierarchy(o);
								// var postdata = {
								// spaceid : 0,
								// h : JSON.stringify(h)
								// }
								// console.log(o);
								// console.log(h);
								// console.log('done');
								// //
								// PlanFactory.send('studies/plans/addSpace.php',
								// // postdata).then(function(result) {
								// // console.log(result)
								// // }, function(error) {
								// // console.log(error)
								// // });
								// var promises = [];
								// var f = getFlatObjectArray(o);
								// // console.log(f);
								//
								// // angular.forEach(f, function(elm) {
								// var counter = 0;
								// for (var j = 0; j < f.length; j++) {
								// f[j].spaceid = 0;
								// var promise = $http({
								// url : 'studies/plans/addSpace.php',
								// method : 'POST',
								// data : f[j]
								// });
								// promise.then(function(result) {
								// console.log(result)
								// }, function(error) {
								// console.log(error)
								// });
								// promises.push(promise);
								// }
								// $q.all(promises).then(function(response) {
								// console.log(response);
								// }, function(error) {
								// console.log(error);
								// });
								/*
								 * var blob = new Blob([ JSON.stringify(o) ], {
								 * type : "plain/text" }); blob.name =
								 * 'file.json'; var flow = new Flow({ method :
								 * 'octet', target : HTTPFactory.getBackend() + 'FlowUpload' });
								 * flow.addFile(blob); flow.upload();
								 * flow.on('fileSuccess', function(file,
								 * message) { console.log(file, message); });
								 */
								// flow.on('filesSubmitted', function(file) {
								// flow.upload();// instant upload
								// });
								return;
								// This function identifies the basic parts of a
								// dxf, and cleans it up from
								// unnecessarry fluff, keeping only the
								// layers,blocks and entitites
								// console.log('starting');
								// text = text.replace('\r', '\n');
								// // var lines = text.match(/[^\r\n]+/gm);
								// var lines = text.split('\n');
								// console.log('ending');
								// var blocks = [];
								// var inserts = [];
								// // var entities = [];
								// var readingSection = -1;
								// var readingText = null;
								// var seats = [];
								// var seatsPerBlock = new Array();
								// // 0 reading blocks
								// // 1 reading entities
								// // 2 reading layers
								// // var condensed = [];
								// var readingObject = false;
								// for (var i = 0; i < lines.length; i += 2) {
								// parameter = parseInt(lines[i].trim());
								// while (isNaN(parameter)
								// && i < lines.length - 2) {
								// i++;
								// parameter = parseInt(lines[i].trim());
								// }
								// if (!readingObject) {
								// line = lines[i + 1];
								// if (-1 == readingSection
								// && 2 != parameter)
								// continue;
								// if (-1 != readingSection
								// && (eql(line, "ENDSEC"))) {
								// readingSection = -1;
								// continue;
								// }
								// if (-1 == readingSection) {
								// if (eql(line, "BLOCKS")) {
								// readingSection = 0; // reading
								// // blocks;
								// continue;
								// } else if (eql(line, "ENTITIES")) {
								// readingSection = 1; // reading
								// // entities;
								// continue;
								// }
								// }
								//
								// if (0 != parameter)
								// continue;
								// if (0 == readingSection
								// && eql(line, "BLOCK")) {
								// readingObject = true;
								// continue;
								// }
								// if (1 == readingSection) {
								// readingObject = true;
								// continue;
								// }
								// continue;
								// }
								//
								// line = lines[i + 1];
								// if (0 == readingSection) { // blocks
								// if (0 == parameter) {
								// readingText = null;
								// if (eql(line, "ENDBLK")) {
								// if (seats.length > 0) {
								// // console
								// // .log(blocks[blocks.length
								// // - 1]);
								// seatsPerBlock[blocks[blocks.length - 1]] =
								// seats;
								// // console.log(seats);
								// seats = [];
								// }
								// readingObject = false;
								// continue;
								// } else if (eql(line, "MTEXT")) {
								// readingText = {};
								// } else if (eql(line, "TEXT")) {
								// readingText = 2;
								// }
								// } else if (1 == parameter // mtext-string
								// && readingText) {
								// readingText.text = line;
								// if (readingText.layer) {
								// if (!eql(readingText.layer
								// .toLowerCase(),
								// "@_seatid")) {
								// readingText = null;
								// continue;
								// } else
								// seats.push(readingText);
								//
								// }
								// } else if (8 == parameter // layer
								// && readingText) {
								// readingText.layer = line;
								// if (!eql(readingText.layer
								// .toLowerCase(), "@_seatid")) {
								// readingText = null;
								// continue;
								// }
								// if (readingText.text)
								// seats.push(readingText);
								// }
								// if (2 == parameter) { // parameter 2
								// // is
								// // tha name of tha block
								// var name = line.trim();
								// if (eql(name.slice(0, 2), '@_'))
								// blocks.push(name);
								// }
								// } else if (1 == readingSection) { // entities
								// if (0 == parameter) {
								// i -= 2;
								// readingObject = false;
								// continue;
								// }
								// if (2 == parameter) // parameter 2 is
								// // tha name of tha
								// // block
								// inserts.push(line.trim());
								// }
								// }
								// var validSpaces = [];
								// // console.log('blocks');
								// // for (var i = 0; i < blocks.length; i++)
								// // console.log(i + ' ' + blocks[i]);
								// // console.log('inserts');
								// var foundSomething = '';
								// for (var i = 0; i < inserts.length; i++) {
								// // console.log(i + ' ' + inserts[i]);
								// if ('@_' != inserts[i].substring(0, 2)
								// || -1 == blocks.indexOf(inserts[i]))
								// continue;
								// var nameParts = inserts[i].split('-');
								// if ('' == foundSomething
								// && nameParts.length > 1) {
								// if ('acc' == nameParts[1].toLowerCase()) {
								// foundSomething = 'accommodation layers';
								// } else if ('team' == nameParts[1]
								// .toLowerCase()) {
								// foundSomething = 'team layers';
								// }
								// } else {
								// var name = inserts[i].substring(2)
								// .split('\x28')[0];
								// validSpaces.push(name);
								// var nameParts = name.split("_");
								// $scope.foundspaces.push({
								// alias : name,
								// building : nameParts[0],
								// name : nameParts[1],
								// seats : seatsPerBlock[inserts[i]]
								// });
								// }
								// }
								// validSpaces.sort();
								// var foundobjects = '';
								// // if (!(foundobjects = $('#foundobjects')))
								// {
								// // foundobjects =
								// // document.createElement('div');
								// // foundobjects.setAttribute('id',
								// // 'foundobjects')
								// // }
								// if (validSpaces.length == 0) {
								// foundobjects = 'No valid spaces found...\n';
								// if ('' != foundSomething)
								// foundobjects += '\n...only some '
								// + foundSomething + '...';
								// // $($scope.searchcomment).attr('rows', 2);
								// // $('#fileloader').removeClass('validbox');
								// } else {
								// if (validSpaces.length == 1)
								// foundobjects = '1 valid space found:\n\n';
								// else
								// foundobjects = validSpaces.length
								// + ' valid spaces found\n\n';
								// // validateBox('#fileloader');
								// // $($scope.searchcomment).attr('rows',
								// // validSpaces.length + 2);
								// }
								// $scope.searchcomment = foundobjects;
								// $scope.$apply();

								// $('#fileloader').insertBefore(foundobjects,
								// null);

								// var span = document.createElement('div');
								// $(span).css("text-align", 'left');
								// $(span).css("width", '100%');
								// $(span).css("padding", '3px');
								// span.innerHTML = stripDXF(lines);
								// foundobjects.value += span.innerHTML;

								// for (var i = 0; i < validSpaces.length; i++)
								// {
								// var span = document.createElement('div');
								// $(span).css("text-align", 'left');
								// $(span).css("width", '100%');
								// $(span).css("padding", '3px');
								// span.innerHTML = ' - ' + validSpaces[i];
								// if (i < validSpaces.length - 1)
								// span.innerHTML += '\n';
								// // foundobjects.appendChild(span);
								// $scope.foundobjects.value += span.innerHTML;
								// }
							}
							$scope.selectAllSpaces = function() {
								for (var i = 0; i < $scope.foundspaces.length; i++)
									$scope.foundspaces[i].selected = true;
							};

							$scope.noSelectedSpaces = function() {
								return $scope.foundspaces.length == 0;
							};
							openConfirmModal = function(message, okText,
									cancelText) {
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
							// $scope.deleteSelectedSpaces = function(study) {
							// var spacesToDelete = [];
							// angular.forEach(study.existingSpaces, function(
							// space) {
							// if (space.selected)
							// spacesToDelete.push(space);
							// });
							// if (spacesToDelete.length < 1)
							// return;
							// var message = 'Are you sure you want to delete
							// these spaces?\n\n';
							//
							// angular.forEach(spacesToDelete,
							// function(space) {
							// message += space.alias + '\n';
							// });
							// var ok = 'DELETE';
							// var cancel = 'Cancel'
							// openConfirmModal(message, ok, cancel).result
							// .then(
							// function() {
							// console
							// .log('create delete function');
							// }, function() {
							// });
							// // jQuery.noConflict();
							// // bootbox.confirm("Are you sure?", function(
							// // result) {
							// // console.log("Confirm result: " + result);
							// // });
							// }

							function eql(str1, str2) {
								return str1.trim().toLowerCase() == str2
										.toLowerCase()
							}
							var rounds = 0;
							var days = 0;

							$scope.addDXF = function(study) {
								// var selectedSpaces = [];
								// for (var i = 0; i <
								// $scope.foundspaces.length; i++)
								// if ($scope.foundspaces[i].selected)
								// // selectedSpaces.push("@_"
								// // + $scope.foundspaces[i].alias);
								// selectedSpaces
								// .push($scope.foundspaces[i]);
								// PlanFactory.uploadSpaces(study, dxfText,
								// selectedSpaces);
								var data = {
										studyid : study.id,
									spaces : $scope.foundspaces
								}
								var deferred = $q.defer(), httpPromise = $http
										.post(backend + 'StorePolygons', data);

								httpPromise.then(function(response) {
									deferred.resolve(response);
								}, function(error) {
									console.error(error);
								});

								return deferred.promise;
							}
							// function submitFunc() {
							// if ($('#dxfstore').val().trim().length == 0) {
							// var data;
							// if (dxfText)
							// data = stripDXF(dxfText);
							// else if ($('#file').val().trim().length != 0) {
							// $('#file').onchange();
							// data = stripDXF(dxfText);
							// } else
							// return false;
							// $('#dxfstore').val(data);
							// }
							// $('input[name=file]').val("");
							// return true;
							// }
						} ]);
app.directive("planViewer", [
		'PolyFactory',
		function(PolyFactory) {
			// var polys = PolyFactory.getPolys();
			var directiveDefinitionObject = {
				restrict : 'E',
				// this is important,
				// we don't want to overwrite our directive declaration
				// in the HTML mark-up
				// replace : false,
				scope : {
					polys : '='
				},
				link : function(scope, element, attrs) {
					// converting all data passed thru into an array
					// var data = attrs.chartData.split(',');
					// in D3, any selection[0] contains the group
					// selection[0][0] is the DOM node
					// but we won't need that this time

					var margin = {
						top : -5,
						right : -5,
						bottom : -5,
						left : -5
					}, width = 960 - margin.left - margin.right, height = 500
							- margin.top - margin.bottom;

					var zoom = d3.behavior.zoom().scaleExtent([ 0.1, 100 ]).on(
							"zoom", zoomed);
					var drag = d3.behavior.drag().origin(function(d) {
						return d;
					}).on("dragstart", dragstarted).on("drag", dragged).on(
							"dragend", dragended);

					var svg = d3.select(element[0]).append("svg:svg").attr(
							'height', '500px').attr('width', '100%')
							.append("g").attr(
									"transform",
									"translate(" + margin.left + ","
											+ margin.right + ")").call(zoom);

					var rect = svg.append("rect").attr('height', '500px').attr(
							'width', '100%').style("fill", "none").style(
							"pointer-events", "all");
					var grp = svg.append("g");

					function zoomed() {
						grp.attr("transform", "translate(" + d3.event.translate
								+ ")scale(" + d3.event.scale + ")");
					}

					function dragstarted(d) {
						d3.event.sourceEvent.stopPropagation();
						d3.select(this).classed("dragging", true);
					}

					function dragged(d) {
						d3.select(this).attr("cx", d.x = d3.event.x).attr("cy",
								d.y = d3.event.y);
					}

					function dragended(d) {
						d3.select(this).classed("dragging", false);
					}
					// .append("g")
					// .attr("transform", "translate(" + margin.left + "," +
					// margin.right + ")")
					// .call(zoom);

					// var poly = [ {
					// "x" : 0.0,
					// "y" : 25.0
					// }, {
					// "x" : 8.5,
					// "y" : 23.4
					// }, {
					// "x" : 13.0,
					// "y" : 21.0
					// }, {
					// "x" : 19.0,
					// "y" : 15.5
					// } ];
					// to our original directive markup bars-chart
					// we add a div with out chart stling and bind each
					// data entry to the chart

					scope.$watch('polys', function(newPolys, oldPolys) {
						grp.selectAll("polygon").remove();
						grp.selectAll("polygon").data(newPolys).enter().append(
								"polygon").attr("points", function(d) {
							return d.map(function(d) {
								return [ d.x, d.y ].join(",");
							}).join(" ");
						});
						// chart.selectAll("polygon").exit().remove();

					}, true);
					// .selectAll('div').data(
					// scope.data).enter().append("div").transition().ease(
					// "elastic").style("width", function(d) {
					// return d + "%";
					// }).text(function(d) {
					// return d + "%";
					// });

					// a little of magic: setting it's width based
					// on the data value (d)
					// and text all with a smooth transition
				}
			};
			return directiveDefinitionObject;
		} ]);
