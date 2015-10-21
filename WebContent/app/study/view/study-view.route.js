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
				state : 'study-view',
				config : {
					url : '/study/view/:studyid',
					templateUrl : 'app/study/view/study-view.html',
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