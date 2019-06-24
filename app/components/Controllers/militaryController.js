"use strict";

wciApp.controller(
	"MilitaryController",
	(playerService, $scope) => {

		$scope.military = playerService.military;
		$scope.countryData = playerService.baseStats;
	},
);
