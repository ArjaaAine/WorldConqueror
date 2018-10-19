'use strict';

wciApp.factory(
    'buildingsService',
    function
        (
            playerService,
            bonusesService,
            gameDataService //GameDataService stores object of objects with base values(constants), so we use them inside methods to calculate actual values based on count/research/bonuses etc.
        ) {

        let Structure = function (structure) {
            $.extend(this, structure);
            this.ID = structure.name;
        };

        //TODO: The reason we don't assign this data to the object is to prevent from saving it, we might use a private variable inside this service tho...
        //TODO: This service will be created for each country, so maybe it's good to use this method, so we dont copy this data for each country...

        Structure.prototype.getUpkeep = function () {
            let upkeepBonus = bonusesService.researchBonuses.buildUpkeepMultiplier || 1;
            return this.upkeep * upkeepBonus;
        };
        Structure.prototype.build = function (count) {
            let cost = this.cost * count;
            let landCost = this.getLandCost() * count;
            if ((playerService.baseStats.money >= cost) && this.isUnlocked &&
                playerService.baseStats.land >= landCost) {
                playerService.baseStats[this.statAffected] *= Math.pow((this.statMultiplier * this.countMultiplier), count);
                playerService.baseStats[this.statAffected] += (this.statAdder * count);
                playerService.baseStats.totalJobs += (this.jobsIncreased * count);
                playerService.baseStats.money -= cost;
                playerService.baseStats.land -= landCost;
                this.count = this.count * 1 + count; //*1 to force math add and not string add.
            }
        };

        Structure.prototype.getLandCost = function () {
            //TODO: Also update currently built structures landCost. This might be a bit tricky tho...
            let bonusCost = bonusesService.researchBonuses.landCostAdder || 0;
            let cost = this.landCost - bonusCost;
            if (cost <= 1) return 1;
            return cost;
        };

        Structure.prototype.isVisible = function () {
            return this.isUnlocked;
        };
        //TODO: Consider actually using a private variable to store structureData instead of calling a function everywhere.
        //TODO: Private, so it's not stored/shared outside of this scope, so we dont accidentally save this data to the player.
        //TODO: This will keep save files small and we can go even further and make them even smaller by saving only necessary info.

        //TODO: Might seem pointless at first, but it helps keep things organized and allows to add formulas and include bonuses before returning those values.
        Structure.prototype.getMultiplier = function () {
            return this.statMultiplier;
        };
        Structure.prototype.getCountMultiplier = function () {
            return this.countMultiplier;
        };
        Structure.prototype.getStatMultiplier = function () {
            return this.statMultiplier;
        };
        Structure.prototype.getStatAdder = function () {
            return this.statAdder;
        };
        Structure.prototype.getJobsIncreased = function () {
            return this.jobsIncreased;
        };
        Structure.prototype.getCost = function () {
            return this.cost;
        };
        Structure.prototype.getCount = function () {
            return this.count;
        };
        Structure.prototype.cantAfford = function (count) {
            if (playerService.baseStats.money >= this.cost * count && playerService.baseStats.land >= this.getLandCost() * count) {
                return false;
            }
            return true;
        };
        //TODO: Create get/set methods for all properties that might change, such as this.getCost, so we don't repeat same code everywhere, accessing gameDataService.Buildings[index] everytime
        //store all buildings by type/tab
        let Buildings = function () {
            this.countToBuy = 1;
            this.structures = [];
        };

        //TODO: All methods below are basically the same, need to use an universal method for them instead.
        Buildings.prototype.init = function () {
            let buildingsArray = gameDataService.Buildings;
            this.structures = [];
            for (let j = 0; j < buildingsArray.length; j++) {
                let structureObj = {};
                structureObj.count = buildingsArray[j].count || 0;
                structureObj.isUnlocked = buildingsArray[j].isUnlocked || false;
                structureObj.ID = buildingsArray[j].name;
                structureObj.name = buildingsArray[j].name;
                structureObj.upkeep = buildingsArray[j].upkeep;
                structureObj.cost = buildingsArray[j].cost;
                structureObj.statAffected = buildingsArray[j].statAffected;
                structureObj.statMultiplier = buildingsArray[j].statMultiplier;
                structureObj.statAdder = buildingsArray[j].statAdder;
                structureObj.countMultiplier = buildingsArray[j].countMultiplier;
                structureObj.jobsIncreased = buildingsArray[j].jobsIncreased;
                structureObj.image = buildingsArray[j].image;
                structureObj.landCost = buildingsArray[j].landCost;
                this.structures.push(new Structure(structureObj));//we create a new object, and we pass some basic values which we need to save/load.
            }
        };

        Buildings.prototype.getTotalUpkeep = function () {
            let upkeep = 0;
            //TODO: Might want to return 0 if structureCount is 0, so we avoid unnecessary calculations
            for (let i = 0; i < this.structures.length; i++) {
                upkeep += this.structures[i].getUpkeep() * this.structures[i].count;
            }
            playerService.baseStats.upkeep = upkeep;
            return upkeep;
        };
        Buildings.prototype.getTotalMultiplier = function () {
            let multiplier = 0;
            for (let i = 0; i < this.structures.length; i++) {
                let structureMultiplier = this.structures[i].getMultiplier();
                multiplier += (structureMultiplier - 1) * this.structures[i].count;
            }
            //TODO: Formatting a number should be done in html using filters...
            return Math.floor(multiplier * 100) + "%";
        };


        return Buildings;
    });