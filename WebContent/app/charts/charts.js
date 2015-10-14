var spacelabColours = [
		'#2DC3F0', '#F2902A', '#BA56A0', '#6D4FA0', '#75BF44', '#FFF200',
		'#838280', '#2A3890', '#EB008C', '#A5DFF6', '#D6A3CA', '#A897C8',
		'#B6DA9A', '#F6B387', '#442A79', '#006738', '#57595B'
]
angular
		.module('app.core')
		.directive(
				"doughnutChart",
				[

					function() {
						var directiveDefinitionObject = {
							restrict : 'E',
							scope : {
								parts : '=',
								labels : '=',
								showText : '=',
								showOnlyFirst : '=',
								colours : '='
							},
							link : function(scope, element, attrs) {

								var width = 250, height = 250, radius = Math.min(width, height) / 2;

								var pie = d3.layout.pie().sort(null);

								var arc = d3.svg.arc().innerRadius(radius - 75).outerRadius(
										radius - 25);

								var svg = d3.select(element[0]).append("svg").attr("width",
										width).attr("height", height).append("g").attr("transform",
										"translate(" + width / 2 + "," + height / 2 + ")");

								// var path = svg.selectAll("path").data(pie(scope.parts))
								// .enter().append("path").attr("fill",
								// function(d, i) {
								// return spacelabColours[i];
								// }).attr("d", arc);
								// if (scope.showText) {
								// if (scope.showOnlyFirst) {
								// svg.append("text")
								// // .attr("transform", function(d) {
								// // return "translate(" + arc.centroid(d) + ")"; })
								// // .attr("dy", ".35em")
								// .attr('font-family', 'Apercu,serif').attr(
								// 'font-size', '30px').attr("transform",
								// "translate(" + 0 + "," + 10 + ")").style(
								// "text-anchor", "middle").text(function(d) {
								// return scope.parts[0];
								// });
								// }
								// }

								scope.$watch('parts', function(newParts, oldParts) {
									svg.selectAll("path").remove();
									var path = svg.selectAll("path").data(pie(scope.parts))
											.enter().append("path").attr("fill", function(d, i) {
												return spacelabColours[i];
											}).attr("d", arc);

									if (scope.showText) {
										if (scope.showOnlyFirst) {
											svg.selectAll("text").remove();
											svg.append("text")
											// .attr("transform", function(d) {
											// return "translate(" + arc.centroid(d) + ")";
											// })
											// .attr("dy", ".35em")
											.attr('font-family', 'Apercu,serif').attr('font-size',
													'30px').attr("transform",
													"translate(" + 0 + "," + 10 + ")").style(
													"text-anchor", "middle").text(function(d) {
												if (scope.labels)
													return scope.labels[0];
												else
													return scope.parts[0];
											});
										}
									}
								}, true);
							}
						};
						return directiveDefinitionObject;
					}
				]);
angular
		.module('app.core')
		.directive(
				"responsiveDoughnutChart",
				[

					function() {
						var directiveDefinitionObject = {
							restrict : 'E',
							scope : {
								parts : '=',
								labels : '=',
								showText : '=',
								showOnlyFirst : '=',
								colours : '=',
								title : '='
							},
							link : function(scope, element, attrs) {

								var width = 250, height = 250, radius = Math.min(width, height) / 2;

								var pie = d3.layout.pie().sort(null);

								var arc = d3.svg.arc().innerRadius(radius - 75).outerRadius(
										radius - 25);

								var svg = d3.select(element[0]).append("svg")
								// .attr("width",
								// width)
								.attr("height", "100%").attr("width", "100%").attr(
										"preserveAspectRatio", "xMidYMid meet").attr("viewBox",
										"0 0 " + width + " " + height).append("g").attr(
										"transform",
										"translate(" + width / 2 + "," + height / 2 + ")");

								scope.$watch('parts', function(newParts, oldParts) {
									svg.selectAll("path").remove();
									var path = svg.selectAll("path").data(pie(scope.parts))
											.enter().append("path").attr("fill", function(d, i) {
												return spacelabColours[i];
											}).attr("d", arc);
									if (scope.showText) {
										if (scope.showOnlyFirst) {
											svg.selectAll("text").remove();
											// svg.append("text").style("text-anchor",
											// "middle")
											// .attr("y", 150)
											// .text(scope.title);
											svg.append("text")
											// .attr("transform", function(d) {
											// return "translate(" +
											// arc.centroid(d) + ")";
											// })
											// .attr("dy", ".35em")
											.attr('font-family', 'Apercu,serif').attr('font-size',
													'30px').attr("transform",
													"translate(" + 0 + "," + 10 + ")").style(
													"text-anchor", "middle").text(function(d) {
												if (scope.labels)
													return scope.labels[0];
												else
													return scope.parts[0];
											});
										}
									}
								}, true);
							}
						};
						return directiveDefinitionObject;
					}
				]);
