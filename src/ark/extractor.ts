"use strict";

/**
 * @fileOverview Contains the ASBM.Extraction Object
 */

import { TORPOR, FOOD, SPEED } from '../consts';
import { Stat, VueCreature } from './creature';
import * as Ark from '../ark';
import * as Utils from '../utils';

export class Extractor {
   c: VueCreature;

   wildFreeMax = 0;
   domFreeMax = 0;
   levelBeforeDom = 0;
   unusedStat = false;
   options: Stat[][] = [];
   minIB = 0;
   maxIB = 0;
   checkedStat: boolean[] = [];

   constructor(vueCreature) {
      this.c = vueCreature;
      // FIXME: TS-MIGRATION: Should we be storing `m` inside the VueCreature? I've added m:any to VueCreature to handle this for now.
      this.c.m = Ark.GetMultipliers(this.c.serverName, this.c.species);

      // TODO: Add consider wild levels
      // Only way to calculate wild levels is with a TE
      // Creatures like gigas are unaffected, just as if they were bred
      // The code is already laid out to handle support for considerWildLevelSteps
      // Will have to implement a WildLevel override for 100% TE, if a creature was tamed that way
      //    It's likely it was force tamed anyways (possibly spawned + tamed)
      // Should not rely on wild level steps as, it will speed up extraction, but not everyone may set it :(

      // considerWildLevelSteps = considerWildLevelSteps && !bred;
   }

   extract(dbg?: any) {
      // TODO: Add either a way to throw errors w/ codes (for specific reasons like bad multipliers, stats, etc.)
      //    Or provide an alternative method (returning under bad situations is acceptable for now)

      // Make sure we initialize specific variables before extraction
      this.init();

      let tempStat = new Stat();

      // A lot quicker if wild
      if (this.c.wild) {
         for (let i = 0; i < 8; i++) {
            tempStat.calculateWildLevel(this.c.m[i], this.c.values[i]);

            // Redundant check to make sure our math matches Ark's math
            if (this.c.values[i] === Utils.RoundTo(tempStat.calculateValue(this.c.m[i]), Ark.Precision(i)))
               this.c.stats[i].push(new Stat(tempStat));
         }
         return;
      }

      // Calculate the torpor stat since it doesn't accept dom levels
      tempStat.calculateWildLevel(this.c.m[TORPOR], this.c.values[TORPOR], (!this.c.wild), this.c.TE, this.c.IB);
      this.c.stats[TORPOR].push(new Stat(tempStat));
      if (dbg) dbg.levelFromTorpor = tempStat.Lw;

      // Calculate the max number of levels based on level and torpor
      this.wildFreeMax = this.c.stats[TORPOR][0].Lw;
      this.levelBeforeDom = this.c.stats[TORPOR][0].Lw + 1;
      this.domFreeMax = Math.max(this.c.level - this.wildFreeMax - 1, 0);

      // If it's bred, we need to do some magic with the IB
      if (this.c.bred)
         this.dynamicIBCalculation();

      // Loop all stats except for torpor
      for (let i = 0; i < 7; i++) {
         tempStat = new Stat;

         // Covers unused stats like oxygen
         if (this.uniqueStatSituation(tempStat, i))
            continue;

         else {
            // Calculate the highest Lw could be
            var maxLw = tempStat.calculateWildLevel(this.c.m[i], this.c.values[i], !this.c.wild, 0, this.c.IB);

            if (maxLw > this.levelBeforeDom || (maxLw === 0 && this.c.m[i].Iw === 0))
               maxLw = this.levelBeforeDom;

            // Loop all possible Lws
            for (tempStat.Lw = maxLw; tempStat.Lw >= 0; tempStat.Lw--) {
               // Calculate the highest Ld could be
               var maxLd = tempStat.calculateDomLevel(this.c.m[i], this.c.values[i], !this.c.wild, 0, this.c.IB);

               // If Ld is greater than the highest dom possible, quit the loop
               if (maxLd > this.domFreeMax && !this.c.m[i].Tm)
                  break;

               // We don't need to calculate TE to extract the levels
               if (this.c.bred || this.c.m[i].Tm <= 0) {
                  this.nonTEStatCalculation(tempStat, i, maxLd);
               }

               // If this stat has a Tm and is tamed, we need to manually loop through the Ld
               else
                  this.findTEStats(tempStat, i, maxLd);
            }
         }
      }

      // Only filter results if we have a result for every stat
      for (let i = 0; i < 7; i++) {
         if (this.c.stats[i].length === 0) {
            if (dbg) dbg.failReason = "No options found for stat " + i;
            return;
         }
      }

      // Don't need to filter results if wild
      if (this.c.wild)
         return;

      // Only need to filter results if there is more than 1 possibility
      for (let i = 0; i < 7; i++) {
         if (this.c.stats[i].length > 1) {
            if (dbg) dbg.preFilterStats = Utils.DeepCopy(this.c.stats);
            this.filterResults(dbg);
            break;
         }
      }

      // Clean up the creature and stats objects (more for better looking objects in console)
      for (let i = 0; i < 7; i++) {
         for (let j = 0; this.c.m[i].Tm && j < this.c.stats[i].length; j++) {
            delete this.c.stats[i][j].minTE;
            delete this.c.stats[i][j].maxTE;
         }
      }

      // Proof of Concept for Generating options
      if (!this.options.length)
         this.generateOptions(dbg);
      return;
   }

