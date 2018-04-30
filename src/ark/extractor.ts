import * as Ark from '@/ark';
import { StatMultipliers } from '@/ark/multipliers';
import { Stat, StatLike } from '@/ark/types';
import { FOOD, HEALTH, SPEED, TORPOR } from '@/consts';
import { Server } from '@/data/objects';
import { intervalAverage, intFromRange, intFromRangeReverse } from '@/number_utils';
import * as Utils from '@/utils';
import * as IA from 'interval-arithmetic';
import * as compile from 'interval-arithmetic-eval';


export interface ExtractorInput {
   server: Server;
   species: string;
   level: number;
   wild: boolean;
   tamed: boolean;
   bred: boolean;
   IB: Interval;
   TE?: Interval;
   values: Interval[];
}

/** Contains all functions for intervals */
const RangeFuncs = {
   calcWL: compile('tamedLevel/(1+0.5*TE)').eval,
   calcTEFromWL: compile('(tamedLevel/wildLevel-1)/0.5').eval,
   calcTE: compile('(V / ((1 + Lw * Iw) * B * TBHM * (1 + IB * IBM) + Ta) / (1 + Ld * Id) - 1) / Tm').eval,
   calcIB: compile('((V / (1 + TE * Tm) / (1 + Ld * Id) - Ta) / (B * (1 + Lw * Iw) * TBHM) - 1) / IBM').eval,

   // calcV: compile('((1 + Lw * Iw) * B * TBHM * (1 + IB * IBM) + Ta) * (1 + TE * Tm) * (1 + Ld * Id)').eval,
   calcV(Lw: number, Ld: number, TE: Interval, IB: Interval, stat: RangeStat) {
      return IA.mul(IA.mul((IA.add(IA.mul(IA.mul(IA.mul((IA.add(IA.ONE, IA.mul(IA(Lw), stat.Iw))), stat.B), stat.TBHM),
         (IA.add(IA.ONE, IA.mul(IB, stat.IBM)))), stat.Ta)), (IA.add(IA.ONE, IA.mul(TE, stat.Tm)))),
         (IA.add(IA.ONE, IA.mul(IA(Ld), stat.Id))));
   },

   // calcLw: compile('((V / ((1 + Ld * Id) * (1 + TE * Tm)) - Ta) / (B * TBHM * (1 + IB * IBM)) - 1) / Iw').eval,
   calcLw(Ld: number, TE: Interval, IB: Interval, stat: RangeStat) {
      return IA.div((IA.sub(IA.div((IA.sub(IA.div(stat.V, (IA.mul((IA.add(IA.ONE, IA.mul(IA(Ld), stat.Id))),
         (IA.add(IA.ONE, IA.mul(TE, stat.Tm)))))), stat.Ta)), (IA.mul(IA.mul(stat.B, stat.TBHM),
            (IA.add(IA.ONE, IA.mul(IB, stat.IBM)))))), IA.ONE)), stat.Iw);
   },

   // calcLd: compile('((V / ((1 + Lw * Iw) * B * TBHM * (1 + IB * IBM) + Ta) / (1 + TE * Tm)) - 1) / Id').eval,
   calcLd(Lw: number, TE: Interval, IB: Interval, stat: RangeStat) {
      return IA.div((IA.sub((IA.div(IA.div(stat.V, (IA.add(IA.mul(IA.mul(IA.mul((IA.add(IA.ONE, IA.mul(IA(Lw), stat.Iw))), stat.B), stat.TBHM),
         (IA.add(IA.ONE, IA.mul(IB, stat.IBM)))), stat.Ta))), (IA.add(IA.ONE, IA.mul(TE, stat.Tm))))), IA.ONE)), stat.Id);
   },
};

export class TEProps {
   TE = IA(0);
   wildLevel = 0;
}
class RangeStat {
   V: Interval;

   B: Interval;
   Iw: Interval;
   Id: Interval;
   Ta: Interval;
   Tm: Interval;
   TBHM: Interval;
   IBM: Interval;
   TE?: Interval;
}

export class Extractor {
   /** Inputs to the extractor */
   c: ExtractorInput;

