"use strict";

wciApp.controller("EventsController", (
	$scope,
	$uibModalInstance,
	eventService,
	playerService,
) => {
	$scope.events = eventService;
	$scope.choiceEvent = eventService.choiceEvent;
	$scope.choiceEventisDone = false;
	$scope.choiceEventResult = null;
	$scope.choiceEventAnswer = null;

	$scope.chooseAnswer = function (answerIndex) {
		$scope.choiceEventResult = $scope.choiceEvent.currentEvent.result[answerIndex];
		$scope.choiceEventAnswer = $scope.choiceEvent.currentEvent.choices[answerIndex];
		$scope.choiceEventisDone = true;
		$scope.choiceEvent.chooseAnswer(answerIndex);
		playerService.baseStats[$scope.choiceEventResult.type] += $scope.choiceEventResult.statAdder;
	};

	$scope.removeEvent = function(index) {
		eventService.immediateEvent.currentEvents.splice(index, 1);
	};

	$scope.updateEvents = function () {
		// Check timer and remove event if needed
		const choiceEventResult = eventService.choiceEvent.currentEvent.result;
		const event = eventService.choiceEvent;

		if (choiceEventResult.timer) {
			// If event has timer on it, means it is a bonus
			if (!event.eventBonuses[choiceEventResult.type]) event.eventBonuses[choiceEventResult.type] = [];

			event.eventBonuses[choiceEventResult.type].push(choiceEventResult);
		}
		for (const [ name, event ] of Object.entries(event.eventBonuses)) {
			for (let i = event.length - 1; i >= 0; i--) {
				const eventBonus = event[i];

				eventBonus.timer -= 1;
				if (eventBonus.timer <= 0) eventBonus.splice(i, 1);// Remove event if timer runs out.

			}
		}
	};

	$scope.getTotalBonus = function (id) {
		console.log(this);
		const researchBonus = this.researchBonuses.id;
		const ministerBonus = this.ministersBonuses.id;
		const lawsBonus = this.lawsBonuses.id;
		const eventBonus = this.eventBonuses.id;
		const totalEventBonus = 0;

		for (const eventBonusAmount of eventBonus.value()) {
			totalEventBonus += eventBonusAmount;
		};

		// Fix it including multipliers...Formula:
		/*
			##Includes global multiplier##

			((obj.val + statAdder) * (statMultiplier * statMultiplier_2) * (globalStatMultiplier * globalStatMultiplier_2))

			##Simplified##

			(obj.val + statAdder) * (statMultiplier * statMultiplier_2)
			*/

	}

	$scope.close = function() {
		$uibModalInstance.close("ok");
	};
});