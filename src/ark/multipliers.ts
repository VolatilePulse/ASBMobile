import * as consts from '@/consts';
import * as IA from 'interval-arithmetic';

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
      this.B = IA(mult.B);
      this.Id = IA(mult.Id);
      this.Iw = IA(mult.Iw);
      this.Ta = IA(mult.Ta);
      this.Tm = IA(mult.Tm);

      this.TBHM = IA(mult.TBHM || 1);

      this.notUsed = mult.notUsed;
   }
}

export class StatServerMultipliers {
   constructor(public TaM: number, public TmM: number, public IdM: number, public IwM: number) { }
}

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

export class SpeciesParameters {
   /**
    * Creates an array of StatSpeciesParameters from raw server config values.
    */
   constructor(stats: number[][], TBHM = 1, oxygenNotUsed = false, speedImprintIgnored = false) {
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