   /** Stores all multipliers for stat calculations */
   m: StatMultipliers[] = [];

   /** A counter to see how many wild stat levels are unaccounted for */
   wildFreeMax = 0;
   /** A counter to see how many dom stat levels are unaccounted for */
   domFreeMax = 0;
   /** What level the creature was born/tamed at */
   levelBeforeDom = 0;
   /** A running total of each stat's minimum wild stat levels */
   minWild = 0;
   /** A running total of each stat's minimum dom stat levels */
   minDom = 0;
   /** A flag signifying a stat isn't displayed by Ark */
   unusedStat = false;
   /** A flag signifying a successful extraction */
   success = true;
   /** Stores the starting IB range */
   originalIB = IA(0);

   /** Possible values for each stat */
   stats: Stat[][];
   /** Stores each stats minimum wild stat level */
   wildMin: number[] = [];
   /** Stores each stats minimum dom stat level */
   domMin: number[] = [];
   /** Contains stat options from SPEED to TORPOR, numerically */
   options: Stat[][] = [];
   /** Signifies that a stat only has one possibility */
   checkedStat: boolean[] = [];
   /** Whether a stat is based on TE */
   isTEStat: boolean[] = [];
   /** Contains all of the TE properties for stats */
   statTEMap: Map<Stat, TEProps> = new Map();

   // Variables for IA ranges
   /** Contains all stat-specific variables for intervals */
   rangeStats: RangeStat[] = Utils.FilledArray(8, () => (new RangeStat()));
   /** Contains all variables for intervals */
   rangeVars = {
      Lw: 0,
      Ld: 0,
      IB: IA(0),
      TE: IA(0),
      tamedLevel: IA(0),
      wildLevel: IA(0),
   };

   constructor(inputs: ExtractorInput) {
      // TODO: Add consider wild levels
      // Only way to calculate wild levels is with a TE
      // Creatures like gigas are unaffected, just as if they were bred
      // The code is already laid out to handle support for considerWildLevelSteps
      // Will have to implement a WildLevel override for 100% TE, if a creature was tamed that way
      //    It's likely it was force tamed anyways (possibly spawned + tamed)
      // Should not rely on wild level steps as, it will speed up extraction, but not everyone may set it :(

      this.c = inputs;

      // considerWildLevelSteps = considerWildLevelSteps && !bred;
      // Make sure the multipliers haven't changed
      this.m = Ark.GetMultipliers(inputs.server, inputs.species);

      // Clear the checked property for future extractions (also clearing out any Vue observer)
      this.stats = Utils.FilledArray(8, () => []);

      // TE is as specified or the whole range
      this.c.TE = inputs.TE || IA(0, Infinity);

      // Change variables based on wild, tamed, bred
      if (this.c.wild) {
         this.c.TE = IA(0);
         this.c.IB = IA(0);
         this.rangeVars.TE = IA(0);
         this.rangeVars.IB = IA(0);
      }
      else if (this.c.tamed) {
         this.c.IB = IA(0);
         this.rangeVars.TE = IA(0, 1);
         this.rangeVars.IB = IA(0);
      }
      else {
         this.c.TE = IA(1);
         this.rangeVars.TE = IA(1);
         this.rangeVars.IB = this.c.IB;
         this.originalIB = this.rangeVars.IB = IA.intersection(this.rangeVars.IB, IA(0, Infinity));
      }
   }

