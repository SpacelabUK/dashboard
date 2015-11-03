(function () {
    "use strict";
    angular.module('app.core').controller('triggerObservation', triggerObservationController);
    triggerObservationController.$inject = ['$scope', '$modalInstance', 'study'];

    function triggerObservationController($scope, $modalInstance, study) {

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }
})
();