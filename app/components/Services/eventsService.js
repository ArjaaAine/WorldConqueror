"use strict";
// eslint-disable-next-line
wciApp.service("eventService", function(){

	class ChoiceEvent {
		constructor (data) {
			this.events = data.choiceEvents;// List of all events with built in cooldowns
			this.choices = [];
			this.result = [];// Result is same size as choices, each choice gives different result, giving player different reward or making player pay the price...
			this.currentEvent = {};
			this.currentFlatBonuses = {};// Money/food etc.
		}

		// Call this each turn
		getRandomEvent () {
			// Random event from a list, based on some conditions...
			// TODO: This data will be randomly taken from an object. Ignore events which are on cooldown i.e. make a new array out of events that are not on cooldown.
			const randomEvent = { name       : "Question from the president.",
				description: "Do you like cookies?",
				choices    : [ "Yes", "No" ],
				result     : [
					// Good event
					{ type      : "money",
						statAdder : 1000,
						multiplier: 1.1,
					    timer     : 5 },

					// Bad event
					{ type      : "food",
						statAdder : -1000,
						multiplier: 0.9,
						timer     : 5 },
				] };

			this.currentEvent = randomEvent;
		}

		chooseAnswer (index) {
			// Do something with result.
			this.currentResult = this.currentEvent.result[index];
		}
	}

	class ImmediateEvent {
		constructor (data) {
			this.events = data.immediateEvents;// List of all events from JSON
			this.globalCooldown = 0;
			this.globalCooldownRange = [ 2, 5 ];// Range in turns for global cooldown so it's a bit unpredictable
			this.currentEvents = [];
		}

		// Call this each turn
		getRandomEvent () {
			this.currentEvents = [];// Reset
			if (this.globalCooldown > 0) this.globalCooldown--;// Update globalCooldown
			const min = this.globalCooldownRange[0];
			const max = this.globalCooldownRange[1];

			// Random immediate event, based on game difficulty. Good or bad.
			// TODO: Randomize them based on data
			const randomEvent = { name       : "Investment",
				description: "Your investment paid off!",
				type       : "Money",
				amount     : 1000 };// Good event
			const randomEvent2 = { name       : "Drought",
				description: "No Rain, No food",
				type       : "Food",
				amount     : -1000 };// Bad event

			this.currentEvents.push(randomEvent, randomEvent2);

			// Reset cooldown after getting the event.
			this.globalCooldown = Math.floor(Math.random() * (max - min) + min);
		}
	}
	const data = {
		immediateEvent: [],
		choiceEvent   : [],
	};

	// Create new event
	return { choiceEvent   : new ChoiceEvent(data),
		immediateEvent: new ImmediateEvent(data) };
});
