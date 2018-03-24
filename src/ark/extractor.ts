/**
 * @fileOverview Contains the ASBM.Extraction Object
 */

import { TORPOR, FOOD, SPEED, HEALTH } from '@/consts';
import { Stat, VueCreature } from './creature';
import * as Ark from '@/ark';
import * as Utils from '@/utils';
import { StatMultiplier, ServerMultiplier } from '@/ark/multipliers';

class TEProps {
   TE = 0;
   minTE = 0;
   maxTE = 1;
   wildLevel = 0;
}

export class Extractor {
   c: VueCreature;
   m: StatMultiplier[] & ServerMultiplier[] = [];

   wildFreeMax = 0;
   wildMin: number[] = [];
   domFreeMax = 0;
   domMin: number[] = [];
   levelBeforeDom = 0;
   unusedStat = false;
   options: Stat[][] = [];
   minIB = 0;
   maxIB = 0;
   checkedStat: boolean[] = [];
   statTEmaps?: Map<number, Map<Stat, TEProps>> = new Map();

   constructor(vueCreature: VueCreature) {
      this.c = vueCreature;
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

      // Calculate the torpor stat since it doesn't accept dom levels
      tempStat.calculateWildLevel(this.m[TORPOR], this.c.values[TORPOR], (!this.c.wild), this.c.TE, this.c.IB);
      this.c.stats[TORPOR].push(new Stat(tempStat));
      this.checkedStat[TORPOR] = true;
      if (dbg) dbg.levelFromTorpor = tempStat.Lw;

      // Calculate the max number of levels based on level and torpor
      this.wildFreeMax = this.c.stats[TORPOR][0].Lw;
      this.levelBeforeDom = this.c.stats[TORPOR][0].Lw + 1;
      this.domFreeMax = Math.max(this.c.level - this.wildFreeMax - 1, 0);

      // If it's bred, we need to do some magic with the IB
      if (this.c.bred)
         this.dynamicIBCalculation();

      // Loop all stats except for torpor
      for (let stat = HEALTH; stat <= SPEED; stat++) {
         tempStat = new Stat();

         // Covers unused stats like oxygen
         if (this.uniqueStatSituation(tempStat, stat))
            continue;

         else {
            // Calculate the highest Lw could be
            let maxLw = tempStat.calculateWildLevel(this.m[stat], this.c.values[stat], !this.c.wild, 0, this.c.IB);

            if (maxLw > this.levelBeforeDom || (maxLw === 0 && this.m[stat].Iw === 0))
               maxLw = this.levelBeforeDom;

            // Loop all possible Lws
            for (tempStat.Lw = maxLw; tempStat.Lw >= 0; tempStat.Lw--) {
               // Calculate the highest Ld could be
               const maxLd = Math.min(tempStat.calculateDomLevel(this.m[stat], this.c.values[stat], !this.c.wild, 0, this.c.IB), this.domFreeMax);

               // If Ld is greater than the highest dom possible, quit the loop
               if (maxLd > this.domFreeMax && !this.m[stat].Tm)
                  break;

               // We don't need to calculate TE to extract the levels
               if (this.c.bred || this.m[stat].Tm <= 0) {
                  this.nonTEStatCalculation(tempStat, stat, maxLd);
               }

               // If this stat has a Tm and is tamed, we need to manually loop through the Ld
               else
                  this.findTEStats(tempStat, stat, maxLd);
            }
         }
      }

      // Only filter results if we have a result for every stat
      for (let stat = HEALTH; stat <= SPEED; stat++) {
         if (this.c.stats[stat].length === 0) {
            if (dbg) dbg.failReason = 'No options found for stat ' + stat;
            return;
         }
      }

      // All creatures, even wild, need their stats filtered
      if (dbg) dbg.preFilterStats = Utils.DeepCopy(this.c.stats);
      this.filterResults(dbg);

      // Sort the options based on most likely (deviation from the expected average)
      this.options.sort(this.optionDeviation);
   }

