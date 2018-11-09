"use strict";
// eslint-disable-next-line
wciApp.factory("chartsService", function
(playerService) {

  const charts = {};
  let chartsHistoryLength = 100;

  charts.changeHistoryLength = function (val) {
    chartsHistoryLength = val;
  };
  charts.series = [ "Population", "Money", "Food" ];// This needs to be changed based on the order of objects in charts.history.[income, upkeep, growth], best if all of them are in the same order
  // tho object might not keep them ordered... (READ convertChartsTo2dArray object here)
  charts.data = {
    // This is what we need for charts, an array of arrays
    population_currentAmount: [],
    population_income       : [],
    population_upkeep       : [],
    population_growth       : [],
    money_currentAmount     : [],
    money_income            : [],
    money_upkeep            : [],
    money_growth            : [],
    food_currentAmount      : [],
    food_income             : [],
    food_upkeep             : [],
    food_growth             : [],
  };
  charts.history = {
    timeLine  : [],
    population: {
      currentAmount: [],
      income       : [],
      upkeep       : [],
      growth       : [],
    },
    money: {
      currentAmount: [],
      income       : [],
      upkeep       : [],
      growth       : [],
    },
    food: {
      currentAmount: [],
      income       : [],
      upkeep       : [],
      growth       : [],
    },

    // CurrentAmount: {// Just the amount, not income/production
    //   population: 0,
    //   money     : 0,
    //   food      : 0,
    // },
    // income: {
    //   population: [],
    //   money     : [],
    //   food      : [],
    // },
    // upkeep: {
    //   population: [],
    //   money     : [],
    //   food      : [],
    //
    // },
    // growth: {// Formula:  Income - Upkeep = Growth(how much we are left with)
    //   population: [],
    //   money     : [],
    //   food      : [],
    // },
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
    charts.history.population.currentAmount.unshift(Math.floor(population));
    charts.history.money.currentAmount.unshift(Math.floor(money));
    charts.history.food.currentAmount.unshift(Math.floor(food));

    // Put values in front of an array so we can easily remove last elements with Array.length = 7
    /* INCOME */
    charts.history.population.income.unshift(populationIncome.toFixed(2));
    charts.history.money.income.unshift(moneyIncome.toFixed(2));
    charts.history.food.income.unshift(foodIncome.toFixed(2));

    /* UPKEEP */
    charts.history.population.upkeep.unshift(populationUpkeep.toFixed(2));
    charts.history.money.upkeep.unshift(moneyUpkeep.toFixed(2));
    charts.history.food.upkeep.unshift(foodUpkeep.toFixed(2));

    /* GROWTH */
    charts.history.population.growth.unshift(populationGrowth.toFixed(2));
    charts.history.money.growth.unshift(moneyGrowth.toFixed(2));
    charts.history.food.growth.unshift(foodGrowth.toFixed(2));

    /* Change array size so we don't store too much data */

    const storeArraysHere =
        [ charts.history.population.currentAmount, charts.history.money.currentAmount, charts.history.food.currentAmount, charts.history.population.income, charts.history.money.income, charts.history.food.income, charts.history.population.growth, charts.history.money.growth, charts.history.food.growth, charts.history.population.upkeep, charts.history.money.upkeep, charts.history.food.upkeep ];

    storeArraysHere.forEach((object) => {
      if (object.length > chartsHistoryLength)
        object.length = chartsHistoryLength;
    });

    if (charts.history.timeLine.length > chartsHistoryLength) {
      charts.history.timeLine.reverse();
      charts.history.timeLine.length = chartsHistoryLength;
      charts.history.timeLine.reverse();
    }
    this.convertChartsTo2dArray();
  };

  charts.convertChartsTo2dArray = function () {
    const chartTypes = [ "population", "food", "money" ];
    const chartSubTypes = [ "currentAmount", "income", "upkeep", "growth" ];

    for (let i = 0; i < chartTypes.length; i++) {
      const type = chartTypes[i];
      const currentChart = this.history[type];

      for (const key in currentChart) {
        if (currentChart.hasOwnProperty(key)) {
          const array = currentChart[key].slice().reverse();

          charts.data[`${type}_${key}`] = [];
          charts.data[`${type}_${key}`].push(array);
        }
      }
    }
    console.log(this);
  };

  return charts;
});
