import { StatMultipliers } from '@/ark/multipliers';


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

   calculateValue(m: StatMultipliers, tamed = false, TE = 0, IB = 0) {
      // V = (B * (1 + Lw * Iw * IwM) * TBHM * (1 + IB * 0.2 * IBM) + Ta * TaM) * (1 + TE * Tm * TmM) * (1 + Ld * Id * IdM)
      const TBHM = (tamed && m.TBHM) || 1;
      let v = m.B * TBHM;

      if (this.Lw > 0)
         v *= (1 + this.Lw * m.Iw * m.IwM);

      v *= (1 + IB * 0.2 * m.IBM);
      v += this.calculateTa(tamed, m.Ta, m.TaM);
      v *= (1 + this.calculateTm(tamed, m.Tm, m.TmM, TE));
      v *= (1 + this.Ld * m.Id * m.IdM);
      return v;
   }

   calculateWildLevel(m: StatMultipliers, v: number, tamed = false, TE = 0, IB = 0) {
      // Lw = ((V / ((1 + Ld * Id * IdM) * (1 + TE * Tm * TmM)) - Ta * TaM) / (B * TBHM * (1 + IB * 0.2 * IBM)) - 1) / (Iw * IwM)
      const TBHM = (tamed && m.TBHM) || 1;

      // Prevents division by 0
      if (m.Iw === 0)
         return this.Lw = 0;

      let wildLevel = (1 + this.Ld * m.Id * m.IdM);
      wildLevel *= (1 + this.calculateTm(tamed, m.Tm, m.TmM, TE));
      wildLevel = v / wildLevel;

      if (tamed)
         wildLevel -= this.calculateTa(tamed, m.Ta, m.TaM);

      wildLevel /= (m.B * TBHM);
      wildLevel /= (1 + IB * 0.2 * m.IBM);
      this.Lw = Math.max(Math.round((wildLevel - 1) / (m.Iw * m.IwM)), 0);
      return this.Lw;
   }

   calculateDomLevel(m: StatMultipliers, v: number, tamed = false, TE = 0, IB = 0) {
      //  Ld = ((V / (B * (1 + Lw * Iw * IwM) * TBHM * (1 + IB * 0.2 * IBM) + Ta * TaM) / (1 + TE * Tm * TmM)) - 1) / (Id * IdM)

      // Prevents division by 0
      if (m.Id === 0 || !tamed)
         return this.Ld = 0;

      const TBHM = m.TBHM ? m.TBHM : 1;
      let domLevel = m.B * TBHM;
      domLevel *= (1 + this.Lw * m.Iw * m.IwM);
      domLevel *= (1 + IB * 0.2 * m.IBM);
      domLevel = v / (domLevel + this.calculateTa(tamed, m.Ta, m.TaM));
      domLevel /= (1 + this.calculateTm(tamed, m.Tm, m.TmM, TE));
      this.Ld = Math.max(Math.round((domLevel - 1) / (m.Id * m.IdM)), 0);
      return this.Ld;
   }

   calculateTE(m: StatMultipliers, v: number, tamed = true, IB = 0) {
      // TE = (V / (B * (1 + Lw * Iw * IwM) * TBHM * (1 + IB * 0.2 * IBM) + Ta * TaM) / (1 + Ld * Id * IdM) - 1) / (Tm * TmM)

      if (!tamed)
         return -1;

      const TBHM = m.TBHM ? m.TBHM : 1;
      let TE = m.B * TBHM;
      TE *= (1 + this.Lw * m.Iw * m.IwM);
      TE *= (1 + IB * 0.2 * m.IBM);
      TE = v / (TE + this.calculateTa(tamed, m.Ta, m.TaM));
      TE /= (1 + this.Ld * m.Id * m.IdM);
      return ((TE - 1) / this.calculateTm(tamed, m.Tm, m.TmM));
   }

   calculateIB(m: StatMultipliers, v: number, tamed = true, TE = 1) {
      // IB = ((V / (1 + TE * Tm * TmM) / (1 + Ld * Id * IdM) - Ta * TaM) / (B * (1 + Lw * Iw * IwM) * TBHM) - 1)  / (0.2 * IBM)

      if (!tamed)
         return 0;

      const TBHM = m.TBHM ? m.TBHM : 1;
      let IB = v;
      IB /= (1 + this.calculateTm(tamed, m.Tm, m.TmM, TE));
      IB /= (1 + this.Ld * m.Id * m.IdM);
      IB = (IB - this.calculateTa(tamed, m.Ta, m.TaM)) / (m.B * TBHM);
      IB /= (1 + this.Lw * m.Iw * m.IwM);
      return ((IB - 1) / (0.2 * m.IBM));
   }

   calculateTm(tamed: boolean, Tm: number, TmM: number, TE = 1) {
      // If not tamed, the Tame Multiplier doesn't apply to the value
      if (!tamed)
         return 0;

      // If Tm is a negative value, TE doesn't change the value of the multiplier
      if (Tm < 0)
         return (Tm);
      else
         return (TE * Tm * TmM);
   }

   calculateTa(tamed: boolean, Ta: number, TaM: number) {
      // If not tamed, the Tame Additive doesn't apply to the value
      if (!tamed)
         return 0;

      // If Ta is a negative value, TaM doesn't change the value of the multiplier
      if (Ta < 0)
         return Ta;
      else
         return (Ta * TaM);
   }

   isEqual(stat: Stat) {
      return this.Lw === stat.Lw && this.Ld === stat.Ld;
   }
}
