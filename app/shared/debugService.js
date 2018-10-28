'use strict';

wciApp.factory(
    'debugService',
    function (playerService) {
        let Debug = function () {
            //Add boolean, and set it true/fale to hide/show debug buttons on screen.
        };

        Debug.prototype.addEachBuilding = function (val) {
            let value = val || 10;
            playerService.buildings.structures.forEach(function (structure) {
                structure.build(value);
            });
        };

        Debug.prototype.addLand = function (val) {
            let value = val || 100;
            playerService.baseStats.land += value;
        };

        Debug.prototype.addResearchPoints = function (val) {
            let value = val || 1000;
            playerService.baseStats.baseResearchPoints = value;
            playerService.research.update();
            playerService.baseStats.baseResearchPoints = 0;
        };

        Debug.prototype.stabilityChange = function (val) {
            playerService.baseStats.stability += val;
        };
        Debug.prototype.stabilityIndexChange = function (val) {
            playerService.baseStats.currentStabilityIndex += val;
        };
        Debug.prototype.addUnits = function(val) {
            let value = val || 100;
            playerService.military.unitsAtHome.forEach(function(unit){
                unit.count += value;
            })
        };
        Debug.prototype.addPopulation = function(val) {
            let value = val || 100;
            playerService.baseStats.population += value;
        };

        Debug.prototype.giveMeAll = function() {
            playerService.baseStats.money += 100000000;
            if(playerService.baseStats.money > 100000000) playerService.baseStats.money = 100000000;
            playerService.research.sciencePoints += 1000000;
            this.addLand(10000000);
            this.addEachBuilding(100);
            this.addResearchPoints(10000);
            this.addUnits(1000);
            this.addPopulation(10000000);
        };
        return new Debug();
    });
