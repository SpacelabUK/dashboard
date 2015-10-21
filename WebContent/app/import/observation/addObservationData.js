angular.module('app.core').controller(
		"addObservationDataInstance",
		[
				'$scope',
				'$modalInstance',
				'FileUploader',
				'study',
				'MatcherFactory',
				'HTTPFactory',
				'modalFactory',
				function($scope, $modalInstance, FileUploader, study, MatcherFactory,
						HTTPFactory, modalFactory) {
					"use strict";
					var uploader = $scope.uploader = new FileUploader({
						url : HTTPFactory.getBackend() + 'GetObservationComparableData',
						formData : [
							{
								studyid : study.id
							}
						],
					});
					$scope.attach = function() {
						modalFactory.openWaitModal('Getting Validation data...');
						uploader.uploadAll();
					};
					uploader.onCompleteItem = function(fileItem, response, status,
							headers) {
						modalFactory.closeWaitModal();
						if (status >= 400) {
							modalFactory.openErrorModal(response);
							return;
						}
						MatcherFactory.openMatcherModal("space", "spaces", response.spaces,
								response.spacesInDB).result.then(function(dialogResponse) {
							console.log(dialogResponse);
							modalFactory.openWaitModal('Storing data...');
							HTTPFactory.backendPost("StoreObservationData", {
								studyid : study.id,
								fileid : response.fileid,
								spaces : dialogResponse
							}).then(function(response) {
								modalFactory.modifyWaitMessage("Success!");
								setTimeout(function() {
									modalFactory.closeWaitModal();
									$modalInstance.close();
								}, 2000);
							}, function(error) {
								modalFactory.closeWaitModal();
								modalFactory.openErrorModal(response);
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