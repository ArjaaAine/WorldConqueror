wciApp.service('warService', function (
    worldCountryService,
    playerService,
    gameDataService
) {

    let War = function () {
        this.currentBattles = [];//array of objects;
        this.countriesAtWar = [];
        this.currentWarIndex = 0;//This helps to track current index when we do battle, so war log can be updated.
        this.warLog = [];
    };

    War.prototype.init = function () {
        //Init so we don't have to refresh the page after reset.
        this.currentBattles = [];
        this.countriesAtWar = [];
    };

    //Create objects for 2 sides, so it can be used with update method for actual fight
    War.prototype.initBattle = function (attacker, defender) {
        console.log(attacker);
        console.log(defender);
    };

    War.prototype.isCountryAtWar = function (code) {
        return this.countriesAtWar.map(function (e) {
            return e.countryCode;
        }).indexOf(code);
    };

    War.prototype.declareWar = function (countryCode) {
        let aiPlayer = worldCountryService.getAiByCountryCode(countryCode);//This is AI player with all its data...
        //To make it simple, only player can declare war for now at least...
        let countryName = gameDataService.getCountryName(countryCode);
        if (this.isCountryAtWar(countryCode) !== -1) return;//if already at war
        worldCountryService.countriesColorsAtWar[countryCode] = worldCountryService.getCountryStrength(countryCode);
        this.countriesAtWar.push({countryCode: countryCode, name: countryName, queue: [], inBattle: {}, warLog: [], turnsAtWar: 0});
        playerService.military.unitsAtWar[this.countriesAtWar.length - 1] = [];
        this.addToWarLog("You have declared war against " + countryCode)
    };

    War.prototype.makePeace = function(countryIndex) {
        let playerUnitsInBattle = playerService.military.unitsAtWar[countryIndex];
        let canMakePeace = true;
        //TODO: Check if player has any units in enemy country(loop + check for count > 0 and/or if array length > 0)
        for(let i = 0; i < playerUnitsInBattle.length; i++) {
            let unit = playerUnitsInBattle[i];
            if(unit.count > 0) {
                console.log("##### Cannot make peace, because you have units in that country! #####");
                canMakePeace = false;
                break;
            }
        }
        if(canMakePeace) {
            let countryCode = this.countriesAtWar[countryIndex].countryCode;
            this.removeCountryAtWar(countryIndex, countryCode);
        }
    };
    War.prototype.returnUnits = function(countryIndex) {
        let playerUnitsInBattle = playerService.military.unitsAtWar[countryIndex];
        for(let i = playerUnitsInBattle.length - 1; i >= 0; i--) {
            let unit = playerUnitsInBattle[i];
            if(unit.count > 0) playerService.military.unitsAtHome[i].count += unit.count;
            unit.count = 0;
        }
    };
    
    War.prototype.sendTroops = function (troops, countryAttackedIndex) {
        //TODO: Merge troops, or add some delay before they merge etc.
        //TODO: Remove troops from attacker so he cant have infinite troops...

        for (let i = 0; i < troops.length; i++) {
            let troopId = troops[i].id;
            //TODO: Create a property for playerService to store "inBattle" units for each country it fights. Or even store this data inside each Unit object
            //TODO: We sort/filter through all those units anyway, we just need to check if there are any amount of them currently in battle with a country we are looping through.
            //TODO: Create a method in player service or warService(better) or Entity service(even better, first need to create Entity service tho)
            //TODO: Entity service is a service above player and AI, it contains shared properties between characters.
            if (!playerService.military.unitsAtWar[countryAttackedIndex].length) {
                playerService.military.unitsAtWar[countryAttackedIndex] = [];
                for (let j = 0; j < gameDataService.Units.length; j++) {
                    playerService.military.unitsAtWar[countryAttackedIndex][j] = {};
                    playerService.military.unitsAtWar[countryAttackedIndex][j] = troops[j];
                }
            } else {
                    playerService.military.unitsAtWar[countryAttackedIndex][troopId].count += troops[i].count;
            }
            playerService.military.unitsAtHome[troopId].count -= troops[i].count;
        }
        console.log(playerService.military);
    };
    War.prototype.addToWarLog = function(text) {
        text = 1900 + playerService.baseStats.currentTurn + ": " + text;
        this.warLog.push(text);
    };
    War.prototype.doBattle = function () {
        //Calculate battle
        for (let i = this.countriesAtWar.length - 1; i >= 0; i--) {//backwards in case we remove "war" object from an array after war is finished
            this.currentWarIndex = i;
            let countryAtWar = this.countriesAtWar[i];
            // this.updateQueue(countryAtWar);//Moving this below combat logic will delay battle by 1 turn(currently your units will engage in a battle on the next turn)

            //Here we start the battle calculations and/or battle stages...
            let enemyAi = worldCountryService.getAiByCountryCode(countryAtWar.countryCode);//used in defense in this case
            let aiMilitary = enemyAi.military.unitsAtHome;
            let playerMilitary = playerService.military.unitsAtWar[i];//current player units in battle, we use them to calculate the result...
            console.log("AI MILITARY:");
            console.log(aiMilitary);
            console.log("PLAYER MILITARY:");
            console.log(playerMilitary);

            if(playerMilitary.length) {
                this.addToWarLog("Battle round begins <<DEBUG>>");
                this.calculateResult(playerMilitary, enemyAi, i);
                console.log(countryAtWar.warLog);
            } else {
                console.log("<<DEBUG>>Player/Attacker has no units sent, so the fight can't begin...It's intentional, as player needs to send units to attack enemy country");
            }

            //** Check winning conditions **//
            if(enemyAi.military.getAllUnitsTotalAttack(true) <= 0) {
                console.log("Enemy country has no units left, you won!");
                let enemyAiIndex = worldCountryService.getAiIndexByCountryCode(countryAtWar.countryCode);
                for(let i = 0; i < enemyAi.countries.length; i++){
                    playerService.addCountry(enemyAi.countries[i]);
                }
                this.returnUnits(i);
                worldCountryService.removeAi(enemyAiIndex);
                this.removeCountryAtWar(i, countryAtWar.countryCode);
            }
        }
    };

    War.prototype.removeCountryAtWar = function(index, countryCode) {
        worldCountryService.removeCountryAtWarColor(countryCode);
        worldCountryService.update();
        this.countriesAtWar.splice(index, 1);
    };

    War.prototype.calculateResult = function (playerTroops, enemyCountry, countryAtWarIndex) {
        let playerTotalAttack = playerService.military.getAllUnitsTotalAttack(false, countryAtWarIndex);
        let playerTotalDefense = playerService.military.getAllUnitsTotalDefense(false, countryAtWarIndex);
        let enemyTotalAttack = enemyCountry.military.getAllUnitsTotalAttack(true);
        let enemyTotalDefense = enemyCountry.military.getAllUnitsTotalDefense(true);
        let enemyTroops = enemyCountry.military.unitsAtHome;//since enemy is defending, in the future when enemies get the ability to declare war and invade the player, it will need to be changed.
        console.log("Player Attack/Defense...Enemy Attack/Defense");
        console.log(playerTotalAttack, playerTotalDefense, enemyTotalAttack, enemyTotalDefense);

        //** CALCULATE THE BATTLE RESULT HERE USING A LOOP OR SOMETHING :X **//
        //make copies of defeated unit so we can remove them later...

        //** IMPORTANT **/
        //** You can move "killUnits" method below if you want "fair" battles, otherwise battles will be "turn based" and first attacker will have a huge advantage
        let enemyLostUnits = this.calculateBattleResult(playerTotalAttack, enemyTroops);//calculate how many enemy units "die" after this battle
        this.killUnits(enemyLostUnits, enemyTroops);//KILL THOSE UNITS HERE, MOVE IT DOWN IF U WANT TO KILL THEM LATER
        let playerLostUnits = this.calculateBattleResult(enemyTotalAttack, playerTroops);//If you KILLED some of the units, this player will be "WEAKER" since he already lost some of the units.
        this.killUnits(playerLostUnits, playerTroops);
        this.addToWarLog("Both sides took some casualties after this year of battling");


    };

    War.prototype.calculateBattleResult = function(attackerPower, defender) {//attackerPower is basically total attack power of units.
        let sortedUnitsByFrontOrder = [];
        angular.copy(gameDataService.Units, sortedUnitsByFrontOrder);
        sortedUnitsByFrontOrder.sort(this.sortByFrontOrder);
        //Do calculations on the copy, then overwrite real data with copied(we only care about count of units for now)
        //The reason is that we want to avoid sorting real array, because we use array index as a way to find specific unit.
        let defenderLostUnits = [];
        for(let i = 0; i < sortedUnitsByFrontOrder.length; i++){
            let unit = sortedUnitsByFrontOrder[i];
            let unitId = unit.id;
            if(!defender[unitId].count) continue;//dont bother with calculations of unit count is 0;
            let chanceToDie = unit.chanceToDie;//this could be renamed, it basically tells how many % of those units can be killed in a single turn, until attack power is used up
            let unitsAboutToDie = Math.round(attackerPower / unit.defense);//how many units we are capable of killing. Round up to avoid any problems with left over attack and infinite loops...
            let unitsActuallyKilled = Math.ceil(unitsAboutToDie * chanceToDie)//It will round up to 1.
            if(!unitsActuallyKilled) continue;//if there are 0 units to kill
            if(unitsActuallyKilled > defender[unitId].count) {
                unitsActuallyKilled = defender[unitId].count;
            }
            defenderLostUnits.push({id: unitId, count: unitsActuallyKilled});
        }
        return defenderLostUnits;
    };

    War.prototype.killUnits = function(unitsToKill, troopsToDeleteFrom) {
        for(let j = 0; j < unitsToKill.length; j++){
            let id = unitsToKill[j].id;//id to reference an array
            let count = unitsToKill[j].count;//how many units died in battle
            troopsToDeleteFrom[id].count -= count;//should never go below 0;
            if(troopsToDeleteFrom[id].count < 0) console.log("SOMETHING WENT WRONG, YOUR UNIT COUNT IS LESS THAN 0");
        }

        console.log(troopsToDeleteFrom);
    };

    War.prototype.sortByFrontOrder = function (a, b) {
        //pass this to Array.sort(this.sortByFrontOrder) to sort array of object based on property numerical value;
        return a.frontOrder - b.frontOrder;
    };

    //All units in queue(added to the queue during player turn, are merged with this function when player press 'next turn')
    //Basically it takes 1 turn for them to move from your base to the enemy country
    // War.prototype.updateQueue = function (countryAtWar) {
    //     for (let i = 0; i < countryAtWar.queue.length; i++) {
    //         for (let j = 0; j < countryAtWar.queue[i].length; j++) {
    //             let unit = countryAtWar.queue[i][j];
    //             if (countryAtWar.inBattle[unit.name]) {
    //                 countryAtWar.inBattle[unit.name].count += unit.count;
    //             } else {
    //                 countryAtWar.inBattle[unit.name] = {};
    //                 countryAtWar.inBattle[unit.name].count = unit.count;
    //                 countryAtWar.inBattle[unit.name].id = unit.id
    //             }
    //         }
    //     }
    //     countryAtWar.queue = [];//clear queue since all units from queue are in battle
    // };

    return new War();
});