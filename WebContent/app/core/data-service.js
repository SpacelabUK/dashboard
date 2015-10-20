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
			switchIssueMetricOrder : switchIssueMetricOrder,
			getSpatialFunctions : getSpatialFunctions,
			addSpatialFunction : addSpatialFunction,
			getOccupancyPerSpaceAndRound : getOccupancyPerSpaceAndRound,
			getSpaceFunctionPolygons : getSpaceFunctionPolygons,
			getSpaceTeamPolygons : getSpaceTeamPolygons,
			getDepthmapMeasureRaster : getDepthmapMeasureRaster,
			getSnapshotData : getSnapshotData,
			getPlanImageURL : getPlanImageURL,
			convertSVGtoEMF : convertSVGtoEMF,
			storeIssue : storeIssue,
			storeFunction : storeFunction,
			resolveProc : resolveProc
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
		function storeMetric(metric) {
			return $http.post(backend + 'StoreMetric', metric);
		}
		function storeIssue(issue) {
			return $http.post(backend + "StoreIssue", {
				issue : issue
			});
		}
		function resolveProc(proc, paramString) {
			return $http.get(backend + 'Occupancy?t=' + proc + paramString);
		}
		function storeFunction(func) {
			return $http.post(backend + "StoreFunction", {
				func : func
			});
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
		function getSpatialFunctions() {
			return $http.get(backend + 'GetAll?t=spatial_functions');
		}
		function addSpatialFunction(alias, name) {
			var data = {
				'alias' : alias,
				'name' : name
			};
			return $http.post(backend + 'Insert?t=spatial_function', data);
		}
		function getOccupancyPerSpaceAndRound(studyID) {
			return $http.get(backend +
					'Occupancy?t=occ_per_space_and_round_prc&studyid=' + studyID);
		}
		function getSpaceFunctionPolygons(spaceID) {
			return $http.get(backend + "GetSpaceData?spaceid=" + spaceID +
					"&functeam=func");
		}
		function getSpaceTeamPolygons(spaceID) {
			return $http.get(backend + "GetSpaceData?spaceid=" + spaceID +
					"&functeam=team");
		}
		function getDepthmapMeasureRaster(spaceID, measureID) {
			return $http.get(backend + "GetDepthmapData?spaceid=" + spaceID +
					"&measure=" + measureID + "&analysis_type=" + 'Accessibility');
		}
		function getSnapshotData(snapshotID) {
			return $http.get(backend + "GetObservationData?snapshotid=" + snapshotID);
		}
		function getPlanImageURL(planImg) {
			return backend + "data/plans/" + planImg;
		}
		function convertSVGtoEMF(svgData) {
			return $http.post(backend + "ConvertSVGToEMF", {
				data : svgData
			}, {
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
				},
				transformRequest : function(data) {
					return $.param(data);
				}
			});
		}
	}
})();