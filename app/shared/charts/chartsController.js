'use strict';

wciApp.controller('ChartsController', function (
    $scope,
    playerService,
    chartsService
){

    /* IMPORTANT:  THIS CONTROLLER ACTS AS A ONE BIG CHART, USE OBJECTS TO STORE EACH CHART */
    //TODO: Use playerService to display "current values of food/money etc." Because those values are updated as player makes decission
    //TODO: Or just ignore it if we dont want to display this data on charts...
    $scope.charts = {};//object so we can access chart by name;
    $scope.series = chartsService.series;
    $scope.labels = chartsService.history.timeLine;//This can be used with all charts so it doesn't need to be inside an object.

    //Current values Chart|| Actually this is not needed to be in a chart, but could be put as a last value somehow...
    $scope.charts.actualValues = {};
    $scope.charts.actualValues.population = playerService.baseStats.population;
    $scope.charts.actualValues.money = playerService.baseStats.money;
    $scope.charts.actualValues.food = playerService.baseStats.totalFood;


    //Income Chart
    $scope.charts.income = {};
    $scope.charts.income.series = ["Income"];
    $scope.charts.income.data = chartsService.data.income;

    //Upkeep Chart
    $scope.charts.upkeep = {};
    $scope.charts.upkeep.series = ["Upkeep"];
    $scope.charts.upkeep.data = chartsService.data.upkeep;

    //Growth Chart(income - upkeep)
    $scope.charts.growth = {};
    $scope.charts.growth.series = ["Growth"];
    $scope.charts.growth.data = chartsService.data.growth;

    $scope.onClick = function (points, evt) {
        console.log(points, evt);
    };
    $scope.datasetOverride = [
        { yAxisID: 'y-axis-1' },
        // { yAxisID: 'y-axis-2' }
        ];
    $scope.options = {
        scales: {
            yAxes: [
                {
                    id: 'y-axis-1',
                    type: 'linear',
                    display: true,
                    position: 'left'
                },
                // {
                //     id: 'y-axis-2',
                //     type: 'linear',
                //     display: true,
                //     position: 'right'
                // }
            ]
        }
    };
});