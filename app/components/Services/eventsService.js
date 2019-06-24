"use strict";
// eslint-disable-next-line
wciApp.service("eventService", function(){
	const immediateEvents = [
		{ name       : "Investment",
			description: { good: "Your investment paid off!",
				bad : "Your investment didn't pay off! :(" },
			type  : "Money",
			amount: 0.1 },

		{ name: { good: "Population up",
			bad : "Population down" },
		description: { good: "Lots of rain, lots of food!",
			bad : "No Rain, No food :(" },
		type  : "Food",
		amount: 0.1 },
	];

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
			this.eventsAmountRange = [ 1, 3 ];// Based on difficulty, how many events can appear.
			this.currentEvents = [];
		}

		// Call this each turn
		getRandomEvent () {
			this.currentEvents = [];// Reset
			if (this.globalCooldown > 0) {
				this.globalCooldown--;// Update globalCooldown

				return;
			}
			const min = this.globalCooldownRange[0];
			const max = this.globalCooldownRange[1];
			const eventMin = this.eventsAmountRange[0];
			const eventMax = this.eventsAmountRange[1];
			const eventsCopy = [];

			angular.copy(this.events, eventsCopy);// Deep copy
			const randomAmountOfEvents = Math.floor(Math.random() * (eventMax - eventMin) + eventMin);

			for (let i = 0; i < randomAmountOfEvents; i++) {
				const goodOrBad = [ "good", "bad" ];
				const eventType = goodOrBad[Math.floor(Math.random() * goodOrBad.length)];

				if (eventsCopy.length <= 0) break;
				const randomEvent = eventsCopy[Math.floor(Math.random() * eventsCopy.length)];

				eventsCopy.splice(eventsCopy.indexOf(randomEvent), 1);
				for (const [ eventKey, eventProperties ] of Object.entries(randomEvent)) if (eventProperties[eventType]) randomEvent[eventKey] = eventProperties[eventType];

				if (eventType === "bad") randomEvent.amount *= -1;// Make it negative
				this.currentEvents.push(randomEvent);
			}

			// Reset cooldown after getting the event.
			this.globalCooldown = Math.floor(Math.random() * (max - min) + min);
		}
	}
	const data = {
		immediateEvents,
		choiceEvents: [],
	};

	// Create new event
	return { choiceEvent   : new ChoiceEvent(data),
		immediateEvent: new ImmediateEvent(data) };
});
