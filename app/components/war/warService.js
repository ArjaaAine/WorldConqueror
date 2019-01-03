"use strict";
// eslint-disable-next-line
wciApp.service("warService", function
(
  worldCountryService,
  playerService,
  gameDataService,
) {

  class War {
    constructor () {
      this.currentBattles = [];// Array of objects;
      this.currentlyAtWar = [];
      this.currentWarIndex = 0;// This helps to track current index when we do battle, so war log can be updated.
      this.unitsQueue = {};
      this.warLog = [];
    }

    init () {
      this.currentBattles = [];
      this.currentlyAtWar = [];
    }

    initBattle (attacker, defender) {
      console.log(attacker);
      console.log(defender);
    }

    isCountryAtWar (countryCode) {
      const aiPlayerIndex = worldCountryService.getAiIndexByCountryCode(countryCode);

      return this.isAtWar(aiPlayerIndex);
    }

    isAtWar (aiPlayerIndex) {
      return this.currentlyAtWar.indexOf(aiPlayerIndex);// It will return -1 if it can't find
    }

    declareWar (countryCode) {
      const aiPlayerIndex = worldCountryService.getAiIndexByCountryCode(countryCode);

      if (this.isAtWar(aiPlayerIndex) !== -1) return;// Already at war

      this.currentlyAtWar.push(aiPlayerIndex);// Later pass an object with queue/warLog(to separate war log from each AI)
      worldCountryService.updateColors(aiPlayerIndex);
      playerService.military.unitsAtWar[this.currentlyAtWar.length - 1] = [];
      this.addToWarLog(`You have declared war against ${countryCode}`);
    }

    makePeace (aiPlayerIndex) {
      const getAiAtWarIndex = this.currentlyAtWar.indexOf(aiPlayerIndex);
      const playerUnitsInBattle = playerService.military.unitsAtWar[aiPlayerIndex];
      let canMakePeace = true;

      // TODO: Check if player has any units in enemy country(loop + check for count > 0 and/or if array length > 0)
      for (let i = 0; i < playerUnitsInBattle.length; i++) {
        const unit = playerUnitsInBattle[i];

        if (unit.count > 0) {
          console.log("##### Cannot make peace, because you have units in that country! #####");
          canMakePeace = false;
          break;
        }
      }
      if (canMakePeace) this.removeCountryAtWar(getAiAtWarIndex, this.currentlyAtWar[aiPlayerIndex]);

    }

    canReturnUnits (countryIndex) {
      return playerService.military.unitsAtWar[countryIndex].length > 0;
    }

    returnUnits (countryIndex) {
      const playerUnitsInBattle = playerService.military.unitsAtWar[countryIndex];

      for (let i = playerUnitsInBattle.length - 1; i >= 0; i--) {
        const unit = playerUnitsInBattle[i];

        if (unit.count > 0) playerService.military.unitsAtHome[i].count += unit.count;
        unit.count = 0;
      }
      playerService.military.unitsAtWar[countryIndex] = [];
    }

    checkIfUnitsInQueue  (aiAttackedIndex) {
      return this.unitsQueue[`AI_${aiAttackedIndex}`];
    }
    addTroopsToQueue (troops, aiAttackedIndex) {
      if (!this.unitsQueue[`AI_${aiAttackedIndex}`]) {
        this.unitsQueue[`AI_${aiAttackedIndex}`] = {};
        this.unitsQueue[`AI_${aiAttackedIndex}`].troops = [];
        this.unitsQueue[`AI_${aiAttackedIndex}`].targetCountryIndex = aiAttackedIndex;
      }

      for (const [ index, unit ] of troops.entries()) {
        const count = unit.count;

        playerService.military.unitsAtHome[index].count -= count;
      }

      // Remove units from player after sending.

      this.unitsQueue[`AI_${aiAttackedIndex}`].troops.push(troops);
    }

    update () {
      this.sendTroops();
    }

    sendTroops () {
      for (const queueData of Object.values(this.unitsQueue)) {
        const troops = queueData.troops;
        const targetCountryIndex = queueData.targetCountryIndex;

        for (let i = troops.length - 1; i >= 0; i--) {
          for (let j = 0; j < troops[i].length; j++) {
            if (!playerService.military.unitsAtWar[targetCountryIndex][j]) {
              playerService.military.unitsAtWar[targetCountryIndex][j] = {};
              playerService.military.unitsAtWar[targetCountryIndex][j] = troops[i][j];
            } else {
              playerService.military.unitsAtWar[targetCountryIndex][j].count += troops[i][j].count;
            }
          }
        }
      }
      this.unitsQueue = {};// Remove queue;
      console.log(playerService.military);
    }

    addToWarLog (text) {
      text = `${1900 + playerService.baseStats.currentTurn}: ${text}`;
      this.warLog.push(text);
    }

    doBattle () {
      // Calculate battle
      for (let i = this.currentlyAtWar.length - 1; i >= 0; i--) {
        this.currentWarIndex = i;
        const aiPlayerIndex = this.currentlyAtWar[i];

        // Here we start the battle calculations and/or battle stages...
        const enemyAi = worldCountryService.AiPlayers[aiPlayerIndex];// Used in defense in this case
        const aiMilitary = enemyAi.military.unitsAtHome;
        const playerMilitary = playerService.military.unitsAtWar[i];// Current player units in battle, we use them to calculate the result...

        console.log("AI MILITARY:");
        console.log(aiMilitary);
        console.log("PLAYER MILITARY:");
        console.log(playerMilitary);

        if (playerMilitary.length) {
          this.addToWarLog("Battle round begins <<DEBUG>>");
          this.calculateResult(playerMilitary, enemyAi, i);
        } else {
          console.log("<<DEBUG>>Player/Attacker has no units sent, so the fight can't begin...It's intentional, as player needs to send units to attack enemy country");
        }

        //* * Check winning conditions **//
        if (enemyAi.getTotalStrength() <= 0) {
          console.log("Enemy country has no units left, you won!");
          for (let i = 0; i < enemyAi.countries.length; i++) playerService.addCountry(enemyAi.countries[i]);

          this.returnUnits(i);
          worldCountryService.removeAi(aiPlayerIndex);
          this.removeCountryAtWar(i, aiPlayerIndex);
        }
      }
    }

    removeCountryAtWar (index, aiPlayerIndex) {
      worldCountryService.removeAiCountriesColor(aiPlayerIndex);
      worldCountryService.update();
      this.currentlyAtWar.splice(index, 1);
    }

    calculateResult (playerTroops, enemyCountry, countryAtWarIndex) {
      const playerTotalAttack = playerService.military.getAllUnitsTotalAttack(false, countryAtWarIndex);
      const playerTotalDefense = playerService.military.getAllUnitsTotalDefense(false, countryAtWarIndex);
      const enemyTotalAttack = enemyCountry.getTotalStrength() / 2;// Need to change it later for actual attack/defense function
      const enemyTotalDefense = enemyCountry.getTotalStrength() / 2;
      const enemyTroops = enemyCountry.military.unitsAtHome;// Since enemy is defending, in the future when enemies get the ability to declare war and invade the player, it will need to be changed.

      console.log("Player Attack/Defense...Enemy Attack/Defense");
      console.log(playerTotalAttack, playerTotalDefense, enemyTotalAttack, enemyTotalDefense);

      //* * CALCULATE THE BATTLE RESULT HERE USING A LOOP OR SOMETHING :X **//
      // make copies of defeated unit so we can remove them later...
      //* * IMPORTANT **/
      //* * You can move "killUnits" method below if you want "fair" battles, otherwise battles will be "turn based" and first attacker will have a huge advantage
      const enemyLostUnits = this.calculateBattleResult(playerTotalAttack, enemyTroops);// Calculate how many enemy units "die" after this battle

      this.killUnits(enemyLostUnits, enemyTroops);// KILL THOSE UNITS HERE, MOVE IT DOWN IF U WANT TO KILL THEM LATER
      const playerLostUnits = this.calculateBattleResult(enemyTotalAttack, playerTroops);// If you KILLED some of the units, this player will be "WEAKER" since he already lost some of the units.

      this.killUnits(playerLostUnits, playerTroops);
      this.addToWarLog("Both sides took some casualties after this year of battling");

    }

    calculateBattleResult (attackerPower, defender) { // AttackerPower is basically total attack power of units.
      const sortedUnitsByFrontOrder = [];

      angular.copy(gameDataService.Units, sortedUnitsByFrontOrder);
      sortedUnitsByFrontOrder.sort(this.sortByFrontOrder);

      // Do calculations on the copy, then overwrite real data with copied(we only care about count of units for now)
      // The reason is that we want to avoid sorting real array, because we use array index as a way to find specific unit.
      const defenderLostUnits = [];

      for (let i = 0; i < sortedUnitsByFrontOrder.length; i++) {
        const unit = sortedUnitsByFrontOrder[i];
        const unitId = unit.id;

        if (!defender[unitId].count) continue;// Dont bother with calculations of unit count is 0;
        const chanceToDie = unit.chanceToDie;// This could be renamed, it basically tells how many % of those units can be killed in a single turn, until attack power is used up
        const unitsAboutToDie = Math.round(attackerPower / unit.defense);// How many units we are capable of killing. Round up to avoid any problems with left over attack and infinite loops...
        let unitsActuallyKilled = Math.ceil(unitsAboutToDie * chanceToDie);// It will round up to 1.

        if (!unitsActuallyKilled) continue;// If there are 0 units to kill
        if (unitsActuallyKilled > defender[unitId].count) unitsActuallyKilled = defender[unitId].count;

        defenderLostUnits.push({ id   : unitId,
          count: unitsActuallyKilled });
      }

      return defenderLostUnits;
    }

    killUnits (unitsToKill, troopsToDeleteFrom) {
      for (let j = 0; j < unitsToKill.length; j++) {
        const id = unitsToKill[j].id;// Id to reference an array
        const count = unitsToKill[j].count;// How many units died in battle

        troopsToDeleteFrom[id].count -= count;// Should never go below 0;
        if (troopsToDeleteFrom[id].count < 0) console.log("SOMETHING WENT WRONG, YOUR UNIT COUNT IS LESS THAN 0");
      }

      console.log(troopsToDeleteFrom);
    }

    sortByFrontOrder (a, b) {
      // Pass this to Array.sort(this.sortByFrontOrder) to sort array of object based on property numerical value;
      return a.frontOrder - b.frontOrder;
    }
  }

  return new War();
});
