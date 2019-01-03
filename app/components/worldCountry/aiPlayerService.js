"use strict";
// eslint-disable-next-line
wciApp.service("AiPlayerService", function
(
  militaryService,
  gameDataService,
) {

  class AiPlayer {
    constructor () {
      // Object for a single country
      this.military = {};
      this.countries = [];// Countries under control of this AI, at first each AI controls one country...Change in the future versions where AI can conquer other countries.
      this.land = 0;// Total Land based on countries controlled
      this.unitGrowth = 0;
      this.strength = 0;
      this.isDefeated = false;// Remove Ai Player if set to true.
    }

    init (countryData, countryObject) {
      this.countries.push(countryObject);
      this.unitGrowth = countryData.unitGrowth || Math.floor(Math.random() * 90) + 10;// How many units are built each turn 10-100;
      this.AirUnitTier = countryData.AirUnitTier || Math.floor(Math.random() * 6) + 1;// 1-6
      this.LandUnitTier = countryData.LandUnitTier || Math.floor(Math.random() * 6) + 1;
      this.NavalUnitTier = countryData.NavalUnitTier || Math.floor(Math.random() * 6) + 1;
      this.totalUnitTier = this.AirUnitTier + this.LandUnitTier + this.NavalUnitTier;
      this.strength = countryData.strength || Math.floor(Math.random() * 1000 * (this.totalUnitTier * 100)) + 10;// This formula is just in case we don't put any data in excel

      this.military.unitsAtHome = [];
      this.military.unitsAtWar = [];
      this.initUnits();
      this.generateUnits();
      this.name = `Name_${Math.floor(Math.random() * 1000)}`;
    }

    initUnits () {
      const unitsLength = gameDataService.Units.length;

      for (let i = 0; i < unitsLength; i++) {
        this.military.unitsAtHome[i] = 0;
        this.military.unitsAtWar[i] = 0;
      }
    }

    trainUnits () {
      this.strength += this.unitGrowth * Math.floor(Math.random() * 10000);
      this.generateUnits();
    }

    generateUnits () {
      // Initialize a country with units
      let strength = this.strength;

      while (strength > 0) {
        const type = [ "Air", "Land", "Naval" ];
        const randomType = type[Math.floor(Math.random() * type.length)];
        const randomTier = Math.floor(Math.random() * this[`${randomType}UnitTier`]) + 1;

        for (const index of this.military.unitsAtHome.keys()) {
          const unit = gameDataService.Units[index];

          if (unit.type === randomType && unit.level === randomTier) {
            this.military.unitsAtHome[index] += 1;
            strength -= this.getUnitStrength(index);
          }
        }
      }
      this.strength += Math.abs(strength);
    }

    getUnitStrength (index) {
      const unit = gameDataService.Units[index];

      return (unit.attack + unit.defense) * this.military.unitsAtHome[index];
    }

    getTotalStrength () {
      let strength = 0;

      for (const [ index, count ] of this.military.unitsAtHome.entries()) {
        const unit = gameDataService.Units[index];
        const attack = unit.attack;
        const defense = unit.defense;

        strength += (attack + defense) * count;
      }

      return strength;
    }
  }

  return AiPlayer;
});
