app.controller("addObservationDataInstance", [
		'$scope',
		'$modalInstance',
		'FileUploader',
		'study',
		'observation',
		'MatcherFactory',
		'HTTPFactory',
		'ModalFactory',
		function($scope, $modalInstance, FileUploader, study, observation,
				MatcherFactory, HTTPFactory, ModalFactory) {
			"use strict";
			var uploader = $scope.uploader = new FileUploader({
				url : HTTPFactory.getBackend() + 'GetObservationComparableData',
				formData : [
					{
						studyid : study.id,
						observationid : observation.id
					}
				],
			});
			$scope.attach = function() {
				ModalFactory.openWaitModal('Getting Validation data...');
				uploader.uploadAll();
			};
			uploader.onCompleteItem = function(fileItem, response, status, headers) {
				ModalFactory.closeWaitModal();
				if (status >= 400) {
					ModalFactory.openErrorModal(response);
					return;
				}
				MatcherFactory.openMatcherModal("space", "spaces", response.spaces,
						response.spacesInDB).result.then(function(dialogResponse) {
					console.log(dialogResponse);
					ModalFactory.openWaitModal('Storing data...');
					HTTPFactory.backendPost("StoreObservationData", {
						studyid : study.id,
						observationid : observation.id,
						fileid : response.fileid,
						spaces : dialogResponse
					}).then(function(response) {
						ModalFactory.modifyWaitMessage("Success!");
						setTimeout(function() {
							ModalFactory.closeWaitModal();
							$modalInstance.close();
						}, 2000);
					}, function(error) {
						ModalFactory.closeWaitModal();
						ModalFactory.openErrorModal(response);
					});
				}, function(error) {
					// cancelled modal
				});

			};
			$scope.cancel = function() {
				$modalInstance.dismiss('cancel');
			};
		}
]);