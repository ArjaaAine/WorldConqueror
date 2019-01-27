"use strict";
// eslint-disable-next-line
wciApp.factory("worldCountryService", function
(
  militaryService,
  playerService,
  AiPlayerService,
  gameDataService,
) {

  class World {
    constructor () {
      // Countries store some basic data such as Land.
      this.AiPlayers = [];// List of all AI players.//This is an array, so we can loop through few countries each turn and save index for next loop on next turn. Using objects would be a pain.
      // Other properties are objects because we need to have an easy access to them via bracket notation like country[code].someData
      this.allCountriesRulers = {}; // Object with countries, containing a reference. Should not be saved, but initialized on game start
      this.allCountriesColors = {};// Objects with all countries colors...like this.countryColors.US = 15---This is the neutral color, blue
      this.countriesColorsAtWar = {};// Objects with all countries we are at war. Red color
    }

    init () {
      const countries = gameDataService.WorldCountries;

      // This is where we generate all countries with starting units etc.
      this.AiPlayers = [];
      this.allCountriesColors = {};
      this.conqueredCountriesColors = {};
      this.countriesColorsAtWar = {};

      countries.forEach((countryData) => {
        const countryCode = countryData.countryCode;
        const countryObject = {};// This is the simplest possible country object, containing only base information, it will be moved around between player/ai as they conquer each other.

        countryObject.countryCode = countryCode;
        countryObject.land = countryData.land || Math.floor(Math.random() * 450) + 50;// 50-500 land
        countryObject.name = countryData.name;
        countryObject.isLandLocked = countryData.isLandLocked;

        // Below, create AI players based on countries that player is NOT controlling.
        const playerCountry = playerService.startingCountries.map(code => code === countryCode)[0];

        if (!playerCountry) { // If player is not controlling a country, we can create AI from that countryData...
          const aiPlayer = new AiPlayerService();

          aiPlayer.init(countryData, countryObject);
	        this.AiPlayers.push(aiPlayer);// AI with all methods/logic and AiPlayer specific data like military...
	        this.allCountriesColors[countryCode] = this.AiPlayers[this.AiPlayers.length - 1].military.getTotalStrength();
	        this.allCountriesRulers[countryCode] = aiPlayer;
        } else {
          playerService.addCountry(countryObject);
	        this.conqueredCountriesColors[countryCode] = playerService.military.getTotalStrength();
          this.allCountriesRulers[countryCode] = playerService;
        }
      });
    }

    changeCountryRuler (countryCode, newRuler) {
      this.allCountriesRulers[countryCode] = newRuler;
    }

    getCountryStrength (countryCode) {
      const aiIndex = this.getAiIndexByCountryCode(countryCode);
      const filterCounqueredCountries = playerService.conqueredCountries.filter(country => country.countryCode === countryCode)[0];

      if (filterCounqueredCountries !== undefined) return playerService.military.getTotalStrength();

      return this.AiPlayers[aiIndex].military.getTotalStrength();

    }

    getAiIndexByCountryCode (countryCode) {
      for (let i = 0; i < this.AiPlayers.length; i++) {
        for (let j = 0; j < this.AiPlayers[i].countries.length; j++) {
          const country = this.AiPlayers[i].countries[j];

          if (country.countryCode === countryCode) return i;

        }
      }
    }

    removeAi (aiIndex) {
      for (let i = 0; i < this.AiPlayers[aiIndex].countries.length; i++) {
        const countryCode = this.AiPlayers[aiIndex].countries[i].countryCode;

        this.removeCountryAtWarColor(countryCode);
        this.conqueredCountriesColors[countryCode] = playerService.military.getTotalStrength();
      }
      this.AiPlayers.splice(aiIndex, 1);
      console.log(`Removed AI Player, there are ${this.AiPlayers.length} AI Players left!`);
    }

    removeAiCountriesColor (aiIndex) {
      const self = this;

      this.AiPlayers[aiIndex].countries.forEach((country) => {
        const countryCode = country.countryCode;

        self.removeCountryAtWarColor(countryCode);
      });
    }

    removeCountryAtWarColor (countryCode) {
      delete this.countriesColorsAtWar[countryCode];
    }

    updateColors (aiPlayer) {
      const self = this;

      aiPlayer.countries.forEach((country) => {
        const countryCode = country.countryCode;

        if (aiPlayer.isAtWar) self.countriesColorsAtWar[countryCode] = self.getCountryStrength(countryCode);
        else self.allCountriesColors[countryCode] = self.getCountryStrength(countryCode);

      });
    }

    updateLogic () {
      for (const aiPlayer of this.AiPlayers.values()) {
        aiPlayer.trainUnits();

        for (const country of aiPlayer.countries.values()) this.allCountriesColors[country.countryCode] = aiPlayer.military.getTotalStrength();

      }

      // There goes all logic for countries...Using AiPlayerService methods, we make decisions here.
      // While looping AiPlayer array, we can update map colors based on Strength as well
      // this.allCountriesColors[code] = country.getTotalStrength();//This can be called for each country to overwrite the map colors...
    }
  }

  return new World();
});
