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
				state : 'issues',
				config : {
					url : '/issues/:issue',
					templateUrl : 'app/issues/issues.html',
					controller : 'Issues',
					controllerAs : 'vm',
					title : 'Issues',
					settings : {
						nav : 3,
						content : '<i class="fa fa-dashboard"></i> Issues'
					}
				}
			}
		];
	}
})();