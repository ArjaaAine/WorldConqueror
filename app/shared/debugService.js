"use strict";

wciApp.factory(
  "debugService",
  (playerService) => {
    class Debug {
      static addEachBuilding (val) {
        const value = val || 10;

        playerService.buildings.structures.forEach((structure) => {
          structure.build(value);
        });
      }

      static addLand (val) {
        const value = val || 100;

        playerService.baseStats.land += value;
      }

      static addInfluence (val) {
        const value = val || 100000;

        playerService.baseStats.influence += value;
      }

      static addResearchPoints (val) {
        const value = val || 1000;

        playerService.baseStats.baseResearchPoints = value;
        playerService.research.update();
        playerService.baseStats.baseResearchPoints = 0;
      }

      static stabilityChange (val) {
        playerService.baseStats.stability += val;
      }

      static stabilityIndexChange (val) {
        playerService.baseStats.currentStabilityIndex += val;
      }

      static addUnits (val) {
        const value = val || 100;

        playerService.military.unitsAtHome.forEach((unit) => {
          unit.count += value;
        });
      }

      static addPopulation (val) {
        const value = val || 100;

        playerService.baseStats.population += value;
      }

      giveMeAll () {
        playerService.baseStats.money += 100000000;
        if (playerService.baseStats.money > 100000000)
          playerService.baseStats.money = 100000000;
        playerService.research.sciencePoints += 1000000;
        this.addLand(10000000);
        this.addEachBuilding(100);
        this.addResearchPoints(10000);
        this.addUnits(1000);
        this.addPopulation(10000000);
      }

      simulateTurn () {
        this.addEachBuilding(5);
      }
    }

    return new Debug();
  },
);
