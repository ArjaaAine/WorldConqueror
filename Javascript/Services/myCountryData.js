﻿'use strict';

wciApp.factory('myCountryData', function () {

    //TODO: put the stats in a sub object

    var myCountry = {
        baseStats: {},
        dependentStats: {},
        functions: {},
        descriptions: {}
    };

    if (!localStorage['baseStats']) {
        setInitialStats(myCountry);
    }
    else {
        //JSON.parse(atob(localStorage['wci_gameData']));
        myCountry.baseStats = JSON.parse(localStorage['baseStats']);
    }

    myCountry.dependentStats = {
        actualGrowthRate: function () {
            return myCountry.baseStats.baseGrowthRate * ((3 * myCountry.baseStats.happiness) / 100);
        },
        actualMortalityRate: function () {
            return myCountry.baseStats.baseMortalityRate * (100 / (5 * myCountry.baseStats.happiness));
        },
        populationGrowth: function () {
            return myCountry.baseStats.population * ((this.actualGrowthRate() - this.actualMortalityRate()) / 100);
        },
        //Consumption
        foodFlow: function () {
            return this.foodGrowth() - this.foodDemand();
        },
        foodGrowth: function () {
            return Math.round(myCountry.baseStats.basefoodGrowth * (myCountry.baseStats.happiness / 100));
        },
        foodDemand: function () {
            return myCountry.baseStats.perCapitaConsumption * myCountry.baseStats.population;
        },
        //Economics
        moneyGrowth: function () {
            return this.gdp() * 0.04;
        },
        //Determine what curreny do we want to use? or allow user to name the currency. This is dependent to employment rate, productivity (which is based on happiness).
        gdp: function () {
            var gdp = Math.round(((this.filledJobs() * myCountry.baseStats.jobGdpMultiplier)) * (myCountry.baseStats.happiness / 100));
            return gdp;
        },
        filledJobs: function () {
            var jobs = Math.min(myCountry.baseStats.totalJobs, myCountry.baseStats.population)
            return jobs;
        }, //How many of these jobs are actually filled.
        unemployment: function () {
            var unemployment = Math.round((myCountry.baseStats.population - (myCountry.baseStats.totalJobs)) / (myCountry.baseStats.population) * 100);
            if (unemployment < 0) {
                unemployment = 0;
            }

            return unemployment;
        },
        homelessness: function () {
            var homelessness = Math.round(((myCountry.baseStats.population - myCountry.baseStats.housingCapacity) / (myCountry.baseStats.population)) * 100);
            if (homelessness < 0) {
                homelessness = 0;
            }

            return homelessness;
        }
    };

    myCountry.descriptions = {
        happiness: "Happiness affects the productivity of the population and its growth rate.",
        homelessness: "Homelessness is the percentage of the population without a roof on their head. This reduces the happiness.",
        hunger: "Hunger is the percentage of the population without sufficient food because of shortage. This reduces the happiness.",
        unemployment: "Unemployment is the percentage of the population without a job. <br /> This reduces the happiness.",
        jobGdp: "This is how much each job affects the gdp"

    };


    //Timer Methods
    myCountry.functions.getGameTime = function () {

        var currentStabilityIndex = myCountry.baseStats.currentStabilityIndex;
        var previousStabilityIndex = myCountry.baseStats.previousStabilityIndex;

        //Hour
        myCountry.baseStats.time++;

        //Every Month
        if (myCountry.baseStats.time % 720 == 0) {
            //This checks and see if current and previous were either both +ve or both -ve.
            if (((currentStabilityIndex >= 0) && (previousStabilityIndex >= 0)) ||
                ((currentStabilityIndex < 0) && (previousStabilityIndex < 0))) {
                myCountry.baseStats.stability += currentStabilityIndex * myCountry.baseStats.turnsAtCurrentState;
                myCountry.baseStats.turnsAtCurrentState++;

                if (myCountry.baseStats.stability > 100) {
                    myCountry.baseStats.stability = 100;
                }
                else if (myCountry.baseStats.stability < 0) {
                    myCountry.baseStats.stability = 0;
                }
            }
            previousStabilityIndex = currentStabilityIndex;

        }

    };

    myCountry.functions.getNewDemographics = function () {

        myCountry.baseStats.population += myCountry.dependentStats.populationGrowth();

        //TODO: Figure out a more elegant solution for this.. but currently. happiness goes down slowly a first, then speeds up as the individual ratios go up, then slows down again after the ratios hit a certain point.
        var unemployment = myCountry.dependentStats.unemployment();
        var unempHappinessFactor = 0;
        var hunger = myCountry.baseStats.hunger;
        var hungerHappinessFactor = 0;
        var homeless = myCountry.dependentStats.homelessness();
        var homelessHappinessFactor = 0;
        var stability = myCountry.baseStats.stability;

        myCountry.baseStats.happiness = Math.round(100 - (unemployment / 4) - (hunger / 4) - (homeless / 4) - ((100 - stability) / 4));

        //Set the size.
        if (myCountry.dependentStats.gdp() <= 100000) {
            myCountry.baseStats.size = 1;
        }
        else if (myCountry.dependentStats.gdp() <= 10000000) {
            myCountry.baseStats.size = 2;
        }
        else if (myCountry.dependentStats.gdp() <= 1000000000) {
            myCountry.baseStats.size = 3;
        }
        else if (myCountry.dependentStats.gdp() <= 100000000000) {
            myCountry.baseStats.size = 4;
        }
        else if (myCountry.dependentStats.gdp() <= 10000000000000) {
            myCountry.baseStats.size = 5;
        }
        else if (myCountry.dependentStats.gdp() <= 1000000000000000) {
            myCountry.baseStats.size = 6;
        }
        else {
            myCountry.baseStats.size = 7;
        }

        //Handling edge cases.
        if (myCountry.baseStats.population < 0) {
            myCountry.baseStats.population = 0;
        }
        //happiness can not be zero, or formulas will break
        if (myCountry.baseStats.happiness <= 1) {
            myCountry.baseStats.happiness = 1;
        }

    };
    myCountry.functions.getNewConsumption = function () {

        myCountry.baseStats.totalFood += myCountry.dependentStats.foodFlow();

        if (myCountry.baseStats.totalFood < 0) {
            myCountry.baseStats.totalFood = 0;
            myCountry.baseStats.hunger = Math.round(
                ((myCountry.dependentStats.foodDemand() - myCountry.dependentStats.foodGrowth()) / (myCountry.baseStats.perCapitaConsumption * myCountry.baseStats.population)) * 100);
        }
        else {
            myCountry.baseStats.hunger = 0;
        }

    };
    myCountry.functions.getNewEconomics = function () {

        myCountry.baseStats.money += myCountry.dependentStats.moneyGrowth();
    };

    myCountry.functions.resetStats = function () {
        setInitialStats(myCountry);
    };
    myCountry.functions.saveData = function () {
        //btoa(JSON.stringify(game.data));
        localStorage['baseStats'] = JSON.stringify(myCountry.baseStats);
    };

    return myCountry;
});



