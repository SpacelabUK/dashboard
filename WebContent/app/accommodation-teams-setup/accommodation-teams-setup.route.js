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
                state: 'accommodation-teams-setup',
                config: {
                    url: '/accommodation-teams/setup/:study_id',
                    templateUrl: 'app/accommodation-teams-setup/accommodation-teams-setup.html',
                    controller: 'AccommodationTeamsSetupController',
                    controllerAs: 'accommodationTeamsSetup',
                    title: 'Accommodation and Teams Setup',
                    settings: {
                        nav: 2,
                        content: '<i class="fa fa-dashboard"></i> Study'
                    }
                }
            }
        ];
    }
})();
