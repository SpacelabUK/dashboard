(function() {
	"use strict";
	angular.module('app.diagrams').directive('netIntegration', netIntegration);
	netIntegration.$inject = [];
	function netIntegration() {
		var directiveDefinitionObject = {
			restrict : 'E',
			scope : {
				disks : '=',
				edges : '=',
				nodes : '=',
				options : '='
			},
			link : function(scope, element, attrs) {
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
				]).linkDistance(
						function(d) {
							if (d.source.type === 'centre')
								return (50 + 200 - 200 * (d.target.size) / (1.0 * maxSize)) /
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
				var svg = d3.select(element[0]).append("svg:svg").attr('width', '100%')
						.attr('height', '100%').attr('viewBox', '0 0 600 600');
				svg.append("defs").append("marker").attr("id", "marker").attr(
						"viewBox", "0 -5 10 10").attr("refX", 5).attr("refY", 0).attr(
						"markerWidth", 10).attr("markerHeight", 10).attr("orient", "auto")
						.append("path").attr("d", "M0,-3L10,0L0,3").attr('fill', '#828282');

				var oc, ed, nd, ci, tx;

				var disks = scope.disks.sort(function(d1, d2) {
					return d2.size - d1.size;
				});
				oc = svg.selectAll('.disk').data(disks).enter().append('circle').attr(
						'class', 'disk').attr('r', function(d) {
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
					var ndE = nd.enter().append('g').attr('class', 'node').style('fill',
							'#242064').call(force.drag)
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
					}).on('mouseover',
					/*
					 * although d3 uses the "fixed" parameter it is activated on mouseover
					 * automatically. Therefore we introduce a new one here "pinned"
					 */
					function(d) {
						d3.select(this).selectAll('circle').style('stroke', function(d) {
							if (d.pinned)
								return '#21FF00';
							return 'red';
						}).style('stroke-width', 2);
						var cl = '.src-';
						if (d.drawTo)
							cl = '.tar-';
						d3.selectAll(cl + nodes.indexOf(d)).style('stroke', function(e) {
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
								d3.selectAll(cl + nodes.indexOf(d)).style('stroke', '#828282')
										.style('stroke-width', 1);
							}).on('dblclick', function(d) {
						d3.event.stopPropagation();
						d.fixed = !d.fixed;
						d.pinned = !d.pinned;
						d3.select(this).selectAll('circle').style('stroke', function(c) {
							if (d.pinned)
								return '#21FF00';
							return 'red';
						});
						var cl = '.src-';
						if (d.drawTo)
							cl = '.tar-';
						d3.selectAll(cl + nodes.indexOf(d)).style('stroke', function(e) {
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
								d3.selectAll(cl + nodes.indexOf(d)).style('stroke', '#828282')
										.style('stroke-width', 1);
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
})();