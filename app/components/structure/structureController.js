wciApp.controller(
    'StructureController',
    function (
        buildingsService,
        advisorsService,
        helperModalsService,
        playerService,
        $scope) {

        $scope.buildings = playerService.buildings;
        $scope.countryStats = playerService.baseStats;
        $scope.advisors = advisorsService;
        $scope.helperModals = helperModalsService;
    });