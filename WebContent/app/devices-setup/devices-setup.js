(function () {
    "use strict";
    angular.module('app.devices-setup').controller('DevicesSetupController', DevicesSetupController);
    DevicesSetupController.$inject = ['modalFactory', '$stateParams','HTTPFactory', 'FileUploader'];

    function DevicesSetupController(modalFactory, $stateParams, HTTPFactory, FileUploader) {
        var ob = this;

        var study_id = $stateParams['study_id'];

        HTTPFactory.propulsionGet("/devices").then(
            function(response){
                ob.devices = response.data.content
            }, function (error) {
                console.log(error);
            }
        );

        HTTPFactory.propulsionGet("/studies/" + study_id +"/device/plans").then(
            function(response){
                ob.devicePlans = response.data
            }, function (error) {
                console.log(error);
            }
        );

        ob.uploader = new FileUploader(
        );

        ob.uploader.onAfterAddingFile = function(fileItem) {
            fileItem.url ='/propulsion/studies/' + study_id + '/device/' + ob.selectedId + '/plan/upload';
        };

        ob.uploader.onSuccessItem = function(item, response, status, headers) {
            modalFactory.modifyWaitMessage("Generating files for " + ob.selectedId);
            HTTPFactory.propulsionPost('/studies/' + study_id + '/device/' + ob.selectedId + '/package').then(
                function(){
                    HTTPFactory.propulsionGet("/studies/" + study_id +"/device/plans").then(
                        function(response){
                            modalFactory.closeWaitModal();
                            ob.devicePlans = response.data
                        }, function (error) {
                            modalFactory.closeWaitModal();
                            modalFactory.openErrorModal(error);
                        }
                    );
                }, function (error) {
                    modalFactory.closeWaitModal();
                    modalFactory.openErrorModal(error);
                }
            );
        };

        ob.attach = function(){
            modalFactory.openWaitModal('Uploading file.');
            ob.uploader.uploadAll();
        };

        ob.deleteDevicePlan = function(devicePlan) {
            modalFactory.openWaitModal('Deleting Device data for ' + devicePlan.device_name);
            HTTPFactory.propulsionDelete('/studies/' + study_id + '/device/' + devicePlan.device_name + '/package').then(
                function(){
                    modalFactory.modifyWaitMessage("Deleting Device plans.");
                    HTTPFactory.propulsionDelete("/device/plans/" + devicePlan.id).then(
                        function(){
                            HTTPFactory.propulsionGet("/studies/" + study_id +"/device/plans").then(
                                function(response){
                                    modalFactory.closeWaitModal();
                                    ob.devicePlans = response.data
                                }, function (error) {
                                    modalFactory.closeWaitModal();
                                    modalFactory.openErrorModal(error);
                                }
                            );
                        }, function (error) {
                            modalFactory.closeWaitModal();
                            modalFactory.openErrorModal(error);
                        }
                    );
                }, function (error) {
                    modalFactory.closeWaitModal();
                    modalFactory.openErrorModal(error);
                }
            );
        }
    }
})
();