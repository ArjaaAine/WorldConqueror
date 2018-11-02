"use strict";

wciApp.factory(
  "initService",
  (
    playerService,
    buildingsService,
    militaryService,
    worldCountryService,
    lawsService,
    advisorsService,
    researchService,
    ministerService,
    bonusesService,
    gameDataService,
    warService,
    $q,
  ) => {
    // TODO: We might want to store this in an excel too to allow modding, so we don't have to edit the code in order to add new excel sheet
    const researchFileName = "ResearchData.ods";
    const researchSheets = [ "ResearchData", "ResearchBonuses", "ConstructionResearch", "WarResearch", "EconomyResearch", "ResearchDescription" ];
    const buildingsFileName = "Buildings.ods";
    const buildingsSheets = ["Buildings"];
    const governanceFileName = "Governance.ods";
    const governanceSheets = [ "Ministers", "Laws" ];
    const worldCountriesFileName = "WorldCountries.ods";
    const worldCountriesSheets = [ "WorldCountries", "CountryUnitArmyCode" ];
    const unitsFileName = "Units.ods";
    const unitsSheets = ["Units"];

    const init = function () {
      console.log("INIT");

      return $q((resolve) => {
        const researchData = getDataFromExcel($q, researchSheets, researchFileName);
        const buildingsData = getDataFromExcel($q, buildingsSheets, buildingsFileName);
        const governanceData = getDataFromExcel($q, governanceSheets, governanceFileName);
        const worldCountriesData = getDataFromExcel($q, worldCountriesSheets, worldCountriesFileName);
        const unitsData = getDataFromExcel($q, unitsSheets, unitsFileName);

        $q.all([ researchData, buildingsData, governanceData, worldCountriesData, unitsData ]).then((array) => {
          const excelObject = { ...array[0],
            ...array[1],
            ...array[2],
            ...array[3],
            ...array[4] };

          // We return value which is an object of our sheets, we can access them like value.Buildings.
          // pass data to gameDataService before initializing any other service
          gameDataService.init(excelObject);// This is important, it stores all game data, so other services can use it.
          warService.init();
          myCountryInit();
          buildingInit();
          militaryInit();
          researchInit();
          lawsInit();
          ministersInit();
          bonusesServiceInit();
          worldCountriesInit();
          resolve(excelObject);
        });
      });
    };

    const myCountryInit = function () {
      playerService.init();
    };
    const bonusesServiceInit = function () {
      bonusesService.init();
    };
    const buildingInit = function () {
      playerService.buildings = new buildingsService();
      playerService.buildings.init();
    };
    const militaryInit = function () {
      playerService.military = new militaryService();
      playerService.military.init();
    };
    const researchInit = function () {
      playerService.research = new researchService();
      playerService.research.init();
    };
    const lawsInit = function () {
      playerService.laws = new lawsService();
      playerService.laws.init();
    };
    const worldCountriesInit = function (countriesArray) {
      worldCountryService.init(countriesArray);
    };
    const ministersInit = function () {
      playerService.ministers = new ministerService();
      playerService.ministers.init();
    };

    return init;
  },
);
