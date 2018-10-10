wciApp.factory(
    'chartsService',
    function (
        playerService
    ) {

        let charts = {};
        charts.series = ['Population', 'Money', 'Food'];//This needs to be changed based on the order of objects in charts.history.[income, upkeep, growth], best if all of them are in the same order
        //tho object might not keep them ordered... (READ convertChartsTo2dArray object here)
        charts.data = {
            //This is what we need for charts, an array of arrays
            income: [],
            upkeep: [],
            growth: []
        };
        charts.history = {
            timeLine: [],
            currentAmount: {//Just the amount, not income/production
                population: 0,
                money: 0,
                food: 0
            },
            income: {
                population: [],
                money: [],
                food: []
            },
            upkeep:{
                population: [],
                money: [],
                food: []

            },
            growth:{// Formula:  Income - Upkeep = Growth(how much we are left with)
                population: [],
                money: [],
                food: []
            }
        };

        charts.update = function() {
            charts.history.timeLine.push(playerService.baseStats.currentTurn);//Store timeLine so we can use it in chart
            //Store up to 7 days of data(or more, just make sure to add another object to store older data)
            let population = playerService.baseStats.population;
            let populationIncome = playerService.actualGrowthRate();
            let populationUpkeep = playerService.actualMortalityRate();
            let populationGrowth = playerService.populationGrowth();

            let money = playerService.baseStats.money;
            let moneyIncome = playerService.income();
            let moneyUpkeep = playerService.baseStats.upkeep;
            let moneyGrowth = playerService.moneyGrowth();

            let food = playerService.baseStats.totalFood;
            let foodIncome = playerService.foodFlow();
            let foodUpkeep = playerService.foodDemand();
            let foodGrowth = playerService.foodGrowth();


            //THIS SHOULD BE IN A $SCOPE INSIDE A CONTROLLER SO IT GETS AUTOMATICALLY UPDATED WITH ACTUAL VALUES SINCE
            //"CURRENT" CAN CHANGE WHEN PLAYER TAKES ACTIONS...Unless we don't use this data for charts...
            charts.history.currentAmount.population = population;
            charts.history.currentAmount.money = money;
            charts.history.currentAmount.food = food;


            //Put values in front of an array so we can easily remove last elements with Array.length = 7
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

            let storeArraysHere =
                [
                    charts.history.income,
                    charts.history.upkeep,
                    charts.history.growth
                ];

            storeArraysHere.forEach(function (object) {
                if(object.length > 7) object.length = 7;
            });

            if(charts.history.timeLine.length > 7){
                charts.history.timeLine.reverse();
                charts.history.timeLine.length = 7;
                charts.history.timeLine.reverse();
            }
            this.convertChartsTo2dArray();
        };

        charts.convertChartsTo2dArray = function () {
            let chartTypes = ["income", "upkeep", "growth"];
            for(let i = 0; i < chartTypes.length; i++){
                let type = chartTypes[i];
                let currentChart = this.history[type];
                charts.data[type] = [];
                for(let key in currentChart){
                    if(currentChart.hasOwnProperty(key)){
                        let array = currentChart[key].slice().reverse();
                        charts.data[type].push(array)
                    }
                }
            }
            console.log(this);
        };


        return charts;
    });