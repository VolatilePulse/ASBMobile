import Vue from 'vue';

import { VueCreature } from '@/ark/creature';
import { Server, CreatureStats } from '@/ark/multipliers';
import { statNames } from '@/consts';


class Store {
   statImages: any[] = [];
   speciesNames: string[] = [];
   speciesMultipliers: { [species: string]: CreatureStats } = {};
   officialServer: Server;
   officialSPMultiplier: Server;
   valuesJson: any;

   devMode: boolean = true;
   dataLoaded: boolean = false;
   dataLoadError: string;

   tempCreature: VueCreature = new VueCreature();

   get currentServerName() { return this.tempCreature.serverName; }
   set currentServerName(value) { this.tempCreature.serverName = value; }

   async loadStatImages() {
      // Calcualte the paths for each of the stat images
      for (let i = 0; i < statNames.length; i++) {
         const name = statNames[i];
         // @ts-ignore
         import('@/assets/' + name.toLowerCase() + '.svg').then(url => Vue.set(this.statImages, i, url));
      }
   }
}

const theStore = new Store();

export default theStore;
