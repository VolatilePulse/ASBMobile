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
      this[consts.STAMINA].noImprint = true;
      this[consts.OXYGEN].noImprint = true;
      if (speedImprintIgnored)
         this[consts.SPEED].noImprint = true;
      else
         this[consts.SPEED].noImprint = false;
   }
}

export class ServerMultiplier {
   constructor(settingArray = [], IBM) {
      this.IBM = IBM; // Imprint Bonus Multiplier

      for (var i = 0; i < 4; i++)
         this[i] = settingArray[i]; // will use undefined if not set, which is fine
   }
}

// SERVER_TAM = 0, SERVER_TMM = 1, SERVER_IDM = 2, SERVER_IWM = 3;
Utils.AddNamedIndicesToClass(ServerMultiplier, ['TaM', 'TmM', 'IdM', 'IwM']);

export class Server {
   constructor(settingsArray = [], IBM = 1, singlePlayer = false) {
      this.singlePlayer = singlePlayer; // singlePlayer Setting
      this.IBM = IBM;

      for (var i = 0; i < 8; i++)
         this[i] = new ServerMultiplier(settingsArray[i] || new Array(4), IBM);
   }
}
