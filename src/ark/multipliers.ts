import * as consts from '@/consts';
import { floatRange } from '@/number_utils';
import IA from 'interval-arithmetic';


/** A container for pre-processed multipliers for a single stat, combined from server and species values */
export class StatMultipliers {
   B: Interval;
   Id: Interval;
   Iw: Interval;
   Ta: Interval;
   Tm: Interval;

   TBHM?: Interval;
   IBM?: Interval;

   notUsed: boolean = false;

   constructor(mult: StatSpeciesMultipliers) {
      this.B = floatRange(mult.B);
      this.Id = floatRange(mult.Id);
      this.Iw = floatRange(mult.Iw);
      this.Ta = floatRange(mult.Ta);
      this.Tm = floatRange(mult.Tm);

      this.TBHM = !mult.TBHM ? IA.ONE : floatRange(mult.TBHM);

      this.notUsed = mult.notUsed;
   }
}

/** A simple class representing a server's multipliers for a single stat */
export class StatServerMultipliers {
   constructor(public TaM: number, public TmM: number, public IdM: number, public IwM: number) { }
}

/** A simple class representing a species's multipliers for a single stat */
export class StatSpeciesMultipliers {
   B: number;
   Id: number;
   Iw: number;
   Ta: number;
   Tm: number;

   TBHM?: number;
   IBM?: number;

   notUsed: boolean = false;
   noImprint: boolean = false;

   constructor(raw: number[]) {
      this.B = raw[consts.STAT_B]; // Base Value
      this.Id = raw[consts.STAT_ID]; // Increase/Dom Level as %
      this.Iw = raw[consts.STAT_IW]; // Increase/Wild Level as %
      this.Ta = raw[consts.STAT_TA]; // Tame add
      this.Tm = raw[consts.STAT_TM]; // Tame multiply as %
   }
}

/** Groups together the multipliers for each stat for a species */
export class SpeciesParameters {
   blueprint: string;
   /**
    * Creates an array of StatSpeciesParameters from raw server config values.
    */
   constructor(stats: number[][], TBHM = 1, oxygenNotUsed = false, speedImprintIgnored = false, blueprint?: string) {
      this.blueprint = blueprint;

      for (let i = consts.HEALTH; i <= consts.TORPOR; i++)
         this[i] = new StatSpeciesMultipliers(stats[i]);

      this[consts.HEALTH].TBHM = TBHM;

      if (oxygenNotUsed) {
         this[consts.OXYGEN].notUsed = oxygenNotUsed;
         this[consts.OXYGEN].Iw = 0;
      }

      // These values are not imprint increased
      this[consts.STAMINA].noImprint = true;
      this[consts.OXYGEN].noImprint = true;
      if (speedImprintIgnored) this[consts.SPEED].noImprint = true;
   }

   [index: number]: StatSpeciesMultipliers;
}
