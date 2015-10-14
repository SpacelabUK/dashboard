(function() {
	'use strict';

	angular.module('app.issues').run(appRun);
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
				state : 'tools/netIntegration',
				config : {
					url : '/tools/netIntegration',
					templateUrl : 'app/tools/netIntegration/netIntegration.html',
					controller : 'NetIntegration',
					controllerAs : 'vm',
					title : 'NetIntegration',
					settings : {
						nav : 3,
						content : '<i class="fa fa-dashboard"></i> NetIntegration'
					}
				}
			}
		];
	}
})();