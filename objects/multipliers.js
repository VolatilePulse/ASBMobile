class statMultiplier {
   constructor(stat) {
      if (!stat)
         stat = [0,0,0,0,0];
      
      this.B = stat[0]; // Base Value
      this.Id = stat[2]; // Increase/Dom Level as %
      this.Iw = stat[1]; // Increase/Wild Level as %
      this.TBHM = 1; // Tame multiply as %
      this.Ta = stat[3]; // Tame add
      this.Tm = stat[4]; // Tame multiply as %
      this.active = true;
      this.precision = 1;
   }
}

class statMultipliers {
   constructor(stats, TBHM = 1, oxygenNotUsed = false, speedImprintIgnored = false) {
      for (var i = 0; i < 8; i ++)
         this[i] = new statMultiplier(stats ? stats[i] : null);
      
      // Melee and speed require a higher precision
      this[5].precision = 3;
      this[6].precision = 3;
      
      this[0].TBHM = TBHM;
      this[2].active = !oxygenNotUsed;
      
      // These values are not imprint increased
      this[1].IBM = 0;
      this[2].IBM = 0;
      if (speedImprintIgnored)
         this[6].IBM = 0;
   }
}

class serverMultiplier {
   constructor(settingArray, settingObj, IBM) {
      this.IBM = IBM; // Imprint Bonus Multiplier
      
      if (!settingObj || (settingArray[0] != settingObj.TaM && settingArray[0]))
         this.TaM = settingArray[0]; // Tame-Add Multiplier
      if (!settingObj || (settingArray[1] != settingObj.TmM && settingArray[1]))
         this.TmM = settingArray[1]; // Tame-Aff Multiplier
      if (!settingObj || (settingArray[3] != settingObj.IdM && settingArray[3]))
         this.IdM = settingArray[2]; // Increase Dom Multiplier
      if (!settingObj || (settingArray[2] != settingObj.IwM && settingArray[2]))
         this.IwM = settingArray[3]; // Increase Wild Multiplier
   }
}

class server {
   constructor(settingsArray, settingsObj, singlePlayer = false, IBM = 1) {
      this.singlePlayer = singlePlayer; // singlePlayer Setting
      
      for (var i = 0; i < 8; i ++)
         if (settingsArray[i])
            this[i] = new serverMultiplier(settingsArray[i], (settingsObj ? settingsObj[i] : null), IBM);
   }
}