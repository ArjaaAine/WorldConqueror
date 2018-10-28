wciApp.factory('bonusesService', function () {

    function Bonuses() {
        this.researchBonuses = {};
        this.lawsBonuses = {};
        this.ministersBonuses = {};
    }

    Bonuses.prototype.update = function (gameObj) {
        //We pass gameObj because it is initialized later on, so we can't pass Services.
        this.updateMinisters(gameObj.myCountry.ministers);
        this.updateResearch(gameObj.myCountry.research);
        this.updateLaws(gameObj.myCountry.laws);
    };

    Bonuses.prototype.init = function () {
      this.researchBonuses = {};
      this.lawsBonuses = {};
      this.ministersBonuses = {};
    };

    Bonuses.prototype.updateResearch = function (researchService) {
        let allBonuses = {};
        for (let i = 0; i < researchService.researchBonuses.length; i++) {
            for (let bonusProp in researchService.researchBonuses[i]) {
                if (researchService.researchBonuses[i].hasOwnProperty(bonusProp)) {
                    if (researchService.researchBonuses[i][bonusProp] >= 0) {
                        if (!allBonuses[bonusProp]) allBonuses[bonusProp] = 0;
                        allBonuses[bonusProp] += researchService.researchBonuses[i][bonusProp];
                    }
                }
            }
        }
        this.researchBonuses = allBonuses;
        console.log(this);
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

        // Commented out because activeMinisters need to be initialized somewhere so we dont ge an error here. 22-09-2018
        ministersService.activeMinisters.forEach(function (minister) {
            totalBonus[minister.statAffected] = totalBonus[minister.statAffected] || 0;
            totalBonus[minister.statAffected] += minister.statAdder;
        });
        this.ministersBonuses = totalBonus;

    };

    return new Bonuses();

});