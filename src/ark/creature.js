"use strict";

import * as Utils from '../utils';
import * as Ark from '../ark';

export class Stat {
   /**
    * @param {number|{Lw:number,Ld:number}} Lw Wild levels
    * @param {number?} Ld Domesticated levels
    */
   constructor(Lw = 0, Ld = 0) {
      if (Utils.IsObject(Lw)) {
         // @ts-ignore
         this.Lw = Lw.Lw;
         // @ts-ignore
         this.Ld = Lw.Ld;
      }
      else {
         this.Lw = Lw;
         this.Ld = Ld;
      }
   }

   calculateValue(m, tamed = false, TE = 0, IB = 0) {
      // V = (B * (1 + Lw * Iw * IwM) * TBHM * (1 + IB * 0.2 * IBM) + Ta * TaM) * (1 + TE * Tm * TmM) * (1 + Ld * Id * IdM)

      var v = m.B * m.TBHM;

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

      // Prevents division by 0
      if (m.Iw == 0)
         return this.Lw = 0;

      var wildLevel = (1 + this.Ld * m.Id * m.IdM);
      wildLevel *= (1 + this.calculateTm(tamed, m.Tm, m.TmM, TE));
      wildLevel = v / wildLevel;

      if (tamed)
         wildLevel -= this.calculateTa(tamed, m.Ta, m.TaM);

      wildLevel /= (m.B * m.TBHM);
      wildLevel /= (1 + IB * 0.2 * m.IBM);
      this.Lw = Math.max(Utils.RoundTo((wildLevel - 1) / (m.Iw * m.IwM), 0), 0);
      return this.Lw;
   }

   calculateDomLevel(m, v, tamed = false, TE = 0, IB = 0) {
      //  Ld = ((V / (B * (1 + Lw * Iw * IwM) * TBHM * (1 + IB * 0.2 * IBM) + Ta * TaM) / (1 + TE * Tm * TmM)) - 1) / (Id * IdM)

      // Prevents division by 0
      if (m.Id == 0 || !tamed)
         return this.Ld = 0;

      var domLevel = m.B * m.TBHM;
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

      var TE = m.B * m.TBHM;
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

      var IB = v;
      IB /= (1 + this.calculateTm(tamed, m.Tm, m.TmM, TE));
      IB /= (1 + this.Ld * m.Id * m.IdM);
      IB = (IB - this.calculateTa(tamed, m.Ta, m.TaM)) / (m.B * m.TBHM);
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
   constructor(c) {
      this.name = c ? c.name : "";
      this.tribe = c ? c.tribe : "";
      this.owner = c ? c.owner : "";
      this.serverName = c ? c.serverName : "";
      this.species = c ? c.species : "";
      this.UUID = c ? c.UUID : "";
      this.wild = true;
      this.tamed = false;
      this.bred = false;
      this.TE = c ? c.TE : 0;
      this.IB = c ? c.IB : 0;
      this.level = c ? c.level : 0;
      this.stats = [];
      this.values = [];

      // Strips extractor data from TE based stats
      for (let i = 0; i < 8; i++)
         // The frontmost stat is the one that is considered "chosen" and is to be used for the creature
         this.stats.push(c ? c.stats[i][0] : new Stat);
   }
}

export class VueCreature extends Creature {
   constructor() {
      // Initializes the Creature Constructor and gives this class those properties
      super();
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
