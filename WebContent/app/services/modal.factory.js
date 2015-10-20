angular.module('app.core').factory(
		'modalFactory',
		[
				'$modal',
				function($modal) {
					var waitModalInstance;
					var waitData = {
						text : 'Loading...'
					};
					var pub = {
						openWaitModal : function(waitText, progress) {
							waitData.text = waitText;
							waitData.progress = progress;
							waitModalInstance = $modal.open({
								animation : 0,
								templateUrl : 'app/services/waitModal.html',
								backdrop : 'static',
								keyboard : 'false',
								controller : 'waitModalCtrl',
								windowClass : 'wait-dialog',
								resolve : {
									"waitData" : function() {
										return waitData;
									}
								}
							});
							return waitModalInstance;
						},
						closeWaitModal : function() {
							if (waitModalInstance)
								waitModalInstance.dismiss('cancel');
						},
						modifyWaitMessage : function(waitText, progress) {
							waitData.text = waitText;
							waitData.progress = progress;
						},
						openConfirmModal : function(message, okText, cancelText) {
							var promise = $modal.open({
								templateUrl : 'app/services/confirmModal.html',
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
						},
						openErrorModal : function(message) {
							var promise = $modal.open({
								templateUrl : 'app/services/errorModal.html',
								controller : 'errorDialog',
								resolve : {
									message : function() {
										return message;
									}
								}
							});
							return promise;
						},
						openSelectFileModal : function(title, description, accept,
								uploader, okAction, fileValid) {
							var promise = $modal.open({
								templateUrl : 'app/services/selectFileModal.html',
								controller : 'selectFileDialog',
								resolve : {
									title : function() {
										return title;
									},
									description : function() {
										return description;
									},
									accept : function() {
										return accept;
									},
									uploader : function() {
										return uploader;
									},
									okAction : function() {
										return okAction;
									},
									fileValid : function() {
										return fileValid;
									}
								}
							});
							return promise;
						}
					};
					return pub;
				}
		]);

angular.module('app.core').controller(
		'selectFileDialog',
		[
				'$scope',
				'$modalInstance',
				'FileUploader',
				'title',
				'description',
				'accept',
				'uploader',
				'okAction',
				'fileValid',
				function($scope, $modalInstance, FileUploader, title, description,
						accept, uploader, okAction, fileValid) {
					"use strict";
					$scope.title = title;
					$scope.description = description;
					$scope.accept = accept;
					if (okAction)
						$scope.okAction = okAction;
					else
						$scope.okAction = "Continue";
					if (fileValid)
						$scope.fileValid = fileValid;
					else
						$scope.fileValid = function() {
							return true;
						};
					if (uploader)
						$scope.uploader = uploader;
					else
						$scope.uploader = new FileUploader({});
					$scope.attach = function() {
						$modalInstance.close($scope.uploader);
					};
					$scope.cancel = function() {
						$modalInstance.dismiss('cancel');
					};
				}
		]);

angular.module('app.core').controller(
		'waitModalCtrl',
		[
				'$scope', '$modalInstance', 'waitData',
				function($scope, $modalInstance, waitData) {
					$scope.waitData = waitData;
				}
		]);

angular.module('app.core').factory(
		'MatcherFactory',
		[
				'$modal',
				function($modal) {
					// in a next stage this controller should be merged with the general
					// above
					var pub = {
						openMatcherModal : function(type, types, fromElements, toElements,
								options) {
							if (!options)
								options = {};
							var promise = $modal.open({
								templateUrl : 'app/services/matcherModal.html',
								controller : 'matcherModalInstance',
								resolve : {
									type : function() {
										return type;
									},
									types : function() {
										return types;
									},
									fromElements : function() {
										return fromElements;
									},
									toElements : function() {
										return toElements;
									},
									options : function() {
										return options;
									}
								}
							});
							return promise;
						}
					};
					return pub;
				}
		]);
/**
 * @param options.prematch:
 *          Will try to match FROM and TO elements. If set to 'ignorecase' it
 *          will treat the values as strings and compare ignoring case. To
 *          define alternative properties to compare user fromPrematch and
 *          toPrematch
 * @param options.fromPrematch:
 *          see options.prematch
 * @param options.toPrematch:
 *          see options.prematch
 */
angular
		.module('app.core')
		.controller(
				'matcherModalInstance',
				[
						'$scope',
						'$modalInstance',
						'type',
						'types',
						'fromElements',
						'toElements',
						'options',
						function($scope, $modalInstance, type, types, fromElements,
								toElements, options) {
							var i, j;
							$scope.type = type;
							$scope.types = types;
							$scope.inFilePredicate = 'alias';
							$scope.inDBPredicate = 'alias';
							$scope.fromElements = fromElements;
							$scope.options = options;
							$scope.attach = function() {
								$modalInstance.close(fromElements);
							};
							if (toElements)
								$scope.toElements = toElements;
							else
								$scope.toElements = [];
							for (i = 0; i < toElements.length; i++)
								toElements[i].available = true;

							if (options.prematch)
								for (i = 0; i < fromElements.length; i++) {
									var fromPrematch, toPrematch;
									if (options.fromPrematch)
										fromPrematch = options.fromPrematch;
									else
										fromPrematch = "alias";
									if (options.toPrematch)
										toPrematch = options.toPrematch;
									else
										toPrematch = "alias";
									for (j = 0; j < toElements.length; j++)
										if ((options.prematch === 'ignorecase' && eql(
												toElements[j][toPrematch],
												fromElements[i][fromPrematch])) ||
												toElements[j][toPrematch] === fromElements[i][fromPrematch]) {
											fromElements[i].match = toElements[j];
											toElements[j].available = false;
											break;
										}
								}
							else {
								for (i = 0; i < fromElements.length; i++)
									if (fromElements[i].prematch) {
										if (fromElements[i].prematchproperty) {
											for (j = 0; j < toElements.length; j++)
												if (toElements[j][fromElements[i].prematchproperty] == fromElements[i].prematch) {
													fromElements[i].match = toElements[j];
													toElements[j].available = false;
													break;
												}
										}
										for (j = 0; j < toElements.length; j++)
											if (toElements[j].alias == fromElements[i].prematch) {
												fromElements[i].match = toElements[j];
												toElements[j].available = false;
												break;
											}
									}
							}
							$scope.cancel = function() {
								$modalInstance.dismiss('cancel');
							};
							$scope.getElementProperty = function(element, property) {
								return element[property];
							};
							$scope.selectFrom = function(element) {
								for (var i = 0; i < fromElements.length; i++) {
									fromElements[i].selected = false;
									if (fromElements[i].match)
										fromElements[i].match.available = false;
								}
								element.selected = true;
								for (i = 0; i < toElements.length; i++)
									toElements[i].selected = false;
								if (element.match) {
									element.match.selected = true;
									element.match.available = true;
								}

							};
							$scope.selectTo = function(element) {
								if (!element.available)
									return;
								var selectedFrom;
								for (var i = 0; i < fromElements.length; i++) {
									if (fromElements[i].selected) {
										selectedFrom = fromElements[i];
										break;
									}
								}
								if (element.selected) {
									element.selected = false;
									selectedFrom.match = null;
									return;
								}
								for (i = 0; i < toElements.length; i++)
									toElements[i].selected = false;
								if (selectedFrom) {
									element.selected = true;
									selectedFrom.match = element;
								}

							};
							$scope.deselect = function() {
								for (var i = 0; i < fromElements.length; i++) {
									if (fromElements[i].selected) {
										fromElements[i].match.selected = false;
										fromElements[i].match.available = true;
										fromElements[i].match = null;
										break;
									}
								}
							};
							$scope.selectedElementIsNew = function() {
								for (var i = 0; i < fromElements.length; i++) {
									if (fromElements[i].selected) {
										$scope.elementIsNew(fromElements[i]);
										break;
									}
								}
							};
							$scope.elementIsNew = function(element) {
								if (element.match) {
									element.match.selected = false;
									element.match.available = true;
								}
								element.match = '*';
							};
							$scope.selectedElementIgnore = function() {
								for (var i = 0; i < fromElements.length; i++) {
									if (fromElements[i].selected) {
										$scope.elementIgnore(fromElements[i]);
										break;
									}
								}
							};
							$scope.elementIgnore = function(element) {
								if (element.match) {
									element.match.selected = false;
									element.match.available = true;
								}
								element.match = '-';
							};
							$scope.reset = function() {
								for (i = 0; i < fromElements.length; i++) {
									fromElements[i].selected = false;
									fromElements[i].match = null;
								}
								for (i = 0; i < toElements.length; i++) {
									toElements[i].selected = false;
									toElements[i].available = true;
								}
							};
							$scope.getElementState = function(element) {
								if (!element.available)
									return 'disabled';
								if (element.selected)
									return 'highlight';
							};
							$scope.getElementMatch = function(element) {
								if (element.match && element.match.alias)
									return element.match.alias;
								if (element.match && element.match.manualMatch)
									return element.match[element.match.manualMatch] +
											" (user set)";
								if (element.match === '*')
									return '- NEW -';
								if (element.match === '-')
									return '- IGNORE -';

							};
							$scope.capitalize = function(type) {
								return type.charAt(0).toUpperCase() + type.substring(1);
							};
							$scope.setValueManually = function(element) {
								if ($scope.options && $scope.options.toMatchProperty) {
									var prop = prompt($scope.options.toMatchProperty.prompt, "");
									if (prop) {
										element.match = {
											manualMatch : $scope.options.toMatchProperty.name
										};
										element.match[$scope.options.toMatchProperty.name] = prop;
									}
								}
							};
						}
				]);
angular.module('app.core').controller(
		'confirmDialog',
		[
				'$scope', '$modalInstance', 'message', 'okText', 'cancelText',
				function($scope, $modalInstance, message, okText, cancelText) {
					$scope.message = message;
					$scope.okText = okText;
					$scope.cancelText = cancelText;
					$scope.cancel = function() {
						$modalInstance.dismiss('cancel');
					};
					$scope.ok = function() {
						$modalInstance.close('ok');
					};
				}
		]);
angular.module('app.core').controller(
		'errorDialog',
		[
				'$scope', '$modalInstance', 'message',
				function($scope, $modalInstance, message) {
					$scope.message = message;
					$scope.ok = function() {
						$modalInstance.dismiss();
					};
				}
		]);