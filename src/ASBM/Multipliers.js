"use strict";

var ASBM = ASBM || {};


// TODO Better layout of the constructors for the entire file to handle Copies and Empty
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
         
         this.B = stat[STAT_B]; // Base Value
         this.Id = stat[STAT_ID]; // Increase/Dom Level as %
         this.Iw = stat[STAT_IW]; // Increase/Wild Level as %
         this.TBHM = 1; // Tame multiply as %
         this.Ta = stat[STAT_TA]; // Tame add
         this.Tm = stat[STAT_TM]; // Tame multiply as %
      }
   }
}

ASBM.StatMultipliers = class {
   constructor(stats, TBHM = 1, oxygenNotUsed = false, speedImprintIgnored = false) {
      for (var i = 0; i < 8; i ++)
         this[i] = new ASBM.StatMultiplier(stats ? stats[i] : null);
      
      this[HEALTH].TBHM = TBHM;

      if (oxygenNotUsed) {
         this[OXYGEN].notUsed = oxygenNotUsed;
         this[OXYGEN].Iw = 0;
      }      
      // These values are not imprint increased
      this[STAMINA].IBM = 0;
      this[OXYGEN].IBM = 0;
      if (speedImprintIgnored)
         this[SPEED].IBM = 0;
   }
}

ASBM.ServerMultiplier = class {
   constructor(settingArray, settingObj, IBM) {
      this.IBM = IBM; // Imprint Bonus Multiplier
      
      if (!settingObj || (settingArray[SERVER_TAM] != settingObj.TaM && settingArray[0]))
         this.TaM = settingArray[SERVER_TAM]; // Tame-Add Multiplier
      if (!settingObj || (settingArray[SERVER_TMM] != settingObj.TmM && settingArray[1]))
         this.TmM = settingArray[SERVER_TMM]; // Tame-Aff Multiplier
      if (!settingObj || (settingArray[SERVER_IDM] != settingObj.IdM && settingArray[2]))
         this.IdM = settingArray[SERVER_IDM]; // Increase Dom Multiplier
      if (!settingObj || (settingArray[SERVER_IWM] != settingObj.IwM && settingArray[3]))
         this.IwM = settingArray[SERVER_IWM]; // Increase Wild Multiplier
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