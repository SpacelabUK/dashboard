(function() {
	"use strict";
	angular.module('app.tools.netIntegration').controller('NetIntegration',
			NetIntegration);
	NetIntegration.$inject = [
			'$timeout', 'textParserService', 'FileUploader',
	// 'RoundModelFactory', 'fetching'
	];

	function NetIntegration($timeout, textParserService, FileUploader) {
		var vm = this;
		vm.removeEdge = function(edge) {
			edge.type = "push";
			vm.refreshEdges();
		}
		vm.modifyMultiplier = function(amount) {
			vm.options.sizeMult += amount;
		}
		vm.modifyGravity = function(amount) {
			vm.options.gravMult += amount;
		}
		vm.modifyRestLength = function(amount) {
			vm.options.restLength += amount;
		}
		var uploader = vm.uploader = new FileUploader();

		uploader.onAfterAddingFile = function(fileItem) {
			var reader = new FileReader();
			reader.onload = function(e) {
				if (!endsWith(fileItem._file.name, 'vna')) {
					alert("oi! that's not a VNA!");
					return;
				}
				var vna = textParserService.getVNAData(e.target.result);
				if (!vna.node_data || !vna.tie_data)
					return;

				var nodes = textParserService.extractVNARowsUnderHeaders(vna.node_data,
						[
								"name", "id"
						]);
				var ties = textParserService.extractVNARowsUnderHeaders(vna.tie_data, [
						"from", "to"
				]);
				var tieObj = {};
				for (var i = 0; i < ties.length; i++) {
					var from = parseInt(ties[i]["from"]);
					var to = parseInt(ties[i]["to"]);
					if (!tieObj[from])
						tieObj[from] = [];
					tieObj[from].push(to);
				}
				var centreNode;
				for (var i = 0; i < vm.nodes.length; i++)
					if (vm.nodes[i].type === 'centre') {
						centreNode = vm.nodes[i];
						break;
					}
				vm.nodes.splice(0, vm.nodes.length);
				vm.edges.splice(0, vm.edges.length);

				$timeout(function() {
					vm.refresh();
					$timeout(function() {
						// vm.nodes.length = 0;
						// vm.edges.length = 0;
						vm.nodes.push(centreNode);
						for (var i = 0; i < nodes.length; i++) {
							nodes[i].size = 1;
							vm.nodes.push(nodes[i]);
						}
						for (var i = 0; i < vm.nodes.length; i++) {
							// vm.edges.push({
							// source : centreNode,
							// target : vm.nodes[i],
							// invisible : true
							// });
							for (var j = 0; j < vm.nodes.length; j++) {
								if (i == j)
									continue;
								if (tieObj[i] && tieObj[i].indexOf(j) != -1) {
									vm.edges.push({
										source : vm.nodes[i],
										target : vm.nodes[j],
										type : 'edge'
									});
									// vm.nodes[i].size++;
									vm.nodes[j].size++;
								} else {
									vm.edges.push({
										source : vm.nodes[i],
										target : vm.nodes[j],
										type : 'push'
									});
								}
							}
						}
						$timeout(function() {
							vm.refresh();
						}, 100);
					}, 100);
				}, 100);
			}
			reader.readAsText(fileItem._file);
		};
		vm.addEdge = function() {
			for (var i = 0; i < vm.edges.length; i++) {
				if (vm.edges[i].type === 'push') {
					var edge = vm.edges[i];
					edge.type = "edge";
					vm.edges[i] = vm.edges[vm.edges.length - 1];
					vm.edges[vm.edges.length - 1] = edge;
					break;
				}
			}
			vm.refreshEdges();
		}
		vm.switchEdge = function(edge) {
			for (var i = 0; i < vm.edges.length; i++) {
				if (vm.edges[i].source === edge.target &&
						vm.edges[i].target === edge.source) {
					var temptype = vm.edges[i].type;
					vm.edges[i].type = edge.type;
					edge.type = temptype;
					var eI = vm.edges.indexOf(edge);
					vm.edges[eI] = vm.edges[i];
					vm.edges[i] = edge;
					break;
				}
			}
			vm.refreshEdges();
		}
		vm.downloadSVG = function(id) {
			var svgpar = document.getElementById(id);
			var svg = svgpar.getElementsByTagName("svg")[0];

			svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
			var image_data = '<?xml version="1.0" encoding="utf-8" ' //
					+ 'standalone="no"?>' //
					+ '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ' //
					+ '"http://www.w3.org/Graphics/SVG/1.2/DTD/svg11.dtd">';
			image_data += svg.outerHTML.replace(/#/g, '%23');
			;

			window.open('data:image/svg+xml;utf8,' + image_data, '_blank');

		};

		vm.pageTitle = "Network-Integration diagram Generator";
		vm.options = {
			sizeMult : 5,
			gravMult : 1,
			restLength : 200,
			touch : 0
		}
		vm.refreshEdges = function() {
			var i;
			for (i = 0; i < vm.nodes.length; i++)
				vm.nodes[i].size = 1;
			for (i = 0; i < vm.edges.length; i++)
				if (vm.edges[i].type === 'edge')
					vm.edges[i].target.size++;
			vm.refresh();
		}
		vm.refresh = function() {
			vm.options.touch++;
		};
		vm.addNode = function() {
			vm.nodes.push({
				name : 'New Node',
				size : 1,
				x : Math.random() * 600,
				y : Math.random() * 600
			});
			vm.refreshEdges();
		}
		vm.removeNode = function(node) {
			for (var i = vm.edges.length - 1; i >= 0; i--) {
				if (vm.edges[i].source === node || vm.edges[i].target === node)
					vm.edges.splice(i, 1);
			}
			vm.nodes.splice(vm.nodes.indexOf(node), 1);
			vm.refreshEdges();
		}
		vm.fromNodes = {};
		vm.nodes = [
				{
					id : 1,
					name : "Lorem",
					size : 1
				}, {
					id : 2,
					name : "Ipsum",
					size : 1,
				}, {
					id : 3,
					name : "Dolor",
					size : 1
				}, {
					id : 4,
					name : "Sit",
					size : 1
				}, {
					id : 5,
					name : "Amet",
					size : 1
				}, {
					id : 6,
					name : "Consectetur",
					size : 1
				}, {
					id : 7,
					name : "Adipiscing",
					size : 1
				}, {
					id : 8,
					name : "Elit",
					size : 1
				}, {
					id : 9,
					name : "Loremss",
					size : 1
				}, {
					id : 10,
					name : "Ipsumss",
					size : 1,
				}, {
					id : 11,
					name : "Dolorss",
					size : 1
				}, {
					id : 12,
					name : "Sitss",
					size : 1
				}, {
					id : 13,
					name : "Ameaat",
					size : 1
				}, {
					id : 14,
					name : "Conssectetur",
					size : 1
				}, {
					id : 15,
					name : "Adipfiscing",
					size : 1
				}, {
					id : 16,
					name : "Eslit",
					size : 1
				}
		];
		vm.disks = [
				{
					fill : '#AEBDDE',
					size : 300
				}, {
					fill : '#BED8BA',
					size : 240
				}, {
					fill : '#F6F5BA',
					size : 180
				}, {
					fill : '#F2C6A7',
					size : 120
				}

		];
		vm.edges = [];
		var maxEdgePrc = 0.2;
		for (var i = 0; i < vm.nodes.length; i++) {
			vm.nodes[i].x = Math.random() * 600;
			vm.nodes[i].y = Math.random() * 600;
		}
		for (var i = 0; i < vm.nodes.length; i++) {
			for (var j = 0; j < vm.nodes.length; j++) {
				if (i == j)
					continue;
				if (Math.random() < maxEdgePrc) {
					vm.edges.push({
						source : vm.nodes[i],
						target : vm.nodes[j],
						type : 'edge'
					});
					// vm.nodes[i].size++;
					vm.nodes[j].size++;
				} else {
					vm.edges.push({
						source : vm.nodes[i],
						target : vm.nodes[j],
						type : 'push'
					});
				}
			}
		}
	}

})();