"use strict";
// eslint-disable-next-line
wciApp.service("eventService", function(){

	class ChoiceEvent {
		constructor (data) {
			this.events = data.choiceEvents;// List of all events with built in cooldowns
			this.choices = [];
			this.result = [];// Result is same size as choices, each choice gives different result, giving player different reward or making player pay the price...
			this.currentEvent = {};
		}

		// Call this each turn
		getRandomEvent () {
			// Random event from a list, based on some conditions...
			// TODO: This data will be randomly taken from an object. Ignore events which are on cooldown i.e. make a new array out of events that are not on cooldown.
			const randomEvent = { name       : "Default Event",
				description: "Do you like cookies?",
				choices    : [ "Yes", "No" ],
				result     : [
					{ reward: { type  : "money",
						amount: 1000 } },
					{ price: { type  : "food",
						amount: 1000 } },
				] };

			this.currentEvent = randomEvent;
		}
	}

	class ImmediateEvent {
		constructor (data) {
			this.events = data.ImmediateEvents;// List of all events from JSON
			this.globalCooldown = 0;
			this.globalCooldownRange = [ 2, 5 ];// Range in turns for global cooldown so it's a bit unpredictable
		}

		// Call this each turn
		getRandomEvent () {
			if (this.globalCooldown > 0) this.globalCooldown--;// Update globalCooldown
			const min = this.globalCooldownRange[0];
			const max = this.globalCooldownRange[1];

			// Random immediate event, based on game difficulty. Good or bad.
			// TODO: Randomize them based on data
			const randomEvent = { name       : "Default Immediate Event",
				description: "You found some cookies and sold them for some money",
				type       : "money",
				amount     : 1000 };// Good event
			const randomEvent2 = { name       : "Default Immediate Event",
				description: "You decided to buy some cookies and lose some money",
				type       : "money",
				amount     : -1000 };// Bad event

			// Reset cooldown after getting the event.
			this.globalCooldown = Math.floor(Math.random() * (max - min) + min);
		}
	}

	// Create new event
	return { ChoiceEvent,
		ImmediateEvent };
});
