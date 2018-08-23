'use strict';

wciApp.controller(
    'GameController',
    function (
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
        worldCountryService,
        saveService,
        initService,
        debugService,
        bonusesService,
        warService
        ) {
        let game = this;
        let initGame = function() {
            game.data = {};
            initService().then(function(){
                saveService.load();
            });
            game.myCountry = playerService;
            game.worldCountries = worldCountryService;
            game.bonuses = bonusesService;
            game.advisors = advisorsService;
            game.helperModals = helperModalsService;
            game.notification = notificationService;
            game.debug = debugService;
        };
        //#region Private Methods
        let timerfunction = function () {
            //TODO: Put logic here to prompt user of game ending/death due to 0 population.
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
            game.worldCountries.update();
            warService.doBattle();
            //game.advisors.functions.advisorTimedEffects();
            //game.saveGame();
        };
        let saveGame = function () {
            saveService.save();
            localStorage['gameData'] = JSON.stringify(game.data);
        };
        let resetGame = function () {
            game.data = {
                init: {
                    isFirstTime: true
                },
                paused: false,
                speed: 1000
            };
            //TODO: The extend functions don't attach themselves on reset. Fix
            game.myCountry.init();
            saveService.reset();
            game.advisors.functions.resetData();
            localStorage.clear();
        };
        //#endregion

        //#region Default Values



        //Load Game's Settings
        if (!localStorage['gameData']) {
            game.data = {
                init: {
                    isFirstTime: false
                },
                paused: false,
                speed: 1000
            };
        }
        else {
            game.data = JSON.parse(localStorage['gameData']);
        }
        game.version = '0.0.1';
        game.validation = {
            initCountryName: true,
            initCountryTitle: true
        };
        //#endregion

        //#region Page Load

        //#endregion

        //#region Click Events
        game.startGame = function () {
            if (game.myCountry.baseStats.countryName.length > 0 &&
                game.myCountry.baseStats.leaderName.length > 0) {
                game.validation.initCountryName = true;
                game.validation.initLeaderName = true;
                game.data.init.isFirstTime = false;

            } else {
                if (game.myCountry.baseStats.countryName.length < 1) {
                    game.validation.initCountryName = false;
                }

                if (game.myCountry.baseStats.leaderName.length < 1) {
                    game.validation.initLeaderName = false;
                }
            }
        };
        game.saveGame = function () {
            saveGame();
        };
        game.resetGame = function () {
            resetGame();
        };
        //#endregion

        initGame();
        let saveTimer = $interval(saveGame, 1000);

        //next turn button
        game.nextTurn = function(){
            timerfunction();
            game.myCountry.baseStats.currentTurn += 1;
        };
        //Making sure interval is cancelled on destroy
        $scope.$on(
            "$destroy",
            function (event) {
                // $interval.cancel(playTimer)
                $interval.cancel(saveTimer)
            }
        );
    });
