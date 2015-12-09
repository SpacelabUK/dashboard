(function () {
    "use strict";
    angular.module('app.accommodation-teams-setup').controller('AccommodationTeamsSetupController', AccommodationTeamsSetupController);

    AccommodationTeamsSetupController.$inject = ['$stateParams', 'modalFactory', 'FileUploader'];

    function AccommodationTeamsSetupController($stateParams, modalFactory, FileUploader) {
        var ob = this;

        var study_id = $stateParams['study_id'];

        ob.uploader = new FileUploader(
        );

        ob.uploader.onAfterAddingFile = function(fileItem) {
            fileItem.url ='/propulsion/studies/' + study_id + '/accommodation/plan/upload';
        };

        ob.uploader.onCompleteAll = function(){
            modalFactory.modifyWaitMessage("Success!");
            modalFactory.closeWaitModal();
        };

        ob.uploader.onError  = function(response, status, headers){
            modalFactory.modifyWaitMessage("Error");
            console.log(status);
            console.log(response);
            console.log(headers);
        };

        ob.attach = function(){
            modalFactory.openWaitModal('Parsing File.');
            ob.uploader.uploadAll();
        };
    }
})();

