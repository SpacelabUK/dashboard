(function () {
    "use strict";
    angular.module('app.devices-setup').controller('DevicesSetupController', DevicesSetupController);
    DevicesSetupController.$inject = ['$scope', '$stateParams','HTTPFactory', 'FileUploader'];

    function DevicesSetupController($scope, $stateParams, HTTPFactory, FileUploader) {
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
            HTTPFactory.propulsionPost('/studies/' + study_id + '/device/' + ob.selectedId + '/package').then(
                function(){
                    HTTPFactory.propulsionGet("/studies/" + study_id +"/device/plans").then(
                        function(response){
                            ob.devicePlans = response.data
                        }, function (error) {
                            console.log(error);
                        }
                    );
                }, function (error) {
                    console.log(error);
                }
            );
        };

        ob.attach = function(){
            ob.uploader.uploadAll();
        };

        ob.deleteDevicePlan = function(devicePlan) {
            HTTPFactory.propulsionDelete('/studies/' + study_id + '/device/' + devicePlan.device_name + '/package').then(
                function(){
                    HTTPFactory.propulsionDelete("/device/plans/" + devicePlan.id).then(
                        function(){
                            HTTPFactory.propulsionGet("/studies/" + study_id +"/device/plans").then(
                                function(response){
                                    ob.devicePlans = response.data
                                }, function (error) {
                                    console.log(error);
                                }
                            );
                        }, function (error) {
                            console.log(error);
                        }
                    );
                }, function (error) {
                    console.log(error);
                }
            );
        }
    }
})
();