(function() {
	"use strict";
	angular.module('app.diagrams').directive('polygonView', polygonView);
	polygonView.$inject = [];
	function polygonView() {
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
							return ((rangeX * 0.5 + parseFloat(x) - centre.x) * iRangeX * width);
						}
						function scaleY(y) {
							return height -
									((rangeY * 0.5 + parseFloat(y) - centre.y) * iRangeY * height);
						}
						svg.attr("preserveAspectRatio", "xMidYMid meet").attr("viewBox",
								"0 0 " + (width) + " " + (height));
						svg.selectAll("image").remove();
						svg.append("svg:image").attr('x', 0).attr('y', 0).attr('height',
								height).attr('width', width).attr('xlink:href', newImage);

						svg.selectAll("circle").remove();
						var div = d3.select("body").append("div")
								.attr("class", "d3tooltip").style("opacity", 0);
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

						var polys = svg.selectAll("g").data(newPolys).enter().append("g");
						polys.append("path").attr("d", function(d) {
							return d.points.map(function(p) {
								return p.t + [
										scaleX(p.x) | 0, scaleY(p.y) | 0
								].join(",")
							}).join("");
						}).attr("stroke", "black").attr("stroke-width", 2).attr("fill",
								function(d) {
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
})();