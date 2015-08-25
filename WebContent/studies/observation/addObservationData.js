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
			console.log('observid ' + observation.id);
			var uploader = $scope.uploader = new FileUploader({
				// url : 'studies/observation/uploadObservationData.php',
				url : HTTPFactory.getBackend() + 'StoreObservationData',
				formData : [
					{
						studyid : study.id,
						observationid : observation.id
					}
				],
			});

			// FILTERS

			uploader.filters.push({
				name : 'customFilter',
				fn : function(item /* {File|FileLikeObject} */, options) {
					return this.queue.length < 10;
				}
			});

			$scope.attach = function() {
				ModalFactory.openWaitModal('Getting Validation data...');
				uploader.uploadAll();
			}
			uploader.onCompleteItem = function(fileItem, response, status, headers) {
				// console.info('onCompleteItem', fileItem, response, status, headers);
				ModalFactory.closeWaitModal();
				if (status === 400) {
					ModalFactory.openErrorModal(response);
					return;
				}
				console.info(response);
				MatcherFactory.openMatcherModal("space", "spaces", response.spaces,
						response.spacesInDB).result.then(function(dialogResponse) {
					console.log(dialogResponse);
					ModalFactory.openWaitModal('Storing data...');
					HTTPFactory.backendPost("StoreObservationData", {
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
					console.log(error);
				});

			};
			// uploader.onCompleteAll = function() {
			// console.info('onCompleteAll');
			// };
			$scope.cancel = function() {
				$modalInstance.dismiss('cancel');
			};
		}
]);