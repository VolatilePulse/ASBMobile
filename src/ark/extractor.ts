import * as Ark from '@/ark';
import { StatMultipliers } from '@/ark/multipliers';
import { Stat, StatLike } from '@/ark/types';
import { FOOD, HEALTH, SPEED, TORPOR } from '@/consts';
import { Server } from '@/data/objects';
import { intervalAverage, intFromRange, intFromRangeReverse } from '@/number_utils';
import * as Utils from '@/utils';
import * as IA from 'interval-arithmetic';


export interface ExtractorInput {
   server: Server;
   species: string;
   level: number;
   wild: boolean;
   tamed: boolean;
   bred: boolean;
   IB: Interval;
   values: Interval[];
}

// tamedLevel / (1 + 0.5 * TE)
function calcWL(tamedLevel: Interval, TE: Interval) {
   return IA.div(tamedLevel, (IA.add(IA.ONE, IA.mul(IA(0.5), TE))));
}

// (tamedLevel / wildLevel - 1) / 0.5
function calcTEFromWL(tamedLevel: Interval, wildLevel: Interval) {
   return IA.div((IA.sub(IA.div(tamedLevel, wildLevel), IA.ONE)), IA(0.5));
}

// ((V / (1 + TE * Tm) / (1 + Ld * Id) - Ta) / (B * (1 + Lw * Iw) * TBHM) - 1) / IBM
function calcIB(V: Interval, Lw: number, Ld: number, TE: Interval, mult: StatMultipliers) {
   return IA.div((IA.sub(IA.div((IA.sub(IA.div(IA.div(V, (IA.add(IA.ONE, IA.mul(TE, mult.Tm)))),
      (IA.add(IA.ONE, IA.mul(IA(Ld), mult.Id)))), mult.Ta)), (IA.mul(IA.mul(mult.B,
         (IA.add(IA.ONE, IA.mul(IA(Lw), mult.Iw)))), mult.TBHM))), IA.ONE)), mult.IBM);
}

// (V / ((1 + Lw * Iw) * B * TBHM * (1 + IB * IBM) + Ta) / (1 + Ld * Id) - 1) / Tm
function calcTE(V: Interval, Lw: number, Ld: number, IB: Interval, mult: StatMultipliers) {
   return IA.div((IA.sub(IA.div(IA.div(V, (IA.add(IA.mul(IA.mul(IA.mul((IA.add(IA.ONE, IA.mul(IA(Lw), mult.Iw))), mult.B),
      mult.TBHM), (IA.add(IA.ONE, IA.mul(IB, mult.IBM)))), mult.Ta))), (IA.add(IA.ONE, IA.mul(IA(Ld), mult.Id)))), IA.ONE)), mult.Tm);
}

// ((1 + Lw * Iw) * B * TBHM * (1 + IB * IBM) + Ta) * (1 + TE * Tm) * (1 + Ld * Id)
function calcV(Lw: number, Ld: number, TE: Interval, IB: Interval, mult: StatMultipliers) {
   return IA.mul(IA.mul((IA.add(IA.mul(IA.mul(IA.mul((IA.add(IA.ONE, IA.mul(IA(Lw), mult.Iw))), mult.B), mult.TBHM),
      (IA.add(IA.ONE, IA.mul(IB, mult.IBM)))), mult.Ta)), (IA.add(IA.ONE, IA.mul(TE, mult.Tm)))), (IA.add(IA.ONE, IA.mul(IA(Ld), mult.Id))));
}

// ((V / ((1 + Ld * Id) * (1 + TE * Tm)) - Ta) / (B * TBHM * (1 + IB * IBM)) - 1) / Iw
function calcLw(V: Interval, Ld: number, TE: Interval, IB: Interval, mult: StatMultipliers) {
   return IA.div((IA.sub(IA.div((IA.sub(IA.div(V, (IA.mul((IA.add(IA.ONE, IA.mul(IA(Ld), mult.Id))),
      (IA.add(IA.ONE, IA.mul(TE, mult.Tm)))))), mult.Ta)), (IA.mul(IA.mul(mult.B, mult.TBHM),
         (IA.add(IA.ONE, IA.mul(IB, mult.IBM)))))), IA.ONE)), mult.Iw);
}