angular
		.module('app.core')
		.directive(
				"doughnutChartEr",
				[
					function() {
						var directiveDefinitionObject = {
							restrict : 'E',
							scope : {
								data : '=',
								// labels : '=',
								showText : '=',
								showOnlyFirst : '=',
								colours : '=',
								showLegend : '=',
								title : '=',
								noOfDecimals : '=',
								units : '='

							},
							link : function(scope, element, attrs) {

								var width = 400, height = 250, radius = Math.min(width, height) / 2;

								var pie = d3.layout.pie().sort(null).value(function(d) {
									return d.value;
								});

								var legendRectSize = 10; // NEW
								var legendSpacing = 4; // NEW

								var arc = d3.svg.arc().innerRadius(radius - 75).outerRadius(
										radius - 25);

								var svg = d3.select(element[0]).append("svg")
								// .attr("width",
								// width)
								.attr("height", "100%").attr("width", "100%").attr(
										"preserveAspectRatio", "xMidYMid meet").attr("viewBox",
										"0 0 " + width + " " + height).append("g").attr(
										"transform",
										"translate(" + width / 3 + "," + height / 2 + ")");
								scope.$watch('data', function(newData) {
									svg.selectAll("path").remove();
									console.log(scope);
									if (!scope.noOfDecimals && scope.noOfDecimals != 0)
										scope.noOfDecimals = 2;
									var prop = newData.properties[0].alias;
									var data = [];
									for (var i = 0; i < newData.keys.length; i++) {
										var key = newData.keys[i].alias;
										var obj = {
											key : key,
											value : newData.data[key][prop]
										};
										if ('name' in newData.keys[i])
											obj.key = newData.keys[i].name
										data.push(obj);
									}
									// var path =
									// svg.selectAll("path").data(pie(data)).enter().append(
									// "path").attr("fill", function(d, i) {
									// return spacelabColours[i];
									// }).attr("d", arc);

									var g = svg.selectAll(".arc").data(pie(data)).enter().append(
											"g").attr("class", "arc");

									g.append("path").attr("d", arc).style("fill", function(d, i) {
										return spacelabColours[i];
									});
									// if(scope.title) svg.append("text").style("text-anchor",
									// "middle")
									// .attr("y", 150)
									// .text(scope.title);
									if (scope.showText) {
										if (scope.showOnlyFirst) {
											svg.selectAll("text").remove();

											svg.append("text")
											// .attr("transform", function(d) {
											// return "translate(" +
											// arc.centroid(d) + ")";
											// })
											// .attr("dy", ".35em")
											.attr('font-family', 'Apercu,serif').attr('font-size',
													'20px').attr("transform",
													"translate(" + 0 + "," + 10 + ")").style(
													"text-anchor", "middle").text(function(d) {
												// if (scope.keys)
												return scope.keys[0].alias;
												// return 'lol';
												// else
												// return scope.parts[0];
											});
										} else {
											g.append("text").attr("transform", function(d) {
												return "translate(" + arc.centroid(d) + ")";
											}).attr("dy", ".25em").style("text-anchor", "middle")
													.attr('font-family', 'Apercu,serif').style(
															'font-size', '10px').style('fill', '#ffffff')
													.text(function(d) {
														// return d.data.age;
														// return d.data.key;
														var r = d.value.toFixed(scope.noOfDecimals);
														if (scope.units)
															r += scope.units;
														return r;
													});
										}
									}
									if (scope.showLegend) {
										var legend = svg.selectAll('.legend') // NEW
										.data(data) // NEW
										.enter() // NEW
										.append('g') // NEW
										.attr('class', 'legend') // NEW
										.attr('transform', function(d, i) { // NEW
											var height = legendRectSize + legendSpacing; // NEW
											var offset = height * data.length / 2; // NEW
											var horz = radius * 1.2 - 2 * legendRectSize; // NEW
											var vert = i * height - offset; // NEW
											return 'translate(' + horz + ',' + vert + ')'; // NEW
										}); // NEW

										legend.append('rect') // NEW
										.attr('width', legendRectSize) // NEW
										.attr('height', legendRectSize) // NEW
										.style('fill', function(d, i) {
											return spacelabColours[i]
										}) // NEW
										.style('stroke', function(d, i) {
											return spacelabColours[i]
										}); // NEW

										legend.append('text') // NEW
										.attr('x', legendRectSize + legendSpacing) // NEW
										.attr('y', legendRectSize - legendSpacing * 0.5) // NEW
										.attr('font-family', 'Apercu,serif').style('font-size',
												'10px').text(function(d) {
											return d.key;
										}); // NEW
									}
									svg.append("text").attr('font-family', 'Apercu,serif').attr(
											'font-size', '20px').attr("transform",
											"translate(" + 0 + "," + (-radius + 15) + ")").style(
											"text-anchor", "middle").text(function(d) {
										return scope.title;
									});
								}, true);
							}
						};
						return directiveDefinitionObject;
					}
				]);
