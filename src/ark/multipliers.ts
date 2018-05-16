import * as consts from '@/consts';
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
      this.B = Number.isInteger(mult.B) ? IA(mult.B) : IA().boundedSingleton(mult.B);
      this.Id = Number.isInteger(mult.Id) ? IA(mult.Id) : IA().boundedSingleton(mult.Id);
      this.Iw = Number.isInteger(mult.Iw) ? IA(mult.Iw) : IA().boundedSingleton(mult.Iw);
      this.Ta = Number.isInteger(mult.Ta) ? IA(mult.Ta) : IA().boundedSingleton(mult.Ta);
      this.Tm = Number.isInteger(mult.Tm) ? IA(mult.Tm) : IA().boundedSingleton(mult.Tm);

      this.TBHM = !mult.TBHM ? IA.ONE : Number.isInteger(mult.TBHM) ? IA(mult.TBHM) : IA().boundedSingleton(mult.TBHM);

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
