wciApp.controller(
    'TooltipController',
    function (
        $scope,
        $sce,
        $filter,
        playerService) {
        this.myCountry = playerService;
        $scope.updateTooltip = function() {
            let growth = $filter("fixedDecimalPlaces")(playerService.actualGrowthRate(), 2);
            let mortality = $filter("fixedDecimalPlaces")(playerService.actualMortalityRate(), 2);
            let income = $filter("niceNumber")(playerService.income());
            let upkeep = $filter("niceNumber")(playerService.baseStats.upkeep);
            let foodProduction = $filter("niceNumber")(playerService.foodGrowth());
            let foodDemand = $filter("niceNumber")(playerService.foodDemand());
            $scope.population = $sce.trustAsHtml(
                "Growth Rate: <span class='bold text-success'>" + growth + "%</span> <br/>\n" +
                "Mortality Rate: <span class='bold text-danger'>" + mortality + "%</span>"
            );

            $scope.money = $sce.trustAsHtml(
                "Income: <span class='bold text-success'>" + income + "</span> <br/>\n" +
                "Upkeep: <span class='bold text-danger'>" + upkeep + "</span>"
            );

            $scope.food = $sce.trustAsHtml(
                "Production: <span class='bold text-success'>" + foodProduction + "%</span> <br/>\n" +
                "Consumption: <span class='bold text-danger'>" + foodDemand + "%</span>"
            );
        };
        $scope.updateTooltip();
    });