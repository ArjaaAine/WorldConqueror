"use strict";
// eslint-disable-next-line
wciApp.factory("warEventService", function
() {
	// TODO: Later make it into an event object for everything, not just war...
	class WarEvent {
		constructor () {
			this.warEvents = [];
		}

		addEvent (eventObject) {
			eventObject.isNew = true;// Used to display a badge or highlight new events...
			this.warEvents.push(eventObject);
			console.table(this.warEvents);
		}
	}

	return new WarEvent();
});
