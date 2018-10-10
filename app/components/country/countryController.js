wciApp.controller('CountryController', function (
    $interval,
    playerService,
    $scope
) {
    $scope.myCountry = playerService;
    $scope.laws = playerService.laws;
});