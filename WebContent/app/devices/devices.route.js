(function() {
	'use strict';

	angular.module('app.devices').run(appRun);
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
				state : 'devices',
				config : {
					url : '/devices',
					templateUrl : 'app/devices/devices.html',
					controller : 'Devices',
					controllerAs : 'vm',
					title : 'Devices',
					settings : {
						nav : 1,
						content : '<i class="fa fa-dashboard"></i> Dashboard'
					}
				}
			}
		];
	}
})();