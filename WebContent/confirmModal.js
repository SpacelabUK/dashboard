app.controller('confirmDialog', [ '$scope', '$modalInstance', 'message',
		'okText', 'cancelText',
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
		} ]);