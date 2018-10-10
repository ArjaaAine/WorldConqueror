wciApp.service('AiPlayerService', function(
    militaryService,
    gameDataService) {

    let AiPlayer = function () {
        //Object for a single country
        this.military = {};
        this.countries = [];//Countries under control of this AI, at first each AI controls one country...Change in the future versions where AI can conquer other countries.
        this.land = 0;//total Land based on countries controlled
        this.unitGrowth = 0;
        this.strength = 0;
        this.isDefeated = false;//Remove Ai Player if set to true.
    };

    AiPlayer.prototype.init = function (countryData, countryObject) {
        this.countries.push(countryObject);
        this.unitGrowth = countryData.unitGrowth || Math.floor(Math.random() * 90) + 10;//how many units are built each turn 10-100;
        this.AirUnitTier = countryData.AirUnitTier || Math.floor(Math.random() * 6) + 1;//1-6
        this.LandUnitTier = countryData.LandUnitTier || Math.floor(Math.random() * 6) + 1;
        this.NavalUnitTier = countryData.NavalUnitTier || Math.floor(Math.random() * 6) + 1;
        this.totalUnitTier = this.AirUnitTier + this.LandUnitTier + this.NavalUnitTier;
        this.strength = countryData.strength || Math.floor(Math.random() * 1000 * (this.totalUnitTier * 100)) + 10;//This formula is just in case we don't put any data in excel

        this.military = new militaryService();
        this.military.init();
        this.generateUnits();
        this.name = "Random Leader Name_" + (Math.floor(Math.random() * 1000));
    };

    AiPlayer.prototype.generateUnits = function () {
        //Initialize a country with units
        let strength = this.strength;
        while (strength > 0) {
            //TODO: Separate units into categories : "Naval": [], "Land": [], "Air": []. This might be useful when working with war
            let type = ["Air", "Land", "Naval"];
            let randomType = type[Math.floor(Math.random() * type.length)];
            let randomTier = Math.floor(Math.random() * this[randomType + "UnitTier"]) + 1;
            let military = this.military;
            this.military.unitsAtHome.filter(function (unit) {
                let unitId = unit.id;
                let unitData = gameDataService.Units[unitId];
                let level = unitData.level;
                let type = unitData.type;
                if (level === randomTier && type === randomType) {
                    unit.count = unit.count || 0;
                    unit.count += 1;
                    strength -= military.getStrength(unitId);
                }
            });
        }

        //Short debug code
        console.log("CHANGING UNITS HERE, REMOVE IT IN ORDER TO RANDOMIZE DATA AGAIN");
        for(let i = 0; i < this.military.unitsAtHome.length; i++){
            this.military.unitsAtHome[i].count = 0;
        }
        this.military.unitsAtHome[1].count = 100;//this sets all counties first index unit to 100, everything else to 0;
        //END OF DEBUG CODE

        //This will calculate actual strength of the country, since we can generate units with 1 strength, that cost 1000. Or just fix above generation to something better.
        this.strength += Math.abs(strength);
    };

    AiPlayer.prototype.getTotalStrength = function () {
        return this.military.getTotalStrength();
    };

    return AiPlayer;
});