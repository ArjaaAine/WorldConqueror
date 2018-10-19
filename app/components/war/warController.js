wciApp.controller('WarController', function (
    $interval,
    modalService,
    playerService,
    worldCountryService,
    warService,
    $log,
    $filter,
    $scope) {
    $scope.playerService = playerService;
    $scope.warService = warService;
    $scope.worldCountryService = worldCountryService;

    $scope.makePeace = function(aiPlayerIndex) {
        warService.makePeace(aiPlayerIndex);
    };
    $scope.returnUnits = function(aiPlayerIndex) {
        warService.returnUnits(aiPlayerIndex);
    };

    $scope.openTroopsModal = function (aiPlayerIndex) {
        let modalInstance = modalService.open({
            templateUrl: 'warAttackModal.html',
            controller: 'warSendTroopsController',
            size: 'lg',
            resolve: {
                aiAttackedIndex: function() {
                    return aiPlayerIndex;
                }
            }
        });
        modalInstance.result.then(function() {
            //Sending the troops
            console.log("Sending Troops...");
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

});
