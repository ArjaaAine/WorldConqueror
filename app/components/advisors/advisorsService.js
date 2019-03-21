"use strict";
// eslint-disable-next-line
wciApp.factory('advisorsService', function (
	$uibModal,
	buildingsService,
) {

	const advisors = {
		baseStats: {},
		functions: {},
	};

	// First Load
	if (!localStorage.advisorsService) setInitialAdvisorsData(advisors);

	else advisors.baseStats = JSON.parse(localStorage.advisorsService);

	advisors.functions.hireNewAdvisor = function (advisor) {

		const modalInstance = $uibModal.open({
			templateUrl: "advisorsHiringModal.html",
			controller : "advisorsHiringModalController",
			size       : "md",
			resolve    : {
				advisorType () {
					return advisor.Type;
				},
			},
		});

		modalInstance.result.then((advisor) => {
			advisors.baseStats.activeAdvisors[advisor.Type] = advisor;
		});
	};
	advisors.functions.upgradeAdvisor = function (advisor) {

	};
	advisors.functions.removeAdvisor = function (advisor) {
		angular.forEach(buildingsService.baseStats[advisor.Type].structures, (structure) => {

			structure.cost = structure.baseCost;
			structure.displayCost = structure.baseCost;
		});
		advisors.baseStats.activeAdvisors[advisor.Type] = { Type: advisor.Type };
	};
	advisors.functions.enableAutoBuy = function (advisor) {
		advisor.IsAutobuyActive = !advisor.IsAutobuyActive;
	};

	advisors.functions.saveData = function () {
		localStorage.advisorsService = JSON.stringify(advisors.baseStats);
	};
	advisors.functions.resetData = function () {
		setInitialAdvisorsData(advisors);
	};

	advisors.functions.advisorTimedEffects = function () {
		activateSkills();
	};

	const autoBuy = function () {

	};
	var activateSkills = function () {
		for (const activeAdvisor in advisors.baseStats.activeAdvisors) {
			var advisor = advisors.baseStats.activeAdvisors[activeAdvisor];

			if (advisor.Name) {
				angular.forEach(buildingsService.baseStats[activeAdvisor].structures, (structure) => {

					structure.cost = structure.baseCost * (1 - Math.pow(advisor.EducationLevel, 2) / 100);
					structure.displayCost = structure.baseCost * (1 - Math.pow(advisor.EducationLevel, 2) / 100);
				});
				advisor.IsSkillActive = true;
			}
		}
	};

	advisors.getTotalUpkeep = function () {

		let totalUpkeep = 0;

		for (const activeAdvisor in advisors.baseStats.activeAdvisors) {
			const advisor = advisors.baseStats.activeAdvisors[activeAdvisor];

			if (advisor.Salary) totalUpkeep += advisor.Salary / 8640; // Breakdown yearly salary in hourly = 12*30*24

		}

		return totalUpkeep;
	};

	return advisors;
});

var setInitialAdvisorsData = function (advisors) {
	advisors.baseStats = {
		activeAdvisors: {
			Economic: {
				Name: "Test Name",
				Age : 24,
				Type: "Economic",

				// Skill: 'Cost Reduction',
				EducationLevel : 1,
				IsAutobuyActive: false,
				IsSkillActive  : false,
				Image          : "assets/img/avatar_blank.jpeg",
				Upkeep         : 10,
			},
			Food: {
				Name           : "Test Name",
				Age            : 24,
				Type           : "Food",
				EducationLevel : 1,
				IsAutobuyActive: false,
				IsSkillActive  : false,
				Image          : "assets/img/avatar_blank.jpeg",
				Upkeep         : 10,
			},
			Housing: {
				Type: "Housing",
			},
			Military: {
				Type: "Military",
			},
			Science: {
				Type: "Science",
			},
		},
	};
};
