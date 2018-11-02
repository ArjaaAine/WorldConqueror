"use strict";
// eslint-disable-next-line
wciApp.factory("chartsService", function
(playerService) {

  const charts = {};

  charts.series = [ "Population", "Money", "Food" ];// This needs to be changed based on the order of objects in charts.history.[income, upkeep, growth], best if all of them are in the same order
  // tho object might not keep them ordered... (READ convertChartsTo2dArray object here)
  charts.data = {
    // This is what we need for charts, an array of arrays
    income: [],
    upkeep: [],
    growth: [],
  };
  charts.history = {
    timeLine     : [],
    currentAmount: {// Just the amount, not income/production
      population: 0,
      money     : 0,
      food      : 0,
    },
    income: {
      population: [],
      money     : [],
      food      : [],
    },
    upkeep: {
      population: [],
      money     : [],
      food      : [],

    },
    growth: {// Formula:  Income - Upkeep = Growth(how much we are left with)
      population: [],
      money     : [],
      food      : [],
    },
  };

  charts.update = function () {
    charts.history.timeLine.push(playerService.baseStats.currentTurn);// Store timeLine so we can use it in chart
    // Store up to 7 days of data(or more, just make sure to add another object to store older data)
    const population = playerService.baseStats.population;
    const populationIncome = playerService.actualGrowthRate();
    const populationUpkeep = playerService.actualMortalityRate();
    const populationGrowth = playerService.populationGrowth();

    const money = playerService.baseStats.money;
    const moneyIncome = playerService.income();
    const moneyUpkeep = playerService.baseStats.upkeep;
    const moneyGrowth = playerService.moneyGrowth();

    const food = playerService.baseStats.totalFood;
    const foodIncome = playerService.foodFlow();
    const foodUpkeep = playerService.foodDemand();
    const foodGrowth = playerService.foodGrowth();

    // THIS SHOULD BE IN A $SCOPE INSIDE A CONTROLLER SO IT GETS AUTOMATICALLY UPDATED WITH ACTUAL VALUES SINCE
    // "CURRENT" CAN CHANGE WHEN PLAYER TAKES ACTIONS...Unless we don't use this data for charts...
    charts.history.currentAmount.population = population;
    charts.history.currentAmount.money = money;
    charts.history.currentAmount.food = food;

    // Put values in front of an array so we can easily remove last elements with Array.length = 7
    /* INCOME */
    charts.history.income.population.unshift(populationIncome);
    charts.history.income.money.unshift(moneyIncome);
    charts.history.income.food.unshift(foodIncome);

    /* UPKEEP */
    charts.history.upkeep.population.unshift(populationUpkeep);
    charts.history.upkeep.money.unshift(moneyUpkeep);
    charts.history.upkeep.food.unshift(foodUpkeep);

    /* GROWTH */
    charts.history.growth.population.unshift(populationGrowth);
    charts.history.growth.money.unshift(moneyGrowth);
    charts.history.growth.food.unshift(foodGrowth);

    /* Change array size so we don't store too much data */

    const storeArraysHere =
        [ charts.history.income, charts.history.upkeep, charts.history.growth ];

    storeArraysHere.forEach((object) => {
      if (object.length > 7)
        object.length = 7;
    });

    if (charts.history.timeLine.length > 7) {
      charts.history.timeLine.reverse();
      charts.history.timeLine.length = 7;
      charts.history.timeLine.reverse();
    }
    this.convertChartsTo2dArray();
  };

  charts.convertChartsTo2dArray = function () {
    const chartTypes = [ "income", "upkeep", "growth" ];

    for (let i = 0; i < chartTypes.length; i++) {
      const type = chartTypes[i];
      const currentChart = this.history[type];

      charts.data[type] = [];
      for (const key in currentChart) {
        if (currentChart.hasOwnProperty(key)) {
          const array = currentChart[key].slice().reverse();

          charts.data[type].push(array);
        }
      }
    }
    console.log(this);
  };

  return charts;
});