   extract(dbg?: any) {
      // TODO: Add either a way to throw errors w/ codes (for specific reasons like bad multipliers, stats, etc.)
      //    Or provide an alternative method (returning under bad situations is acceptable for now)

      // Used to initialize all relevant interval variables
      this.init();

      let tempStat = new Stat();
      this.rangeVars.Lw = 0;
      this.rangeVars.Ld = 0;

      this.stats[TORPOR].push(new Stat());
      let torporLwRange: Interval = IA();

      torporLwRange = RangeFuncs.calcLw(this.rangeVars.Ld, this.rangeVars.TE, this.rangeVars.IB, this.rangeStats[TORPOR]);
      this.checkedStat[TORPOR] = true;

      for (this.stats[TORPOR][0].Lw of intFromRange(torporLwRange, Math.round)) {
         this.rangeVars.Lw = 0;
         this.rangeVars.Ld = 0;
         // Reset flag to test for failed cases
         this.success = true;

         // Reset arrays to handle multiple loops
         this.options = [];

         for (let index = HEALTH; index <= SPEED; index++) {
            this.stats[index] = [];
            this.checkedStat[index] = false;
         }

         // Calculate the max number of levels based on level and torpor
         this.wildFreeMax = this.stats[TORPOR][0].Lw;
         this.levelBeforeDom = this.stats[TORPOR][0].Lw + 1;
         this.domFreeMax = Math.max(this.c.level - this.wildFreeMax - 1, 0);

         // Set range to be used for TE calculations
         this.rangeVars.tamedLevel = IA().halfOpenRight(this.levelBeforeDom, this.levelBeforeDom + 1);

         // If it's bred, we need to do some magic with the IB
         if (this.c.bred)
            if (!this.dynamicIBCalculation())
               continue;

         // Loop all stats except for torpor
         for (let statIndex = HEALTH; statIndex <= SPEED && this.success; statIndex++) {
            tempStat = new Stat();
            this.rangeVars.Lw = 0;
            this.rangeVars.Ld = 0;

            // Covers unused stats like oxygen
            if (!this.uniqueStatSituation(statIndex)) {
               // Calculate the highest Lw could be
               this.rangeVars.Ld = 0;
               let rangeLw = RangeFuncs.calcLw(this.rangeVars.Ld, IA.ZERO, this.rangeVars.IB, this.rangeStats[statIndex]);
               if (IA.lt(this.rangeStats[statIndex].Tm, IA.ZERO))
                  rangeLw = RangeFuncs.calcLw(this.rangeVars.Ld, IA.ONE, this.rangeVars.IB, this.rangeStats[statIndex]);
               rangeLw.lo = 0;

               if (IA.isEmpty(rangeLw))
                  rangeLw.hi = this.wildFreeMax - this.minWild;

               rangeLw = IA.intersection(rangeLw, IA(0, this.wildFreeMax - this.minWild));

               // We don't need to calculate TE to extract the levels
               if (!this.c.tamed || IA.leq(this.rangeStats[statIndex].Tm, IA.ZERO)) {
                  // Loop all possible Lws
                  for (this.rangeVars.Lw of intFromRangeReverse(rangeLw)) {
                     // Calculate the highest Ld could be
                     let rangeLd = RangeFuncs.calcLd(this.rangeVars.Lw, this.rangeVars.TE, this.rangeVars.IB, this.rangeStats[statIndex]);
                     rangeLd.lo = 0;
                     rangeLd = IA.intersection(rangeLd, IA(0, this.domFreeMax - this.minDom));
                     tempStat.Lw = this.rangeVars.Lw;
                     this.nonTEStatCalculation(statIndex, rangeLd);
                  }
               }

               else {
                  const localMap = this.statTEMap;
                  this.isTEStat[statIndex] = true;
                  // Call a different function if we already added some TE stats
                  const methToCall = (localMap.size === 0) ? this.findTEStats.bind(this) : this.findMultiTEStat.bind(this);
                  // Loop all possible Lws
                  for (this.rangeVars.Lw of intFromRangeReverse(rangeLw)) {
                     // Calculate the highest Ld could be
                     let rangeLd = RangeFuncs.calcLd(this.rangeVars.Lw, IA.ZERO, this.rangeVars.IB, this.rangeStats[statIndex]);
                     rangeLd.lo = 0;
                     rangeLd = IA.intersection(rangeLd, IA(0, this.domFreeMax - this.minDom));
                     methToCall(statIndex, rangeLd, localMap);
                  }
               }
            }

            if (this.stats[statIndex].length === 1) {
               this.wildFreeMax -= this.stats[statIndex][0].Lw;
               this.domFreeMax -= this.stats[statIndex][0].Ld;
               this.checkedStat[statIndex] = true;
            }
            else if (this.stats[statIndex].length > 1) {
               let tempWM = this.wildFreeMax, tempDM = this.domFreeMax;
               for (const stat of this.stats[statIndex]) {
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

         // All creatures, even wild, need their stats filtered
         if (dbg) dbg.preFilterStats = Utils.DeepCopy(this.stats);
         if (this.success)
            this.filterResults(dbg);

         this.success = !!this.options.length;

         if (this.success)
            break;
      }

      if (dbg) dbg.levelFromTorpor = this.stats[TORPOR][0].Lw;

      // Only filter results if we have a result for every stat
      for (let stat = HEALTH; stat <= SPEED; stat++) {
         if (this.stats[stat].length === 0) {
            if (dbg) dbg.failReason = 'No options found for stat ' + stat;
            return { stats: this.stats, options: this.options, TEs: this.statTEMap };
         }
      }

      // Sort the options based on most likely (deviation from the expected average)
      this.options.sort((opt1, opt2) => this.optionDeviation(opt1, opt2));

      return { stats: this.stats, options: this.options, TEs: this.statTEMap };
   }

   init() {
      // rangeStats
      for (let statIndex = HEALTH; statIndex <= TORPOR; statIndex++) {
         this.rangeStats[statIndex].V = this.c.values[statIndex];

         // Stat & Server Multipliers
         this.rangeStats[statIndex].B = this.m[statIndex].B;
         this.rangeStats[statIndex].Iw = this.m[statIndex].Iw;
         this.rangeStats[statIndex].Id = this.m[statIndex].Id;
         this.rangeStats[statIndex].Ta = this.c.wild ? IA.ZERO : this.m[statIndex].Ta;
         this.rangeStats[statIndex].Tm = this.c.wild ? IA.ONE : this.m[statIndex].Tm;

         this.rangeStats[statIndex].TBHM = this.m[statIndex].TBHM;
         this.rangeStats[statIndex].IBM = this.m[statIndex].IBM;

         if (this.c.wild)
            this.rangeStats[statIndex].TBHM = IA.ONE;
         else {
            // Handle negative values
            if (IA.lt(this.m[statIndex].Tm, IA.ZERO)) {
               this.rangeStats[statIndex].TE = IA.ONE;
            }
         }
      }
   }

   /**
    *  Attempts to calculate a valid Imprint Bonus from the one entered. While it doesn't support the same "Exactly"
    *  option that ASB does, it does first attempt to look at the entered IB to see if it's valid first. Unfortunately,
    *  that also means that the IB must be rounded before the Extractor can use it as the assumption is made (to create
    *  the min/max IB) that 0.05 in either direction is still valid.
    *
    *  @return {undefined} There is no returned value
    */
   dynamicIBCalculation(): boolean {
      const localRangeVars = this.rangeVars;
      const localRangeFood = this.rangeStats[FOOD];
      const localRangeTorpor = this.rangeStats[TORPOR];

      // Get stat levels from torpor
      localRangeVars.Lw = this.stats[TORPOR][0].Lw;
      localRangeVars.Ld = this.stats[TORPOR][0].Ld;

      // Extract the IB from Torpor
      let tempIBRange = RangeFuncs.calcIB({ ...localRangeVars, ...localRangeTorpor, });
      if (!IA.intervalsOverlap(tempIBRange, this.originalIB))
         return false;

      tempIBRange = localRangeVars.IB = IA.intersection(tempIBRange, this.originalIB);

      // Convert Intervals to numbers
      this.c.IB = localRangeVars.IB;

      // Check the food stat for the IB as well (Only works if food is un-levelled)
      localRangeVars.Lw = 0;
      localRangeVars.Ld = 0;
      localRangeVars.Lw = Math.round(intervalAverage(RangeFuncs.calcV(0, 0, localRangeVars.TE, localRangeVars.IB, localRangeFood)));
      tempIBRange = RangeFuncs.calcIB({ ...localRangeVars, ...localRangeFood });

      // Check to see if the new IB still allows torpor to extract correctly
      const newExpectedValue = RangeFuncs.calcV(localRangeVars.Lw, 0, localRangeVars.TE, localRangeVars.IB, localRangeFood);
      if (IA.intervalsOverlap(newExpectedValue, this.c.values[TORPOR])) {
         localRangeVars.IB = tempIBRange;
         this.c.IB = tempIBRange;
      }

      // IB can't be lower than 0
      if (this.c.IB.lo < 0) {
         this.c.IB = IA.intersection(this.c.IB, IA(0, Infinity));
         localRangeVars.IB = this.c.IB;
      }
      return true;
   }

   uniqueStatSituation(statIndex: number): boolean {
      const localStats = this.rangeStats[statIndex];
      if (!this.m[statIndex].notUsed && (!this.unusedStat || IA.notEqual(localStats.Iw, IA.ZERO)) && IA.notEqual(localStats.Id, IA.ZERO))
         return false;

      const tempStat2 = new Stat(0, 0);
      // IF a stat isn't used, set it to -1 and continue
      if (this.m[statIndex].notUsed) {
         this.unusedStat = true;
         tempStat2.Lw = -1;
      }

      // We can't calculate stats that don't allow wild Increasees if a stat is unused
      else if (this.unusedStat && IA.equal(localStats.Iw, IA.ZERO)) {
         // Calculate DOM for speed
         tempStat2.Ld = Math.round(intervalAverage(RangeFuncs.calcLd(this.rangeVars.Lw, this.rangeVars.TE, this.rangeVars.IB, localStats)));
         tempStat2.Lw = -1;
      }

      // Creatures that don't allow speed to increase domestically also don't allow wild levels
      this.stats[statIndex] = [tempStat2];
      this.domFreeMax -= tempStat2.Ld;
      this.checkedStat[statIndex] = true;
      return true;
   }

   nonTEStatCalculation(statIndex: number, rangeLd: Interval): void {
      const localVars = this.rangeVars;
      const localStats = this.rangeStats[statIndex];
      const localStatsTorpor = this.rangeStats[TORPOR];
      localVars.Ld = Math.round(intervalAverage(RangeFuncs.calcLd(this.rangeVars.Lw, this.rangeVars.TE, this.rangeVars.IB, localStats)));

      if (!IA.hasValue(rangeLd, localVars.Ld))
         return;

      const calculatedValue = RangeFuncs.calcV(localVars.Lw, localVars.Ld, localStats.TE || localVars.TE, localVars.IB, localStats);
      if (IA.intervalsOverlap(calculatedValue, localStats.V))
         this.stats[statIndex].push(new Stat(localVars.Lw, localVars.Ld));

      // If it doesn't calculate properly, it may have used a different IB (Mostly relevant for Food)
      else if (this.c.bred) {
         const rangeIB = RangeFuncs.calcIB({ ...localVars, ...localStats });

         if (IA.intervalsOverlap(rangeIB, this.originalIB)) {
            const tempStat2: StatLike = new Stat(this.stats[TORPOR][0]);
            const expectedTorpor = RangeFuncs.calcV(tempStat2.Lw, tempStat2.Ld, localVars.TE, rangeIB, localStats);
            if (IA.intervalsOverlap(expectedTorpor, localStatsTorpor.V as Interval)) {
               localVars.IB = IA.intersection(rangeIB, localVars.IB);
               this.c.IB = localVars.IB;
               this.stats[statIndex].push(new Stat(localVars.Lw, localVars.Ld));
            }
         }
      }
   }

   findTEStats(statIndex: number, rangeLd: Interval, map: Map<Stat, TEProps>) {
      const localStats = this.rangeStats[statIndex];
      const localVars = this.rangeVars;

      for (localVars.Ld of intFromRange(rangeLd)) {
         localVars.TE = RangeFuncs.calcTE({ ...localVars, ...localStats });

         // If the range is greater than 1
         if (localVars.TE.lo > 1)
            continue;

         // If the range is less than 0, it will only continue to get smaller
         if (localVars.TE.hi < 0)
            break;

         localVars.TE = IA.intersection(localVars.TE, IA(0, 1));

         const rangeWL = RangeFuncs.calcWL({ ...localVars });

         for (const i of intFromRange(rangeWL, Math.ceil)) {
            localVars.wildLevel = IA(i);
            let tempTERange = RangeFuncs.calcTEFromWL({ ...localVars });
            tempTERange = IA.intersection(localVars.TE, tempTERange);

            // Valid range
            if (!IA.isEmpty(tempTERange) && !IA.isWhole(tempTERange)) {
               const TEStat = new TEProps();
               TEStat.wildLevel = i;
               // Get the average of the TE range
               TEStat.TE = localVars.TE;

               const workingStat = new Stat(localVars.Lw, localVars.Ld);
               this.stats[statIndex].push(workingStat);

               map.set(workingStat, TEStat);
            }
         }
      }
   }

   findMultiTEStat(statIndex: number, rangeLd: Interval, map: Map<Stat, TEProps>) {
      const localStats = this.stats[statIndex];
      const localVars = this.rangeVars;
      const tempStat = new Stat(localVars.Lw, 0);

      map.forEach(statTE => {
         // Calculate the Ld range based on known good TE values
         const rangeForLd = RangeFuncs.calcLd(this.rangeVars.Lw, statTE.TE, this.rangeVars.IB, this.rangeStats[statIndex]);

         // Loop Ld range
         for (tempStat.Ld of intFromRange(rangeForLd)) {
            // Makes sure the Ld is within range
            if (!IA.hasValue(rangeLd, tempStat.Ld))
               continue;

            // Makes sure duplicate stats aren't being added
            if (localStats.find(stat => tempStat.isEqual(stat)))
               continue;

            // Add stat
            localStats.push(tempStat);
            map.set(tempStat, statTE);
         }
      });
   }

   filterResults(dbg?: any) {
      if (dbg && !dbg['filterLoops']) dbg.filterLoops = 0;

      let removed = false;
      const localStats = this.stats;

      do {
         if (dbg) dbg.filterLoops += 1;
         removed = false;
         this.minWild = 0;
         this.minDom = 0;

         // Find any stats that do not exist as a possible option
         if (this.options.length)
            localStats.forEach(stat => stat.forEach(poss => { if (!this.options.some(option => option.includes(poss))) poss.removeMe = true; }));

         for (let statIndex = HEALTH; statIndex <= SPEED; statIndex++) {
            let tempWM = this.wildFreeMax, tempDM = this.domFreeMax;
            // One stat possibility is good
            if (!this.checkedStat[statIndex] && localStats[statIndex].length === 1) {
               this.wildFreeMax -= localStats[statIndex][0].Lw;
               this.domFreeMax -= localStats[statIndex][0].Ld;
               this.checkedStat[statIndex] = true;
            }
            else if (!this.checkedStat[statIndex]) {
               for (const stat of localStats[statIndex]) {
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
                     || (this.isTEStat[statIndex] && this.isTEStat.length > 1 && !this.filterByTE(statIndex, stat, this.statTEMap))) {
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
   filterByTE(index: number, TEstat: Stat, map: Map<Stat, TEProps>) {
      for (let statIndex = 0; statIndex < 7; statIndex++) {
         if (statIndex !== index && this.isTEStat[statIndex]) {
            for (const stat of this.stats[statIndex]) {
               const currentTEstat = map.get(stat);
               const testingTEstat = map.get(TEstat);
               if (testingTEstat !== undefined && currentTEstat.TE === testingTEstat.TE)
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
         initialStatsLength = this.stats[i].length;
         this.stats[i] = this.stats[i].filter(stat => !stat['removeMe']);
         if (dbg) dbg.numberRemoved += initialStatsLength - this.stats[i].length;
         if (!removed && initialStatsLength > this.stats[i].length)
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
      const localMap = this.statTEMap;
      const localStats = this.stats;
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
         if (localMap.size > 0) {
            const tempTE = localMap.get(localStat);
            if (tempTE !== undefined) {
               currentTE = intervalAverage(tempTE.TE);
               if (runningTE === -1) {
                  runningTE = currentTE;
                  statIndexTE = statIndex;
               }
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
