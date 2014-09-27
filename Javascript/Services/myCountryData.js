﻿'use strict';

wciApp.factory('myCountryData', function () {

    //TODO: put the stats in a sub object
    //TODO: convert dependent stats in functions (example:  var researchPrototype = {

    var myCountry = {
        //One Month is signfied as one second
        name: 'ZombieTown',
        happiness: 100, //% calculated based on hunger(fg-fc), homelessness, unemployment.. etc.

        //Demographics
        size: 1,
        //isCountry: false, //Use this when the feature is built to start from a campsite and grow upto a city and then ask for independence.
        population: 4,
        baseGrowthRate: 10, //Based on the size of the country (lower size = higher growth rate)
        baseMortalityRate: 8, //Based on the size (lower size = higher mortality rate)
        actualGrowthRate: function () {
            return Math.round(this.baseGrowthRate * ((2 * this.happiness) / 100));
        },
        actualMortalityRate: function () {
            return Math.round(this.baseMortalityRate * (100 / (2 * this.happiness)));
        },
        populationGrowth: function () {
            return Math.round(this.population * ((this.actualGrowthRate() - this.actualMortalityRate()) / 100));
        },

        //Consumption
        perCapitaConsumption: 30, // 1 person's monthly consumption = 3 Mcal * 30 ~ 100 Mcal. (3Mcal is based on the nation's development level. http://www.who.int/nutrition/topics/3_foodconsumption/en/)
        totalFood: 1000, // In megaCalorie = 1000*kcal... 
        foodFlow: function() {
            return this.foodGrowth() - this.foodDemand();
        },
        basefoodGrowth: 400,
        foodGrowth: function () {
            return Math.round(this.basefoodGrowth * (this.happiness / 100));
        },
        foodDemand: function () {
            return this.perCapitaConsumption * this.population;
        },
        hunger: 0,

        //Economics
        taxRate: 40, //In percentage... high tax affects happiness. 
        avgSalary: 10, //Based on size, gdp, job types.
        money: 100, //Earned from Taxes and economic factors.
        //Determine what curreny do we want to use? or allow user to name the currency. This is dependent to employment rate, productivity (which is based on happiness).
        gdp: function () {
            var gdp = Math.round(((this.filledJobs() * this.jobGdpMultiplier)) * (this.happiness / 100));
            return gdp;
        },

        totalJobs: 4,
        filledJobs: function () {
            var jobs = Math.min(this.totalJobs, this.population)
            return jobs;
        }, //How many of these jobs are actually filled.
        jobGdpMultiplier: 10, //This is how jobs effect the gdp.

        //TODO: Move this to Demographics
        unemployment: function () {
            var unemployment = Math.round((this.population - (this.totalJobs)) / (this.population) * 100);
            if (unemployment < 0) {
                unemployment = 0;
            }

            return unemployment;
        },
        housingCapacity: 8,
        homelessness: function () {
            var homelessness = Math.round(((this.population - this.housingCapacity)/(this.population))*100);
            if (homelessness < 0) {
                homelessness = 0;
            }

            return homelessness;
        }
        //Army

        //Science
        
    };


    //Timer Methods
    myCountry.getNewDemographics = function () {

        this.population += this.populationGrowth();
        this.happiness = Math.round( 100 - (this.unemployment()/3) - (this.hunger/3) - (this.homelessness()/3));

        if (this.gdp() > 10000 && this.gdp() <= 1000000) {
            this.size = 2;
        }
        else if (this.gdp() > 1000000 && this.gdp() <= 100000000) {
            this.size = 3;
        }
        else if (this.gdp() > 100000000 && this.gdp() <= 10000000000) {
            this.size = 4;
        }
        else if (this.gdp() > 10000000000 && this.gdp() <= 1000000000000) {
            this.size = 5;
        }
        else if (this.gdp() > 1000000000000 && this.gdp() <= 10000000000000) {
            this.size = 6;
        }
        else if (this.gdp() > 10000000000000) {
            this.size = 7;
        }

        //Handling edge cases.
        if (this.population < 0) {
            this.population = 0;
        }
        //happiness can not be zero, or formulas will break
        if (this.happiness <= 1) {
            this.happiness = 1;
        }


    };

    myCountry.getNewConsumption = function () {

        this.totalFood += this.foodFlow();

        if (this.totalFood < 0) {
            this.totalFood = 0;
            this.hunger = Math.round(((this.foodDemand() - this.foodGrowth()) / (this.perCapitaConsumption * this.population)) * 100);
        }
        else {
            this.hunger = 0;
        }

    };

    myCountry.getNewEconomics = function () {

        this.money += Math.round(this.gdp() * 0.05);
    };


    return myCountry;
});