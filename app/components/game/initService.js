wciApp.factory(
    'initService',
    function (playerService,
              buildingsService,
              militaryService,
              worldCountryService,
              lawsService,
              advisorsService,
              researchService,
              bonusesService,
              gameDataService,
              ministerService,
              warService,
              $q) {
        let sheets = ["Buildings", "Units", "ResearchData", "ResearchBonuses", "Laws", "WorldCountries", "Ministers"];

        let init = function () {
            console.log("INIT");
            return $q(function (resolve) {
                let data = getDataFromExcel($q, sheets, null);
                data.then(function (excelObject) {
                    //we return value which is an object of our sheets, we can access them like value.Buildings.
                    //pass data to gameDataService before initializing any other service
                    gameDataService.init(excelObject);//This is important, it stores all game data, so other services can use it.
                    warService.init();
                    myCountryInit();
                    buildingInit();
                    militaryInit();
                    researchInit();
                    ministersInit();
                    lawsInit();
                    bonusesServiceInit();
                    worldCountriesInit();
                    resolve(excelObject);
                });
            })
        };

        let myCountryInit = function() {
            playerService.init();
        };
        let bonusesServiceInit = function() {
            bonusesService.init();
        };
        let buildingInit = function () {
            playerService.buildings = new buildingsService();
            playerService.buildings.init();
        };
        let militaryInit = function () {
            playerService.military = new militaryService();
            playerService.military.init();
        };
        let researchInit = function () {
            playerService.research = new researchService();
            playerService.research.init();
        };
        let lawsInit = function () {
            playerService.laws = new lawsService();
            playerService.laws.init();
        };
        let worldCountriesInit = function (countriesArray) {
            worldCountryService.init(countriesArray);
        };
        let ministersInit = function () {
            ministerService.init();
        };

        return init;
    }
);