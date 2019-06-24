wciApp.controller(
	"advisorsHelpModalController",
	(
		$scope,
		$uibModalInstance,
	) => {

		$scope.ok = function () {
			$uibModalInstance.dismiss("ok");
		};
	},
);