angular.module('app.core').directive(
		"simpleLineChart",
		[

			function() {
				var directiveDefinitionObject = {
					restrict : 'E',
					scope : {
						parts : '='
					},
					link : function(scope, element, attrs) {
						/* implementation heavily influenced by http://bl.ocks.org/1166403 */

						// define dimensions of graph
						var m = [
								80, 80, 80, 80
						]; // margins
						var w = 1000 - m[1] - m[3]; // width
						var h = 400 - m[0] - m[2]; // height

						// create a simple data array that we'll plot with a line (this
						// array represents only the Y values, X will just be the index
						// location)

						// X scale will fit all values from data[] within pixels 0-w

						// create a line function that can convert data[] into x and y
						// points

						// Add an SVG element with the desired dimensions and margin.
						var graph = d3.select(element[0]).append("svg:svg").attr("width",
								w + m[1] + m[3]).attr("height", h + m[0] + m[2])
								.append("svg:g").attr("transform",
										"translate(" + m[3] + "," + m[0] + ")");

						// Add the line by appending an svg:path element with the data line
						// we created above
						// do this AFTER the axes above so that the line is above the
						// tick-lines

						scope.$watch('parts', function(newParts, oldParts) {
							// console.log(newParts);
							var line = d3.svg.line().x(function(d, i) {
								return x(i);
							}).y(function(d) {
								return y(d);
							})
							var x = d3.scale.linear().domain([
									0, newParts.length
							]).range([
									0, w
							]);
							// Y scale will fit values from 0-10 within pixels h-0 (Note the
							// inverted domain for the y-scale: bigger is up!)
							var max = -1000000;
							var min = 1000000;
							for (var i = 0; i < newParts.length; i++) {
								if (parseInt(newParts[i]) < min)
									min = parseInt(newParts[i]);
								if (parseInt(newParts[i]) > max)
									max = parseInt(newParts[i]);
							}
							var y = d3.scale.linear().domain([
									min, max
							]).range([
									h, 0
							]);
							// automatically determining max range can work something like
							// this
							// var y = d3.scale.linear().domain([0, d3.max(data)]).range([h,
							// 0]);

							// create yAxis
							var xAxis = d3.svg.axis().scale(x).tickValues([
									8, 16, 24, 32, 40
							]);
							// Add the x-axis.
							graph.selectAll('g').remove();
							graph.append("svg:g").attr("class", "x axis").attr("transform",
									"translate(0," + h + ")").attr('fill', 'none').attr('stroke',
									'black').call(xAxis);

							// create left yAxis
							var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left");
							// Add the y-axis to the left
							graph.append("svg:g").attr("class", "y axis").attr("transform",
									"translate(-25,0)").attr('fill', 'none').attr('stroke',
									'black').call(yAxisLeft);
							graph.selectAll('path').remove();
							graph.append("svg:path").attr("d", line(newParts)).attr('fill',
									'none').attr('stroke', 'black');
						}, true);
					}
				};
				return directiveDefinitionObject;
			}
		]);
angular.module('app.core').directive(
		"responsiveLineChart",
		[

			function() {
				var directiveDefinitionObject = {
					restrict : 'E',
					scope : {
						parts : '='
					},
					link : function(scope, element, attrs) {
						/* implementation heavily influenced by http://bl.ocks.org/1166403 */

						// define dimensions of graph
						var m = [
								80, 80, 80, 80
						]; // margins
						var w = 1000 - m[1] - m[3]; // width
						var h = 400 - m[0] - m[2]; // height
						var svg = d3.select(element[0]).append("svg:svg")
						// .attr("width",
						// w + m[1] + m[3]).attr("height", h + m[0] + m[2])
						.attr("preserveAspectRatio", "xMidYMid meet").attr("viewBox",
								"0 0 " + (w + m[1] + m[3]) + " " + (h + m[0] + m[2]));
						var graph = svg.append("svg:g").attr("transform",
								"translate(" + m[3] + "," + m[0] + ")");

						// Add the line by appending an svg:path element with the data line
						// we created above
						// do this AFTER the axes above so that the line is above the
						// tick-lines

						scope.$watch('parts', function(newParts, oldParts) {
							// console.log(newParts);
							var line = d3.svg.line().x(function(d, i) {
								return x(i);
							}).y(function(d) {
								return y(d);
							})
							var x = d3.scale.linear().domain([
									0, newParts.length
							]).range([
									0, w
							]);
							// Y scale will fit values from 0-10 within pixels h-0 (Note the
							// inverted domain for the y-scale: bigger is up!)
							var max = -1000000;
							var min = 1000000;
							for (var i = 0; i < newParts.length; i++) {
								if (parseInt(newParts[i]) < min)
									min = parseInt(newParts[i]);
								if (parseInt(newParts[i]) > max)
									max = parseInt(newParts[i]);
							}
							var y = d3.scale.linear().domain([
									min, max
							]).range([
									h, 0
							]);
							// automatically determining max range can work something like
							// this
							// var y = d3.scale.linear().domain([0, d3.max(data)]).range([h,
							// 0]);

							// create yAxis
							var xAxis = d3.svg.axis().scale(x).tickValues([
									8, 16, 24, 32, 40
							]);
							// Add the x-axis.
							graph.selectAll('g').remove();
							graph.append("svg:g").attr("class", "x axis").attr("transform",
									"translate(0," + h + ")").attr('fill', 'none').attr('stroke',
									'black').call(xAxis);

							// create left yAxis
							var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left");
							// Add the y-axis to the left
							graph.append("svg:g").attr("class", "y axis").attr("transform",
									"translate(-25,0)").attr('fill', 'none').attr('stroke',
									'black').call(yAxisLeft);
							graph.selectAll('path').remove();
							graph.append("svg:path").attr("d", line(newParts)).attr('fill',
									'none').attr('stroke', 'black');
						}, true);
					}
				};
				return directiveDefinitionObject;
			}
		]);

