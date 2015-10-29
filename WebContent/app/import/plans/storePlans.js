(function () {
    "use strict";
    angular.module('app.core').controller('storePlans', storePlansController);
    storePlansController.$inject = ['$scope', '$modalInstance', 'HTTPFactory', 'modalFactory', 'FileUploader', 'study'];

    function storePlansController($scope, $modalInstance, HTTPFactory, modalFactory, FileUploader, study) {
        $scope.title = "Store Plans";

        var uploader = $scope.uploader = new FileUploader();

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.attach = function () {
            modalFactory.openWaitModal('Storing File...');
            console.log(uploader.queue[0]._file.name);
            var fd = new FormData();
            fd.append('file', uploader.queue[0]._file.name);
            console.log(fd);
            HTTPFactory.propulsionUpload('/studies/' + study.id + '/plan/upload', fd).then(
                function (response) {
                    modalFactory.modifyWaitMessage("Success!");
                    setTimeout(function () {
                        modalFactory.closeWaitModal();
                        $modalInstance.close();
                    }, 2000);
                }, function (error) {
                    modalFactory.closeWaitModal();
                    modalFactory.openErrorModal(error.data);
                });
        }
    }
})
();
