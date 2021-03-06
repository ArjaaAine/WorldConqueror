"use strict";

wciApp.factory("researchService", (gameDataService, bonusesService, playerService, $filter) => {
  class Research {
    constructor () {
      this.scientists = 1;// Total scientists we have unlocked/bought
      this.maxScientists = 5;// Max scientists we can hire, scientist can't go higher than maxScientists.
      this.scientistPrice = 100;
      this.baseScienceGain = 1;// This is how much science points is gained per turn for each research type
      this.sciencePoints = 0;// Store leftover science points after research is finished.(like in civ)
      this.researchType = [];// Array to store various research types such as War/Economy
      this.isUnlocked = {};// Object key == research name/id, each store a boolean which we save only.
      this.researchBonuses = [];
      this.totalBonus = {};
      this.isVisible = {};
    }

    init () {
      const researchBonuses = gameDataService.ResearchBonuses;

      for (const { type } of gameDataService.ResearchData) {
        const researchType = gameDataService[`${type}Research`];

        this.researchType.push(type);
        this.initBonusProps(researchType, researchBonuses);
        this.checkUnlockedResearch(researchType);
      }
      console.log(this);
    }

    initBonusProps (type, researchBonuses) {
      const arr = type;
      const len = arr.length;

      for (let i = 0; i < len; ++i) {
        const value = arr[i];
        const name = value.name;
        let bonus = value.bonus;

        if (!bonus) continue;

        bonus = $filter("split")(bonus);
        for (let j = 0; j < bonus.length; j++) {
          const bonusValue = bonus[j];
          const bonusData = researchBonuses.filter(this._bonusFilter, bonusValue)[0];

          if (bonusData) {
            this.researchBonuses[bonusValue] = {};
            this.researchBonuses[bonusValue] = bonusData;
          } else {
            console.log("Bonus not working! Probably does not exist in the excel file: %s", name);
          }
        }
        if (value.isUnlocked) this.unlockResearch(type, i, true);
      }
      console.log(this.researchBonuses);
    }

    _bonusFilter (bonus) {
      return this === bonus.ID;
    }

    canAffordScientist () {
      return playerService.baseStats.money >= this.scientistPrice && this.scientists + 1 <= this.maxScientists;
    }

    hireScientist () {
      console.log(this);

      // TODO: Add different scientists with skill and level them up(might want to use a service for scientist exp/lvl/bonuses or at least a constructor here)
      if (this.canAffordScientist()) {
        this.scientists++;
        playerService.baseStats.money -= this.scientistPrice;
        this.scientistPrice = Math.floor(this.scientistPrice * 2.5);
      } else {
        console.log("Can't hire more scientists! No money or max scientists reached");
      }
    }

    unlockResearch (type, index, unlockFree) {
      const research = type[index];
      const price = research.cost;

      if (this.sciencePoints >= price || unlockFree) {
        const military = playerService.military;
        const buildings = playerService.buildings;
        const laws = playerService.laws;
        const name = research.name;
        let buildingsToUnlock = research.unlockBuilding;
        let unitToUnlock = research.unlockUnit;
        let lawToUnlock = research.lawUnlock;
        let bonuses = research.bonus;

        if (!unlockFree) this.sciencePoints -= price;
        this.isUnlocked[name] = true;
        this.isVisible[name] = false;

        // Unlock bonuses
        if (bonuses) {
          bonuses = $filter("split")(bonuses);
          for (const bonusData of bonuses) this.unlockBonus(bonusData);
        }

        // Unlock units
        if (unitToUnlock) {
          unitToUnlock = $filter("split")(unitToUnlock);
          military.unlockUnits(unitToUnlock);
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

        this.checkUnlockedResearch(type);// Make other research visible if we meet requirements.
      }
    }

    unlockBonus (bonusData) {
      const researchBonuses = this.researchBonuses;
      if (!researchBonuses[bonusData]) {
        console.log(`BONUS DOES NOT EXIST! ${bonusData}`);

        return;
      }
      const statAffected = researchBonuses[bonusData].statAffected;
      if (!this.totalBonus[statAffected]) {
        this.totalBonus[statAffected] = {};
        this.totalBonus[statAffected].statAdder = 0;
        this.totalBonus[statAffected].statMultiplier = 1;
      }

      this.totalBonus[statAffected].statAdder += researchBonuses[bonusData].statAdder;
      this.totalBonus[statAffected].statMultiplier *= researchBonuses[bonusData].multiplier;

      this.totalBonus[statAffected].name = researchBonuses[bonusData].statName;
      console.log(this.totalBonus);
    }

    scienceGain () {
      return this.baseScienceGain + this.scientists * 3;// In the future each scientist will have it's own stats, for now it's simple
    }

    update () {
      this.sciencePoints += this.scienceGain();
    }

    checkUnlockedResearch (type) {
      for (const research of type) {
        let requirements = research.requirements;

        if (requirements) requirements = $filter("split")(requirements);
        if (!requirements || requirements.every(val => this.isUnlocked[val])) this.isVisible[research.name] = true;
        if (this.isUnlocked[research.name]) this.isVisible[research.name] = false;
      }
    }

  }

  return Research;
});

// Internet - improves research
// Globalization - improves economy
// Energy Grid - imrpoves economy.. max housing capacity of structure
// Horticulture - Food
// Fertilizer

// {
//    name: "Tech1",
//    cost: 1,
//    isUnlocked: true,
//    isCompleted: false,
//    researchIcon: 'fa-flask',
//    countryStat: '',
//    countryStatAffect: '',
//    structureType: '',
//    building: '',
//    buildingStat: '',
//    buildingStatAffect: '',
//    militaryType: '',
//    unit: '',
//    unitStat: '',
//    unitStatAffect: '',
//    researchType: '',
//    tech: '',
//    techStat: '',
//    tectStatAffect: ''
// }