   init() {
      // Make sure the multipliers haven't changed
      this.c.m = Ark.GetMultipliers(this.c.serverName, this.c.species);

      // Clear the checked property for future extractions
      for (let i = 0; i < 8; i++) {
         // Reset the stats so we can get a fresh start
         this.c.stats[i] = [];
      }

      // Change variables based on wild, tamed, bred
      if (this.c.wild)
         this.c.TE = this.c.IB = 0;

      else if (this.c.tamed)
         this.c.IB = 0;

      else
         this.c.TE = 1;

      this.wildFreeMax = 0;
      this.domFreeMax = 0;
      this.levelBeforeDom = 0;
      this.unusedStat = false;
      this.options = [];
      this.minIB = 0;
      this.maxIB = 0;
      this.checkedStat = [];
   }

   /**
    *  Attempts to calculate a valid Imprint Bonus from the one entered. While it doesn't support the same "Exactly" option that ASB does,
    *    it does first attempt to look at the entered IB to see if it's valid first. Unfortunately, that also means that the IB must be rounded
    *    before the Extractor can use it as the assumption is made (to create the min/max IB) that 0.05 in either direction is still valid.
    *
    *  @return {undefined} There is no returned value
    */
   dynamicIBCalculation() {
      // If the entered IB works, we don't need to do anything else (Torpor can't be leveled and typically has a large value to start with)
      if (this.c.values[TORPOR] === Utils.RoundTo(this.c.stats[TORPOR][0].calculateValue(this.c.m[TORPOR], !this.c.wild, this.c.TE, this.c.IB), Ark.Precision(TORPOR)))
         return;

      // Extract the IB from Torpor
      // TODO: Add a redundant check for IBM not being set. IB shouldn't extract to more than 0.05 in either direction if set properly.
      // May not be necessary as extract should return if the Torpor Lw calculated was too high
      this.c.IB = this.c.stats[TORPOR][0].calculateIB(this.c.m[TORPOR], this.c.values[TORPOR]);

      // Generate the min/max values for future edge cases (applicable in all situations)
      // FIXME: Tries to check min/max of new IB, not the input one. This should also go before the first conditional
      this.maxIB = Math.min(this.c.stats[TORPOR][0].calculateIB(this.c.m[TORPOR], this.c.values[TORPOR] + (0.5 / Math.pow(10, Ark.Precision(TORPOR)))), this.c.IB + (5 / 10E3));
      this.minIB = Math.max(this.c.stats[TORPOR][0].calculateIB(this.c.m[TORPOR], this.c.values[TORPOR] - (0.5 / Math.pow(10, Ark.Precision(TORPOR)))), this.c.IB - (5 / 10E3));

      // Check the food stat for the IB as well (Only works if food is unleveled)
      var tempHealthStat = new Stat();
      tempHealthStat.calculateWildLevel(this.c.m[FOOD], this.c.values[FOOD], !this.c.wild, this.c.TE, this.c.IB);
      var imprintingBonusFromFood = tempHealthStat.calculateIB(this.c.m[FOOD], this.c.values[FOOD]);

      // Check to see if the new IB still allows torpor to extract correctly
      if (this.c.values[TORPOR] === Utils.RoundTo(this.c.stats[TORPOR][0].calculateValue(this.c.m[TORPOR], !this.c.wild, this.c.TE, imprintingBonusFromFood), Ark.Precision(TORPOR)))
         this.c.IB = imprintingBonusFromFood;

      // IB can't be lower than 0
      if (this.c.IB < 0)
         this.c.IB = 0;
   }

