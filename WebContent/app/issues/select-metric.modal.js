(function() {
	"use strict";
	angular.module('app.issues').controller("SelectMetricModal",
			SelectMetricModal);
	SelectMetricModal.$inject = [
			'$modalInstance', 'dataService', 'issueID', 'okText', 'exceptMetrics'
	];
	function SelectMetricModal($modalInstance, dataService, issueID, okText,
			exceptMetrics) {
		var vm = this;
		vm.okText = okText;
		vm.refreshMetrics = function() {
		}
		vm.metricSelector = {};
		dataService.getMetricsProperties([
				'id', 'title'
		]).then(function(response) {
			for (var i = 0; i < response.data.length; i++) {
				if (exceptMetrics.indexOf(response.data[i].id) !== -1)
					response.data[i].disabled = true;
			}
			vm.availableMetrics = response.data;
		}, function(error) {
		})
		vm.ok = function() {
			$modalInstance.close({
				issueID : issueID,
				metricID : vm.metricSelector.selected.id
			});
		}
		vm.dismiss = function() {
			$modalInstance.dismiss();
		}
	}
})();