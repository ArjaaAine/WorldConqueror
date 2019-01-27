"use strict";
// eslint-disable-next-line
wciApp.factory("saveService", function
(
  playerService,
  buildingsService,
  militaryService,
  worldCountryService,
  lawsService,
  advisorsService,
  researchService,
  ministerService,
  initService,
  bonusesService,
  warService,
  leaderService,
  $location,
) {

  const data = {};

  data.save = function (saveSlot) {
    console.log("SAVE");

    // TODO: Broken, cyclic object value error.
    // TODO: Redesign save/load to only save necessary data as a string, instead of full objects...Ex. Unit.ID = 10 -> 10 units of this type.
    const saveData = {};// All data to save.
    const military = playerService.military;
    const research = playerService.research;
    const ministers = playerService.ministers;

    let laws = playerService.laws.activeLaws;
    let lawsUnlocked = playerService.laws.unlockedLaws;
    const buildings = playerService.buildings;
    // const onWar = warService.currentlyAtWar; // FIX THIS
    const onWarColors = worldCountryService.countriesColorsAtWar;

    // Save only necessary data
    // buildings.forEach(function (structure) {
    //    let obj = {};
    //    obj.count = structure.count;
    //    obj.unlocked = structure.isUnlocked;
    //    structuresToSave.push(obj);
    // });
    saveData.military = military;
    saveData.research = research;

    saveData.ministers = ministers;

    saveData.laws = laws;
    saveData.lawsUnlocked = lawsUnlocked;
    saveData.buildings = buildings;
    saveData.baseStats = playerService.baseStats;
    // saveData.onWar = onWar;
    saveData.onWarColors = onWarColors;
    saveData.leaders = leaderService;

    localStorage[`gameData_${saveSlot}`] = angular.toJson(saveData);
  };
  data.load = function (saveSlot) {
    console.log("LOAD");
    const savedData = angular.fromJson(localStorage[`gameData_${saveSlot}`]);

    if (!savedData) return;
    const military = playerService.military;
    const research = playerService.research;
    const ministers = playerService.ministers;

    let laws = playerService.laws.activeLaws;
    let lawsUnlocked = playerService.laws.unlockedLaws;
    const buildings = playerService.buildings;
    const baseStats = playerService.baseStats;
    // const onWar = warService.currentlyAtWar;
    const onWarColors = worldCountryService.countriesColorsAtWar;

    const leaders = leaderService;
    // Depreciated, but works :]
    angular.merge(military, savedData.military);
    angular.merge(research, savedData.research);

    angular.merge(ministers, savedData.ministers);

    angular.merge(laws, savedData.laws);
    angular.merge(lawsUnlocked, savedData.lawsUnlocked);
    angular.merge(buildings, savedData.buildings);
    angular.merge(baseStats, savedData.baseStats);
    // angular.merge(onWar, savedData.onWar);
    angular.merge(onWarColors, savedData.onWarColors);

    angular.merge(leaders, savedData.leaders);

    // TODO: Check if saved data exist before merging, also remember to init data before merging(init is like a reset)
    // TODO: Removing data from excel does not remove it from a save. Fix: Remove properties from save file that does not exist in game anymore.
    // TODO: UP, might be a problem with arrays(of buildings/units etc), we might consider using objects only.
  };

  // Separated from "newGame" in order to give us an ability to do other stuff which applies only when resetting
  data.reset = function (saveSlot) {
    if (confirm("Are you sure?")) localStorage.removeItem(`gameData_${saveSlot}`);

    /*
          When player resets a game, it will change current view to the main one("/")
          Main reason for that is to fix a bug with active tab on buildings
          When resetting a game, for some reason active tab is not set until you change route(?)
          So your building list is not displayed.
          Basically we force first screen to appear when using routing/nav bar.
          Currently not needed <-- 2018-30-August --> Mariusz
      */
    // $location.path("/");

  };

  return data;
});
