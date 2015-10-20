(function() {
	'use strict';

	angular.module('app.spatialFunctions').run(appRun);
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
				state : 'spatialFunctions',
				config : {
					url : '/spatialFunctions',
					templateUrl : 'app/spatial-functions/spatial-functions.html',
					controller : 'SpatialFunctionsController',
					controllerAs : 'vm',
					title : 'Spatial Functions',
					settings : {
						nav : 2,
						content : '<i class="fa fa-dashboard"></i> Spatial Functions'
					}
				}
			}
		];
	}
})();