import { StatSpeciesMultipliers } from '@/ark/multipliers';
import * as IA from 'interval-arithmetic';
import { intervalAverage } from '@/ark/extractor';


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

      const multLw =
         IA.mul(
            IA.mul(
               IA.add(IA.ONE, IA.mul(IA(this.Lw), IA(m.Iw))),
               IA(m.B)),
            IA(TBHM));

      const multLd = IA.add(IA.ONE, IA.mul(IA(this.Ld), IA(m.Id)));
      const multTE =
         IA.add(
            IA(1),
            !tamed ? IA.ZERO : IA.mul(
               IA.lt(IA(m.Tm), IA.ZERO) ? IA.ONE : IA(TE),
               IA(m.Tm)
            )
         );

      return intervalAverage(IA.mul(
         IA.mul(
            IA.add(
               IA.mul(
                  multLw,
                  IA.add(IA.ONE, IA.mul(IA(IB), IA(m.IBM)))
               ),
               tamed ? IA(m.Ta) : IA.ZERO),
            multTE),
         multLd));
   }

   isEqual(stat: Stat) {
      return this.Lw === stat.Lw && this.Ld === stat.Ld;
   }
}
