"use strict";
// eslint-disable-next-line
wciApp.factory("buildingsService", function (
  playerService,
  bonusesService,
  gameDataService, // GameDataService stores object of objects with base values(constants), so we use them inside methods to calculate actual values based on count/research/bonuses etc.
) {

  class Structure {
    constructor (structure) {
      Object.assign(this, structure);// Copy object we pass to "this" so we don't have to type out this.name = name; etc.
      this.ID = structure.name;
    }

    getUpkeep () {
      const upkeepBonus = bonusesService.researchBonuses.buildUpkeepMultiplier || 1;

      return this.upkeep * upkeepBonus;
    }

    build (count) {
      const cost = this.cost * count;
      const landCost = this.getLandCost() * count;

      if (playerService.baseStats.money >= cost && this.isUnlocked &&
          playerService.baseStats.land >= landCost) {
        playerService.baseStats[this.statAffected] *= Math.pow(this.statMultiplier * this.countMultiplier, count);
        playerService.baseStats[this.statAffected] += this.statAdder * count;
        playerService.baseStats.totalJobs += this.jobsIncreased * count;
        playerService.baseStats.money -= cost;
        playerService.baseStats.land -= landCost;
        this.count = Number(this.count) + count; //* 1 to force math add and not string add.
      }
    }

    getLandCost () {
      // TODO: Also update currently built structures landCost. This might be a bit tricky tho...
      const bonusCost = bonusesService.researchBonuses.landCostAdder || 0;
      const cost = this.landCost - bonusCost;

      if (cost <= 1)
        return 1;

      return cost;
    }

    isVisible () {
      return this.isUnlocked;
    }

    // TODO: Consider actually using a private variable to store structureData instead of calling a function everywhere.
    // TODO: Private, so it's not stored/shared outside of this scope, so we dont accidentally save this data to the player.
    // TODO: This will keep save files small and we can go even further and make them even smaller by saving only necessary info.

    // TODO: Might seem pointless at first, but it helps keep things organized and allows to add formulas and include bonuses before returning those values.
    getMultiplier () {
      return this.statMultiplier;
    }

    getCountMultiplier () {
      return this.countMultiplier;
    }

    getStatMultiplier () {
      return this.statMultiplier;
    }

    getStatAdder () {
      return this.statAdder;
    }

    getJobsIncreased () {
      return this.jobsIncreased;
    }

    getCost () {
      return this.cost;
    }

    getCount () {
      return this.count;
    }

    cantAfford (count) {
      if (playerService.baseStats.money >= this.cost * count && playerService.baseStats.land >= this.getLandCost() * count)
        return false;

      return true;
    }
  }

  // TODO: The reason we don't assign this data to the object is to prevent from saving it, we might use a private variable inside this service tho...
  // TODO: This service will be created for each country, so maybe it's good to use this method, so we dont copy this data for each country...

  // TODO: Create get/set methods for all properties that might change, such as this.getCost, so we don't repeat same code everywhere, accessing gameDataService.Buildings[index] everytime
  // store all buildings by type/tab
  class Buildings {
    constructor () {
      this.countToBuy = 1;
      this.structures = [];
    }

    init () {
      const buildingsArray = gameDataService.Buildings;

      this.structures = [];
      for (let j = 0; j < buildingsArray.length; j++) {
        const structureObj = {};

        structureObj.count = buildingsArray[j].count || 0;
        structureObj.isUnlocked = buildingsArray[j].isUnlocked || false;
        structureObj.ID = buildingsArray[j].name;
        structureObj.name = buildingsArray[j].name;
        structureObj.upkeep = buildingsArray[j].upkeep;
        structureObj.cost = buildingsArray[j].cost;
        structureObj.statAffected = buildingsArray[j].statAffected;
        structureObj.statMultiplier = buildingsArray[j].statMultiplier;
        structureObj.statAdder = buildingsArray[j].statAdder;
        structureObj.countMultiplier = buildingsArray[j].countMultiplier;
        structureObj.jobsIncreased = buildingsArray[j].jobsIncreased;
        structureObj.image = buildingsArray[j].image;
        structureObj.landCost = buildingsArray[j].landCost;
        this.structures.push(new Structure(structureObj));// We create a new object, and we pass some basic values which we need to save/load.
      }
    }

    unlockBuilding (buildingsToUnlock) {
      for (const value of buildingsToUnlock) {
        for (const building of this.structures.values()) {
          if (value === building.name) {
            building.isUnlocked = true;
            break;
          }
        }
      }
    }

    getTotalUpkeep () {
      let upkeep = 0;

      // TODO: Might want to return 0 if structureCount is 0, so we avoid unnecessary calculations
      for (let i = 0; i < this.structures.length; i++)
        upkeep += this.structures[i].getUpkeep() * this.structures[i].count;

      playerService.baseStats.upkeep = upkeep;

      return upkeep;
    }

    getTotalMultiplier () {
      let multiplier = 0;

      for (let i = 0; i < this.structures.length; i++) {
        const structureMultiplier = this.structures[i].getMultiplier();

        multiplier += (structureMultiplier - 1) * this.structures[i].count;
      }

      // TODO: Formatting a number should be done in html using filters...
      return `${Math.floor(multiplier * 100)}%`;
    }
  }

  return Buildings;
});
