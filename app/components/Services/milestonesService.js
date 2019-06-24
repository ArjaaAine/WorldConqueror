"use strict";
// eslint-disable-next-line
wciApp.service("milestonesService", function(playerService) {
	const easyMilestones = [
		{
			name           : "money",
			descriptionWord: "Collect",
			requirements   : [ 10000, 150000, 350000, 900000, 3000000 ],
			rewards        : [ 1, 2, 5, 10, 20 ],
		},
		{
			name           : "population",
			descriptionWord: "Have",
			requirements   : [ 10000, 150000, 350000, 900000, 3000000 ],
			rewards        : [ 1, 2, 5, 10, 20 ],
		},
		{
			name           : "year",
			descriptionWord: "Play for",
			requirements   : [ 10, 25, 50, 75, 100 ],
			rewards        : [ 1, 2, 5, 10, 20 ],
		},
		{
			name           : "food",
			descriptionWord: "Harvest",
			requirements   : [ 10, 25, 50, 75, 100 ],
			rewards        : [ 1, 2, 5, 10, 20 ],
		},
	];
	const milestonesData = {
		easy      : easyMilestones,
		medium    : easyMilestones,
		hard      : easyMilestones,
		impossible: easyMilestones,
		secret    : easyMilestones,
	};

	const milestonesFinished = {
		easy      : 0,
		medium    : 0,
		hard      : 0,
		impossible: 0,
		secret    : 0,
	};

	class Milestone {
		constructor (milestoneData, isHidden, difficulty) {
			this.name = milestoneData.name;
			this.currentTier = 0;
			this.requirements = milestoneData.requirements;
			this.rewards = milestoneData.rewards;
			this.isHidden = isHidden;
			this.isComplete = false;
			this.difficulty = difficulty;
			this.descriptionWord = milestoneData.descriptionWord;
		}

		get description () {
			if (this.currentTier >= this.requirements.length) return "DONE!";
			const playerStat = playerService.baseStats[this.name];
			const statNeeded = Math.floor(this.requirements[this.currentTier] - playerStat);

			return `${this.descriptionWord} ${statNeeded} more ${this.name}.`;
		}

		get currentStat () {
			return playerService.baseStats[this.name];
		}

		get percentageProgress () {
			return this.currentTier / this.requirements.length * 100;

			return this.currentTier / this.requirements.length * 100;
		}

		update () {
			if (this.isComplete) return;
			for (const [ requirementIndex, milestoneRequirement ] of this.requirements.entries()) {
				if (this.currentStat >= milestoneRequirement) {
					this.currentTier = requirementIndex + 1;

					// In case there is no reward, we give the last reward in the array to avoid NaN values for paid currency...
					const reward = this.requirements[requirementIndex] || this.requirements[this.requirements.length - 1];

					playerService.paidCurrency += reward;
				}
				if (this.currentTier >= this.requirements.length) {
					this.isComplete = true;
					milestonesFinished[this.difficulty]++;
				}
			}
		}
	}
	const milestones = {
		easy      : [],
		medium    : [],
		hard      : [],
		impossible: [],
		secret    : [],
	};

	function update () {
		for (const milestoneArray of Object.values(milestones)) for (const milestone of milestoneArray.values()) milestone.update();
	}
	function initializeMilestones () {
		for (const [ difficultyKey, milestoneObject ] of Object.entries(milestonesData)) {
			for (const milestoneData of milestoneObject.values()) {
				let isHidden = false;

				if (difficultyKey === "secret") isHidden = true;
				milestones[difficultyKey].push(new Milestone(milestoneData, isHidden, difficultyKey));
			}
		}
	}
	initializeMilestones();

	return { milestones,
		update,
		milestonesFinished };
});
