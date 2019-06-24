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
			this.isDefeated = false;// Remove Ai Player if set to true.
			this.isAtWar = false; // Is at war with player? Does not support ai vs ai...
		}

		init (countryData, countryObject) {
			this.countries.push(countryObject);
			this.unitGrowth = countryData.unitGrowth || Math.floor(Math.random() * 100) + 10;// How many units are built each turn 10-1000;
			this.unitGrowthIncrease = countryData.unitGrowthIncrease || Math.floor(Math.random() * 5) + 1;// 1-5 increase of unitGrowth each turn. means AI produces more units each turn forever.
			this.AirUnitTier = countryData.AirUnitTier || Math.floor(Math.random() * 6) + 1;// 1-6
			this.LandUnitTier = countryData.LandUnitTier || Math.floor(Math.random() * 6) + 1;
			this.NavalUnitTier = countryData.NavalUnitTier || Math.floor(Math.random() * 6) + 1;
			this.totalUnitTier = this.AirUnitTier + this.LandUnitTier + this.NavalUnitTier;
			const initialStrength = countryData.initialStrength || Math.floor(Math.random() * 100 * this.totalUnitTier + 10);// This is for starting units, it wont be used anymore after this.

			this.military = new militaryService.AiMilitary();
			this.generateUnits(initialStrength);
			this.leaderName = `Name_${Math.floor(Math.random() * 1000)}`;
		}

		trainUnits () {
			this.unitGrowth += Math.floor(Math.random() * this.unitGrowthIncrease) + 1;// 1 to n increase in growth, meaning they will produce more and more units each turn...
			this.unitGrowthIncrease += Math.floor(Math.random() * Math.floor(this.unitGrowthIncrease * 0.33) + 1); //
			this.generateUnits();
		}

		getCountryData (countryCode) {
			for (const countryData of this.countries.values()) if (countryData.countryCode === countryCode) return countryData;
		}

		generateUnits (initialGrowth) {
			// Initialize a country with units
			const minGrowth = Math.floor(this.unitGrowth * 0.8);// 80%
			const maxGrowth = Math.floor(this.unitGrowth * 1.2);// 120%
			const unitGrowth = Math.floor(Math.random() * (maxGrowth - minGrowth)) + minGrowth;
			let strength = initialGrowth || unitGrowth;
			const hireStrength = Math.round(strength * 0.33);
			let hireTimes = 3; // Call loop 3 times

			// TODO: Give each AI/country different units they like...and use that as % to generate units quicker without looping.
			while (hireTimes > 0) {
				const type = [ "air", "land", "naval" ];
				const unitType = type[hireTimes - 1];
				const unitStrength = this.military.getUnitStrength(unitType);
				const hireAmount = Math.ceil(hireStrength / unitStrength); // Hire at least 1 unit

				this.military.unitsAtHome[unitType] += hireAmount;
				strength -= hireAmount * unitStrength;
				hireTimes--;
			}
		}
	}

	return AiPlayer;
});
