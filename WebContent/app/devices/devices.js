(function () {
    angular.module('app.devices').controller('Devices', devicesController);

    devicesController.$inject = ['$modal', 'HTTPFactory'];

    function devicesController($modal, HTTPFactory) {
        "use strict";
        var vm = this;
        vm.devices = [];
        fetchInitialData();
        function fetchInitialData() {
            HTTPFactory.propulsionGet('/devices').then(function (response) {
                vm.devices = response.data.content;
            }, function (error) {
                console.error(error);
            });
        }

        vm.addDevice = function () {
            $modal.open({
                templateUrl: 'app/devices/add-device.modal.html',
                controller: 'AddDeviceModal',
                controllerAs: 'vm'
            }).result.then(function (response) {
                    vm.search = response.name;
                    fetchInitialData();
                }
            );
        };
    }
})();