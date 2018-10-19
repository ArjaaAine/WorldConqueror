'use strict';

wciApp.factory('researchService', function (playerService, gameDataService) {

    //constructor store all researches, each time we complete a research we add index + 1 to current research type...
    let Research = function () {
        this.types = [];//array of research types: "Economy", "War", etc. Each has an array of total researches...
        this.currentResearchTypeIndex = 0;//type as "War/Economy/Construction" -> index of a type which we currently research
        this.researchProgress = [
            {level: 0, points: 0},
            {level: 0, points: 0},
            {level: 0, points: 0}
        ];
        this.bonuses = [];
    };

    Research.prototype.init = function (){
        let research = gameDataService.ResearchData;
        let researchBonuses = gameDataService.ResearchBonuses;
        let temporaryTypes = {}; //Used inside a loop, so we don't push too many objects at once. Like War/Economy(we only need 1 of each)
        let currentIndex = -1; //start at -1 because we are adding +1 for each new type, and we want to start at 0...
        //empty the object
        this.types = [];
        this.currentResearchTypeIndex = 0;
        this.researchProgress = [];
        this.bonuses = [];

        //Initialize object with data from excel
        for (let i = 0; i < research.length; i++) {
            //loop through all researches
            let researchData = research[i];
            researchData.bonuses = researchData.bonuses || [];
            researchData.currentBonus = null;
            researchData.bonuses.push(filterArrayResearch(researchBonuses, researchData.bonus_1));
            researchData.bonuses.push(filterArrayResearch(researchBonuses, researchData.bonus_2));
            //Delete 2 properties that we no longer need
            delete researchData.bonus_1;
            delete researchData.bonus_2;
            let type = researchData.researchType;
            if (!temporaryTypes[type]) {
                temporaryTypes[type] = type;
                this.researchProgress.push({
                    level: 0, points: 0
                });
                currentIndex++;//increase current index, so we can create an array for each type
                this.types[currentIndex] = {};
                this.types[currentIndex].name = type;
            }//If type does not exist, we add it to temporary variable, so we don't repeat it. Type is research type like "War, Economy"
            if (!this.types[currentIndex].researchList) this.types[currentIndex].researchList = [];
            this.types[currentIndex].researchList.push(researchData);
        }

        //TODO: Once we use vertical progress bar, we might need to reverse an array in order to display lvl 1 research at the bottom.
        // for(var researchType in this.types){
        //     this.types[researchType].researchList.reverse();
        // }
    };

    Research.prototype.chooseResearch = function (researchTypeIndex) {
        //Choose research type we want to research and set index to it, so we know which one to update after new turn
        this.currentResearchTypeIndex = researchTypeIndex;
        console.log(this.types[this.currentResearchTypeIndex]);
    };

    Research.prototype.chooseBonus = function (bonusTypeIndex, researchIndex, researchTypeIndex) {
        let currentResearch = this.types[researchTypeIndex].researchList[researchIndex];
        if (currentResearch.isUnlocked && !currentResearch.bonusGiven) {
            currentResearch.bonusGiven = true;
            currentResearch.bonusGivenIndex = bonusTypeIndex;
            this.bonuses.push(currentResearch.bonuses[bonusTypeIndex]);
        }
    };

    Research.prototype.update = function () {
        let currentResearchProgress = this.getCurrentResearchProgress();
        let currentResearchList = this.getCurrentResearchList();//List of researches based on current type being researched(War/Economy...)
        let currentResearch = currentResearchList[currentResearchProgress.level];

        currentResearchProgress.points += playerService.baseStats.baseResearchPoints;
        if(!currentResearch) return;//return if we reach the end of an array
        if(currentResearchProgress.points >= currentResearch.cost){
            //TODO: Important to unlock laws before adding a level to the research
            let lawUnlock = currentResearch.lawUnlock;
            playerService.laws.unlockLaw(lawUnlock);
            currentResearchProgress.level++;
            currentResearch.isUnlocked = true;
            //TODO: Need to check if we reached max research level, to prevent further progress and errors :|
            console.log("Research Unlocked");
        }
    };

    //Helper methods
    Research.prototype.getCurrentResearchProgress = function() {
        return this.researchProgress[this.currentResearchTypeIndex];
    };
    Research.prototype.getCurrentResearchList = function (){
        return this.types[this.currentResearchTypeIndex].researchList;//List of researches based on current type being researched(War/Economy...)
    };

    return Research;

});

function filterArrayResearch(array, name) {
    return array.filter(function (str) {
        return str.ID.includes(name);
    })[0];
}

//Internet - improves research
//Globalization - improves economy
//Energy Grid - imrpoves economy.. max housing capacity of structure
//Horticulture - Food
//Fertilizer

//{
//    name: "Tech1",
//    cost: 1,
//    isUnlocked: true,
//    isCompleted: false,
//    researchIcon: 'fa-flask',
//    countryStat: '',
//    countryStatAffect: '',
//    structureType: '',
//    building: '',
//    buildingStat: '',
//    buildingStatAffect: '',
//    militaryType: '',
//    unit: '',
//    unitStat: '',
//    unitStatAffect: '',
//    researchType: '',
//    tech: '',
//    techStat: '',
//    tectStatAffect: ''
//}