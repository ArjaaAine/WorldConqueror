'use strict';

wciApp.factory('ministerService', function (
    modalService,
    gameDataService,
    playerService) {

    let Ministers = function () {
        this.allMinisters = [];
        this.remainingMinisters = [];
        this.nextMinisterCost = 1;
    };

    Ministers.prototype.init = function () {
        this.allMinisters = gameDataService.Ministers;
        this.remainingMinisters = gameDataService.Ministers;
        this.activeMinisters = [];
    };

    Ministers.prototype.openMinisterHire = function () {
        let ministerCost = 1;
        let count = 0;

        //This is a factorial function
        playerService.ministers.activeMinisters.forEach(function (min) {
            count++;
            ministerCost *= count;
        });
        let self = this;

        self.nextMinisterCost = ministerCost;

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
            }
            //handle bonuses
        });
    };

    Ministers.prototype.fireMinister = function (ministerType) {
        //do popup to confirm. 

        let minister = filterMinister(ministerType);
        var index = playerService.ministers.activeMinisters.indexOf(minister);
        playerService.ministers.activeMinisters.splice(index, 1);

        //Adding it back to the hire list.
        playerService.ministers.remainingMinisters.push(minister);

        //handle bonuses
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