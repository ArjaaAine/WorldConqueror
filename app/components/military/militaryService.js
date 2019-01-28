"use strict";
// eslint-disable-next-line
wciApp.factory("militaryService", function
(playerService) {
    /* MILITARY CLASS */
    class Military {
        constructor () {
            this.unitTypes = [ "land", "air", "naval" ];

            this.unitsAtHome = {
                land : 0,
                air  : 0,
                naval: 0,
            };
            this.unitsAtWar = {
                land : 0,
                air  : 0,
                naval: 0,
            };
            this.unitStrength = {
                land : 1,
                air  : 10,
                naval: 50,
            };
        }

        initializeMainClass () {
            const units = [ "land", "air", "naval" ];
            const strength = [ 1, 10, 50 ];

            this.unitTypes = [];
            units.forEach((unit, index) => {
                this.unitsAtHome[unit] = 0;
                this.unitsAtWar[unit] = 0;
                this.unitStrength[unit] = strength[index];
                this.unitTypes.push(unit);
            });
        }

        getUnitStrength (type) {
            return this.unitStrength[type];
        }

        getTotalStrength () {
            const units = this.unitsAtHome;
            const strength = this.unitStrength;

            return units.land * strength.land + units.air * strength.air + units.naval * strength.naval;
        }

        addUnit (type, value) {
            this.unitsAtHome[type] += value;
        }

        // If AI gets attacked, we can use this to remove units. Tho it probably wont be necessary.
        removeUnit (type, value) {
            this.unitsAtHome[type] -= value;
        }
    }

    /* AI MILITARY */
    class AiMilitary extends Military {
        constructor () {
            super();
        }

    }

    /* PLAYER MILITARY CLASS*/
    class PlayerMilitary extends Military {
        constructor () {
            super();// Copy methods from parent class
            /* Speed in turns to produce units */
            this.baseHiringAmountPerTurn = {
                land : 300,
                air  : 30,
                naval: 5,
            };

            /* Cost in population to hire 1 unit of that type */
            this.baseHiringCost = {
                land : 1,
                air  : 3,
                naval: 5,
            };

            /* Limit to population simultaneous training */
            this.baseQueueLimit = {
                land : 1000,
                air  : 500,
                naval: 500,
            };

            /* How many units are currently in queue, for simplicity, so we don't search through an array... */
            this.currentQueuedUnits = {
                land : 0,
                air  : 0,
                naval: 0,
            };

            this.unitUpkeep = {
                land : 1,
                air  : 5,
                naval: 50,
            };
            this.hiringQueue = [];
        }

        update () {
            this.updateQueue();
        }

        init () {
            this.initializeMainClass();
        }

        addToQueue (type, amount) {
            const currentPopulation = playerService.baseStats.population;
            const baseCost = this.baseHiringCost[type];
            const baseQueueLimit = this.baseQueueLimit[type];
            const currentlyInQueue = this.currentQueuedUnits[type];

            if (currentlyInQueue + amount >= baseQueueLimit) {
                console.log(`Can't hire units, queue limit reached! You can hire only${baseQueueLimit - currentlyInQueue}`);
            } else if (baseCost >= currentPopulation) {
                console.log(`${`Not Enough population to hire units. You need ${baseCost}` - currentPopulation} more population.`);
            } else {
                // Hire units, finally :)
                this.hiringQueue.push({
                    type,
                    amount,
                });
            }

            //  TODO: Add bonuses from research/law/leaders etc.(leaders could be added during init as base values)
        }

        updateQueue () {
            const hireLimit = this.baseHiringAmountPerTurn;

            for (const unitToHire of this.hiringQueue.values()) {
                const type = unitToHire.type;
                const amount = unitToHire.amount;
                let amountToHire = amount;

                if (amount >= hireLimit) amountToHire = hireLimit;

                this.unitsAtHome[type] += amountToHire;
            }
        }

        getUpkeep () {
            let totalUpkeep = 0;

            for (const [ type, value ] of Object.entries(this.unitsAtHome)) {
                const warUpkeep = this.unitUpkeep[type] * 2 * this.unitsAtWar[type];

                totalUpkeep += this.unitUpkeep[type] * value + warUpkeep;
            }
            playerService.baseStats.upkeep.military = totalUpkeep;
        }

        getTrainedUnits () {
            let totalTrained = 0;

            // Total population of trained units at home and at war, multiplied by "hiringCost" since it represents the full cost of each unit

            for (const [ unit, value ] of Object.entries(this.baseHiringCost)) totalTrained += (this.unitsAtHome[unit] + this.unitsAtWar[unit]) * value;

            return totalTrained;
        }
    }

    return { PlayerMilitary,
        AiMilitary };
});
