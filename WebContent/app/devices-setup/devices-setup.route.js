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
                state: 'devices-setup',
                config: {
                    url: '/devices/setup/:study_id',
                    templateUrl: 'app/devices-setup/devices-setup.html',
                    controller: 'DevicesSetupController',
                    controllerAs: 'devicesSetup',
                    title: 'Devices Setup',
                    settings: {
                        nav: 2,
                        content: '<i class="fa fa-dashboard"></i> Study'
                    }
                }
            }
        ];
    }
})();