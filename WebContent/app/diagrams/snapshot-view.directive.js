(function() {
	"use strict";
	angular.module('app.diagrams').directive('snapshotView', snapshotView);
	snapshotView.$inject = [];
	function snapshotView() {
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
				scope.$watchCollection('[image,entitydata]',
						function(newValues, oldValues) {
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
})();