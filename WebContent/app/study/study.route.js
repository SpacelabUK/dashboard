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
				state : 'study',
				config : {
					url : '/study/:studyid',
					templateUrl : 'app/study/study.html',
					controller : 'ViewStudyController',
					controllerAs : 'vm',
					title : 'Study',
					settings : {
						nav : 2,
						content : '<i class="fa fa-dashboard"></i> Study'
					}
				}
			}
		];
	}
})();