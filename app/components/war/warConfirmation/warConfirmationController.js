wciApp.controller(
  "warConfirmationModalController",
  (
    $scope,
    $uibModalInstance,
    countryAttacked,
    worldCountryService,
    playerService,
  ) => {

    $scope.myCountryStrength = playerService.military.getTotalStrength();
    $scope.targetCountryStrength = worldCountryService.getCountryStrength(countryAttacked);

    $scope.successProbability = calculateSuccessProbability($scope);

    $scope.declareWar = function () {
      $uibModalInstance.close("ok");
    };
    $scope.cancel = function () {
      $uibModalInstance.dismiss("cancel");
    };

  },
);

let calculateSuccessProbability = function ($scope) {

  let probOfFailure;

  if ($scope.myCountryStrength > 0) probOfFailure = 100 * (($scope.targetCountryStrength - $scope.myCountryStrength / 2) / $scope.myCountryStrength);
  else probOfFailure = 100;

  if (probOfFailure < 0) probOfFailure = 0;
  else if (probOfFailure > 100) probOfFailure = 100;

  return 100 - probOfFailure;
};