// ((V / ((1 + Lw * Iw) * B * TBHM * (1 + IB * IBM) + Ta) / (1 + TE * Tm)) - 1) / Id
function calcLd(V: Interval, Lw: number, TE: Interval, IB: Interval, mult: StatMultipliers) {
   return IA.div((IA.sub((IA.div(IA.div(V, (IA.add(IA.mul(IA.mul(IA.mul((IA.add(IA.ONE, IA.mul(IA(Lw), mult.Iw))), mult.B), mult.TBHM),
      (IA.add(IA.ONE, IA.mul(IB, mult.IBM)))), mult.Ta))), (IA.add(IA.ONE, IA.mul(TE, mult.Tm))))), IA.ONE)), mult.Id);
}

export class TEProps {
   TE = IA.ZERO;
   wildLevel = 0;
}


/** The Extractor tries to work out possible stat levels from a given creature's details */
export class Extractor {
   /** Inputs to the extractor */
   input: Readonly<ExtractorInput>;

   /** Contains the stat Values */
   values: ReadonlyArray<Readonly<Interval>>;

   /** Stores all multipliers for stat calculations */
   m: ReadonlyArray<StatMultipliers> = [];

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
   /** Contains all variables for intervals */
   rangeVars = {
      Lw: 0,
      Ld: 0,
      IB: IA.ZERO,
      TE: Utils.FilledArray(8, () => IA.ZERO),
      tamedLevel: IA.ZERO,
      wildLevel: IA.ZERO,
   };

   constructor(inputs: ExtractorInput) {
      // TODO: Add consider wild levels
      // Only way to calculate wild levels is with a TE
      // Creatures like gigas are unaffected, just as if they were bred
      // The code is already laid out to handle support for considerWildLevelSteps
      // Will have to implement a WildLevel override for 100% TE, if a creature was tamed that way
      //    It's likely it was force tamed anyways (possibly spawned + tamed)
      // Should not rely on wild level steps as, it will speed up extraction, but not everyone may set it :(

      this.input = inputs;
      this.values = inputs.values;

      // considerWildLevelSteps = considerWildLevelSteps && !bred;
      const incomingM = Ark.GetMultipliers(inputs.server, inputs.species);

      // Clear the checked property for future extractions (also clearing out any Vue observer)
      this.stats = Utils.FilledArray(8, () => []);

      // Change variables based on wild, tamed, bred
      if (this.input.wild) {
         this.rangeVars.TE = Utils.FilledArray(8, () => IA.ZERO);
         this.rangeVars.IB = /*this.input.IB = */IA.ZERO;  // TODO: Check you're happy with this
      }
      else if (this.input.tamed) {
         this.rangeVars.TE = Utils.FilledArray(8, () => IA(0, 1));
         this.rangeVars.IB = /*this.input.IB = */IA.ZERO;  // TODO: Check you're happy with this
      }
      else {
         this.rangeVars.TE = Utils.FilledArray(8, () => IA.ONE);
         this.rangeVars.IB = this.input.IB;
      }

      for (const statIndex in incomingM) {
         incomingM[statIndex].Ta = this.input.wild ? IA.ZERO : incomingM[statIndex].Ta;
         incomingM[statIndex].Tm = this.input.wild ? IA.ZERO : incomingM[statIndex].Tm;
         incomingM[statIndex].TBHM = this.input.wild ? IA.ONE : incomingM[statIndex].TBHM;

         if (IA.lt(incomingM[statIndex].Tm, IA.ZERO)) {
            this.rangeVars.TE[statIndex] = IA(0.999, 1); // FIXME: This seems very wrong
            // this.rangeVars.TE[statIndex] = IA(1);
         }
      }

      // Set the modifiers into this, making them read-only
      this.m = incomingM;
   }

