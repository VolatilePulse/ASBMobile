"use strict";

/**
 * @fileOverview Contains the ASBM.Extraction Object
 */

import { TORPOR, FOOD, SPEED } from '../consts';
import { Stat } from './creature';
import * as Ark from '../ark';
import * as Utils from '../utils';

export class Extractor {
   constructor(vueCreature) {
      this.c = vueCreature;
      this.c.m = Ark.GetMultipliers(this.c.serverName, this.c.species);

      // If tame isn't bred (ignore wild level steps) and setting is enabled, consider wild steps (as set in settings)
      // TODO: Add consider wild levels
      // considerWildLevelSteps = considerWildLevelSteps && !bred;

      /** @type {number} */
      this.wildFreeMax = 0;
      /** @type {number} */
      this.domFreeMax = 0;
      /** @type {number} */
      this.levelBeforeDom = 0;
      /** @type {boolean} */
      this.unusedStat = false;
      /** @type {number [][]} */
      this.options = [];
      /** @type {number} */
      this.minIB = 0;
      /** @type {number} */
      this.maxIB = 0;
   }

   extract(dbg) {
      // Make sure we initialize specific variables before extraction
      this.init();

      var tempStat = new Stat();

      // A lot quicker if wild
      if (this.c.wild) {
         for (let i = 0; i < 8; i++) {
            tempStat.calculateWildLevel(this.c.m[i], this.c.values[i]);

            // Make sure it is valid
            if (this.c.values[i] == Utils.RoundTo(tempStat.calculateValue(this.c.m[i]), Ark.Precision(i)))
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
      this.domFreeMax = Math.max(0, this.c.level - this.wildFreeMax - 1);

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

            if (maxLw > this.levelBeforeDom || (maxLw == 0 && this.c.m[i].Iw == 0))
               maxLw = this.levelBeforeDom;

            // Loop all possible Lws
            for (tempStat.Lw = maxLw; tempStat.Lw >= 0; tempStat.Lw--) {
               // Calculate the highest Ld could be
               var maxLd = tempStat.calculateDomLevel(this.c.m[i], this.c.values[i], !this.c.wild, 0, this.c.IB);

               // If Ld is greater than the highest dom possible, quit the loop
               if (maxLd > this.domFreeMax && !this.c.m[i].Tm)
                  break;

               // We don't need to calculate TE to extract the levels
               if (this.c.bred || this.c.m[i].Tm == 0) {
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
         if (this.c.stats[i].length == 0) {
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

      for (let i = 0; i < 7; i++) {
         if (this.c.m[i].Tm) {
            for (let j = 0; j < this.c.stats[i].length; j++) {
               delete this.c.stats[i][j].minTE;
               delete this.c.stats[i][j].maxTE;
            }
         }
         if (!this.options.length && this.c.stats[i].length > 1) {
            this.generateOptions();

            for (let option in this.options)
               console.log(JSON.stringify(this.options[option]));
         }
      }

      return;
   }

   init() {
      // Make sure the multipliers haven't changed
      this.c.m = Ark.GetMultipliers(this.c.serverName, this.c.species);

      // Clear the checked property for future extractions
      for (let i = 0; i < 8; i++) {
         if (this.c.stats[i].hasOwnProperty("checked"))
            delete this.c.stats[i].checked;

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
   }

   dynamicIBCalculation() {
      // If we have already found the right IB, we don't need to do anything else
      if (this.c.values[TORPOR] == Utils.RoundTo(this.c.stats[TORPOR][0].calculateValue(this.c.m[TORPOR], !this.c.wild, this.c.TE, this.c.IB), Ark.Precision(TORPOR)))
         return;

      // One of the most precise ways to get the exact torpor
      this.c.IB = this.c.stats[TORPOR][0].calculateIB(this.c.m[TORPOR], this.c.values[TORPOR]);
      // IB *must* be lower than this
      this.maxIB = Math.min(this.c.stats[TORPOR][0].calculateIB(this.c.m[TORPOR], this.c.values[TORPOR] + (0.5 / Math.pow(10, Ark.Precision(TORPOR)))), this.c.IB + (5 / 10E3));
      // IB can be equal or greater than this
      this.minIB = Math.max(this.c.stats[TORPOR][0].calculateIB(this.c.m[TORPOR], this.c.values[TORPOR] - (0.5 / Math.pow(10, Ark.Precision(TORPOR)))), this.c.IB - (5 / 10E3));

      // Check the food stat for the IB as well (Only works if food is unleveled)
      var tempHealthStat = new Stat();
      tempHealthStat.calculateWildLevel(this.c.m[FOOD], this.c.values[FOOD], !this.c.wild, this.c.TE, this.c.IB);
      var imprintingBonusFromFood = tempHealthStat.calculateIB(this.c.m[FOOD], this.c.values[FOOD]);

      // Check to see if the new IB still allows torpor to extract correctly
      if (this.c.values[TORPOR] == Utils.RoundTo(this.c.stats[TORPOR][0].calculateValue(this.c.m[TORPOR], !this.c.wild, this.c.TE, imprintingBonusFromFood), Ark.Precision(TORPOR)))
         this.c.IB = imprintingBonusFromFood;

      // If IB > 99.9% it is likely 100% or a whole number higher than 100%
      if (this.c.IB >= 1)
         this.c.IB = Utils.RoundTo(this.c.IB, 2);

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
      else if (this.unusedStat && statIndex == SPEED) {
         // Calculate DOM for speed
         this.c.stats[SPEED] = [new Stat(-1, tempStat.calculateDomLevel(this.c.m[statIndex], this.c.values[statIndex], !this.c.wild, 0, this.c.IB))];
         this.domFreeMax -= this.c.stats[SPEED][0].Ld;
         this.c.stats[statIndex].checked = this.c.stats[SPEED].checked = true;
         return true;
      }

      // Creatures that don't increase Speed on imprint also don't level the stat
      // FIXME: It's true for all flyers, including CF flyers that allow IB of Speed
      else if (!this.c.m[statIndex].IBM && statIndex == SPEED) {
         // Calculate DOM for speed
         this.c.stats[SPEED] = [new Stat(0, tempStat.calculateDomLevel(this.c.m[statIndex], this.c.values[statIndex], !this.c.wild, 0, this.c.IB))];
         this.domFreeMax -= this.c.stats[SPEED][0].Ld;
         this.c.stats[statIndex].checked = this.c.stats[SPEED].checked = true;
         return true;
      }

      return false;
   }

   nonTEStatCalculation(tempStat, statIndex, maxLd) {
      if (tempStat.calculateDomLevel(this.c.m[statIndex], this.c.values[statIndex], !this.c.wild, this.c.TE, this.c.IB) > maxLd)
         return;

      if (Utils.RoundTo(this.c.values[statIndex], Ark.Precision(statIndex)) == Utils.RoundTo(tempStat.calculateValue(this.c.m[statIndex], !this.c.wild, this.c.TE, this.c.IB), Ark.Precision(statIndex)))
         this.c.stats[statIndex].push(new Stat(tempStat));

      // If it doesn't calculate properly, it may have used a different IB
      else if (this.c.bred) {
         if (Utils.RoundTo(tempStat.calculateIB(this.c.m[statIndex], this.c.values[statIndex]), 2) == Utils.RoundTo(this.c.IB, 2)) {
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

         let tamingEffectiveness = 0, minTE = 0, maxTE = 0;
         // One of the most precise ways to get the exact Taming Effectiveness
         tamingEffectiveness = tempStat.calculateTE(this.c.m[statIndex], this.c.values[statIndex]);

         // TE *must* be lower than this
         maxTE = Math.min(tempStat.calculateTE(this.c.m[statIndex], this.c.values[statIndex] + (0.5 / Math.pow(10, Ark.Precision(statIndex)))), 1);
         // TE can be equal to or greater than this
         minTE = Math.max(tempStat.calculateTE(this.c.m[statIndex], this.c.values[statIndex] - (0.5 / Math.pow(10, Ark.Precision(statIndex)))), 0);

         if (tamingEffectiveness >= 0 && tamingEffectiveness <= 1) {

            // If the TE allows the stat to calculate properly, add it as a possible result
            if (Utils.RoundTo(this.c.values[statIndex], Ark.Precision(statIndex)) == Utils.RoundTo(tempStat.calculateValue(this.c.m[statIndex], !this.c.wild, tamingEffectiveness, this.c.IB), Ark.Precision(statIndex))) {
               // Create a new Stat to hold all of the information
               var TEStat = new Stat(tempStat);
               TEStat.wildLevel = Math.ceil(this.levelBeforeDom / (1 + 0.5 * tamingEffectiveness));
               if (this.levelBeforeDom == Math.floor(TEStat.wildLevel * (1 + 0.5 * tamingEffectiveness))) {
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

   filterResults(dbg) {
      if (dbg && !dbg['filterLoops']) dbg.filterLoops = 0;

      let removed = false;

      do {
         removed = false;
         for (let i = 0; i < 7; i++) {

            // One stat possibility is good
            if (!this.c.stats[i].checked && this.c.stats[i].length == 1) {
               this.wildFreeMax -= this.c.stats[i][0].Lw;
               this.domFreeMax -= this.c.stats[i][0].Ld;
               this.c.stats[i].checked = true;
               removed = true;
            }

            // Simple stat removal
            else if (this.c.stats[i].length > 1) {
               for (let j = 0; j < this.c.stats[i].length; j++) {
                  if (this.c.stats[i][j].Lw > this.wildFreeMax || this.c.stats[i][j].Ld > this.domFreeMax) {
                     this.c.stats[i].splice(j, 1);
                     j--;
                     removed = true;
                     if (dbg) dbg.numberRemoved++;
                  }
               }
            }
         }

         // Last try to remove additional stats
         if (!removed) {
            let wildMin = 0, domMin = 0;
            for (let i = 0; i < 7; i++) {
               let tempWM = -1, tempDM = -1;
               if (!this.c.stats[i].checked) {
                  for (let j = 0; j < this.c.stats[i].length; j++) {
                     if (tempWM == -1)
                        tempWM = this.c.stats[i][j].Lw;
                     if (tempDM == -1)
                        tempDM = this.c.stats[i][j].Ld;
                     if (tempWM > this.c.stats[i][j].Lw)
                        tempWM = this.c.stats[i][j].Lw;
                     if (tempDM > this.c.stats[i][j].Ld)
                        tempDM = this.c.stats[i][j].Ld;
                  }
                  this.c.stats[i].minW = tempWM; this.c.stats[i].minD = tempDM;
                  wildMin += tempWM;
                  domMin += tempDM;
               }
            }

            for (let i = 0; i < 7; i++) {
               for (let j = 0; !this.c.stats[i].checked && j < this.c.stats[i].length; j++) {
                  // Bad Stat
                  if (this.c.stats[i][j].Lw + wildMin - this.c.stats[i].minW > this.wildFreeMax || this.c.stats[i][j].Ld + domMin - this.c.stats[i].minD > this.domFreeMax) {
                     this.c.stats[i].splice(j, 1);
                     j--;
                     removed = true;
                     if (dbg) dbg.numberRemoved++;
                  }
               }
            }

            // TODO: Only call filterByTE if there is another stat with Tm
            for (let i = 0; i < 7; i++) {
               for (let j = 0; this.c.m[i].Tm && j < this.c.stats[i].length; j++) {
                  if (!this.filterByTE(i, this.c.stats[i][j])) {
                     this.c.stats[i].splice(j, 1);
                     j--;
                     removed = true;
                     if (dbg) dbg.numberRemoved++;
                  }
               }
            }

            if (removed)
               continue;

            // Only remove recursively if we couldn't remove any possibilities the other 2 ways
            removed = this.matchingStatsGenerator(dbg);
         }
         if (dbg) dbg.filterLoops += 1;
      } while (removed);
   }

   // Remove all stats that don't have a matching TE pair
   filterByTE(index, TEstat) {
      for (let i = 0; i < 7; i++) {
         if ((this.c.m[i].Tm) && (i != index)) {
            for (let j = 0; j < this.c.stats[i].length; j++)
               if (this.c.stats[i][j].TE == TEstat.TE)
                  return true;
               else if (this.c.stats[i][j].maxTE > TEstat.TE && TEstat.TE >= this.c.stats[i][j].minTE) {
                  this.c.stats[i][j].TE = TEstat.TE;
                  return true;
               }
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
    * @param {number[][]} indices An array of index arrays to use on the results object
    * @param {*} [dbg = undefined] Debugger object
    *
    * @returns {boolean} Returns true if it's a valid options set, false otherwise
    */
   matchingStats(indices, dbg = undefined) {
      if (dbg) dbg.totalRecursion++;

      let TE = -1;

      // If the TE of the stats we have don't match, they aren't valid
      for (var i = 0; i < indices.length; i++) {
         if (TE == -1 && this.c.stats[indices[i][0]][indices[i][1]]["TE"] != undefined)
            TE = this.c.stats[indices[i][0]][indices[i][1]].TE;
         else if (this.c.stats[indices[i][0]][indices[i][1]]["TE"] != undefined)
            if (TE != this.c.stats[indices[i][0]][indices[i][1]].TE)
               return false;
      }

      // We've run out of stats to add to our indices so lets test them for valid results
      var wildLevels = 0, domLevels = 0;
      // Loop through our possibilities
      for (var i = 0; i < indices.length; i++) {
         if (this.c.stats[indices[i][0]][indices[i][1]].Lw > 0)
            wildLevels += this.c.stats[indices[i][0]][indices[i][1]].Lw;
         domLevels += this.c.stats[indices[i][0]][indices[i][1]].Ld;
      }

      // check to see if the stat possibilities add up to the missing dom levels
      // and wild levels as long as we don't have an unused stat
      if ((this.unusedStat || wildLevels == this.wildFreeMax) && domLevels == this.domFreeMax)
         return true;

      // If we made it this far, we have failed something
      return false;
   }

   matchingStatsGenerator(dbg) {
      let tempOptions = [];

      // The initial array for matchingStats
      for (let stat = 0; stat < 7; stat++)
         if (!this.c.stats[stat].checked)
            tempOptions.push([stat, 0]);

      // Useless if we have no options to run
      if (tempOptions.length < 1)
         return false;

      let indexMax = tempOptions.length - 1;
      let selector = indexMax;

      do {
         // Make sure our stat combination is valid
         if (this.matchingStats(tempOptions, dbg)) {
            for (let option in tempOptions) {
               // Flags the stat as being good
               this.c.stats[tempOptions[option][0]][tempOptions[option][1]].good = true;
            }
         }

         tempOptions[selector][1]++;

         // Increment the selector/index (Read as disc combination lock brute force)
         while (selector != -1 && tempOptions[selector][1] == this.c.stats[tempOptions[selector][0]].length) {
            tempOptions[selector][1] = 0;
            selector--;
            if (selector != -1)
               tempOptions[selector][1]++;
         }

         if (selector != -1)
            selector = indexMax;
      } while (selector != -1);

      let removed = false;
      for (let stat = 0; stat < 7; stat++) {
         for (let poss = 0; poss < this.c.stats[stat].length && !this.c.stats[stat].checked; poss++) {
            // We have verified that that only bad stats are removed
            if (!this.c.stats[stat][poss].good) {
               this.c.stats[stat].splice(poss, 1);
               poss--;
               removed = true;
            }
            else
               // Removes the flag for future iterations
               this.c.stats[stat][poss].good = false;
         }
      }

      return removed;
   }

   generateOptions() {
      let tempOptions = [];

      // The initial array for matchingStats
      for (let stat = 0; stat < 7; stat++)
         if (!this.c.stats[stat].checked)
            tempOptions.push([stat, 0]);

      let indexMax = tempOptions.length - 1;
      let selector = indexMax;

      do {
         /** @type {any[]} */
         let actualOption = [];
         let copyOption = tempOptions.slice();

         if (this.matchingStats(tempOptions)) {
            for (let stat = 0; stat < 8; stat++) {
               if (this.c.stats[stat].length == 1)
                  actualOption.push([stat, 0]);
               else
                  actualOption.push(copyOption.shift().slice());
            }
            this.options.push(actualOption.slice());
         }

         tempOptions[selector][1]++;

         while (selector != -1 && tempOptions[selector][1] == this.c.stats[tempOptions[selector][0]].length) {
            tempOptions[selector][1] = 0;
            selector--;
            if (selector != -1)
               tempOptions[selector][1]++;
         }

         if (selector != -1)
            selector = indexMax;
      } while (selector != -1);
   }
}
