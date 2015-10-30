(function () {
    "use strict";
    angular.module('app.devices').controller("AddDeviceModal", AddDeviceModal);
    AddDeviceModal.$inject = [
        '$modalInstance', 'HTTPFactory', 'modalFactory'
    ];
    function AddDeviceModal($modalInstance, HTTPFactory, modalFactory) {
        var vm = this;
        vm.device = {
            name: ''
        };
        vm.add = function () {
            var data = {
                name: vm.device.name
            };
            HTTPFactory.propulsionPost('/devices',data).then(function (response) {
                $modalInstance.close(vm.device);
            }, function (error) {
                modalFactory.openErrorModal(error);
            });
        };
        vm.cancel = function () {
            $modalInstance.dismiss('cancel');
        }
    }
})();