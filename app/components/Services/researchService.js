"use strict";

wciApp.factory("researchService", function (gameDataService, $filter) {

	function bonusFilter (bonus) {
		return this === bonus.ID;
	}

	const research = {
		scientists     : 1, // Total scientists we have unlocked/bought
		maxScientists  : 5, // Max scientists we can hire, scientist can't go higher than maxScientists.
		scientistPrice : 100,
		baseScienceGain: 1, // This is how much science points is gained per turn for each research type
		sciencePoints  : 0, // Store leftover science points after research is finished.(like in civ)
		researchType   : [], // Array to store various research types such as War/Economy
		isUnlocked     : {}, // Object key == research name/id, each store a boolean which we save only.
		researchBonuses: [],
		totalBonus     : {},
		isVisible      : {},
	};

	/* PUBLIC METHODS */
	research.init = function () {
		const researchBonuses = gameDataService.ResearchBonuses;

		for (const { type } of gameDataService.ResearchData) {
			const researchType = gameDataService[`${type}Research`];

			this.researchType.push(type);
			this.initBonusProps(researchType, researchBonuses);
			this._checkUnlockedResearch(researchType);
		}
	};
	research.initBonusProps = function (type, researchBonuses) {
		const arr = type;
		const len = arr.length;

		for (let i = 0; i < len; ++i) {
			const value = arr[i];
			const name = value.name;
			let bonus = value.bonus;

			if (!bonus) continue;

			bonus = $filter("split")(bonus);
			value.bonus = bonus;

			for (let j = 0; j < bonus.length; j++) {
				const bonusValue = bonus[j];
				const bonusData = researchBonuses.filter(bonusFilter, bonusValue)[0];

				if (bonusData) {
					this.researchBonuses[bonusValue] = {};
					this.researchBonuses[bonusValue] = bonusData;
				} else {
					console.log("Bonus not working! Probably does not exist in the excel file: %s", name);
				}
			}
			if (value.isUnlocked) this.unlockResearch(type, i, true);
		}
	};
	research.scienceGain = function () {
		return this.baseScienceGain + this.scientists * 3;// In the future each scientist will have it's own stats, for now it's simple
	};
	research.update = function () {
		this.sciencePoints += this.scienceGain();
	};

	/* END OF PUBLIC METHODS */

	/* PRIVATE METHODS */
	research._unlockBonus = function (bonusData) {
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
	};
	research._checkUnlockedResearch = function (type) {
		for (const research of type) {
			let requirements = research.requirements;

			if (requirements) requirements = $filter("split")(requirements);
			if (!requirements || requirements.every(val => this.isUnlocked[val])) this.isVisible[research.name] = true;
			if (this.isUnlocked[research.name]) this.isVisible[research.name] = false;
		}
	};

	/* END OF PRIVATE METHODS */
	return research;
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
