"use strict";

// eslint-disable-next-line
wciApp.controller('GameController', function (
  $scope,
  $interval,
  playerService,
  buildingsService,
  militaryService,
  lawsService,
  advisorsService,
  helperModalsService,
  notificationService,
  researchService,
  ministerService,
  worldCountryService,
  saveService,
  initService,
  debugService,
  bonusesService,
  warService,
  $filter,
  modalService,
  chartsService,
  leaderService,
  $log,
) {
  let saveTimer;

  $scope.saveService = saveService;
  $scope.startScreen = true;
  $scope.gameLoading = true;
  $scope.expandStats = true;
  $scope.hideDebug = true;

  $scope.toggleStartScreen = function () {
    $scope.startScreen = !$scope.startScreen;
  };
  $scope.saveData = [];
  $scope.getLocalStorageData = function () {
    $scope.saveData = [];
    for (let i = 0; i < 4; i++) {
      const save = angular.fromJson(localStorage.getItem(`gameData_${i}`));

      console.log(save);
      $scope.saveData.push(save);
    }
    console.log($scope.saveData);
  };
  $scope.getLocalStorageData();
  $scope.gameSlot = 1;
  $scope.changeGameSlot = function (slot) {
    $scope.gameSlot = slot;
  };
  $scope.leaders = leaderService;
  $scope.modalButtons = [
    {
      name          : "Changelog",
      icon          : "glyphicon glyphicon-globe font-9pt font-color-lightblue",
      templateUrl   : "changelogView.html",
      controller    : "ChangelogController",
      isActive      : true,
      disabledReason: "",
      windowClass   : "",
    },
    {
      name          : "Governance",
      icon          : "glyphicon glyphicon-flag",
      templateUrl   : "internalAffairsView.html",
      controller    : "CountryController",
      isActive      : true,
      disabledReason: "",
      windowClass   : "",
    },
    {
      name          : "Structures",
      icon          : "fas fa-university",
      templateUrl   : "structureView.html",
      controller    : "StructureController",
      isActive      : true,
      disabledReason: "",
      windowClass   : "",
    },
    {
      name          : "Military",
      icon          : "glyphicon glyphicon-screenshot",
      templateUrl   : "militaryView.html",
      controller    : "MilitaryController",
      isActive      : true,
      disabledReason: "",
      windowClass   : "full",
    },
    {
      name          : "Research",
      icon          : "fas fa-flask",
      templateUrl   : "researchView.html",
      controller    : "ResearchController",
      isActive      : true,
      disabledReason: "",
      windowClass   : "full",
    },
    {
      name          : "War",
      icon          : "fas fa-fire",
      templateUrl   : "warView.html",
      controller    : "WarController",
      isActive      : false,
      disabledReason: "You are not currently at war with anyone.",
      windowClass   : "",
    },
    {
      name          : "Charts",
      icon          : "fas fa-chart-line",
      templateUrl   : "chartsView.html",
      controller    : "ChartsController",
      isActive      : true,
      disabledReason: "343553",
      windowClass   : "full",
    },
  ];
  const game = this;
  const initGame = function () {

    game.myCountry = playerService;
    game.worldCountries = worldCountryService;
    game.bonuses = bonusesService;
    game.advisors = advisorsService;
    game.ministers = ministerService;
    game.helperModals = helperModalsService;
    game.notification = notificationService;
    game.debug = debugService;
  };
  const saveGame = function () {
    saveService.save($scope.gameSlot);
  };
  const resetGame = function () {
    $interval.cancel(saveTimer);
    saveService.reset($scope.gameSlot);
    $scope.gameLoading = true;
    $scope.startScreen = true;
    $scope.getLocalStorageData();
  };

  // #region Private Methods
  const timerfunction = function () {
    // TODO: Put logic here to prompt user of game ending/death due to 0 population.
    game.bonuses.update(game);
    game.myCountry.military.updateQueue();
    game.myCountry.getGameTime();
    game.myCountry.getNewConsumption();
    game.myCountry.getNewEconomics();
    game.myCountry.getNewDemographics();
    game.myCountry.baseStats.upkeep = 0;
    game.myCountry.buildings.getTotalUpkeep();
    game.myCountry.research.update();
    game.myCountry.laws.update();
    game.myCountry.ministers.update();
    game.worldCountries.update();
    warService.doBattle();
    chartsService.update();

    // Game.advisors.functions.advisorTimedEffects();
    // game.saveGame();
  };

  // #endregion
  $scope.startGame = function (loadSave, saveSlot) {
    leaderService.choose();
    initService().then(() => {
      if (loadSave) {
        saveService.load(saveSlot);
        $scope.gameSlot = saveSlot;
      }

      $scope.createMap();
      game.worldCountries.update();// Necessary to load the map colors.
      chartsService.update();
      initGame();

      // Begin auto saving
      saveTimer = $interval(saveGame, 1000);
    });
    $scope.gameLoading = false;
  };

  // Init some values so there are no errors
  initService().then(() => {
    initGame();
  });

  game.saveGame = function () {
    saveGame();
  };
  game.resetGame = function () {
    resetGame();
  };

  // Next turn button
  game.nextTurn = function () {
    timerfunction();
    game.myCountry.baseStats.currentTurn += 1;
  };

  $scope.createMap = function () {
    $(".jvectormap-container").remove();// Remove previous map, used when resetting the game so we don't have to refresh.
    // TODO: Might want to add some loading screen/hide map and show leader creation page etc.
    const map = new jvm.Map({
      container        : $("#world-map"),
      map              : "world_mill_en",
      backgroundColor  : "#a5bfdd",
      borderColor      : "#818181",
      borderOpacity    : 0.25,
      borderWidth      : 1,
      color            : "#f4f3f0",
      regionsSelectable: true,
      zoomButtons      : false,
      zoomMin          : 0.9,
      focusOn          : {
        x    : 0.5,
        y    : 0.5,
        scale: 0.9,
      },
      series: {
        regions: [
          {
            values           : worldCountryService.allCountriesColors,
            scale            : [ "#C8EEFF", "#0071A4" ],
            normalizeFunction: "polynomial",
          },
          {
            values           : worldCountryService.conqueredCountriesColors,
            scale            : ["#008000"],
            normalizeFunction: "linear",
          },
          {
            values           : worldCountryService.countriesColorsAtWar,
            scale            : [ "#FF0000", "#990000" ],
            normalizeFunction: "polynomial",
          },
        ],
      },
      onRegionTipShow (e, el, code) {
        const country = $filter("niceNumber")(worldCountryService.getCountryStrength(code));

        el.html(`${el.html()} (Strength - ${country})`);
      },
      onRegionClick (e, code) {
        e.preventDefault();

        // Check if an array of objects contains a property with a value of the code we passed in.
        const controlledCountry = playerService.conqueredCountries.map(e => e.countryCode).indexOf(code);
        const countryOnWar = warService.isCountryAtWar(code);

        // Might open modal with options to attack if we are already at war.
        if (controlledCountry !== -1 || countryOnWar !== -1) {
          console.log("You are already at war or you control that country");

          return;// If we currently control that country or are already at war, do nothing
        }

        /* TODO: In the future we might want to open different modal, giving us some information of our own country etc.*/
        openAttackConfirmation(code);
      },
    });

    worldCountryService.update = function () {
      // The order matters as it overwrites the others in case they are in 2 categories
      // TODO: Add if statement to check the state of what we want to display, for example if state === "troops" then we update a map based on troops strength.
      map.series.regions[0].params.min = undefined;
      map.series.regions[0].params.max = undefined;
      map.series.regions[0].setValues(worldCountryService.allCountriesColors);
      map.series.regions[1].params.min = undefined;
      map.series.regions[1].params.max = undefined;
      map.series.regions[1].setValues(worldCountryService.conqueredCountriesColors);
      map.series.regions[2].params.min = undefined;
      map.series.regions[2].params.max = undefined;
      map.series.regions[2].setValues(worldCountryService.countriesColorsAtWar);
    };
  };

  let openAttackConfirmation = function (code) {

    const modalInstance = modalService.open({
      templateUrl: "warConfirmationModal.html",
      controller : "warConfirmationModalController",
      size       : "sm",
      resolve    : {
        countryAttacked () {
          return code;
        },
      },
    });

    modalInstance.result.then(() => {
      // TODO: Set up first battle phase here using warService.init(attacker,defender)
      warService.declareWar(code);
      worldCountryService.update();
    }, () => {
      $log.info(`Modal dismissed at: ${new Date()}`);
    });
  };

  $scope.openModal = function (modalIndex) {
    const templateUrl = $scope.modalButtons[modalIndex].templateUrl;
    const controller = $scope.modalButtons[modalIndex].controller;
    const modalInstance = modalService.open({
      templateUrl,
      controller,
      size       : "lg",
      windowClass: $scope.modalButtons[modalIndex].windowClass,
    });

    // This will close a modal on right click and also prevent context menu from appearing.
    window.oncontextmenu = function () {
      modalInstance.close("ok");

      return false;// Cancel default context menu
    };

    modalInstance.result.then(() => {
      window.oncontextmenu = function () {
        return true;
      };
    }, () => {
      $log.info(`Modal dismissed at: ${new Date()}`);

    });
  };
  $scope.expandStatRow = function () {
    $scope.expandStats = !$scope.expandStats;
  };
  $scope.simulateAmount = 10;
  $scope.changeSimulatedTurns = function (val) {
    $scope.simulateAmount += val;
    if ($scope.simulateAmount < 10) $scope.simulateAmount = 10;

  };
  $scope.simulateTurns = function () {
    chartsService.changeHistoryLength($scope.simulateAmount);
    for (let i = 0; i < $scope.simulateAmount; i++) {
      debugService.simulateTurn();
      game.nextTurn();
    }
  };

  // Making sure interval is cancelled on destroy
  $scope.$on(
    "$destroy",
    (event) => {
      // $interval.cancel(playTimer)
      $interval.cancel(saveTimer);
    },
  );
});
