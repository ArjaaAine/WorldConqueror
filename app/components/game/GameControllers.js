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
	$scope.currentWindowText = "Starting Screen";
	$scope.viewActive = true;
	$scope.expandStats = true;

	// #region Debug variables.
	$scope.hideDebug = true;
	$scope.isTesting = true;

	// #endregion

	$scope.toggleStartScreen = function () {
		$scope.startScreen = !$scope.startScreen;
	};
	$scope.goBack = function () {
		// TODO: Might need to create an array or an object to store possible routes, so going back will be easier.
		if (!$scope.startScreen) $scope.toggleStartScreen();
	};

	$scope.saveData = [];
	$scope.getLocalStorageData = function () {
		$scope.saveData = [];
		for (let i = 0; i < 4; i++) {
			const save = angular.fromJson(localStorage.getItem(`gameData_${i}`));

			$scope.saveData.push(save);
		}
	};
	$scope.getLocalStorageData();
	$scope.gameSlot = 1;
	$scope.changeGameSlot = function (slot) {
		$scope.gameSlot = slot;
	};
	$scope.leaders = leaderService;
	$scope.modalButtons = [];
	$scope.currentView = "app/components/structure/buildingsView.html";
	$scope.initGameModals = function () {
		$scope.modalButtons = [
			{
				name          : "Governance",
				icon          : "fas fa-gavel",
				templateUrl   : "app/components/government/internalAffairsView.html",
				controller    : "CountryController",
				isActive      : true,
				disabledReason: "",
				clickCallback : $scope.changeView,
				closeCallback : ministerService.dispose,
			},
			{
				name          : "Structures",
				icon          : "fas fa-university",
				templateUrl   : "app/components/structure/buildingsView.html",
				controller    : "StructureController",
				isActive      : true,
				clickCallback : $scope.changeView,
				disabledReason: "",
			},
			{
				name          : "Military",
				icon          : "fas fa-warehouse",
				templateUrl   : "app/components/military/militaryView.html",
				controller    : "MilitaryController",
				isActive      : true,
				clickCallback : $scope.changeView,
				disabledReason: "",
			},
			{
				name          : "Research",
				icon          : "fas fa-university",
				templateUrl   : "app/components/research/researchView.html",
				controller    : "ResearchController",
				isActive      : true,
				clickCallback : $scope.changeView,
				disabledReason: "",
			},
			{
				name          : "War",
				icon          : "fas fa-fire",
				templateUrl   : "app/components/war/warView.html",
				controller    : "WarController",
				isActive      : true,
				clickCallback : $scope.changeView,
				disabledReason: "You are not currently at war with anyone.",
			},
			{
				name          : "Charts",
				icon          : "fas fa-chart-line",
				templateUrl   : "chartsView.html",
				controller    : "ChartsController",
				isActive      : true,
				clickCallback : $scope.openModal,
				disabledReason: "",
			},
			{
				name          : "Changelog",
				icon          : "fas fa-globe",
				templateUrl   : "app/components/changelog/changelogView.html",
				controller    : "ChangelogController",
				isActive      : true,
				clickCallback : $scope.changeView,
				disabledReason: "",
			},
		];
	};
	$scope.changeView = function (index) {
		$scope.currentView = $scope.modalButtons[index].templateUrl;
		$scope.viewActive = true;
	};
	const initGame = function () {

		$scope.player = playerService;
		$scope.worldCountries = worldCountryService;
		$scope.bonuses = bonusesService;
		$scope.advisors = advisorsService;
		$scope.ministers = ministerService;
		$scope.helperModals = helperModalsService;
		$scope.notification = notificationService;
		$scope.debug = debugService;
		$scope.initGameModals();
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
	$scope.totalUpkeep = function () {
		// Calculate upkeep
		const total = militaryService.playerMilitary.getTotalUpkeep() + advisorsService.getTotalUpkeep() + buildingsService.getTotalUpkeep();

		playerService.baseStats.totalUpkeep = total;

		return total;// Can use loop instead...
	};
	$scope.moneyGrowth = function () {
		return playerService.income() - $scope.totalUpkeep();
	};
	$scope.getNewEconomics = function () {
		playerService.baseStats.money += $scope.moneyGrowth();

		// Set the money to a minimum of 0. Once Lending is implemented, then it will be possible for the worldCountry to go negative.
		if (playerService.baseStats.money < 0) playerService.baseStats.money = 0;
	};
	const timerfunction = function () {
		// // TODO: Put logic here to prompt user of game ending/death due to 0 population.
		bonusesService.update();
		playerService.military.update();// TODO: FIx it if possible, don't store service in player object...
		playerService.getGameTime();
		playerService.getNewConsumption();
		$scope.getNewEconomics();
		playerService.getNewDemographics();
		researchService.update();
		lawsService.update();
		ministerService.update();
		playerService.baseStats.influence = ministerService.getInfluence();
		worldCountryService.update();
		worldCountryService.updateLogic();
		warService.update();
		chartsService.update();

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
			worldCountryService.update();// Necessary to load the map colors.
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

		// This is just so I dont have to click the save everytime I refresh.
		if ($scope.isTesting) {
			leaderService.choose();
			initService().then(() => {
				saveService.load(0);
				$scope.gameSlot = 0;
				$scope.createMap();
				worldCountryService.update();// Necessary to load the map colors.
				chartsService.update();
				initGame();

				// Begin auto saving
				saveTimer = $interval(saveGame, 1000);
			});
			$scope.gameLoading = false;
		}
	});

	// Next turn button
	$scope.nextTurn = function () {
		/* TODO: $$$$ PERFORMANCE CHECK START $$$$ */
		// const startTime = performance.now();

		timerfunction();
		playerService.baseStats.currentTurn += 1;

		/* TODO:  $$$$ PERFORMANCE CHECK END $$$$ */
		// const duration = performance.now() - startTime;
		// console.log(`This action took ${duration}ms`);
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
			onRegionTipShow (e, el, countryCode) {
				const country = $filter("niceNumber")(worldCountryService.getCountryStrength(countryCode));

				el.html(`${el.html()} (Strength - ${country})`);
			},
			onRegionClick (e, countryCode) {
				e.preventDefault();

				// Check if an array of objects contains a property with a value of the code we passed in.
				const controlledCountry = playerService.conqueredCountries.map(e => e.countryCode).indexOf(countryCode);
				const countryOnWar = worldCountryService.allCountriesRulers[countryCode].isAtWar;

				// Might open modal with options to attack if we are already at war.
				if (controlledCountry !== -1 || countryOnWar !== false) {
					console.log("You are already at war or you control that country");

					return;// If we currently control that country or are already at war, do nothing
				}

				/* TODO: In the future we might want to open different modal, giving us some information of our own country etc.*/
				openAttackConfirmation(countryCode);
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

	let openAttackConfirmation = function (countryCode) {

		const modalInstance = modalService.open({
			templateUrl: "warConfirmationModal.html",
			controller : "warConfirmationModalController",
			size       : "sm",
			resolve    : {
				countryAttacked () {
					return countryCode;
				},
			},
		});

		modalInstance.result.then(() => {
			// TODO: Set up first battle phase here using warService.init(attacker,defender)
			warService.declareWar(countryCode);
			worldCountryService.update();
		}, () => {
			$log.info(`Modal dismissed at: ${new Date()}`);
		});
	};

	$scope.openModal = function (modalIndex) {
		const templateUrl = $scope.modalButtons[modalIndex].templateUrl;
		const controller = $scope.modalButtons[modalIndex].controller;
		const closeCallback = $scope.modalButtons[modalIndex].closeCallback;
		const modalInstance = modalService.open({
			templateUrl,
			controller,
			size: "xl",
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
			if (closeCallback) closeCallback.call(ministerService);
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
			$scope.nextTurn();
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
