"use strict";

wciApp.controller("ChartsController", (
  $scope,
  playerService,
  chartsService,
) => {

  /* IMPORTANT:  THIS CONTROLLER ACTS AS A ONE BIG CHART, USE OBJECTS TO STORE EACH CHART */
  // TODO: Use playerService to display "current values of food/money etc." Because those values are updated as player makes decission
  // TODO: Or just ignore it if we dont want to display this data on charts...
  Chart.defaults.global.colors = [ "#3f73fd", "#18b119", "#c6a625" ];
  $scope.charts = {};// Object so we can access chart by name;
  $scope.series = chartsService.series;
  $scope.labels = chartsService.history.timeLine;// This can be used with all charts so it doesn't need to be inside an object.

  // Population Chart
  $scope.charts.population = {};
  $scope.charts.population.actualValues = chartsService.data.population_currentAmount;
  $scope.charts.population.income = chartsService.data.population_income;
  $scope.charts.population.upkeep = chartsService.data.population_upkeep;
  $scope.charts.population.growth = chartsService.data.population_growth;

  // Money Chart
  $scope.charts.money = {};
  $scope.charts.money.actualValues = chartsService.data.money_currentAmount;
  $scope.charts.money.income = chartsService.data.money_income;
  $scope.charts.money.upkeep = chartsService.data.money_upkeep;
  $scope.charts.money.growth = chartsService.data.money_growth;

  // Food Chart
  $scope.charts.food = {};
  $scope.charts.food.actualValues = chartsService.data.food_currentAmount;
  $scope.charts.food.income = chartsService.data.food_income;
  $scope.charts.food.upkeep = chartsService.data.food_upkeep;
  $scope.charts.food.growth = chartsService.data.food_growth;

  // Growth Chart(income - upkeep)

  console.log($scope.charts);
  $scope.onClick = function (points, evt) {
    console.log(points, evt);
  };
  $scope.datasetOverride = [
    { yAxisID: "y-axis-1" },

    // { yAxisID: 'y-axis-2' }
  ];
  $scope.options = {
    scales: {
      yAxes: [
        {
          id      : "y-axis-1",
          type    : "linear",
          display : true,
          position: "left",
        },

        // {
        //     id: 'y-axis-2',
        //     type: 'linear',
        //     display: true,
        //     position: 'right'
        // }
      ],
    },
  };
});
