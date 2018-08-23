wciApp.factory(
    'saveService',
    function (playerService,
              buildingsService,
              militaryService,
              worldCountryService,
              lawsService,
              advisorsService,
              researchService,
              initService,
              bonusesService,
              warService,
              $location) {

        let data = {};
        //list of services we want to save/load
        /*TODO: Save only myCountry as it stores all data including research...*/
        let servicesToSave = {
            playerService: playerService,
            // bonusesService: bonusesService,
            // buildingsService: buildingsService,
            // militaryService: militaryService,
            // worldCountryService: worldCountryService,
            // lawsService: lawsService,
            // advisorsService: advisorsService,
            // researchService: researchService
        };
        data.newGame = function () {
            //initialize all data
            initService();//This is a promise, we might want to stop auto save before running it.
        };
        data.save = function () {
            console.log("SAVE");
            //TODO: Broken, cyclic object value error.
            //TODO: Redesign save/load to only save necessary data as a string, instead of full objects...Ex. Unit.ID = 10 -> 10 units of this type.
            let saveData = {};//all data to save.
            let military = playerService.military;
            let research = playerService.research;
            let laws = playerService.laws.activeLaws;
            let lawsUnlocked = playerService.laws.unlockedLaws;
            let buildings = playerService.buildings;
            let onWar = warService.countriesAtWar;
            let onWarColors = worldCountryService.countriesColorsAtWar;

            //Save only necessary data
            // buildings.forEach(function (structure) {
            //    let obj = {};
            //    obj.count = structure.count;
            //    obj.unlocked = structure.isUnlocked;
            //    structuresToSave.push(obj);
            // });
            saveData.military = military;
            saveData.research = research;
            saveData.laws = laws;
            saveData.lawsUnlocked = lawsUnlocked;
            saveData.buildings = buildings;
            saveData.baseStats = playerService.baseStats;
            saveData.onWar = onWar;
            saveData.onWarColors = onWarColors;

            localStorage['gameData1'] = angular.toJson(saveData);
        };
        data.load = function () {
            console.log("LOAD");
            let savedData = angular.fromJson(localStorage['gameData1']);
            if(!savedData) return;
            let military = playerService.military;
            let research = playerService.research;
            let laws = playerService.laws.activeLaws;
            let lawsUnlocked = playerService.laws.unlockedLaws;
            let buildings = playerService.buildings;
            let baseStats = playerService.baseStats;
            let onWar = warService.countriesAtWar;
            let onWarColors = worldCountryService.countriesColorsAtWar;


            //depreciated, but works :]
            angular.merge(military, savedData.military);
            angular.merge(research, savedData.research);
            angular.merge(laws, savedData.laws);
            angular.merge(lawsUnlocked, savedData.lawsUnlocked);
            angular.merge(buildings, savedData.buildings);
            angular.merge(baseStats, savedData.baseStats);
            angular.merge(onWar, savedData.onWar);
            angular.merge(onWarColors, savedData.onWarColors);
            //TODO: Check if saved data exist before merging, also remember to init data before merging(init is like a reset)
            //TODO: Removing data from excel does not remove it from a save. Fix: Remove properties from save file that does not exist in game anymore.
            //TODO: UP, might be a problem with arrays(of buildings/units etc), we might consider using objects only.
        };
        //Separated from "newGame" in order to give us an ability to do other stuff which applies only when resetting
        data.reset = function () {
            //When player resets a game, it will change current view to the base one
            //TODO: Main reason for that is to fix a bug with active tab on buildings
            //TODO: When resetting a game, for some reason active tab is not set until you change route(?)
            //TODO: So your building list is not displayed.
            $location.path("/");
            data.newGame();
        };
        return data;
    }
);