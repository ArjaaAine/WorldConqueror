wciApp.factory('bonusesService', function () {

    function Bonuses() {
        this.researchBonuses = {};
        this.lawsBonuses = {};
        this.ministersBonuses = {};
    }

    Bonuses.prototype.update = function (gameObj) {
        this.updateResearch(gameObj.myCountry.research);
        this.updateLaws(gameObj.myCountry.laws);
        this.updateMinisters(gameObj.myCountry.activeMinisters);
    };

    Bonuses.prototype.init = function () {
      this.researchBonuses = {};
      this.lawsBonuses = {};
      this.ministersBonuses = {};
    };

    Bonuses.prototype.updateResearch = function (researchService) {
        let allBonuses = {};
        for (let i = 0; i < researchService.bonuses.length; i++) {
            for (let bonusProp in researchService.bonuses[i]) {
                if (researchService.bonuses[i].hasOwnProperty(bonusProp)) {
                    if (researchService.bonuses[i][bonusProp] >= 0) {
                        if (!allBonuses[bonusProp]) allBonuses[bonusProp] = 0;
                        allBonuses[bonusProp] += researchService.bonuses[i][bonusProp];
                    }
                }
            }
        }
        this.researchBonuses = allBonuses;
    };

    Bonuses.prototype.updateLaws = function (lawsService) {
        let totalBonus = {};
        lawsService.activeLaws.forEach(function (law) {
            for(let lawProperty in law){
                if(law.hasOwnProperty(lawProperty)){
                    if(typeof law[lawProperty] === "string"){
                        totalBonus[lawProperty] = law[lawProperty];
                        continue;
                    }
                    if(!totalBonus[lawProperty]) totalBonus[lawProperty] = 0;
                    totalBonus[lawProperty] += law[lawProperty];
                }
            }
        });
        this.lawsBonuses = totalBonus;
      //unlock or lock laws.
    };

    Bonuses.prototype.updateMinisters = function (ministersService) {
        let totalBonus = {};

        //Commented out because activeMinisters need to be initialized somewhere so we dont ge an error here. 22-09-2018
        // ministersService.activeMinisters.forEach(function (minister) {
        //     totalBonus[minister.statAffected] = minister.statAdder;
        // });
        this.ministersBonuses = totalBonus;

    };

    return new Bonuses();

});