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
            vm.selectedIssue = true;
            HTTPFactory.propulsionGet('/metric/groups/' + vm.issue).then(function (response) {
                vm.issueData = response.data;
                HTTPFactory.propulsionGet('/metric/groups/' + vm.issue + '/metrics').then(function (response) {
                    vm.wantedMetrics = response.data;
                });
            });
        }

        vm.metrics = [];
        vm.removeMetric = function (metric) {
            modalFactory.openConfirmModal(
                "Are you sure you want to remove metric \"" + metric.title +
                "\" from issue " + metric.metric_group_id + "?", "Remove", "Cancel").result
                .then(function (ok) {
                    metric.metric_group_id = null;
                    HTTPFactory.propulsionPut('metrics/' + metric.id, metric).then(
                        function (response) {
                            HTTPFactory.propulsionGet('/metric/groups/' + vm.issue + '/metrics').then(function (response) {
                                vm.wantedMetrics = response.data;
                            }, function (error) {
                                console.log(error);
                            });
                        }, function (error) {
                            console.log(error);
                        }
                    );
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
        vm.moveMetricUp = function (metrics, index) {
            console.log(index);
            var first = metrics[index];
            var swap = metrics[index-1];
            var order = first.metric_group_order;
            first.metric_group_order = swap.metric_group_order;
            swap.metric_group_order = order;
            swap.updating = true;
            first.updating = true;
            HTTPFactory.propulsionPut('/metrics/' + first.id, first).then(
                function (response) {
                    HTTPFactory.propulsionPut('/metrics/' + swap.id, swap).then(
                        function (response) {
                            metrics[index] = swap;
                            metrics[index-1] = first;
                            first.updating = false;
                            swap.updating = false;
                        }, function (error) {
                            console.log(error);
                        }
                    );
                }, function (error) {
                    console.log(error);
                }
            );
        };
        vm.moveMetricDown = function (metrics, index) {
            console.log(index);
            var first = metrics[index];
            var swap = metrics[index+1];
            var order = first.metric_group_order;
            first.metric_group_order = swap.metric_group_order;
            swap.metric_group_order = order;
            swap.updating = true;
            first.updating = true;
            HTTPFactory.propulsionPut('/metrics/' + first.id, first).then(
                function (response) {
                    HTTPFactory.propulsionPut('/metrics/' + swap.id, swap).then(
                        function (response) {
                            metrics[index] = swap;
                            metrics[index+1] = first;
                            first.updating = false;
                            swap.updating = false;
                        }, function (error) {
                            console.log(error);
                        }
                    );
                }, function (error) {
                    console.log(error);
                }
            );
        };
    }

})();