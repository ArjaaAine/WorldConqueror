'use strict';

wciApp.factory('ministerService', function (modalService,gameDataService) {

    let Ministers = function () {
        this.allMinisters = [];//list of laws from excel/json file
        this.activeMinisters = [];//list of active laws
        this.nextMinisterCost = 1;
    };

    Ministers.prototype.init = function () {
        this.allMinisters = gameDataService.Ministers;
        this.activeMinisters = [];
        let self = this;
    };

    Ministers.prototype.openMinisterHire = function () {
        var ministerCost = 1;
        var count = 0;

        //This is a factorial function
        this.activeMinisters.forEach(function (min) {
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
            let minister = this.filterMinister(ministerType);
            if (minister) this.activeMinisters.push(minister);

            //handle bonuses
        });
    };

    //Ministers.prototype.hireMinister = function (ministerType) {
    //    let minister = this.filterMinister(ministerType);
    //    if (minister) this.activeMinisters.push(minister);

    //    //handle bonuses
    //};

    Ministers.prototype.fireMinister = function (ministerType) {
        let minister = this.filterMinister(ministerType);
        this.activeMinisters.splice(minister);

        //handle bonuses
    };

    Ministers.prototype.filterMinister = function (ministerType) {
        return this.ministers.filter(function (ministerObject) {
            return ministerObject.ministerType.includes(ministerType);
        })[0];
    };

    return new Ministers();

});