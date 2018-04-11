import * as Ark from '@/ark';
import { StatMultipliers } from '@/ark/multipliers';
import { Stat } from '@/ark/types';
import { DAMAGE, FOOD, HEALTH, OXYGEN, SPEED, STAMINA, TORPOR, WEIGHT } from '@/consts';
import { Creature, Server } from '@/data/objects';
import * as Utils from '@/utils';


export class TEProps {
   TE = 0;
   wildLevel = 0;
}

export class Extractor {
   /** Stores all of the creature data */
   c: Creature;
   /** Stores all multipliers for stat calculations */
   m: StatMultipliers[] = [];

   /** A counter to see how many wild stat levels are unaccounted for */
   wildFreeMax = 0;
   /** A counter to see how many dom stat levels are unaccounted for */
   domFreeMax = 0;
   /** What level the creature was born/tamed at */
   levelBeforeDom = 0;
   /** The lowest that the IB can be */
   minIB = 0;
   /** The IB value must be lower than this to be valid */
   maxIB = 0;
   /** A running total of each stat's minimum wild stat levels */
   minWild = 0;
   /** A running total of each stat's minimum dom stat levels */
   minDom = 0;
   /** A running total of each stat's minimum dom stat levels */
   originalIB = 0;
   /** A flag signifying a stat isn't displayed by Ark */
   unusedStat = false;
   /** A flag signifying a successful extraction */
   success = true;

   /** Stores each stats minimum wild stat level */
   wildMin: number[] = [];
   /** Stores each stats minimum dom stat level */
   domMin: number[] = [];
   /** Contains stat options from SPEED to TORPOR, numerically */
   options: Stat[][] = [];
   /** Signifies that a stat only has one possibility */
   checkedStat: boolean[] = [];
   /** Contains all of the TE properties for stats */
   statTEmaps: Array<Map<Stat, TEProps>> = [];

   constructor(creature: Creature, server: Server) {
      this.c = creature;
      // TODO: Add consider wild levels
      // Only way to calculate wild levels is with a TE
      // Creatures like gigas are unaffected, just as if they were bred
      // The code is already laid out to handle support for considerWildLevelSteps
      // Will have to implement a WildLevel override for 100% TE, if a creature was tamed that way
      //    It's likely it was force tamed anyways (possibly spawned + tamed)
      // Should not rely on wild level steps as, it will speed up extraction, but not everyone may set it :(

      // considerWildLevelSteps = considerWildLevelSteps && !bred;
      // Make sure the multipliers haven't changed
      this.m = Ark.GetMultipliers(server, this.c.species);

      // Clear the checked property for future extractions (also clearing out any Vue observer)
      this.c.stats = Utils.FilledArray(8, () => []);

      // Change variables based on wild, tamed, bred
      if (this.c.wild)
         this.c.TE = this.c.IB = 0;

      else if (this.c.tamed)
         this.c.IB = 0;

      else
         this.c.TE = 1;
   }

