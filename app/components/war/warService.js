"use strict";
// eslint-disable-next-line
wciApp.service("warService", function
(
    worldCountryService,
    playerService,
) {

    class War {
        constructor () {
            this.battlefields = {}; // Key = countryCode, contains an array which stores all battles in progress... Merge battles sent by same person.
            this.unitDamageBonus = {
                land : { air: 1.5 },
                air  : { naval: 1.5 },
                naval: { land: 1.5 },
            };
        }

        init () {
            this.battlefields = {};
            this.unitDamageBonus = {
                land : { air: 1.5 },
                air  : { naval: 1.5 },
                naval: { land: 1.5 },
            };
        }

        // Called when declaring war, removed when making peace, including returning units to attackers.
        declareWar (countryCode) {
            const defenderAi = worldCountryService.allCountriesRulers[countryCode];
            const landLocked = defenderAi.getCountryData(countryCode).isLandLocked;
            let phase = 1;// Water battle by default

            if (!landLocked) phase = 2;// Land battle if country is not landlocked
            const battleFieldObj = {
                attacker      : playerService,
                defender      : defenderAi,
                countryAtStake: countryCode,
                isLandLocked  : landLocked,
                battlePhase   : phase, // Phase 1 = water battle, phase 2 = land battle, phase 3 = ?? etc.
            };

            defenderAi.isAtWar = true;
            this.getOrInitBattlefield(countryCode).battles.push(battleFieldObj);
            worldCountryService.updateColors(defenderAi);
        }

        getOrInitBattlefield (countryCode) {
            // Getting battlefield object
            let battlefield = this.battlefields[countryCode];

            if (battlefield !== undefined) return battlefield;

            // Initializing battlefield object
            battlefield = { battles: [] };
            this.battlefields[countryCode] = battlefield;

            return battlefield;
        }

        makePeace (countryCode, attacker) {
            const battles = this.battlefields[countryCode].battles;

            worldCountryService.allCountriesRulers[countryCode].isAtWar = false;

            // This is a partial support for multiple attackers, currently ai does not support ai vs ai...
            // Each country might be under attack from multiple attackers, so we need to check which one is making peace before returning units
            for (let i = 0; i < battles.length; i++) if (attacker === battles.attacker) this.returnUnits(countryCode, i);

        }

        sendUnits (units, countryCode, attacker) {
            // This code allows for multiple attackers to attack same country together.
            // eslint-disable-next-line
            for (const battlefieldObject of this.battlefields[countryCode].battles) {
                if (battlefieldObject.attacker === attacker) War.mergeUnits(battlefieldObject, units);
            }

        }

        // When you send units twice, they will be merged here to create a single battlefield for them.
        static mergeUnits (battlefieldObject, unitsToMerge) {
            for (const [ unitKey, amount ] of Object.entries(unitsToMerge)) {
                // Loose equality checks for null/undefined.
                if (battlefieldObject.attackerUnits == null) {
                    battlefieldObject.attackerUnits = {
                        land : 0,
                        air  : 0,
                        naval: 0,
                    };
                }
                battlefieldObject.attackerUnits[unitKey] += amount;
            }
        }

        returnUnits (countryCode, battleFieldIndex) {
            const attackerUnits = this.battlefields[countryCode].battles[battleFieldIndex].attackerUnits;
            const attacker = this.battlefields[countryCode].battles[battleFieldIndex].attacker;

            for (const [ unitType, unitAmount ] of Object.entries(attackerUnits)) {
                attacker.military.addUnit(unitType, unitAmount);
                attackerUnits[unitType] = 0;
            }
        }

        update () {
            this.updateBattlefields();
        }

        updateBattlefields () {
            for (const battlefieldInCountry of Object.values(this.battlefields)) {
                for (const [ battlefieldIndex, battlefield ] of battlefieldInCountry.battles.entries()) {
                    const attacker = battlefield.attacker;
                    const defender = battlefield.defender;
                    const attackerUnits = battlefield.attackerUnits;
                    const defenderUnits = defender.military.unitsAtHome;
                    const attackedCountry = battlefield.countryAtStake;

                    // This seem like repetition, but it happens before we start battle, we don't want to battle with no units.
                    // But we also want to know if our or enemy units died after the battle, hence the code below.
                    if (War.checkIfNoUnitsLeft(attackerUnits)) continue;

                    this.doBattle(battlefield);
                    if (War.checkIfNoUnitsLeft(defenderUnits)) {
                        // Attacker wins
                        War.addCountriesToTheAttacker(attacker, defender, attackedCountry);
                        if (defender.countries.length < 1) defender.isDefeated = true;
                        this.returnUnits(attackedCountry, battlefieldIndex); // Return units to the attacker.
                    } else if (War.checkIfNoUnitsLeft(attackerUnits)) {
                        // Defender wins
                        // Add war log information, set some booleans for displaying lost war page etc.
                    }
                }
            }
        }

        doBattle (battlefield) {
            const isLandLocked = battlefield.isLandLocked;

            // Each phase could take multiple turns, once it's over we should change to the next phase(or any other we want)
            if (isLandLocked && battlefield.battlePhase === 1) {
                // Phase 1: Water Battle
                const lockedUnitTypes = { land: true };
                const unitBlockingPhase = { naval: true };

                const isFinished = this.fight(battlefield, lockedUnitTypes, unitBlockingPhase);

                if (isFinished) battlefield.battlePhase++;

            } else if (battlefield.battlePhase === 2) {
                // Phase 2: Land battle
                const lockedUnitTypes = { naval: true };

                this.fight(battlefield, lockedUnitTypes);
            }

            // Can add more phases
        }

        // TODO: lockedUnitTypes can be improved to work for both attacker and defender(we can pass an object)
        fight (battlefield, lockedUnitTypes, unitBlockingPhase) {
            const attackerUnits = battlefield.attackerUnits;
            const defenderUnits = battlefield.defender.military.unitsAtHome;

            // Both battles happens "simultaneously" so both sides will attack with full force(as if no units were lost)
            // This will prevent you from annihilating opponent before he can kill any of your units.
            for (const unitType of Object.keys(attackerUnits)) {
                // One unit type will attack all unit types of enemy
                const attackerAllowedUnit = attackerUnits[unitType];
                const defenderAllowedUnit = defenderUnits[unitType];

                if (unitType !== lockedUnitTypes) {
                    const defenderKilledUnits = this.attack(attackerAllowedUnit, defenderUnits, battlefield.attacker, unitType);

                    War.removeKilledUnits(defenderUnits, defenderKilledUnits);
                }
                const attackerKilledUnits = this.attack(defenderAllowedUnit, attackerUnits, battlefield.defender, unitType);

                War.removeKilledUnits(attackerUnits, attackerKilledUnits);
            }
            if (defenderUnits[unitBlockingPhase] <= 0) { // Unlock next battle phase.
                return true;
            }

        }

        attack (attackingUnits, defendingSide, attacker, attackerUnitType) { // AttackingSide/defendingSide is for units that are CURRENTLY attacking enemy units.(it could be defender attacking the attacker)
            const killedUnits = {};

            for (const [ unitType, unitAmount ] of Object.entries(defendingSide)) {
                const attackerUnitDamageBonus = this.unitDamageBonus[attackerUnitType];// An object containing unit types that we have advantage towards to.
                let unitStrength = attacker.military.getUnitStrength(attackerUnitType);

                if (attackerUnitDamageBonus[attackerUnitType]) {
                    // Attacker will attack with bonus damage
                    unitStrength *= attackerUnitDamageBonus[attackerUnitType];
                }
                const unitDamage = unitStrength * attackingUnits;
                let unitsKilled = unitAmount - (unitAmount - unitDamage);

                if (unitsKilled < 0) unitsKilled = unitAmount; // Means we killed them all
                killedUnits[unitType] = unitsKilled;
            }

            return killedUnits;
        }

        static removeKilledUnits (units, killedUnits) {
            for (const [ unitType, unitAmount ] of Object.entries(killedUnits)) units[unitType] -= unitAmount;

        }

        static addCountriesToTheAttacker (attacker, defender, countryAtStake) {
            for (let i = defender.countries.length - 1; i >= 0; i--) {
                const countryData = defender.countries[i];// Defender country data

                if (countryData.countryCode === countryAtStake) {
                    attacker.addCountry(countryData);// Give attacker a country that belongs to a defender
                    defender.countries.splice(i, 1);// Remove that country from a defender
                    worldCountryService.changeCountryRuler(countryAtStake, attacker);// Change the ruler of a country for easy access later.
                    break;
                }
            }
        }

        static checkIfNoUnitsLeft (units) {
            if (!units) return true;// Units dont even exist, we might hardcode units tho
            for (const unit of Object.values(units)) if (unit > 0) return false;

            return true;
        }

    }

    return new War();
});
