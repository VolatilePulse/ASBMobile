import * as Utils from '../utils';
import * as Ark from '../ark';

export class Stat {
   /**
    * @param {number|{Lw:number,Ld:number}} Lw Wild levels, or another Stat-like object
    * @param {number?} Ld Domesticated levels
    */
   constructor(Lw = 0, Ld = 0) {
      /** @type {number?} */
      this.TE = undefined;
      /** @type {number?} */
      this.maxTE = undefined;
      /** @type {number?} */
      this.minTE = undefined;
      /** @type {number?} */
      this.wildLevel = undefined;

      if (typeof (Lw) == "object") {
         this.Lw = Lw.Lw;
         this.Ld = Lw.Ld;
      }
      else {
         this.Lw = Lw;
         this.Ld = Ld;
      }
   }

   calculateValue(m, tamed = false, TE = 0, IB = 0) {
      // V = (B * (1 + Lw * Iw * IwM) * TBHM * (1 + IB * 0.2 * IBM) + Ta * TaM) * (1 + TE * Tm * TmM) * (1 + Ld * Id * IdM)
      let TBHM = (tamed) ? m.TBHM ? m.TBHM : 1 : 1;
      let v = m.B * TBHM;

      if (this.Lw > 0)
         v *= (1 + this.Lw * m.Iw * m.IwM);

      v *= (1 + IB * 0.2 * m.IBM);
      v += this.calculateTa(tamed, m.Ta, m.TaM);
      v *= (1 + this.calculateTm(tamed, m.Tm, m.TmM, TE));
      v *= (1 + this.Ld * m.Id * m.IdM);
      return v;
   }

   calculateWildLevel(m, v, tamed = false, TE = 0, IB = 0) {
      // Lw = ((V / ((1 + Ld * Id * IdM) * (1 + TE * Tm * TmM)) - Ta * TaM) / (B * TBHM * (1 + IB * 0.2 * IBM)) - 1) / (Iw * IwM)
      let TBHM = (tamed) ? m.TBHM ? m.TBHM : 1 : 1;

      // Prevents division by 0
      if (m.Iw == 0)
         return this.Lw = 0;

      let wildLevel = (1 + this.Ld * m.Id * m.IdM);
      wildLevel *= (1 + this.calculateTm(tamed, m.Tm, m.TmM, TE));
      wildLevel = v / wildLevel;

      if (tamed)
         wildLevel -= this.calculateTa(tamed, m.Ta, m.TaM);

      wildLevel /= (m.B * TBHM);
      wildLevel /= (1 + IB * 0.2 * m.IBM);
      this.Lw = Math.max(Utils.RoundTo((wildLevel - 1) / (m.Iw * m.IwM), 0), 0);
      return this.Lw;
   }

   calculateDomLevel(m, v, tamed = false, TE = 0, IB = 0) {
      //  Ld = ((V / (B * (1 + Lw * Iw * IwM) * TBHM * (1 + IB * 0.2 * IBM) + Ta * TaM) / (1 + TE * Tm * TmM)) - 1) / (Id * IdM)

      // Prevents division by 0
      if (m.Id == 0 || !tamed)
         return this.Ld = 0;

      let TBHM = m.TBHM ? m.TBHM : 1;
      let domLevel = m.B * TBHM;
      domLevel *= (1 + this.Lw * m.Iw * m.IwM);
      domLevel *= (1 + IB * 0.2 * m.IBM);
      domLevel = v / (domLevel + this.calculateTa(tamed, m.Ta, m.TaM));
      domLevel /= (1 + this.calculateTm(tamed, m.Tm, m.TmM, TE));
      this.Ld = Math.max(Utils.RoundTo((domLevel - 1) / (m.Id * m.IdM), 0), 0);
      return this.Ld;
   }

