(function () {
    "use strict";
    angular.module('app.study')
        .controller("SnapshotViewModal", SnapshotViewModal);
    SnapshotViewModal.$inject = [
        '$stateParams', 'dataService', '$modalInstance', 'img', 'entityData'
    ];
    function SnapshotViewModal($stateParams, dataService, $modalInstance, img,
                               entityData) {
        var vm = this;
        vm.imagesource = dataService.getPlanImageURL(img);
        vm.entityData = entityData;

        vm.close = function () {
            $modalInstance.dismiss('close');
        }
    }
})();