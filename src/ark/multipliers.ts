import { MultipliersArray } from '@/ark/types';
import * as consts from '@/consts';


export class StatMultiplier {
   B: number;
   Id: number;
   Iw: number;
   Ta: number;
   Tm: number;

   TBHM?: number;
   IBM?: number;

   notUsed: boolean = false;
   noImprint: boolean = false;

   constructor(stat: StatMultiplier | number[] = [0, 0, 0, 0, 0]) {
      // Copy Constructor
      if (stat instanceof StatMultiplier) {
         this.B = stat.B;
         this.Id = stat.Id;
         this.Iw = stat.Iw;
         this.TBHM = stat.TBHM;
         this.Ta = stat.Ta;
         this.Tm = stat.Tm;

         if (stat.IBM) this.IBM = stat.IBM;
         if (stat.notUsed) this.notUsed = stat.notUsed;
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

export class CreatureStats {
   /**
    * Creates an array of Creature StatMultipliers
    * @param {array} stats An array of the stat multipliers
    */
   constructor(stats: StatMultiplier[], TBHM = 1, oxygenNotUsed = false, speedImprintIgnored = false) {
      for (let i = 0; i < 8; i++)
         this[i] = new StatMultiplier(stats ? stats[i] : null);

      this[consts.HEALTH].TBHM = TBHM;

      if (oxygenNotUsed) {
         this[consts.OXYGEN].notUsed = oxygenNotUsed;
         this[consts.OXYGEN].Iw = 0;
      }

      // These values are not imprint increased
      this[consts.STAMINA].noImprint = true;
      this[consts.OXYGEN].noImprint = true;
      if (speedImprintIgnored) this[consts.SPEED].noImprint = true;
   }

   [index: number]: StatMultiplier;
}

export class ServerMultiplier {
   IBM: number;

   constructor(settingArray: ServerMultiplier | number[] = [], IBM: number) {
      this.IBM = IBM; // Imprint Bonus Multiplier

      for (let i = 0; i < 4; i++)
         this[i] = settingArray[i]; // will use undefined if not set, which is fine
   }

   get TaM() { return this[consts.SERVER_TAM]; }
   set TaM(value: number) { this[consts.SERVER_TAM] = value; }

   get TmM() { return this[consts.SERVER_TMM]; }
   set TmM(value: number) { this[consts.SERVER_TMM] = value; }

   get IdM() { return this[consts.SERVER_IDM]; }
   set IdM(value: number) { this[consts.SERVER_IDM] = value; }

   get IwM() { return this[consts.SERVER_IWM]; }
   set IwM(value: number) { this[consts.SERVER_IWM] = value; }

   // This defines our types when accessed with a numeric index like an array
   [index: number]: number;
}

// This is a fix for TypeScript's transpiler marking properties as enumerable.
// Not required if Babel is used, but not harmful to leave in.
Object.defineProperty(ServerMultiplier.prototype, 'TaM', { enumerable: false });
Object.defineProperty(ServerMultiplier.prototype, 'TmM', { enumerable: false });
Object.defineProperty(ServerMultiplier.prototype, 'IdM', { enumerable: false });
Object.defineProperty(ServerMultiplier.prototype, 'IwM', { enumerable: false });

export class Server {
   singlePlayer: boolean = false;
   IBM: number = 1;
   serverName: string;
   isTestOnly: boolean = false;
   isPreDefined: boolean = false;

   /** Create a server or copy an existing one */
   constructor(settingsArray: MultipliersArray | Server = [], IBM = 1, singlePlayer = false, name = '') {
      this.singlePlayer = singlePlayer; // singlePlayer Setting
      this.IBM = IBM;
      this.serverName = name;
      this.isTestOnly = false;
      this.isPreDefined = false;

      for (let i = 0; i < 8; i++) {
         this[i] = new ServerMultiplier(settingsArray[i] || new Array(4), IBM);
      }
   }

   // This defines our types when accessed with a numeric index like an array
   [index: number]: ServerMultiplier;
}
