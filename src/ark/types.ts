import { StatSpeciesMultipliers } from '@/ark/multipliers';


/** Server multiplier overrides */
export type MultipliersArray = Array<Array<number | null | undefined> | undefined>;

/** Test definition */
export interface TestData {
   tag: string;
   species: string;
   level: number;
   imprint: number;
   mode: 'Wild' | 'Tamed' | 'Bred';
   values: number[];
   serverId: string;
   results: StatLike[][];
}


/** Simple representation of a stat's value */
export interface StatLike {
   Lw: number;
   Ld: number;
}

export class Stat implements StatLike {
   Lw: number;
   Ld: number;

   removeMe?: boolean;

   constructor(stat: Stat);
   constructor(Lw?: number, Ld?: number);
   constructor(Lw: number | Stat = 0, Ld: number = 0) {
      if (Lw instanceof Stat) {
         this.Lw = Lw.Lw;
         this.Ld = Lw.Ld;
      }
      else {
         this.Lw = Lw;
         this.Ld = Ld;
      }
   }

   calculateValue(m: StatSpeciesMultipliers, tamed = false, TE = 0, IB = 0) {
      // V = (B * (1 + Lw * Iw * IwM) * TBHM * (1 + IB * 0.2 * IBM) + Ta * TaM) * (1 + TE * Tm * TmM) * (1 + Ld * Id * IdM)
      const TBHM = (tamed && m.TBHM) || 1;
      let v = m.B * TBHM;

      if (this.Lw > 0)
         v *= (1 + this.Lw * m.Iw);

      v *= (1 + IB * m.IBM);
      v += this.calculateTa(tamed, m.Ta);
      v *= (1 + this.calculateTm(tamed, m.Tm, TE));
      v *= (1 + this.Ld * m.Id);
      return v;
   }

   calculateTm(tamed: boolean, Tm: number, TE = 1) {
      // If not tamed, the Tame Multiplier doesn't apply to the value
      if (!tamed)
         return 0;

      // If Tm is a negative value, TE doesn't change the value of the multiplier
      if (Tm < 0)
         return (Tm);
      else
         return (TE * Tm);
   }

   calculateTa(tamed: boolean, Ta: number) {
      // If not tamed, the Tame Additive doesn't apply to the value
      if (!tamed)
         return 0;

      return Ta;
   }

   isEqual(stat: Stat) {
      return this.Lw === stat.Lw && this.Ld === stat.Ld;
   }
}
