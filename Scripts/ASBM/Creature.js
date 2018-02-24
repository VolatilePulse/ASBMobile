"use strict";

var ASBM = ASBM || {};

ASBM.Stat = class {
   constructor(Lw = 0, Ld = 0) {
      // Copy Constructor
      if (Utils.IsObject(Lw)) {
         this.Lw = Lw.Lw;
         this.Ld = Lw.Ld;
      }

      // Constructor from an array/Empty Constructor
      else {
         this.Lw = Lw;
         this.Ld = Ld;
      }
   }
   
   calculateValue(m, tamed = false, TE = 0, IB = 0) {
      // V = (B * (1 + Lw * Iw * IwM) * TBHM * (1 + IB * 0.2 * IBM) + Ta * TaM) * (1 + TE * Tm * TmM) * (1 + Ld * Id * IdM)
      
      var v = m.B * m.TBHM;
      v *= (1 + this.Lw * m.Iw * m.IwM);
      v *= (1 + IB * 0.2 * m.IBM);
      
      if (tamed)
         v += m.Ta * m.TaM;

      v *= this.calculateTmM(tamed, m.Tm, m.TmM, TE);
      v *= (1 + this.Ld * m.Id * m.IdM);
      return v;
   }
   
   calculateWildLevel(m, v, tamed = false, TE = 0, IB = 0) {
      // Lw = ((V / (1 + Ld * Id * IdM) / (1 + TE * Tm * TmM) - Ta * TaM) / (B * TBHM * (1 + IB * 0.2 * IBM)) - 1) / (Iw * IwM)
      
      // Prevents division by 0
      if (m.Iw == 0)
         return this.Lw = 0;
      
      var wildLevel = v;
      wildLevel /= (1 + this.Ld * m.Id * m.IdM);
      wildLevel /= this.calculateTmM(tamed, m.Tm, m.TmM, TE);

      if (tamed)
         wildLevel -= m.Ta * m.TaM
      
      wildLevel /= (m.B * m.TBHM);
      wildLevel /= (1 + IB * 0.2 * m.IBM);
      this.Lw = Math.max(Math.round((wildLevel - 1) / (m.Iw * m.IwM)), 0);
      return this.Lw;
   }
   
   calculateDomLevel(m, v, tamed = false, TE = 0, IB = 0) {
      //  Ld = ((V / (B * (1 + Lw * Iw * IwM) * TBHM * (1 + IB * 0.2 * IBM) + Ta * TaM) / (1 + TE * Tm * TmM)) - 1) / (Id * IdM)
      
      if (!tamed)
         return this.Ld = 0;
      
      var domLevel = m.B * m.TBHM;
      domLevel *= (1 + this.Lw * m.Iw * m.IwM);
      domLevel *= (1 + IB * 0.2 * m.IBM);
      domLevel = v / (domLevel + m.Ta * m.TaM);
      domLevel /= this.calculateTmM(tamed, m.Tm, m.TmM, TE);
      this.Ld = Math.max(Math.round((domLevel - 1) / (m.Id * m.IdM)), 0);
      return this.Ld;
   }
   
   calculateTE(m, v, tamed = true, IB = 0) {
      // TE = (V / (B * (1 + Lw * Iw * IwM) * TBHM * (1 + IB * 0.2 * IBM) + Ta * TaM) / (1 + Ld * Id * IdM) - 1) / (Tm * TmM)
      
      if (!tamed)
         return -1;
      
      var TE = m.B * m.TBHM;
      TE *= (1 + this.Lw * m.Iw * m.IwM);
      TE *= (1 + IB * 0.2 * m.IBM);
      TE = v / (TE + m.Ta * m.TaM);
      TE /= (1 + this.Ld * m.Id * m.IdM);
      return ((TE - 1)/ (m.Tm * m.TmM));
   }
   
   calculateIB(m, v, tamed = true, TE = 1) {
      // IB = ((V / (1 + TE * Tm * TmM) / (1 + Ld * Id * IdM) - Ta * TaM) / (B * (1 + Lw * Iw * IwM) * TBHM) - 1)  / (0.2 * IBM)
      
      if (!tamed)
         return -1;
      
      var IB = v;
      IB /= this.calculateTmM(tamed, m.Tm, m.TmM, TE);
      IB /= (1 + this.Ld * m.Id * m.IdM);
      IB = (IB - m.Ta * m.TaM) / (m.B * m.TBHM);
      IB /= (1 + this.Lw * m.Iw * m.IwM);
      return ((IB - 1) / (0.2 * m.IBM));
   }
   
   calculateTmM(tamed, Tm, TmM, TE = 1) {
      // If not tamed, the Tame Multiplier doesn't apply to the value
      if (!tamed)
         return 1;
      
      // If Tm is a negative value, TE doesn't change the value of the multiplier
      if (Tm < 0)
         return (1 + Tm * TmM);
      else
         return (1 + TE * Tm * TmM);
   }
}

ASBM.Creature = class {
   constructor() {
      name: "";
      tribe: "";
      owner: "";
      server: "";
      species: "";
      UUID: "";
      TE: 0;
      IB: 0;
      level: 0;
      
      for (var i = 0; i < 8; i ++)
         this.stats.push(new ASBM.Stat());
   }
}