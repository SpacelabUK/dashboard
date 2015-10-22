(function () {
    'use strict';

    angular.module('app', [
        /*
         * Everybody has access to these. We could place these under every feature
         * area, but this is easier to maintain.
         */
        'app.core',
        // 'app.widgets',
        'app.diagrams',
        /*
         * Feature areas
         */
        'app.devices', 'app.projects', 'app.metrics', 'app.issues',
        'app.spatialFunctions', 'app.study','app.observation-setup',

        /*
         * Standalone tools
         */
        'app.tools.netIntegration'
        // 'app.layout'
    ]);

})();

/*
 * Some basic String functions used throughout
 */
function eql(str1, str2) {
    return str1.trim().toLowerCase() === str2.toLowerCase();
}
function startsWith(str, prefix) {
    return str.indexOf(prefix) === 0;
}
function endsWith(str, suffix) {
    return str.match(suffix + "$") == suffix;
}
function startsWithIgnoreCase(str, prefix) {
    return str.toUpperCase().indexOf(prefix.toUpperCase()) === 0;
}
function endsWithIgnoreCase(str, suffix) {
    return str.toUpperCase().match(suffix.toUpperCase() + "$") == suffix
            .toUpperCase();
}
angular.module('app').controller('MasterCtrl', [
    '$scope', '$cookieStore', function ($scope, $cookieStore) {
        "use strict";

        /**
         * Sidebar Toggle & Cookie Control
         *
         */
        var mobileView = 992;

        $scope.getWidth = function () {
            return window.innerWidth;
        };

        $scope.$watch($scope.getWidth, function (newValue, oldValue) {
            if (newValue >= mobileView) {
                if (angular.isDefined($cookieStore.get('toggle'))) {
                    if ($cookieStore.get('toggle') === false) {
                        $scope.toggle = false;
                    } else {
                        $scope.toggle = true;
                    }
                } else {
                    $scope.toggle = true;
                }
            } else {
                $scope.toggle = false;
            }

        });

        $scope.toggleSidebar = function () {
            $scope.toggle = !$scope.toggle;

            $cookieStore.put('toggle', $scope.toggle);
        };

        window.onresize = function () {
            $scope.$apply();
        };
    }
]);
