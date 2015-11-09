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

        ob.uploader = new FileUploader(
        );

        ob.uploader.onAfterAddingFile = function(fileItem) {
            fileItem.url ='/propulsion/studies/' + study_id + '/device/' + ob.selectedId + '/plan/upload';
        };

        ob.uploader.onSuccessItem = function(item, response, status, headers) {
            //{studyId}/device/{name}/package
            HTTPFactory.propulsionPost('/studies/' + study_id + '/device/' + ob.selectedId + '/package').then(
                function(response){
                    console.log(response)
                }, function (error) {
                    console.log(error);
                }
            );
        };

        ob.attach = function(){
            ob.uploader.uploadAll();
        };

    }
})
();