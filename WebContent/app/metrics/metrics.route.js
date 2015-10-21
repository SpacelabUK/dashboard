(function() {
	'use strict';

	angular.module('app.metrics').run(appRun);
	appRun.$inject = [
		'routerHelper'
	];

	/* @ngInject */
	function appRun(routerHelper) {
		routerHelper.configureStates(getStates());
	}

	function getStates() {
		return [
			{
				state : 'metrics',
				config : {
					url : '/metrics',
					templateUrl : 'app/metrics/metrics.html',
					controller : 'MetricsController',
					controllerAs : 'vm',
					title : 'Metrics',
					settings : {
						nav : 3,
						content : '<i class="fa fa-dashboard"></i> Metrics'
					}
				}
			}
		];
	}
})();