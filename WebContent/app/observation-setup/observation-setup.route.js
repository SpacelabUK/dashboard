(function () {
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
                state: 'observation-setup',
                config: {
                    url: '/observation/setup/:study_id',
                    templateUrl: 'app/observation-setup/observation-setup.html',
                    controller: 'ObservationSetupController',
                    controllerAs: 'observationSetup',
                    title: 'Observation Setup',
                    settings: {
                        nav: 2,
                        content: '<i class="fa fa-dashboard"></i> Study'
                    }
                }
            }
        ];
    }
})();