angular.module('app.core').directive(
		"snapshotViewer",
		[
			function() {
				var directiveDefinitionObject = {
					restrict : 'E',
					scope : {
						image : '=',
						entitydata : '='
					},
					link : function(scope, element, attrs) {
						"use strict";
						/*
						 * implementation heavily influenced by http://bl.ocks.org/1166403
						 */

						// define dimensions of graph
						var m = [
								80, 80, 80, 80
						]; // margins
						var w = 1000 - m[1] - m[3]; // width
						var h = 400 - m[0] - m[2]; // height
						var svg = d3.select(element[0]).append("svg:svg");
						// var graph = svg.append(
						// "svg:g").attr("transform",
						// "translate(" + m[3] + "," + m[0] + ")");

						// Add the line by appending an svg:path element
						// with the data line
						// we created above
						// do this AFTER the axes above so that the line is
						// above the
						// tick-lines
						var lineFunction = d3.svg.line().x(function(d) {
							return d.x;
						}).y(function(d) {
							return d.y;
						}).interpolate("linear");
						scope.$watchCollection('[image,entitydata]', function(newValues,
								oldValues) {
							var i;
							// console.log(newParts);
							var newImage = newValues[0];
							var entityData = newValues[1];
							var newEntities = entityData.entities;
							var interactionHulls = entityData.interactionHulls;
							for (i = 0; i < interactionHulls.length; i++) {
								interactionHulls[i].points = JSON
										.parse(interactionHulls[i].points);
							}
							var interactions = {};
							for (var e = 0; e < newEntities.length; e++) {
								i = newEntities[e].interaction;
								if (i == -1)
									continue;
								if (!interactions[i])
									interactions[i] = {
										id : i,
										entities : []
									};
								interactions[i].entities.push(newEntities[e]);
							}
							var interactionsArray = d3.values(interactions);
							var limits = entityData.spaceLimits;
							var rangeX = limits.max_x - limits.min_x;
							var rangeY = limits.max_y - limits.min_y;
							var iRangeX = 1.0 / rangeX;
							var iRangeY = 1.0 / rangeY;

							var img = new Image();
							img.src = newImage;
							img.onload = function() {
								var width = this.width;
								var height = this.height;

								var x = function(x) {
									return (-limits.min_x + parseFloat(x)) * iRangeX * width;
								}
								var y = function(y) {
									return height - (-limits.min_y + parseFloat(y)) * iRangeY *
											height;
								}

								svg.attr("preserveAspectRatio", "xMidYMid meet").attr(
										"viewBox", "0 0 " + (width) + " " + (height));
								svg.selectAll("image").remove();
								svg.append("svg:image").attr('x', 0).attr('y', 0).attr(
										'height', height).attr('width', width).attr('xlink:href',
										newImage);

								svg.selectAll("circle").remove();
								var div = d3.select("body").append("div").attr("class",
										"d3tooltip").style("opacity", 0);
								function getCommentText(d) {
									if (d.user_comment)
										return "<br/>Comment: " + d.user_comment;
									else
										return '';
								}
								function getStateText(d) {
									if (d.state == 1)
										return '<br/>Sitting';
									if (d.state == 2)
										return '<br/>Standing';
									if (d.state == 3)
										return '<br/>Walking';
									// if (d.state == -3)
									// return 'comment';
									return '';
								}

								svg.selectAll('g.interaction_hull').data(interactionHulls)
										.enter().append('g').attr('class', 'interaction_hull')
										.attr('id', function(d) {
											return 'ihull-' + d.interaction_id;
										}).append("path").attr("d", function(d) {
											var data = d.points.map(function(p) {
												return {
													x : x(p.x),
													y : y(p.y)
												}
											});
											return lineFunction(data);
										}).attr("stroke", "black").attr("stroke-width", 2).attr(
												"fill", "rgba(200,200,200,0.3)").on(
												"mouseover",
												function(d) {
													var ents = d3.selectAll('.itr-' + d.interaction_id);
													ents.transition().duration(50).style('stroke',
															'rgba(255,255,0,1)').style('stroke-width', 2);
													// var ents = interactions[d.interaction_id].entities;
													// console.log(ents);
													// for (var i = 0; i < ents.length; i++) {
													// ents[i].selected = true;
													// }
												}).on(
												"mouseout",
												function(d) {
													var ents = d3.selectAll('.itr-' + d.interaction_id);
													ents.transition().duration(200).style('stroke',
															'rgba(0,0,0,0)').style('stroke-width', 0);
													// var ents = interactions[d.interaction_id].entities;
													// console.log(ents);
													// for (var i = 0; i < ents.length; i++) {
													// ents[i].selected = true;
													// }
												});
								var ents = svg.selectAll("g").data(newEntities).enter().append(
										"g");
								ents.append("circle").on(
										"mouseover",
										function(d) {
											if (d.state == 0 || d.state == -1)
												return;
											d3.select(this).transition().duration(50).style('stroke',
													'rgba(255,255,0,1)').style('stroke-width', 2);

											div.transition().duration(200).style("opacity", .9);
											div.html(
													'ID:' + d.entity_id + getStateText(d) +
															getCommentText(d)).style("left",
													(d3.event.pageX + 10) + "px").style("top",
													(d3.event.pageY - 28) + "px");
											// "left", (d3.select(this).attr("cx")) +
											// "px").style("top",
											// (d3.select(this).attr("cy")) + "px");
										}).on(
										"mouseout",
										function(d) {
											d3.select(this).transition().duration(200).style(
													'stroke', 'rgba(0,0,0,0)').style('stroke-width', 0);
											div.transition().duration(500).style("opacity", 0);
										}).attr("cx", function(d) {
									return x(d.cx);
								}).attr("cy", function(d) {
									return y(d.cy);
								}).attr("r", function(d) {
									return width * .30 * iRangeX;
								}).style("fill", function(d) {
									if (d.state == 1)
										return 'rgb(0,255,0)';
									if (d.state == 2)
										return 'red';
									if (d.state == 3)
										return 'blue';
									if (d.state == -3)
										return 'magenta';
									return 'none';
								}).style("stroke", '').attr('class', function(d) {
									if (d.interaction === -1)
										return '';
									return 'itr-' + d.interaction;
								});

								ents.append("text").attr("x", function(d) {
									return x(d.cx);
								}).attr("y", function(d) {
									return y(d.cy);
								}).attr("dy", ".35em").attr('pointer-events', 'none').text(
										function(d) {
											return d.user_comment ? '?' : '';
										});
								/**
								 * leave the below for editing mode as it's more accurate
								 * (produces all lines between interacting entities)
								 */
								// svg.selectAll('g.interaction').data(interactionsArray).enter()
								// .append('g').attr('class', 'interaction').append("path")
								// .attr("d", function(d) {
								// var data = [];
								// for (var i = 0; i < d.entities.length; i++) {
								// for (var j = i + 1; j < d.entities.length; j++) {
								// data.push({
								// x : x(d.entities[i].cx),
								// y : y(d.entities[i].cy)
								// });
								// data.push({
								// x : x(d.entities[j].cx),
								// y : y(d.entities[j].cy)
								// });
								// }
								// }
								// return lineFunction(data);
								// }).attr("stroke", "rgba(0,0,255,0.5)").attr("stroke-width",
								// 2).attr("fill", "none");
							}
						}, true);
					}
				};
				return directiveDefinitionObject;
			}
		]);
