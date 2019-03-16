"use strict";

wciApp.factory(
  "debugService",
  (playerService, gameDataService) => {
    class Debug {
      addEachBuilding (val) {
        const value = val || 10;

        playerService.buildings.structures.forEach((structure) => {
          structure.build(value);
        });
      }

      addLand (val) {
        const value = val || 100;

        playerService.baseStats.land += value;
      }

      addInfluence (val) {
        const value = val || 100000;

        playerService.baseStats.influence += value;
      }

      addResearchPoints (val) {
        const value = val || 1000;

        playerService.baseStats.baseResearchPoints = value;
        playerService.research.update();
        playerService.baseStats.baseResearchPoints = 0;
      }

      unlockAllResearch () {
        for (const name of playerService.research.researchType.values()) {
          for (const index of gameDataService[`${name}Research`].keys()) {
            playerService.research.unlockResearch(gameDataService[`${name}Research`], index, true);
          }
        }
      }

      stabilityChange (val) {
        playerService.baseStats.stability += val;
      }

      stabilityIndexChange (val) {
        playerService.baseStats.currentStabilityIndex += val;
      }

      addUnits (val) {
        const value = val || 100;
        for(let unitType of Object.keys(playerService.military.unitsAtHome)) {
          playerService.military.unitsAtHome[unitType] += value;
        }
      }

      addPopulation (val) {
        const value = val || 100;

        playerService.baseStats.population += value;
      }

      giveMeAll () {
        playerService.baseStats.money += 100000000;
        if (playerService.baseStats.money > 100000000) playerService.baseStats.money = 100000000;
        playerService.research.sciencePoints += 1000000;
        this.addLand(10000000);
        this.addEachBuilding(100);
        this.addResearchPoints(10000);
        this.addUnits(1000);
        this.addPopulation(10000000);
        this.unlockAllResearch();
      }

      simulateTurn () {
        this.addEachBuilding(5);
      }
    }

    return new Debug();
  },
);