   init() {
      // Make sure the multipliers haven't changed
      this.m = Ark.GetMultipliers(this.c.serverName, this.c.species);

      // Clear the checked property for future extractions (also clearing out any Vue observer)
      this.c.stats = Utils.FilledArray(8, () => []);

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
      // Generate the min/max values for future edge cases (applicable in all situations)
      this.maxIB = this.c.IB + (5 / 10E2);
      this.minIB = this.c.IB - (5 / 10E2);

      // If the entered IB works, we don't need to do anything else (Torpor can't be leveled and typically has a large value to start with)
      const expectedValue = this.c.stats[TORPOR][0].calculateValue(this.m[TORPOR], !this.c.wild, this.c.TE, this.c.IB);
      if (this.c.values[TORPOR] === Utils.RoundTo(expectedValue, Ark.Precision(TORPOR)))
         return;

      // Extract the IB from Torpor
      // TODO: Add a redundant check for IBM not being set. IB shouldn't extract to more than 0.05 in either direction if set properly.
      // May not be necessary as extract should return if the Torpor Lw calculated was too high
      this.c.IB = this.c.stats[TORPOR][0].calculateIB(this.m[TORPOR], this.c.values[TORPOR]);
      const offset = 0.5 / Math.pow(10, Ark.Precision(TORPOR));
      this.maxIB = Math.min(this.c.stats[TORPOR][0].calculateIB(this.m[TORPOR], this.c.values[TORPOR] + offset), this.maxIB);
      this.minIB = Math.max(this.c.stats[TORPOR][0].calculateIB(this.m[TORPOR], this.c.values[TORPOR] - offset), this.minIB);

      // Check the food stat for the IB as well (Only works if food is unleveled)
      const tempHealthStat = new Stat();
      tempHealthStat.calculateWildLevel(this.m[FOOD], this.c.values[FOOD], !this.c.wild, this.c.TE, this.c.IB);
      const imprintingBonusFromFood = tempHealthStat.calculateIB(this.m[FOOD], this.c.values[FOOD]);

      // Check to see if the new IB still allows torpor to extract correctly
      const newExpectedValue = this.c.stats[TORPOR][0].calculateValue(this.m[TORPOR], !this.c.wild, this.c.TE, imprintingBonusFromFood);
      if (this.c.values[TORPOR] === Utils.RoundTo(newExpectedValue, Ark.Precision(TORPOR)))
         this.c.IB = imprintingBonusFromFood;

      // IB can't be lower than 0
      if (this.c.IB < 0)
         this.c.IB = 0;
   }

   uniqueStatSituation(tempStat: Stat, statIndex: number) {
      // IF a stat isn't used, set it to -1 and continue
      if (this.m[statIndex].notUsed) {
         this.c.values[statIndex] = Utils.RoundTo(tempStat.calculateValue(this.m[statIndex], !this.c.wild, this.c.TE, this.c.IB), Ark.Precision(statIndex));
         this.unusedStat = true;
         this.c.stats[statIndex] = [new Stat(-1, 0)];
         return true;
      }

      // We can't calculate speed if a stat is unused
      else if (this.unusedStat && statIndex === SPEED) {
         // Calculate DOM for speed
         this.c.stats[SPEED] = [new Stat(-1, tempStat.calculateDomLevel(this.m[statIndex], this.c.values[statIndex], !this.c.wild, 0, this.c.IB))];
         this.domFreeMax -= this.c.stats[SPEED][0].Ld;
         this.checkedStat[statIndex] = this.checkedStat[SPEED] = true;
         return true;
      }

      // Creatures that don't allow speed to increase domestically also don't allow wild levels
      else if (!this.m[statIndex].Id && statIndex === SPEED) {
         // Calculate DOM for speed
         this.c.stats[SPEED] = [new Stat(0, tempStat.calculateDomLevel(this.m[statIndex], this.c.values[statIndex], !this.c.wild, 0, this.c.IB))];
         this.domFreeMax -= this.c.stats[SPEED][0].Ld;
         this.checkedStat[statIndex] = this.checkedStat[SPEED] = true;
         return true;
      }

      return false;
   }

