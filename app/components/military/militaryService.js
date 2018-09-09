﻿'use strict';

wciApp.factory(
    'militaryService',
    function (
        playerService,
        gameDataService
    ) {


        // Unit.prototype.getProperty = function (name) {
        //     //This returns base value of an unit, such as Name/ID/Attack
        //     return this[name];
        // };
        // Unit.prototype.getTotalStat = function (name, unitCount) {
        //     //UnitCount is not needed
        //     let count = unitCount || this.count;
        //     return this[name] * count;
        // };
        // Unit.prototype.getStrength = function () {
        //     return this.attack + this.defense
        // };
        // Unit.prototype.getTotalStrength = function () {
        //     return this.getStrength() * this.count;
        // };
        // Unit.prototype.getTotalAttack = function () {
        //     return this.attack * this.count;
        // };
        // Unit.prototype.getTotalDefense = function () {
        //     return this.defense * this.count;
        // };
        // Unit.prototype.getUpkeep = function () {
        //     return this.upkeep * this.count;
        // };
        // Unit.prototype.isUnlocked = function () {
        //     return this.unlocked;
        // };


        //TODO: Consider using this object as a "group", and calculate total upkeep in worldCountry(playerService) service.
        //TODO: This way we can make multiple copies of this object, without having to use "this.unitsOnMission" array.
        let Military = function () {
            this.unitsAtHome = [];
            this.unitsAtWar = [];
            this.unitsHiringQueue = [];
            this.unitsSendModal = [];
            //This array of arrays might contain mixed count of different units...
            //E.x: 100Militia and 10Battle Ships.  Calculate their upkeep.
            this.totalUpkeep = 0;
            this.unitCap = 0;
        };

        Military.prototype.init = function () {
            let unitsArray = gameDataService.Units;
            this.unitsAtHome = [];//Units defending base
            this.unitsAtWar = [];//Units currently in battle
            this.unitsHiringQueue = [];//Units in hiring queue
            this.unitsSendModal = [];//Units choosen by a player before sending to War
            for (let i = 0; i < unitsArray.length; i++) {
                let unitObject = unitsArray[i];
                this.unitsAtHome[i] = {};
                this.unitsSendModal[i] = {};
                this.unitsAtHome[i].id = unitObject.id;
                this.unitsSendModal[i].id = unitObject.id;
                this.unitsAtHome[i].count = 0;
                this.unitsSendModal[i].count = 0;
                this.unitsAtHome[i].isUnlocked = unitObject.unlocked;//TODO: Currently all of them are unlocked from the start, later need to unlock manually with research etc.
                this.unitsAtHome[i].name = unitObject.name;

                //hiring queue
                this.unitsHiringQueue[i] = [];//Each unit has an array of queue
            }
        };

        Military.prototype.cancelQueue = function (unitIndex, queueIndex) {
            //TODO: Prompt user when canceling a unitsHiringQueue
            //TODO: Tell the player about the possible lose of money, change formula to give less money, the longer player waits.
            //Cancel unitsHiringQueue gives back ~50% money or so
            let count = this.unitsHiringQueue[unitIndex][queueIndex].count;
            let unitData = gameDataService.Units[unitIndex];
            let cost = unitData.cost;//TODO: Use methods to calculate the cost, possible way to cheat by hiring/canceling units after unit cost changes due to some bonuses
            let popCost = unitData.popCost;
            let unitCapCost = unitData.unitCapCost;
            playerService.baseStats.money += (count * cost) / 2;
            playerService.baseStats.population += count * popCost;//give back population
            playerService.baseStats.unitCap += count * unitCapCost;//give back unit cap...
            //remove units from unitsHiringQueue
            this.unitsHiringQueue[unitIndex].splice(queueIndex, 1);
        };
        //adding units to unitsHiringQueue when buying, it might take 1 or more turns
        Military.prototype.buyQueue = function (count, unitIndex) {
            //TODO: Consider merging same unit unitsHiringQueue if done on same turn.
            //TODO: For example, militia 10x, instead of storing 10x objects, we can combine them into 1...
            //TODO: Since time for training them will be the same(because they are unitsHiringQueued on same turn)
            //TODO: Can be easily done by checking last element in the array and comparing it's timer with current unit timer.
            let unitData = gameDataService.Units[unitIndex];
            let cost = unitData.cost;
            let unitCapCost = unitData.unitCapCost;
            let popCost = unitData.popCost;
            let trainingSpeed = unitData.trainingSpeed;
            let unitId = unitData.id;
            let name = unitData.name;
            let hiringQueueUnit = this.unitsHiringQueue[unitIndex];
            if (playerService.baseStats.money >= count * cost &&
                playerService.baseStats.unitCap >= count * unitCapCost &&
                playerService.baseStats.population >= count * popCost) {
                //pay for hiring...
                playerService.baseStats.unitCap -= count * unitCapCost;
                playerService.baseStats.money -= count * cost;
                playerService.baseStats.population -= count * popCost;

                //TODO: Training speed might be reduced here...

                //This will check if we are already training that unit, later on we might need to filter to match training speed with current time
                //In case we reduce training speed while previous unit was in queue, so we can combine them...

                //This stacks up units queue if their training time is the same(it does not take into account reduced time of training if you make a research during the training of the unit...)


                if (hiringQueueUnit.length) {
                    let lastQueueTime = hiringQueueUnit[hiringQueueUnit.length - 1].time || 1;
                    if (lastQueueTime === trainingSpeed) {
                        hiringQueueUnit[hiringQueueUnit.length - 1].count += count;
                    } else {
                        //TODO: Fix logic, we are repeating Array.push
                        hiringQueueUnit.push({count: count, time: trainingSpeed, id: unitId, name: name});
                    }
                } else {
                    hiringQueueUnit.push({count: count, time: trainingSpeed, id: unitId, name: name});
                }
            }
        };
        //call every game turn
        Military.prototype.updateQueue = function () {
            for (let j = 0; j < this.unitsHiringQueue.length; j++) {
                for (let i = this.unitsHiringQueue[j].length - 1; i >= 0; i--) {
                    let unitQueue = this.unitsHiringQueue[j];
                    unitQueue[i].time--;//reduce value by 1(1 turn)
                    //TODO: add more logic which takes research and other bonuses that improve speed.
                    if (unitQueue[i].time <= 0) {
                        let id = unitQueue[i].id;
                        //add units to our military.
                        this.unitsAtHome[id].count += unitQueue[i].count;
                        //remove from unitsHiringQueue
                        unitQueue.splice(i, 1);
                    }
                }
            }
        };

        Military.prototype.getStrength = function(unitIndex) {
            let attack = gameDataService.Units[unitIndex].attack;
            let defense = gameDataService.Units[unitIndex].defense;
            return this.unitsAtHome[unitIndex].count * (attack + defense);
        };

        Military.prototype.getTotalStrength = function () {
            let totalStrength = 0;
            let self = this;
            this.unitsAtHome.forEach(function (unit) {
                totalStrength += self.getStrength(unit.id) * unit.count || 0;
            });
            return totalStrength;
        };
        
        Military.prototype.getUpkeep = function(unitId) {
            return gameDataService.Units[unitId].upkeep;
        };
        Military.prototype.getTotalUpkeep = function () {
            let total = 0;
            let self = this;
            this.unitsAtHome.forEach(function (unit) {
                total += self.getUpkeep(unit.id) * unit.count;
            });
            //TODO: Might reduce upkeep with research/buildings...
            this.totalUpkeep = total;
            return total;
        };

        Military.prototype.getCost = function(unitId) {
            return gameDataService.Units[unitId].cost;
        };
        //TODO: Probably need to create another array of arrays which will store currently sent units "unit group", so we can calculate their cost
        //TODO: Sending units to fight should increase their upkeep :]

        Military.prototype.getAttack = function(unitId) {
            return gameDataService.Units[unitId].attack;
        };
        Military.prototype.getTotalUnitAttack = function(unitId, count) {
            return this.getAttack(unitId) * count;
        };
        Military.prototype.getAllUnitsTotalAttack = function(isAtHome, countryAtWarIndex){
            let totalAttack = 0;
            if(isAtHome) {
                for(let i = 0; i < this.unitsAtHome.length; i++){
                    totalAttack += this.getTotalUnitAttack(i, this.unitsAtHome[i].count);
                }
            } else{
                //Units at war
                for(let i = 0; i < this.unitsAtWar[countryAtWarIndex].length; i++){
                    totalAttack += this.getTotalUnitAttack(i, this.unitsAtWar[countryAtWarIndex][i].count);
                }
            }
            return totalAttack;
        };
        Military.prototype.getDefense = function(unitId) {
            return gameDataService.Units[unitId].defense;
        };
        Military.prototype.getTotalUnitDefense = function(unitId, count) {
            return this.getDefense(unitId) * count;
        };
        Military.prototype.getAllUnitsTotalDefense = function(isAtHome, countryAtWarIndex) {
            let totalDefense = 0;
            if(isAtHome) {
                for(let i = 0; i < this.unitsAtHome.length; i++){
                    totalDefense += this.getTotalUnitDefense(i, this.unitsAtHome[i].count);
                }
            } else{
                //Units at war
                for(let i = 0; i < this.unitsAtWar[countryAtWarIndex].length; i++){
                    totalDefense += this.getTotalUnitDefense(i, this.unitsAtWar[countryAtWarIndex][i].count);
                }
            }
            return totalDefense;
        };
        Military.prototype.getSiege = function(unitId) {
            return gameDataService.Units[unitId].siege;
        };
        Military.prototype.getPopulationCost = function(unitId) {
            return gameDataService.Units[unitId].popCost;
        };
        Military.prototype.getTrainingSpeed = function(unitId) {
            return gameDataService.Units[unitId].trainingSpeed;
        };
        return Military;
    });