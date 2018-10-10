wciApp.controller('CountryController', function (
    $interval,
    $scope,
    playerService
) {
    $scope.myCountry = playerService;
    $scope.laws = playerService.laws;
    $scope.ministers = playerService.ministers;
});