var setInitialStats = function (myCountry) {
    myCountry.baseStats = {
        //One Month is signfied as one second
        name: 'World',
        title: 'Conqueror',
        time: 0, //in hours
        currentStabilityIndex: 1, //This is used to determine whether stability will grow or decrease this turn. +ve means growth in stability, -ve means decrease. This is set by various policies etc.
        previousStabilityIndex: 1, //Storing previous stability index to determine if stability has gone down or not.
        turnsAtCurrentState: 1, //This is the number of months current state has been present (stable or unstable), which determines the exponential factor for the stability
        //Demographics
        happiness: 100, //% calculated based on hunger(fg-fc), homelessness, unemployment, stability.. etc.
        stability: 25, //% calculated based on warring history, friendly laws.
        size: 1,
        population: 10,
        baseGrowthRate: 1, //Based on the size of the country (lower size = lower growth rate)
        baseMortalityRate: 6, //Based on the size (lower size = higher mortality rate)
        housingCapacity: 16,
        //Consumption
        perCapitaConsumption: 5, // 1 person's monthly consumption = 3 Mcal * 30 ~ 100 Mcal. (3Mcal is based on the nation's development level. http://www.who.int/nutrition/topics/3_foodconsumption/en/)
        totalFood: 800, // In megaCalorie = 1000*kcal... 
        basefoodGrowth: 100,
        hunger: 0,
        //Economics
        taxRate: 40, //In percentage... high tax affects happiness. 
        avgSalary: 10, //Based on size, gdp, job types.
        money: 100, //Earned from Taxes and economic factors.
        totalJobs: 16,
        jobGdpMultiplier: 100 //This is how jobs effect the gdp.


        //isCountry: false, //Use this when the feature is built to start from a campsite and grow upto a city and then ask for independence.
    };
};