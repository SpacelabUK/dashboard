(function() {
	"use strict";
	angular.module('app.issues').controller('Issues', issuesController);
	issuesController.$inject = [
			'$stateParams', '$modal', 'dataService', 'modalFactory'
	// 'RoundModelFactory', 'fetching'
	];

	function issuesController($stateParams, $modal, dataService, modalFactory) {
		var vm = this;
		vm.issue = $stateParams.issue;
		vm.issueNames = [];
		vm.metrics = [];
		vm.removeMetric = function(issue, metric, issue_metric) {
			modalFactory.openConfirmModal(
					"Are you sure you want to remove metric \"" + metric.title +
							"\" from issue " + issue.id + "?", "Remove", "Cancel").result
					.then(function(ok) {
						dataService.removeMetricFromIssue(issue.id, issue_metric.id).then(
								function(response) {
									vm.wantedMetrics[0].metrics.splice(
											vm.wantedMetrics[0].metrics.indexOf(issue_metric), 1);
								}, function(error) {
									console.log(error);
								});
					});
		}
		vm.addMetricToIssue = function(issue, okText) {
			var modalInstance = $modal.open({
				templateUrl : 'app/issues/select-metric.modal.html',
				controller : 'SelectMetricModal',
				controllerAs : 'vm',
				resolve : {
					exceptMetrics : function() {
						return issue.metrics.map(function(m) {
							return m.id
						})
					},
					issueID : function() {
						return issue.id
					},
					okText : function() {
						return okText
					}
				}
			});
			modalInstance.result.then(function(modalResponse) {
				if (modalResponse) {
					dataService.addMetricToIssue(modalResponse.issueID,
							modalResponse.metricID).then(function(response) {
						vm.wantedMetrics[0].metrics.push(response.data);
						vm.metrics[response.data.alias] = response.data;
					}, function(error) {
						console.log(error);
					});
				}
			});
		}
		dataService
				.getIssues()
				.then(
						function(response) {
							var i, j, newMetrics;
							vm.wantedMetrics = response.data;

							for (j = 0; j < vm.wantedMetrics.length; j++) {
								var met = {
									id : vm.wantedMetrics[j].id,
									title : vm.wantedMetrics[j].title
								};
								vm.issueNames.push(met);
							}
							vm.pageTitle = 'Issues';
							if (!vm.issue) {
								vm.wantedMetrics = [];
							}
							if (vm.issue && vm.issue !== 'all') {
								var issues = vm.issue.split(',');
								newMetrics = [];
								for (j = 0; j < issues.length; j++) {
									for (i = 0; i < vm.wantedMetrics.length; i++) {
										if (vm.wantedMetrics[i].id.slice(0, issues[j].length) === issues[j] &&
												newMetrics.indexOf(vm.wantedMetrics[i]) === -1) {
											newMetrics.push(vm.wantedMetrics[i]);
										}
									}
									vm.wantedMetrics = newMetrics;
								}
							}
							if (vm.wantedMetrics[0]) {
								dataService.getMetricsDetails({
									wanted_metrics : vm.wantedMetrics[0].metrics.map(function(m) {
										return m.alias;
									})

								}).then(function(response) {
									vm.metrics = response.data.metrics;
								});
								if (newMetrics && newMetrics.length == 1)
									vm.pageTitle = 'Issue ' + newMetrics[0].id + ": " +
											newMetrics[0].title;
							}
						});
		vm.setSearch = function(data) {
			vm.search = data;
		}
		vm.predicate = 'id';
		vm.moveMetricUp = function(index) {
			// TODO: Bug in this method and the next. Sometimes the move fails and the
			// order gets messed up
			if (index === 0 || vm.wantedMetrics[0].metrics[index].updating ||
					vm.wantedMetrics[0].metrics[index - 1].updating)
				return;
			vm.wantedMetrics[0].metrics[index].updating = true;
			vm.wantedMetrics[0].metrics[index - 1].updating = true;
			var temp = vm.wantedMetrics[0].metrics[index - 1];
			vm.wantedMetrics[0].metrics[index - 1] = vm.wantedMetrics[0].metrics[index];
			vm.wantedMetrics[0].metrics[index] = temp;

			dataService
					.switchIssueMetricOrder(vm.wantedMetrics[0].id, index, index - 1)
					.then(
							function(response) {
								delete vm.wantedMetrics[0].metrics[index].updating;
								delete vm.wantedMetrics[0].metrics[index - 1].updating;
							},
							function(error) {
								console.log(error);
								var temp = vm.wantedMetrics[0].metrics[index - 1];
								vm.wantedMetrics[0].metrics[index - 1] = vm.wantedMetrics[0].metrics[index];
								vm.wantedMetrics[0].metrics[index] = temp;
								delete vm.wantedMetrics[0].metrics[index].updating;
								delete vm.wantedMetrics[0].metrics[index - 1].updating;
							});
		}
		vm.moveMetricDown = function(index) {
			// TODO: Bug in this method and the previous. Sometimes the move fails and
			// the order gets messed up
			if (index === vm.wantedMetrics[0].metrics.length - 1 ||
					vm.wantedMetrics[0].metrics[index].updating ||
					vm.wantedMetrics[0].metrics[index + 1].updating)
				return;
			vm.wantedMetrics[0].metrics[index].updating = true;
			vm.wantedMetrics[0].metrics[index + 1].updating = true;
			var temp = vm.wantedMetrics[0].metrics[index + 1];
			vm.wantedMetrics[0].metrics[index + 1] = vm.wantedMetrics[0].metrics[index];
			vm.wantedMetrics[0].metrics[index] = temp;
			dataService
					.switchIssueMetricOrder(vm.wantedMetrics[0].id, index, index + 1)
					.then(
							function(response) {
								delete vm.wantedMetrics[0].metrics[index].updating;
								delete vm.wantedMetrics[0].metrics[index + 1].updating;
							},
							function(error) {
								console.log(error);
								var temp = vm.wantedMetrics[0].metrics[index + 1];
								vm.wantedMetrics[0].metrics[index + 1] = vm.wantedMetrics[0].metrics[index];
								vm.wantedMetrics[0].metrics[index] = temp;
								delete vm.wantedMetrics[0].metrics[index].updating;
								delete vm.wantedMetrics[0].metrics[index + 1].updating;
							});
		}
	}

})();