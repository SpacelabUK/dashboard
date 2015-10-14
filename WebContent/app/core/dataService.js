(function() {
	'use strict';
	angular.module('app.core').factory('dataService', dataService);
	dataService.$inject = [
		'$http'
	];
	var backend = "/Database/";
	function dataService($http) {
		var service = {
			getDevices : getDevices,
			addDevice : addDevice,
			getProjects : getProjects,
			addProject : addProject,
			getMetrics : getMetrics,
			getMetricsDetails : getMetricsDetails,
			getMetricsProperties : getMetricsProperties,
			storeMetric : storeMetric,
			getIssues : getIssues,
			removeMetricFromIssue : removeMetricFromIssue,
			addMetricToIssue : addMetricToIssue,
			switchIssueMetricOrder : switchIssueMetricOrder
		};
		return service;
		function getDevices() {
			return $http.get(backend + 'GetAll?t=devices');
		}
		function addDevice(device) {
			return $http.post(backend + 'Insert?t=device', device);
		}
		function getProjects() {
			return $http.get(backend + 'GetAll?t=allstudies');
		}
		function addProject(project) {
			return $http.post(backend + 'Insert?t=device', project);
		}
		function getMetricsDetails(request) {
			return $http.post(backend + 'Metrics', request);
		}
		function getMetrics() {
			return $http.get(backend + 'Metrics');
		}
		function getIssues() {
			return $http.get(backend + 'Issues');
		}
		function getMetricsProperties(properties) {
			return $http.get(backend + 'Metrics?filter=' + properties.join(', '));
		}
		function storeMetric(project) {
			return $http.post(backend + 'StoreMetric', project);
		}
		function removeMetricFromIssue(issueID, metricID) {
			var data = {
				metric_group : issueID,
				metric_id : metricID
			}
			return $http.post(backend + 'RemoveMetricFromIssue', data);
		}
		function addMetricToIssue(issueID, metricID) {
			var data = {
				metric_group : issueID,
				metric_id : metricID
			}
			return $http.post(backend + 'AddMetricToIssue', data);
		}
		function switchIssueMetricOrder(issueID, orderFrom, orderTo) {
			var data = {
				order_1 : orderFrom,
				order_2 : orderTo,
				metric_group : issueID
			};
			return $http.post(backend + 'SwitchIssueMetricOrder', data);
		}
	}
})();