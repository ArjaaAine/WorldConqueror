"use strict";
// eslint-disable-next-line
wciApp.factory("bonusesService", function (
	researchService,
	ministerService,
	lawsService,
) {

	class Bonuses {
		constructor () {
			this.researchBonuses = {};
			this.lawsBonuses = {};
			this.ministersBonuses = {};
		}

		update () {
			// We pass gameObj because it is initialized later on, so we can't pass Services.
			this.updateMinisters();
			this.updateResearch();
			this.updateLaws();
		}

		init () {
			this.researchBonuses = {};
			this.lawsBonuses = {};
			this.ministersBonuses = {};
			this.eventBonuses = {};
		}

		updateResearch () {
			const allBonuses = {};

			for (let i = 0; i < researchService.researchBonuses.length; i++) {
				for (const bonusProp in researchService.researchBonuses[i]) {
					if (researchService.researchBonuses[i].hasOwnProperty(bonusProp)) {
						if (researchService.researchBonuses[i][bonusProp] >= 0) {
							if (!allBonuses[bonusProp]) allBonuses[bonusProp] = 0;
							allBonuses[bonusProp] += researchService.researchBonuses[i][bonusProp];
						}
					}
				}
			}
			this.researchBonuses = allBonuses;
		}

		researchUnlockBonus () {

		}

		updateLaws () {
			const totalBonus = {};

			lawsService.activeLaws.forEach((law) => {
				for (const lawProperty in law) {
					if (law.hasOwnProperty(lawProperty)) {
						if (typeof law[lawProperty] === "string") {
							totalBonus[lawProperty] = law[lawProperty];
							continue;
						}
						if (!totalBonus[lawProperty]) totalBonus[lawProperty] = 0;
						totalBonus[lawProperty] += law[lawProperty];
					}
				}
			});
			this.lawsBonuses = totalBonus;

			// Unlock or lock laws.
		}

		updateMinisters () {
			const totalBonus = {};

			// Commented out because activeMinisters need to be initialized somewhere so we dont ge an error here. 22-09-2018
			ministerService.activeMinisters.forEach((minister) => {
				totalBonus[minister.statAffected] = totalBonus[minister.statAffected] || 0;
				totalBonus[minister.statAffected] += minister.statAdder;
			});
			this.ministersBonuses = totalBonus;

		}
	}

	return new Bonuses();

});