   uniqueStatSituation(tempStat, statIndex) {
      // IF a stat isn't used, set it to -1 and continue
      if (this.c.m[statIndex].notUsed) {
         this.c.values[statIndex] = Utils.RoundTo(tempStat.calculateValue(this.c.m[statIndex], !this.c.wild, this.c.TE, this.c.IB), Ark.Precision(statIndex));
         this.unusedStat = true;
         this.c.stats[statIndex] = [new Stat(-1, 0)];
         return true;
      }

      // We can't calculate speed if a stat is unused
      else if (this.unusedStat && statIndex === SPEED) {
         // Calculate DOM for speed
         this.c.stats[SPEED] = [new Stat(-1, tempStat.calculateDomLevel(this.c.m[statIndex], this.c.values[statIndex], !this.c.wild, 0, this.c.IB))];
         this.domFreeMax -= this.c.stats[SPEED][0].Ld;
         this.checkedStat[statIndex] = this.checkedStat[SPEED] = true;
         return true;
      }

      // Creatures that don't increase Speed on imprint also don't level the stat
      // FIXME: It's true for all flyers, including CF flyers that allow IB of Speed
      else if (!this.c.m[statIndex].IBM && statIndex === SPEED) {
         // Calculate DOM for speed
         this.c.stats[SPEED] = [new Stat(0, tempStat.calculateDomLevel(this.c.m[statIndex], this.c.values[statIndex], !this.c.wild, 0, this.c.IB))];
         this.domFreeMax -= this.c.stats[SPEED][0].Ld;
         this.checkedStat[statIndex] = this.checkedStat[SPEED] = true;
         return true;
      }

      return false;
   }

   nonTEStatCalculation(tempStat, statIndex, maxLd) {
      if (tempStat.calculateDomLevel(this.c.m[statIndex], this.c.values[statIndex], !this.c.wild, this.c.TE, this.c.IB) > maxLd)
         return;

      if (this.c.values[statIndex] === Utils.RoundTo(tempStat.calculateValue(this.c.m[statIndex], !this.c.wild, this.c.TE, this.c.IB), Ark.Precision(statIndex)))
         this.c.stats[statIndex].push(new Stat(tempStat));

      // If it doesn't calculate properly, it may have used a different IB (Mostly relevant for Food)
      else if (this.c.bred) {
         // TODO: Address this to apply proper logic as it makes mild assumptions
         // This is making sure that our previously calculated IB, rounded, is at least somewhat close to the IB the stat wants to use
         if (Utils.RoundTo(tempStat.calculateIB(this.c.m[statIndex], this.c.values[statIndex]), 2) === Utils.RoundTo(this.c.IB, 2)) {
            var maxTempIB = tempStat.calculateIB(this.c.m[statIndex], this.c.values[statIndex] + (0.5 / Math.pow(10, Ark.Precision(statIndex))));
            var minTempIB = tempStat.calculateIB(this.c.m[statIndex], this.c.values[statIndex] - (0.5 / Math.pow(10, Ark.Precision(statIndex))));

            if (this.maxIB > maxTempIB && maxTempIB >= this.minIB) {
               this.c.IB = this.maxIB = maxTempIB;
               this.c.stats[statIndex].push(new Stat(tempStat));
            }
            else if (this.minIB <= minTempIB && minTempIB < this.maxIB) {
               this.c.IB = this.minIB = minTempIB;
               this.c.stats[statIndex].push(new Stat(tempStat));
            }
         }
      }
   }