angular.module('app.core').directive(
		'circleDiagram',
		[
			function() {
				var directiveDefinitionObject = {
					restrict : 'E',
					scope : {
						disks : '=',
						edges : '=',
						nodes : '=',
						options : '='
					},
					link : function(scope, element, attrs) {
						"use strict";
						var width = 600;
						var height = 600;
						var sizeMult = scope.options.sizeMult;
						var gravMult = scope.options.gravMult;
						var restLength = scope.options.restLength;
						var nodes = scope.nodes;
						var edges = scope.edges;
						var markerLength = 10;
						var centreNode = {
							name : "Centre",
							x : width * 0.5,
							y : height * 0.5,
							size : 2,
							fixed : true,
							invisible : true,
							type : 'centre'
						};
						nodes.push(centreNode);
						var maxSize = 1;
						var force = d3.layout.force().nodes(nodes).links(edges).size([
								600, 600
						])
								.linkDistance(
										function(d) {
											if (d.source.type === 'centre')
												return (50 + 200 - 200 * (d.target.size) /
														(1.0 * maxSize)) /
														Math.sqrt(gravMult);
											if (d.type === 'push')
												return 400 / Math.sqrt(gravMult);
											return restLength / Math.sqrt(gravMult);
										}).linkStrength(function(d) {
									if (d.source.type === 'centre')
										// return maxSize / (1.0 * d.target.size);
										return 1;
									if (d.type === 'push')
										return d.source.fixed || d.target.fixed ? 0 : 0.025;
									return 0.2;
								}).gravity(0).charge(function(d) {
									// if (d === centreNode)
									return -30;
									// return -d.size * 0.01;
								}).on("tick", tick).start();
						var svg = d3.select(element[0]).append("svg:svg").attr('width',
								'100%').attr('height', '100%').attr('viewBox', '0 0 600 600');
						svg.append("defs").append("marker").attr("id", "marker").attr(
								"viewBox", "0 -5 10 10").attr("refX", 5).attr("refY", 0).attr(
								"markerWidth", 10).attr("markerHeight", 10).attr("orient",
								"auto").append("path").attr("d", "M0,-3L10,0L0,3").attr('fill',
								'#828282');

						var oc, ed, nd, ci, tx;

						var disks = scope.disks.sort(function(d1, d2) {
							return d2.size - d1.size;
						});
						oc = svg.selectAll('.disk').data(disks).enter().append('circle')
								.attr('class', 'disk').attr('r', function(d) {
									return d.size;
								}).attr('cx', 300).attr('cy', 300).style('fill', function(d) {
									return d.fill;
								});
						function updateNodes() {
							if (scope.options.sizeMult)
								sizeMult = scope.options.sizeMult;
							if (scope.options.gravMult)
								gravMult = scope.options.gravMult;

							ed = svg.selectAll(".link").data(edges);

							var edE = ed.enter().append('path').attr('class', function(d) {
								var cl = 'link';
								cl += ' type-' + d.type;
								cl += ' src-' + nodes.indexOf(d.source);
								cl += ' tar-' + nodes.indexOf(d.target);
								return cl;
							});

							edE.attr("marker-end", "url(#marker)").attr('stroke', '#828282');

							ed.exit().remove();
							// DATA JOIN
							// Join new data with old elements, if any.
							nd = svg.selectAll('.node').data(nodes, function(n) {
								return n.id
							});

							// UPDATE
							// Update old elements as needed.

							nd.selectAll('circle').attr('r', function(n) {
								return n.size * sizeMult;
							});
							nd.selectAll('text').text(function(n) {
								return n.name;
							});

							// ENTER
							// Create new elements as needed.
							var ndE = nd.enter().append('g').attr('class', 'node').style(
									'fill', '#242064').call(force.drag)
							ndE.each(function(d) {
								if (d.size > maxSize)
									maxSize = d.size;
								edges.push({
									source : centreNode,
									target : d,
									invisible : true
								});
							});
							// ENTER + UPDATE
							// Appending to the enter selection expands the update
							// selection to include
							// entering elements; so, operations on the update selection
							// after appending to
							// the enter selection will apply to both entering and
							// updating nodes.
							ndE.attr('display', function(d) {
								if (d.invisible)
									return 'none';
							}).on(
									'mouseover',
									/*
									 * although d3 uses the "fixed" parameter it is activated on
									 * mouseover automatically. Therefore we introduce a new one
									 * here "pinned"
									 */
									function(d) {
										d3.select(this).selectAll('circle').style('stroke',
												function(d) {
													if (d.pinned)
														return '#21FF00';
													return 'red';
												}).style('stroke-width', 2);
										var cl = '.src-';
										if (d.drawTo)
											cl = '.tar-';
										d3.selectAll(cl + nodes.indexOf(d)).style('stroke',
												function(e) {
													if (d.pinned)
														return '#21FF00';
													return 'red';
												}).style('stroke-width', 2);
									}).on(
									'mouseout',
									function(d) {
										d3.event.stopPropagation();
										d3.select(this).selectAll('circle').style('stroke', 'none')
												.style('stroke-width', 1);
										var cl = '.src-';
										if (d.drawTo)
											cl = '.tar-';
										d3.selectAll(cl + nodes.indexOf(d)).style('stroke',
												'#828282').style('stroke-width', 1);
									}).on(
									'dblclick',
									function(d) {
										d3.event.stopPropagation();
										d.fixed = !d.fixed;
										d.pinned = !d.pinned;
										d3.select(this).selectAll('circle').style('stroke',
												function(c) {
													if (d.pinned)
														return '#21FF00';
													return 'red';
												});
										var cl = '.src-';
										if (d.drawTo)
											cl = '.tar-';
										d3.selectAll(cl + nodes.indexOf(d)).style('stroke',
												function(e) {
													if (d.pinned)
														return '#21FF00';
													return 'red';
												});
										return true;
									}).on(
									'contextmenu',
									function(d) {
										d3.event.preventDefault();
										if (!d.drawTo)
											d.drawTo = true;
										else
											d.drawTo = false;

										var cl = '.src-';
										if (d.drawTo)
											cl = '.tar-';
										console.log(d.fixed === 3);
										d3.selectAll(cl + nodes.indexOf(d)).style('stroke',
												function(e) {
													if (d.pinned)
														return '#21FF00';
													return 'red';
												}).style('stroke-width', 3);
										cl = '.tar-';
										if (d.drawTo)
											cl = '.src-';
										d3.selectAll(cl + nodes.indexOf(d)).style('stroke',
												'#828282').style('stroke-width', 1);
									});

							ci = ndE.append('circle').attr('r', function(n) {
								return n.size * sizeMult;
							})
							tx = ndE.append('text').text(function(n) {
								return n.name;
							}).attr('x', function(n) {
								return n.size * sizeMult + 5;
							}).attr('y', function(n) {
								return 0;
							}).attr('dy', '.35em').attr("font-family", "sans-serif");

							// EXIT
							// Remove old elements as needed.
							nd.exit().remove();
							force.start();
						}
						updateNodes();

						var drawPaths = function() {
							d3.selectAll('.link').attr(
									"d",
									function(e) {
										if (e.invisible || e.type === 'push')
											return;
										var path = "M";
										var n1 = e.source;
										var n2 = e.target;
										var len = Math.sqrt(Math.pow(n2.x - n1.x, 2) +
												Math.pow(n2.y - n1.y, 2));
										var prc1 = (n1.size * sizeMult + //
										markerLength * 0.25) / (1.0 * len) + 0.01;
										var x1 = n1.x + (n2.x - n1.x) * prc1;
										var y1 = n1.y + (n2.y - n1.y) * prc1;
										var prc2 = (n2.size * sizeMult + //
										markerLength * 0.5) / (1.0 * len) + 0.01;
										var x2 = n2.x - (n2.x - n1.x) * prc2;
										var y2 = n2.y - (n2.y - n1.y) * prc2;
										path += (x1 | 0) + "," + (y1 | 0);
										path += "L";
										path += (x2 | 0) + "," + (y2 | 0);
										return path;
									});
						}
						function tick() {
							drawPaths();
							nd.attr("transform", function(d) {
								return "translate(" + d.x + "," + d.y + ")";
							});
						}
						// scope.$watch('nodes.length', function(newLength, oldLength) {
						// updateNodes();
						// }, true);
						scope.$watch('options', function(newOptions, oldOptions) {
							if (scope.options.sizeMult)
								sizeMult = scope.options.sizeMult;
							if (scope.options.gravMult)
								gravMult = scope.options.gravMult;
							if (scope.options.restLength)
								restLength = scope.options.restLength;
							updateNodes();
							drawPaths();
						}, true);

					}
				}
				return directiveDefinitionObject;
			}
		]);
