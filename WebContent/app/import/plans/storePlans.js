(function () {
    "use strict";
    angular.module('app.core').controller('storePlans', storePlansController);
    storePlansController.$inject = ['$scope', '$modalInstance', 'HTTPFactory', 'modalFactory', 'FileUploader', 'study'];

    function storePlansController($scope, $modalInstance, HTTPFactory, modalFactory, FileUploader, study) {
        $scope.title = "Store Plans";

        var uploader = $scope.uploader = new FileUploader({
            url: '/propulsion/studies/' + study.id + '/plan/upload'
        });

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }
})
();
