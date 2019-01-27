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
      this.isAtWar = false; // Is at war with player? Does not support ai vs ai...
    }

    init (countryData, countryObject) {
      this.countries.push(countryObject);
      this.unitGrowth = countryData.unitGrowth || Math.floor(Math.random() * 90) + 10;// How many units are built each turn 10-100;
      this.AirUnitTier = countryData.AirUnitTier || Math.floor(Math.random() * 6) + 1;// 1-6
      this.LandUnitTier = countryData.LandUnitTier || Math.floor(Math.random() * 6) + 1;
      this.NavalUnitTier = countryData.NavalUnitTier || Math.floor(Math.random() * 6) + 1;
      this.totalUnitTier = this.AirUnitTier + this.LandUnitTier + this.NavalUnitTier;
      this.strength = countryData.strength || Math.floor(Math.random() * 100 * (this.totalUnitTier * 100)) + 10;// This formula is just in case we don't put any data in excel
      this.military = new militaryService.AiMilitary();
      this.generateUnits();
      this.name = `Name_${Math.floor(Math.random() * 1000)}`;
    }

    trainUnits () {
      this.strength += this.unitGrowth * Math.floor(Math.random() * 10000);
      this.generateUnits();
    }

    getCountryData (countryCode) {
      for (const countryData of this.countries.values()) if (countryData.countryCode === countryCode) return countryData;
    }

    generateUnits () {
      // Initialize a country with units
      let strength = this.strength;

      while (strength > 0) {
        const type = [ "air", "land", "naval" ];
        const randomType = type[Math.floor(Math.random() * type.length)];

        this.military.unitsAtHome[randomType] += 1;
        strength -= this.military.getUnitStrength(randomType);
      }
      this.strength += Math.abs(strength);
    }
  }

  return AiPlayer;
});
