"use strict";

import * as Utils from '../utils';
import * as consts from '../consts';

export class StatMultiplier {
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
            stat = [0, 0, 0, 0, 0];

         this.B = stat[consts.STAT_B]; // Base Value
         this.Id = stat[consts.STAT_ID]; // Increase/Dom Level as %
         this.Iw = stat[consts.STAT_IW]; // Increase/Wild Level as %
         this.TBHM = 1; // Tame multiply as %
         this.Ta = stat[consts.STAT_TA]; // Tame add
         this.Tm = stat[consts.STAT_TM]; // Tame multiply as %
      }
   }
}

export class CreatureStats {
   /**
    * Creates an array of Creature StatMultipliers
    * @param {array} stats An array of the statmultipliers
    */
   constructor(stats, TBHM = 1, oxygenNotUsed = false, speedImprintIgnored = false) {
      for (var i = 0; i < 8; i++)
         this[i] = new StatMultiplier(stats ? stats[i] : null);

      this[consts.HEALTH].TBHM = TBHM;

      if (oxygenNotUsed) {
         this[consts.OXYGEN].notUsed = oxygenNotUsed;
         this[consts.OXYGEN].Iw = 0;
      }

      // These values are not imprint increased
      this[consts.STAMINA].IBM = 0;
      this[consts.OXYGEN].IBM = 0;
      if (speedImprintIgnored)
         this[consts.SPEED].IBM = 0;
   }
}

export class ServerMultiplier {
   constructor(settingArray, IBM) {
      this.IBM = IBM; // Imprint Bonus Multiplier

      // Provide easy defaults
      if (!settingArray || settingArray.length == 0)
         settingArray = Utils.FilledArray(4, () => 0);

      this[consts.SERVER_TAM] = this.TaM = settingArray[consts.SERVER_TAM]; // Tame-Add Multiplier
      this[consts.SERVER_TMM] = this.TmM = settingArray[consts.SERVER_TMM]; // Tame-Aff Multiplier
      this[consts.SERVER_IDM] = this.IdM = settingArray[consts.SERVER_IDM]; // Increase Dom Multiplier
      this[consts.SERVER_IWM] = this.IwM = settingArray[consts.SERVER_IWM]; // Increase Wild Multiplier
   }
}

export class Server {
   constructor(settingsArray = [], IBM = 1, singlePlayer = false) {
      this.singlePlayer = singlePlayer; // singlePlayer Setting

      // Provide easy defaults
      if (!settingsArray || settingsArray.length == 0)
         settingsArray = Utils.FilledArray(8, () => Utils.FilledArray(4, () => 0));

      for (var i = 0; i < 8; i++)
         this[i] = new ServerMultiplier(settingsArray[i], IBM);
   }
}
