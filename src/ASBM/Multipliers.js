"use strict";

var ASBM = ASBM || {};

ASBM.StatMultiplier = class {
   constructor(stat) {
      // Copy Constructor
      if (Utils.IsObject(stat)) {
         this.B = stat.B;
         this.Id = stat.Id;
         this.Iw = stat.Iw;
         this.TBHM = stat.TBHM;
         this.Ta = stat.Ta;
         this.Tm = stat.Tm;
         
         if (stat.IBM)
            this.IBM = stat.IBM;
         if (stat.notUsed)
            this.notUsed = stat.notUsed;
      }
      else {
         if (!stat)
            stat = [0,0,0,0,0];
         
         this.B = stat[0]; // Base Value
         this.Id = stat[2]; // Increase/Dom Level as %
         this.Iw = stat[1]; // Increase/Wild Level as %
         this.TBHM = 1; // Tame multiply as %
         this.Ta = stat[3]; // Tame add
         this.Tm = stat[4]; // Tame multiply as %
      }
   }
}

ASBM.StatMultipliers = class {
   constructor(stats, TBHM = 1, oxygenNotUsed = false, speedImprintIgnored = false) {
      for (var i = 0; i < 8; i ++)
         this[i] = new ASBM.StatMultiplier(stats ? stats[i] : null);
      
      this[0].TBHM = TBHM;

      if (oxygenNotUsed) {
         this[2].notUsed = oxygenNotUsed;
         this[2].Iw = 0;
      }      
      // These values are not imprint increased
      this[1].IBM = 0;
      this[2].IBM = 0;
      if (speedImprintIgnored)
         this[6].IBM = 0;
   }
}

ASBM.ServerMultiplier = class {
   constructor(settingArray, settingObj, IBM) {
      this.IBM = IBM; // Imprint Bonus Multiplier
      
      if (!settingObj || (settingArray[0] != settingObj.TaM && settingArray[0]))
         this.TaM = settingArray[0]; // Tame-Add Multiplier
      if (!settingObj || (settingArray[1] != settingObj.TmM && settingArray[1]))
         this.TmM = settingArray[1]; // Tame-Aff Multiplier
      if (!settingObj || (settingArray[2] != settingObj.IdM && settingArray[2]))
         this.IdM = settingArray[2]; // Increase Dom Multiplier
      if (!settingObj || (settingArray[3] != settingObj.IwM && settingArray[3]))
         this.IwM = settingArray[3]; // Increase Wild Multiplier
   }
}

// TODO Handle any cases where the user chose to override official, even if it is the same
ASBM.Server = class {
   constructor(settingsArray, settingsObj, singlePlayer = false, IBM = 1) {
      this.singlePlayer = singlePlayer; // singlePlayer Setting
      
      for (var i = 0; i < 8; i ++)
         if (settingsArray[i])
            this[i] = new ASBM.ServerMultiplier(settingsArray[i], (settingsObj ? settingsObj[i] : null), IBM);
   }
}