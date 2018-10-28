'use strict';

wciApp.factory('ministerService', function (
    modalService,
    gameDataService,
    playerService) {

    let Ministers = function () {
        this.allMinisters = [];
        this.remainingMinisters = [];
        this.nextMinisterCost = 1;
        this.error = false;
        this.errorMessage = "";
    };

    Ministers.prototype.init = function () {
        this.allMinisters = gameDataService.Ministers;
        this.remainingMinisters = this.allMinisters.filter(function (minister) {
            return minister.isActive === 1;
        });
        this.activeMinisters = [];
    };

    Ministers.prototype.openMinisterHire = function () {
        let ministerCost = 1;
        let count = 0;

        //This is a factorial function
        playerService.ministers.activeMinisters.forEach(function (min) {
            count += 100;
            ministerCost *= count;
        });
        let self = this;

        self.nextMinisterCost = ministerCost;

        if (playerService.baseStats.influence > ministerCost) {
            this.error = false;
            //open modal
            let modalInstance = modalService.open({
                templateUrl: 'ministersHireModal.html',
                controller: 'ministersHiringModalController',
                size: 'md',
                resolve: {
                    remainingMinisters: function () {
                        return self.remainingMinisters
                    },
                    nextMinisterCost: function () {
                        return self.nextMinisterCost
                    }
                }
            });

            modalInstance.result.then(function (ministerType) {

                let minister = self.filterMinister(ministerType);
                if (minister) {
                    playerService.ministers.activeMinisters.push(minister);
                    var index = playerService.ministers.remainingMinisters.indexOf(minister);
                    playerService.ministers.remainingMinisters.splice(index, 1);
                    playerService.baseStats.influence -= ministerCost;
                }
                //handle bonuses
            });

        } else {
            this.error = true;
            this.errorMessage = "You do not have enough influence. You need a total of " + ministerCost + " influence.";
        }

        
    };

    Ministers.prototype.fireMinister = function (minister) {
        //Confirmation Dialogue
        var c = confirm("Are you sure you want to fire minister?");
        if (c == true) {
            var index = playerService.ministers.activeMinisters.indexOf(minister);
            playerService.ministers.activeMinisters.splice(index, 1);

            //Adding it back to the hire list.
            playerService.ministers.remainingMinisters.push(minister);

            //handle bonuses
        }
    };

    Ministers.prototype.filterMinister = function (ministerType) {
        return this.allMinisters.filter(function (ministerObject) {
            return ministerObject.ministerType.includes(ministerType);
        })[0];
    };

    Ministers.prototype.update = function () {

        //Write logic to update Influence Points
    };

    return Ministers;

});