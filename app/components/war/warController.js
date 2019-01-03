wciApp.controller("WarController", (
  $interval,
  playerService,
  worldCountryService,
  warService,
  $log,
  $filter,
  $uibModalInstance,
  $scope,
  gameDataService,
  $timeout,
) => {
  $scope.slider = [];
  $scope.playerService = playerService;
  $scope.warService = warService;
  $scope.worldCountryService = worldCountryService;
  $scope.countrySelected = false;
  $scope.mainDisplay = "";
  $scope.buttonId = null;
  $scope.military = playerService.military;
  $scope.unitsQueue = [];
  $scope.currentTargetIndex = null;
  $scope.makePeace = function (aiPlayerIndex) {
    warService.makePeace(aiPlayerIndex);
  };
  $scope.unitsAlreadySent = function (aiIndex, index) {
    let unitSent = null;
    const currentWar = warService.currentlyAtWar.filter((el, i) => {
      if (el === aiIndex) {
        unitSent = playerService.military.unitsAtWar[i].length;
        return true;
      }
    })[0];
    const inQueue = this.checkIfUnitsInQueue(index);

    return inQueue || unitSent;
  };

  $scope.checkIfUnitsInQueue = function (aiIndex) {
    return warService.checkIfUnitsInQueue(aiIndex);
  };

  $scope.canReturnUnits = function (index) {
    return warService.canReturnUnits(index);
  };
  $scope.returnUnits = function (aiPlayerIndex) {
    warService.returnUnits(aiPlayerIndex);
  };

  $scope.sendUnits = function (aiAttackedIndex, atWarIndex) {
    $scope.countrySelected = true;
    $scope.buttonId = aiAttackedIndex;
    $scope.mainDisplay = "sendUnits";
    $scope.currentTargetIndex = atWarIndex;
    $scope.refreshSlider();
  };

  $scope.refreshSlider = function () {
    $scope.initSlider();
    $timeout(() => {
      $scope.$broadcast("rzSliderForceRender");
    });
  };

  $scope.cancel = function () {
    $scope.countrySelected = false;
    $scope.buttonId = null;
    $scope.mainDisplay = "";
    $scope.currentTargetIndex = null;
  };
  $scope.initUnitsQueue = function () {
    const units = gameDataService.Units;

    for (const [ index, unit ] of units.entries()) {
      const id = unit.id;
      const name = unit.name;
      const unitObject = {};

      unitObject.id = id;
      unitObject.name = name;
      unitObject.count = 0;

      $scope.unitsQueue[index] = unitObject;
    }
  };
  $scope.initUnitsQueue();

  $scope.initSlider = function (divider) {
    const tickDivider = divider || 10;// How many steps in % for each tick...10 = 10%

    for (const [ index, unit ] of playerService.military.unitsAtHome.entries()) {
      const count = unit.count;

      $scope.slider[index] = {};

      const slider = $scope.slider[index];

      slider.value = 0;
      slider.options = {
        step                : Math.ceil(count / tickDivider),
        ceil                : count,
        showSelectionBar    : true,
        selectionBarGradient: {
          from: "#00dd00",
          to  : "#ff0300",
        },
        showTicks: true,

      };
    }
  };
  $scope.updateUnitsQueue = function (index, count) {
    $scope.unitsQueue[index].count = count;
  };
  $scope.sendQueuedUnits = function () {
    for (const [ index, sliderData ] of $scope.slider.entries()) $scope.unitsQueue[index].count = sliderData.value;

    const troops = angular.copy($scope.unitsQueue);

    warService.addTroopsToQueue(troops, $scope.currentTargetIndex);
    $scope.initUnitsQueue();
    $scope.refreshSlider();
  };

});
