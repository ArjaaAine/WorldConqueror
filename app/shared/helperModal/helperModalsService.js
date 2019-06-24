"use strict";

wciApp.factory(
	"helperModalsService",
	function ($uibModal) {

		const helperModal = {};

		helperModal.openAdvisorHelp = function () {

			const modalInstance = $uibModal.open({
				templateUrl: "advisorsHelpModal.html",
				controller : "advisorsHelpModalController",
				size       : "md",
			});

			modalInstance.result.then(() => {
			});
		};

		return helperModal;
	},
);
