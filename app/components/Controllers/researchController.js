wciApp.controller(
	"ResearchController",
	($scope, playerService, gameDataService, researchService, buildingsService, lawsService, $filter) => {
		$scope.research = researchService;
		$scope.gameData = gameDataService;

		$scope.canAffordScientist = function () {
			return playerService.baseStats.money >= researchService.scientistPrice && researchService.scientists + 1 <= researchService.maxScientists;
		};
		$scope.hireScientist = function () {
			// TODO: Add different scientists with skill and level them up(might want to use a service for scientist exp/lvl/bonuses or at least a constructor here)
			if ($scope.canAffordScientist()) {
				researchService.scientists++;
				playerService.baseStats.money -= researchService.scientistPrice;
				researchService.scientistPrice = Math.floor(researchService.scientistPrice * 2.5);
			} else {
				console.log("Can't hire more scientists! No money or max scientists reached");
			}
		};
		$scope.unlockResearch = function (type, index, unlockFree) {
			const research = type[index];
			const price = research.cost;

			if (researchService.sciencePoints >= price || unlockFree) {
				const buildings = buildingsService;
				const laws = lawsService;
				const name = research.name;
				let buildingsToUnlock = research.unlockBuilding;
				let lawToUnlock = research.lawUnlock;
				const bonuses = research.bonus;

				if (!unlockFree) $scope.research.sciencePoints -= price;
				researchService.isUnlocked[name] = true;
				researchService.isVisible[name] = false;

				// Unlock bonuses
				if (bonuses) {
					// Bonuses = $filter("split")(bonuses);
					for (const bonusData of bonuses) researchService._unlockBonus(bonusData);
				}

				// Unlock buildings
				if (buildingsToUnlock) {
					buildingsToUnlock = $filter("split")(buildingsToUnlock);
					buildings.unlockBuilding(buildingsToUnlock);
				}

				// Unlock law
				if (lawToUnlock) {
					lawToUnlock = $filter("split")(lawToUnlock);
					laws.unlockLaw(lawToUnlock);
				}

				researchService._checkUnlockedResearch(type);// Make other research visible if we meet requirements.
			}
		};
	},
);
