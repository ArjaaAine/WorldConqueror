"use strict";

wciApp.factory(
  "playerService",
  (
    bonusesService,
    leaderService,
  ) => {

    class Player {
      constructor () {
        this.baseStats = {};
        this.events = {};
        this.leaderTitles = [];
        this.descriptions = {
          happiness   : "Happiness affects the productivity of the population and its growth rate.",
          homelessness: "Homelessness is the percentage of the population without a roof on their head. This reduces the happiness.",
          hunger      : "Hunger is the percentage of the population without sufficient food because of shortage. This reduces the happiness.",
          unemployment: "Unemployment is the percentage of the population without a job. <br /> This reduces the happiness.",
          jobGdp      : "This is how much each job affects the gdp",
        };
        this.conqueredCountries = [];// A list of countries we control
        this.startingCountries = [];// List of strings with starting countries for a player...
      }

      init () {
        const leaderPerCapitaConsumptionAdder = leaderService.bonusCalculator("perCapitaConsumption", 0);
        const leaderJobGdpMultiplier = leaderService.bonusCalculator("jobGdpMultiplier", 1);

        this.conqueredCountries = [];
        this.startingCountries = ["US"];// We can have more than 1...
        this.baseStats = {
          // One Month is signfied as one second
          countryName    : "Wadiya",
          leaderName     : "Rohan",
          leaderTitle    : "King",
          selectedCountry: "US",
          //difficultyLevel: {
          //  Desc : "I am a noob, have mercy!",
          //  Value: 1,
          //},
          time                  : 0, // In hours
          currentStabilityIndex : 1, // This is used to determine whether stability will grow or decrease this turn. +ve means growth in stability, -ve means decrease. This is set by various policies etc.
          previousStabilityIndex: 1, // Storing previous stability index to determine if stability has gone down or not.
          turnsAtCurrentState   : 1, // This is the number of months current state has been present (stable or unstable), which determines the exponential factor for the stability
          // Demographics
          happiness             : 100, // % calculated based on hunger(fg-fc), homelessness, unemployment, stability.. etc.
          stability             : 25, // % calculated based on warring history, friendly laws.
          size                  : 1,
          sizeName              : "Speck",
          population            : 100,
          baseGrowthRate        : 1, // Based on the size of the worldCountry (lower size = lower growth rate)
          baseMortalityRate     : 6, // Based on the size (lower size = higher mortality rate)
          housingCapacity       : 16,

          // Consumption
          perCapitaConsumption: 5, // 1 person's monthly consumption = 3 Mcal * 30 ~ 100 Mcal. (3Mcal is based on the nation's development level. http://www.who.int/nutrition/topics/3_foodconsumption/en/)
          totalFood           : 800, // In megaCalorie = 1000*kcal...
          baseFoodGrowth      : 100,
          hunger              : 0,

          // Economics
          money             : 1000, // Earned from Taxes and economic factors.
          upkeep            : 0, // Upkeep of structure, advisors and soldiers.
          totalJobs         : 16,
          jobGdpMultiplier  : 100, // This is how jobs effect the gdp.
          // Military
          attack            : 0,
          defense           : 0,
          siege             : 0,
          unitCap           : 0,
          baseResearchPoints: 0,
          currentTurn       : 0,
          land              : 100,

          // Laws
          influence: 0,
        };
        this.baseStats.leaderName = leaderService.currentLeader.name || "Rohan";
        this.baseStats.perCapitaConsumption += leaderPerCapitaConsumptionAdder;
        this.baseStats.jobGdpMultiplier *= leaderJobGdpMultiplier;
        this.events = {
          oneChildPolicy: false, // Law
          birthFreeze   : false, // Law
        };
        //this.getLookups();
      }

      addCountry (countryObject) {
        this.conqueredCountries.push(countryObject);
        this.updateLand();
      }

      updateLand () {
        let totalLand = 0;

        this.conqueredCountries.forEach((countryData) => {
          totalLand += countryData.land;
        });
        this.baseStats.land = totalLand;
      }

      actualGrowthRate () {
        let growthRate;
        const freezeGrowth = bonusesService.lawsBonuses.freezeGrowth;
        const freezeBirth = bonusesService.lawsBonuses.freezeBirth;

        if (freezeGrowth) growthRate = this.actualMortalityRate();
        else if (freezeBirth) growthRate = 0;

        else growthRate = this.baseStats.baseGrowthRate * (3 * this.baseStats.happiness / 100);

        return growthRate;
      }

      actualMortalityRate () {
        return this.baseStats.baseMortalityRate * (100 / (5 * this.baseStats.happiness));
      }

      populationGrowth () {
        return this.baseStats.population * ((this.actualGrowthRate() - this.actualMortalityRate()) / 100);
      }

      foodFlow () {
        return this.foodGrowth() - this.foodDemand();
      }

      foodGrowth () {
        return Math.round(this.baseStats.baseFoodGrowth * (this.baseStats.happiness / 100));
      }

      foodDemand () {
        return this.baseStats.perCapitaConsumption * this.baseStats.population;
      }

      income () {
        // TODO: 12/22/2014: This might need to be reduced.
        return Math.round(this.gdp() * 0.1); // You get 4% of the gdp every turn. (Which is one month)
      }

      moneyGrowth () {
        return this.income() - this.baseStats.upkeep;
      }

      gdp () {
        return Math.round(this.filledJobs() * this.baseStats.jobGdpMultiplier * (this.baseStats.happiness / 100));
      }

      filledJobs () {
        return Math.min(this.baseStats.totalJobs, this.baseStats.population);
      }

      unemployment () {
        let unemployment = Math.round((this.baseStats.population - this.baseStats.totalJobs) / this.baseStats.population * 100);

        if (unemployment < 0) unemployment = 0;

        return unemployment;
      }

      homelessness () {
        let homelessness = Math.round((this.baseStats.population - this.baseStats.housingCapacity) / this.baseStats.population * 100);

        if (homelessness < 0) homelessness = 0;

        return homelessness;
      }

      getCurrentStabilityIndex () {
        let indexBonus = bonusesService.lawsBonuses.stabilityChange;
        const leaderStabilityIndexAdder = leaderService.bonusCalculator("stabilityIndex", 0);

        if (typeof indexBonus !== "number") indexBonus = 0;

        return this.baseStats.currentStabilityIndex + indexBonus + leaderStabilityIndexAdder;
      }

      // Timer Methods
      getGameTime () {
        const currentStabilityIndex = this.getCurrentStabilityIndex();
        const previousStabilityIndex = this.baseStats.previousStabilityIndex;

        // Hour
        this.baseStats.time++;

        // This checks and see if current and previous were either both +ve or both -ve.
        if (currentStabilityIndex > 0 && previousStabilityIndex > 0 ||
          currentStabilityIndex < 0 && previousStabilityIndex < 0) {
          this.baseStats.turnsAtCurrentState++;
          this.baseStats.stability += currentStabilityIndex * this.baseStats.turnsAtCurrentState;

          if (this.baseStats.stability > 100) this.baseStats.stability = 100;

          else if (this.baseStats.stability < 0) this.baseStats.stability = 0;

        } else {
          this.baseStats.turnsAtCurrentState = 0;
        }
        this.baseStats.previousStabilityIndex = currentStabilityIndex;
      }

      getNewDemographics () {
        this.baseStats.population += this.populationGrowth();
        this.setHappiness();
        //this.setCountrySize();

        // Handling edge cases. (Minimum is 2, you and your partner)
        if (this.baseStats.population < 2) this.baseStats.population = 2;

        // Happiness can not be zero, or formulas will break
        if (this.baseStats.happiness <= 1) this.baseStats.happiness = 1;

      }

      getNewConsumption () {
        this.baseStats.totalFood += this.foodFlow();
        if (this.baseStats.totalFood < 0) {
          this.baseStats.totalFood = 0;
          this.baseStats.hunger = Math.round(Math.abs(this.foodFlow() / this.foodDemand()) * 100);
        } else {
          this.baseStats.hunger = 0;
        }
        console.log(this.baseStats.hunger);
      }

      getNewEconomics () {
        this.baseStats.money += this.moneyGrowth();

        // Set the money to a minimum of 0. Once Lending is implemented, then it will be possible for the worldCountry to go negative.
        if (this.baseStats.money < 0) this.baseStats.money = 0;

      }

      //getLookups () {
      //  this.leaderTitles = [ "President", "Prime Minister", "Lord", "Lady", "King", "Queen", "Drag Queen", "Dictator", "Emperor", "Emperess" ];
      //  this.difficultyLevels = [
      //    {
      //      Desc : "I am a noob, have mercy!",
      //      Value: 1,
      //    },
      //    {
      //      Desc : "I am a big boy, I saw a horror movie today and didn't piss my pants.",
      //      Value: 2,
      //    },
      //    {
      //      Desc : "I am just your average chump with a pc.",
      //      Value: 3,
      //    },
      //    {
      //      Desc : "I am a jedi wrapped in human skin.",
      //      Value: 4,
      //    },
      //    {
      //      Desc : "Feeble human mind exterminated. Skynet does not tolerate mediocrity.",
      //      Value: 5,
      //    },
      //  ];
      //}

      //setCountrySize () {
      //  if (this.gdp() <= 100000) { // 100k
      //    this.baseStats.sizeName = "City State";
      //    this.baseStats.size = 1;
      //  } else if (this.gdp() <= 10000000) { // 10m
      //    this.baseStats.sizeName = "Least Developed Country";
      //    this.baseStats.size = 2;

      //    this.sizeIncreaseEvents(2);
      //  } else if (this.gdp() <= 1000000000) { // 1b
      //    this.baseStats.sizeName = "Developing Nation";
      //    this.baseStats.size = 3;
      //  } else if (this.gdp() <= 100000000000) { // 100b
      //    this.baseStats.sizeName = "Emerging Economy";
      //    this.baseStats.size = 4;
      //  } else if (this.gdp() <= 10000000000000) { // 10t
      //    this.baseStats.sizeName = "Developed Nation";
      //    this.baseStats.size = 5;
      //  } else if (this.gdp() <= 1000000000000000) { // 1q
      //    this.baseStats.sizeName = "World Power";
      //    this.baseStats.size = 6;
      //  } else {
      //    // World Conqueror
      //    this.baseStats.size = 7;
      //  }
      //}

      setHappiness () {
        const unemployment = this.unemployment();
        const unempHappinessFactor = 0;
        const hunger = this.baseStats.hunger;
        const hungerHappinessFactor = 0;
        const homeless = this.homelessness();
        const homelessHappinessFactor = 0;
        const stability = this.baseStats.stability;

        this.baseStats.happiness = Math.round(100 - unemployment / 4 - hunger / 4 - homeless / 4 - (100 - stability) / 4);
      }

      sizeIncreaseEvents () {

      }
    }

    return new Player();
  },
);