   findTEStats(tempStat, statIndex, maxLd) {
      for (tempStat.Ld = 0; tempStat.Ld <= maxLd; tempStat.Ld++) {

         let tamingEffectiveness = -1, minTE = 0, maxTE = 0;
         // One of the most precise ways to get the exact Taming Effectiveness
         if (this.c.values[statIndex] === Utils.RoundTo(tempStat.calculateValue(this.c.m[statIndex], !this.c.wild, 1, this.c.IB), Ark.Precision(statIndex)))
            tamingEffectiveness = 1;
         else if (this.c.values[statIndex] === Utils.RoundTo(tempStat.calculateValue(this.c.m[statIndex], !this.c.wild, 0, this.c.IB), Ark.Precision(statIndex)))
            tamingEffectiveness = 0;
         else
            tamingEffectiveness = tempStat.calculateTE(this.c.m[statIndex], this.c.values[statIndex]);

         // TE *must* be lower than this
         maxTE = Math.min(tempStat.calculateTE(this.c.m[statIndex], this.c.values[statIndex] + (0.5 / Math.pow(10, Ark.Precision(statIndex)))), 1);
         // TE can be equal to or greater than this
         minTE = Math.max(tempStat.calculateTE(this.c.m[statIndex], this.c.values[statIndex] - (0.5 / Math.pow(10, Ark.Precision(statIndex)))), 0);

         if (tamingEffectiveness >= 0 && tamingEffectiveness <= 1) {
            // If the TE allows the stat to calculate properly, add it as a possible result
            if (this.c.values[statIndex] === Utils.RoundTo(tempStat.calculateValue(this.c.m[statIndex], !this.c.wild, tamingEffectiveness, this.c.IB), Ark.Precision(statIndex))) {
               // Create a new Stat to hold all of the information
               var TEStat = new Stat(tempStat);
               TEStat.wildLevel = Math.ceil(this.levelBeforeDom / (1 + 0.5 * tamingEffectiveness));
               if (this.levelBeforeDom === Math.floor(TEStat.wildLevel * (1 + 0.5 * tamingEffectiveness))) {
                  TEStat.TE = tamingEffectiveness;
                  TEStat.maxTE = maxTE;
                  TEStat.minTE = minTE;
                  this.c.stats[statIndex].push(TEStat);
               }
            }
         }

         // The TE would only get smaller so break the loop
         else if (tamingEffectiveness <= 0)
            break;
      }
   }

   filterResults(dbg?: any) {
      if (dbg && !dbg['filterLoops']) dbg.filterLoops = 0;

      let removed = false;

      do {
         if (dbg) dbg.filterLoops += 1;
         removed = false;
         let wildMin = 0, domMin = 0;

         // Find any stats that do not exist as a possible option
         if (this.options.length)
            this.c.stats.forEach(stat => stat.forEach(poss => { if (!this.options.some(option => option.includes(poss))) poss.removeMe = true; }));

         for (let i = 0; i < 7; i++) {
            let tempWM = -1, tempDM = -1;
            // One stat possibility is good
            if (!this.checkedStat[i] && this.c.stats[i].length === 1) {
               this.wildFreeMax -= this.c.stats[i][0].Lw;
               this.domFreeMax -= this.c.stats[i][0].Ld;
               this.checkedStat[i] = true;
            }
            else if (!this.checkedStat[i]) {
               for (let j = 0; j < this.c.stats[i].length; j++) {
                  if (tempWM === -1)
                     tempWM = this.c.stats[i][j].Lw;
                  if (tempDM === -1)
                     tempDM = this.c.stats[i][j].Ld;
                  if (tempWM > this.c.stats[i][j].Lw)
                     tempWM = this.c.stats[i][j].Lw;
                  if (tempDM > this.c.stats[i][j].Ld)
                     tempDM = this.c.stats[i][j].Ld;
               }
               // FIXME: TS-MIGRATION: Extra properties on the stat rows? Could hold these separately like: this.c.minW[i]
               // @ts-ignore
               this.c.stats[i].minW = tempWM; this.c.stats[i].minD = tempDM;
               wildMin += tempWM;
               domMin += tempDM;
            }
         }

         // Last try to remove additional stats
         if (!removed) {
            for (let i = 0; i < 7; i++) {
               // Simple stat removal
               if (this.c.stats[i].length > 1) {
                  for (let j = 0; j < this.c.stats[i].length; j++) {
                     if (this.c.stats[i][j].Lw > this.wildFreeMax || this.c.stats[i][j].Ld > this.domFreeMax) {
                        this.c.stats[i][j].removeMe = true;
                     }
                     // @ts-ignore
                     if (this.c.stats[i][j].Lw + wildMin - this.c.stats[i].minW > this.wildFreeMax
                        // @ts-ignore
                        || this.c.stats[i][j].Ld + domMin - this.c.stats[i].minD > this.domFreeMax
                        || (this.c.m[i].Tm && !this.filterByTE(i, this.c.stats[i][j]))) {
                        this.c.stats[i][j].removeMe = true;

                     }
                  }
               }
            }
         }

         removed = this.statRemover(dbg);

         if (!removed && this.options.length === 0)
            removed = this.generateOptions(dbg);

      } while (removed);
   }

