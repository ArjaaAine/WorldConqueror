'use strict';

wciApp.factory('ministerService', function (
    modalService,
    gameDataService,
    playerService) {

    let Ministers = function () {
        this.allMinisters = [];
        this.nextMinisterCost = 1;
    };

    Ministers.prototype.init = function () {
        this.allMinisters = gameDataService.Ministers;
        this.activeMinisters = [];
    };

    Ministers.prototype.openMinisterHire = function () {
        var ministerCost = 1;
        var count = 0;
        console.log("test");
        //This is a factorial function
        playerService.ministers.activeMinisters.forEach(function (min) {
            count++;
            ministerCost * count;
        });
        let self = this;

        self.nextMinisterCost = ministerCost;

        //open modal

        var modalInstance = modalService.open({
            templateUrl: 'ministersHireModal.html',
            controller: 'ministersHiringModalController',
            size: 'md',
            resolve: {
                allMinisters: function () {
                    return self.allMinisters
                },
                nextMinisterCost: function () {
                    return self.nextMinisterCost
                }
            }
        });
        modalInstance.result.then(function (ministerType) {

            let minister = this.allMinisters.filter(function (ministerObject) {
                return ministerObject.ministerType.includes(ministerType);
            })[0];
            if (minister) playerService.ministers.activeMinisters.push(minister);
            //handle bonuses
        });
    };

    Ministers.prototype.fireMinister = function (ministerType) {
        //do popup to confirm. 
        let minister = filterMinister(ministerType);
        playerService.ministers.activeMinisters.splice(minister);

        //handle bonuses
    };

    var filterMinister = function (ministerType) {
        return Ministers().allMinisters.filter(function (ministerObject) {
            return ministerObject.ministerType.includes(ministerType);
        })[0];
    };

    Ministers.prototype.update = function () {

        //Write logic to update Influence Points
    };

    return Ministers;

});

function filterArray(array, name) {
    return array.filter(function (str) {
        return str.ID.includes(name);
    })[0];
}