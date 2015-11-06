(function () {
    "use strict";
    angular.module('app.core').controller('storePlans', storePlansController);
    storePlansController.$inject = ['$scope', '$modalInstance', 'FileUploader', 'study'];

    function storePlansController($scope, $modalInstance, FileUploader, study) {
        $scope.title = "Store Plans";

        $scope.uploader = new FileUploader({
            url: '/propulsion/studies/' + study.id + '/device/plan/upload'
        });

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }
})
();
