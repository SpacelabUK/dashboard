(function() {
	"use strict";
	angular.module('app.metrics').controller("viewMetricDetails",
			viewMetricDetails);
	viewMetricDetails.$inject = [
			'$modalInstance', 'metric', 'dataService'
	];
	function viewMetricDetails($modalInstance, metric, dataService) {
		var vm = this;
		dataService.getMetricsDetails({
			wanted_metrics : [
				metric.alias
			]
		}).then(
				function(response) {
					if (response && response.data && response.data.metrics)
						vm.metricTree = JSON.stringify(response.data.metrics[metric.alias],
								null, 2);
				});
		vm.cancel = function() {
			$modalInstance.dismiss('cancel');
		}
		vm.ok = function() {
			$modalInstance.close();
		}
	}
})();