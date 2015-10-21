(function() {
	'use strict';

	angular.module('app.projects').run(appRun);
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
				state : 'study-issues',
				config : {
					url : '/study/issues/:studyid/:issue',
					templateUrl : 'app/study/issues/study-issues.html',
					controller : 'StudyIssuesController',
					controllerAs : 'vm',
					title : 'Study Issues',
					settings : {
						nav : 2,
						content : '<i class="fa fa-dashboard"></i> Study'
					}
				}
			}
		];
	}
})();