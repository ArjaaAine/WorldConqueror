wciApp.controller(
	"StructureController",
	(
		buildingsService,
		advisorsService,
		helperModalsService,
		playerService,
		leaderService,
		$scope,
	) => {

		$scope.buildings = buildingsService;
		$scope.player = playerService.baseStats;
		$scope.advisors = advisorsService;
		$scope.helperModals = helperModalsService;

		$scope.cantAfford = function (count, buildingIndex) {
			if (playerService.baseStats.money >= $scope.getCost(buildingIndex) * count && playerService.baseStats.land >= buildingsService.structures[buildingIndex].getLandCost() * count) return false;

			return true;
		};
		$scope.getCost = function (buildingIndex) {
			const leaderCostAdder = leaderService.bonusCalculator("buildingCost", 1);
			return Math.floor(buildingsService.structures[buildingIndex].cost * leaderCostAdder);
		};
		$scope.build = function (count, buildingIndex) {
			const building = buildingsService.structures[buildingIndex];
			const cost = $scope.getCost(buildingIndex) * count;
			const landCost = building.getLandCost() * count;
			const leaderUnitCapMultiplier = leaderService.bonusCalculator("militaryCap", 1);
			let multiplier = 1;

			if (building.statAffected === "unitCap") multiplier = leaderUnitCapMultiplier;
			if (playerService.baseStats.money >= cost && building.isUnlocked &&
                playerService.baseStats.land >= landCost) {
				playerService.baseStats[building.statAffected] *= Math.pow(building.statMultiplier * building.countMultiplier, count);
				playerService.baseStats[building.statAffected] += building.statAdder * count;
				playerService.baseStats[building.statAffected] *= multiplier;// Add unitCap bonus above
				playerService.baseStats.totalJobs += building.getJobsIncreased() * count;
				playerService.baseStats.money -= cost;
				playerService.baseStats.land -= landCost;
				building.count = Number(building.count) + count; //* 1 to force math add and not string add.
			}
		};
	},
);
