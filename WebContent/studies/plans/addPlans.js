// app.controller("addProjectInstance", function($scope, $modalInstance,
// projectFactory) {
//	
// });
app.factory('PlanFactory',
		function($q, $http) {
			"use strict";
			var fetch = function(study, url) {
				var deferred = $q.defer(), httpPromise = $http.get(url);

				httpPromise.then(function(response) {
					deferred.resolve(response);
				}, function(error) {
					console.error(error);
				});
				return httpPromise;
			};
			var updateSpaces = function(study, spaces) {
				if (!study.existingSpaces)
					study.existingSpaces = [];
				while (study.existingSpaces.length > 0)
					study.existingSpaces.pop();
				for (var i = 0; i < spaces.length; i++)
					study.existingSpaces.push(spaces[i]);
			};
			var post = function(url, data) {
				var deferred = $q.defer(), httpPromise = $http.post(url, data);

				httpPromise.then(function(response) {
					deferred.resolve(response);
				}, function(error) {
					console.error(error);
				});
				return httpPromise;
			};
			var pushSpaces = function(spaces) {

				// var posts = [];
				// for (var i = 0; i < spaces.length; i++)
				// posts.push($http.post('studies/plan/addSpace.php',
				// spaces[i]));
				//
				// $q.all(posts).then(function(result) {
				// console.log(result);
				// var promises = [];
				// angular.forEach(result, function(response) {
				// promises.push(response.data);
				// });
				// return promises;
				// }).then(function(tmpResult) {
				// // $scope.combinedResult = tmpResult.join(", ");
				// console.log(tmpResult.join(", "));
				// });
				var promises = [];
				// for (var i = 0; i < spaces.length; i++) {
				angular.forEach(spaces, function(space) {
					var promise = $http({
						url : 'studies/plans/addSpace.php',
						method : 'POST',
						data : space
					});
					promises.push(promise);

				});

				return $q.all(promises);

				// var data = {
				// 'name' : spaces[0]
				// };
				// var seen = [];
				// var stringy = JSON.stringify(spaces[0], function(key,
				// val) {
				// if (val != null && typeof val == "object") {
				// if (seen.indexOf(val) >= 0)
				// return seen.push(val)
				// }
				// return val
				// });
				// console.log(stringy);
				// var deferred = $q.defer(), httpPromise = $http.post(
				// 'studies/plans/addSpace.php', spaces[0]);
				//
				// httpPromise.then(function(response) {
				// console.log(response);
				// deferred.resolve(response);
				// }, function(error) {
				// console.error(error);
				// });
				//
				// return deferred.promise;
			};
			var restructureDXF = function(dxf, selectedSpaces, part) {
				// returns the dxf as a json object
				dxf = dxf.replace('\r', '\n');
				var dxfLines = dxf.split('\n');
				var param;
				var data;
				var currObject = null;
				var currId = 0;
				// var currParent = null;
				for (var i = 0; i < dxfLines.length; i += 2) {
					param = parseInt(dxfLines[i].trim());
					while (isNaN(param) && i < dxfLines.length - 2) {
						// in case of malformed dxf where we
						// fall unto a string instead
						// of a number, just move to the next
						// available number
						i++;
						param = parseInt(dxfLines[i].trim());
					}
					if (100 == param || 999 < param)
						continue; // arbitrary : useless info
					data = dxfLines[i + 1].trim();
					if (2 == param && eql(data, part)) {
						currObject = {
							id : currId++,
							type : data,
							// p : [],
							p : {},
							c : []
						};
						continue;
					}
					if (!currObject)
						continue;
					if (0 === param) {
						// if (currObject.parent)
						// console.log(data + " " + currObject.type + "
						// "
						// + currObject.parent.type);
						// else
						// console.log(data + " " + currObject.type);
						if (eql(data, "ENDTAB") || eql(data, "ENDBLK") ||
								eql(data, "SEQEND")) {

							// var newObject = {
							// parent : currObject.parent,
							// type : data,
							// p : [],
							// o : []
							// };
							// currObject.o.push(newObject);
							// console.log('switching to parent');
							// console.log(currObject);
							currObject = currObject.parent;
							// if (currObject)
							currObject.completed = true;
						} else if (eql(data, 'ENDSEC')) {
							break;
						} else {
							var newObject = {
								id : currId++,
								parent : currObject.parent,
								type : data,
								// p : [],
								p : {},
								c : []
							};
							if (eql(currObject.type, part) ||
									(!currObject.completed && (
									// currObject.c.length == 0
									// && (
									eql(currObject.type, "BLOCK") || eql(currObject.type,
											"POLYLINE"))))
								newObject.parent = currObject;
							// console.log('creating: ' + data);
							// console.log(currObject);
							// console.log(newObject);
							// if (eql(currObject.type, 'BLOCKS'))
							// currObject.c.push(newObject);
							// else
							newObject.parent.c.push(newObject);
							currObject = newObject;
						}
					} else {
						if (currObject.completed)
							continue;
						if (currObject.p[param] instanceof Array) {
							// console.log(currObject.type + " " + param
							// + " "
							// + currObject.p[param] + " " + data);
							currObject.p[param].push(data);
						} else if (currObject.p[param]) {
							var temp = currObject.p[param];
							currObject.p[param] = [];
							currObject.p[param].push(temp);
							currObject.p[param].push(data);
						} else
							currObject.p[param] = data;
					}
				}
				while (currObject.parent)
					currObject = currObject.parent;
				cleanEntity(currObject);
				return currObject;
			};
			var restructureSpaceTypePoly = function(o) {
				var result = {
					layers : [],
					limits : {
						max : {
							x : -Number.MAX_VALUE,
							y : -Number.MAX_VALUE
						},
						min : {
							x : Number.MAX_VALUE,
							y : Number.MAX_VALUE
						}
					}
				};
				for (var i = 0; i < o.c.length; i++) {
					b = o.c[i];
					var name = b.p[2].split('(')[0].trim().toUpperCase();
					if (startsWith(name, genIdentifier) &&
							(endsWith(name, '-' + funcIdentifier) || endsWith(name, '-' +
									teamIdentifier))) {
						var layer = {
							name : name.slice(genIdentifier.length),
							f : {},
							t : {}
						};
						for (var j = 0; j < b.c.length; j++) {
							var p = b.c[j];
							var layr, type, points, x, y, v, k;
							if (p.type == 'POLYLINE') {
								layr = p.p[8];
								if (startsWithIgnoreCase(layr, genIdentifier + funcIdentifier +
										'-')) {
									type = layr.slice((genIdentifier.length +
											funcIdentifier.length + 1));

								} else if (startsWithIgnoreCase(layr, genIdentifier +
										teamIdentifier + '-')) {
									type = layr.slice((genIdentifier.length +
											teamIdentifier.length + 1));
								}
								if (type) {
									points = [];
									for (k = 0; k < p.c.length; k++) {
										v = p.c[k];
										if (v.type == 'VERTEX') {
											x = parseFloat(v.p[10]) * 0.01;
											y = parseFloat(v.p[20]) * 0.01;
											if (x > result.limits.max.x)
												result.limits.max.x = x;
											if (x > result.limits.max.y)
												result.limits.max.y = y;
											if (x < result.limits.min.x)
												result.limits.min.x = x;
											if (x < result.limits.min.y)
												result.limits.min.y = y;
											points.push({
												x : x - 10000,
												y : y - 4800
											});
										}
									}
									if (!layer.f[type])
										layer.f[type] = {
											name : type,
											polys : []
										};
									layer.f[type].polys.push(points);
								}
							} else if (p.type == 'LWPOLYLINE') {

								layr = p.p[8];
								if (startsWithIgnoreCase(layr, genIdentifier + funcIdentifier +
										'-')) {
									type = layr.slice((genIdentifier.length +
											funcIdentifier.length + 1));

								} else if (startsWithIgnoreCase(layr, genIdentifier +
										teamIdentifier + '-')) {
									type = layr.slice((genIdentifier.length +
											teamIdentifier.length + 1));
								}
								if (type) {
									points = [];
									for (k = 0; k < p.p[10].length; k++) {
										v = p.c[k];
										if (v.type == 'VERTEX') {
											x = parseFloat(p.p[10][k]) * 0.01;
											y = parseFloat(p.p[20][k]) * 0.01;
											if (x > result.limits.max.x)
												result.limits.max.x = x;
											if (x > result.limits.max.y)
												result.limits.max.y = y;
											if (x < result.limits.min.x)
												result.limits.min.x = x;
											if (x < result.limits.min.y)
												result.limits.min.y = y;
											points.push({
												x : x - 10000,
												y : y - 4800
											});
										}
									}
									if (!layer.f[type])
										layer.f[type] = {
											name : type,
											polys : []
										};
									layer.f[type].polys.push(points);
								}
							}
						}

						result.layers.push(layer);
					}
				}

				return result;
			};
			// getHierarchy = function(dxfObject) {
			var getCompactHierarchy = function(dxfObject) {
				if (!dxfObject.c || dxfObject.c.length < 1)
					return dxfObject.id;
				var hierarchy = {
					id : dxfObject.id,
					c : []
				};
				angular.forEach(dxfObject.c, function(child) {
					hierarchy.c.push(getHierarchy(child));
				});
				return hierarchy;
			};
			var getHierarchy = function(dxfObject) {
				// getCompactHierarchy = function(dxfObject) {
				if (!dxfObject.c || dxfObject.c.length < 1)
					return dxfObject.id;
				var hierarchy = {
					id : dxfObject.id,
					c : []
				};
				var c = hierarchy.c = [];
				angular.forEach(dxfObject.c, function(child) {
					var ch = getHierarchy(child);
					var prv = c[c.length - 1];
					var pprv = c[c.length - 2];
					if (c.length === 0 || (c.length === 1 && typeof prv !== 'object') ||
							typeof ch === 'object' || (typeof prv === 'object' && prv.id) ||
							(typeof prv !== 'object' && typeof pprv === 'object' && pprv.id))
						c.push(ch);
					else {
						if (typeof prv === 'object') {
							prv.e = ch;
						} else {
							var range = {
								s : pprv,
								e : ch
							};
							c.pop();
							c.pop();
							c.push(range);
						}
					}
				});
				return hierarchy;

			};
			function cleanEntity(entity) {
				if (entity.completed)
					delete entity.completed;
				if (entity.parent)
					delete entity.parent;
				if (entity.c)
					for (var i = 0; i < entity.c.length; i++)
						cleanEntity(entity.c[i]);
			}
			function stripDXF(text) {
				text = text.replace('\r', '\n');
				var lines = text.split('\n');
				var readingSection = -1;
				var minimalString = "";
				var throwawayBlocks = {};
				var objectString = '';
				var readingObject = null;
				var lastName = '';
				var requiredBlocks = [];
				for (var i = 0; i < lines.length; i += 2) {
					parameter = parseInt(lines[i].trim());
					while (isNaN(parameter) && i < lines.length - 2) {
						// in case of malformed dxf where we
						// fall unto a string instead
						// of a number, just move to the next
						// available number
						i++;
						parameter = parseInt(lines[i].trim());
					}
					if (100 == parameter || 1001 == parameter)
						continue;
					if (!readingObject) {
						// find our section
						line = lines[i + 1];
						if (-1 == readingSection && 2 != parameter)
							continue;
						if (-1 != readingSection &&
								(eql(line, "ENDSEC") || eql(line, "ENDTAB"))) {
							if (0 === readingSection) {
								for (var j = 0; j < requiredBlocks.length; j++) {
									var data = throwawayBlocks[requiredBlocks[j]];
									if (data)
										minimalString += data;
								}
							}
							readingSection = -1;
							objectString = '';
							minimalString += parameter + "\n" + line + "\n";
							if (eql(line, "ENDTAB"))
								minimalString += '0\nENDSEC\n';
							continue;
						}
						if (-1 == readingSection) {
							if (eql(line, "BLOCKS")) {
								readingSection = 0; // reading
								// blocks;
								minimalString += '0\nSECTION\n';
								minimalString += parameter + "\n" + line + "\n";
								continue;
							} else if (eql(line, "ENTITIES")) {
								readingSection = 1; // reading
								// entities;
								minimalString += '0\nSECTION\n';
								minimalString += parameter + "\n" + line + "\n";
								continue;
							} else if (eql(line, "LAYER") &&
									eql(lines[i - 1].trim(), "TABLE")) {
								readingSection = 2; // reading
								// layers;
								minimalString += '0\nSECTION\n';
								minimalString += '2\nTABLES\n';
								minimalString += '0\nTABLE\n';
								minimalString += parameter + "\n" + line + "\n";
								continue;
							}
						}

						if (0 !== parameter)
							continue;

						if (-1 != readingSection) {
							objectString += parameter + "\n" + line + "\n";
						}
						if (0 === readingSection && eql(line, "BLOCK")) {
							lastName = '';
							readingObject = 'BLOCK';
							continue;
						}
						if (1 === readingSection) {
							if (eql(line, "INSERT"))
								lastName = 'ins';
							readingObject = 'INSERT';
							continue;
						}
						if (2 === readingSection && eql(line, "LAYER")) {
							readingObject = 'LAYER';
							continue;
						}
						continue;
					}

					line = lines[i + 1];
					if (0 === readingSection) { // blocks
						objectString += parameter + '\n' + line + '\n';
						if (0 === parameter)
							readingObject = line;
						if (0 === parameter && eql(line, "ENDBLK")) {
							if ('@_' == lastName.substring(0, 2)) {
								minimalString += objectString + lines[i + 2] + lines[i + 3] +
										'\n';
								i += 2;
							} else
								throwawayBlocks[lastName] = objectString + lines[i + 2] +
										lines[i + 3] + '\n';
							objectString = '';
							readingObject = null;
							continue;
						}
						if (2 == parameter) {// parameter 2
							// is tha name
							// of tha block
							if (eql(lastName, ''))
								lastName = line;
							else if (eql(readingObject, 'INSERT'))
								requiredBlocks.push(line);
						}
					} else if (1 == readingSection) { // entities

						if (0 !== parameter)
							objectString += parameter + '\n' + line + '\n';
						else {
							i -= 2;
							if ('@_' == lastName.substring(0, 2))
								minimalString += objectString;
							objectString = '';
							readingObject = null;
							continue;
						}

						if (8 == parameter && !eql(lastName, 'ins')) {
							lastName = line;
						}

						if (2 == parameter) {// parameter 2
							// is tha name
							// of tha block
							if (eql(lastName, 'ins'))
								lastName = line;
						}
					} else if (2 === readingSection) { // layers
						if (0 !== parameter)
							objectString += parameter + '\n' + line + '\n';
						else {
							i -= 2;
							if ('@_' === lastName.substring(0, 2))
								minimalString += objectString;
							objectString = '';
							readingObject = null;
							continue;
						}
						if (2 == parameter)
							lastName = line;
					}
				}
				return minimalString;
			}
			var pub = {
				restructure : function(dxf) {
					return restructureDXF(dxf, [], 'BLOCKS');
				},
				getBlocksWithInserts : function(dxf) {
					var b = restructureDXF(dxf, [], 'BLOCKS');
					var e = restructureDXF(dxf, [], 'ENTITIES');
					var inserts = [];
					for (var i = 0; i < e.c.length; i++) {
						if (e.c[i].type == 'INSERT') {
							inserts.push({
								name : e.c[i].p[2],
								x : e.c[i].p[10],
								y : e.c[i].p[20],
								z : e.c[i].p[30]
							});
						}
					}
					e = null;
					b.inserts = inserts;
					return b;
				},
				getSpaceTypePoly : function(dxf) {
					return restructureSpaceTypePoly(restructureDXF(dxf, [], 'BLOCKS'));
				},
				hierarchy : function(dxf) {
					return getHierarchy(dxf);
				},
				uploadSpaces : function(study, dxf, selectedSpaces) {
					var plan = restructureDXF(dxf, selectedSpaces);
					var spaces = [];
					for (var i = 0; i < plan.c.length; i++) {
						if (eql(plan.c[i].type, "BLOCK") &&
								eql(plan.c[i].p[2].slice(0, 2), "@_")
						// && selectedSpaces.indexOf(plan.c[i].p[2]) !=
						// -1
						) {
							plan.c[i].studyid = study.id;
							plan.c[i].alias = plan.c[i].p[2].substring(2).split('\x28')[0]
									.trim();
							var nameParts = plan.c[i].alias.split("_");
							if (nameParts.length > 1) {
								plan.c[i].building = nameParts[0];
								plan.c[i].name = nameParts[1];
							} else {
								plan.c[i].building = '';
								plan.c[i].name = plan.c[i].alias;
							}
							spaces.push(plan.c[i]);
						}
					}

					// console.log(spaces);
					pushSpaces(spaces).then(function(replies) {

						angular.forEach(replies, function(reply) {
							console.log(reply);
							var nameParts = reply.data.split(':');

							if (eql(nameParts[1].trim(), 'success'))
								angular.forEach(selectedSpaces, function(space) {
									if (eql(space.alias, nameParts[0].trim())) {
										space.uploaded = true;

									}
								});

						});
						pub.refreshSpaces(study);
					});
					return plan;
					// console.log(plan);
				},

				refreshSpaces : function(study) {
					var url = backend + 'GetAll?t=spaces&studyid=' + study.id;
					fetch(study, url).then(function(response) {
						var result = response.data;
						if (result) {
							updateSpaces(study, response.data);
						}
					}, function(error) {
						console.error(error);
					});
				},
				send : function(url, data) {
					return post(url, data);
				}
			};
			return pub;
		});
