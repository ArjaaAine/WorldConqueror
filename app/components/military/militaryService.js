"use strict";
// eslint-disable-next-line
wciApp.factory("militaryService", function
(
  playerService,
  gameDataService,
) {

  // TODO: Consider using this object as a "group", and calculate total upkeep in worldCountry(playerService) service.
  // TODO: This way we can make multiple copies of this object, without having to use "this.unitsOnMission" array.
  class Military {
    constructor () {
      this.unitsToHire = 1;// How many units we want to hire at once(with a single button press), needed to update the price on screen.
      this.unitsAtHome = [];
      this.unitsAtWar = [];
      this.unitsHiringQueue = [];
      this.unitsSendModal = [];

      // This array of arrays might contain mixed count of different units...
      // E.x: 100Militia and 10Battle Ships.  Calculate their upkeep.
      this.totalUpkeep = 0;
      this.unitCap = 0;
    }

    init () {
      const unitsArray = gameDataService.Units;

      this.unitsAtHome = [];// Units defending base
      this.unitsAtWar = [];// Units currently in battle
      this.unitsHiringQueue = [];// Units in hiring queue
      this.unitsSendModal = [];// Units chosen by a player before sending to War
      for (let i = 0; i < unitsArray.length; i++) {
        const unitObject = unitsArray[i];

        this.unitsAtHome[i] = {};
        this.unitsAtHome[i].id = unitObject.id;
        this.unitsAtHome[i].count = 0;
        this.unitsAtHome[i].isUnlocked = unitObject.unlocked;// TODO: Currently all of them are unlocked from the start, later need to unlock manually with research etc.
        this.unitsAtHome[i].name = unitObject.name;
      }
    }

    unlockUnits (units) {
      for (const name of units) {
        for (const unit of this.unitsAtHome) {
          if (unit.name === name) {
            unit.isUnlocked = true;
            break;
          }
        }
      }
    }

    cancelQueue (queueIndex) {
      // TODO: Prompt user when canceling a unitsHiringQueue
      // TODO: Tell the player about the possible lose of money, change formula to give less money, the longer player waits.
      // Cancel unitsHiringQueue gives back ~50% money or so
      const count = this.unitsHiringQueue[queueIndex].count;
      const unitIndex = this.unitsHiringQueue[queueIndex].id;
      const unitData = gameDataService.Units[unitIndex];
      const cost = unitData.cost;// TODO: Use methods to calculate the cost, possible way to cheat by hiring/canceling units after unit cost changes due to some bonuses
      const popCost = unitData.popCost;
      const unitCapCost = unitData.unitCapCost;

      playerService.baseStats.money += count * cost / 2;
      playerService.baseStats.population += count * popCost;// Give back population
      playerService.baseStats.unitCap += count * unitCapCost;// Give back unit cap...
      // remove units from unitsHiringQueue
      this.unitsHiringQueue.splice(queueIndex, 1);
    }

    // Adding units to unitsHiringQueue when buying, it might take 1 or more turns
    buyQueue (unitIndex) {
      const count = this.unitsToHire;

      // TODO: Consider merging same unit unitsHiringQueue if done on same turn.
      // TODO: For example, militia 10x, instead of storing 10x objects, we can combine them into 1...
      // TODO: Since time for training them will be the same(because they are unitsHiringQueued on same turn)
      // TODO: Can be easily done by checking last element in the array and comparing it's timer with current unit timer.
      const unitData = gameDataService.Units[unitIndex];
      const cost = unitData.cost;
      const unitCapCost = unitData.unitCapCost;
      const popCost = unitData.popCost;
      const trainingSpeed = unitData.trainingSpeed;
      const unitId = unitData.id;
      const name = unitData.name;

      if (playerService.baseStats.money >= count * cost &&
          playerService.baseStats.unitCap >= count * unitCapCost &&
          playerService.baseStats.population >= count * popCost) {
        // Pay for hiring...
        playerService.baseStats.unitCap -= count * unitCapCost;
        playerService.baseStats.money -= count * cost;
        playerService.baseStats.population -= count * popCost;

        // TODO: Training speed might be reduced here...

        // This will check if we are already training that unit, later on we might need to filter to match training speed with current time
        // In case we reduce training speed while previous unit was in queue, so we can combine them...

        // This stacks up units queue if their training time is the same(it does not take into account reduced time of training if you make a research during the training of the unit...)

        const unitToHire = {
          count,
          time: trainingSpeed,
          id  : unitId,
          name,
          trainingSpeed,
        };

        // Array.find = finds an element and stops iterating
        // Array.findIndex = finds an index and stops iterating
        // Array.filter = filter WHOLE array
        const existingUnitIndex = this.unitsHiringQueue.findIndex(unit => unit.time === trainingSpeed && unit.id === unitId);

        // If we found an element
        if (existingUnitIndex >= 0)
          this.unitsHiringQueue[existingUnitIndex].count += count;
        else
          this.unitsHiringQueue.push(unitToHire);

      }

      // TODO: Not very efficient to sort array every time we hire units, need fix
      this.unitsHiringQueue.sort((a, b) => a.time - b.time);
    }

    // Call every game turn
    updateQueue () {
      for (let i = this.unitsHiringQueue.length - 1; i >= 0; i--) {
        const unitQueue = this.unitsHiringQueue[i];

        unitQueue.time--;// Reduce value by 1(1 turn)
        // TODO: add more logic which takes research and other bonuses that improve speed.
        if (unitQueue.time <= 0) {
          const id = unitQueue.id;

          // Add units to our military.
          this.unitsAtHome[id].count += unitQueue.count;

          // Remove from unitsHiringQueue
          this.unitsHiringQueue.splice(i, 1);
        }
      }
    }

    getStrength (unitIndex) {
      const attack = gameDataService.Units[unitIndex].attack;
      const defense = gameDataService.Units[unitIndex].defense;

      return this.unitsAtHome[unitIndex].count * (attack + defense);
    }

    getTotalStrength () {
      let totalStrength = 0;
      const self = this;

      this.unitsAtHome.forEach((unit) => {
        totalStrength += self.getStrength(unit.id) * unit.count || 0;
      });

      return totalStrength;
    }

    getUpkeep (unitId) {
      return gameDataService.Units[unitId].upkeep;
    }

    getTotalUpkeep () {
      let total = 0;
      const self = this;

      this.unitsAtHome.forEach((unit) => {
        total += self.getUpkeep(unit.id) * unit.count;
      });

      // TODO: Might reduce upkeep with research/buildings...
      this.totalUpkeep = total;

      return total;
    }

    getCost (unitId) {
      return gameDataService.Units[unitId].cost;
    }

    // TODO: Probably need to create another array of arrays which will store currently sent units "unit group", so we can calculate their cost
    // TODO: Sending units to fight should increase their upkeep :]

    getAttack (unitId) {
      return gameDataService.Units[unitId].attack;
    }

    getTotalUnitAttack (unitId, count) {
      return this.getAttack(unitId) * count;
    }

    getAllUnitsTotalAttack (isAtHome, countryAtWarIndex) {
      let totalAttack = 0;

      if (isAtHome) {
        for (let i = 0; i < this.unitsAtHome.length; i++)
          totalAttack += this.getTotalUnitAttack(i, this.unitsAtHome[i].count);

      } else {
        // Units at war
        for (let i = 0; i < this.unitsAtWar[countryAtWarIndex].length; i++)
          totalAttack += this.getTotalUnitAttack(i, this.unitsAtWar[countryAtWarIndex][i].count);

      }

      return totalAttack;
    }

    getDefense (unitId) {
      return gameDataService.Units[unitId].defense;
    }

    getTotalUnitDefense (unitId, count) {
      return this.getDefense(unitId) * count;
    }

    getAllUnitsTotalDefense (isAtHome, countryAtWarIndex) {
      let totalDefense = 0;

      if (isAtHome) {
        for (let i = 0; i < this.unitsAtHome.length; i++)
          totalDefense += this.getTotalUnitDefense(i, this.unitsAtHome[i].count);

      } else {
        // Units at war
        for (let i = 0; i < this.unitsAtWar[countryAtWarIndex].length; i++)
          totalDefense += this.getTotalUnitDefense(i, this.unitsAtWar[countryAtWarIndex][i].count);

      }

      return totalDefense;
    }

    getSiege (unitId) {
      return gameDataService.Units[unitId].siege;
    }

    getPopulationCost (unitId) {
      return gameDataService.Units[unitId].popCost;
    }

    getTrainingSpeed (unitId) {
      return gameDataService.Units[unitId].trainingSpeed;
    }
  }

  return Military;
});