   extract(dbg?: any) {
      // TODO: Add either a way to throw errors w/ codes (for specific reasons like bad multipliers, stats, etc.)
      //    Or provide an alternative method (returning under bad situations is acceptable for now)

      let tempStat = new Stat();

      // Calculate the torpor stat since it doesn't accept dom levels
      if (!this.c.bred) {
         tempStat.calculateWildLevel(this.m[TORPOR], this.c.values[TORPOR], !this.c.wild, this.c.TE, 0);
         this.c.stats[TORPOR].push(new Stat(tempStat));
      }

      else {
         this.originalIB = this.c.IB;
         // Create an empty stat to be pushed off immediately for all bred creatures
         this.c.stats[TORPOR].push(new Stat());
         this.minIB = Math.max(this.originalIB - 0.005, 0);
         this.maxIB = this.originalIB + 0.005;
         const minTorporLw = tempStat.calculateWildLevel(this.m[TORPOR], this.c.values[TORPOR], !this.c.wild, 1, this.maxIB);
         tempStat.calculateWildLevel(this.m[TORPOR], this.c.values[TORPOR], !this.c.wild, 1, this.minIB);
         for (; tempStat.Lw >= minTorporLw; tempStat.Lw--) {
            this.c.stats[TORPOR].push(new Stat(tempStat));
         }
      }
      this.checkedStat[TORPOR] = true;

      do {
         // Reset flag to test for failed cases
         this.success = true;

         // Reset arrays to handle multiple loops
         for (let index = HEALTH; index <= SPEED; index++) {
            this.c.stats[index] = [];
            this.checkedStat[index] = false;
         }

         // Remove the previous torpor stat as it was no good
         if (this.c.bred)
            this.c.stats[TORPOR].shift();

         // Calculate the max number of levels based on level and torpor
         this.wildFreeMax = this.c.stats[TORPOR][0].Lw;
         this.levelBeforeDom = this.c.stats[TORPOR][0].Lw + 1;
         this.domFreeMax = Math.max(this.c.level - this.wildFreeMax - 1, 0);

         // If it's bred, we need to do some magic with the IB
         if (this.c.bred)
            this.dynamicIBCalculation();

         // Loop all stats except for torpor
         for (let statIndex = HEALTH; statIndex <= SPEED && this.success; statIndex++) {
            tempStat = new Stat();

            // Covers unused stats like oxygen
            if (!this.uniqueStatSituation(tempStat, statIndex)) {
               // Calculate the highest Lw could be
               let maxLw = tempStat.calculateWildLevel(this.m[statIndex], this.c.values[statIndex], !this.c.wild, 0, this.c.IB);

               if (maxLw > this.wildFreeMax - this.minWild || (maxLw === 0 && this.m[statIndex].Iw === 0))
                  maxLw = this.wildFreeMax - this.minWild;

               const localMap = this.statTEmaps.find(map => map !== undefined);
               // Loop all possible Lws
               for (tempStat.Lw = maxLw; tempStat.Lw >= 0; tempStat.Lw--) {
                  // Calculate the highest Ld could be
                  const maxLd = Math.min(tempStat.calculateDomLevel(this.m[statIndex], this.c.values[statIndex], !this.c.wild), this.domFreeMax - this.minDom);

                  // We don't need to calculate TE to extract the levels
                  if (this.c.bred || this.m[statIndex].Tm <= 0)
                     this.nonTEStatCalculation(tempStat, statIndex, maxLd);

                  // If this stat has a Tm and is tamed, we need to manually loop through the Ld
                  else if (localMap === undefined)
                     this.findTEStats(tempStat, statIndex, maxLd);

                  else if (localMap !== undefined)
                     this.findMultiTEStat(tempStat, statIndex, maxLd, localMap);
               }
            }
            if (this.c.stats[statIndex].length === 1) {
               this.wildFreeMax -= this.c.stats[statIndex][0].Lw;
               this.domFreeMax -= this.c.stats[statIndex][0].Ld;
               this.checkedStat[statIndex] = true;
            }
            else if (this.c.stats[statIndex].length > 1) {
               let tempWM = -1, tempDM = -1;
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
               this.minWild += tempWM;
               this.minDom += tempDM;
            }

            // No stat possibilities were found for this stat
            else
               this.success = false;
         }
         // Clear out the rest of the torpor results since we found the correct one
         if (this.success && this.c.bred)
            this.c.stats[TORPOR] = [this.c.stats[TORPOR][0]];

      } while (this.c.stats[TORPOR].length !== 1 && !this.success && this.c.bred);

      if (dbg) dbg.levelFromTorpor = this.c.stats[TORPOR][0].Lw;

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

      this.success = !!this.options.length;

      // Sort the options based on most likely (deviation from the expected average)
      this.options.sort((opt1, opt2) => this.optionDeviation(opt1, opt2));
   }

