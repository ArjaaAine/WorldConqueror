wciApp.factory(
    'gameDataService',
    function (

    ) {
        /* Contains all game data for units/research/law/buildings etc. It contains base values only.
        *  In order to get actual unit attack/defense, we will be using a method like "unit.getAttack();
        *  Which will add other bonuses to the formula, like research or terrain type(if we ever implement that)*/
        let data = {
            Units: [],
            Buildings: [],
        };
        data.init = function(excelObject){
            //Excel object or JSON object contains all game data separated into parts like: Buildings, Units etc. Based on sheets in excel.
            for(let key in excelObject) {
                if(excelObject.hasOwnProperty(key)){
                    this[key] = excelObject[key];
                }
            }
            this.addIntellisense(excelObject);
            console.log("Game Data Object for debug reference: ");
            console.dir(this);
        };
        data.getCountryName = function(countryCode) {
          let name = "";
          this.WorldCountries.forEach(function (element) {
             if(element.countryCode === countryCode) name = element.name;
          });
          return name;
        };
        data.addIntellisense = function(object) {
            //This is basically repeating what this little for loop does inside init method, but this will allow IDE to see objects, until we start using JSON.

            //** Buildings **//
            let buildings = object.Buildings;
            buildings.forEach(function (element, index, buildingArray) {
                buildingArray[index].name = element.name;
                buildingArray[index].count = element.count;
                buildingArray[index].upkeep = element.upkeep;
                buildingArray[index].cost = element.cost;
                buildingArray[index].statAffected = element.statAffected;
                buildingArray[index].statMultiplier = element.statMultiplier;
                buildingArray[index].statAdder = element.statAdder;
                buildingArray[index].countMultiplier = element.countMultiplier;
                buildingArray[index].jobsIncreased = element.jobsIncreased;
                buildingArray[index].image = element.image;
                buildingArray[index].landCost = element.landCost;
                buildingArray[index].isUnlocked = element.isUnlocked;
            });

            //** Units **//
            let units = object.Units;//array
            units.forEach(function (element, index, unitArray) {
                unitArray[index].name = element.name;
                unitArray[index].code = element.code;
                unitArray[index].type = element.type;
                unitArray[index].cost = element.cost;
                unitArray[index].displayCost = element.displayCost;
                unitArray[index].count = element.count;
                unitArray[index].popCost = element.popCost;
                unitArray[index].upkeep = element.upkeep;
                unitArray[index].attack = element.attack;
                unitArray[index].defense = element.defense;
                unitArray[index].siege = element.siege;
                unitArray[index].unlocked = element.unlocked;
                unitArray[index].trainingSpeed = element.trainingSpeed;
                unitArray[index].unitCapCost = element.unitCapCost;
                unitArray[index].level = element.level;
                unitArray[index].frontOrder = element.frontOrder;
                unitArray[index].chanceToDie = element.chanceToDie;
                unitArray[index].id = element.id;
                unitArray[index].turnsBeforeTired = element.turnsBeforeTired;
            });

        };

        return data;
    }
);