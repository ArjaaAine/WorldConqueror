"use strict";
// eslint-disable-next-line
wciApp.factory("lawsService", function (gameDataService) {

	const laws = {
		laws        : [], // List of laws from excel/json file
		unlockedLaws: [], // List of unlocked laws from research/ministers
		activeLaws  : [], // List of active laws
	};

	laws.init = function () {
		this.laws = [];
		this.unlockedLaws = [];
		this.activeLaws = [];
		const lawsToUnlock = [];

		gameDataService.Laws.forEach((law) => {
			if (law.isUnlocked) lawsToUnlock.push(law.ID);
			this.laws.push(law);
		});
		this.unlockLaw(lawsToUnlock);
	};

	laws.update = function () {
		// Update active laws for their duration.
		this.activeLaws.forEach((law) => {
			law.duration++;
		});
	};

	laws.unlockLaw = function (lawsToUnlock) {
		for (const id of lawsToUnlock.values()) {
			const law = this._filterLaw(id);

			if (law) this.unlockedLaws.push(law);
		}
	};

	laws.removeLaw = function (id) {
		// This is necessary if you fire a minister, it will remove a law from that minister.
		const law = this._filterLaw(id);

		this.unlockedLaws.splice(law, 1);
	};

	laws.enactLaw = function (index) {
		const law = this.unlockedLaws[index];
		const lawType = law.type;// This is used to prevent from using same type of laws(e.x. one increase income, while other decreases)
		const filterSameType = this._filterLawByType(lawType);

		if (filterSameType) return;// It means that we found another law with the same "type"
		// TODO: We might want to tell the player that he cant active a law due to other of the same type being active.
		law.isActive = true;
		law.duration = 0;
		this.activeLaws.push(law);

		return true;
	};

	laws.repealLaw = function (index) {
		const law = this.unlockedLaws[index];
		const removeIndex = this.activeLaws.indexOf(law);

		law.duration = 0;
		this.activeLaws.splice(removeIndex, 1);
		law.isActive = false;
	};

	// Private methods
	laws._filterLawByType = function (lawType) {
		return this.activeLaws.filter(lawObject => lawObject.type === lawType)[0];
	};

	laws._filterLaw = function (id) {
		return this.laws.filter(lawObject => lawObject.ID.includes(id))[0];
	};

	return laws;

});
