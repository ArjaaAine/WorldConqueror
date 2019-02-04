"use strict";

wciApp.controller("ChartsController", (
    $scope,
    playerService,
    chartsService,
) => {

    $scope.historyValue = 10;
    $scope.changeHistoryLength = function (val) {
        $scope.historyValue += val;
        if ($scope.historyValue < 10) $scope.historyValue = 10;
        if ($scope.historyValue > 30) $scope.historyValue = 30;
        chartsService.changeHistoryLength($scope.historyValue);
    };

    /* IMPORTANT:  THIS CONTROLLER ACTS AS A ONE BIG CHART, USE OBJECTS TO STORE EACH CHART */
    // TODO: Use playerService to display "current values of food/money etc." Because those values are updated as player makes decission
    // TODO: Or just ignore it if we dont want to display this data on charts...
    $scope.chartTypes = {
        line: "line",
        bar : "bar",
    };
    $scope.type = "line";
    $scope.changeType = function (type) {
        $scope.type = type;
    };
    $scope.charts = {};// Object so we can access chart by name;
    $scope.series = {};
    $scope.colors = {};
    $scope.colors.population = ["#3f73fd"];
    $scope.colors.money = ["#fdbf1e"];
    $scope.colors.food = ["#33b12b"];
    $scope.labels = chartsService.history.timeLine;// This can be used with all charts so it doesn't need to be inside an object.

    // Population Chart
    $scope.charts.population = {};
    $scope.series.population = {};
    $scope.series.population.actualValues = ["Population Amount"];
    $scope.series.population.income = ["Population Income"];
    $scope.series.population.upkeep = ["Population Upkeep"];
    $scope.series.population.growth = ["Population Growth"];
    $scope.charts.population.actualValues = chartsService.data.population_currentAmount;
    $scope.charts.population.income = chartsService.data.population_income;
    $scope.charts.population.upkeep = chartsService.data.population_upkeep;
    $scope.charts.population.growth = chartsService.data.population_growth;

    // Money Chart
    $scope.charts.money = {};
    $scope.series.money = {};
    $scope.series.money.actualValues = ["Money Amount"];
    $scope.series.money.income = ["Money Income"];
    $scope.series.money.upkeep = ["Money Upkeep"];
    $scope.series.money.growth = ["Money Growth"];
    $scope.charts.money.actualValues = chartsService.data.money_currentAmount;
    $scope.charts.money.income = chartsService.data.money_income;
    $scope.charts.money.upkeep = chartsService.data.money_upkeep;
    $scope.charts.money.growth = chartsService.data.money_growth;

    // Food Chart
    $scope.charts.food = {};
    $scope.series.food = {};
    $scope.series.food.actualValues = ["Food Amount"];
    $scope.series.food.income = ["Food Income"];
    $scope.series.food.upkeep = ["Food Upkeep"];
    $scope.series.food.growth = ["Food Growth"];
    $scope.charts.food.actualValues = chartsService.data.food_currentAmount;
    $scope.charts.food.income = chartsService.data.food_income;
    $scope.charts.food.upkeep = chartsService.data.food_upkeep;
    $scope.charts.food.growth = chartsService.data.food_growth;

    // Growth Chart(income - upkeep)

    $scope.onClick = function (points, evt) {
        console.log(`Clicked chart at ${points}`, evt);
    };
    $scope.datasetOverride = [
        { yAxisID: "y-axis-1" },

    // { yAxisID: 'y-axis-2' }
    ];

    $scope.$on("chart-create", (evt, chart) => {
        chart.options.title.text = chart.data.datasets[0].label;
        chart.update();
    });
    $scope.options = {
        title : { display: true },
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
