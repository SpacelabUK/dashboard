app.factory('ModalFactory', function($modal) {
	var waitModalInstance;
	var waitModalHTML = '<div class="text-center">'
			+ '<h3 style="color: white; margin: 10px 20px;">'
			+ '<!--<i ng-hide="waitData.progress != null" class="fa fa-cog fa-spin">'
			+ '</i>--> ' + '{{waitData.text}}</h3>'
			+ '<progressbar ng-show="waitData.progress != null" max="1"'
			+ ' style="margin: 0px 20px 10px; height: 3px; background-color: #333;" '
			+ ' value="waitData.progress">' + '</progressbar>'
			+ '<progressbar class="progress-striped active" '
			+ ' ng-hide="waitData.progress != null"'
			+ ' style="margin: 0px 20px 10px; height: 3px;" ' + ' value="100">'
			+ '</progressbar>' + '</div>';
	var waitData = {
		text : 'Loading...'
	};
	var pub = {
		openWaitModal : function(waitText, progress) {
			waitData.text = waitText;
			waitData.progress = progress;
			waitModalInstance = $modal.open({
				animation : 0,
				template : waitModalHTML,
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
				templateUrl : 'util/confirmModal.html',
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
		}
	}
	return pub;
});
app.controller('waitModalCtrl', [
		'$scope', '$modalInstance', 'waitData',
		function($scope, $modalInstance, waitData) {
			$scope.waitData = waitData;
		}
]);

app.factory('MatcherFactory',
		function($modal) {
			// in a next stage this controller should be merged with the general above
			var pub = {
				openMatcherModal : function(type, types, fromElements, toElements,
						options) {
					if (!options)
						options = {};
					var promise = $modal.open({
						templateUrl : 'util/matcher.html',
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
		});
app
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
							$scope.type = type;
							$scope.types = types;
							$scope.inFilePredicate = 'alias';
							$scope.inDBPredicate = 'alias';
							$scope.fromElements = fromElements;
							$scope.options = options;
							$scope.attach = function() {
								$modalInstance.close(fromElements);
							}
							if (toElements)
								$scope.toElements = toElements;
							else
								$scope.toElements = [];
							for (var i = 0; i < toElements.length; i++)
								toElements[i].available = true;
							for (var i = 0; i < fromElements.length; i++)
								if (fromElements[i].prematch) {
									if (fromElements[i].prematchproperty) {
										for (var j = 0; j < toElements.length; j++)
											if (toElements[j][fromElements[i].prematchproperty] == fromElements[i].prematch) {
												fromElements[i].match = toElements[j];
												toElements[j].available = false;
												break;
											}
									}
									for (var j = 0; j < toElements.length; j++)
										if (toElements[j].alias == fromElements[i].prematch) {
											fromElements[i].match = toElements[j];
											toElements[j].available = false;
											break;
										}
								}
							$scope.cancel = function() {
								$modalInstance.dismiss('cancel');
							};
							$scope.getElementProperty = function(element, property) {
								return element[property];
							}
							$scope.selectFrom = function(element) {
								for (var i = 0; i < fromElements.length; i++) {
									fromElements[i].selected = false;
									if (fromElements[i].match)
										fromElements[i].match.available = false;
								}
								element.selected = true;
								for (var i = 0; i < toElements.length; i++)
									toElements[i].selected = false;
								if (element.match) {
									element.match.selected = true;
									element.match.available = true;
								}

							}
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
								for (var i = 0; i < toElements.length; i++)
									toElements[i].selected = false;
								if (selectedFrom) {
									element.selected = true;
									selectedFrom.match = element;
								}

							}
							$scope.deselect = function() {
								for (var i = 0; i < fromElements.length; i++) {
									if (fromElements[i].selected) {
										fromElements[i].match.selected = false;
										fromElements[i].match.available = true;
										fromElements[i].match = null;
										break;
									}
								}
							}
							$scope.selectedElementIsNew = function() {
								for (var i = 0; i < fromElements.length; i++) {
									if (fromElements[i].selected) {
										$scope.elementIsNew(fromElements[i]);
										break;
									}
								}
							}
							$scope.elementIsNew = function(element) {
								if (element.match) {
									element.match.selected = false;
									element.match.available = true;
								}
								element.match = '*';
							}
							$scope.selectedElementIgnore = function() {
								for (var i = 0; i < fromElements.length; i++) {
									if (fromElements[i].selected) {
										$scope.elementIgnore(fromElements[i]);
										break;
									}
								}
							}
							$scope.elementIgnore = function(element) {
								if (element.match) {
									element.match.selected = false;
									element.match.available = true;
								}
								element.match = '-';
							}
							$scope.reset = function() {
								for (var i = 0; i < fromElements.length; i++) {
									fromElements[i].selected = false;
									fromElements[i].match = null;
								}
								for (var i = 0; i < toElements.length; i++) {
									toElements[i].selected = false;
									toElements[i].available = true;
								}
							}
							$scope.getElementState = function(element) {
								if (!element.available)
									return 'disabled';
								if (element.selected)
									return 'highlight';
							}
							$scope.getElementMatch = function(element) {
								if (element.match && element.match.alias)
									return element.match.alias;
								if (element.match == '*')
									return '- NEW -';
								if (element.match == '-')
									return '- IGNORE -';

							}
							$scope.capitalize = function(type) {
								return type.charAt(0).toUpperCase() + type.substring(1);
							}
						}
				]);
app.controller('confirmDialog', [
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