(function() {
	"use strict";
	angular.module('app.metrics').controller('MetricsController',
			MetricsController);
	MetricsController.$inject = [
			'$modal', 'dataService',
	// 'RoundModelFactory', 'fetching'
	];

	function MetricsController($modal, dataService) {
		var vm = this;
		vm.predicate = 'id';
		dataService.getMetrics().then(function(response) {
			vm.metrics = response.data;
			for (var i = 0; i < vm.metrics.length; i++) {
				vm.metrics[i].indx = i;
			}
		});
		vm.setSearch = function(data) {
			vm.search = data;
		}
		vm.addMetric = function() {
			$modal.open({
				size : 'lg',
				templateUrl : 'app/metrics/add-metric.modal.html',
				controller : 'addMetric',
				controllerAs : 'vm',
				resolve : {}
			})
		}
		vm.viewMetricDetails = function(metric) {
			$modal.open({
				size : 'lg',
				templateUrl : 'app/metrics/view-metric-details.modal.html',
				controller : 'viewMetricDetails',
				controllerAs : 'vm',
				resolve : {
					metric : function() {
						return metric;
					}
				}
			});
		}
		vm.editMetric = function(metric) {
			$modal.open({
				templateUrl : 'app/metrics/edit-metric.modal.html',
				controller : 'editMetric',
				controllerAs : 'vm',
				resolve : {
					metric : function() {
						return angular.copy(metric);
					}
				}
			}).result.then(function(response) {
				var keys = Object.keys(response);
				for (var i = 0; i < keys.length; i++)
					if (response[keys[i]] === null || response[keys[i]] === undefined)
						delete response[keys[i]];
				dataService.storeMetric({
					metric : response
				}).then(function(response) {
					vm.metrics[metric.indx] = response.data;
				}, function(error) {
					console.log(error);
				});
				console.log(response);
			});
		}
	}
})();