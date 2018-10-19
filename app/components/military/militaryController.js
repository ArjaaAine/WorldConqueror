wciApp.controller(
    'MilitaryController',
    function (playerService, $scope) {

        $scope.military = playerService.military;
        $scope.countryData = playerService.baseStats;
    });