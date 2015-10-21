(function() {
	"use strict";
	angular.module('app.metrics').controller("addMetric", addMetric);
	addMetric.$inject = [
			'$modalInstance', 'dataService'
	];
	function addMetric($modalInstance, dataService, StudyFactory) {
		var vm = this;
		vm.cancel = function() {
			$modalInstance.dismiss('cancel');
		}
		vm.ok = function() {
			if (vm.metricValid && vm.metricAlias) {
				var data = {
					metric : {}
				};
				data.metric[vm.metricAlias] = vm.metricValid;
				console.log(data);
				dataService.storeMetric(data).then(function(response) {
					console.log(response.data);
				}, function(error) {
					console.log(error);
				});
			}
			// $modalInstance.close();
		}
		vm.metricAlias = undefined;
		vm.metricValid = false;
		vm.onCodeChange = function() {
			vm.codeStyle = "";
			vm.metricValid = false;
		}
		vm.testMetric = function() {
			vm.codeStyle = "color:green";
			vm.resultStyle = "";
			vm.result = "";
			var metricTree;
			try {
				metricTree = JSON.parse(vm.metricTree);
				if (metricTree.measure.alias)
					delete metricTree.measure.alias;
				if (metricTree.alias)
					delete metricTree.alias;
				vm.metricTree = JSON.stringify(metricTree, null, "\t");
				vm.metricTree = vm.metricTree.replace(/\\n/g, "\n");
				vm.metricTree = vm.metricTree.replace(/\\t/g, "\t");
				// $scope.metricTree = $scope.metricTree.replace(/\\"/g,
				// "\"");
			} catch (err) {
				vm.codeStyle = "color:red";
				vm.resultStyle = "color:red";
				vm.result = err.message;
				vm.metricValid = false;
				return;
			}
			// .replace(/\\/g,'\\')
			StudyFactory.testMetric(39, metricTree).then(function(response) {
				vm.result = JSON.stringify(response.data, null, "\t");
				vm.codeStyle = "color:green";
				vm.resultStyle = "color:green";
				vm.metricValid = JSON.parse($scope.metricTree);
			}, function(error) {
				vm.result = error;
				vm.codeStyle = "color:red";
				vm.resultStyle = "color:red";
				vm.metricValid = false;
			});
		}
	}
})();