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
        ministerService,
        worldCountryService,
        saveService,
        initService,
        debugService,
        bonusesService,
        warService,
        $filter,
        modalService,
        $log
        ) {

        $scope.modalButtons = [
            {name: "Changelog", icon: "glyphicon glyphicon-globe font-9pt font-color-lightblue", templateUrl: 'changelogView.html', controller: 'ChangelogController'},
            {name: "Governance", icon: "glyphicon glyphicon-flag", templateUrl: 'internalAffairsView.html', controller: 'CountryController'},
            {name: "Structures", icon: "fa fa-institution", templateUrl: 'structureView.html', controller: 'StructureController'},
            {name: "Military", icon: "glyphicon glyphicon-screenshot", templateUrl: 'militaryView.html', controller: 'MilitaryController',},
            {name: "Research", icon: "fa fa-flask", templateUrl: 'researchView.html', controller: 'ResearchController',},
            {name: "War", icon: "fa fa-fire", templateUrl: 'warView.html', controller: 'WarController',},
            {name: "Charts", icon: "fa fa-line-chart", templateUrl: 'chartsView.html', controller: 'ChartsController',}
            ];
        let game = this;
        let initGame = function() {
            game.data = {};
            initService().then(function(){
                saveService.load();
                game.worldCountries.update();//Necessary to load the map colors.
            });
            game.myCountry = playerService;
            game.worldCountries = worldCountryService;
            game.bonuses = bonusesService;
            game.advisors = advisorsService;
            game.ministers = ministerService;
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


        //next turn button
        game.nextTurn = function(){
            timerfunction();
            game.myCountry.baseStats.currentTurn += 1;
        };

        let map = new jvm.Map({
            container: $('#world-map'),
            map: 'world_mill_en',
            regionsSelectable: true,
            series: {
                regions: [
                    {
                        values: worldCountryService.allCountriesColors,
                        scale: ["#C8EEFF", "#0071A4"],
                        normalizeFunction: 'polynomial'
                    },
                    {
                        values: worldCountryService.conqueredCountriesColors,
                        scale: ["#008000"],
                        normalizeFunction: 'linear'
                    },
                    {
                        values: worldCountryService.countriesColorsAtWar,
                        scale: ["#FF0000", "#990000"],
                        normalizeFunction: 'polynomial'
                    }]
            },
            onRegionTipShow: function (e, el, code) {
                let country = $filter('niceNumber')(worldCountryService.getCountryStrength(code));
                el.html(el.html() + ' (Strength - ' + country + ')');
                console.log(worldCountryService);
            },
            onRegionClick: function (e, code) {
                e.preventDefault();
                //check if an array of objects contains a property with a value of the code we passed in.
                let controlledCountry = playerService.conqueredCountries.map(function(e) {
                    return e.countryCode;
                }).indexOf(code);
                let countryOnWar = warService.isCountryAtWar(code);

                //Might open modal with options to attack if we are already at war.
                if (controlledCountry !== -1 || countryOnWar !== -1) {
                    console.log("You are already at war or you control that country");
                    return;//if we currently control that country or are already at war, do nothing
                }
                /*TODO: In the future we might want to open different modal, giving us some information of our own country etc.*/
                openAttackConfirmation(code);
            }
        });
        worldCountryService.update = function () {
            //The order matters as it overwrites the others in case they are in 2 categories
            //TODO: Add if statement to check the state of what we want to display, for example if state === "troops" then we update a map based on troops strength.
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
        let openAttackConfirmation = function (code) {

            let modalInstance = modalService.open({
                templateUrl: 'warConfirmationModal.html',
                controller: 'warConfirmationModalController',
                size: 'lg',
                resolve: {
                    countryAttacked: function () {
                        return code;
                    }
                }
            });
            modalInstance.result.then(function () {
                //TODO: Set up first battle phase here using warService.init(attacker,defender)
                warService.declareWar(code);
                worldCountryService.update();
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        initGame();
        let saveTimer = $interval(saveGame, 1000);


        $scope.openModal = function (modalIndex) {
            let templateUrl = $scope.modalButtons[modalIndex].templateUrl;
            let controller = $scope.modalButtons[modalIndex].controller;
            let modalInstance = modalService.open({
                templateUrl: templateUrl,
                controller: controller,
                windowClass: "full row",
            });

            //this will close a modal on right click and also prevent context menu from appearing.
            window.oncontextmenu = function() {
                modalInstance.close('ok');
                return false;//cancel default context menu
            };

            modalInstance.result.then(function() {
                window.oncontextmenu = function () {
                    return true;
                }
            }, function() {
                $log.info('Modal dismissed at: ' + new Date());

            });
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
