"use strict";

import * as Utils from '../utils';
import * as consts from '../consts';

export class StatMultiplier {
   B: number;
   Id: number;
   Iw: number;
   Ta: number;
   Tm: number;

   TBHM?: number;
   IBM?: number;

   TaM?: number;
   TmM?: number;
   IdM?: number;
   IwM?: number;

   notUsed: boolean = false;

   constructor(stat: StatMultiplier);
   constructor(stat: number[]);
   constructor(stat: StatMultiplier | number[] = [0, 0, 0, 0, 0]) {
      // Copy Constructor
      if (stat instanceof StatMultiplier) {
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
         this.B = stat[consts.STAT_B]; // Base Value
         this.Id = stat[consts.STAT_ID]; // Increase/Dom Level as %
         this.Iw = stat[consts.STAT_IW]; // Increase/Wild Level as %
         this.Ta = stat[consts.STAT_TA]; // Tame add
         this.Tm = stat[consts.STAT_TM]; // Tame multiply as %
      }
   }
}

// FIXME: TS-MIGRATION: No strong typing here at all
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
   IBM: number;

   constructor(settingArray: ServerMultiplier | number[] = [], IBM: number) {
      this.IBM = IBM; // Imprint Bonus Multiplier

      for (var i = 0; i < 4; i++)
         this[i] = settingArray[i]; // will use undefined if not set, which is fine
   }

   get TaM() { return this[consts.SERVER_TAM] };
   get TmM() { return this[consts.SERVER_TMM] };
   get IdM() { return this[consts.SERVER_IDM] };
   get IwM() { return this[consts.SERVER_IWM] };

   set TaM(value: number) { this[consts.SERVER_TAM] = value; };
   set TmM(value: number) { this[consts.SERVER_TMM] = value; };
   set IdM(value: number) { this[consts.SERVER_IDM] = value; };
   set IwM(value: number) { this[consts.SERVER_IWM] = value; };

   // This defines our types when accessed with a numeric index like an array
   [index: number]: number;
}

export class Server {
   singlePlayer: boolean = false;
   IBM: number = 1;
   serverName: string;
   isTestOnly: boolean = false;
   isPreDefined: boolean = false;

   /** * Create a server or copy an existing one */
   constructor(settingsArray: MultipliersArray | Server = [], IBM = 1, singlePlayer = false, name = "") {
      this.singlePlayer = singlePlayer; // singlePlayer Setting
      this.IBM = IBM;
      this.serverName = name;
      this.isTestOnly = false;
      this.isPreDefined = false;

      for (var i = 0; i < 8; i++)
         this[i] = new ServerMultiplier(settingsArray[i] || new Array(4), IBM);
   }

   // This defines our types when accessed with a numeric index like an array
   [index: number]: ServerMultiplier;
}
