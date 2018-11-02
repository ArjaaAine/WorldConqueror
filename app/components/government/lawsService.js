"use strict";
// eslint-disable-next-line
wciApp.factory("lawsService", function (gameDataService) {

  class Laws {
    constructor () {
      this.laws = [];// List of laws from excel/json file
      this.unlockedLaws = [];// List of unlocked laws from research/ministers
      this.activeLaws = [];// List of active laws
    }

    init () {
      this.laws = [];
      this.unlockedLaws = [];
      this.activeLaws = [];
      const self = this;

      gameDataService.Laws.forEach((law) => {
        self.laws.push(law);
      });
    }

    update () {
      // Update active laws for their duration.
      this.activeLaws.forEach((law) => {
        law.duration++;
      });
    }

    unlockLaw (id) {
      const law = this.filterLaw(id);

      if (law)
        this.unlockedLaws.push(law);
    }

    removeLaw (id) {
      // This is necessary if you fire a minister, it will remove a law from that minister.
      const law = this.filterLaw(id);

      this.unlockedLaws.splice(law, 1);
    }

    enactLaw (index) {
      const law = this.unlockedLaws[index];
      const lawType = law.type;// This is used to prevent from using same type of laws(e.x. one increase income, while other decreases)
      const filterSameType = this.filterLawByType(lawType);

      if (filterSameType)
        return;// It means that we found another law with the same "type"
      // TODO: We might want to tell the player that he cant active a law due to other of the same type being active.
      law.isActive = true;
      law.duration = 0;
      this.activeLaws.push(law);
    }

    repealLaw (index) {
      const law = this.unlockedLaws[index];
      const removeIndex = this.activeLaws.indexOf(law);

      law.duration = 0;
      this.activeLaws.splice(removeIndex, 1);
      law.isActive = false;
    }

    filterLawByType (lawType) {
      return this.activeLaws.filter(lawObject => lawObject.type === lawType)[0];
    }

    filterLaw (id) {
      return this.laws.filter(lawObject => lawObject.ID.includes(id))[0];
    }
  }

  return Laws;

});
