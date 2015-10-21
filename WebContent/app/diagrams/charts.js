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
