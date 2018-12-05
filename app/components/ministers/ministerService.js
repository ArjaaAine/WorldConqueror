"use strict";
// eslint-disable-next-line
wciApp.factory("ministerService", function(
  modalService,
  gameDataService,
  playerService,
  leaderService,
) {

  class Ministers {
    constructor () {
      this.allMinisters = [];
      this.remainingMinisters = [];
      this.nextMinisterCost = 0;
      this.error = false;
      this.errorMessage = "";
      this.activeMinisters = [];
      this.maxMinisters = 5;
    }

    init () {
      const leaderMinisterAdder = leaderService.bonusCalculator("maxMinisters", 0);

      this.maxMinisters = 5 + leaderMinisterAdder;
      this.allMinisters = gameDataService.Ministers;
      this.remainingMinisters = this.allMinisters.filter(minister => minister.isActive === 1);
      console.log(this.maxMinisters);
    }

    openMinisterHire () {
      let ministerCost = 1;
      let count = 0;

      // This is a factorial function
      playerService.ministers.activeMinisters.forEach((min) => {
        count += 100;
        ministerCost *= count;
      });
      const self = this;

      self.nextMinisterCost = ministerCost;

      if (this.activeMinisters.length < 1) {
        ministerCost = 0;
        this.nextMinisterCost = 0;
      }

      if (playerService.baseStats.influence >= ministerCost) {
        this.error = false;

        // Open modal
        const modalInstance = modalService.open({
          templateUrl: "ministersHireModal.html",
          controller : "ministersHiringModalController",
          size       : "md",
          resolve    : {
            remainingMinisters () {
              return self.remainingMinisters;
            },
            nextMinisterCost () {
              return self.nextMinisterCost;
            },
          },
        });

        modalInstance.result.then((ministerType) => {

          const minister = self.filterMinister(ministerType);

          if (minister) {
            playerService.ministers.activeMinisters.push(minister);
            const index = playerService.ministers.remainingMinisters.indexOf(minister);

            playerService.ministers.remainingMinisters.splice(index, 1);
            playerService.baseStats.influence -= ministerCost;
          }

          // Handle bonuses
        });

      } else {
        this.error = true;
        this.errorMessage = `You do not have enough influence. You need a total of ${ministerCost} influence.`;
      }

    }

    fireMinister (minister) {
      // Confirmation Dialogue
      const c = confirm("Are you sure you want to fire minister?");

      if (c === true) {
        const index = this.activeMinisters.indexOf(minister);

        this.activeMinisters.splice(index, 1);

        // Adding it back to the hire list.
        this.remainingMinisters.push(minister);

        // Handle bonuses
      }
    }

    filterMinister (ministerType) {
      return this.allMinisters.filter(ministerObject => ministerObject.ministerType.includes(ministerType))[0];
    }

    update () {
      const playerInfluence = playerService.baseStats;
      let influenceGain = 0;

      for (const minister of this.activeMinisters.values()) influenceGain += minister.influencePT;
      playerInfluence.influence += influenceGain;
    }
  }

  return Ministers;

});
