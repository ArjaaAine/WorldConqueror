"use strict";

wciApp.controller(
	"advisorsHiringModalController",
	(
		$scope,
		$uibModalInstance,
		advisorType,
	) => {

		$scope.advisors = [];

		const generateRandomAdvisors = function () {
			for (let i = 0; i < 5; i++) {
				const advisor = {
					Name           : getRandomName(),
					Age            : getRandomAge(),
					EducationLevel : getRandomEducationLevel(),
					IsAutobuyActive: false,
					IsSkillActive  : false,
					Type           : advisorType,
					Image          : "../img/avatar_blank.jpeg",
					Upkeep         : 0,
				};

				advisor.Upkeep = getSalary(advisor);

				$scope.advisors.push(advisor);
			}
		};

		var getRandomAge = function () {
			const age = Math.floor(Math.random() * (80 - 18) + 18);

			return age;
		};
		var getRandomEducationLevel = function () {
			const educationLevel = Math.floor(Math.random() * 5 + 1);

			return educationLevel;
		};
		var getRandomName = function () {
			return "Test Name";
		};

		var getSalary = function (advisor) {
			const salary = Math.pow(advisor.EducationLevel, 5) * 10; // Square*100k

			return salary;
		};

		generateRandomAdvisors();

		$scope.hire = function (advisor) {
			$uibModalInstance.close(advisor);
		};
		$scope.cancel = function () {
			$uibModalInstance.dismiss("cancel");
		};
		$scope.refreshList = function () {
			$scope.advisors = [];
			generateRandomAdvisors();
		};
	},
);

