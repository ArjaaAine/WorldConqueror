"use strict";

wciApp.factory("ministerService", function(
  modalService,
  gameDataService,
  playerService,
) {

  class Ministers {
    constructor () {
      this.allMinisters = [];
      this.remainingMinisters = [];
      this.nextMinisterCost = 1;
      this.error = false;
      this.errorMessage = "";
    }

    init () {
      this.allMinisters = gameDataService.Ministers;
      this.remainingMinisters = this.allMinisters.filter(minister => minister.isActive === 1);
      this.activeMinisters = [];
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

      if (playerService.baseStats.influence > ministerCost) {
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
        const index = playerService.ministers.activeMinisters.indexOf(minister);

        playerService.ministers.activeMinisters.splice(index, 1);

        // Adding it back to the hire list.
        playerService.ministers.remainingMinisters.push(minister);

        // Handle bonuses
      }
    }

    filterMinister (ministerType) {
      return this.allMinisters.filter(ministerObject => ministerObject.ministerType.includes(ministerType))[0];
    }

    update () {

      // Write logic to update Influence Points
    }
  }

  return Ministers;

});