app.controller('addPlansInstance', [
		'$scope',
		'$modalInstance',
		'$http',
		'$modal',
		'$q',
		'study',
		'FileUploader',
		'PlanFactory',
		'HTTPFactory',
		'MatcherFactory',
		function($scope, $modalInstance, $http, $modal, $q, study, FileUploader,
				PlanFactory, HTTPFactory, MatcherFactory) {
			"use strict";
			$scope.study = study;
			$scope.predicate = 'building';
			$scope.project = {};
			var date = new Date().getFullYear();
			$scope.project.id = date.toString().substring(2);
			$scope.project.name = '';
			PlanFactory.refreshSpaces(study);
			console.log(study);
			$scope.add = function() {
				if ($scope.project.name.length > 0 && $scope.project.id.length > 3) {
					// $modalInstance.close($scope.selected.item);
					projectFactory.addProject($scope.project.id, $scope.project.name)
							.then(function(response) {
								// console.log(response);
								projectFactory.refreshProjects();
							}, function(error) {
								console.error(error);
							});
					$modalInstance.close();
				}
				// $modalInstance.dismiss('cancel');
			};

			$scope.validateID = function(value) {
				return value.length > 3;
			};
			$scope.cancel = function() {
				$modalInstance.dismiss('cancel');
			};

			// if (window.File && window.FileReader
			// && window.FileList && window.Blob) {
			// // Great success! All the File APIs are
			// // supported.
			// } else {
			// alert('The File APIs are not fully supported in
			// this browser.');
			// }

			var uploader = $scope.uploader = new FileUploader(
			// {
			// url : '/tomcutter/FlowUpload'
			// }
			);
			// FILTERS
			uploader.filters.push({
				name : 'customFilter',
				fn : function(item /* {File|FileLikeObject} */, options) {
					return this.queue.length < 10;
				}
			});

			function endsWith(str, suffix) {
				return str.indexOf(suffix, str.length - suffix.length) !== -1;
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
						if (!endsWith(theFile.name.toUpperCase(), 'DXF')) {
							alert("oi! that's not a DXF!");
							return;
						}

						// var start = 0;
						// var stop = theFile.size - 1;

						// var blob = theFile.slice(start,
						// stop);
						// reader.readAsText(blob);
						//
						// reader.onload = function(e) {
						// // var lines =
						// // text.split(/[\r\n]+/g);
						// dxfText = e.target.result;
						//
						// getData(dxfText);
						// // console.log(e.target);
						// };
						// var blob = new Blob([
						// JSON.stringify(o) ], {
						// type : "plain/text"
						// });
						// theFile.name = 'file.json';
						var flow = new Flow({
							// target :
							// 'studies/plans/data/index.php'
							method : 'octet',
							target : '/tomcutter/StorePlans',
							query : {
								studyid : $scope.study.id
							}
						});
						flow.addFile(theFile);
						flow.upload();
						flow.on('fileSuccess', function(file, message) {
							// console.log(file, message);
							var data = JSON.parse(message);
							afterSpaceExtraction(data);
						});

					};
				})(fileItem._file);
				// Closure to capture the file information.
				// Read in the image file as a data URL.
				reader.readAsDataURL(fileItem._file);
			};

			$scope.searchcomment = '';
			$scope.foundspaces = [];
			function afterSpaceExtraction(data) {
				console.log(data);
				$scope.foundspaces = data.spaces;
				$scope.$apply();
				$scope.fileid = data.fileid;
				openPlanDataModal(data).result.then(function(response) {
					console.log(response);
					HTTPFactory.backendPost('StorePlans', response);
					$modalInstance.close();
				}, function(error) {
					console.log(error);
				});
			}
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
				};
			}

			function getData(text) {

				var o = PlanFactory.restructure(text).c[6];
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
				var blob = new Blob([
					JSON.stringify(o)
				], {
					type : "plain/text"
				});
				blob.name = 'file.json';
				var flow = new Flow({
					// target : 'studies/plans/data/index.php'
					method : 'octet',
					target : '/tomcutter/StorePlans'
				});
				flow.addFile(blob);
				flow.upload();
				flow.on('fileSuccess', function(file, message) {
					console.log(file, message);
				});
				// flow.on('filesSubmitted', function(file) {
				// flow.upload();// instant upload
				// });
				return;
				// cleanPlans();
			}
			var cleanPlans = function() {
				// This function identifies the basic parts of a
				// dxf, and cleans it up from
				// unnecessarry fluff, keeping only the
				// layers,blocks and entitites
				console.log('starting');
				text = text.replace('\r', '\n');
				// var lines = text.match(/[^\r\n]+/gm);
				var lines = text.split('\n');
				console.log('ending');
				var blocks = [];
				var inserts = [];
				// var entities = [];
				var readingSection = -1;
				var readingText = null;
				var seats = [];
				var seatsPerBlock = [];
				// 0 reading blocks
				// 1 reading entities
				// 2 reading layers
				// var condensed = [];
				var readingObject = false;
				var name;
				for (var i = 0; i < lines.length; i += 2) {
					parameter = parseInt(lines[i].trim());
					while (isNaN(parameter) && i < lines.length - 2) {
						i++;
						parameter = parseInt(lines[i].trim());
					}
					if (!readingObject) {
						line = lines[i + 1];
						if (-1 == readingSection && 2 != parameter)
							continue;
						if (-1 != readingSection && (eql(line, "ENDSEC"))) {
							readingSection = -1;
							continue;
						}
						if (-1 == readingSection) {
							if (eql(line, "BLOCKS")) {
								readingSection = 0; // reading
								// blocks;
								continue;
							} else if (eql(line, "ENTITIES")) {
								readingSection = 1; // reading
								// entities;
								continue;
							}
						}

						if (0 !== parameter)
							continue;
						if (0 === readingSection && eql(line, "BLOCK")) {
							readingObject = true;
							continue;
						}
						if (1 === readingSection) {
							readingObject = true;
							continue;
						}
						continue;
					}

					line = lines[i + 1];
					if (0 === readingSection) { // blocks
						if (0 === parameter) {
							readingText = null;
							if (eql(line, "ENDBLK")) {
								if (seats.length > 0) {
									// console
									// .log(blocks[blocks.length
									// - 1]);
									seatsPerBlock[blocks[blocks.length - 1]] = seats;
									// console.log(seats);
									seats = [];
								}
								readingObject = false;
								continue;
							} else if (eql(line, "MTEXT")) {
								readingText = {};
							} else if (eql(line, "TEXT")) {
								readingText = 2;
							}
						} else if (1 === parameter /* mtext-string */&& readingText) {
							readingText.text = line;
							if (readingText.layer) {
								if (!eql(readingText.layer.toLowerCase(), "@_seatid")) {
									readingText = null;
									continue;
								} else
									seats.push(readingText);

							}
						} else if (8 === parameter /* layer */&& readingText) {
							readingText.layer = line;
							if (!eql(readingText.layer.toLowerCase(), "@_seatid")) {
								readingText = null;
								continue;
							}
							if (readingText.text)
								seats.push(readingText);
						}
						if (2 == parameter) { // parameter 2
							// is
							// tha name of tha block
							name = line.trim();
							if (eql(name.slice(0, 2), '@_'))
								blocks.push(name);
						}
					} else if (1 === readingSection) { // entities
						if (0 === parameter) {
							i -= 2;
							readingObject = false;
							continue;
						}
						if (2 == parameter) // parameter 2 is
							// tha name of tha
							// block
							inserts.push(line.trim());
					}
				}
				var validSpaces = [];
				// console.log('blocks');
				// for (var i = 0; i < blocks.length; i++)
				// console.log(i + ' ' + blocks[i]);
				// console.log('inserts');
				var foundSomething = '';
				for (i = 0; i < inserts.length; i++) {
					// console.log(i + ' ' + inserts[i]);
					if ('@_' != inserts[i].substring(0, 2) ||
							-1 == blocks.indexOf(inserts[i]))
						continue;
					var nameParts = inserts[i].split('-');
					if ('' === foundSomething && nameParts.length > 1) {
						if ('acc' == nameParts[1].toLowerCase()) {
							foundSomething = 'accommodation layers';
						} else if ('team' == nameParts[1].toLowerCase()) {
							foundSomething = 'team layers';
						}
					} else {
						name = inserts[i].substring(2).split('\x28')[0];
						validSpaces.push(name);
						nameParts = name.split("_");
						$scope.foundspaces.push({
							alias : name,
							building : nameParts[0],
							name : nameParts[1],
							seats : seatsPerBlock[inserts[i]]
						});
					}
				}
				validSpaces.sort();
				var foundobjects = '';
				// if (!(foundobjects = $('#foundobjects'))) {
				// foundobjects =
				// document.createElement('div');
				// foundobjects.setAttribute('id',
				// 'foundobjects')
				// }
				if (validSpaces.length === 0) {
					foundobjects = 'No valid spaces found...\n';
					if ('' !== foundSomething)
						foundobjects += '\n...only some ' + foundSomething + '...';
					// $($scope.searchcomment).attr('rows', 2);
					// $('#fileloader').removeClass('validbox');
				} else {
					if (validSpaces.length == 1)
						foundobjects = '1 valid space found:\n\n';
					else
						foundobjects = validSpaces.length + ' valid spaces found\n\n';
					// validateBox('#fileloader');
					// $($scope.searchcomment).attr('rows',
					// validSpaces.length + 2);
				}
				$scope.searchcomment = foundobjects;
				$scope.$apply();

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
			};
			$scope.selectAllSpaces = function() {
				for (var i = 0; i < $scope.foundspaces.length; i++)
					$scope.foundspaces[i].selected = true;
			};

			$scope.noSelectedSpaces = function() {
				for (var i = 0; i < $scope.foundspaces.length; i++)
					if ($scope.foundspaces[i].selected)
						return false;
				return true;
			};
			var openConfirmModal = function(message, okText, cancelText) {
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
			};
			$scope.deleteSelectedSpaces = function(study) {
				var spacesToDelete = [];
				angular.forEach(study.existingSpaces, function(space) {
					if (space.selected)
						spacesToDelete.push(space);
				});
				if (spacesToDelete.length < 1)
					return;
				var message = 'Are you sure you want to delete these spaces?\n\n';

				angular.forEach(spacesToDelete, function(space) {
					message += space.alias + '\n';
				});
				var ok = 'DELETE';
				var cancel = 'Cancel';
				openConfirmModal(message, ok, cancel).result.then(function() {
					console.log('create delete function');
				}, function() {
				});
				// jQuery.noConflict();
				// bootbox.confirm("Are you sure?", function(
				// result) {
				// console.log("Confirm result: " + result);
				// });
			};

			var rounds = 0;
			var days = 0;

			$scope.addDXF = function() {
				var selectedSpaces = [];
				for (var i = 0; i < $scope.foundspaces.length; i++)
					if ($scope.foundspaces[i].selected)
						// selectedSpaces.push("@_"
						// + $scope.foundspaces[i].alias);
						selectedSpaces.push($scope.foundspaces[i]);
				PlanFactory.uploadSpaces(study, dxfText, selectedSpaces);
			};
			$scope.attach = function(study) {

				var selectedSpaces = [];
				for (var i = 0; i < $scope.foundspaces.length; i++)
					if ($scope.foundspaces[i].selected) {
						// $scope.foundspaces[i].matches =
						// $scope.foundspaces[i].alias
						$scope.foundspaces[i].matches = '*';
						selectedSpaces.push($scope.foundspaces[i]);
					}
				if (selectedSpaces.length === 0) {
					alert("No spaces selected to update/upload");
					return;
				}
				var data = {
					studyid : $scope.study.id,
					fileid : $scope.fileid,
					spaces : selectedSpaces
				};

				HTTPFactory.backendPost("StorePlans", data).then(function(response) {
					console.log(response);
				}, function(error) {
					console.log(error);
				});
			};
			function submitFunc() {
				if ($('#dxfstore').val().trim().length === 0) {
					var data;
					if (dxfText)
						data = stripDXF(dxfText);
					else if ($('#file').val().trim().length !== 0) {
						$('#file').onchange();
						data = stripDXF(dxfText);
					} else
						return false;
					$('#dxfstore').val(data);
				}
				$('input[name=file]').val("");
				return true;
			}
			var openPlanDataModal = function(planData) {
				var promise = $modal.open({
					templateUrl : 'studies/plans/planData.html',
					controller : 'planDataSelectorMI',
					resolve : {
						planData : function() {
							return planData;
						}
					}
				});
				return promise;
			};
		}
]);
app.controller('planDataSelectorMI', [
		'$scope', '$modalInstance', 'MatcherFactory', 'planData',
		function($scope, $modalInstance, MatcherFactory, planData) {
			"use strict";
			$scope.cancel = function() {
				$modalInstance.dismiss('cancel');
			};
			$scope.attach = function() {
				$modalInstance.close(planData);
			};
			$scope.planData = planData;
			$scope.dataTypes = [];
			if (planData.spaces && planData.spaces.length > 0) {
				$scope.dataTypes.push({
					name : "Plan",
					canBeNew : planData.spacesInDB.length === 0,
					spaces : planData.spaces,
					state : planData.spacesInDB.length === 0 ? 'new' : 'overwrite',
					refine : function() {
						// MatcherFactory.openMatcherModal('space', 'spaces',
						// planData.spaces, planData.spacesInDB);
					}
				});
			}
			if (planData.accSpaces && planData.accSpaces.length > 0) {
				$scope.dataTypes.push({
					name : "Function polygons",
					canBeNew : planData.accSpacesInDB.length === 0,
					spaces : planData.accSpaces,
					state : planData.accSpacesInDB.length === 0 ? 'new' : 'overwrite',
					refine : function() {
						// MatcherFactory.openMatcherModal('space', 'spaces',
						// planData.accSpaces, planData.accSpacesInDB);
					}
				});
			}
			if (planData.teamSpaces && planData.teamSpaces.length > 0) {
				$scope.dataTypes.push({
					name : "Team polygons",
					canBeNew : planData.teamSpacesInDB.length === 0,
					spaces : planData.teamSpaces,
					state : planData.teamSpacesInDB.length === 0 ? 'new' : 'overwrite',
					refine : function() {
						// MatcherFactory.openMatcherModal('space', 'spaces',
						// planData.teamSpaces, planData.teamSpacesInDB);
					}
				});
			}
			$scope.setState = function(dataType, state) {
				dataType.state = state;
			};
			$scope.isState = function(dataType, state) {
				return dataType.state === state;
			};
		}
]);
// app.controller('planDataSelectorMI', [
