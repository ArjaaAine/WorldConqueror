wciApp.controller(
  "TooltipController",
  function (
    $scope,
    $sce,
    $filter,
    playerService,
  ) {
    $scope.updateTooltip = function () {
      const growth = $filter("fixedDecimalPlaces")(playerService.actualGrowthRate(), 2);
      const mortality = $filter("fixedDecimalPlaces")(playerService.actualMortalityRate(), 2);
      const income = $filter("niceNumber")(playerService.income());
      const upkeep = $filter("niceNumber")(playerService.baseStats.totalUpkeep);
      const foodProduction = $filter("niceNumber")(playerService.foodGrowth());
      const foodDemand = $filter("niceNumber")(playerService.foodDemand());

      $scope.population = $sce.trustAsHtml(`Growth Rate: <span class='bold text-success'>${growth}%</span> <br/>\n` +
                `Mortality Rate: <span class='bold text-danger'>${mortality}%</span>`);

      $scope.money = $sce.trustAsHtml(`Income: <span class='bold text-success'>${income}</span> <br/>\n` +
                `Upkeep: <span class='bold text-danger'>${upkeep}</span>`);

      $scope.food = $sce.trustAsHtml(`Production: <span class='bold text-success'>${foodProduction} units</span> <br/>\n` +
                `Consumption: <span class='bold text-danger'>${foodDemand}units</span>`);
    };
    $scope.updateTooltip();
  },
);
