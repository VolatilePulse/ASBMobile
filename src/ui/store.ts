import Vue from 'vue';

import { VueCreature } from '@/ark/creature';
import { Server, CreatureStats } from '@/ark/multipliers';
import { statNames } from '@/consts';
import { Delay } from '@/utils';


class Store {
   statImages: any[] = [];
   speciesNames: string[] = [];
   speciesMultipliers: { [species: string]: CreatureStats } = {};
   officialServer: Server = null;
   officialSPMultiplier: Server = null;
   valuesJson: any;

   applicationVersion: string = process.env.VERSION;
   devMode: boolean = true;
   dataLoaded: boolean = false;
   dataLoadError: string = null;
   updateAvailable: boolean = false;

   tempCreature: VueCreature = new VueCreature();

   get currentServerName() { return this.tempCreature.serverName; }
   set currentServerName(value) { this.tempCreature.serverName = value; }

   async loadStatImages() {
      // Let the rest of the app start first - these aren't urgent
      await Delay(200);

      // Calcualte the paths for each of the stat images
      for (let i = 0; i < statNames.length; i++) {
         const name = statNames[i];
         Vue.set(this.statImages, i, require('@/assets/' + name.toLowerCase() + '.svg'));
      }
   }
}

const theStore = new Store();

export default theStore;
