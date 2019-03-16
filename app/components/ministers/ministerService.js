"use strict";
// eslint-disable-next-line
wciApp.factory("ministerService", function (
    gameDataService,
    playerService,
    leaderService,
) {

    const ministers = {};

    //#region Generic Methods
    ministers.init = function () {
        const leaderMinisterAdder = leaderService.bonusCalculator("maxMinisters", 0);

        this.nextMinisterCost = 0;

        this.remainingMinisters = [];
        this.allMinisters = [];
        this.activeMinisters = [];
        this.maxMinisters = 5 + leaderMinisterAdder;
        this.allMinisters = gameDataService.Ministers;
        this.remainingMinisters = this.allMinisters.filter(minister => minister.isActive === 1);

        this.error = false;
        this.errorMessage = "";
    }
    ministers.dispose = function () {
        this.error = false;
    }
    ministers.update = function () {
        const playerInfluence = playerService.baseStats;
        let influenceGain = 0;

        for (const minister of this.activeMinisters.values()) influenceGain += minister.influencePT;
        playerInfluence.influence += influenceGain;
    }
    //#endregion
         
    return ministers;

});
