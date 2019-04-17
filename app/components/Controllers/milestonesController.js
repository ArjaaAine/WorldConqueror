"use strict";

wciApp.controller("MilestonesController", function (
	$scope,
	milestonesService,
) {
	$scope.milestones = milestonesService.milestones;
	$scope.milestonePopoverTemplate = "milestonePopoverTemplate.html";
	$scope.milestonesFinished = milestonesService.milestonesFinished;

});
