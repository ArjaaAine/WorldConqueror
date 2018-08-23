wciApp.service('warService', function (
    worldCountryService,
    playerService,
    gameDataService
) {

    let War = function () {
        this.currentBattles = [];//array of objects;
        this.countriesAtWar = [];
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
        //To make it simple, only player can declare war for now at least...
        if (this.isCountryAtWar(countryCode) !== -1) return;//if already at war
        this.countriesAtWar.push({countryCode: countryCode, queue: [], inBattle: {}, warLog: []});
        console.log(countryCode);
        //TODO: Either fix logic to make it easier with using country name, or create a table with countryCode: countryName...
        let currentTurn = playerService.baseStats.currentTurn;
        let warLogText = "Year " + (1900 + currentTurn) + ": You have declared war against " + countryCode;
        this.countriesAtWar[this.countriesAtWar.length - 1].warLog.push(warLogText);//push to the last element, since it's always going to match latest war declaration.
        console.log(this.countriesAtWar);
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
            if (!playerService.military.unitsAtWar[countryAttackedIndex]) {
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

    War.prototype.doBattle = function () {
        //Calculate battle
        for (let i = 0; i < this.countriesAtWar.length; i++) {
            let countryAtWar = this.countriesAtWar[i];
            this.updateQueue(countryAtWar);//Moving this below combat logic will delay battle by 1 turn(currently your units will engage in a battle on the next turn)

            //Here we start the battle calculations and/or battle stages...
            let enemyCountry = worldCountryService.getAiByCountryCode(countryAtWar.countryCode);//used in defense in this case
            let aiMilitary = enemyCountry.military.units;
            let playerMilitary = countryAtWar.inBattle;//current player units in battle, we use them to calculate the result...
            console.log("AI MILITARY:");
            console.log(aiMilitary);
            console.log("PLAYER MILITARY:");
            console.log(playerMilitary);
            console.log("Player Military attack");
            this.calculateResult(playerMilitary, enemyCountry);
        }
    };

    War.prototype.calculateResult = function (playerTroops, enemyCountry) {
        let playerTotalAttack = this.getTotal(playerTroops, "attack");
        let playerTotalDefense = this.getTotal(playerTroops, "defense");
        // let enemyTotalAttack = enemyCountry.military.getTotalAttack();
        // let enemyTotalDefense = enemyCountry.military.getTotalDefense();
        // console.log(enemyTotalAttack, enemyTotalDefense);
        // console.log(playerTotalAttack, playerTotalDefense);
        console.log(playerTroops, enemyCountry);
    };

    War.prototype.getTotal = function (obj, stat) {
        //this is just temporary until I fix the code...
        let total = 0;
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                let unit = obj[key];
                let unitStats = gameDataService.Units[unit.id];
                if (stat === "attack") total += unit.count * unitStats.attack;
                if (stat === "defense") total += unit.count * unitStats.defense;
            }
        }
        return total;
    };
    War.prototype.sortByFrontOrder = function (a, b) {
        //pass this to Array.sort(this.sortByFrontOrder) to sort array of object based on property numerical value;
        return a.frontOrder - b.frontOrder;
    };

    //All units in queue(added to the queue during player turn, are merged with this function when player press 'next turn')
    //Basically it takes 1 turn for them to move from your base to the enemy country
    War.prototype.updateQueue = function (countryAtWar) {
        for (let i = 0; i < countryAtWar.queue.length; i++) {
            for (let j = 0; j < countryAtWar.queue[i].length; j++) {
                let unit = countryAtWar.queue[i][j];
                if (countryAtWar.inBattle[unit.name]) {
                    countryAtWar.inBattle[unit.name].count += unit.count;
                } else {
                    countryAtWar.inBattle[unit.name] = {};
                    countryAtWar.inBattle[unit.name].count = unit.count;
                    countryAtWar.inBattle[unit.name].id = unit.id
                }
            }
        }
        countryAtWar.queue = [];//clear queue since all units from queue are in battle
    };

    return new War();
});