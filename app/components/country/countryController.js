wciApp.controller("CountryController", (
  $interval,
  $scope,
  playerService,
) => {
  $scope.myCountry = playerService;
  $scope.laws = playerService.laws;
  $scope.ministers = playerService.ministers;
  $scope.selectedLaw = $scope.laws.unlockedLaws[0];
  $scope.selectedLawIndex = 0;
  $scope.selectLawToDisplay = function(index) {
    $scope.selectedLaw = $scope.laws.unlockedLaws[index];
    $scope.selectedLawIndex = index;
  }
  $scope.enactLaw = function(index) {
    if(playerService.baseStats.influence < $scope.selectedLaw.influenceCost) return;
    if($scope.laws.enactLaw(index)){
      playerService.baseStats.influence -= $scope.selectedLaw.influenceCost;
    }
  }
  $scope.getProgressBarClass = function () {
    let className = "";
    const stabilityChange = $scope.selectedLaw.stabilityChange;
    if(stabilityChange > 0 ) className = 'progress-bar-success';
    if(stabilityChange < 0) className = 'progress-bar-danger';
    return className;
  }
  $scope.getProgressBarWidth = function() {
    const stabilityChange = $scope.selectedLaw.stabilityChange;
    return (5 + stabilityChange) * 10;
  }
  $scope.canAfford = function(lawData) {
    return playerService.baseStats.influence >= lawData.influenceCost;
  }
  $scope.isActive = function(lawData) {
    return lawData.isActive;
  }
});