app
		.directive(
				"polygonViewer",
				[
					function() {
						var directiveDefinitionObject = {
							restrict : 'E',
							scope : {
								image : '=',
								polydata : '='
							},
							link : function(scope, element, attrs) {
								var m = [
										80, 80, 80, 80
								];
								var w = 1000 - m[1] - m[3];
								var h = 400 - m[0] - m[2];
								var svg = d3.select(element[0]).append("svg:svg");
								function update(newValues) {
									var newImage = newValues[0];
									var polyData = newValues[1];
									var newPolys = polyData.polys;
									var limits = polyData.spaceLimits;
									var centre = polyData.centre;
									var rangeX = limits.max_x - limits.min_x;
									var rangeY = limits.max_y - limits.min_y;
									centre = {
										x : (parseFloat(limits.max_x) + parseFloat(limits.min_x)) * 0.5,
										y : (parseFloat(limits.max_y) + parseFloat(limits.min_y)) * 0.5
									}
									var iRangeX = 1.0 / rangeX;
									var iRangeY = 1.0 / rangeY;

									var img = new Image();
									img.src = newImage;
									img.onload = function() {
										var width = this.width;
										var height = this.height;

										function scaleX(x) {
											return ((rangeX * 0.5 + parseFloat(x) - centre.x) *
													iRangeX * width);
										}
										function scaleY(y) {
											return height -
													((rangeY * 0.5 + parseFloat(y) - centre.y) * iRangeY * height);
										}
										svg.attr("preserveAspectRatio", "xMidYMid meet").attr(
												"viewBox", "0 0 " + (width) + " " + (height));
										svg.selectAll("image").remove();
										svg.append("svg:image").attr('x', 0).attr('y', 0).attr(
												'height', height).attr('width', width).attr(
												'xlink:href', newImage);

										svg.selectAll("circle").remove();
										var div = d3.select("body").append("div").attr("class",
												"d3tooltip").style("opacity", 0);
										function getCommentText(d) {
											if (d.user_comment)
												return "<br/>Comment: " + d.user_comment;
											else
												return '';
										}
										var lineFunction = d3.svg.line().x(function(d) {
											return d.x;
										}).y(function(d) {
											return d.y;
										}).interpolate("linear");

										var polys = svg.selectAll("g").data(newPolys).enter()
												.append("g");
										polys.append("path").attr("d", function(d) {
											return d.points.map(function(p) {
												return p.t + [
														scaleX(p.x) | 0, scaleY(p.y) | 0
												].join(",")
											}).join("");
										}).attr("stroke", "black").attr("stroke-width", 2).attr(
												"fill", function(d) {
													return d.colour;
												}).on("mouseover", function(d) {
											d3.select(this).attr("fill", "red");
										}).on("mouseout", function(d) {
											d3.select(this).attr("fill", "black");
										});

										// polys.append("polygon").attr("points", function(d) {
										// return d.points.map(function(p) {
										// return [
										// scaleX(p.x), scaleY(p.y)
										// ].join(",")
										// }).join(" ");
										// }).attr("stroke", "black").attr("stroke-width", 2).attr(
										// "fill", function(d) {
										// return d.colour;
										// }).on("mouseover", function(d) {
										// d3.select(this).attr("fill", "red");
										// }).on("mouseout", function(d) {
										// d3.select(this).attr("fill", "black");
										// });

									}
								}
								scope.$watchCollection('[image,polydata]', function(newValues,
										oldValues) {
									update(newValues);
								}, true);
							}
						};
						return directiveDefinitionObject;
					}
				]);