   extract(dbg?: any) {
      // TODO: Add either a way to throw errors w/ codes (for specific reasons like bad multipliers, stats, etc.)
      //    Or provide an alternative method (returning under bad situations is acceptable for now)

      // Generate the possible Torpor Lw values based on the IB range
      const torporLwRange = calcLw(this.values[TORPOR], this.rangeVars.Ld, this.rangeVars.TE[TORPOR], this.rangeVars.IB, this.m[TORPOR]);
      this.checkedStat[TORPOR] = true;

      // Set an empty stat for Torpor
      this.stats[TORPOR].push(new Stat());

      // Loop across the possible Torpor Lw values
      for (this.stats[TORPOR][0].Lw of intFromRange(torporLwRange)) {
         // Reset variables for next iteration
         this.rangeVars.Lw = 0;
         this.rangeVars.Ld = 0;
         this.success = true;

         // Reset arrays to handle multiple loops
         for (let index = HEALTH; index <= SPEED; index++) {
            this.stats[index] = [];
            this.checkedStat[index] = false;
         }

         // Calculate the max number of levels based on level and torpor
         this.wildFreeMax = this.stats[TORPOR][0].Lw;
         this.levelBeforeDom = this.stats[TORPOR][0].Lw + 1;
         this.domFreeMax = Math.max(this.input.level - this.wildFreeMax - 1, 0);

         // Set range to be used for TE calculations
         this.rangeVars.tamedLevel = IA().halfOpenRight(this.levelBeforeDom, this.levelBeforeDom + 1);

         // If it's bred, we need to do some magic with the IB
         if (this.input.bred)
            if (!this.dynamicIBCalculation())
               continue;

         // Loop all stats except for torpor
         for (let statIndex = HEALTH; statIndex <= SPEED && this.success; statIndex++) {
            this.rangeVars.Lw = 0;
            this.rangeVars.Ld = 0;

            // Covers unused stats like oxygen
            if (!this.uniqueStatSituation(statIndex)) {
               // Calculate the highest Lw could be
               this.rangeVars.Ld = 0;
               let rangeLw = calcLw(this.values[statIndex], 0, this.rangeVars.TE[statIndex], this.rangeVars.IB, this.m[statIndex]);
               rangeLw = IA(0, rangeLw.hi);

               if (IA.isEmpty(rangeLw))
                  rangeLw = IA(0, this.wildFreeMax - this.minWild);

               rangeLw = IA.intersection(rangeLw, IA(0, this.wildFreeMax - this.minWild));

               // We don't need to calculate TE to extract the levels
               if (!this.input.tamed || IA.leq(this.m[statIndex].Tm, IA.ZERO)) {
                  // Loop all possible Lws
                  for (this.rangeVars.Lw of intFromRangeReverse(rangeLw)) {
                     // Calculate the highest Ld could be
                     let rangeLd = calcLd(this.values[statIndex], this.rangeVars.Lw, this.rangeVars.TE[statIndex], this.rangeVars.IB, this.m[statIndex]);
                     rangeLd = IA(0, rangeLd.hi);
                     rangeLd = IA.intersection(rangeLd, IA(0, this.domFreeMax - this.minDom));
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
                     let rangeLd = calcLd(this.values[statIndex], this.rangeVars.Lw, this.rangeVars.TE[statIndex], this.rangeVars.IB, this.m[statIndex]);
                     rangeLd = IA(0, rangeLd.hi);
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
      const localStatFood = this.m[FOOD];
      const localStatTorpor = this.m[TORPOR];

      // Get stat levels from torpor
      localRangeVars.Lw = this.stats[TORPOR][0].Lw;
      localRangeVars.Ld = this.stats[TORPOR][0].Ld;

      // Extract the IB from Torpor
      let tempIBRange = calcIB(this.values[TORPOR], localRangeVars.Lw, localRangeVars.Ld, localRangeVars.TE[TORPOR], localStatTorpor);
      if (!IA.intervalsOverlap(tempIBRange, this.input.IB))
         return false;

      tempIBRange = localRangeVars.IB = IA.intersection(tempIBRange, this.input.IB);

      // Check the food stat for the IB as well (Only works if food is un-levelled)
      localRangeVars.Lw = 0;
      localRangeVars.Ld = 0;
      localRangeVars.Lw = Math.round(intervalAverage(calcV(0, 0, localRangeVars.TE[FOOD], localRangeVars.IB, localStatFood)));
      tempIBRange = calcIB(this.values[FOOD], localRangeVars.Lw, localRangeVars.Ld, localRangeVars.TE[FOOD], localStatFood);

      // Check to see if the new IB still allows torpor to extract correctly
      const newExpectedValue = calcV(localRangeVars.Lw, 0, localRangeVars.TE[FOOD], localRangeVars.IB, localStatFood);
      if (IA.intervalsOverlap(newExpectedValue, this.input.values[TORPOR])) {
         localRangeVars.IB = tempIBRange;
      }

      // IB can't be lower than 0
      if (localRangeVars.IB.lo < 0) {
         localRangeVars.IB = IA.intersection(localRangeVars.IB, IA(0, Infinity));
      }
      return true;
   }

   uniqueStatSituation(statIndex: number): boolean {
      const localStats = this.m[statIndex];
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
         tempStat2.Ld = Math.round(intervalAverage(
            calcLd(this.values[statIndex], this.rangeVars.Lw, this.rangeVars.TE[statIndex], this.rangeVars.IB, localStats)));
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
      const localStats = this.m[statIndex];
      localVars.Ld = Math.round(intervalAverage(
         calcLd(this.values[statIndex], this.rangeVars.Lw, this.rangeVars.TE[statIndex], this.rangeVars.IB, localStats)));

      if (!IA.hasValue(rangeLd, localVars.Ld))
         return;

      const calculatedValue = calcV(localVars.Lw, localVars.Ld, localVars.TE[statIndex], localVars.IB, localStats);
      if (IA.intervalsOverlap(calculatedValue, this.values[statIndex]))
         this.stats[statIndex].push(new Stat(localVars.Lw, localVars.Ld));

      // If it doesn't calculate properly, it may have used a different IB (Mostly relevant for Food)
      else if (this.input.bred) {
         const rangeIB = calcIB(this.values[statIndex], localVars.Lw, localVars.Ld, localVars.TE[statIndex], localStats);

         if (IA.intervalsOverlap(rangeIB, this.input.IB)) {
            const tempStat2: StatLike = new Stat(this.stats[TORPOR][0]);
            const expectedTorpor = calcV(tempStat2.Lw, tempStat2.Ld, localVars.TE[statIndex], rangeIB, localStats);
            if (IA.intervalsOverlap(expectedTorpor, this.values[TORPOR])) {
               localVars.IB = IA.intersection(rangeIB, localVars.IB);
               this.stats[statIndex].push(new Stat(localVars.Lw, localVars.Ld));
            }
         }
      }
   }

   findTEStats(statIndex: number, rangeLd: Interval, map: Map<Stat, TEProps>) {
      const localStats = this.m[statIndex];
      const localVars = this.rangeVars;

      for (localVars.Ld of intFromRange(rangeLd)) {
         // FIXME: shouldn't be modifying the TE
         let tempTE = calcTE(this.values[statIndex], localVars.Lw, localVars.Ld, localVars.IB, localStats);

         // If the range is greater than 1
         if (IA.gt(tempTE, IA.ONE))
            continue;

         // If the range is less than 0, it will only continue to get smaller
         if (IA.lt(tempTE, IA.ZERO))
            break;

         tempTE = IA.intersection(tempTE, IA(0, 1));

         const rangeWL = calcWL(localVars.tamedLevel, tempTE);

         for (const i of intFromRange(rangeWL, Math.ceil)) {
            localVars.wildLevel = IA(i);
            let tempTERange = calcTEFromWL(localVars.tamedLevel, localVars.wildLevel);
            tempTERange = IA.intersection(tempTE, tempTERange);

            // Valid range
            if (!IA.isEmpty(tempTERange) && !IA.isWhole(tempTERange)) {
               const TEStat = new TEProps();
               TEStat.wildLevel = i;
               // Get the average of the TE range
               TEStat.TE = tempTERange;

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
         const rangeForLd = calcLd(this.values[statIndex], this.rangeVars.Lw, statTE.TE, this.rangeVars.IB, this.m[statIndex]);

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
