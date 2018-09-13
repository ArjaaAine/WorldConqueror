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
    $scope.reverse = false;
    $scope.propertyName = "";//for sorting
    //Sort countries etc.
    $scope.sortBy = function(propertyName) {
        $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
        $scope.propertyName = propertyName;
    };

    $scope.makePeace = function(item) {
        let index = $scope.getIndexOfItem(item);
        warService.makePeace(index);
    };
    $scope.returnUnits = function(item) {
        let index = $scope.getIndexOfItem(item);
        warService.returnUnits(index);
    };
    $scope.getIndexOfItem = function (item) {
        return warService.countriesAtWar.indexOf(item);
    };

    $scope.openTroopsModal = function (item) {
        let index = $scope.getIndexOfItem(item);
        let modalInstance = modalService.open({
            templateUrl: 'warAttackModal.html',
            controller: 'warSendTroopsController',
            size: 'md',
            resolve: {
                countryAttackedIndex: function() {
                    return index;
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
