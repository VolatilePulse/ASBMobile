import { CreatureDataSource } from '@/ark';
import { StatMultipliers } from '@/ark/multipliers';
import { intervalAverage } from '@/number_utils';
import * as IA from 'interval-arithmetic';


/** Server multiplier overrides */
export type MultipliersArray = Array<Array<number | null | undefined> | undefined>;

/** Test definition */
export interface TestData {
   tag: string;
   species: string;
   level: number;
   imprint: number;
   mode: 'Wild' | 'Tamed' | 'Bred';
   source?: CreatureDataSource;
   values: number[];
   serverId: string;
   results: StatLike[][];
}


/** Simple representation of a stat's levels */
export interface StatLike {
   Lw: number;
   Ld: number;
}

/** A stat's current state inside the extractor */
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

   /** Calculate the actual stat value given the supplied parameters */
   calculateValue(m: StatMultipliers, tamed = false, TE = 0, IB = 0) {
      // V = (B * (1 + Lw * Iw * IwM) * TBHM * (1 + IB * 0.2 * IBM) + Ta * TaM) * (1 + TE * Tm * TmM) * (1 + Ld * Id * IdM)

      const TBHM = (tamed && m.TBHM) || IA.ONE;

      const multLw =
         IA.mul(
            IA.mul(
               IA.add(IA.ONE, IA.mul(IA(this.Lw), m.Iw)),
               m.B),
            TBHM);

      const multLd = IA.add(IA.ONE, IA.mul(IA(this.Ld), m.Id));
      const multTE =
         IA.add(
            IA.ONE,
            !tamed ? IA.ZERO : IA.mul(
               IA.lt(m.Tm, IA.ZERO) ? IA.ONE : IA(TE),
               m.Tm
            )
         );

      return intervalAverage(IA.mul(
         IA.mul(
            IA.add(
               IA.mul(
                  multLw,
                  IA.add(IA.ONE, IA.mul(IA(IB), m.IBM))
               ),
               tamed ? m.Ta : IA.ZERO),
            multTE),
         multLd));
   }

   isEqual(stat: Stat) {
      return this.Lw === stat.Lw && this.Ld === stat.Ld;
   }
}
