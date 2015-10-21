(function() {
	"use strict";
	angular.module('app.diagrams').directive('depthmapView', depthmapView);
	depthmapView.$inject = [];
	function depthmapView() {
		var vm = this;

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
							x : width * iRangeX *
									(parseFloat(metadata.upperleftx) - parseFloat(limits.min_x)),
							y : height * iRangeY *
									(parseFloat(metadata.upperlefty) - parseFloat(limits.min_y))
						}
						pixelW = width * iRangeX * pixelW;
						pixelH = -height * pixelH * iRangeY;
						svg.attr("preserveAspectRatio", "xMidYMid meet").attr("viewBox",
								"0 0 " + (width) + " " + (height));
						svg.selectAll("image").remove();
						svg.append("svg:image").attr('x', 0).attr('y', 0).attr('height',
								height).attr('width', width).attr('xlink:href', newImage);

						svg.selectAll("rect").remove();
						var div = d3.select("body").append("div")
								.attr("class", "d3tooltip").style("opacity", 0);
						svg.selectAll("rect").data(tiles).enter().append("rect").attr("x",
								function(d) {
									return diff.x + (d.i % wN) * pixelW;
								}).attr("y", function(d) {
							return -diff.y + (height) + (((d.i / wN) | 0) * pixelH);
						}).attr("width", function(d) {
							return pixelW;
						}).attr("height", function(d) {
							return pixelH;
						}).attr(
								"fill",
								function(d) {
									return d3.hsl(240 - 240.0 * ((d.v - minV) * iValueRange), 1,
											0.5);
								});

					}
				}
				scope.$watchCollection('[image,dpmdata]',
						function(newValues, oldValues) {
							update(newValues);
						}, true);
			}
		};
		return directiveDefinitionObject;
	}
})();