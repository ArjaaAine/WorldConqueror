"use strict";

wciApp.controller("MilestonesController", (
	$scope,
	milestonesService,
) => {
	$scope.milestones = milestonesService.milestones;
	$scope.milestonePopoverTemplate = "milestonePopoverTemplate.html";
	$scope.milestonesFinished = milestonesService.milestonesFinished;

});
