"use strict";

wciApp.factory("notificationService", function (playerService) {

	const notification = {
		show       : false,
		title      : "",
		description: "",
	};

	return notification;
});