   nonTEStatCalculation(tempStat: Stat, statIndex: number, maxLd: number) {
      if (tempStat.calculateDomLevel(this.m[statIndex], this.c.values[statIndex], !this.c.wild, this.c.TE, this.c.IB) > maxLd)
         return;

      if (this.c.values[statIndex] === Utils.RoundTo(tempStat.calculateValue(this.m[statIndex], !this.c.wild, this.c.TE, this.c.IB), Ark.Precision(statIndex)))
         this.c.stats[statIndex].push(new Stat(tempStat));

      // If it doesn't calculate properly, it may have used a different IB (Mostly relevant for Food)
      else if (this.c.bred) {
         // TODO: Address this to apply proper logic as it makes mild assumptions
         // FIXME: Really not sure what assumptions it makes, but sure...
         // This is making sure that our previously calculated IB, rounded, is at least somewhat close to the IB the stat wants to use
         if (Utils.RoundTo(tempStat.calculateIB(this.m[statIndex], this.c.values[statIndex]), 2) === Utils.RoundTo(this.c.IB, 2)) {
            const maxTempIB = tempStat.calculateIB(this.m[statIndex], this.c.values[statIndex] + (0.5 / Math.pow(10, Ark.Precision(statIndex))));
            const minTempIB = tempStat.calculateIB(this.m[statIndex], this.c.values[statIndex] - (0.5 / Math.pow(10, Ark.Precision(statIndex))));

            const expectedTorpor = this.c.stats[TORPOR][0].calculateValue(this.m[TORPOR], !this.c.wild, this.c.TE, maxTempIB);

            if (this.maxIB > maxTempIB && maxTempIB >= this.minIB) {
               if (this.c.values[TORPOR] === Utils.RoundTo(expectedTorpor, Ark.Precision(TORPOR))) {
                  this.c.IB = this.maxIB = maxTempIB;
                  this.c.stats[statIndex].push(new Stat(tempStat));
               }
            }
            if (this.minIB <= minTempIB && minTempIB < this.maxIB) {
               if (this.c.values[TORPOR] === Utils.RoundTo(expectedTorpor, Ark.Precision(TORPOR))) {
                  this.c.IB = this.minIB = minTempIB;
                  this.c.stats[statIndex].push(new Stat(tempStat));
               }
            }
         }
      }
   }

