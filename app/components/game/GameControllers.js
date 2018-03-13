﻿'use strict';

wciApp.controller(
    'GameController',
    function (
        $scope,
        $interval,
        myCountryData,
        buildingsData,
        militaryData,
        worldCountryData,
        lawsData,
        advisorsData,
        helperModalsData,
        notificationData,
        saveService,
        initService
        ) {
        $scope.currentTurn = 0;
        //#region Private Methods
        var timerfunction = function () {
            //TODO: Put logic here to prompt user of game ending/death due to 0 population.
            game.myCountry.functions.getGameTime();
            game.myCountry.functions.getNewConsumption();
            game.myCountry.functions.getNewEconomics();
            game.myCountry.functions.getNewDemographics();

            game.laws.functions.updateActiveFor();

            game.myCountry.baseStats.upkeep = 0;
            game.buildings.getTotalUpkeep();
            game.military.functions.militaryTimedEffects();
            //game.advisors.functions.advisorTimedEffects();
            //game.saveGame();
        };
        var saveGame = function () {
            saveService.save();
            localStorage['gameData'] = JSON.stringify(game.data);
        };
        var resetGame = function () {
            game.data = {
                init: {
                    isFirstTime: true
                },
                paused: false,
                speed: 1000
            };
            //TODO: The extend functions don't attach themselves on reset. Fix
            game.myCountry.functions.resetStats();
            saveService.reset();
            game.advisors.functions.resetData();
            game.worldCountries.functions.resetData();
            game.laws.functions.resetData();
            localStorage.clear();
        };
        //#endregion

        //#region Default Values
        var game = this;
        game.data = {};
        game.myCountry = myCountryData;
        initService().then(function(){
            saveService.load();
        });
        game.buildings = buildingsData;
        game.advisors = advisorsData;
        game.military = militaryData;
        game.worldCountries = worldCountryData;
        game.laws = lawsData;
        game.helperModals = helperModalsData;
        game.notification = notificationData;

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

        var saveTimer = $interval(saveGame, 1000);
        //#region Automated Functions
        // if (!game.data.paused) {
        //     var playTimer = $interval(timerfunction, game.data.speed);
        // }
        //
        // game.pauseGame = function () {
        //     game.data.paused = !game.data.paused;
        //     if (!game.data.paused) {
        //         playTimer = $interval(timerfunction, game.data.speed);
        //     }
        //     else {
        //         $interval.cancel(playTimer)
        //     }
        // };
        // game.adjustGameSpeed = function (speed) {
        //     game.data.speed = (1000 / speed);
        //     game.data.paused = false;
        //     $interval.cancel(playTimer);
        //     playTimer = $interval(timerfunction, game.data.speed);
        //
        // };

        //next turn button
        game.nextTurn = function(){
            timerfunction();
            $scope.currentTurn += 1;
        };
        //#endregion

        //Making sure interval is cancelled on destroy
        $scope.$on(
            "$destroy",
            function (event) {
                // $interval.cancel(playTimer)
                $interval.cancel(saveTimer)
            }
        );
    });