"use strict";

wciApp.controller("WarController", (
    $interval,
    playerService,
    worldCountryService,
    warService,
    $scope,
) => {
    $scope.playerCountriesAtWar = playerService.countriesAtWar;
    $scope.military = playerService.military;
    $scope.unitsToSend = {
        land : 0,
        air  : 0,
        naval: 0,
    };
    $scope.battlefields = warService.battlefields;
    $scope.sendUnitsToBattle = function (countryCode) {
        warService.sendUnits($scope.unitsToSend, countryCode, playerService);
        $scope.unitsToSend = {
            land: 0,
            air: 0,
            naval: 0,
        }
    };
    $scope.proposePeace = function (countryCode) {
        // Can be improved by adding some ai decision etc, for now it will just make peace.
        warService.makePeace(countryCode, playerService);
    };
    $scope.declareWarAgainstAi = function (countryCode) {
        // If no more functionality is needed here, we can avoid using this function and call warService directly from html
        // Tho If we want to use some html/css animations, radio buttons then we need this function...
        warService.declareWar(countryCode);
    };
    $scope.returnUnitsFromBattlefield = function (countryCode, battlefieldIndex) {
        warService.returnUnits(countryCode, battlefieldIndex);
    };
});
