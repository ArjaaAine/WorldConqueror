"use strict";

wciApp.factory("researchService", (gameDataService, bonusesService, playerService) => {

  class Research {
    constructor () {
      this.scientists = 1;// Total scientists we have unlocked/bought
      this.maxScientists = 5;// Max scientists we can hire, scientist can't go higher than maxScientists.
      this.scientistPrice = 100;
      this.baseScienceGain = 1;// This is how much science points is gained per turn for each research type
      this.sciencePoints = 0;// Store leftover science points after research is finished.(like in civ)
      this.researchType = {};// Object to store various research types such as War/Economy
      this.isUnlocked = {};// Object key == research name/id, each store a boolean which we save only.
      this.descriptions = {};
      this.researchBonuses = {};
    }

    init () {
      const researchBonuses = gameDataService.ResearchBonuses;

      this.descriptions = gameDataService.ResearchDescription;
      for (const { type } of gameDataService.ResearchData) {
        this.researchType[type] = gameDataService[`${type}Research`];
        this._initBonusProps(type, researchBonuses);
      }
      console.log(this);

      // For testing
      this.update();
    }

    _initBonusProps (type, researchBonuses) {
      const arr = this.researchType[type];
      const len = arr.length;

      for (let i = 0; i < len; ++i) {
        const { name, bonus: researchBonus } = arr[i];
        const obj = this.researchType[type][i];
        const bonus = obj.bonus = researchBonuses.filter(this._bonusFilter, researchBonus);

        this.isUnlocked[name] = false;
        if (bonus.length < 1) {
          console.log("Bonus not working! Probably does not exist in the excel file: %s", name);
          continue;
        }
        const first = bonus[0];

        delete first.ID;
      }
    }

    _bonusFilter (bonus) {
      return this === bonus.ID;
    }

    getDescription (property) {
      return this.descriptions[property];
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

    unlockResearch (type, index) {
      const research = this.researchType[type][index];
      const price = research.cost;

      if (this.sciencePoints >= price) {
        const military = playerService.military;
        const buildings = playerService.buildings;
        const laws = playerService.laws;
        const name = research.name;
        let buildingsToUnlock = research.unlockBuilding;
        let unitToUnlock = research.unlockUnit;
        let lawToUnlock = research.unlockLaw;

        this.sciencePoints -= price;
        this.isUnlocked[name] = true;

        // Unlock bonuses
        for (const bonusData of research.bonus)
          this.unlockBonus(bonusData, research.name);

        // Unlock units
        if (unitToUnlock) {
          unitToUnlock = unitToUnlock.split(", ");
          military.unlockUnits(unitToUnlock);
        }

        // Unlock buildings
        if (buildingsToUnlock) {
          buildingsToUnlock = buildingsToUnlock.split(", ");
          buildings.unlockBuilding(buildingsToUnlock);
        }

        // Unlock law
        if (lawToUnlock) {
          lawToUnlock = lawToUnlock.split(", ");
          laws.unlockLaw(lawToUnlock);
        }
      }
    }

    unlockBonus (bonusData, name) {
      this.isUnlocked[name] = true;
      for (const [ key, bonus ] of Object.entries(bonusData)) {
        this.researchBonuses[key] = this.researchBonuses[key] || 0;
        this.researchBonuses[key] += bonus;
      }
      console.log(bonusData);
    }

    scienceGain () {
      return this.baseScienceGain + this.scientists * 3;// In the future each scientist will have it's own stats, for now it's simple
    }

    update () {
      this.sciencePoints += this.scienceGain();

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
