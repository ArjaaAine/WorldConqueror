wciApp.controller('WarController', function (
    $interval,
    modalService,
    playerService,
    worldCountryService,
    warService,
    $log,
    $filter,
    $scope) {
    let war = this;
    $scope.playerService = playerService;
    $scope.warService = warService;
    war.logger = [];
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
            size: 'md',
            resolve: {
                countryAttacked: function () {
                    return code;
                }
            }
        });
        modalInstance.result.then(function () {
            let strength = worldCountryService.getCountryStrength(code);
            worldCountryService.countriesColorsAtWar[code] = strength;
            worldCountryService.update();
            //TODO: Set up first battle phase here using warService.init(attacker,defender)
            warService.declareWar(code)
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    $scope.openTroopsModal = function (index) {
        let modalInstance = modalService.open({
            templateUrl: 'warAttackModal.html',
            controller: 'warSendTroopsController',
            size: 'md',
            resolve: {
                countryAttackedIndex: function() {
                    return index;
                }
            }
        });
        modalInstance.result.then(function() {
            //Sending the troops
            console.log("Sending Troops...");
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

});
