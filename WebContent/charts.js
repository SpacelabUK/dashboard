var spacelabColours = [
		'#2DC3F0', '#F2902A', '#BA56A0', '#6D4FA0', '#75BF44', '#FFF200',
		'#838280', '#2A3890', '#EB008C', '#A5DFF6', '#D6A3CA', '#A897C8',
		'#B6DA9A', '#F6B387', '#442A79', '#006738', '#57595B'
]
app.directive("doughnutChart", [

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

				var arc = d3.svg.arc().innerRadius(radius - 75)
						.outerRadius(radius - 25);

				var svg = d3.select(element[0]).append("svg").attr("width", width)
						.attr("height", height).append("g").attr("transform",
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
					var path = svg.selectAll("path").data(pie(scope.parts)).enter()
							.append("path").attr("fill", function(d, i) {
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
							.attr('font-family', 'Apercu,serif').attr('font-size', '30px')
									.attr("transform", "translate(" + 0 + "," + 10 + ")").style(
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
app.directive("responsiveDoughnutChart", [

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

				var arc = d3.svg.arc().innerRadius(radius - 75)
						.outerRadius(radius - 25);

				var svg = d3.select(element[0]).append("svg")
				// .attr("width",
				// width)
				.attr("height", "100%").attr("width", "100%").attr(
						"preserveAspectRatio", "xMidYMid meet").attr("viewBox",
						"0 0 " + width + " " + height).append("g").attr("transform",
						"translate(" + width / 2 + "," + height / 2 + ")");

				scope.$watch('parts', function(newParts, oldParts) {
					svg.selectAll("path").remove();
					var path = svg.selectAll("path").data(pie(scope.parts)).enter()
							.append("path").attr("fill", function(d, i) {
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
							.attr('font-family', 'Apercu,serif').attr('font-size', '30px')
									.attr("transform", "translate(" + 0 + "," + 10 + ")").style(
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
app.directive("simpleLineChart", [

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
						w + m[1] + m[3]).attr("height", h + m[0] + m[2]).append("svg:g")
						.attr("transform", "translate(" + m[3] + "," + m[0] + ")");

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
							"translate(-25,0)").attr('fill', 'none').attr('stroke', 'black')
							.call(yAxisLeft);
					graph.selectAll('path').remove();
					graph.append("svg:path").attr("d", line(newParts)).attr('fill',
							'none').attr('stroke', 'black');
				}, true);
			}
		};
		return directiveDefinitionObject;
	}
]);
app.directive("responsiveLineChart", [

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
							"translate(-25,0)").attr('fill', 'none').attr('stroke', 'black')
							.call(yAxisLeft);
					graph.selectAll('path').remove();
					graph.append("svg:path").attr("d", line(newParts)).attr('fill',
							'none').attr('stroke', 'black');
				}, true);
			}
		};
		return directiveDefinitionObject;
	}
]);

app.directive("snapshotViewer", [
	function() {
		var directiveDefinitionObject = {
			restrict : 'E',
			scope : {
				image : '=',
				entitydata : '='
			},
			link : function(scope, element, attrs) {
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

				scope.$watchCollection('[image,entitydata]',
						function(newValues, oldValues) {
							// console.log(newParts);
							var newImage = newValues[0];
							var entityData = newValues[1];
							var newEntities = entityData.entities;
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
								var ents = svg.selectAll("g").data(newEntities).enter().append(
										"g");
								ents.append("circle").on(
										"mouseover",
										function(d) {
											if (d.state == 0 || d.state == -1)
												return;
											div.transition().duration(200).style("opacity", .9);
											div.html(
													'ID:' + d.entity_id + getStateText(d)
															+ getCommentText(d)).style("left",
													(d3.event.pageX) + "px").style("top",
													(d3.event.pageY - 28) + "px");
											// "left", (d3.select(this).attr("cx")) +
											// "px").style("top",
											// (d3.select(this).attr("cy")) + "px");
										}).on("mouseout", function(d) {
									div.transition().duration(500).style("opacity", 0);
								}).attr("cx", function(d) {
									return (rangeX * 0.5 + parseFloat(d.cx)) * iRangeX * width;
								}).attr(
										"cy",
										function(d) {
											return height - (rangeY * 0.5 + parseFloat(d.cy))
													* iRangeY * height;
										}).attr("r", function(d) {
									return width * .35 * iRangeX;
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
								}).style("stroke", '');

								ents.append("text").attr("x", function(d) {
									return (rangeX * 0.5 + parseFloat(d.cx)) * iRangeX * width;
								}).attr(
										"y",
										function(d) {
											return height - (rangeY * 0.5 + parseFloat(d.cy))
													* iRangeY * height;
										}).attr("dy", ".35em").attr('pointer-events', 'none').text(
										function(d) {
											return d.user_comment ? '?' : '';
										});
							}
						}, true);
			}
		};
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
											return ((rangeX * 0.5 + parseFloat(x) - centre.x)
													* iRangeX * width);
										}
										function scaleY(y) {
											return height
													- ((rangeY * 0.5 + parseFloat(y) - centre.y)
															* iRangeY * height);
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
app
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
											x : width
													* iRangeX
													* (parseFloat(metadata.upperleftx) - parseFloat(limits.min_x)),
											y : height
													* iRangeY
													* (parseFloat(metadata.upperlefty) - parseFloat(limits.min_y))
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
															return -diff.y + (height)
																	+ (((d.i / wN) | 0) * pixelH);
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
// app.directive("wordle", [
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