   findTEStats(tempStat: Stat, statIndex: number, maxLd: number) {
      for (tempStat.Ld = 0; tempStat.Ld <= maxLd; tempStat.Ld++) {

         let tamingEffectiveness = -1, minTE = 0, maxTE = 0;

         if (this.c.values[statIndex] === Utils.RoundTo(tempStat.calculateValue(this.m[statIndex], !this.c.wild, 1, this.c.IB), Ark.Precision(statIndex)))
            tamingEffectiveness = 1;
         else if (this.c.values[statIndex] === Utils.RoundTo(tempStat.calculateValue(this.m[statIndex], !this.c.wild, 0, this.c.IB), Ark.Precision(statIndex)))
            tamingEffectiveness = 0;
         else
            tamingEffectiveness = tempStat.calculateTE(this.m[statIndex], this.c.values[statIndex]);

         // TE *must* be lower than this
         maxTE = Math.min(tempStat.calculateTE(this.m[statIndex], this.c.values[statIndex] + (0.5 / Math.pow(10, Ark.Precision(statIndex)))), 1);
         // TE can be equal to or greater than this
         minTE = Math.max(tempStat.calculateTE(this.m[statIndex], this.c.values[statIndex] - (0.5 / Math.pow(10, Ark.Precision(statIndex)))), 0);

         if (tamingEffectiveness >= 0 && tamingEffectiveness <= 1) {
            // If the TE allows the stat to calculate properly, add it as a possible result
            const expectedValue = tempStat.calculateValue(this.m[statIndex], !this.c.wild, tamingEffectiveness, this.c.IB);
            if (this.c.values[statIndex] === Utils.RoundTo(expectedValue, Ark.Precision(statIndex))) {
               // Create a new Stat to hold all of the information
               const TEStat = new TEProps();
               TEStat.wildLevel = Math.ceil(this.levelBeforeDom / (1 + 0.5 * tamingEffectiveness));

               // Verify the calculated WildLevel was even possible
               if (this.levelBeforeDom === Math.floor(TEStat.wildLevel * (1 + 0.5 * tamingEffectiveness))) {
                  TEStat.TE = tamingEffectiveness;
                  TEStat.maxTE = maxTE;
                  TEStat.minTE = minTE;

                  const workingStat = new Stat(tempStat);
                  this.c.stats[statIndex].push(workingStat);

                  let tempMap = this.statTEmaps.get(statIndex);
                  if (tempMap === undefined)
                     tempMap = new Map();

                  tempMap.set(workingStat, TEStat);
                  this.statTEmaps.set(statIndex, tempMap);
               }
            }
         }

         // The TE would only get smaller so break the loop
         else if (tamingEffectiveness < 0)
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

         for (let statIndex = HEALTH; statIndex <= SPEED; statIndex++) {
            let tempWM = -1, tempDM = -1;
            // One stat possibility is good
            if (!this.checkedStat[statIndex] && this.c.stats[statIndex].length === 1) {
               this.wildFreeMax -= this.c.stats[statIndex][0].Lw;
               this.domFreeMax -= this.c.stats[statIndex][0].Ld;
               this.checkedStat[statIndex] = true;
            }
            else if (!this.checkedStat[statIndex]) {
               for (const stat of this.c.stats[statIndex]) {
                  if (tempWM === -1)
                     tempWM = stat.Lw;
                  if (tempDM === -1)
                     tempDM = stat.Ld;
                  if (tempWM > stat.Lw)
                     tempWM = stat.Lw;
                  if (tempDM > stat.Ld)
                     tempDM = stat.Ld;
               }
               this.wildMin[statIndex] = tempWM; this.domMin[statIndex] = tempDM;
               wildMin += tempWM;
               domMin += tempDM;
            }
         }

         for (let statIndex = HEALTH; statIndex <= SPEED; statIndex++) {
            if (!this.checkedStat[statIndex]) {
               for (const stat of this.c.stats[statIndex]) {
                  if (stat.Lw > this.wildFreeMax || stat.Ld > this.domFreeMax) {
                     stat.removeMe = true;
                  }
                  if (stat.Lw + wildMin - this.wildMin[statIndex] > this.wildFreeMax
                     || stat.Ld + domMin - this.domMin[statIndex] > this.domFreeMax
                     || (this.statTEmaps.get(statIndex) && !this.filterByTE(statIndex, stat))) {
                     stat.removeMe = true;
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
   filterByTE(index: number, TEstat: Stat) {
      for (let statIndex = 0; statIndex < 7; statIndex++) {
         const statTEs = this.statTEmaps.get(statIndex);
         if (statTEs !== undefined && (statIndex !== index)) {
            for (const stat of this.c.stats[statIndex]) {
               const currentTEstat = statTEs.get(stat), testingTEstat = this.statTEmaps.get(index).get(TEstat);
               if (currentTEstat.TE === testingTEstat.TE)
                  return true;
               else if (currentTEstat.maxTE > testingTEstat.TE && testingTEstat.TE >= currentTEstat.minTE) {
                  currentTEstat.TE = testingTEstat.TE;
                  statTEs.set(stat, currentTEstat);
                  return true;
               }
               else if (testingTEstat.maxTE > currentTEstat.TE && currentTEstat.TE >= testingTEstat.minTE) {
                  testingTEstat.TE = currentTEstat.TE;
                  statTEs.set(TEstat, testingTEstat);
                  return true;
               }
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
   matchingStats(option: Stat[], dbg?: any) {
      if (dbg) dbg.totalRecursion++;

      let TE = -1;
      let wildLevels = 0, domLevels = 0;

      // If the TE of the stats we have don't match, they aren't valid
      for (let i = 0; i < option.length; i++) {
         const statTEs = this.statTEmaps.get(i);
         if (TE === -1 && statTEs !== undefined)
            TE = statTEs.get(option[i]).TE;
         else if (statTEs !== undefined)
            if (TE !== statTEs.get(option[i]).TE)
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
      this.options = this.options.filter(option => !option.some(stat => stat['removeMe']));
      if (dbg) dbg.numberRemoved += initialOptionsLength - this.options.length;

      return removed || initialOptionsLength > this.options.length;
   }

   generateOptions(dbg?: any) {
      const tempOptions: number[] = [];

      // The initial array for matchingStats
      for (let stat = HEALTH; stat <= TORPOR; stat++) {
         if (this.c.stats[stat].length !== 0)
            tempOptions.push(0);
         else
            return false;
      }

      const indexMax = tempOptions.length - 1;
      let selector = indexMax;

      do {
         const tempStatOption: Stat[] = [];
         for (let stat = HEALTH; stat <= TORPOR; stat++) {
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

   optionDeviation(opt1: Stat[], opt2: Stat[]) {
      let opt1Dev = 0, opt2Dev = 0;
      const standard = opt1[TORPOR].Lw / 7;

      for (let stat = 0; stat < opt1.length && stat < opt2.length; stat++) {
         opt1Dev += Math.pow(opt1[stat].Lw - standard, 2);
         opt2Dev += Math.pow(opt2[stat].Lw - standard, 2);
      }

      if (opt1Dev > opt2Dev)
         return 1;
      else if (opt1Dev < opt2Dev)
         return -1;

      return 0;
   }
}