angular
		.module('app.core')
		.directive(
				"dpmViewer",
				[
					function() {
						var directiveDefinitionObject = {
							restrict : 'E',
							scope : {
								image : '=',
								dpmdata : '='
							},
							link : function(scope, element, attrs) {
								var svg = d3.select(element[0]).append("svg:svg");
								function update(newValues) {
									var newImage = newValues[0];
									var dpmData = newValues[1];
									var tiles = dpmData.tiles;
									var metadata = dpmData.metadata;
									var wN = metadata.width;
									var pixelW = parseFloat(metadata.scalex);
									var pixelH = parseFloat(metadata.scaley);
									var band = dpmData.band;
									var limits = dpmData.spaceLimits;
									var rangeX = limits.max_x - limits.min_x;
									var rangeY = limits.max_y - limits.min_y;
									var iRangeX = 1.0 / rangeX;
									var iRangeY = 1.0 / rangeY;
									var minV = parseFloat(metadata.minv);
									var iValueRange = 1.0 / (parseFloat(metadata.maxv) - minV);
									var img = new Image();
									img.src = newImage;
									img.onload = function() {
										var width = this.width;
										var height = this.height;
										var diff = {
											x : width *
													iRangeX *
													(parseFloat(metadata.upperleftx) - parseFloat(limits.min_x)),
											y : height *
													iRangeY *
													(parseFloat(metadata.upperlefty) - parseFloat(limits.min_y))
										}
										pixelW = width * iRangeX * pixelW;
										pixelH = -height * pixelH * iRangeY;
										svg.attr("preserveAspectRatio", "xMidYMid meet").attr(
												"viewBox", "0 0 " + (width) + " " + (height));
										svg.selectAll("image").remove();
										svg.append("svg:image").attr('x', 0).attr('y', 0).attr(
												'height', height).attr('width', width).attr(
												'xlink:href', newImage);

										svg.selectAll("rect").remove();
										var div = d3.select("body").append("div").attr("class",
												"d3tooltip").style("opacity", 0);
										svg.selectAll("rect").data(tiles).enter().append("rect")
												.attr("x", function(d) {
													return diff.x + (d.i % wN) * pixelW;
												}).attr(
														"y",
														function(d) {
															return -diff.y + (height) +
																	(((d.i / wN) | 0) * pixelH);
														}).attr("width", function(d) {
													return pixelW;
												}).attr("height", function(d) {
													return pixelH;
												}).attr(
														"fill",
														function(d) {
															return d3.hsl(
																	240 - 240.0 * ((d.v - minV) * iValueRange),
																	1, 0.5);
														});

									}
								}
								scope.$watchCollection('[image,dpmdata]', function(newValues,
										oldValues) {
									update(newValues);
								}, true);
							}
						};
						return directiveDefinitionObject;
					}
				]);