   // Remove all stats that don't have a matching TE pair
   filterByTE(index, TEstat) {
      for (let i = 0; i < 7; i++) {
         if ((this.c.m[i].Tm) && (i !== index)) {
            for (let j = 0; j < this.c.stats[i].length; j++)
               if (this.c.stats[i][j].TE === TEstat.TE)
                  return true;
               // FIXME: TS-MIGRATION: TS complains that TE, minTE and maxTE might not be set... is it right?
               // @ts-ignore
               else if (this.c.stats[i][j].maxTE > TEstat.TE && TEstat.TE >= this.c.stats[i][j].minTE) {
                  this.c.stats[i][j].TE = TEstat.TE;
                  return true;
               }
               // @ts-ignore
               else if (TEstat.maxTE > this.c.stats[i][j].TE && this.c.stats[i][j].TE >= TEstat.minTE) {
                  TEstat.TE = this.c.stats[i][j].TE;
                  return true;
               }
            return false;
         }
      }
      return true;
   }

   /**
    * Recursively checks our results for only valid ones. If the results are valid, returns either an array or true
    *
    * @param {Stat[]} option An Array of Stat objects
    * @param {*} [dbg = undefined] Debugger object
    *
    * @returns {boolean} Returns true if it's a valid options set, false otherwise
    */
   matchingStats(option, dbg?: any) {
      if (dbg) dbg.totalRecursion++;

      let TE = -1;
      let wildLevels = 0, domLevels = 0;

      // If the TE of the stats we have don't match, they aren't valid
      for (var i = 0; i < option.length; i++) {
         if (TE === -1 && option[i]["TE"] !== undefined)
            TE = option[i].TE;
         else if (option[i]["TE"] !== undefined)
            if (TE !== option[i].TE)
               return false;

         if (!this.checkedStat[i]) {
            if (option[i].Lw > 0)
               wildLevels += option[i].Lw;
            domLevels += option[i].Ld;

            if ((!this.unusedStat && wildLevels > this.wildFreeMax) || domLevels > this.domFreeMax)
               return false;
         }
      }
      // check to see if the stat possibilities add up to the missing dom levels
      // and wild levels as long as we don't have an unused stat
      if ((this.unusedStat || wildLevels === this.wildFreeMax) && domLevels === this.domFreeMax)
         return true;

      return false;
   }

   statRemover(dbg?: any) {
      let initialStatsLength = 0, initialOptionsLength = 0;
      let removed = false;

      for (let i = 0; i < 7; i++) {
         initialStatsLength = this.c.stats[i].length;
         this.c.stats[i] = this.c.stats[i].filter(stat => !stat['removeMe']);
         if (dbg) dbg.numberRemoved += initialStatsLength - this.c.stats[i].length;
         if (!removed && initialStatsLength > this.c.stats[i].length)
            removed = true;
      }

      initialOptionsLength = this.options.length;
      // FIXME: TS-MIGRATION: Using 'as' is how you cast in TS, although it's only compile-time
      this.options = this.options.filter(option => !option.some(stat => stat['removeMe'] as boolean));
      if (dbg) dbg.numberRemoved += initialOptionsLength - this.options.length;

      return removed || initialOptionsLength > this.options.length;
   }

   generateOptions(dbg?: any) {
      let tempOptions: number[] = [];

      // The initial array for matchingStats
      for (let stat = 0; stat < 7; stat++) {
         if (this.c.stats[stat].length !== 0)
            tempOptions.push(0);
         else
            return false;
      }

      let indexMax = tempOptions.length - 1;
      let selector = indexMax;

      do {
         let tempStatOption: Stat[] = [];
         for (let stat = 0; stat < 7; stat++) {
            tempStatOption.push(this.c.stats[stat][tempOptions[stat]]);
         }
         if (this.matchingStats(tempStatOption, dbg))
            this.options.push(tempStatOption.slice());

         tempOptions[selector]++;

         while (selector !== -1 && tempOptions[selector] === this.c.stats[selector].length) {
            tempOptions[selector] = 0;
            selector--;
            if (selector !== -1)
               tempOptions[selector]++;
         }

         if (selector !== -1)
            selector = indexMax;
      } while (selector !== -1);
      return true;
   }
}
