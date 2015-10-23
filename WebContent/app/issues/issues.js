(function () {
    "use strict";
    angular.module('app.issues').controller('Issues', issuesController);
    issuesController.$inject = [
        '$stateParams', '$modal', 'dataService', 'modalFactory', 'HTTPFactory'
    ];

    function issuesController($stateParams, $modal, dataService, modalFactory, HTTPFactory) {
        var vm = this;
        vm.issue = $stateParams.issue;
        vm.pageTitle = 'Issues';
        vm.issueNames = [];

        HTTPFactory.propulsionGet('/metric/groups').then(function (response) {
            vm.issueNames = response.data;
        });

        vm.wantedMetrics = [];

        if (vm.issue && vm.issue !== 'all') {
            vm.selectedIssue= true;
            HTTPFactory.propulsionGet('/metric/groups/'+vm.issue).then(function (response) {
                vm.issueData = response.data;
                HTTPFactory.propulsionGet('/metric/groups/' + vm.issue +'/metrics').then(function (response) {
                    vm.wantedMetrics = response.data;
                });
            });
        }

        vm.metrics = [];
        vm.removeMetric = function (issue, metric, issue_metric) {
            modalFactory.openConfirmModal(
                "Are you sure you want to remove metric \"" + metric.title +
                "\" from issue " + issue.id + "?", "Remove", "Cancel").result
                .then(function (ok) {
                    dataService.removeMetricFromIssue(issue.id, issue_metric.id).then(
                        function (response) {
                            vm.wantedMetrics[0].metrics.splice(
                                vm.wantedMetrics[0].metrics.indexOf(issue_metric), 1);
                        }, function (error) {
                            console.log(error);
                        });
                });
        };
        vm.addMetricToIssue = function (issue, okText) {
            var modalInstance = $modal.open({
                templateUrl: 'app/issues/select-metric.modal.html',
                controller: 'SelectMetricModal',
                controllerAs: 'vm',
                resolve: {
                    exceptMetrics: function () {
                        return issue.metrics.map(function (m) {
                            return m.id
                        })
                    },
                    issueID: function () {
                        return issue.id
                    },
                    okText: function () {
                        return okText
                    }
                }
            });
            modalInstance.result.then(function (modalResponse) {
                if (modalResponse) {
                    dataService.addMetricToIssue(modalResponse.issueID,
                        modalResponse.metricID).then(function (response) {
                            vm.wantedMetrics[0].metrics.push(response.data);
                            vm.metrics[response.data.alias] = response.data;
                        }, function (error) {
                            console.log(error);
                        });
                }
            });
        };

        vm.setSearch = function (data) {
            vm.search = data;
        };
        vm.predicate = 'id';
        vm.moveMetricUp = function (index) {
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
                function (response) {
                    delete vm.wantedMetrics[0].metrics[index].updating;
                    delete vm.wantedMetrics[0].metrics[index - 1].updating;
                },
                function (error) {
                    console.log(error);
                    var temp = vm.wantedMetrics[0].metrics[index - 1];
                    vm.wantedMetrics[0].metrics[index - 1] = vm.wantedMetrics[0].metrics[index];
                    vm.wantedMetrics[0].metrics[index] = temp;
                    delete vm.wantedMetrics[0].metrics[index].updating;
                    delete vm.wantedMetrics[0].metrics[index - 1].updating;
                });
        };
        vm.moveMetricDown = function (index) {
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
                function (response) {
                    delete vm.wantedMetrics[0].metrics[index].updating;
                    delete vm.wantedMetrics[0].metrics[index + 1].updating;
                },
                function (error) {
                    console.log(error);
                    var temp = vm.wantedMetrics[0].metrics[index + 1];
                    vm.wantedMetrics[0].metrics[index + 1] = vm.wantedMetrics[0].metrics[index];
                    vm.wantedMetrics[0].metrics[index] = temp;
                    delete vm.wantedMetrics[0].metrics[index].updating;
                    delete vm.wantedMetrics[0].metrics[index + 1].updating;
                });
        };
    }

})();