// angular.module('app.core').directive("wordle", [
//
// function() {
// var directiveDefinitionObject = {
// restrict : 'E',
// scope : {
// parts : '='
// },
// link : function(scope, element, attrs) {
//
// var fill = d3.scale.category20();
// // var fill = spacelabColours;
// var svg = d3.select(element[0]).append("svg").attr("width", 1000)
// .attr("height", 300);
//
// function draw(words) {
// svg.selectAll('g').remove();
//
// svg.append("g").attr("transform", "translate(500,150)")
// .selectAll("text").data(words).enter().append("text")
// .style("font-size", function(d) {
// return d.size + "px";
// }).style("font-family", "Apercu").style("fill",
// function(d, i) {
// return fill(i);
// }).attr("text-anchor", "middle").attr(
// "transform",
// function(d) {
// return "translate(" + [ d.x, d.y ]
// + ")rotate(" + d.rotate + ")";
// }).text(function(d) {
// return d.text;
// });
// }
//
// var wordl = d3.layout.cloud().size([ 1000, 300 ]);
// // wordl.words(scope.parts).padding(5).rotate(0).font("Apercu")
// // .fontSize(function(d) {
// // return d.size;
// // }).on("end", draw).start();
// // wordl.words(scope.parts).padding(5).rotate(0).fontSize(
// // function(d) {
// // return d.size;
// // }).on("end", draw).start();
// wordl.words(scope.parts).padding(5).rotate(0).fontSize(
// function(d) {
// return d.size;
// }).on("end", draw).start();
// scope.$watch('parts', function(newParts, oldParts) {
// // console.log(newParts);
//
// // draw();
// }, true);
// }
// };
// return directiveDefinitionObject;
// } ]);
