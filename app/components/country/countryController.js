wciApp.controller("CountryController", (
    $interval,
    $scope,
    $timeout,
    modalService,
    playerService,
) => {
    //Service Declarations
    $scope.myCountry = playerService;
    $scope.laws = playerService.laws;
    $scope.ministers = playerService.ministers;

    //Startup Params
    $scope.selectedLaw = $scope.laws.unlockedLaws[0];
    $scope.selectedLawIndex = 0;
    $scope.ministerHireError = false;

    

    //#region Click Events
    //Minister
    $scope.openMinisterHire() = function () {
        let ministerCost = 1;
        let count = 0;

        // This is a factorial function
        playerService.ministers.activeMinisters.forEach((minister) => {
            count += 100;
            ministerCost *= count;
        });

        playerService.ministers.nextMinisterCost = ministerCost;

        if (playerService.ministers.activeMinisters.length < 1) {
            ministerCost = 0;
            playerService.ministers.nextMinisterCost = 0;
        }

        if (playerService.baseStats.influence >= ministerCost) {
            $scope.ministerHireError = false;

            // Open modal
            const modalInstance = modalService.open({
                templateUrl: "ministersHireModal.html",
                controller: "ministersHiringModalController",
                size: "md",
                resolve: {
                    remainingMinisters() {
                        return playerService.ministers.remainingMinisters;
                    },
                    nextMinisterCost() {
                        return playerService.ministers.nextMinisterCost;
                    },
                },
            });

            modalInstance.result.then((ministerType) => {

                const minister = filterMinister(ministerType);

                if (minister) {
                    playerService.ministers.activeMinisters.push(minister);
                    const index = playerService.ministers.remainingMinisters.indexOf(minister);

                    playerService.ministers.remainingMinisters.splice(index, 1);
                    playerService.baseStats.influence -= ministerCost;
                }

                // Handle bonuses
            });

        } else {
            $scope.ministerHireError = true;
            $scope.ministerHireErrorMessage = `You do not have enough influence. You need a total of ${ministerCost} influence.`;
            $timeout(() => {
                $scope.ministerHireError = false;
            }, 5000);
        }

    }
    $scope.fireMinister(minister) = function () {
        // Confirmation Dialogue
        const c = confirm("Are you sure you want to fire minister?");

        if (c === true) {
            const index = playerService.ministers.activeMinisters.indexOf(minister);

            playerService.ministers.activeMinisters.splice(index, 1);

            // Adding it back to the hire list.
            playerService.ministers.remainingMinisters.push(minister);

            // Handle bonuses
        }
    }

    //Laws
    $scope.enactLaw = function (index) {
        if (playerService.baseStats.influence < $scope.selectedLaw.influenceCost) return;
        if ($scope.laws.enactLaw(index)) {
            playerService.baseStats.influence -= $scope.selectedLaw.influenceCost;
        }
    }
    $scope.selectLawToDisplay = function (index) {
        $scope.selectedLaw = $scope.laws.unlockedLaws[index];
        $scope.selectedLawIndex = index;
    }
    //#endregion

    //#region UI Setup
    $scope.getProgressBarClass = function () {
        let className = "";
        const stabilityChange = $scope.selectedLaw.stabilityChange;
        if (stabilityChange > 0) className = 'progress-bar-success';
        if (stabilityChange < 0) className = 'progress-bar-danger';
        return className;
    }
    $scope.getProgressBarWidth = function () {
        const stabilityChange = $scope.selectedLaw.stabilityChange;
        return (5 + stabilityChange) * 10;
    }
    $scope.canAfford = function (lawData) {
        return playerService.baseStats.influence >= lawData.influenceCost;
    }
    $scope.isActive = function (lawData) {
        return lawData.isActive;
    }
    //#endregion


    //#region Private Methods
    var filterMinister = function (ministerType) {
        return this.allMinisters.filter(ministerObject => ministerObject.ministerType.includes(ministerType))[0];
    }

    //#endregion
});
