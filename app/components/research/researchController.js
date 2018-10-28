wciApp.controller(
    'ResearchController',
    function ($scope, playerService) {
        $scope.research = playerService.research;
});