   calculateTE(m, v, tamed = true, IB = 0) {
      // TE = (V / (B * (1 + Lw * Iw * IwM) * TBHM * (1 + IB * 0.2 * IBM) + Ta * TaM) / (1 + Ld * Id * IdM) - 1) / (Tm * TmM)

      if (!tamed)
         return -1;

      let TBHM = m.TBHM ? m.TBHM : 1;
      let TE = m.B * TBHM;
      TE *= (1 + this.Lw * m.Iw * m.IwM);
      TE *= (1 + IB * 0.2 * m.IBM);
      TE = v / (TE + this.calculateTa(tamed, m.Ta, m.TaM));
      TE /= (1 + this.Ld * m.Id * m.IdM);
      return ((TE - 1) / this.calculateTm(tamed, m.Tm, m.TmM));
   }

   calculateIB(m, v, tamed = true, TE = 1) {
      // IB = ((V / (1 + TE * Tm * TmM) / (1 + Ld * Id * IdM) - Ta * TaM) / (B * (1 + Lw * Iw * IwM) * TBHM) - 1)  / (0.2 * IBM)

      if (!tamed)
         return 0;

      let TBHM = m.TBHM ? m.TBHM : 1;
      var IB = v;
      IB /= (1 + this.calculateTm(tamed, m.Tm, m.TmM, TE));
      IB /= (1 + this.Ld * m.Id * m.IdM);
      IB = (IB - this.calculateTa(tamed, m.Ta, m.TaM)) / (m.B * TBHM);
      IB /= (1 + this.Lw * m.Iw * m.IwM);
      return ((IB - 1) / (0.2 * m.IBM));
   }

   calculateTm(tamed, Tm, TmM, TE = 1) {
      // If not tamed, the Tame Multiplier doesn't apply to the value
      if (!tamed)
         return 1;

      // If Tm is a negative value, TE doesn't change the value of the multiplier
      if (Tm < 0)
         return (Tm);
      else
         return (TE * Tm * TmM);
   }

   calculateTa(tamed, Ta, TaM) {
      // If not tamed, the Tame Additive doesn't apply to the value
      if (!tamed)
         return 1;

      // If Ta is a negative value, TaM doesn't change the value of the multiplier
      if (Ta < 0)
         return Ta;
      else
         return (Ta * TaM);
   }
}

export class Creature {
   /**
    * Copy constructor
    * @param {Creature?} c
    */
   constructor(c = undefined) {
      /** @type {string} */
      this.name = c ? c.name : "";
      /** @type {string} */
      this.tribe = c ? c.tribe : "";
      /** @type {string} */
      this.owner = c ? c.owner : "";
      /** @type {string} */
      this.serverName = c ? c.serverName : "";
      /** @type {string} */
      this.species = c ? c.species : "";
      /** @type {string} */
      this.UUID = c ? c.UUID : "";
      this.wild = true;
      this.tamed = false;
      this.bred = false;
      /** @type {number} */
      this.TE = c ? c.TE : 0;
      /** @type {number} */
      this.IB = c ? c.IB : 0;
      /** @type {number} */
      this.level = c ? c.level : 0;
      /** @type {Stat[][]} */
      this.stats = [[], [], [], [], [], [], [], []];
      /** @type {number[]} */
      this.values = [];

      // Strips extractor data from TE based stats
      for (let i = 0; i < 8; i++)
         // The frontmost stat is the one that is considered "chosen" and is to be used for the creature
         this.stats.push([c ? c.stats[i][0] : new Stat]);
   }
}

export class VueCreature extends Creature {
   constructor() {
      // Initializes the Creature Constructor and gives this class those properties
      super();

      /** @type {Stat[][]} */
      this.stats = [[], [], [], [], [], [], [], []];
      this.exactly = false;

      for (let i = 0; i < 8; i++)
         this.stats[i][0] = new Stat;
   }

   copyCreature(c) {
      Utils.DeepMerge(this, c);

      for (let i = 0; i < 8; i++) {
         this.stats[i] = [c.stats[i]];
         this.values[i] = this.stats[i][0].calculateValue(Ark.GetMultipliers(this.serverName, this.species), !this.wild, this.TE, this.IB);
      }
   }

   clear() {
      Utils.DeepMerge(this, new VueCreature);
   }
}