   /**
    *  Attempts to calculate a valid Imprint Bonus from the one entered. While it doesn't support the same "Exactly" option that ASB does,
    *    it does first attempt to look at the entered IB to see if it's valid first. Unfortunately, that also means that the IB must be rounded
    *    before the Extractor can use it as the assumption is made (to create the min/max IB) that 0.05 in either direction is still valid.
    *
    *  @return {undefined} There is no returned value
    */
   dynamicIBCalculation(): void {
      // Generate the min/max values for future edge cases (applicable in all situations)
      this.minIB = Math.max(this.originalIB - 0.005, 0);
      this.maxIB = this.originalIB + 0.005;

      // If the entered IB works, we don't need to do anything else (Torpor can't be levelled and typically has a large value to start with)
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

      // Check the food stat for the IB as well (Only works if food is un-levelled)
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

      // FIXME: Performance needs to increase
      if (this.c.values[statIndex] === Utils.RoundTo(tempStat.calculateValue(this.m[statIndex], !this.c.wild, this.c.TE, this.c.IB), Ark.Precision(statIndex)))
         this.c.stats[statIndex].push(new Stat(tempStat));

      // If it doesn't calculate properly, it may have used a different IB (Mostly relevant for Food)
      else if (this.c.bred) {
         // TODO: Address this to apply proper logic as it makes mild assumptions
         // FIXME: Really not sure what assumptions it makes, but sure...
         // This is making sure that our previously calculated IB, rounded, is at least somewhat close to the IB the stat wants to use
         // FIXME: Performance needs to increase
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
      const EPSILON = 0.001;
      for (tempStat.Ld = 0; tempStat.Ld <= maxLd; tempStat.Ld++) {

         let tamingEffectiveness = -1;

         if (Math.abs(this.c.values[statIndex] - tempStat.calculateValue(this.m[statIndex], !this.c.wild, 1, this.c.IB)) < EPSILON)
            tamingEffectiveness = 1;
         else if (Math.abs(this.c.values[statIndex] - tempStat.calculateValue(this.m[statIndex], !this.c.wild, 0, this.c.IB)) < EPSILON)
            tamingEffectiveness = 0;
         else
            tamingEffectiveness = tempStat.calculateTE(this.m[statIndex], this.c.values[statIndex]);

         if (tamingEffectiveness >= 0 && tamingEffectiveness <= 1) {
            // If the TE allows the stat to calculate properly, add it as a possible result
            const expectedValue = tempStat.calculateValue(this.m[statIndex], !this.c.wild, tamingEffectiveness, this.c.IB);
            if (Math.abs(this.c.values[statIndex] - expectedValue) < EPSILON) {
               // Create a new Stat to hold all of the information
               const TEStat = new TEProps();
               TEStat.wildLevel = Math.ceil(this.levelBeforeDom / (1 + 0.5 * tamingEffectiveness));

               // Verify the calculated WildLevel was even possible
               if (this.levelBeforeDom === Math.floor(TEStat.wildLevel * (1 + 0.5 * tamingEffectiveness))) {
                  TEStat.TE = tamingEffectiveness;

                  const workingStat = new Stat(tempStat);
                  this.c.stats[statIndex].push(workingStat);

                  let tempMap = this.statTEmaps[statIndex];
                  if (tempMap === undefined)
                     tempMap = new Map();

                  tempMap.set(workingStat, TEStat);
                  this.statTEmaps[statIndex] = tempMap;
               }
            }
         }

         // The TE would only get smaller so break the loop
         else if (tamingEffectiveness < 0)
            break;
      }
   }

   findMultiTEStat(tempStat: Stat, statIndex: number, maxLd: number, map: Map<Stat, TEProps>): void {
      const EPSILON = 0.0005;
      const localStats = this.c.stats[statIndex];
      this.statTEmaps[statIndex] = this.statTEmaps[statIndex] || new Map();

      // FIXME: This needs cleaned up, badly
      map.forEach(statTE => {
         if (tempStat.calculateDomLevel(this.m[statIndex], this.c.values[statIndex], !this.c.wild, statTE.TE, this.c.IB) <= maxLd) {

            if (Math.abs(this.c.values[statIndex] - tempStat.calculateValue(this.m[statIndex], !this.c.wild, statTE.TE, this.c.IB)) >= EPSILON)
               return;
            if (localStats.find(stat => tempStat.isEqual(stat)))
               return;

            const workingStat = new Stat(tempStat);
            localStats.push(workingStat);
            this.statTEmaps[statIndex].set(workingStat, statTE);
         }
      });
   }

   filterResults(dbg?: any) {
      if (dbg && !dbg['filterLoops']) dbg.filterLoops = 0;

      let removed = false;
      const localStats = this.c.stats;

      do {
         if (dbg) dbg.filterLoops += 1;
         removed = false;
         this.minWild = 0;
         this.minDom = 0;

         // Find any stats that do not exist as a possible option
         if (this.options.length)
            localStats.forEach(stat => stat.forEach(poss => { if (!this.options.some(option => option.includes(poss))) poss.removeMe = true; }));

         for (let statIndex = HEALTH; statIndex <= SPEED; statIndex++) {
            let tempWM = -1, tempDM = -1;
            // One stat possibility is good
            if (!this.checkedStat[statIndex] && localStats[statIndex].length === 1) {
               this.wildFreeMax -= localStats[statIndex][0].Lw;
               this.domFreeMax -= localStats[statIndex][0].Ld;
               this.checkedStat[statIndex] = true;
            }
            else if (!this.checkedStat[statIndex]) {
               for (const stat of localStats[statIndex]) {
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
               this.minWild += tempWM;
               this.minDom += tempDM;
            }
         }

         for (let statIndex = HEALTH; statIndex <= SPEED; statIndex++) {
            if (!this.checkedStat[statIndex]) {
               for (const stat of localStats[statIndex]) {
                  if (stat.Lw > this.wildFreeMax || stat.Ld > this.domFreeMax) {
                     stat.removeMe = true;
                  }
                  if (stat.Lw + this.minWild - this.wildMin[statIndex] > this.wildFreeMax
                     || stat.Ld + this.minDom - this.domMin[statIndex] > this.domFreeMax
                     || (this.statTEmaps.length > 1 && this.statTEmaps[statIndex] && !this.filterByTE(statIndex, stat))) {
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
         const statTEs = this.statTEmaps[statIndex];
         if (statTEs !== undefined && (statIndex !== index)) {
            for (const stat of this.c.stats[statIndex]) {
               const currentTEstat = statTEs.get(stat), testingTEstat = this.statTEmaps[index].get(TEstat);
               if (currentTEstat.TE === testingTEstat.TE)
                  return true;
            }
            return false;
         }
      }
      return true;
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

   /**
    * Generates all possible options based on the current possible stats
    *
    * @param {*} [dbg = undefined] Debug object used to store information for testing
    * @returns {boolean} False if a stat has 0 possibilities, True otherwise
    */
   generateOptions(dbg?: any): boolean {
      const localCheckedStats = this.checkedStat;
      const localMap = this.statTEmaps;
      const localStats = this.c.stats;
      const freeWild = this.wildFreeMax;
      const freeDom = this.domFreeMax;

      /** Contains the indices used to generate the option array */
      const statIndices: number[] = [];
      const tempStatOption: Stat[] = [];
      const indexMaxArray: number[] = [];
      const indexMax = localStats.length - 1;
      let runningWild = 0;
      let runningDom = 0;
      let runningTE = -1;
      let currentTE = runningTE;
      let statIndexTE = 0;
      let statIndex = 0;

      for (let index = HEALTH; index <= TORPOR; index++) {
         statIndices[index] = 0;
         tempStatOption[index] = localStats[index][0];
         indexMaxArray[index] = localStats[index].length;
      }

      while (statIndex !== -1 && statIndices[statIndex] < indexMaxArray[statIndex]) {
         if (dbg) dbg.totalIterations++;
         // Get the stat at this index
         let localStat = localStats[statIndex][statIndices[statIndex]];
         // Assign the stat to the possible option array
         tempStatOption[statIndex] = localStat;

         // Do some initial stat calculations
         if (!localCheckedStats[statIndex]) {
            runningWild += localStat.Lw;
            runningDom += localStat.Ld;
         }
         if (localMap[statIndex] !== undefined) {
            currentTE = localMap[statIndex].get(localStat).TE;
            if (runningTE === -1) {
               runningTE = currentTE;
               statIndexTE = statIndex;
            }
         }

         // If we are at the last stat
         if (statIndex === indexMax && (runningWild === freeWild || this.unusedStat) && runningDom === freeDom && currentTE === runningTE)
            this.options.push(tempStatOption.slice());

         // Otherwise we need to continue to the next stat index
         if (statIndex !== indexMax && runningWild <= freeWild && runningDom <= freeDom && currentTE === runningTE) {
            statIndex++;
            continue;
         }

         // Either have a bad stat or need to rewind the stat
         do {
            if (statIndices[statIndex] === indexMaxArray[statIndex]) {
               statIndices[statIndex] = 0;
               statIndex--;
               if (statIndex === -1)
                  break;
            }
            localStat = localStats[statIndex][statIndices[statIndex]];
            if (!localCheckedStats[statIndex]) {
               runningWild -= localStat.Lw;
               runningDom -= localStat.Ld;
            }
            if (statIndexTE === statIndex)
               runningTE = -1;
            currentTE = runningTE;
            statIndices[statIndex]++;
         } while (statIndices[statIndex] === indexMaxArray[statIndex]);
      }

      return !!this.options.length;
   }

   dynamicGenerator(dbg?: any): boolean {
      const localStats = this.c.stats;
      const localCheckedStats = this.checkedStat;
      const localMap = this.statTEmaps;

      let runningWild = 0;
      let runningDom = 0;
      let runningTE = -1;
      let currentTE = -1;
      let statIndexTE = -1;

      for (const health of localStats[HEALTH]) {
         if (dbg) dbg.totalIterations++;
         if (!localCheckedStats[HEALTH]) {
            runningWild += health.Lw;
            runningDom += health.Ld;
         }
         if (localMap[HEALTH] !== undefined) {
            if (runningTE === -1) {
               runningTE = currentTE = localMap[HEALTH].get(health).TE;
               statIndexTE = HEALTH;
            }
            else
               currentTE = localMap[HEALTH].get(health).TE;
         }

         if (runningWild > this.wildFreeMax || runningDom > this.domFreeMax || currentTE !== runningTE) {
            runningWild -= health.Lw;
            runningDom = health.Ld;
            if (statIndexTE === HEALTH)
               runningTE = -1;
            currentTE = runningTE;
            continue;
         }

         for (const stamina of localStats[STAMINA]) {
            if (dbg) dbg.totalIterations++;
            if (!localCheckedStats[STAMINA]) {
               runningWild += stamina.Lw;
               runningDom += stamina.Ld;
            }
            if (localMap[STAMINA] !== undefined) {
               if (runningTE === -1) {
                  runningTE = currentTE = localMap[STAMINA].get(stamina).TE;
                  statIndexTE = STAMINA;
               }
               else
                  currentTE = localMap[STAMINA].get(stamina).TE;
            }

            if (runningWild > this.wildFreeMax || runningDom > this.domFreeMax || currentTE !== runningTE) {
               runningWild -= stamina.Lw;
               runningDom -= stamina.Ld;
               if (statIndexTE === STAMINA)
                  runningTE = -1;
               currentTE = runningTE;
               continue;
            }

            for (const oxygen of localStats[OXYGEN]) {
               if (dbg) dbg.totalIterations++;
               if (!localCheckedStats[OXYGEN]) {
                  runningWild += oxygen.Lw;
                  runningDom += oxygen.Ld;
               }
               if (localMap[OXYGEN] !== undefined) {
                  if (runningTE === -1) {
                     runningTE = currentTE = localMap[OXYGEN].get(oxygen).TE;
                     statIndexTE = OXYGEN;
                  }
                  else
                     currentTE = localMap[OXYGEN].get(oxygen).TE;
               }

               if (runningWild > this.wildFreeMax || runningDom > this.domFreeMax || currentTE !== runningTE) {
                  runningWild -= oxygen.Lw;
                  runningDom -= oxygen.Ld;
                  if (statIndexTE === OXYGEN)
                     runningTE = -1;
                  currentTE = runningTE;
                  continue;
               }

               for (const food of localStats[FOOD]) {
                  if (dbg) dbg.totalIterations++;
                  if (!localCheckedStats[FOOD]) {
                     runningWild += food.Lw;
                     runningDom += food.Ld;
                  }
                  if (localMap[FOOD] !== undefined) {
                     if (runningTE === -1) {
                        runningTE = currentTE = localMap[FOOD].get(food).TE;
                        statIndexTE = FOOD;
                     }
                     else
                        currentTE = localMap[FOOD].get(food).TE;
                  }

                  if (runningWild > this.wildFreeMax || runningDom > this.domFreeMax || currentTE !== runningTE) {
                     runningWild -= food.Lw;
                     runningDom -= food.Ld;
                     if (statIndexTE === FOOD)
                        runningTE = -1;
                     currentTE = runningTE;
                     continue;
                  }

                  for (const weight of localStats[WEIGHT]) {
                     if (dbg) dbg.totalIterations++;
                     if (!localCheckedStats[WEIGHT]) {
                        runningWild += weight.Lw;
                        runningDom += weight.Ld;
                     }
                     if (localMap[WEIGHT] !== undefined) {
                        if (runningTE === -1) {
                           runningTE = currentTE = localMap[WEIGHT].get(weight).TE;
                           statIndexTE = WEIGHT;
                        }
                        else
                           currentTE = localMap[WEIGHT].get(weight).TE;
                     }

                     if (runningWild > this.wildFreeMax || runningDom > this.domFreeMax || currentTE !== runningTE) {
                        runningWild -= weight.Lw;
                        runningDom -= weight.Ld;
                        if (statIndexTE === WEIGHT)
                           runningTE = -1;
                        currentTE = runningTE;
                        continue;
                     }

                     for (const damage of localStats[DAMAGE]) {
                        if (dbg) dbg.totalIterations++;
                        if (!localCheckedStats[DAMAGE]) {
                           runningWild += damage.Lw;
                           runningDom += damage.Ld;
                        }
                        if (localMap[DAMAGE] !== undefined) {
                           if (runningTE === -1) {
                              runningTE = currentTE = localMap[DAMAGE].get(damage).TE;
                              statIndexTE = DAMAGE;
                           }
                           else
                              currentTE = localMap[DAMAGE].get(damage).TE;
                        }

                        if (runningWild > this.wildFreeMax || runningDom > this.domFreeMax || currentTE !== runningTE) {
                           runningWild -= damage.Lw;
                           runningDom -= damage.Ld;
                           if (statIndexTE === DAMAGE)
                              runningTE = -1;
                           currentTE = runningTE;
                           continue;
                        }

                        for (const speed of localStats[SPEED]) {
                           if (dbg) dbg.totalIterations++;
                           if (!localCheckedStats[SPEED]) {
                              runningWild += speed.Lw;
                              runningDom += speed.Ld;
                           }
                           if (localMap[SPEED] !== undefined) {
                              if (runningTE === -1) {
                                 runningTE = currentTE = localMap[SPEED].get(speed).TE;
                                 statIndexTE = SPEED;
                              }
                              else
                                 currentTE = localMap[SPEED].get(speed).TE;
                           }

                           if (runningWild > this.wildFreeMax || runningDom > this.domFreeMax || currentTE !== runningTE) {
                              runningWild -= speed.Lw;
                              runningDom -= speed.Ld;
                              if (statIndexTE === SPEED)
                                 runningTE = -1;
                              currentTE = runningTE;
                              continue;
                           }

                           for (const torpor of localStats[TORPOR]) {
                              if (dbg) dbg.totalIterations++;
                              if (!localCheckedStats[TORPOR]) {
                                 runningWild += torpor.Lw;
                                 runningDom += torpor.Ld;
                              }
                              if (localMap[TORPOR] !== undefined) {
                                 if (runningTE === -1) {
                                    runningTE = currentTE = localMap[TORPOR].get(torpor).TE;
                                    statIndexTE = TORPOR;
                                 }
                                 else
                                    currentTE = localMap[TORPOR].get(torpor).TE;
                              }

                              if (runningWild > this.wildFreeMax || runningDom > this.domFreeMax || currentTE !== runningTE) {
                                 runningWild -= torpor.Lw;
                                 runningDom -= torpor.Ld;
                                 if (statIndexTE === TORPOR)
                                    runningTE = -1;
                                 currentTE = runningTE;
                                 continue;
                              }
                              // We finally got to a good stat combination
                              else if ((runningWild === this.wildFreeMax || this.unusedStat) && runningDom === this.domFreeMax && currentTE === runningTE) {
                                 this.options.push([health, stamina, oxygen, food, weight, damage, speed, torpor]);
                              }

                              if (!this.checkedStat[TORPOR]) {
                                 runningWild -= torpor.Lw;
                                 runningDom -= torpor.Ld;
                              }
                              if (statIndexTE === TORPOR)
                                 runningTE = -1;
                              currentTE = runningTE;
                           }

                           if (!this.checkedStat[SPEED]) {
                              runningWild -= speed.Lw;
                              runningDom -= speed.Ld;
                           }
                           if (statIndexTE === SPEED)
                              runningTE = -1;
                           currentTE = runningTE;
                        }

                        if (!this.checkedStat[DAMAGE]) {
                           runningWild -= damage.Lw;
                           runningDom -= damage.Ld;
                        }
                        if (statIndexTE === DAMAGE)
                           runningTE = -1;
                        currentTE = runningTE;
                     }

                     if (!this.checkedStat[WEIGHT]) {
                        runningWild -= weight.Lw;
                        runningDom -= weight.Ld;
                     }
                     if (statIndexTE === WEIGHT)
                        runningTE = -1;
                     currentTE = runningTE;
                  }

                  if (!this.checkedStat[FOOD]) {
                     runningWild -= food.Lw;
                     runningDom -= food.Ld;
                  }
                  if (statIndexTE === FOOD)
                     runningTE = -1;
                  currentTE = runningTE;
               }

               if (!this.checkedStat[OXYGEN]) {
                  runningWild -= oxygen.Lw;
                  runningDom -= oxygen.Ld;
               }
               if (statIndexTE === OXYGEN)
                  runningTE = -1;
               currentTE = runningTE;
            }

            if (!this.checkedStat[STAMINA]) {
               runningWild -= stamina.Lw;
               runningDom -= stamina.Ld;
            }
            if (statIndexTE === STAMINA)
               runningTE = -1;
            currentTE = runningTE;
         }

         if (!this.checkedStat[HEALTH]) {
            runningWild -= health.Lw;
            runningDom = health.Ld;
         }
         if (statIndexTE === HEALTH)
            runningTE = -1;
         currentTE = runningTE;
      }
      return !!this.options.length;
   }

   /**
    * Option sort comparison function using deviation from the stat mean to determine sort order
    *
    * @param opt1 First option to compare
    * @param opt2 Second option to compare
    *
    * @returns {number} The difference between the deviation total
    */
   optionDeviation(opt1: Stat[], opt2: Stat[]): number {
      /** The stat mean used as our baseline for deviation */
      const standard = opt1[TORPOR].Lw / 7;
      /** Contains the deviation total used to compare */
      let opt1Dev = 0;
      /** Contains the deviation total used to compare */
      let opt2Dev = 0;

      // Square the deviation from standard and total it up
      for (let stat = 0; stat < opt1.length && stat < opt2.length; stat++) {
         opt1Dev += (opt1[stat].Lw - standard) * (opt1[stat].Lw - standard);
         opt2Dev += (opt2[stat].Lw - standard) * (opt1[stat].Lw - standard);
      }

      return opt1Dev - opt2Dev;
   }
}
