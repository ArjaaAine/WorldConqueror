'use strict';

wciApp.factory('worldCountryService', function (
    militaryService,
    playerService,
    AiPlayerService,
    gameDataService
) {

    let World = function () {
        //Countries store some basic data such as Land.
        this.AiPlayers = [];//list of all AI players.//This is an array, so we can loop through few countries each turn and save index for next loop on next turn. Using objects would be a pain.
        //Other properties are objects because we need to have an easy access to them via bracket notation like country[code].someData
        this.allCountriesColors = {};//objects with all countries colors...like this.countryColors.US = 15---This is the neutral color, blue
        this.countriesColorsAtWar = {};//objects with all countries we are at war. Red color
    };

    World.prototype.init = function () {
        let countries = gameDataService.WorldCountries;
        //This is where we generate all countries with starting units etc.
        this.AiPlayers = [];
        this.allCountriesColors = {};
        this.conqueredCountriesColors = {};
        this.countriesColorsAtWar = {};
        let self = this;
        countries.forEach(function (countryData) {
            let countryCode = countryData.countryCode;
            let countryObject = {};//This is the simplest possible country object, containing only base information, it will be moved around between player/ai as they conquer each other.
            countryObject.countryCode = countryCode;
            countryObject.land = countryData.land || Math.floor(Math.random() * 450) + 50;//50-500 land

            //Below, create AI players based on countries that player is NOT controlling.
            let playerCountry = playerService.startingCountries.map(function (code) {
                return code === countryCode;//if player has the country...
            })[0];
            if (!playerCountry) {//If player is not controlling a country, we can create AI from that countryData...
                let country = new AiPlayerService();
                country.init(countryData, countryObject);
                self.AiPlayers.push(country);//AI with all methods/logic and AiPlayer specific data like military...
            } else {
                playerService.addCountry(countryObject);
                self.conqueredCountriesColors[countryCode] = playerService.military.getTotalStrength();
            }
            //AI colors for map
            //Last element, because we pushed them above, so new element is always last.
            self.allCountriesColors[countryCode] = self.AiPlayers[self.AiPlayers.length - 1].military.getTotalStrength();
        });
    };
    
    World.prototype.getCountryStrength = function(code) {
        let filterCounqueredCountries = playerService.conqueredCountries.filter(function (country) {
            return country.countryCode === code;
        })[0];
        if (filterCounqueredCountries !== undefined) {
            return playerService.military.getTotalStrength();
        } else {
            return this.getAiByCountryCode(code).getTotalStrength();
        }
    };
    World.prototype.getAiByCountryCode = function(code) {
        let index = this.getAiIndexByCountryCode(code);
        return this.AiPlayers[index];
    };
    World.prototype.getAiIndexByCountryCode = function(code) {
        for(let i = 0; i < this.AiPlayers.length; i++){
            for(let j = 0; j < this.AiPlayers[i].countries.length; j++){
                let country = this.AiPlayers[i].countries[j];
                if(country.countryCode === code) {
                    return i;
                }
            }
        }
    };
    World.prototype.removeAi = function(index) {
        for(let i = 0; i < this.AiPlayers[index].countries.length; i++) {
            let countryCode = this.AiPlayers[index].countries[i].countryCode;
            delete this.removeCountryAtWarColor(countryCode);
            this.conqueredCountriesColors[countryCode] = playerService.military.getTotalStrength();
        }
        this.AiPlayers.splice(index,  1);
        console.log("Removed AI Player, there are " + this.AiPlayers.length + " AI Players left!");
    };

    World.prototype.removeCountryAtWarColor = function(countryCode) {
      delete this.countriesColorsAtWar[countryCode];
    };
    World.prototype.update = function () {
        //There goes all logic for countries...Using AiPlayerService methods, we make decisions here.
        //While looping AiPlayer array, we can update map colors based on Strength as well
        // this.allCountriesColors[code] = country.getTotalStrength();//This can be called for each country to overwrite the map colors...
    };

    return new World();
});