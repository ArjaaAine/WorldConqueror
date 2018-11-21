wciApp.controller(
  "ResearchController",
  ($scope, playerService, gameDataService) => {
    $scope.research = playerService.research;
    $scope.gameData = gameDataService;
  },
);
