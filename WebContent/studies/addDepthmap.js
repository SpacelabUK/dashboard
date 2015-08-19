var propIdentifier = 'PROPERTIES';
app
		.controller(
				'addDepthmapInstance',
				[
						'$scope',
						'$modalInstance',
						'$http',
						'$modal',
						'$q',
						'study',
						'FileUploader',
						'PlanFactory',
						'HTTPFactory',
						function($scope, $modalInstance, $http, $modal, $q, study,
								FileUploader, PlanFactory, HTTPFactory) {
							"use strict";
							$scope.study = study;
							$scope.predicate = 'building';
							$scope.layerpredicate = 'name';
							$scope.cancel = function() {
								$modalInstance.dismiss('cancel');
							};
							$scope.depthmapTypes = [
									"General", "Visibility", "Essence", "Accessibility"
							];
							$scope.properties = {};
							HTTPFactory.backendGet(
									'Occupancy?t=depthmap_types&obsid=' + study.id).then(
									function(response) {
										$scope.depthmapTypes = response.data.map(function(element) {
											return element.type;
										});
									}, function(error) {
										console.log(error);
									});

							// function endsWith(str, suffix) {
							// return str.indexOf(suffix, str.length - suffix.length) !== -1;
							// }

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
							function eql(str1, str2) {
								return str1.trim().toLowerCase() === str2.toLowerCase();
							}
							var csvuploader = $scope.csvuploader = new FileUploader({
								url : HTTPFactory.getBackend() + 'StoreDepthmap'
							});
							var dxfuploader = $scope.dxfuploader = new FileUploader();
							// FILTERS
							csvuploader.filters.push({
								name : 'customFilter',
								fn : function(item, options) {
									return this.queue.length < 10;
								}
							});
							var csvflow = new Flow({
								method : 'octet',
								target : HTTPFactory.getBackend() + 'StoreDepthmap',
								query : {
									studyid : $scope.study.id
								}
							});
							dxfuploader.filters.push({
								name : 'customFilter',
								fn : function(item, options) {
									return this.queue.length < 10;
								}
							});
							var dxfflow = new Flow({
								method : 'octet',
								target : HTTPFactory.getBackend() + 'StoreDepthmap',
								query : {
									studyid : $scope.study.id
								}
							});

							var dxfText = {};
							csvuploader.onAfterAddingFile = function(fileItem) {
								var reader = new FileReader();
								reader.onload = (function(theFile) {
									return function(e) {
										if (!endsWith(theFile.name, 'csv')) {
											alert("oi! that's not a CSV!");
											return;
										}
										csvflow.addFile(theFile);
										csvflow.upload();
										csvflow.on('fileSuccess', function(file, message) {
											var data = JSON.parse(message);
											afterCSVaddition(data);
										});
									};
								})(fileItem._file);
								reader.readAsDataURL(fileItem._file);
							};
							dxfuploader.onAfterAddingFile = function(fileItem) {
								console.info(fileItem);
								var reader = new FileReader();
								reader.onload = (function(theFile) {
									return function(e) {
										if (!endsWith(theFile.name, 'dxf')) {
											alert("oi! that's not a DXF!");
											return;
										}

										dxfflow.addFile(theFile);
										dxfflow.upload();
										dxfflow.on('fileSuccess', function(file, message) {
											console.log(message);
											var data = JSON.parse(message);
											afterDXFaddition(data);
										});
									};
								})(fileItem._file);
								reader.readAsDataURL(fileItem._file);
							};
							function afterCSVaddition(data) {
								$scope.csvData = data;
							}
							function afterDXFaddition(data) {
								$scope.dxfData = data;
							}
							$scope.dataInvalid = function() {
								return !($scope.properties.name &&
										$scope.properties.name.trim().length > 0 &&
										$scope.properties.type && $scope.properties.type.trim().length > 0);
							};
							$scope.submit = function(study) {
								var data = {
									studyid : study.id,
									fileidCSV : $scope.csvData.fileid,
									fileidDXF : $scope.dxfData.fileid,
									type : $scope.properties.type,
									name : $scope.properties.name,
								};
								HTTPFactory.backendPost("StoreDepthmap", data);
							};
							csvuploader.onBeforeUploadItem = function(item) {
								item.formData.push({
									studyid : study.id,
									spaces : JSON.stringify($scope.foundspaces)
								});
							};
							csvuploader.onCompleteItem = function(item, response, status,
									headers) {
								console.log(item);
								console.log(response);
								console.log(status);
								console.log(headers);
							};
						}
				]);
app.directive("depthmapViewer", [
	function() {
		"use strict";
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
				// var margin = {
				// top : -5,
				// right : -5,
				// bottom : -5,
				// left : -5
				// }, width = 960 - margin.left - margin.right, height = 500
				// - margin.top - margin.bottom;
				//
				// var zoom = d3.behavior.zoom().scaleExtent([ 0.1, 100
				// ]).on("zoom",
				// zoomed);
				// var drag = d3.behavior.drag().origin(function(d) {
				// return d;
				// }).on("dragstart", dragstarted).on("drag", dragged).on("dragend",
				// dragended);
				//
				// var svg = d3.select(element[0]).append("svg:svg").attr('height',
				// '500px').attr('width', '100%').append("g").attr(
				// "transform",
				// "translate(" + margin.left + "," + margin.right + ")")
				// .call(zoom);
				//
				// var rect = svg.append("rect").attr('height',
				// '500px').attr('width',
				// '100%').style("fill", "none")
				// .style("pointer-events", "all");
				// var grp = svg.append("g");
				//
				// function zoomed() {
				// grp.attr("transform", "translate(" + d3.event.translate
				// + ")scale(" + d3.event.scale + ")");
				// }
				//
				// function dragstarted(d) {
				// d3.event.sourceEvent.stopPropagation();
				// d3.select(this).classed("dragging", true);
				// }
				//
				// function dragged(d) {
				// d3.select(this).attr("cx", d.x = d3.event.x).attr("cy",
				// d.y = d3.event.y);
				// }
				//
				// function dragended(d) {
				// d3.select(this).classed("dragging", false);
				// }
				// // .append("g")
				// // .attr("transform", "translate(" + margin.left + "," +
				// // margin.right + ")")
				// // .call(zoom);
				//
				// // var poly = [ {
				// // "x" : 0.0,
				// // "y" : 25.0
				// // }, {
				// // "x" : 8.5,
				// // "y" : 23.4
				// // }, {
				// // "x" : 13.0,
				// // "y" : 21.0
				// // }, {
				// // "x" : 19.0,
				// // "y" : 15.5
				// // } ];
				// // to our original directive markup bars-chart
				// // we add a div with out chart stling and bind each
				// // data entry to the chart
				//
				// scope.$watch('polys', function(newPolys, oldPolys) {
				// grp.selectAll("polygon").remove();
				// grp.selectAll("polygon").data(newPolys).enter().append(
				// "polygon").attr("points", function(d) {
				// return d.map(function(d) {
				// return [ d.x, d.y ].join(",");
				// }).join(" ");
				// });
				// // chart.selectAll("polygon").exit().remove();
				//
				// }, true);
			}
		};
		return directiveDefinitionObject;
	}
]);
